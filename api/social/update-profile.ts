import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { user_id, social_link } = req.body;
  if (!user_id) return res.status(400).json({ error: 'Missing user_id' });

  const { error } = await supabase
    .from('users')
    .update({ social_link })
    .eq('id', user_id);

  if (error) return res.status(500).json({ error: error.message });
  return res.status(200).json({ success: true });
}
