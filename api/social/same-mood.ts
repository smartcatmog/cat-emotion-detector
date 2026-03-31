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
  const query = supabase
    .from('daily_mood_records')
    .select('user_id, mood_text, cat_image_id, created_at')
    .eq('date', today)
    .eq('emotion_label', emotion_label)
    .order('created_at', { ascending: false })
    .limit(50);

  if (user_id) query.neq('user_id', user_id);

  const { data, error } = await query;
  if (error) return res.status(500).json({ error: error.message });

  // Enrich with user profile and cat image
  const enriched = await Promise.all((data || []).map(async (record: any) => {
    const [userRes, catRes] = await Promise.all([
      supabase.from('users').select('username, display_name, avatar_url').eq('id', record.user_id).single(),
      record.cat_image_id
        ? supabase.from('cat_images').select('image_url, description').eq('id', record.cat_image_id).single()
        : Promise.resolve({ data: null }),
    ]);
    return { ...record, users: userRes.data, cat_image: catRes.data };
  }));

  return res.status(200).json({ data: enriched, count: enriched.length });
}
