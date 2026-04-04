import { VercelRequest, VercelResponse } from '@vercel/node';

type CatId = 'sleepy' | 'hiding' | 'spiky' | 'licking' | 'sad' | 'frantic' | 'aloof' | 'sunny' | 'excited' | 'clingy' | 'tense' | 'fragile' | 'fake-sleep' | 'sunday-night' | 'noon' | 'insomnia' | 'season-change' | 'post-holiday' | 'pre-exam' | 'lost' | 'birthday' | 'dead-social' | 'waiting-reply' | 'exploded' | 'forgotten' | 'jealous' | 'people-pleaser' | 'boundary' | 'cold-war' | 'shedding' | 'just-showered' | 'windowsill' | 'solo-training' | 'old-place' | 'first-time' | 'cardboard' | 'daydream';

interface Cat {
  id: CatId;
  name: string;
  emoji: string;
  energy: 'low' | 'medium' | 'high';
  social: 'alone' | 'together' | 'neutral';
  category: 'energy-social' | 'anxiety' | 'trigger-situation' | 'trigger-relationship' | 'trigger-growth' | 'supplement';
  neighbors: CatId[];
}

const CATS: Record<CatId, Cat> = {
  // 能量×社交类
  sleepy: { id: 'sleepy', name: '困困猫', emoji: '😴', energy: 'low', social: 'together', category: 'energy-social', neighbors: ['hiding', 'sunny'] },
  hiding: { id: 'hiding', name: '躲柜子猫', emoji: '🙈', energy: 'low', social: 'alone', category: 'energy-social', neighbors: ['sleepy', 'sad'] },
  spiky: { id: 'spiky', name: '炸毛猫', emoji: '😾', energy: 'high', social: 'alone', category: 'energy-social', neighbors: ['frantic', 'tense'] },
  licking: { id: 'licking', name: '舔毛猫', emoji: '😼', energy: 'medium', social: 'alone', category: 'energy-social', neighbors: ['frantic', 'aloof'] },
  sad: { id: 'sad', name: '委屈猫', emoji: '😿', energy: 'low', social: 'together', category: 'energy-social', neighbors: ['hiding', 'sleepy'] },
  frantic: { id: 'frantic', name: '暴冲猫', emoji: '⚡', energy: 'high', social: 'alone', category: 'energy-social', neighbors: ['spiky', 'licking'] },
  aloof: { id: 'aloof', name: '高冷观察猫', emoji: '😸', energy: 'medium', social: 'alone', category: 'energy-social', neighbors: ['licking', 'windowsill'] },
  sunny: { id: 'sunny', name: '晒太阳猫', emoji: '😻', energy: 'medium', social: 'together', category: 'energy-social', neighbors: ['sleepy', 'excited'] },
  excited: { id: 'excited', name: '撒欢猫', emoji: '🎉', energy: 'high', social: 'together', category: 'energy-social', neighbors: ['sunny', 'clingy'] },
  clingy: { id: 'clingy', name: '黏人猫', emoji: '🥺', energy: 'high', social: 'together', category: 'energy-social', neighbors: ['excited', 'sunny'] },
  
  // 焦虑系
  tense: { id: 'tense', name: '绷紧猫', emoji: '😰', energy: 'high', social: 'alone', category: 'anxiety', neighbors: ['spiky', 'fragile'] },
  fragile: { id: 'fragile', name: '玻璃猫', emoji: '💔', energy: 'medium', social: 'alone', category: 'anxiety', neighbors: ['tense', 'fake-sleep'] },
  'fake-sleep': { id: 'fake-sleep', name: '假睡猫', emoji: '😑', energy: 'low', social: 'alone', category: 'anxiety', neighbors: ['fragile', 'licking'] },
  
  // 处境触发类
  'sunday-night': { id: 'sunday-night', name: '周日晚上猫', emoji: '😔', energy: 'low', social: 'alone', category: 'trigger-situation', neighbors: ['noon', 'pre-exam'] },
  noon: { id: 'noon', name: '中午猫', emoji: '🌫️', energy: 'low', social: 'neutral', category: 'trigger-situation', neighbors: ['sunday-night', 'insomnia'] },
  insomnia: { id: 'insomnia', name: '失眠猫', emoji: '🌙', energy: 'medium', social: 'alone', category: 'trigger-situation', neighbors: ['noon', 'season-change'] },
  'season-change': { id: 'season-change', name: '换季猫', emoji: '🍂', energy: 'low', social: 'neutral', category: 'trigger-situation', neighbors: ['insomnia', 'post-holiday'] },
  'post-holiday': { id: 'post-holiday', name: '假期结束猫', emoji: '😞', energy: 'low', social: 'together', category: 'trigger-situation', neighbors: ['season-change', 'sunday-night'] },
  'pre-exam': { id: 'pre-exam', name: '考前猫', emoji: '😟', energy: 'medium', social: 'alone', category: 'trigger-situation', neighbors: ['sunday-night', 'lost'] },
  lost: { id: 'lost', name: '迷路猫', emoji: '🤔', energy: 'low', social: 'neutral', category: 'trigger-situation', neighbors: ['pre-exam', 'birthday'] },
  birthday: { id: 'birthday', name: '生日猫', emoji: '🎂', energy: 'medium', social: 'together', category: 'trigger-situation', neighbors: ['lost', 'post-holiday'] },
  
  // 关系触发类
  'dead-social': { id: 'dead-social', name: '装死猫', emoji: '🔇', energy: 'low', social: 'alone', category: 'trigger-relationship', neighbors: ['waiting-reply', 'forgotten'] },
  'waiting-reply': { id: 'waiting-reply', name: '等门猫', emoji: '⏳', energy: 'medium', social: 'neutral', category: 'trigger-relationship', neighbors: ['dead-social', 'exploded'] },
  exploded: { id: 'exploded', name: '炸锅猫', emoji: '💢', energy: 'high', social: 'alone', category: 'trigger-relationship', neighbors: ['waiting-reply', 'forgotten'] },
  forgotten: { id: 'forgotten', name: '被遗忘猫', emoji: '😢', energy: 'low', social: 'together', category: 'trigger-relationship', neighbors: ['dead-social', 'jealous'] },
  jealous: { id: 'jealous', name: '嫉妒猫', emoji: '😒', energy: 'medium', social: 'alone', category: 'trigger-relationship', neighbors: ['forgotten', 'people-pleaser'] },
  'people-pleaser': { id: 'people-pleaser', name: '讨好猫', emoji: '😅', energy: 'medium', social: 'together', category: 'trigger-relationship', neighbors: ['jealous', 'boundary'] },
  boundary: { id: 'boundary', name: '边界猫', emoji: '🚫', energy: 'medium', social: 'alone', category: 'trigger-relationship', neighbors: ['people-pleaser', 'cold-war'] },
  'cold-war': { id: 'cold-war', name: '冷战猫', emoji: '❄️', energy: 'low', social: 'alone', category: 'trigger-relationship', neighbors: ['boundary', 'dead-social'] },
  
  // 成长触发类
  shedding: { id: 'shedding', name: '脱毛猫', emoji: '🔄', energy: 'medium', social: 'alone', category: 'trigger-growth', neighbors: ['just-showered', 'solo-training'] },
  'just-showered': { id: 'just-showered', name: '刚洗完澡猫', emoji: '🚿', energy: 'low', social: 'neutral', category: 'trigger-growth', neighbors: ['shedding', 'windowsill'] },
  windowsill: { id: 'windowsill', name: '窗台猫', emoji: '🪟', energy: 'low', social: 'alone', category: 'trigger-growth', neighbors: ['just-showered', 'solo-training'] },
  'solo-training': { id: 'solo-training', name: '独自修炼猫', emoji: '🧘', energy: 'medium', social: 'alone', category: 'trigger-growth', neighbors: ['windowsill', 'old-place'] },
  'old-place': { id: 'old-place', name: '老地方猫', emoji: '🏠', energy: 'low', social: 'neutral', category: 'trigger-growth', neighbors: ['solo-training', 'first-time'] },
  'first-time': { id: 'first-time', name: '第一次猫', emoji: '✨', energy: 'high', social: 'neutral', category: 'trigger-growth', neighbors: ['old-place', 'shedding'] },
  
  // 补充类
  cardboard: { id: 'cardboard', name: '纸箱猫', emoji: '📦', energy: 'low', social: 'alone', category: 'supplement', neighbors: ['daydream', 'just-showered'] },
  daydream: { id: 'daydream', name: '发呆猫', emoji: '💭', energy: 'low', social: 'neutral', category: 'supplement', neighbors: ['cardboard', 'noon'] },
};

function classifyEmotion(text: string, bodyState: string, need: string): { category: string; keywords: CatId[] } {
  const lower = text.toLowerCase();
  const keywords: CatId[] = [];

  // Priority 1: 具体场景词（最高优先级）
  if (lower.includes('明天') || lower.includes('周一') || lower.includes('上班')) {
    keywords.push('sunday-night');
  }
  if (lower.includes('睡不着') || lower.includes('失眠')) {
    keywords.push('insomnia');
  }
  if (lower.includes('等') && lower.includes('回复')) {
    keywords.push('waiting-reply');
  }
  if (lower.includes('中午') || lower.includes('下午两点')) {
    keywords.push('noon');
  }
  if (lower.includes('换季') || lower.includes('季节')) {
    keywords.push('season-change');
  }
  if (lower.includes('假期结束') || lower.includes('收假')) {
    keywords.push('post-holiday');
  }
  if (lower.includes('考试') || lower.includes('考前')) {
    keywords.push('pre-exam');
  }
  if (lower.includes('迷路') || lower.includes('不知道')) {
    keywords.push('lost');
  }
  if (lower.includes('生日')) {
    keywords.push('birthday');
  }

  // Priority 2: 关系触发
  if (lower.includes('被骂') || lower.includes('吵架') || lower.includes('冲突')) {
    keywords.push('exploded');
  }
  if (lower.includes('被遗忘') || lower.includes('没人') || lower.includes('优先级')) {
    keywords.push('forgotten');
  }
  if (lower.includes('讨好') || lower.includes('说不出来')) {
    keywords.push('people-pleaser');
  }
  if (lower.includes('嫉妒') || lower.includes('比较')) {
    keywords.push('jealous');
  }
  if (lower.includes('冷战') || lower.includes('不说话')) {
    keywords.push('cold-war');
  }
  if (lower.includes('装死') || lower.includes('不回应')) {
    keywords.push('dead-social');
  }
  if (lower.includes('边界') || lower.includes('说不了')) {
    keywords.push('boundary');
  }

  // Priority 3: 焦虑系
  if (lower.includes('焦虑') || lower.includes('停不下') || lower.includes('脑子乱')) {
    keywords.push('tense');
  }
  if (lower.includes('随时可能') || lower.includes('失控') || lower.includes('脆弱')) {
    keywords.push('fragile');
  }
  if (lower.includes('假睡') || lower.includes('装睡')) {
    keywords.push('fake-sleep');
  }

  // Priority 4: 低能量
  if (lower.includes('累') || lower.includes('困') || lower.includes('没电')) {
    keywords.push('sleepy');
  }
  if (lower.includes('躲') || lower.includes('安静') || lower.includes('独处')) {
    keywords.push('hiding');
  }

  // Priority 5: 高能量
  if (lower.includes('烦躁') || lower.includes('炸毛')) {
    keywords.push('spiky');
  }
  if (lower.includes('停不下') || lower.includes('暴冲')) {
    keywords.push('frantic');
  }
  if (lower.includes('撒欢') || lower.includes('兴奋')) {
    keywords.push('excited');
  }
  if (lower.includes('黏人') || lower.includes('粘人')) {
    keywords.push('clingy');
  }

  // Priority 6: 成长触发
  if (lower.includes('变化') || lower.includes('脱毛')) {
    keywords.push('shedding');
  }
  if (lower.includes('洗澡')) {
    keywords.push('just-showered');
  }
  if (lower.includes('窗台') || lower.includes('看风景')) {
    keywords.push('windowsill');
  }
  if (lower.includes('修炼') || lower.includes('独处')) {
    keywords.push('solo-training');
  }
  if (lower.includes('老地方') || lower.includes('回到')) {
    keywords.push('old-place');
  }
  if (lower.includes('第一次') || lower.includes('没做过')) {
    keywords.push('first-time');
  }

  // Priority 7: 补充类
  if (lower.includes('纸箱') || lower.includes('躲')) {
    keywords.push('cardboard');
  }
  if (lower.includes('发呆') || lower.includes('放空')) {
    keywords.push('daydream');
  }

  return { category: 'mixed', keywords };
}

function matchCat(text: string, bodyState: string, need: string): CatId {
  const { keywords } = classifyEmotion(text, bodyState, need);
  
  // 如果有具体场景词，直接返回第一个
  if (keywords.length > 0) {
    return keywords[0];
  }

  // 否则根据身体状态和需求匹配
  if (bodyState === '身体不舒服') {
    return 'sleepy';
  }
  if (need === '自己待着') {
    return 'hiding';
  }
  if (need === '被陪着') {
    return 'sleepy';
  }
  if (need === '发泄') {
    return 'spiky';
  }
  if (need === '被理解') {
    return 'sad';
  }

  return 'sunny';
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { mood_text, body_state, need } = req.body;

    if (!mood_text || typeof mood_text !== 'string') {
      return res.status(400).json({ error: 'mood_text is required' });
    }

    // Match primary cat
    const primaryCatId = matchCat(mood_text, body_state || '', need || '');
    const primaryCat = CATS[primaryCatId];

    // Get neighbor cat
    const neighborCatId = primaryCat.neighbors[0] || 'sunny';
    const neighborCat = CATS[neighborCatId];

    // Get random cat photo
    const catPhoto = await getRandomCatPhoto(primaryCatId);

    // Generate response content
    const explanation = generateExplanation(primaryCat, mood_text);
    const suggestion = generateSuggestion(primaryCat);
    const notSuitable = generateNotSuitable(primaryCat);
    const recoveryMethods = generateRecoveryMethods(primaryCat);

    return res.status(200).json({
      success: true,
      data: {
        catId: primaryCatId,
        name: primaryCat.name,
        emoji: primaryCat.emoji,
        explanation,
        suggestion,
        notSuitable,
        recoveryMethods,
        neighbor: neighborCatId,
        neighborName: neighborCat.name,
        catPhoto,
      },
    });
  } catch (error) {
    console.error('Cat signature error:', error);
    return res.status(500).json({ error: 'Failed to generate signature' });
  }
}

function generateExplanation(cat: Cat, userInput: string): string {
  const explanations: Record<CatId, string> = {
    sleepy: `你现在就像${cat.name}，需要好好休息。${userInput}这样的感受，身体在告诉你该停下来了。`,
    hiding: `你现在就像${cat.name}，想要一个安全的地方。${userInput}让你需要独处，这很正常。`,
    spiky: `你现在就像${cat.name}，烦躁的情绪在蔓延。${userInput}这样的感受，让你想要远离一切。`,
    licking: `你现在就像${cat.name}，在焦虑中自我安抚。${userInput}这样的感受，让你想把自己收回来。`,
    sad: `你现在就像${cat.name}，感到被误解和委屈。${userInput}这样的感受，需要被看见和理解。`,
    frantic: `你现在就像${cat.name}，停不下来的状态。${userInput}这样的感受，让你的能量在四处乱窜。`,
    aloof: `你现在就像${cat.name}，在观察和思考。${userInput}这样的感受，让你想要抽离一下。`,
    sunny: `你现在就像${cat.name}，在恢复中。${userInput}这样的感受，说明你在慢慢好转。`,
    excited: `你现在就像${cat.name}，充满了兴奋。${userInput}这样的感受，让你想要分享和表达。`,
    clingy: `你现在就像${cat.name}，需要陪伴和连接。${userInput}这样的感受，让你想要靠近别人。`,
    tense: `你现在就像${cat.name}，紧绷着。${userInput}这样的感受，让你的神经一直在警戒。`,
    fragile: `你现在就像${cat.name}，很容易被刺激。${userInput}这样的感受，让你感到脆弱。`,
    'fake-sleep': `你现在就像${cat.name}，在假装没事。${userInput}这样的感受，让你想要躲起来。`,
    'sunday-night': `你现在就像${cat.name}，周日晚上的焦虑。${userInput}这样的感受，是对新一周的恐惧。`,
    noon: `你现在就像${cat.name}，中午的低谷。${userInput}这样的感受，是身体的自然节奏。`,
    insomnia: `你现在就像${cat.name}，失眠的痛苦。${userInput}这样的感受，让你的夜晚很漫长。`,
    'season-change': `你现在就像${cat.name}，换季的不适应。${userInput}这样的感受，是身体在调整。`,
    'post-holiday': `你现在就像${cat.name}，假期结束的失落。${userInput}这样的感受，是从放松回到现实。`,
    'pre-exam': `你现在就像${cat.name}，考前的紧张。${userInput}这样的感受，是对未知的焦虑。`,
    lost: `你现在就像${cat.name}，迷茫的状态。${userInput}这样的感受，让你不知道该往哪走。`,
    birthday: `你现在就像${cat.name}，生日的复杂情绪。${userInput}这样的感受，是对时间流逝的感受。`,
    'dead-social': `你现在就像${cat.name}，社交的冷淡。${userInput}这样的感受，让你想要装死。`,
    'waiting-reply': `你现在就像${cat.name}，等待的焦虑。${userInput}这样的感受，让你坐立不安。`,
    exploded: `你现在就像${cat.name}，炸锅的状态。${userInput}这样的感受，让你想要爆发。`,
    forgotten: `你现在就像${cat.name}，被遗忘的感受。${userInput}这样的感受，让你感到孤独。`,
    jealous: `你现在就像${cat.name}，嫉妒的情绪。${userInput}这样的感受，让你在比较中受伤。`,
    'people-pleaser': `你现在就像${cat.name}，讨好的模式。${userInput}这样的感受，让你委屈自己。`,
    boundary: `你现在就像${cat.name}，边界的困境。${userInput}这样的感受，让你说不出来。`,
    'cold-war': `你现在就像${cat.name}，冷战的状态。${userInput}这样的感受，让你们都很难受。`,
    shedding: `你现在就像${cat.name}，在蜕变。${userInput}这样的感受，是成长的过程。`,
    'just-showered': `你现在就像${cat.name}，刚洗完澡的脆弱。${userInput}这样的感受，让你需要时间恢复。`,
    windowsill: `你现在就像${cat.name}，在思考和观察。${userInput}这样的感受，让你想要看看外面的世界。`,
    'solo-training': `你现在就像${cat.name}，独自修炼。${userInput}这样的感受，是自我提升的过程。`,
    'old-place': `你现在就像${cat.name}，回到熟悉的地方。${userInput}这样的感受，给你安全感。`,
    'first-time': `你现在就像${cat.name}，第一次的兴奋和紧张。${userInput}这样的感受，是新的开始。`,
    cardboard: `你现在就像${cat.name}，躲在纸箱里。${userInput}这样的感受，让你需要一个小世界。`,
    daydream: `你现在就像${cat.name}，在发呆。${userInput}这样的感受，让你的思绪飘远了。`,
  };
  return explanations[cat.id] || `你现在就像${cat.name}。`;
}

function generateSuggestion(cat: Cat): string {
  const suggestions: Record<CatId, string> = {
    sleepy: '给自己一个小时的休息时间，不要强撑。',
    hiding: '找一个安静的地方，让自己放松。',
    spiky: '做一些能消耗能量的事，比如运动。',
    licking: '深呼吸，告诉自己这只是暂时的。',
    sad: '找一个信任的人倾诉，或者写下来。',
    frantic: '停下来，做一个冥想或者散步。',
    aloof: '给自己一些思考的空间。',
    sunny: '继续保持这个状态，好好享受。',
    excited: '把这份兴奋分享给身边的人。',
    clingy: '和喜欢的人在一起，享受陪伴。',
    tense: '做一些放松的事，比如洗澡。',
    fragile: '温柔对待自己，避免刺激。',
    'fake-sleep': '允许自己休息，不用假装。',
    'sunday-night': '提前为周一做准备，减少焦虑。',
    noon: '吃点东西，补充能量。',
    insomnia: '不要强迫自己睡眠，放松身体。',
    'season-change': '多喝水，调整作息。',
    'post-holiday': '给自己一个缓冲期。',
    'pre-exam': '制定一个学习计划，分散焦虑。',
    lost: '停下来，想想自己真正想要什么。',
    birthday: '反思过去，期待未来。',
    'dead-social': '不用强颜欢笑，休息一下。',
    'waiting-reply': '转移注意力，做点别的。',
    exploded: '先冷静下来，再表达。',
    forgotten: '主动联系你在乎的人。',
    jealous: '提醒自己，每个人的路都不同。',
    'people-pleaser': '这一次，先想想自己的感受。',
    boundary: '练习说"不"，保护自己。',
    'cold-war': '主动打破僵局，表达真实想法。',
    shedding: '接纳变化，这是成长的一部分。',
    'just-showered': '给自己一些恢复的时间。',
    windowsill: '继续观察，你会看到新的可能。',
    'solo-training': '坚持下去，你在变强。',
    'old-place': '在熟悉中找到力量。',
    'first-time': '相信自己，你可以的。',
    cardboard: '在自己的小世界里充电。',
    daydream: '让思绪飘一会儿，这也是休息。',
  };
  return suggestions[cat.id] || '好好照顾自己。';
}

function generateNotSuitable(cat: Cat): string[] {
  const notSuitableMap: Record<CatId, string[]> = {
    sleepy: ['做重要决定', '参加社交活动', '开始新项目'],
    hiding: ['强行社交', '接受邀请', '参加聚会'],
    spiky: ['和人争论', '做精细工作', '需要耐心的事'],
    licking: ['做决定', '承诺新事情', '接受挑战'],
    sad: ['听鸡汤', '被催促', '被评判'],
    frantic: ['需要专注的工作', '做计划', '冥想'],
    aloof: ['强行参与', '被打扰', '做承诺'],
    sunny: ['没有什么不适合的', '尽情享受吧', '这是好时光'],
    excited: ['需要冷静的事', '独处太久', '压抑自己'],
    clingy: ['独处', '被冷落', '被忽视'],
    tense: ['放松的活动', '需要决定的事', '有压力的环境'],
    fragile: ['被批评', '冲突', '刺激'],
    'fake-sleep': ['被强行唤醒', '被打扰', '被质疑'],
    'sunday-night': ['做重要决定', '参加聚会', '开始新事物'],
    noon: ['需要高能量的事', '做决定', '参加会议'],
    insomnia: ['咖啡因', '屏幕', '兴奋的事'],
    'season-change': ['过度运动', '忽视身体信号', '强行适应'],
    'post-holiday': ['立即投入工作', '做大决定', '参加聚会'],
    'pre-exam': ['放松', '分心', '拖延'],
    lost: ['做决定', '被催促', '被指责'],
    birthday: ['被忽视', '被催促', '被评判'],
    'dead-social': ['被强行社交', '被打扰', '被期待'],
    'waiting-reply': ['做其他事', '被打扰', '被催促'],
    exploded: ['和人接触', '做决定', '被劝阻'],
    forgotten: ['独处', '被冷落', '被忽视'],
    jealous: ['比较', '看别人的成就', '被比较'],
    'people-pleaser': ['拒绝', '表达真实想法', '优先自己'],
    boundary: ['被侵犯', '被强行', '被说服'],
    'cold-war': ['继续冷战', '被打扰', '被催促'],
    shedding: ['过度运动', '忽视身体', '强行改变'],
    'just-showered': ['立即活动', '被打扰', '冷风'],
    windowsill: ['被打扰', '被催促', '被强行参与'],
    'solo-training': ['被打扰', '被评判', '被催促'],
    'old-place': ['改变', '被打扰', '被强行离开'],
    'first-time': ['被否定', '被嘲笑', '被催促'],
    cardboard: ['被打扰', '被强行', '被催促'],
    daydream: ['被打扰', '被催促', '需要立即反应'],
  };
  return notSuitableMap[cat.id] || ['做重要决定', '参加社交', '开始新事物'];
}

function generateRecoveryMethods(cat: Cat): string[] {
  const recoveryMap: Record<CatId, string[]> = {
    sleepy: ['睡眠', '休息', '放松'],
    hiding: ['独处', '安静', '阅读'],
    spiky: ['运动', '发泄', '冷静'],
    licking: ['冥想', '深呼吸', '放松'],
    sad: ['倾诉', '陪伴', '理解'],
    frantic: ['停下来', '散步', '冥想'],
    aloof: ['思考', '观察', '等待'],
    sunny: ['享受', '分享', '感恩'],
    excited: ['表达', '分享', '行动'],
    clingy: ['陪伴', '连接', '表达'],
    tense: ['放松', '洗澡', '按摩'],
    fragile: ['温柔', '休息', '陪伴'],
    'fake-sleep': ['休息', '放松', '诚实'],
    'sunday-night': ['计划', '准备', '冥想'],
    noon: ['进食', '休息', '补充'],
    insomnia: ['放松', '呼吸', '接纳'],
    'season-change': ['调整', '补充', '适应'],
    'post-holiday': ['缓冲', '调整', '准备'],
    'pre-exam': ['学习', '计划', '冥想'],
    lost: ['思考', '探索', '倾诉'],
    birthday: ['反思', '庆祝', '期待'],
    'dead-social': ['休息', '放松', '诚实'],
    'waiting-reply': ['转移', '放松', '接纳'],
    exploded: ['冷静', '表达', '倾诉'],
    forgotten: ['主动', '连接', '表达'],
    jealous: ['反思', '感恩', '专注'],
    'people-pleaser': ['自我', '表达', '界限'],
    boundary: ['坚持', '表达', '保护'],
    'cold-war': ['主动', '表达', '倾诉'],
    shedding: ['接纳', '休息', '调整'],
    'just-showered': ['恢复', '休息', '温暖'],
    windowsill: ['观察', '思考', '等待'],
    'solo-training': ['坚持', '反思', '成长'],
    'old-place': ['回归', '安心', '充电'],
    'first-time': ['相信', '尝试', '庆祝'],
    cardboard: ['躲避', '充电', '放松'],
    daydream: ['放空', '休息', '思考'],
  };
  return recoveryMap[cat.id] || ['休息', '放松', '陪伴'];
}

async function getRandomCatPhoto(catId: CatId): Promise<string | null> {
  try {
    const emotionMap: Record<CatId, string[]> = {
      sleepy: ['sleepy', 'calm'],
      hiding: ['suspicious', 'ashamed'],
      spiky: ['angry', 'annoyed'],
      licking: ['calm', 'curious'],
      sad: ['melancholy', 'ashamed'],
      frantic: ['dramatic', 'hangry'],
      aloof: ['suspicious', 'smug'],
      sunny: ['happy', 'loved'],
      excited: ['happy', 'dramatic'],
      clingy: ['clingy', 'happy'],
      tense: ['angry', 'anxious'],
      fragile: ['anxious', 'melancholy'],
      'fake-sleep': ['sleepy', 'calm'],
      'sunday-night': ['melancholy', 'anxious'],
      noon: ['calm', 'sleepy'],
      insomnia: ['anxious', 'dramatic'],
      'season-change': ['melancholy', 'calm'],
      'post-holiday': ['melancholy', 'sleepy'],
      'pre-exam': ['anxious', 'dramatic'],
      lost: ['curious', 'anxious'],
      birthday: ['happy', 'calm'],
      'dead-social': ['sleepy', 'calm'],
      'waiting-reply': ['anxious', 'curious'],
      exploded: ['angry', 'dramatic'],
      forgotten: ['melancholy', 'sleepy'],
      jealous: ['anxious', 'annoyed'],
      'people-pleaser': ['calm', 'clingy'],
      boundary: ['angry', 'suspicious'],
      'cold-war': ['suspicious', 'calm'],
      shedding: ['dramatic', 'anxious'],
      'just-showered': ['calm', 'sleepy'],
      windowsill: ['calm', 'curious'],
      'solo-training': ['calm', 'curious'],
      'old-place': ['calm', 'melancholy'],
      'first-time': ['dramatic', 'curious'],
      cardboard: ['sleepy', 'calm'],
      daydream: ['calm', 'sleepy'],
    };

    const emotions = emotionMap[catId] || ['sleepy', 'calm'];

    for (const emotion of emotions) {
      const response = await fetch(
        `https://gfrbubfyznmkqchwjhtn.supabase.co/rest/v1/cat_images?emotion_label=eq.${emotion}&select=image_url&limit=50`,
        {
          headers: {
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmcmJ1YmZ5em5ta3FjaHdqaHRuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ3NzY0MTIsImV4cCI6MjA5MDM1MjQxMn0.-wUxxmKZWrasN19Gq_6exQAgHwsI5edlMa3OTsE5Hh0',
          },
        }
      );

      if (!response.ok) continue;

      const images = await response.json();
      if (Array.isArray(images) && images.length > 0) {
        const randomIndex = Math.floor(Math.random() * images.length);
        return images[randomIndex].image_url;
      }
    }

    return null;
  } catch (error) {
    return null;
  }
}
