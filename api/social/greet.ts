import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Supported greeting actions
const VALID_ACTIONS = ['poke', 'hug', 'cheer', 'pat', 'wave'];

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { from_user_id, to_user_id, action, emotion_label } = req.body;
  if (!from_user_id || !to_user_id || !action) return res.status(400).json({ error: 'Missing fields' });
  if (!VALID_ACTIONS.includes(action)) return res.status(400).json({ error: 'Invalid action' });
  if (from_user_id === to_user_id) return res.status(400).json({ error: 'Cannot greet yourself' });

  // Rate limit: max 3 greetings to same person per day
  const today = new Date().toISOString().split('T')[0];
  const { count } = await supabase
    .from('greetings')
    .select('id', { count: 'exact', head: true })
    .eq('from_user_id', from_user_id)
    .eq('to_user_id', to_user_id)
    .gte('created_at', `${today}T00:00:00Z`);

  if ((count || 0) >= 3) return res.status(429).json({ error: 'Too many greetings today' });

  const { error } = await supabase.from('greetings').insert({
    from_user_id,
    to_user_id,
    action,
    emotion_label: emotion_label || null,
  });

  if (error) return res.status(500).json({ error: error.message });
  return res.status(201).json({ success: true });
}
