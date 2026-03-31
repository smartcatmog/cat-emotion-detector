-- user_collections 表：用户收藏图鉴
-- 用户可以收藏猫图，按情绪标签分类
-- 支持收集图鉴功能，每种情绪可以收集多张猫图

CREATE TABLE IF NOT EXISTS user_collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  cat_image_id UUID NOT NULL REFERENCES cat_images(id) ON DELETE CASCADE,
  emotion_label TEXT NOT NULL,
  collected_at TIMESTAMPTZ DEFAULT now(),
  
  -- 确保同一用户不能重复收藏同一张猫图
  CONSTRAINT unique_user_cat_image UNIQUE(user_id, cat_image_id)
);

-- 创建索引以优化查询性能
-- 用于查询用户的收藏（按情绪标签分组）
CREATE INDEX IF NOT EXISTS idx_user_collections_user ON user_collections(user_id, emotion_label);

-- 用于查询特定猫图的收藏数量
CREATE INDEX IF NOT EXISTS idx_user_collections_cat_image ON user_collections(cat_image_id);

-- 启用 Row Level Security (RLS)
ALTER TABLE user_collections ENABLE ROW LEVEL SECURITY;

-- RLS 策略：所有人可以读取收藏记录（用于展示收藏数量等）
CREATE POLICY "Anyone can read collections" ON user_collections
  FOR SELECT USING (true);

-- RLS 策略：用户只能插入自己的收藏
CREATE POLICY "Users can insert their own collections" ON user_collections
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS 策略：用户只能删除自己的收藏
CREATE POLICY "Users can delete their own collections" ON user_collections
  FOR DELETE USING (auth.uid() = user_id);

-- 注释说明
COMMENT ON TABLE user_collections IS '用户收藏图鉴表';
COMMENT ON COLUMN user_collections.user_id IS '用户ID（外键关联 users 表）';
COMMENT ON COLUMN user_collections.cat_image_id IS '猫图ID（外键关联 cat_images 表）';
COMMENT ON COLUMN user_collections.emotion_label IS '情绪标签（用于按情绪分类收藏）';
COMMENT ON COLUMN user_collections.collected_at IS '收藏时间';
COMMENT ON CONSTRAINT unique_user_cat_image ON user_collections IS '确保同一用户不能重复收藏同一张猫图';
