import { VercelRequest, VercelResponse } from '@vercel/node';

// 5 emotion categories
type EmotionCategory = 'low_energy' | 'anxiety' | 'hurt' | 'physical' | 'mixed';

// 8 cat personalities
type CatId = 'sleepy' | 'hiding' | 'spiky' | 'licking' | 'sad' | 'frantic' | 'aloof' | 'sunny';

// Supabase emotion labels for real cat photos
type SupabaseEmotion = 'sleepy' | 'calm' | 'suspicious' | 'angry' | 'annoyed' | 'melancholy' | 'ashamed' | 'dramatic' | 'hangry' | 'happy' | 'loved' | 'curious' | 'smug';

interface CatPersonality {
  id: CatId;
  name: string;
  emoji: string;
  energy: 'low' | 'high' | 'medium';
  social: 'alone' | 'together' | 'medium';
  supabaseEmotions: SupabaseEmotion[];
}

const CATS: Record<CatId, CatPersonality> = {
  sleepy: { id: 'sleepy', name: '困困猫', emoji: '😴', energy: 'low', social: 'together', supabaseEmotions: ['sleepy', 'calm'] },
  hiding: { id: 'hiding', name: '躲柜子猫', emoji: '🙈', energy: 'low', social: 'alone', supabaseEmotions: ['suspicious', 'ashamed'] },
  spiky: { id: 'spiky', name: '炸毛猫', emoji: '😾', energy: 'high', social: 'alone', supabaseEmotions: ['angry', 'annoyed'] },
  licking: { id: 'licking', name: '舔毛猫', emoji: '😼', energy: 'medium', social: 'alone', supabaseEmotions: ['calm', 'curious'] },
  sad: { id: 'sad', name: '委屈猫', emoji: '😿', energy: 'low', social: 'together', supabaseEmotions: ['melancholy', 'ashamed'] },
  frantic: { id: 'frantic', name: '暴冲猫', emoji: '🐱', energy: 'high', social: 'alone', supabaseEmotions: ['dramatic', 'hangry'] },
  aloof: { id: 'aloof', name: '高冷观察猫', emoji: '😸', energy: 'medium', social: 'alone', supabaseEmotions: ['suspicious', 'smug'] },
  sunny: { id: 'sunny', name: '晒太阳猫', emoji: '😻', energy: 'medium', social: 'together', supabaseEmotions: ['happy', 'loved'] },
};

// Neighbor cats for "换一种理解方式"
const NEIGHBORS: Record<CatId, CatId> = {
  sleepy: 'hiding',
  hiding: 'sleepy',
  spiky: 'frantic',
  licking: 'frantic',
  sad: 'hiding',
  frantic: 'spiky',
  aloof: 'hiding',
  sunny: 'sleepy',
};

// Helper to get random cat photo from Supabase
async function getRandomCatPhoto(catId: CatId): Promise<string | null> {
  try {
    const cat = CATS[catId];
    const emotions = cat.supabaseEmotions.map(e => `"${e}"`).join(',');
    
    const response = await fetch(
      `https://gfrbubfyznmkqchwjhtn.supabase.co/rest/v1/cat_images?emotion_label=in.(${emotions})&select=image_url&limit=100`,
      {
        headers: {
          'apikey': process.env.SUPABASE_ANON_KEY || '',
        },
      }
    );

    if (!response.ok) return null;
    
    const images = await response.json();
    if (!Array.isArray(images) || images.length === 0) return null;
    
    const randomIndex = Math.floor(Math.random() * images.length);
    return images[randomIndex].image_url;
  } catch (error) {
    console.error('Error fetching cat photo:', error);
    return null;
  }
}

// Keywords for emotion classification
const KEYWORDS: Record<EmotionCategory, string[]> = {
  low_energy: ['累', '困', '没力', '疲惫', '没电', '提不起劲', '懒'],
  anxiety: ['慌', '急', '停不下', '乱', '烦躁', '焦虑'],
  hurt: ['委屈', '被骂', '失望', '没人懂', '伤心', '难受'],
  physical: ['疼', '痛', '难受', '睡不着', '胃疼', '头疼', '不舒服'],
  mixed: ['说不上', '空', '烦', '麻', '乱七八糟'],
};

function classifyEmotion(text: string): EmotionCategory {
  const lower = text.toLowerCase();

  // Check physical first (highest priority)
  if (KEYWORDS.physical.some(k => lower.includes(k))) {
    return 'physical';
  }

  // Check hurt
  if (KEYWORDS.hurt.some(k => lower.includes(k))) {
    return 'hurt';
  }

  // Check anxiety
  if (KEYWORDS.anxiety.some(k => lower.includes(k))) {
    return 'anxiety';
  }

  // Check low energy
  if (KEYWORDS.low_energy.some(k => lower.includes(k))) {
    return 'low_energy';
  }

  // Default to mixed
  return 'mixed';
}

function mapCat(category: EmotionCategory, bodyState: string, need: string): CatId {
  // Priority-based mapping rules
  
  // 1. Physical discomfort → sleepy
  if (category === 'physical') {
    return 'sleepy';
  }

  // 2. Hurt/betrayed → sad
  if (category === 'hurt') {
    return 'sad';
  }

  // 3. Anxiety → licking or frantic
  if (category === 'anxiety') {
    return bodyState === '身体不舒服' ? 'licking' : 'frantic';
  }

  // 4. Want to hide → hiding
  if (need === '自己待着') {
    return 'hiding';
  }

  // 5. Low energy → sleepy or hiding
  if (category === 'low_energy') {
    return need === '被陪着' ? 'sleepy' : 'hiding';
  }

  // Default
  return 'sleepy';
}

function generateExplanation(cat: CatId, category: EmotionCategory, userInput: string): string {
  const explanations: Record<CatId, Record<EmotionCategory, string>> = {
    sleepy: {
      low_energy: '今天更像能量见底，不是你不行',
      anxiety: '焦虑堆积到一定程度，身体就会自动进入"休眠模式"',
      hurt: '失望积累了，你需要休息来恢复',
      physical: '你现在的不舒服，不只是心情问题，身体也在出声了',
      mixed: '你现在既累又有压力，身体和心都在喊停',
    },
    hiding: {
      low_energy: '你不是不想面对，只是今天的能量不够支撑你继续装没事',
      anxiety: '压力太大的时候，躲起来是一种自我保护',
      hurt: '你想躲起来，是因为被伤到了',
      physical: '身体的不适让你更想躲起来，这很正常',
      mixed: '身体不适加压力，双重夹击下，你想躲是合理的',
    },
    spiky: {
      low_energy: '你不是坏脾气，只是能量不足让你更容易被激怒',
      anxiety: '你不是坏脾气，只是今天的神经系统超载了',
      hurt: '被伤到的时候，任何小事都能引爆',
      physical: '身体的不适让你更容易被激怒',
      mixed: '身体难受加压力大，你现在就像一根绷紧的弦',
    },
    licking: {
      low_energy: '你在试图把自己收回来，这是一种自我保护',
      anxiety: '你在试图把自己收回来，但焦虑还在',
      hurt: '你在试图把自己收回来，但心里还在疼',
      physical: '身体的信号让你更需要冷静地思考',
      mixed: '你现在需要冷静，把自己收回来',
    },
    sad: {
      low_energy: '你不是太敏感，只是今天的失望积累了',
      anxiety: '被压力和失望双重打击，你现在很委屈',
      hurt: '你在等一个道歉、一个解释、一个确认',
      physical: '身体的不适让你更容易感到失落',
      mixed: '身体难受加心里失落，你现在特别需要被看见',
    },
    frantic: {
      low_energy: '你不是坏，只是能量太多了，无处释放',
      anxiety: '你不是坏，只是今天的能量太多了，无处释放',
      hurt: '被失望打击的时候，你停不下来',
      physical: '身体的不适让你更加焦躁',
      mixed: '身体难受加心里急，你现在就像一个高速运转的马达',
    },
    aloof: {
      low_energy: '你不是冷漠，只是今天需要用理性来保护自己',
      anxiety: '你在用理性来应对压力',
      hurt: '你在抽离，用理性来保护自己',
      physical: '身体的信号让你更需要冷静',
      mixed: '你现在需要冷静，保持清醒',
    },
    sunny: {
      low_energy: '你真的好了，不是假装，不是压抑',
      anxiety: '压力还在，但你已经有力气去面对了',
      hurt: '你在恢复，心情也在回升',
      physical: '身体恢复了，心情也跟着晴朗了',
      mixed: '身体和心都在恢复',
    },
  };

  return explanations[cat]?.[category] || '你的感受是真实的';
}

function generateSuggestion(cat: CatId, category: EmotionCategory): string {
  const suggestions: Record<CatId, Record<EmotionCategory, string>> = {
    sleepy: {
      low_energy: '先停下最耗你的那件事',
      anxiety: '把能做的事都往后推一推',
      hurt: '今天的任务是：好好休息',
      physical: '身体需要休息，其他的都可以等',
      mixed: '今天就给自己一个完全的休息日',
    },
    hiding: {
      low_energy: '找一个安静角落待 10 分钟，让自己先从"被看见"里退出来',
      anxiety: '找一个安全的地方，让自己先放松',
      hurt: '今天就给自己一个躲起来的理由',
      physical: '今天就给自己一个躲起来的理由',
      mixed: '今天就给自己一个完全的休息',
    },
    spiky: {
      low_energy: '关掉不必要的通知，远离容易激怒你的人和事',
      anxiety: '关掉不必要的通知，远离容易激怒你的人和事',
      hurt: '给自己一个冷静的空间',
      physical: '找一个安静的地方，让神经系统放松',
      mixed: '你现在最需要的是安静',
    },
    licking: {
      low_energy: '深呼吸，把自己收回来',
      anxiety: '深呼吸，把自己收回来',
      hurt: '深呼吸，把自己收回来',
      physical: '保持这种距离，好好照顾自己',
      mixed: '保持清醒，好好照顾自己',
    },
    sad: {
      low_energy: '允许自己难受，不用立刻好起来',
      anxiety: '允许自己伤心，这个感受是真实的',
      hurt: '允许自己难受，你的感受需要被承认',
      physical: '允许自己难受，不用强颜欢笑',
      mixed: '允许自己难受，这个时候不用坚强',
    },
    frantic: {
      low_energy: '把能量导向一个具体的事',
      anxiety: '把能量导向一个具体的事',
      hurt: '找一个有意义的方向来释放能量',
      physical: '找一个安全的方式来释放能量',
      mixed: '找一个安全的出口来释放',
    },
    aloof: {
      low_energy: '让自己保持这种清醒',
      anxiety: '用理性来应对压力',
      hurt: '保持这种距离，好好照顾自己',
      physical: '保持这种距离，好好照顾自己',
      mixed: '保持清醒，好好照顾自己',
    },
    sunny: {
      low_energy: '好好享受这个状态',
      anxiety: '好好享受这个平静',
      hurt: '好好照顾自己，为下一个挑战储备能量',
      physical: '好好享受这份舒服',
      mixed: '好好照顾自己，这个时候的自我照顾最有效',
    },
  };

  return suggestions[cat]?.[category] || '照顾好自己';
}

function generateNotSuitable(cat: CatId, category: EmotionCategory): string[] {
  const notSuitable: Record<CatId, Record<EmotionCategory, string[]>> = {
    sleepy: {
      low_energy: ['今天先别硬撑着工作', '能晚一点就晚一点回复', '今天不必急着做决定'],
      anxiety: ['今天先别做重要决定', '能推迟的任务都可以等', '今天不用证明自己'],
      hurt: ['今天先别硬撑着工作', '能晚一点就晚一点回复', '今天不必急着做决定'],
      physical: ['身体在说话，先听听它的需求', '能推迟的事都可以往后排', '今天的目标就是：好好休息'],
      mixed: ['身体和心都在请求停下来', '所有能推迟的都推迟', '今天就是休息日'],
    },
    hiding: {
      low_energy: ['今天先别硬撑着社交', '能推迟的重大决定晚一点也没关系', '如果有人问太多你可以不全部解释'],
      anxiety: ['压力太大的时候躲一会儿是对的', '能推迟的都推迟', '今天就是自己的时间'],
      hurt: ['今天先别硬撑着社交', '能推迟的重大决定晚一点也没关系', '如果有人问太多你可以不全部解释'],
      physical: ['身体在求救先照顾它', '能推迟的事都可以等', '今天不用对任何人有交代'],
      mixed: ['身体和心都在求救', '所有能推迟的都推迟', '今天就给自己一个完全的休息'],
    },
    spiky: {
      low_energy: ['今天先别做重要决定', '能避免的冲突就先避免', '如果有人催你你可以不立刻接住'],
      anxiety: ['今天先别做重要决定', '能避免的冲突就先避免', '如果有人催你你可以不立刻接住'],
      hurt: ['今天先别做重要决定', '能避免的冲突就先避免', '如果有人催你你可以不立刻接住'],
      physical: ['身体在发出警告不要再逼自己', '能推迟的都推迟', '今天的任务是：放松'],
      mixed: ['身体难受加心里烦躁都需要休息', '所有能推迟的都推迟', '今天就是放松日'],
    },
    licking: {
      low_energy: ['今天先别做重要决定', '能避免的冲突就先避免', '给自己一个冷静的空间'],
      anxiety: ['今天先别做重要决定', '能避免的冲突就先避免', '给自己一个冷静的空间'],
      hurt: ['今天先别做重要决定', '能避免的冲突就先避免', '给自己一个冷静的空间'],
      physical: ['身体在发出信号不要再加速了', '能推迟的都推迟', '今天的任务是：放松'],
      mixed: ['保持清醒很重要', '能推迟的都推迟', '今天就是冷静日'],
    },
    sad: {
      low_energy: ['今天先别硬撑着工作', '能晚一点就晚一点回复', '今天不必急着做决定'],
      anxiety: ['被失望打击的时候允许自己伤心', '可以倾诉、哭泣或者写下来', '这个感受是真实的'],
      hurt: ['今天先别硬撑着工作', '能晚一点就晚一点回复', '今天不必急着做决定'],
      physical: ['身体不适加心里失落允许自己难受', '可以倾诉、哭泣或者写下来', '不用强颜欢笑'],
      mixed: ['身体难受加心里失落允许自己难受', '可以倾诉、哭泣或者写下来', '这个时候不用坚强'],
    },
    frantic: {
      low_energy: ['今天把能量导向一个具体的事', '可以找一个出口来释放能量', '可以做一些让自己放松的事'],
      anxiety: ['今天把能量导向一个具体的事', '可以找一个出口来释放能量', '可以做一些让自己放松的事'],
      hurt: ['被催促的时候找一个有意义的方向', '可以做一些让自己放松的事', '可以找一个出口来释放能量'],
      physical: ['身体在发出信号找一个安全的方式来释放能量', '可以做一些让自己放松的事', '可以找一个出口来释放'],
      mixed: ['身体难受加心里急找一个安全的出口', '可以做一些让自己放松的事', '可以找一个有意义的方向'],
    },
    aloof: {
      low_energy: ['今天可以保持这种清醒', '不用强行融入', '你的冷静是一种力量'],
      anxiety: ['用理性来应对压力', '这个时候的冷静是你的优势', '保持清醒很重要'],
      hurt: ['今天可以保持这种清醒', '不用强行融入', '你的冷静是一种力量'],
      physical: ['身体的信号让你更需要冷静', '保持这种距离好好照顾自己', '用理性来应对'],
      mixed: ['保持清醒好好照顾自己', '用理性来应对', '这个时候的理性很重要'],
    },
    sunny: {
      low_energy: ['今天可以好好享受这个状态', '可以做一些让自己开心的事', '可以和喜欢的人在一起'],
      anxiety: ['压力暂时放下了好好享受这个平静', '可以做一些让自己开心的事', '可以为下一个挑战储备能量'],
      hurt: ['今天可以好好享受这个状态', '可以做一些让自己开心的事', '可以和喜欢的人在一起'],
      physical: ['身体恢复了好好享受这份舒服', '可以做一些让自己开心的事', '可以和喜欢的人在一起'],
      mixed: ['身体和心都在恢复', '可以好好照顾自己', '可以做一些让自己开心的事'],
    },
  };

  return notSuitable[cat]?.[category] || ['照顾好自己'];
}

function generateRecoveryMethods(cat: CatId): string[] {
  const methods: Record<CatId, string[]> = {
    sleepy: ['休息', '热饮', '安静', '降噪'],
    hiding: ['独处', '安静', '降噪', '舒适空间'],
    spiky: ['安静', '冷静', '降噪', '独处'],
    licking: ['深呼吸', '冥想', '冷静', '独处'],
    sad: ['倾诉', '哭泣', '陪伴', '被理解'],
    frantic: ['运动', '释放', '有意义的事', '冷静'],
    aloof: ['思考', '观察', '冷静', '独处'],
    sunny: ['享受', '陪伴', '开心的事', '储备能量'],
  };

  return methods[cat] || ['照顾好自己'];
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { mood_text, body_state, need, forceNeighbor } = req.body;

    if (!mood_text || typeof mood_text !== 'string') {
      return res.status(400).json({ error: 'mood_text is required' });
    }

    // Classify emotion
    const category = classifyEmotion(mood_text);

    // Map to cat
    let catId = mapCat(category, body_state || '', need || '');
    
    // If forcing neighbor cat (for "换一种理解方式")
    if (forceNeighbor && forceNeighbor in NEIGHBORS) {
      catId = forceNeighbor as CatId;
    }

    const cat = CATS[catId];

    // Generate content
    const explanation = generateExplanation(catId, category, mood_text);
    const suggestion = generateSuggestion(catId, category);
    const notSuitable = generateNotSuitable(catId, category);
    const recoveryMethods = generateRecoveryMethods(catId);
    
    // Get random cat photo
    const catPhoto = await getRandomCatPhoto(catId);

    return res.status(200).json({
      success: true,
      data: {
        catId,
        name: cat.name,
        emoji: cat.emoji,
        explanation,
        suggestion,
        notSuitable,
        recoveryMethods,
        neighbor: NEIGHBORS[catId],
        catPhoto,
      },
    });
  } catch (error) {
    console.error('Cat signature error:', error);
    return res.status(500).json({ error: 'Failed to generate signature' });
  }
}
