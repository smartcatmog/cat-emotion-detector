import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const ALL_EMOTIONS = [
  'happy','calm','sleepy','curious','annoyed','anxious','resigned','dramatic',
  'sassy','clingy','zoomies','suspicious','smug','confused','hangry','sad',
  'angry','scared','disgusted','surprised','loved','bored','ashamed','tired',
  'disappointed','melancholy'
];

export default async function handler(req: any, res: any) {
  if (req.method === 'GET') {
    const { user_id } = req.query;
    if (!user_id) return res.status(400).json({ error: 'Missing user_id' });

    const { data, error } = await supabase
      .from('user_collections')
      .select('emotion_label, cat_image_id, collected_at')
      .eq('user_id', user_id)
      .order('collected_at', { ascending: false });

    if (error) return res.status(500).json({ error: error.message });

    // Batch fetch cat images to avoid N+1
    const catImageIds = [...new Set((data || []).map((item: any) => item.cat_image_id).filter(Boolean))];
    const { data: catImages } = catImageIds.length > 0
      ? await supabase.from('cat_images').select('id, image_url, description, is_nft, nft_token_id, nft_rarity').in('id', catImageIds)
      : { data: [] };
    const catImageMap: Record<string, any> = {};
    (catImages || []).forEach((img: any) => { catImageMap[img.id] = img; });

    const enriched = (data || []).map((item: any) => ({
      ...item,
      cat_images: catImageMap[item.cat_image_id] || null,
    }));

    // Group by emotion
    const byEmotion: Record<string, any[]> = {};
    ALL_EMOTIONS.forEach(e => { byEmotion[e] = []; });
    enriched.forEach((item: any) => {
      if (byEmotion[item.emotion_label]) byEmotion[item.emotion_label].push(item);
    });

    const unlocked = Object.keys(byEmotion).filter(e => byEmotion[e].length > 0).length;

    return res.status(200).json({ by_emotion: byEmotion, total: enriched.length, unlocked, total_emotions: ALL_EMOTIONS.length });
  }

  if (req.method === 'POST') {
    const { user_id, cat_image_id, emotion_label } = req.body;
    if (!user_id || !cat_image_id || !emotion_label) return res.status(400).json({ error: 'Missing fields' });

    const { data, error } = await supabase
      .from('user_collections')
      .insert({ user_id, cat_image_id, emotion_label })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') return res.status(409).json({ error: 'Already collected' });
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ data });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
