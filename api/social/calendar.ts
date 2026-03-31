import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const { user_id, year, month } = req.query;
  if (!user_id) return res.status(400).json({ error: 'Missing user_id' });

  const y = parseInt(year) || new Date().getFullYear();
  const m = parseInt(month) || new Date().getMonth() + 1;
  const from = `${y}-${String(m).padStart(2, '0')}-01`;
  const to = `${y}-${String(m).padStart(2, '0')}-31`;

  const { data, error } = await supabase
    .from('daily_mood_records')
    .select('date, emotion_label, mood_text, cat_image_id')
    .eq('user_id', user_id)
    .gte('date', from)
    .lte('date', to)
    .order('date');

  if (error) return res.status(500).json({ error: error.message });

  // Calculate streak
  const { data: allRecords } = await supabase
    .from('daily_mood_records')
    .select('date')
    .eq('user_id', user_id)
    .order('date', { ascending: false });

  let streak = 0;
  if (allRecords && allRecords.length > 0) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    for (let i = 0; i < allRecords.length; i++) {
      const d = new Date(allRecords[i].date);
      const expected = new Date(today);
      expected.setDate(today.getDate() - i);
      if (d.toISOString().split('T')[0] === expected.toISOString().split('T')[0]) {
        streak++;
      } else break;
    }
  }

  return res.status(200).json({ data, streak });
}
