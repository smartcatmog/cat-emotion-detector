import { createClient } from '@supabase/supabase-js';

export const config = {
  runtime: 'edge',
};

const VALID_EMOTIONS = ['happy', 'calm', 'sleepy', 'curious', 'annoyed', 'anxious', 'resigned', 'dramatic', 'sassy', 'clingy', 'zoomies', 'suspicious', 'smug', 'confused', 'hangry', 'sad', 'angry', 'scared', 'disgusted', 'surprised', 'loved', 'bored', 'ashamed', 'tired', 'disappointed', 'melancholy'];

const PROMPT = `You are an expert in cat behavior and feline body language. Analyze the cat in this photo.

CRITICAL: The "emotion" field MUST be exactly one of these 26 values:
- happy (pure joy, excited, content)
- calm (zero stress, relaxed, peaceful)
- sleepy (physically drowsy, need a nap)
- curious (what's that? alert, interested)
- annoyed (mildly irritated, grumpy, don't touch me)
- anxious (nervous, on edge, stressed)
- resigned (whatever... helpless, giving up)
- dramatic (I'm literally dying, over-the-top)
- sassy (talk to the paw, judging you)
- clingy (don't leave me, needy, wants attention)
- zoomies (MAXIMUM ENERGY, hyper, wild)
- suspicious (I'm watching you, distrustful, side-eye)
- smug (I own this place, proud, self-satisfied)
- confused (does not compute, bewildered, lost)
- hangry (feed me NOW, hungry + angry)
- sad (heartbroken, grieving, tearful, dejected)
- angry (furious, rage, very mad)
- scared (frightened, terrified, fearful)
- disgusted (revolted, repulsed)
- surprised (shocked, astonished)
- loved (warm, cherished, affectionate)
- bored (uninterested, dull, nothing to do)
- ashamed (embarrassed, guilty)
- tired (exhausted, burnt out, mentally drained)
- disappointed (let down, hopes crushed)
- melancholy (wistful, vaguely sad, pensive)

Return ONLY valid JSON in this exact format:
{
  "emotion": "exactly one of the 26 labels above",
  "confidence": 85,
  "body_language": "body language description",
  "health_note": "health observation",
  "advice": "owner advice",
  "summary": "one sentence summary",
  "description": "brief description of the cat's emotional state"
}`;

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
        model: 'claude-sonnet-4-6',
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

    // Normalize emotion_label with mapping
    const EMOTION_MAP: Record<string, string> = {
      displeased: 'annoyed', irritated: 'annoyed', angry: 'annoyed', grumpy: 'annoyed', frustrated: 'annoyed', unimpressed: 'annoyed', unamused: 'annoyed', bothered: 'annoyed', sulky: 'annoyed',
      content: 'happy', joyful: 'happy', playful: 'happy', excited: 'happy', cheerful: 'happy',
      relaxed: 'calm', peaceful: 'calm', serene: 'calm', comfortable: 'calm', neutral: 'calm',
      drowsy: 'sleepy', tired: 'sleepy', resting: 'sleepy', dozing: 'sleepy',
      alert: 'curious', attentive: 'curious', interested: 'curious', watchful: 'curious', inquisitive: 'curious',
      nervous: 'anxious', scared: 'anxious', fearful: 'anxious', stressed: 'anxious', worried: 'anxious',
    };
    let rawEmotion = (result.emotion || 'calm').toLowerCase();
    let emotionLabel = VALID_EMOTIONS.includes(rawEmotion) ? rawEmotion : (EMOTION_MAP[rawEmotion] || 'calm');
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
            const { data: insertData } = await supabase.from('cat_images').insert({
              image_url: imageUrl,
              emotion_label: emotionLabel,
              confidence: Math.min(100, Math.max(0, result.confidence || 75)),
              description: result.description || result.summary || '',
              pet_name: pet_name?.trim() || null,
              social_link: social_link?.trim() || null,
            }).select('id').single();
            if (insertData?.id) result.gallery_id = insertData.id;
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
