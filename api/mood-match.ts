import { createClient } from '@supabase/supabase-js';

export const config = {
  runtime: 'edge',
};

const VALID_EMOTIONS = ['happy', 'calm', 'sleepy', 'curious', 'annoyed', 'anxious', 'resigned', 'dramatic', 'sassy', 'clingy', 'zoomies', 'suspicious', 'smug', 'confused', 'hangry', 'sad', 'angry', 'scared', 'disgusted', 'surprised', 'loved', 'bored', 'ashamed', 'tired', 'disappointed', 'melancholy'];

const MOOD_PROMPT = (moodText: string) => `The user described their mood: "${moodText}"

This text may be in any language (English, Chinese, etc). Understand the semantic meaning deeply and map it to ONE of these 26 cat emotion labels:

- happy = joyful, excited, content, 开心, 高兴, 兴奋, 满足
- calm = relaxed, peaceful, chill, 平静, 放松, 岁月静好
- sleepy = physically drowsy, need sleep, 困, 想睡觉
- curious = interested, wondering, intrigued, 好奇, 感兴趣, 想知道
- annoyed = mildly irritated, frustrated, fed up, 烦, 不爽, 讨厌
- anxious = worried, nervous, on edge, 焦虑, 担心, 紧张
- resigned = helpless, giving up, whatever, 无奈, 无所谓, 随他去, 算了
- dramatic = overwhelmed, can't even, dying inside, 崩溃, 受不了, 太难了, 当场去世
- sassy = judging everyone, above it all, attitude, 傲娇, 高冷, 不屑
- clingy = lonely, need a hug, miss someone, 黏人, 需要陪伴
- zoomies = hyper, bursting with energy, can't sit still, 亢奋, 精力充沛, 停不下来
- suspicious = something's off, don't trust it, 怀疑, 警惕, 感觉不对劲
- smug = proud, nailed it, feeling superior, 得意, 自信, 我最棒
- confused = lost, makes no sense, brain error, 懵, 不懂, 搞不清楚, 迷茫
- hangry = starving, need food NOW, 饿, 饿死了, 要吃东西
- sad = heartbroken, grieving, tearful, 伤心, 难过, 心碎, 悲伤, 哭泣, 痛苦
- angry = furious, rage, very mad, 生气, 愤怒, 火大, 暴怒, 气死了
- scared = frightened, terrified, fearful, 害怕, 恐惧, 吓到了, 不敢
- disgusted = revolted, repulsed, gross, 恶心, 厌恶, 反感, 想吐
- surprised = shocked, astonished, didn't see that coming, 惊讶, 震惊, 没想到, 吓一跳
- loved = warm, cherished, grateful, affectionate, 温暖, 被爱, 幸福, 感激, 爱
- bored = uninterested, nothing to do, dull, 无聊, 没意思, 提不起劲, 百无聊赖
- ashamed = embarrassed, guilty, regretful, 羞愧, 尴尬, 后悔, 丢脸, 惭愧
- tired = exhausted, burnt out, mentally drained, 累了, 心累, 好累, 撑不住, 精疲力竭, 活着好累, burnout
- disappointed = let down, hopes crushed, 失落, 失望, 期待落空, 心凉了
- melancholy = wistful, vaguely sad, pensive, 惆怅, 忧郁, 莫名难过, 心里空空的, 感伤

Return ONLY valid JSON:
{
  "emotion_label": "one of the 26 labels above",
  "reasoning": "brief explanation in the same language as the user's input"
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
    if (!VALID_EMOTIONS.includes(emotionLabel)) emotionLabel = 'calm';

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

    const allCats = cats || [];
    const selectionMode = allCats.length >= 5;
    const maxItems = selectionMode ? 6 : 3;
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
