import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const { type = 'popular_cats', period = 'week' } = req.query;

  try {
    let data: any[] = [];

    if (type === 'popular_cats') {
      // 最受欢迎猫咪
      const daysAgo = period === 'week' ? 7 : period === 'month' ? 30 : 999999;
      const cutoffDate = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString();

      const { data: cats, error } = await supabase
        .from('cat_images')
        .select('id, image_url, emotion_label, likes_count, pet_name, created_at')
        .gte('created_at', cutoffDate)
        .order('likes_count', { ascending: false })
        .limit(10);

      if (error) throw error;

      data = (cats || []).map((cat: any, idx: number) => ({
        rank: idx + 1,
        cat_id: cat.id,
        image_url: cat.image_url,
        emotion_label: cat.emotion_label,
        likes_count: cat.likes_count,
        pet_name: cat.pet_name,
      }));
    } else if (type === 'contributors') {
      // 情绪贡献榜 - 直接从 daily_mood_records 统计
      const { data: records, error } = await supabase
        .from('daily_mood_records')
        .select('user_id, emotion_label');

      if (error) throw error;

      // 统计每个用户上传的数量和最常上传的情绪
      const stats: Record<string, { count: number; emotions: Record<string, number> }> = {};
      (records || []).forEach((r: any) => {
        if (!stats[r.user_id]) {
          stats[r.user_id] = { count: 0, emotions: {} };
        }
        stats[r.user_id].count++;
        stats[r.user_id].emotions[r.emotion_label] = (stats[r.user_id].emotions[r.emotion_label] || 0) + 1;
      });

      // 获取用户信息
      const userIds = Object.keys(stats);
      const { data: users } = userIds.length > 0
        ? await supabase.from('users').select('id, username, display_name, avatar_url').in('id', userIds)
        : { data: [] };

      const userMap: Record<string, any> = {};
      (users || []).forEach((u: any) => { userMap[u.id] = u; });

      // 排序并构建结果
      data = Object.entries(stats)
        .sort((a, b) => b[1].count - a[1].count)
        .slice(0, 10)
        .map(([userId, stat], idx) => {
          const topEmotion = Object.entries(stat.emotions).sort((a, b) => b[1] - a[1])[0];
          return {
            rank: idx + 1,
            user_id: userId,
            user: userMap[userId] || { username: '用户', display_name: '用户' },
            upload_count: stat.count,
            top_emotion: topEmotion ? topEmotion[0] : null,
          };
        });
    } else if (type === 'collectors') {
      // 收藏大师榜
      const { data: collections, error } = await supabase
        .from('user_collections')
        .select('user_id, emotion_label');

      if (error) throw error;

      // 统计每个用户解锁的情绪种类数
      const stats: Record<string, Set<string>> = {};
      (collections || []).forEach((c: any) => {
        if (!stats[c.user_id]) {
          stats[c.user_id] = new Set();
        }
        stats[c.user_id].add(c.emotion_label);
      });

      // 获取用户信息
      const userIds = Object.keys(stats);
      const { data: users } = userIds.length > 0
        ? await supabase.from('users').select('id, username, display_name, avatar_url').in('id', userIds)
        : { data: [] };

      const userMap: Record<string, any> = {};
      (users || []).forEach((u: any) => { userMap[u.id] = u; });

      // 排序并构建结果
      data = Object.entries(stats)
        .sort((a, b) => b[1].size - a[1].size)
        .slice(0, 10)
        .map(([userId, emotions], idx) => ({
          rank: idx + 1,
          user_id: userId,
          user: userMap[userId] || { username: '用户', display_name: '用户' },
          unlocked_count: emotions.size,
          total_count: 26,
        }));
    } else if (type === 'streaks') {
      // 连续打卡榜
      const { data: records, error } = await supabase
        .from('daily_mood_records')
        .select('user_id, date, emotion_label')
        .order('date', { ascending: false });

      if (error) throw error;

      // 计算每个用户的连续打卡天数
      const streaks: Record<string, { streak: number; emotion: string }> = {};
      const today = new Date().toISOString().split('T')[0];

      (records || []).forEach((r: any) => {
        if (!streaks[r.user_id]) {
          streaks[r.user_id] = { streak: 0, emotion: r.emotion_label };
        }
      });

      // 重新计算连续天数
      const userDates: Record<string, string[]> = {};
      (records || []).forEach((r: any) => {
        if (!userDates[r.user_id]) userDates[r.user_id] = [];
        userDates[r.user_id].push(r.date);
      });

      Object.entries(userDates).forEach(([userId, dates]) => {
        const uniqueDates = [...new Set(dates)].sort().reverse();
        let streak = 0;
        for (let i = 0; i < uniqueDates.length; i++) {
          const expected = new Date(today);
          expected.setDate(expected.getDate() - i);
          if (uniqueDates[i] === expected.toISOString().split('T')[0]) {
            streak++;
          } else {
            break;
          }
        }
        if (streak > 0) {
          streaks[userId].streak = streak;
        }
      });

      // 获取用户信息
      const userIds = Object.keys(streaks).filter(uid => streaks[uid].streak > 0);
      const { data: users } = userIds.length > 0
        ? await supabase.from('users').select('id, username, display_name, avatar_url').in('id', userIds)
        : { data: [] };

      const userMap: Record<string, any> = {};
      (users || []).forEach((u: any) => { userMap[u.id] = u; });

      // 排序并构建结果
      data = Object.entries(streaks)
        .filter(([_, s]) => s.streak > 0)
        .sort((a, b) => b[1].streak - a[1].streak)
        .slice(0, 10)
        .map(([userId, stat], idx) => ({
          rank: idx + 1,
          user_id: userId,
          user: userMap[userId] || { username: '用户', display_name: '用户' },
          streak_days: stat.streak,
          current_emotion: stat.emotion,
        }));
    }

    return res.status(200).json({ data });
  } catch (err) {
    console.error('Leaderboard error:', err);
    return res.status(500).json({ error: String(err) });
  }
}
