import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { user_id, emotion_label, cat_image_id, mood_text } = req.body;
  if (!user_id || !emotion_label) return res.status(400).json({ error: 'Missing required fields' });

  const today = new Date().toISOString().split('T')[0];

  // Upsert today's mood record
  const { data, error } = await supabase
    .from('daily_mood_records')
    .upsert({ user_id, date: today, emotion_label, cat_image_id: cat_image_id || null, mood_text: mood_text || null },
      { onConflict: 'user_id,date' })
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });

  // Find same-mood users today and create match records
  const { data: sameUsers } = await supabase
    .from('daily_mood_records')
    .select('user_id')
    .eq('date', today)
    .eq('emotion_label', emotion_label)
    .neq('user_id', user_id);

  if (sameUsers && sameUsers.length > 0) {
    const matches = sameUsers.map((u: any) => ({
      user_id,
      matched_user_id: u.user_id,
      emotion_label,
      match_date: today,
    }));
    await supabase.from('same_mood_matches').upsert(matches, { ignoreDuplicates: true });
  }

  // Grant daily lootbox if not already given today
  const { data: existingBox } = await supabase
    .from('loot_boxes')
    .select('id')
    .eq('user_id', user_id)
    .eq('box_type', 'daily_free')
    .gte('created_at', `${today}T00:00:00`)
    .single();

  let lootbox = null;
  if (!existingBox) {
    const { data: box } = await supabase
      .from('loot_boxes')
      .insert({ user_id, box_type: 'daily_free', box_rarity: 'common', source: '每日打卡' })
      .select()
      .single();
    lootbox = box;
  }

  return res.status(200).json({ data, same_mood_count: sameUsers?.length || 0, lootbox });
}
