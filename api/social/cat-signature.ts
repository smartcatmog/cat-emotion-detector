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

// Input type detection
type InputType = 'emotion' | 'physical' | 'pressure' | 'mixed';

interface EmotionVector {
  energy: 'low' | 'medium' | 'high';
  emotion: 'positive' | 'neutral' | 'negative';
  socialNeed: 'alone' | 'together';
  control: 'high' | 'low';
  inputType: InputType;
  userKeywords: string[];
}

// Detect input type
function detectInputType(text: string): InputType {
  const lowerText = text.toLowerCase();
  
  const physicalKeywords = /头疼|头痛|胃疼|胃痛|肚子疼|腹痛|心慌|心悸|来姨妈|月经|生理期|喉咙|咳嗽|发烧|发热|酸痛|疼痛|不舒服|难受|身体|生病|病了/;
  const pressureKeywords = /压力|工作|deadline|截止|任务|会议|考试|面试|冲突|矛盾|吵架|被催|被逼|被迫|责任|义务|必须|应该/;
  const emotionKeywords = /烦|焦虑|失望|委屈|生气|伤心|害怕|无聊|无安全感|孤独|被忽视|失落|难受/;
  
  const hasPhysical = physicalKeywords.test(lowerText);
  const hasPressure = pressureKeywords.test(lowerText);
  const hasEmotion = emotionKeywords.test(lowerText);
  
  if (hasPhysical && (hasPressure || hasEmotion)) return 'mixed';
  if (hasPhysical) return 'physical';
  if (hasPressure && hasEmotion) return 'mixed';
  if (hasPressure) return 'pressure';
  return 'emotion';
}

// Extract user keywords for personalization
function extractKeywords(text: string): string[] {
  const words = text.split(/[\s，。！？、]+/).filter(w => w.length > 0);
  return words.slice(0, 3); // Keep first 3 meaningful words
}

// Parse user input to emotion vector
function parseEmotionVector(text: string): EmotionVector {
  const lowerText = text.toLowerCase();
  const inputType = detectInputType(text);
  const userKeywords = extractKeywords(text);

  // Energy detection
  let energy: 'low' | 'medium' | 'high' = 'medium';
  if (lowerText.match(/累|困|没力|疲惫|无力|睡眠|休息|放松|头疼|胃疼|难受/)) energy = 'low';
  if (lowerText.match(/躁|急|停不下|激动|兴奋|亢奋|冲|心慌|心悸/)) energy = 'high';

  // Emotion detection
  let emotion: 'positive' | 'neutral' | 'negative' = 'neutral';
  if (lowerText.match(/开心|高兴|放松|舒服|好|棒|爱|开心/)) emotion = 'positive';
  if (lowerText.match(/烦|焦虑|压力|失望|委屈|生气|难受|伤心|害怕|无聊|无安全感|头疼|胃疼/)) emotion = 'negative';

  // Social need detection
  let socialNeed: 'alone' | 'together' = 'together';
  if (lowerText.match(/独处|一个人|不想见|躲|逃离|安静|空间|被打扰|被催/)) socialNeed = 'alone';

  // Control detection
  let control: 'high' | 'low' = 'high';
  if (lowerText.match(/失控|无力|被动|无法|不知道|迷茫|混乱|被逼|被迫|无法|心慌/)) control = 'low';

  return { energy, emotion, socialNeed, control, inputType, userKeywords };
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

    // Generate personalized content based on input type
    const explanations: Record<string, Record<string, string>> = {
      sleepy: {
        emotion: '你不是懒，只是今天的电池没电了。你的身体在告诉你：我需要休息。这是一个信号，不是失败。',
        physical: '你现在的不舒服，不只是心情问题，身体也在出声了。这个信号是你的系统在请求降速。',
        pressure: '压力堆积到一定程度，身体就会自动进入"休眠模式"。这不是退缩，是你的智慧在保护自己。',
        mixed: '你现在既累又有压力，身体和心都在喊停。这个状态说明你需要真正的休息，不是"坚持一下"。',
      },
      hiding: {
        emotion: '你不是不想面对，只是今天的能量不够支撑你继续装没事。你表面还在撑，但身体和心已经在往后退了。这不是懒，也不是矫情，是你的系统在请求降噪。',
        physical: '你现在的不舒服让你更想躲起来，这很正常。身体的信号让你更需要一个安全的空间。',
        pressure: '压力太大的时候，躲起来是一种自我保护。你不是逃避，是在给自己喘息的机会。',
        mixed: '身体不适加压力，双重夹击下，你想躲是合理的。这个状态说明你需要先照顾自己，其他的都可以等。',
      },
      spiky: {
        emotion: '你不是坏脾气，只是今天的神经系统超载了。每一个小事都像被放大了十倍。这不是你的错，是你的系统在过度保护你。',
        physical: '身体的不适让你更容易被激怒。这不是脾气问题，是身体在求救。',
        pressure: '被压力逼到角落的时候，任何一点小事都能引爆。你现在不是脾气差，是被逼到了极限。',
        mixed: '身体难受加压力大，你现在就像一根绷紧的弦。这个状态说明你需要先放松，不是"再忍忍"。',
      },
      clingy: {
        emotion: '你不是太依赖，只是今天的能量需要被看见。你在等一个确认：我在这里，你不是一个人。这种需要很正常，是你的系统在寻求连接。',
        physical: '身体不适的时候，更需要被陪伴。这个时候你需要的不是独自承受，而是有人在。',
        pressure: '被压力压得喘不过气的时候，你需要有人在身边。这不是软弱，是在寻求支持。',
        mixed: '身体难受加心里委屈，你现在特别需要被看见。这个时候找一个信任的人倾诉，会好很多。',
      },
      curious: {
        emotion: '你开始有力气了。你不再只是防守，开始想要去看看、去尝试。这是恢复的信号，是你的系统在说：我们可以继续了。',
        physical: '身体开始恢复，心情也跟着好转。这是一个好信号，可以慢慢尝试一些新的东西。',
        pressure: '压力还在，但你已经有力气去面对了。这种状态很珍贵，可以好好利用。',
        mixed: '身体在恢复，心情也在回升。这个时候可以开始尝试一些小的改变。',
      },
      sunny: {
        emotion: '你真的好了。不是假装，不是压抑，是真的从里到外都放松了。你可以享受当下，可以感受温暖。这是你应得的。',
        physical: '身体恢复了，心情也跟着晴朗了。这个时候好好享受这份舒服。',
        pressure: '压力暂时放下了，你可以喘口气。这个平静的时刻很珍贵。',
        mixed: '身体和心都在恢复。这个时候可以好好照顾自己，为下一个挑战储备能量。',
      },
      aloof: {
        emotion: '你不是冷漠，只是今天需要用理性来保护自己。你在观察、在思考、在给自己空间。这是你的智慧，不是距离。',
        physical: '身体的信号让你更需要冷静地思考。这个时候保持距离是对的。',
        pressure: '被压力包围的时候，抽离是一种策略。你在用理性来应对。',
        mixed: '身体和心都在告诉你需要冷静。这个时候保持清醒很重要。',
      },
      frantic: {
        emotion: '你不是坏，只是今天的能量太多了，无处释放。你在急，但急不出结果。这时候需要的是方向，不是更多的冲。',
        physical: '身体的不适让你更加焦躁。这个时候需要找到一个出口来释放。',
        pressure: '被压力催促，你现在停不下来。这个时候需要找到一个有意义的方向来释放能量。',
        mixed: '身体难受加心里急，你现在就像一个高速运转的马达。需要找到一个出口。',
      },
      sad: {
        emotion: '你不是太敏感，只是今天的失望积累了。你在等一个道歉、一个解释、一个确认。你的感受是真实的，值得被看见。',
        physical: '身体的不适让你更容易感到失落。这个时候你需要被理解，不是被忽视。',
        pressure: '被压力和失望双重打击，你现在很委屈。这个感受是真实的，值得被承认。',
        mixed: '身体难受加心里失落，你现在特别需要被看见。这个时候允许自己难受，不用立刻好起来。',
      },
    };

    const advices: Record<string, Record<string, string>> = {
      sleepy: {
        emotion: '今天就让自己慢下来。不用赶进度，不用证明自己。睡眠、休息、做一些舒服的事。你的能量会回来的。',
        physical: '今天先别解决所有问题，只关掉一个让你分心的窗口。身体需要休息，其他的都可以等。',
        pressure: '把能做的事都往后推一推。今天的任务是：好好休息。',
        mixed: '身体和心都在请求停下来。今天就给自己一个完全的休息日。',
      },
      hiding: {
        emotion: '今天先别解决所有问题，只关掉一个让你分心的窗口。允许自己晚一点回复，不用立刻把所有人安顿好。找一个安静角落待 10 分钟，让自己先从"被看见"里退出来。',
        physical: '身体在求救，心也在求救。今天就给自己一个躲起来的理由。',
        pressure: '压力太大的时候，躲一会儿是对的。找一个安全的地方，让自己先放松。',
        mixed: '身体不适加压力大，你现在需要的是一个真正的避风港。',
      },
      spiky: {
        emotion: '今天给自己一个"隔离区"。关掉不必要的通知，远离容易激怒你的人和事。如果可能，找一个安静的地方，让自己的神经系统慢下来。',
        physical: '身体在发出警告，不要再逼自己了。找一个安静的地方，让神经系统放松。',
        pressure: '被逼到极限的时候，最好的办法就是先停下来。给自己一个冷静的空间。',
        mixed: '身体难受加心里烦躁，你现在最需要的是安静。',
      },
      clingy: {
        emotion: '今天不用独自承受。找一个信任的人，告诉他们你现在的感受。不需要解决问题，只需要被听见。一个拥抱、一条消息、一通电话都可以。',
        physical: '身体不适的时候，有人陪伴会好很多。不用隐瞒，直接说出来。',
        pressure: '被压力压得喘不过气的时候，找一个人倾诉。不是为了解决，只是为了被陪伴。',
        mixed: '身体难受加心里委屈，这个时候最需要的就是有人在。',
      },
      curious: {
        emotion: '今天就跟着这个好奇心走。去尝试一个新的东西、见一个有趣的人、或者做一件一直想做的小事。这个能量很珍贵。',
        physical: '身体在恢复，可以慢慢尝试一些活动。不用太剧烈，但可以开始动起来。',
        pressure: '压力还在，但你已经有力气去面对了。可以尝试一些新的方法。',
        mixed: '身体和心都在恢复，可以开始尝试一些小的改变。',
      },
      sunny: {
        emotion: '今天就好好享受这个状态。不用赶着做什么，不用证明什么。让自己晒晒太阳，感受这份平静。这个时刻很珍贵。',
        physical: '身体恢复了，好好享受这份舒服。可以做一些让自己开心的事。',
        pressure: '压力暂时放下了，好好享受这个平静。为下一个挑战储备能量。',
        mixed: '身体和心都在恢复，好好照顾自己。这个时候的自我照顾最有效。',
      },
      aloof: {
        emotion: '今天就让自己保持这种清醒。不用强行融入，不用假装热情。你的冷静是一种力量，让它发挥作用。',
        physical: '身体的信号让你更需要冷静。保持这种距离，好好照顾自己。',
        pressure: '用理性来应对压力。这个时候的冷静是你的优势。',
        mixed: '保持清醒，好好照顾自己。这个时候的理性很重要。',
      },
      frantic: {
        emotion: '今天把能量导向一个具体的事。不要同时做十件事，选一件，全力以赴。或者找一个出口：运动、创意、任何能让你的能量流动的事。',
        physical: '身体在发出信号，不要再加速了。找一个安全的方式来释放能量。',
        pressure: '被催促的时候，找一个有意义的方向来释放能量。不是盲目地冲，而是有目标地行动。',
        mixed: '身体难受加心里急，找一个安全的出口来释放。',
      },
      sad: {
        emotion: '今天允许自己难受。不用立刻放下，不用假装没事。哭一场、写下来、或者告诉一个信任的人。你的感受需要被承认。',
        physical: '身体不适加心里失落，允许自己难受。不用强颜欢笑。',
        pressure: '被失望打击的时候，允许自己伤心。这个感受是真实的。',
        mixed: '身体难受加心里失落，允许自己难受。这个时候不用坚强。',
      },
    };

    const softSuggestions: Record<string, Record<string, string[]>> = {
      sleepy: {
        emotion: ['今天先别把自己丢进高压模式', '能推迟的决定，晚一点也没关系', '如果有人催你，你可以不立刻接住'],
        physical: ['身体在说话，先听听它的需求', '能推迟的事，都可以往后排', '今天的目标就是：好好休息'],
        pressure: ['压力暂时放一放，身体优先', '能推迟的任务，都可以等', '今天不用证明自己'],
        mixed: ['身体和心都在请求停下来', '所有能推迟的，都推迟', '今天就是休息日'],
      },
      hiding: {
        emotion: ['今天先别硬撑着社交', '能推迟的重大决定，晚一点也没关系', '如果有人问太多，你可以不全部解释'],
        physical: ['身体在求救，先照顾它', '能推迟的事都可以等', '今天不用对任何人有交代'],
        pressure: ['压力太大的时候，躲一会儿是对的', '能推迟的都推迟', '今天就是自己的时间'],
        mixed: ['身体和心都在求救', '所有能推迟的都推迟', '今天就给自己一个完全的休息'],
      },
      spiky: {
        emotion: ['今天先别做重要决定', '能避免的冲突，就先避免', '如果有人催你，你可以不立刻接住'],
        physical: ['身体在发出警告，不要再逼自己', '能推迟的都推迟', '今天的任务是：放松'],
        pressure: ['被逼到极限的时候，先停下来', '能推迟的都推迟', '今天不用证明自己'],
        mixed: ['身体难受加心里烦躁，都需要休息', '所有能推迟的都推迟', '今天就是放松日'],
      },
      clingy: {
        emotion: ['今天先别独自处理重要的事', '能找人帮忙的，就找人帮忙', '今天可以多依赖别人一点'],
        physical: ['身体不适的时候，有人陪伴很重要', '能找人帮忙的，就找人帮忙', '今天可以多麻烦别人一点'],
        pressure: ['被压力压得喘不过气的时候，找人倾诉', '能找人帮忙的，就找人帮忙', '今天可以多依赖别人'],
        mixed: ['身体难受加心里委屈，需要有人在', '能找人帮忙的，就找人帮忙', '今天可以完全依赖别人'],
      },
      curious: {
        emotion: ['今天可以尝试一些新的东西', '可以去见一个有趣的人', '可以做一件一直想做的小事'],
        physical: ['身体在恢复，可以慢慢尝试活动', '可以做一些让自己开心的事', '可以尝试一些新的方法'],
        pressure: ['压力还在，但你已经有力气去面对', '可以尝试一些新的方法', '可以做一些让自己开心的事'],
        mixed: ['身体和心都在恢复', '可以尝试一些小的改变', '可以做一些让自己开心的事'],
      },
      sunny: {
        emotion: ['今天可以好好享受这个状态', '可以做一些让自己开心的事', '可以和喜欢的人在一起'],
        physical: ['身体恢复了，好好享受这份舒服', '可以做一些让自己开心的事', '可以和喜欢的人在一起'],
        pressure: ['压力暂时放下了，好好享受这个平静', '可以做一些让自己开心的事', '可以为下一个挑战储备能量'],
        mixed: ['身体和心都在恢复', '可以好好照顾自己', '可以做一些让自己开心的事'],
      },
      aloof: {
        emotion: ['今天可以保持这种清醒', '不用强行融入', '你的冷静是一种力量'],
        physical: ['身体的信号让你更需要冷静', '保持这种距离，好好照顾自己', '用理性来应对'],
        pressure: ['用理性来应对压力', '这个时候的冷静是你的优势', '保持清醒很重要'],
        mixed: ['保持清醒，好好照顾自己', '用理性来应对', '这个时候的理性很重要'],
      },
      frantic: {
        emotion: ['今天把能量导向一个具体的事', '可以找一个出口来释放能量', '可以做一些让自己放松的事'],
        physical: ['身体在发出信号，找一个安全的方式来释放能量', '可以做一些让自己放松的事', '可以找一个出口来释放'],
        pressure: ['被催促的时候，找一个有意义的方向', '可以做一些让自己放松的事', '可以找一个出口来释放能量'],
        mixed: ['身体难受加心里急，找一个安全的出口', '可以做一些让自己放松的事', '可以找一个有意义的方向'],
      },
      sad: {
        emotion: ['今天可以允许自己难受', '可以哭一场、写下来、或者倾诉', '你的感受需要被承认'],
        physical: ['身体不适加心里失落，允许自己难受', '可以倾诉、哭泣、或者写下来', '不用强颜欢笑'],
        pressure: ['被失望打击的时候，允许自己伤心', '可以倾诉、哭泣、或者写下来', '这个感受是真实的'],
        mixed: ['身体难受加心里失落，允许自己难受', '可以倾诉、哭泣、或者写下来', '这个时候不用坚强'],
      },
    };

    const explanation = explanations[personalityId]?.[vector.inputType] || explanations[personalityId]?.emotion || '你的感受是真实的。';
    const advice = advices[personalityId]?.[vector.inputType] || advices[personalityId]?.emotion || '照顾好自己。';
    const suggestions = softSuggestions[personalityId]?.[vector.inputType] || softSuggestions[personalityId]?.emotion || ['照顾好自己'];

    // Return signature data with personalized content
    return res.status(200).json({
      success: true,
      data: {
        personalityId,
        personality: personality.name,
        emoji: personality.emoji,
        explanation,
        advice,
        softSuggestions: suggestions,
        recoveryMethods: ['独处', '睡眠', '陪伴', '运动'],
        emotionVector: vector,
      },
    });
  } catch (error) {
    console.error('Cat signature error:', error);
    return res.status(500).json({ error: 'Failed to generate signature' });
  }
}
