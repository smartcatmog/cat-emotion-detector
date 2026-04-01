import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const { user_id, emotion_label } = req.query;
  if (!emotion_label) return res.status(400).json({ error: 'Missing emotion_label' });

  const today = new Date().toISOString().split('T')[0];

  // Get all users with same emotion today
  let query = supabase
    .from('daily_mood_records')
    .select('user_id, mood_text, cat_image_id, created_at')
    .eq('date', today)
    .eq('emotion_label', emotion_label)
    .order('created_at', { ascending: false })
    .limit(50);

  if (user_id) query = query.neq('user_id', user_id) as any;

  const { data, error } = await query;
  if (error) return res.status(500).json({ error: error.message });

  const records = data || [];

  // Batch fetch users and cat images
  const userIds = [...new Set(records.map((r: any) => r.user_id))];
  const catIds = [...new Set(records.map((r: any) => r.cat_image_id).filter(Boolean))];

  const [usersRes, catsRes] = await Promise.all([
    userIds.length > 0
      ? supabase.from('users').select('id, username, display_name, avatar_url, social_link').in('id', userIds)
      : Promise.resolve({ data: [] }),
    catIds.length > 0
      ? supabase.from('cat_images').select('id, image_url, description').in('id', catIds)
      : Promise.resolve({ data: [] }),
  ]);

  const userMap: Record<string, any> = {};
  (usersRes.data || []).forEach((u: any) => { userMap[u.id] = u; });
  const catMap: Record<string, any> = {};
  (catsRes.data || []).forEach((c: any) => { catMap[c.id] = c; });

  // 计算每个用户连续打卡这个情绪的天数
  const streakMap: Record<string, number> = {};
  if (userIds.length > 0) {
    const { data: recentRecords } = await supabase
      .from('daily_mood_records')
      .select('user_id, date, emotion_label')
      .in('user_id', userIds)
      .eq('emotion_label', emotion_label)
      .gte('date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
      .order('date', { ascending: false });

    if (recentRecords) {
      userIds.forEach((uid: string) => {
        const userDates = recentRecords
          .filter((r: any) => r.user_id === uid)
          .map((r: any) => r.date)
          .sort()
          .reverse();
        let streak = 0;
        for (let i = 0; i < userDates.length; i++) {
          const expected = new Date(today);
          expected.setDate(expected.getDate() - i);
          if (userDates[i] === expected.toISOString().split('T')[0]) streak++;
          else break;
        }
        streakMap[uid] = streak;
      });
    }
  }

  const enriched = records.map((record: any) => ({
    ...record,
    users: userMap[record.user_id] || {
      display_name: `用户${record.user_id.substring(0, 6)}`,
      username: `用户${record.user_id.substring(0, 6)}`,
      social_link: null,
    },
    cat_image: record.cat_image_id ? catMap[record.cat_image_id] || null : null,
    streak: streakMap[record.user_id] || 1,
  }));

  return res.status(200).json({ data: enriched, count: enriched.length });
}
