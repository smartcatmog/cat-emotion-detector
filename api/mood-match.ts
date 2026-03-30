import { createClient } from '@supabase/supabase-js';

export const config = {
  runtime: 'edge',
};

const VALID_EMOTIONS = ['happy', 'calm', 'sleepy', 'curious', 'annoyed', 'anxious', 'resigned', 'dramatic', 'sassy', 'clingy', 'zoomies', 'suspicious', 'smug', 'confused', 'hangry'];

const MOOD_PROMPT = (moodText: string) => `The user described their mood: "${moodText}"

Analyze this text and map it to ONE of these cat emotion labels:
happy, calm, sleepy, curious, annoyed, anxious, resigned, dramatic, sassy, clingy, zoomies, suspicious, smug, confused, hangry

Label meanings:
- happy = joyful, excited, content
- calm = relaxed, peaceful, chill
- sleepy = tired, exhausted, need rest
- curious = interested, wondering, intrigued
- annoyed = irritated, frustrated, fed up
- anxious = worried, nervous, scared
- resigned = helpless, giving up, whatever
- dramatic = dying inside, overwhelmed, can't even
- sassy = judging everyone, above it all, attitude
- clingy = lonely, need a hug, miss someone
- zoomies = hyper, can't sit still, bursting with energy
- suspicious = something's off, don't trust it
- smug = proud, nailed it, feeling superior
- confused = lost, makes no sense, brain error
- hangry = starving, need food NOW

Return ONLY valid JSON:
{
  "emotion_label": "one of the 6 labels above",
  "reasoning": "brief explanation of why this mood maps to this cat emotion"
}`;

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

  if (!anthropicKey || !supabaseUrl || !supabaseKey) {
    return new Response(JSON.stringify({ error: 'Server not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const body = await req.json();
    const { mood_text } = body as { mood_text: string };

    if (!mood_text || !mood_text.trim()) {
      return new Response(JSON.stringify({ error: 'Please enter your mood' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Step 1: Ask Claude to analyze the mood
    const claudeResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': anthropicKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 256,
        messages: [{ role: 'user', content: MOOD_PROMPT(mood_text.trim()) }],
      }),
    });

    if (!claudeResponse.ok) {
      return new Response(JSON.stringify({ error: 'AI analysis failed, please try again' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const claudeData = await claudeResponse.json() as { content: Array<{ type: string; text: string }> };
    const text = claudeData.content[0]?.text || '';
    const jsonMatch = text.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      return new Response(JSON.stringify({ error: 'Could not parse AI response' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const moodResult = JSON.parse(jsonMatch[0]);
    let emotionLabel = moodResult.emotion_label?.toLowerCase();

    if (!VALID_EMOTIONS.includes(emotionLabel)) {
      emotionLabel = 'calm'; // fallback
    }

    // Step 2: Query matching cat images from Supabase
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data: cats, error: dbError } = await supabase
      .from('cat_images')
      .select('*')
      .eq('emotion_label', emotionLabel);

    if (dbError) {
      return new Response(JSON.stringify({ error: 'Database query failed' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Step 3: Select random cats
    const allCats = cats || [];
    const selectionMode = allCats.length >= 5;
    const maxItems = selectionMode ? 6 : 3;

    // Shuffle and pick
    const shuffled = allCats.sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, maxItems);

    return new Response(JSON.stringify({
      success: true,
      data: {
        emotion_label: emotionLabel,
        reasoning: moodResult.reasoning || '',
        cats: selected,
        selection_mode: selectionMode,
      },
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Something went wrong';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
