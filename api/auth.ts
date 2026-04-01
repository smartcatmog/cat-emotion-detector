import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { action, email, password, username } = req.body;

  if (!supabaseUrl || !supabaseAnonKey) {
    return res.status(500).json({ error: 'Server configuration error' });
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  try {
    if (action === 'signup') {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) return res.status(400).json({ error: error.message });

      if (data.user) {
        // Create user profile
        const { error: insertError } = await supabase.from('users').insert({
          id: data.user.id,
          email,
          username,
          display_name: username,
        });
        if (insertError && insertError.code !== '23505') {
          console.error('Profile insert error:', insertError);
        }
        return res.status(200).json({ user: data.user, session: data.session });
      }
      return res.status(200).json({ message: 'Check your email to confirm registration' });
    }

    if (action === 'signin') {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        console.error('[auth] signin error:', error.message, error.status);
        return res.status(400).json({ error: error.message });
      }
      return res.status(200).json({ user: data.user, session: data.session });
    }

    return res.status(400).json({ error: 'Invalid action' });
  } catch (err: any) {
    console.error('Auth error:', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}
