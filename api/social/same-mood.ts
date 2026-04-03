import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: any, res: any) {
  const { action } = req.query;

  // ── TREEHOUSE ──────────────────────────────────────────────────────────
  if (action === 'treehouse') {
    if (req.method === 'GET') {
      const { emotion, limit = '20', offset = '0' } = req.query;
      let query = supabase
        .from('treehouse_posts')
        .select('id, content, emotion_label, is_anonymous, likes_count, created_at, user_id')
        .order('created_at', { ascending: false })
        .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1);
      if (emotion) query = query.eq('emotion_label', emotion);
      const { data, error } = await query;
      if (error) return res.status(500).json({ error: error.message });

      // Fetch usernames for non-anonymous posts
      const publicUserIds = (data || []).filter(p => !p.is_anonymous && p.user_id).map(p => p.user_id);
      const userMap: Record<string, any> = {};
      if (publicUserIds.length > 0) {
        const { data: users } = await supabase.from('users').select('id, username, display_name').in('id', publicUserIds);
        (users || []).forEach((u: any) => { userMap[u.id] = u; });
      }

      // Fetch reply counts
      const postIds = (data || []).map(p => p.id);
      const replyCounts: Record<string, number> = {};
      if (postIds.length > 0) {
        const { data: replies } = await supabase.from('treehouse_replies').select('post_id').in('post_id', postIds);
        (replies || []).forEach((r: any) => { replyCounts[r.post_id] = (replyCounts[r.post_id] || 0) + 1; });
      }

      const enriched = (data || []).map(p => ({
        ...p,
        author: p.is_anonymous ? null : (userMap[p.user_id] || null),
        reply_count: replyCounts[p.id] || 0,
        user_id: undefined, // don't expose user_id for anonymous
      }));
      return res.status(200).json({ data: enriched });
    }

    if (req.method === 'POST') {
      const { user_id, content, emotion_label, is_anonymous = true } = req.body;
      if (!content?.trim()) return res.status(400).json({ error: 'Missing content' });
      const { data, error } = await supabase.from('treehouse_posts').insert({
        user_id: user_id || null,
        content: content.trim().slice(0, 500),
        emotion_label: emotion_label || null,
        is_anonymous,
      }).select('id, content, emotion_label, is_anonymous, likes_count, created_at').single();
      if (error) return res.status(500).json({ error: error.message });
      return res.status(201).json({ data });
    }
  }

  // ── TREEHOUSE REPLIES ──────────────────────────────────────────────────
  if (action === 'treehouse-reply') {
    if (req.method === 'GET') {
      const { post_id } = req.query;
      if (!post_id) return res.status(400).json({ error: 'Missing post_id' });
      const { data, error } = await supabase.from('treehouse_replies')
        .select('id, content, is_anonymous, created_at, user_id')
        .eq('post_id', post_id).order('created_at', { ascending: true });
      if (error) return res.status(500).json({ error: error.message });

      const publicIds = (data || []).filter(r => !r.is_anonymous && r.user_id).map(r => r.user_id);
      const userMap: Record<string, any> = {};
      if (publicIds.length > 0) {
        const { data: users } = await supabase.from('users').select('id, username, display_name').in('id', publicIds);
        (users || []).forEach((u: any) => { userMap[u.id] = u; });
      }
      const enriched = (data || []).map(r => ({ ...r, author: r.is_anonymous ? null : userMap[r.user_id], user_id: undefined }));
      return res.status(200).json({ data: enriched });
    }

    if (req.method === 'POST') {
      const { post_id, user_id, content, is_anonymous = true } = req.body;
      if (!post_id || !content?.trim()) return res.status(400).json({ error: 'Missing fields' });
      const { data, error } = await supabase.from('treehouse_replies').insert({
        post_id, user_id: user_id || null, content: content.trim().slice(0, 300), is_anonymous,
      }).select('id, content, is_anonymous, created_at').single();
      if (error) return res.status(500).json({ error: error.message });
      // Increment likes on the post
      await supabase.rpc('increment_likes', { cat_id: post_id }).catch(() => {
        // fallback: direct update
        supabase.from('treehouse_posts').select('likes_count').eq('id', post_id).single()
          .then(({ data: p }) => supabase.from('treehouse_posts').update({ likes_count: (p?.likes_count || 0) + 1 }).eq('id', post_id));
      });
      return res.status(201).json({ data });
    }
  }

  // ── TREEHOUSE LIKE ─────────────────────────────────────────────────────
  if (action === 'treehouse-like' && req.method === 'POST') {
    const { post_id } = req.body;
    if (!post_id) return res.status(400).json({ error: 'Missing post_id' });
    // Direct increment
    const { data: p } = await supabase.from('treehouse_posts').select('likes_count').eq('id', post_id).single();
    await supabase.from('treehouse_posts').update({ likes_count: (p?.likes_count || 0) + 1 }).eq('id', post_id);
    return res.status(200).json({ success: true });
  }

  // ── SAME MOOD (default) ────────────────────────────────────────────────
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
