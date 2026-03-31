import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const RARITY_WEIGHTS = {
  common:  { common: 0.80, rare: 0.15, epic: 0.05 },
  silver:  { common: 0.10, rare: 0.50, epic: 0.35, legendary: 0.05 },
  gold:    { common: 0.00, rare: 0.10, epic: 0.60, legendary: 0.30 },
  rainbow: { common: 0.00, rare: 0.00, epic: 0.20, legendary: 0.80 },
};

function rollRarity(boxRarity: string): string {
  const weights = RARITY_WEIGHTS[boxRarity as keyof typeof RARITY_WEIGHTS] || RARITY_WEIGHTS.common;
  const roll = Math.random();
  let cumulative = 0;
  for (const [rarity, weight] of Object.entries(weights)) {
    cumulative += weight;
    if (roll <= cumulative) return rarity;
  }
  return 'common';
}

export default async function handler(req: any, res: any) {
  if (req.method === 'GET') {
    const { user_id, guest } = req.query;
    
    // 游客模式：随机返回一张猫图
    if (guest === 'true') {
      const { data: cats } = await supabase
        .from('cat_images')
        .select('id, image_url, emotion_label, description')
        .limit(100);

      if (cats && cats.length > 0) {
        const catImage = cats[Math.floor(Math.random() * cats.length)];
        const rewardRarity = rollRarity('common'); // 游客默认普通盲盒
        return res.status(200).json({
          reward_rarity: rewardRarity,
          cat_image: catImage,
          box_rarity: 'common',
        });
      }
      return res.status(404).json({ error: 'No cat images available' });
    }

    if (!user_id) return res.status(400).json({ error: 'Missing user_id' });

    const { data, error } = await supabase
      .from('loot_boxes')
      .select('*')
      .eq('user_id', user_id)
      .order('created_at', { ascending: false });

    if (error) return res.status(500).json({ error: error.message });

    // Enrich opened boxes with their reward cat image via loot_box_rewards if exists
    // For now just return all boxes split by status
    const unopened = (data || []).filter((b: any) => !b.is_opened);
    const opened = (data || []).filter((b: any) => b.is_opened);
    return res.status(200).json({ data: unopened, opened, total: data?.length || 0 });
  }

  if (req.method === 'POST') {
    const { user_id, box_id } = req.body;
    if (!user_id || !box_id) return res.status(400).json({ error: 'Missing fields' });

    // Get the box
    const { data: box, error: boxError } = await supabase
      .from('loot_boxes')
      .select('*')
      .eq('id', box_id)
      .eq('user_id', user_id)
      .eq('is_opened', false)
      .single();

    if (boxError || !box) return res.status(404).json({ error: 'Box not found or already opened' });

    // Roll reward rarity
    const rewardRarity = rollRarity(box.box_rarity);

    // Pick a random cat image
    let catImage = null;
    const { data: cats } = await supabase
      .from('cat_images')
      .select('id, image_url, emotion_label, description')
      .limit(100);

    if (cats && cats.length > 0) {
      catImage = cats[Math.floor(Math.random() * cats.length)];
    }

    // Mark box as opened
    await supabase
      .from('loot_boxes')
      .update({ is_opened: true, opened_at: new Date().toISOString() })
      .eq('id', box_id);

    // Auto-add to collection if cat image found
    if (catImage) {
      await supabase
        .from('user_collections')
        .insert({ user_id, cat_image_id: catImage.id, emotion_label: catImage.emotion_label })
        .select()
        .single();
    }

    return res.status(200).json({
      reward_rarity: rewardRarity,
      cat_image: catImage,
      box_rarity: box.box_rarity,
    });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
