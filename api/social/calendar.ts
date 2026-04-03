import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const EMOTION_EMOJI: Record<string, string> = {
  happy:'😸',calm:'😌',sleepy:'😴',curious:'🐱',annoyed:'😾',anxious:'🙀',
  resigned:'😑',dramatic:'💀',sassy:'💅',clingy:'🥺',zoomies:'⚡',suspicious:'🤨',
  smug:'😏',confused:'😵',hangry:'🍽️',sad:'😢',angry:'😡',scared:'😨',
  disgusted:'🤢',surprised:'😲',loved:'🥰',bored:'😒',ashamed:'😳',tired:'😮‍💨',
  disappointed:'😞',melancholy:'🌧️',
};

// Mood forecast copy based on top emotion
const FORECAST_COPY: Record<string, { zh: string; en: string }> = {
  happy:       { zh: '昨天大家都很开心，今天可能也是好日子 ☀️', en: 'Yesterday was joyful — today might be bright too ☀️' },
  calm:        { zh: '昨天全站很平静，今天适合放松一下 🌿', en: 'A calm day yesterday — good vibes ahead 🌿' },
  sleepy:      { zh: '昨天大家都很困，今天记得多喝咖啡 ☕', en: 'Everyone was sleepy yesterday — grab that coffee ☕' },
  tired:       { zh: '昨天大家都很累，今天给自己多一点温柔 🫶', en: 'A tired day yesterday — be gentle with yourself today 🫶' },
  anxious:     { zh: '昨天焦虑情绪偏高，今天深呼吸，会好的 🌬️', en: 'Anxiety was high yesterday — breathe, it gets better 🌬️' },
  sad:         { zh: '昨天有点低落，今天来一只开心的猫治愈一下 🐱', en: 'Yesterday felt heavy — a happy cat might help today 🐱' },
  dramatic:    { zh: '昨天大家都在崩溃，今天一起撑过去 💪', en: 'Yesterday was dramatic — we are all in this together 💪' },
  angry:       { zh: '昨天火气有点大，今天冷静一下，猫猫帮你降火 😸', en: 'Tempers ran high yesterday — let cats cool you down 😸' },
  loved:       { zh: '昨天爱意满满，今天继续传递温暖 💕', en: 'Love was in the air yesterday — keep spreading warmth 💕' },
  curious:     { zh: '昨天大家都很好奇，今天去探索点新东西吧 🔍', en: 'Curiosity was high yesterday — go explore something new 🔍' },
  bored:       { zh: '昨天有点无聊，今天来点新鲜的 ✨', en: 'Boredom struck yesterday — time for something fresh ✨' },
  melancholy:  { zh: '昨天有些惆怅，今天找只猫陪你发呆 🌧️', en: 'A wistful day yesterday — find a cat to daydream with 🌧️' },
};

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const { action, user_id, year, month } = req.query;

  // ── MOOD STATS: today's ranking + yesterday's forecast ─────────────────
  if (action === 'stats') {
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    // Today's emotion counts
    const { data: todayData } = await supabase
      .from('daily_mood_records')
      .select('emotion_label')
      .eq('date', today);

    // Yesterday's emotion counts (for forecast)
    const { data: yesterdayData } = await supabase
      .from('daily_mood_records')
      .select('emotion_label')
      .eq('date', yesterday);

    const countEmotions = (records: any[]) => {
      const counts: Record<string, number> = {};
      for (const r of records) {
        counts[r.emotion_label] = (counts[r.emotion_label] || 0) + 1;
      }
      return Object.entries(counts)
        .sort((a, b) => b[1] - a[1])
        .map(([emotion, count]) => ({ emotion, count, emoji: EMOTION_EMOJI[emotion] || '🐱' }));
    };

    const todayRanking = countEmotions(todayData || []);
    const yesterdayRanking = countEmotions(yesterdayData || []);
    const totalToday = (todayData || []).length;
    const totalYesterday = (yesterdayData || []).length;

    // Forecast: top emotion from yesterday
    const topYesterday = yesterdayRanking[0]?.emotion || 'calm';
    const forecast = FORECAST_COPY[topYesterday] || FORECAST_COPY['calm'];

    return res.status(200).json({
      today: { ranking: todayRanking.slice(0, 8), total: totalToday },
      yesterday: { ranking: yesterdayRanking.slice(0, 5), total: totalYesterday, top: topYesterday },
      forecast,
    });
  }

  // ── CALENDAR (default) ─────────────────────────────────────────────────
  if (!user_id) return res.status(400).json({ error: 'Missing user_id' });

  const y = parseInt(year) || new Date().getFullYear();
  const m = parseInt(month) || new Date().getMonth() + 1;
  const from = `${y}-${String(m).padStart(2, '0')}-01`;
  const lastDay = new Date(y, m, 0).getDate();
  const to = `${y}-${String(m).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

  const { data, error } = await supabase
    .from('daily_mood_records')
    .select('date, emotion_label, mood_text, cat_image_id')
    .eq('user_id', user_id)
    .gte('date', from)
    .lte('date', to)
    .order('date');

  if (error) return res.status(500).json({ error: error.message });

  const { data: allRecords } = await supabase
    .from('daily_mood_records')
    .select('date')
    .eq('user_id', user_id)
    .order('date', { ascending: false });

  let streak = 0;
  if (allRecords && allRecords.length > 0) {
    const todayStr = new Date().toISOString().split('T')[0];
    for (let i = 0; i < allRecords.length; i++) {
      const recordDate = allRecords[i].date;
      const expected = new Date(todayStr);
      expected.setDate(expected.getDate() - i);
      const expectedStr = expected.toISOString().split('T')[0];
      if (recordDate === expectedStr) streak++;
      else break;
    }
  }

  return res.status(200).json({ data, streak });
}
