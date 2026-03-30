-- cat_images 表：存储猫图片和情绪标签
CREATE TABLE IF NOT EXISTS cat_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  image_url TEXT NOT NULL,
  emotion_label TEXT NOT NULL CHECK (emotion_label IN ('happy', 'calm', 'sleepy', 'curious', 'annoyed', 'anxious', 'resigned')),
  confidence INTEGER NOT NULL CHECK (confidence >= 0 AND confidence <= 100),
  description TEXT NOT NULL DEFAULT '',
  pet_name TEXT,
  social_link TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 按情绪标签查询的索引
CREATE INDEX IF NOT EXISTS idx_cat_images_emotion ON cat_images(emotion_label);

-- 允许匿名读写（MVP 阶段）
ALTER TABLE cat_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow anonymous read" ON cat_images FOR SELECT USING (true);
CREATE POLICY "Allow anonymous insert" ON cat_images FOR INSERT WITH CHECK (true);
