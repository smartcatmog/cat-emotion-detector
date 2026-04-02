import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: any, res: any) {
  const { cat_image_id } = req.method === 'GET' ? req.query : req.body;
  if (!cat_image_id) return res.status(400).json({ error: 'Missing cat_image_id' });

  // GET: fetch comments
  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('comments')
      .select(`
        id, content, created_at, parent_comment_id,
        users ( id, username, display_name )
      `)
      .eq('cat_image_id', cat_image_id)
      .order('created_at', { ascending: true })
      .limit(100);

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ data: data || [] });
  }

  // POST: add comment
  if (req.method === 'POST') {
    const { user_id, content, parent_comment_id } = req.body;
    if (!user_id || !content?.trim()) return res.status(400).json({ error: 'Missing user_id or content' });

    const { data, error } = await supabase
      .from('comments')
      .insert({
        cat_image_id,
        user_id,
        content: content.trim().slice(0, 500),
        parent_comment_id: parent_comment_id || null,
      })
      .select(`
        id, content, created_at, parent_comment_id,
        users ( id, username, display_name )
      `)
      .single();

    if (error) return res.status(500).json({ error: error.message });
    return res.status(201).json({ data });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
