-- ============================================================
-- Rewards system: rarity, notifications, badges
-- ============================================================

-- 1. Add rarity + upload_owner to cat_images
ALTER TABLE cat_images
  ADD COLUMN IF NOT EXISTS rarity TEXT DEFAULT 'common'
    CHECK (rarity IN ('common','rare','epic','legendary')),
  ADD COLUMN IF NOT EXISTS uploaded_by UUID REFERENCES users(id),
  ADD COLUMN IF NOT EXISTS resonance_count INTEGER DEFAULT 0,  -- times matched to someone's mood
  ADD COLUMN IF NOT EXISTS collection_count INTEGER DEFAULT 0; -- times collected into someone's library

-- 2. Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,  -- 'resonance' | 'like' | 'collect' | 'badge'
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  cat_image_id UUID REFERENCES cat_images(id) ON DELETE SET NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, is_read, created_at DESC);

-- 3. Badges table
CREATE TABLE IF NOT EXISTS badges (
  id TEXT PRIMARY KEY,  -- e.g. 'likes_2', 'likes_5', 'likes_10', 'collector_1', 'rarity_epic'
  name_zh TEXT NOT NULL,
  name_en TEXT NOT NULL,
  icon TEXT NOT NULL,   -- emoji
  description_zh TEXT,
  description_en TEXT
);

INSERT INTO badges (id, name_zh, name_en, icon, description_zh, description_en) VALUES
  ('likes_2',      '初露锋芒',   'Rising Star',    '⭐', '获得 2 个点赞',        'Received 2 likes'),
  ('likes_5',      '人气猫主',   'Popular Owner',  '🌟', '获得 5 个点赞',        'Received 5 likes'),
  ('likes_10',     '猫界网红',   'Cat Influencer', '💫', '获得 10 个点赞',       'Received 10 likes'),
  ('collect_1',    '被人收藏',   'First Collect',  '🗂️', '猫图首次被收藏',       'Your cat was collected'),
  ('collect_5',    '收藏达人',   'Fan Favorite',   '📚', '猫图被收藏 5 次',      'Collected 5 times'),
  ('resonance_1',  '初次共鸣',   'First Resonance','💞', '猫图首次被心情匹配',   'First mood match'),
  ('resonance_10', '情绪共鸣者', 'Mood Resonator', '🫀', '猫图被匹配 10 次',     'Matched 10 times'),
  ('rarity_rare',  '稀有猫主',   'Rare Owner',     '💠', '上传了一张稀有猫图',   'Uploaded a rare cat'),
  ('rarity_epic',  '史诗猫主',   'Epic Owner',     '💎', '上传了一张史诗猫图',   'Uploaded an epic cat'),
  ('rarity_legendary', '传说猫主','Legendary Owner','🏆', '上传了一张传说猫图',  'Uploaded a legendary cat')
ON CONFLICT (id) DO NOTHING;

-- 4. User badges (earned)
CREATE TABLE IF NOT EXISTS user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  badge_id TEXT NOT NULL REFERENCES badges(id),
  earned_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, badge_id)
);
CREATE INDEX IF NOT EXISTS idx_user_badges_user ON user_badges(user_id, earned_at DESC);

-- 5. RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "notif_select" ON notifications FOR SELECT USING (true);
CREATE POLICY "notif_insert" ON notifications FOR INSERT WITH CHECK (true);
CREATE POLICY "notif_update" ON notifications FOR UPDATE USING (true);

ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "badges_select" ON user_badges FOR SELECT USING (true);
CREATE POLICY "badges_insert" ON user_badges FOR INSERT WITH CHECK (true);
