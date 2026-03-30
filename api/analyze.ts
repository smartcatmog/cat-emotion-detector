import { createClient } from '@supabase/supabase-js';

export const config = {
  runtime: 'edge',
};

const VALID_EMOTIONS = ['happy', 'calm', 'sleepy', 'curious', 'annoyed', 'anxious'];

const PROMPT = `You are an expert in cat behavior and feline body language. Analyze the cat in this photo.

Return ONLY valid JSON in this exact format:
{
  "emotion": "one word emotion",
  "emotion_label": "happy" | "calm" | "sleepy" | "curious" | "annoyed" | "anxious",
  "confidence": 85,
  "body_language": "body language description",
  "health_note": "health observation",
  "advice": "owner advice",
  "summary": "one sentence summary",
  "description": "brief description of the cat's emotional state"
}

IMPORTANT: emotion_label MUST be exactly one of: happy, calm, sleepy, curious, annoyed, anxious`;

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'API key not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const body = await req.json();
    const { image, mediaType, pet_name, social_link, save_to_gallery } = body as {
      image: string;
      mediaType: string;
      pet_name?: string;
      social_link?: string;
      save_to_gallery?: boolean;
    };

    if (!image) {
      return new Response(JSON.stringify({ error: 'No image provided' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Call Claude API
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1024,
        messages: [{
          role: 'user',
          content: [
            {
              type: 'image',
              source: { type: 'base64', media_type: mediaType || 'image/jpeg', data: image },
            },
            { type: 'text', text: PROMPT },
          ],
        }],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      return new Response(JSON.stringify({ error: err }), {
        status: response.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json() as { content: Array<{ type: string; text: string }> };
    const text = data.content[0]?.text || '';
    const jsonMatch = text.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      return new Response(JSON.stringify({ error: 'Could not parse response' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const result = JSON.parse(jsonMatch[0]);

    // Normalize emotion_label
    let emotionLabel = (result.emotion_label || result.emotion || 'calm').toLowerCase();
    if (!VALID_EMOTIONS.includes(emotionLabel)) {
      emotionLabel = 'calm';
    }
    result.emotion_label = emotionLabel;

    // Save to cat_images gallery if requested
    if (save_to_gallery && supabaseUrl && supabaseKey) {
      try {
        const supabase = createClient(supabaseUrl, supabaseKey);

        // Upload image to Supabase Storage
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}.jpg`;
        const imageBuffer = Uint8Array.from(atob(image), c => c.charCodeAt(0));

        const { error: uploadError } = await supabase.storage
          .from('cat-images')
          .upload(fileName, imageBuffer, {
            contentType: mediaType || 'image/jpeg',
            cacheControl: '3600',
          });

        if (!uploadError) {
          const { data: urlData } = supabase.storage.from('cat-images').getPublicUrl(fileName);
          const imageUrl = urlData?.publicUrl;

          if (imageUrl) {
            await supabase.from('cat_images').insert({
              image_url: imageUrl,
              emotion_label: emotionLabel,
              confidence: Math.min(100, Math.max(0, result.confidence || 75)),
              description: result.description || result.summary || '',
              pet_name: pet_name?.trim() || null,
              social_link: social_link?.trim() || null,
            });
          }
        }
      } catch (saveErr) {
        console.error('Failed to save to gallery:', saveErr);
        // Don't fail the whole request if gallery save fails
      }
    }

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Analysis failed';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
