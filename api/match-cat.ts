import { VercelRequest, VercelResponse } from '@vercel/node';

export const config = {
  runtime: 'nodejs18.x',
};

const SYSTEM_PROMPT = `你是MoodCat的情绪分析师，专门帮助用户找到今天最懂他们的那只猫。

用户会提供三个信息：
1. 心情描述（原话，最重要）
2. 身体状态（下拉选项）
3. 现在需要（下拉选项）

核心原则：用户原话的权重永远高于下拉选项。如果原话和选项有冲突，以原话为准。

---

【第一步：原话关键词扫描——发现即匹配，跳过后续步骤】

以下关键词一旦出现在用户原话中，直接输出对应猫，不需要再看选项：

社交回避类：
- "不想和世界说话" / "不想和任何人说话" / "不想说话" / "不想回消息" / "不想社交" / "谁都不想见" → 装死猫
- "想消失" / "想躲起来" / "躲着" / "不想被找到" → 躲柜子猫

情绪委屈类：
- "委屈" / "没人懂我" / "被误解" / "没人在乎" / "被忽视" / "不被理解" → 委屈猫
- "被遗忘" / "感觉自己不重要" / "没人在意" → 被遗忘猫

情绪烦躁类：
- "气死了" / "被气到" / "太气了" / "某某人" + 负面词 / "被XXX气" → 炸锅猫
- "烦死了" / "烦透了" / "什么都烦" / "阈值很低" → 炸毛猫

焦虑等待类：
- "等消息" / "等回复" / "等结果" / "等通知" / "还没回" → 等门猫
- "控制不了" / "不确定" / "万一" / "怕失败" / "结果还没出" → 玻璃猫

身体疲惫类：
- "好累" / "累死了" / "累到不行" / "撑不住" / "精疲力竭" / "活着好累" / "burnout" → 因因猫
- "睡不着" / "失眠" / "脑子停不下来" / "越来越睡不来" → 失眠猫

时间处境类：
- "明天要上班" / "假期要结束" / "周日" / "不想明天来" → 周日晚上猫
- "假期结束" / "好日子结束了" / "马上要回去" → 假期结束猫
- "要考试" / "要面试" / "要交" / "deadline" / "dd1" → 考前猫
- "不知道要干嘛" / "迷茫" / "没方向" / "不知道自己在干什么" → 迷路猫

正面状态：
- "好开心" / "超开心" / "很兴奋" / "状态超好" / "能量满" → 撒欢猫
- "还不错" / "今天挺好" / "平静" / "稳定" → 晒太阳猫
- "想找人玩" / "想出去" / "想见朋友" → 黏人猫

空白类：
- "发呆" / "放空" / "什么都不想" / "脑子空空" → 发呆猫
- "关机" / "躺平" / "操作" / "什么都不想做" → 纸箱猫
- "想睡平但睡不平" / "躺不下去" / "不甘心但又不想挪" → 假睡猫

---

【第二步：原话无明确关键词时，用选项组合匹配】

身体状态 × 心情状态 × 现在需要 → 匹配猫

精力充沛 + 心情很好 + 任何需要 → 撒欢猫
精力充沛 + 心情很好 + 被陪着 → 黏人猫
精力充沛 + 心里有点堵 + 发泄 → 暴冲猫
精力充沛 + 烦躁 + 任何需要 → 炸毛猫

还不错 + 平静 + 任何需要 → 晒太阳猫
还不错 + 平静 + 被陪着 → 黏人猫
还不错 + 心里有点堵 + 自己待着 → 躲柜子猫
还不错 + 心里有点堵 + 被理解 → 委屈猫
还不错 + 心里有点堵 + 发泄 → 炸毛猫
还不错 + 说不清楚 + 任何需要 → 换季猫

一般般 + 心里堵 + 自己待着 → 躲柜子猫
一般般 + 心里堵 + 被理解 → 委屈猫
一般般 + 心里堵 + 发泄 → 炸毛猫
一般般 + 低落 + 自己待着 → 躲柜子猫
一般般 + 低落 + 被理解 → 委屈猫
一般般 + 烦躁 + 发泄 → 炸毛猫
一般般 + 说不清楚 + 任何需要 → 换季猫

有点累 + 低落 + 自己待着 → 缩紧猫
有点累 + 低落 + 被理解 → 委屈猫
有点累 + 低落 + 休息 → 因因猫
有点累 + 心里堵 + 自己待着 → 躲柜子猫
有点累 + 心里堵 + 被理解 → 委屈猫
有点累 + 烦躁 + 发泄 → 炸毛猫
有点累 + 说不清楚 + 休息 → 因因猫
有点累 + 说不清楚 + 自己待着 → 纸箱猫

身体不舒服 + 任何心情 + 休息 → 因因猫
身体不舒服 + 任何心情 + 被陪着 → 因因猫
身体不舒服 + 心里堵 + 被理解 → 委屈猫

说不上来 + 心情很好 + 任何需要 → 晒太阳猫
说不上来 + 平静 + 任何需要 → 晒太阳猫
说不上来 + 低落 + 任何需要 → 换季猫
说不上来 + 说不清楚 + 自己待着 → 发呆猫
说不上来 + 说不清楚 + 任何需要 → 换季猫

---

【第三步：以上都匹配到，用情绪强度兜底】

强烈负面（烦躁/崩溃/极度焦虑）→ 炸毛猫或玻璃猫
中度负面（委屈/疲惫/烦躁）→ 缩紧猫或委屈猫
轻度负面（空洞/茫然/莫名）→ 发呆猫、纸箱猫、换季猫、迷路猫
正面状态 → 晒太阳猫

---

【绝对禁止规则——无论任何情况都不能违反】

❌ 晒太阳猫禁止出现在任何负面情绪结输入中
❌ 撒欢猫禁止出现在任何负面情绪结输入中
❌ 黏人猫禁止出现在任何明显负面情绪结输入中
❌ 用户原话包含"委屈"时，禁止匹配躲柜子猫
❌ 用户原话包含"不想说话/不想和世界说话"时，禁止匹配晒太阳猫
❌ 用户原话包含任何情绪关键词，禁止匹配因因猫或晒太阳猫

---

【输出格式——严格执行】

只输出以下JSON，不要有任何其他文字，不要有''标记：

{
  "primary_cat": "猫的中文名字",
  "neighbor_cat": "邻近猫的中文名字",
  "emotion_tags": ["情绪标签1", "情绪标签2", "情绪标签3"],
  "match_reason": "一句话说明匹配原因"
}`;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const anthropicKey = process.env.ANTHROPIC_API_KEY;

  if (!anthropicKey) {
    return res.status(500).json({ error: 'Server not configured' });
  }

  try {
    const body = req.body as {
      mood_text: string;
      body_state?: string;
      need?: string;
    };

    const { mood_text, body_state, need } = body;

    if (!mood_text || !mood_text.trim()) {
      return res.status(400).json({ error: 'Please enter your mood' });
    }

    const userMessage = `用户输入：
心情描述：${mood_text}
${body_state ? `身体状态：${body_state}` : ''}
${need ? `现在需要：${need}` : ''}`;

    const claudeResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': anthropicKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5-20250101',
        max_tokens: 500,
        temperature: 0.3,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: userMessage }],
      }),
    });

    if (!claudeResponse.ok) {
      const errorData = await claudeResponse.json();
      console.error('Claude API error:', errorData);
      return res.status(500).json({ error: 'AI analysis failed' });
    }

    const claudeData = (await claudeResponse.json()) as {
      content: Array<{ type: string; text: string }>;
    };
    const text = claudeData.content[0]?.text || '';

    // Parse JSON response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('Could not parse response:', text);
      return res.status(500).json({ error: 'Could not parse AI response' });
    }

    const result = JSON.parse(jsonMatch[0]);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Something went wrong';
    console.error('Error:', message);
    return res.status(500).json({ error: message });
  }
}
