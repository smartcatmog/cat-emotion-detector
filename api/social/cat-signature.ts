import { VercelRequest, VercelResponse } from '@vercel/node';

const CAT_PERSONALITIES = {
  clingy: {
    name: '粘人猫',
    emoji: '🥺',
    energy: 'low',
    emotion: 'negative',
    socialNeed: 'together',
    control: 'low',
  },
  spiky: {
    name: '炸毛猫',
    emoji: '😾',
    energy: 'high',
    emotion: 'negative',
    socialNeed: 'alone',
    control: 'low',
  },
  hiding: {
    name: '躲柜子猫',
    emoji: '🙈',
    energy: 'low',
    emotion: 'negative',
    socialNeed: 'alone',
    control: 'low',
  },
  aloof: {
    name: '高冷观察猫',
    emoji: '😼',
    energy: 'medium',
    emotion: 'neutral',
    socialNeed: 'alone',
    control: 'high',
  },
  sleepy: {
    name: '困困猫',
    emoji: '😴',
    energy: 'low',
    emotion: 'neutral',
    socialNeed: 'together',
    control: 'low',
  },
  frantic: {
    name: '暴冲猫',
    emoji: '⚡',
    energy: 'high',
    emotion: 'negative',
    socialNeed: 'alone',
    control: 'low',
  },
  sad: {
    name: '委屈猫',
    emoji: '😢',
    energy: 'low',
    emotion: 'negative',
    socialNeed: 'together',
    control: 'low',
  },
  curious: {
    name: '好奇猫',
    emoji: '🐱',
    energy: 'medium',
    emotion: 'positive',
    socialNeed: 'together',
    control: 'medium',
  },
  sunny: {
    name: '晒太阳猫',
    emoji: '😸',
    energy: 'medium',
    emotion: 'positive',
    socialNeed: 'together',
    control: 'high',
  },
};

// Emotion vector mapping
interface EmotionVector {
  energy: 'low' | 'medium' | 'high';
  emotion: 'positive' | 'neutral' | 'negative';
  socialNeed: 'alone' | 'together';
  control: 'high' | 'low';
}

// Parse user input to emotion vector
function parseEmotionVector(text: string): EmotionVector {
  const lowerText = text.toLowerCase();

  // Energy detection
  let energy: 'low' | 'medium' | 'high' = 'medium';
  if (lowerText.match(/累|困|没力|疲惫|无力|睡眠|休息|放松/)) energy = 'low';
  if (lowerText.match(/躁|急|停不下|激动|兴奋|亢奋|冲/)) energy = 'high';

  // Emotion detection
  let emotion: 'positive' | 'neutral' | 'negative' = 'neutral';
  if (lowerText.match(/开心|高兴|开心|放松|舒服|好|棒|爱/)) emotion = 'positive';
  if (lowerText.match(/烦|焦虑|压力|失望|委屈|生气|难受|伤心|害怕|无聊|无安全感/)) emotion = 'negative';

  // Social need detection
  let socialNeed: 'alone' | 'together' = 'together';
  if (lowerText.match(/独处|一个人|不想见|躲|逃离|安静|空间/)) socialNeed = 'alone';

  // Control detection
  let control: 'high' | 'low' = 'high';
  if (lowerText.match(/失控|无力|被动|无法|不知道|迷茫|混乱/)) control = 'low';

  return { energy, emotion, socialNeed, control };
}

// Match emotion vector to cat personality
function matchCatPersonality(vector: EmotionVector): string {
  const { energy, emotion, socialNeed, control } = vector;

  // Matching rules
  if (energy === 'low' && emotion === 'negative' && socialNeed === 'alone' && control === 'low') {
    return 'hiding'; // 躲柜子猫
  }
  if (energy === 'high' && emotion === 'negative' && socialNeed === 'alone' && control === 'low') {
    return 'spiky'; // 炸毛猫
  }
  if (energy === 'low' && emotion === 'negative' && socialNeed === 'together' && control === 'low') {
    return 'clingy'; // 粘人猫
  }
  if (energy === 'low' && emotion === 'neutral' && socialNeed === 'together' && control === 'low') {
    return 'sleepy'; // 困困猫
  }
  if (energy === 'high' && emotion === 'negative' && socialNeed === 'alone') {
    return 'frantic'; // 暴冲猫
  }
  if (energy === 'low' && emotion === 'negative' && socialNeed === 'together') {
    return 'sad'; // 委屈猫
  }
  if (energy === 'medium' && emotion === 'positive' && socialNeed === 'together') {
    return 'curious'; // 好奇猫
  }
  if (energy === 'medium' && emotion === 'positive' && control === 'high') {
    return 'sunny'; // 晒太阳猫
  }
  if (energy === 'medium' && emotion === 'neutral' && socialNeed === 'alone' && control === 'high') {
    return 'aloof'; // 高冷观察猫
  }

  // Default fallback
  return 'sleepy';
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { mood_text } = req.body;

    if (!mood_text || typeof mood_text !== 'string') {
      return res.status(400).json({ error: 'mood_text is required' });
    }

    // Parse emotion vector
    const vector = parseEmotionVector(mood_text);

    // Match to cat personality
    const personalityId = matchCatPersonality(vector);
    const personality = CAT_PERSONALITIES[personalityId as keyof typeof CAT_PERSONALITIES];

    // Return signature data
    return res.status(200).json({
      success: true,
      data: {
        personalityId,
        personality: personality.name,
        emoji: personality.emoji,
        emotionVector: vector,
        // Full signature content would be fetched from database in production
        // For MVP, returning basic structure
      },
    });
  } catch (error) {
    console.error('Cat signature error:', error);
    return res.status(500).json({ error: 'Failed to generate signature' });
  }
}
