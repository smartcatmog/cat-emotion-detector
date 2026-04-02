import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: any, res: any) {

  // GET /api/social/messages?user_id=X&with=Y  → conversation thread
  // GET /api/social/messages?user_id=X          → all conversations (inbox)
  if (req.method === 'GET') {
    const { user_id, with: withUser } = req.query;
    if (!user_id) return res.status(400).json({ error: 'Missing user_id' });

    if (withUser) {
      // Fetch full conversation between two users
      const { data, error } = await supabase
        .from('messages')
        .select('id, from_user_id, to_user_id, content, is_read, created_at')
        .or(
          `and(from_user_id.eq.${user_id},to_user_id.eq.${withUser}),` +
          `and(from_user_id.eq.${withUser},to_user_id.eq.${user_id})`
        )
        .order('created_at', { ascending: true })
        .limit(100);

      if (error) return res.status(500).json({ error: error.message });

      // Mark incoming messages as read
      await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('to_user_id', user_id)
        .eq('from_user_id', withUser)
        .eq('is_read', false);

      return res.status(200).json({ data: data || [] });
    }

    // Inbox: latest message per conversation partner
    const { data, error } = await supabase
      .from('messages')
      .select('id, from_user_id, to_user_id, content, is_read, created_at')
      .or(`from_user_id.eq.${user_id},to_user_id.eq.${user_id}`)
      .order('created_at', { ascending: false })
      .limit(200);

    if (error) return res.status(500).json({ error: error.message });

    // Deduplicate: keep latest message per conversation partner
    const seen = new Set<string>();
    const conversations: any[] = [];
    for (const msg of (data || [])) {
      const partnerId = msg.from_user_id === user_id ? msg.to_user_id : msg.from_user_id;
      if (!seen.has(partnerId)) {
        seen.add(partnerId);
        conversations.push({ ...msg, partner_id: partnerId });
      }
    }

    // Fetch partner user info
    const partnerIds = conversations.map(c => c.partner_id);
    const { data: users } = partnerIds.length > 0
      ? await supabase.from('users').select('id, username, display_name').in('id', partnerIds)
      : { data: [] };
    const userMap: Record<string, any> = {};
    (users || []).forEach((u: any) => { userMap[u.id] = u; });

    // Unread count per partner
    const { data: unreadData } = await supabase
      .from('messages')
      .select('from_user_id')
      .eq('to_user_id', user_id)
      .eq('is_read', false);
    const unreadCount: Record<string, number> = {};
    (unreadData || []).forEach((m: any) => {
      unreadCount[m.from_user_id] = (unreadCount[m.from_user_id] || 0) + 1;
    });

    const enriched = conversations.map(c => ({
      ...c,
      partner: userMap[c.partner_id] || { id: c.partner_id, username: '用户', display_name: '用户' },
      unread: unreadCount[c.partner_id] || 0,
    }));

    return res.status(200).json({ data: enriched });
  }

  // POST — send a message
  if (req.method === 'POST') {
    const { from_user_id, to_user_id, content } = req.body;
    if (!from_user_id || !to_user_id || !content?.trim())
      return res.status(400).json({ error: 'Missing fields' });
    if (from_user_id === to_user_id)
      return res.status(400).json({ error: 'Cannot message yourself' });

    const { data, error } = await supabase
      .from('messages')
      .insert({ from_user_id, to_user_id, content: content.trim().slice(0, 1000) })
      .select('id, from_user_id, to_user_id, content, is_read, created_at')
      .single();

    if (error) return res.status(500).json({ error: error.message });

    // Create notification for recipient
    const { data: sender } = await supabase
      .from('users')
      .select('username, display_name')
      .eq('id', from_user_id)
      .single();
    const senderName = sender?.display_name || sender?.username || '有人';

    await supabase.from('notifications').insert({
      user_id: to_user_id,
      type: 'message',
      title: `${senderName} 给你发了消息 💬`,
      body: content.trim().slice(0, 80),
      cat_image_id: null,
    });

    return res.status(201).json({ data });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
