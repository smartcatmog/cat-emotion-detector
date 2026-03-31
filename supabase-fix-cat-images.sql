-- 修复 cat_images 表的 emotion_label 约束，扩展到 26 种情绪
-- 同时添加 likes 字段（用于排序）

-- 删除旧的约束
ALTER TABLE cat_images DROP CONSTRAINT IF EXISTS cat_images_emotion_label_check;

-- 添加新的约束（26 种情绪）
ALTER TABLE cat_images ADD CONSTRAINT cat_images_emotion_label_check
  CHECK (emotion_label IN (
    'happy','calm','sleepy','curious','annoyed','anxious','resigned','dramatic',
    'sassy','clingy','zoomies','suspicious','smug','confused','hangry','sad',
    'angry','scared','disgusted','surprised','loved','bored','ashamed','tired',
    'disappointed','melancholy'
  ));

-- 添加 likes 字段（如果不存在）
ALTER TABLE cat_images ADD COLUMN IF NOT EXISTS likes INTEGER DEFAULT 0;
