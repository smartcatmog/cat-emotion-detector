import { VercelRequest, VercelResponse } from '@vercel/node';

type CatId = string;

interface CatData {
  id: CatId;
  name: string;
  tagline: string;
  explanation: string;
  suggestion: string;
  avoid: string[];
  recovery_tags: string[];
  neighbor_cats: string[];
  energy: string;
  social: string;
  trigger_type: string;
}

// Import cats data
const catsData = require('../../src/data/cats.json');
const CATS: Record<CatId, CatData> = {};
catsData.cats.forEach((cat: CatData) => {
  CATS[cat.id] = cat;
});

function classifyEmotion(text: string, bodyState: string, need: string): { category: string; keywords: CatId[] } {
  const lower = text.toLowerCase();
  const keywords: CatId[] = [];

  // Priority 1: 具体场景词（最高优先级）
  if (lower.includes('明天') || lower.includes('周一') || lower.includes('上班')) {
    keywords.push('zhouri_wanshang_mao');
  }
  if (lower.includes('睡不着') || lower.includes('失眠')) {
    keywords.push('shimian_mao');
  }
  if (lower.includes('等') && lower.includes('回复')) {
    keywords.push('dengmen_mao');
  }
  if (lower.includes('中午') || lower.includes('下午两点')) {
    keywords.push('zhongwu_mao');
  }
  if (lower.includes('换季') || lower.includes('季节')) {
    keywords.push('huanji_mao');
  }
  if (lower.includes('假期结束') || lower.includes('收假')) {
    keywords.push('jiaqijieshu_mao');
  }
  if (lower.includes('考试') || lower.includes('考前')) {
    keywords.push('kaoshi_mao');
  }
  if (lower.includes('迷路') || lower.includes('不知道')) {
    keywords.push('milu_mao');
  }
  if (lower.includes('生日')) {
    keywords.push('shengri_mao');
  }

  // Priority 2: 关系触发
  if (lower.includes('被骂') || lower.includes('吵架') || lower.includes('冲突')) {
    keywords.push('zhaguo_mao');
  }
  if (lower.includes('被遗忘') || lower.includes('没人') || lower.includes('优先级')) {
    keywords.push('beiyiwang_mao');
  }
  if (lower.includes('讨好') || lower.includes('说不出来')) {
    keywords.push('taohao_mao');
  }
  if (lower.includes('嫉妒') || lower.includes('比较')) {
    keywords.push('jidu_mao');
  }
  if (lower.includes('冷战') || lower.includes('不说话')) {
    keywords.push('lengzhan_mao');
  }
  if (lower.includes('装死') || lower.includes('不回应')) {
    keywords.push('zhuangsi_mao');
  }
  if (lower.includes('边界') || lower.includes('说不了')) {
    keywords.push('bianjie_mao');
  }

  // Priority 3: 焦虑系
  if (lower.includes('焦虑') || lower.includes('停不下') || lower.includes('脑子乱')) {
    keywords.push('beng_jin_mao');
  }
  if (lower.includes('随时可能') || lower.includes('失控') || lower.includes('脆弱')) {
    keywords.push('boli_mao');
  }
  if (lower.includes('假睡') || lower.includes('装睡')) {
    keywords.push('jia_shui_mao');
  }

  // Priority 4: 低能量
  if (lower.includes('累') || lower.includes('困') || lower.includes('没电')) {
    keywords.push('kun_kun_mao');
  }
  if (lower.includes('躲') || lower.includes('安静') || lower.includes('独处')) {
    keywords.push('duo_guizi_mao');
  }

  // Priority 5: 高能量
  if (lower.includes('烦躁') || lower.includes('炸毛')) {
    keywords.push('zha_mao_mao');
  }
  if (lower.includes('停不下') || lower.includes('暴冲')) {
    keywords.push('bao_chong_mao');
  }
  if (lower.includes('撒欢') || lower.includes('兴奋')) {
    keywords.push('sa_huan_mao');
  }
  if (lower.includes('黏人') || lower.includes('粘人')) {
    keywords.push('nian_ren_mao');
  }

  // Priority 6: 成长触发
  if (lower.includes('变化') || lower.includes('脱毛')) {
    keywords.push('tuomao_mao');
  }
  if (lower.includes('洗澡')) {
    keywords.push('gangxizaowan_mao');
  }
  if (lower.includes('窗台') || lower.includes('看风景')) {
    keywords.push('chuangtai_mao');
  }
  if (lower.includes('修炼') || lower.includes('独处')) {
    keywords.push('duzilianxi_mao');
  }
  if (lower.includes('老地方') || lower.includes('回到')) {
    keywords.push('laodifang_mao');
  }
  if (lower.includes('第一次') || lower.includes('没做过')) {
    keywords.push('diyici_mao');
  }

  // Priority 7: 补充类
  if (lower.includes('纸箱') || lower.includes('躲')) {
    keywords.push('zhixiang_mao');
  }
  if (lower.includes('发呆') || lower.includes('放空')) {
    keywords.push('fadai_mao');
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
    return 'kun_kun_mao';
  }
  if (need === '自己待着') {
    return 'duo_guizi_mao';
  }
  if (need === '被陪着') {
    return 'kun_kun_mao';
  }
  if (need === '发泄') {
    return 'zha_mao_mao';
  }
  if (need === '被理解') {
    return 'wei_qu_mao';
  }

  return 'shai_taiyang_mao';
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

    if (!primaryCat) {
      return res.status(500).json({ error: 'Cat not found' });
    }

    // Get neighbor cat - find first neighbor that exists in CATS
    let neighborCat = null;
    for (const neighborId of primaryCat.neighbor_cats) {
      if (CATS[neighborId]) {
        neighborCat = CATS[neighborId];
        break;
      }
    }
    if (!neighborCat) {
      neighborCat = CATS['shai_taiyang_mao']; // fallback
    }

    // Get random cat photo
    const catPhoto = await getRandomCatPhoto(primaryCatId);

    return res.status(200).json({
      success: true,
      data: {
        catId: primaryCatId,
        name: primaryCat.name,
        emoji: '😺', // emoji from tagline or default
        explanation: primaryCat.explanation,
        suggestion: primaryCat.suggestion,
        notSuitable: primaryCat.avoid,
        recoveryMethods: primaryCat.recovery_tags,
        neighbor: neighborCat.id,
        neighborName: neighborCat.name,
        catPhoto,
      },
    });
  } catch (error) {
    console.error('Cat signature error:', error);
    return res.status(500).json({ error: 'Failed to generate signature' });
  }
}


async function getRandomCatPhoto(catId: CatId): Promise<string | null> {
  try {
    // Map each cat personality to Supabase emotion labels
    const emotionMap: Record<CatId, string[]> = {
      // 能量×社交类
      kun_kun_mao: ['sleepy', 'calm', 'loved'],
      duo_guizi_mao: ['suspicious', 'ashamed', 'calm'],
      zha_mao_mao: ['angry', 'annoyed', 'dramatic'],
      tian_mao_mao: ['anxious', 'calm', 'curious'],
      wei_qu_mao: ['melancholy', 'ashamed', 'loved'],
      bao_chong_mao: ['dramatic', 'hangry', 'angry'],
      gaoleng_guancha_mao: ['suspicious', 'smug', 'curious'],
      shai_taiyang_mao: ['happy', 'loved', 'calm'],
      sa_huan_mao: ['happy', 'dramatic', 'playful'],
      nian_ren_mao: ['clingy', 'happy', 'loved'],
      
      // 焦虑系
      beng_jin_mao: ['anxious', 'angry', 'tense'],
      boli_mao: ['anxious', 'melancholy', 'tense'],
      jia_shui_mao: ['sleepy', 'calm', 'suspicious'],
      
      // 处境触发类
      zhouri_wanshang_mao: ['melancholy', 'anxious', 'tense'],
      zhongwu_mao: ['calm', 'sleepy', 'melancholy'],
      shimian_mao: ['anxious', 'dramatic', 'tense'],
      huanji_mao: ['melancholy', 'calm', 'curious'],
      jiaqijieshu_mao: ['melancholy', 'sleepy', 'calm'],
      kaoshi_mao: ['anxious', 'dramatic', 'tense'],
      milu_mao: ['curious', 'anxious', 'confused'],
      shengri_mao: ['happy', 'calm', 'loved'],
      
      // 关系触发类
      zhuangsi_mao: ['sleepy', 'calm', 'suspicious'],
      dengmen_mao: ['anxious', 'curious', 'tense'],
      zhaguo_mao: ['angry', 'dramatic', 'annoyed'],
      beiyiwang_mao: ['melancholy', 'sleepy', 'sad'],
      jidu_mao: ['anxious', 'annoyed', 'melancholy'],
      taohao_mao: ['calm', 'clingy', 'loved'],
      bianjie_mao: ['angry', 'suspicious', 'tense'],
      lengzhan_mao: ['suspicious', 'calm', 'melancholy'],
      
      // 成长触发类
      tuomao_mao: ['dramatic', 'anxious', 'curious'],
      gangxizaowan_mao: ['calm', 'sleepy', 'loved'],
      chuangtai_mao: ['calm', 'curious', 'thoughtful'],
      duzilianxi_mao: ['calm', 'curious', 'focused'],
      laodifang_mao: ['calm', 'melancholy', 'thoughtful'],
      diyici_mao: ['dramatic', 'curious', 'playful'],
      
      // 补充类
      zhixiang_mao: ['sleepy', 'calm', 'relaxed'],
      fadai_mao: ['calm', 'sleepy', 'thoughtful'],
    };

    const emotions = emotionMap[catId] || ['sleepy', 'calm'];

    // Try each emotion in order until we find images
    for (const emotion of emotions) {
      try {
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
      } catch (err) {
        continue;
      }
    }

    return null;
  } catch (error) {
    console.error('Error fetching cat photo:', error);
    return null;
  }
}
