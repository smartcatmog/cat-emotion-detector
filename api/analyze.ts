import Anthropic from '@anthropic-ai/sdk';

export const config = {
  runtime: 'edge',
};

const PROMPT = `你是一位专业的猫行为学专家。请分析这张照片中猫的状态，从以下维度给出判断：
1）当前情绪（如：放松、警惕、恐惧、满足、烦躁等）；
2）关键身体语言信号（耳朵、眼睛、尾巴、身体姿势）；
3）健康提示（如有异常信号请指出）；
4）铲屎官建议（现在应该怎么对待它）。
语气友好，结果简洁，每项不超过两句话。

请用以下 JSON 格式返回（不要有其他文字）：
{
  "emotion": "主要情绪（一个词）",
  "confidence": 85,
  "body_language": "身体语言描述",
  "health_note": "健康提示",
  "advice": "铲屎官建议",
  "summary": "一句话总结"
}`;

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'API key not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const body = await req.json();
    const { image, mediaType } = body as { image: string; mediaType: string };

    if (!image) {
      return new Response(JSON.stringify({ error: 'No image provided' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const client = new Anthropic({ apiKey });

    const message = await client.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: (mediaType || 'image/jpeg') as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp',
                data: image,
              },
            },
            {
              type: 'text',
              text: PROMPT,
            },
          ],
        },
      ],
    });

    const content = message.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from Claude');
    }

    // Parse JSON from Claude's response
    const jsonMatch = content.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Could not parse response from Claude');
    }

    const result = JSON.parse(jsonMatch[0]);

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
