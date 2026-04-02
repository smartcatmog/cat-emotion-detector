import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Rarity thresholds based on emotion scarcity in the DB
// Called after a new cat image is inserted
export async function assignRarity(catImageId: string, emotionLabel: string): Promise<string> {
  // Count how many images exist for this emotion (scarcity = rarer)
  const { count: emotionCount } = await supabase
    .from('cat_images')
    .select('id', { count: 'exact', head: true })
    .eq('emotion_label', emotionLabel);

  // Count total images
  const { count: totalCount } = await supabase
    .from('cat_images')
    .select('id', { count: 'exact', head: true });

  const total = totalCount || 1;
  const forEmotion = emotionCount || 0;
  const scarcityRatio = forEmotion / total; // low = scarce = rarer

  let rarity: string;
  if (scarcityRatio < 0.02 || forEmotion <= 2) {
    rarity = 'legendary'; // emotion has almost no images
  } else if (scarcityRatio < 0.05 || forEmotion <= 5) {
    rarity = 'epic';
  } else if (scarcityRatio < 0.10 || forEmotion <= 10) {
    rarity = 'rare';
  } else {
    rarity = 'common';
  }

  await supabase.from('cat_images').update({ rarity }).eq('id', catImageId);
  return rarity;
}

// Award a badge if not already earned, and create a notification
async function awardBadge(userId: string, badgeId: string) {
  const { error } = await supabase
    .from('user_badges')
    .insert({ user_id: userId, badge_id: badgeId })
    .select()
    .single();
  return !error; // false if already earned (unique constraint)
}

async function createNotification(
  userId: string,
  type: string,
  title: string,
  body: string,
  catImageId?: string
) {
  await supabase.from('notifications').insert({ user_id: userId, type, title, body, cat_image_id: catImageId || null });
}

// Called when someone likes a cat image
export async function onLike(catImageId: string) {
  // Get owner + new like count
  const { data: cat } = await supabase
    .from('cat_images')
    .select('uploaded_by, likes_count, pet_name')
    .eq('id', catImageId)
    .single();

  if (!cat?.uploaded_by) return;

  const likes = (cat.likes_count || 0) + 1;
  const catName = cat.pet_name || '你的猫咪';

  // Notify owner
  await createNotification(
    cat.uploaded_by,
    'like',
    '有人点赞了你的猫图 ❤️',
    `${catName} 获得了新的点赞！现在共 ${likes} 个赞`,
    catImageId
  );

  // Badge milestones
  const milestones: Record<number, string> = { 2: 'likes_2', 5: 'likes_5', 10: 'likes_10' };
  if (milestones[likes]) {
    const earned = await awardBadge(cat.uploaded_by, milestones[likes]);
    if (earned) {
      const BADGE_NAMES: Record<string, string> = { likes_2: '初露锋芒 ⭐', likes_5: '人气猫主 🌟', likes_10: '猫界网红 💫' };
      await createNotification(
        cat.uploaded_by,
        'badge',
        `解锁徽章：${BADGE_NAMES[milestones[likes]]}`,
        `恭喜！你的猫图累计获得 ${likes} 个点赞`,
        catImageId
      );
    }
  }
}

// Called when someone collects a cat image
export async function onCollect(catImageId: string) {
  const { data: cat } = await supabase
    .from('cat_images')
    .select('uploaded_by, collection_count, pet_name')
    .eq('id', catImageId)
    .single();

  if (!cat?.uploaded_by) return;

  const count = (cat.collection_count || 0) + 1;
  await supabase.from('cat_images').update({ collection_count: count }).eq('id', catImageId);

  const catName = cat.pet_name || '你的猫咪';
  await createNotification(
    cat.uploaded_by,
    'collect',
    '有人收藏了你的猫图 🗂️',
    `${catName} 被加入了别人的图鉴！共被收藏 ${count} 次`,
    catImageId
  );

  const milestones: Record<number, string> = { 1: 'collect_1', 5: 'collect_5' };
  if (milestones[count]) {
    const earned = await awardBadge(cat.uploaded_by, milestones[count]);
    if (earned) {
      await createNotification(
        cat.uploaded_by,
        'badge',
        count === 1 ? '解锁徽章：被人收藏 🗂️' : '解锁徽章：收藏达人 📚',
        `你的猫图已被收藏 ${count} 次！`,
        catImageId
      );
    }
  }
}

// Called when a cat image is matched to someone's mood
export async function onResonance(catImageId: string) {
  const { data: cat } = await supabase
    .from('cat_images')
    .select('uploaded_by, resonance_count, pet_name')
    .eq('id', catImageId)
    .single();

  if (!cat?.uploaded_by) return;

  const count = (cat.resonance_count || 0) + 1;
  await supabase.from('cat_images').update({ resonance_count: count }).eq('id', catImageId);

  const catName = cat.pet_name || '你的猫咪';

  // Only notify on first resonance and every 5 after
  if (count === 1 || count % 5 === 0) {
    await createNotification(
      cat.uploaded_by,
      'resonance',
      '有人和你的猫咪产生了共鸣 😸',
      `${catName} 今天被匹配到了！已共鸣 ${count} 次`,
      catImageId
    );
  }

  const milestones: Record<number, string> = { 1: 'resonance_1', 10: 'resonance_10' };
  if (milestones[count]) {
    await awardBadge(cat.uploaded_by, milestones[count]);
  }
}

// Called after rarity is assigned
export async function onRarityAssigned(userId: string, catImageId: string, rarity: string) {
  const rarityBadge: Record<string, string> = {
    rare: 'rarity_rare',
    epic: 'rarity_epic',
    legendary: 'rarity_legendary',
  };
  if (!rarityBadge[rarity]) return;

  const earned = await awardBadge(userId, rarityBadge[rarity]);
  if (earned) {
    const RARITY_NAMES: Record<string, string> = {
      rare: '稀有 💠',
      epic: '史诗 💎',
      legendary: '传说 🏆',
    };
    await createNotification(
      userId,
      'badge',
      `你的猫图是${RARITY_NAMES[rarity]}品质！`,
      `这个情绪在图库中非常稀缺，你的猫图获得了${RARITY_NAMES[rarity]}稀有度`,
      catImageId
    );
  }
}

// GET /api/social/notify — fetch unread notifications
export default async function handler(req: any, res: any) {
  if (req.method === 'GET') {
    const { user_id } = req.query;
    if (!user_id) return res.status(400).json({ error: 'Missing user_id' });

    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user_id)
      .order('created_at', { ascending: false })
      .limit(30);

    return res.status(200).json({ data: data || [] });
  }

  // POST — mark as read
  if (req.method === 'POST') {
    const { user_id, notification_id } = req.body;
    if (!user_id) return res.status(400).json({ error: 'Missing user_id' });

    const query = notification_id
      ? supabase.from('notifications').update({ is_read: true }).eq('id', notification_id)
      : supabase.from('notifications').update({ is_read: true }).eq('user_id', user_id).eq('is_read', false);

    await query;
    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
