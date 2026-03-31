-- loot_boxes 表：情绪盲盒系统
-- 用户可以通过每日免费、任务完成、社交互动等方式获得盲盒
-- 盲盒包含不同稀有度的猫图、徽章、称号、道具等奖励

CREATE TABLE IF NOT EXISTS loot_boxes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  box_type TEXT NOT NULL,
  box_rarity TEXT NOT NULL,
  source TEXT NOT NULL,
  is_opened BOOLEAN DEFAULT FALSE,
  opened_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ,
  
  -- 盲盒类型约束：每日免费、任务、社交、特殊
  CONSTRAINT valid_box_type CHECK (box_type IN ('daily_free', 'task', 'social', 'special')),
  
  -- 盲盒稀有度约束：普通、银色、金色、彩虹
  CONSTRAINT valid_box_rarity CHECK (box_rarity IN ('common', 'silver', 'gold', 'rainbow'))
);

-- 创建索引以优化查询性能
-- 用于查询用户的盲盒库存（按开启状态分类）
CREATE INDEX IF NOT EXISTS idx_loot_boxes_user ON loot_boxes(user_id, is_opened);

-- 用于查询过期的盲盒（定时清理任务）
CREATE INDEX IF NOT EXISTS idx_loot_boxes_expires ON loot_boxes(expires_at) WHERE expires_at IS NOT NULL;

-- 用于查询未开启的盲盒（按创建时间排序）
CREATE INDEX IF NOT EXISTS idx_loot_boxes_unopened ON loot_boxes(user_id, created_at DESC) WHERE is_opened = FALSE;

-- 启用 Row Level Security (RLS)
ALTER TABLE loot_boxes ENABLE ROW LEVEL SECURITY;

-- RLS 策略：用户只能读取自己的盲盒
CREATE POLICY "Users can read their own loot boxes" ON loot_boxes
  FOR SELECT USING (auth.uid() = user_id);

-- RLS 策略：系统可以插入盲盒（通过服务端 API）
CREATE POLICY "Service role can insert loot boxes" ON loot_boxes
  FOR INSERT WITH CHECK (true);

-- RLS 策略：用户只能更新自己的盲盒（开启盲盒）
CREATE POLICY "Users can update their own loot boxes" ON loot_boxes
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 注释说明
COMMENT ON TABLE loot_boxes IS '情绪盲盒表，用户通过各种方式获得的盲盒';
COMMENT ON COLUMN loot_boxes.user_id IS '用户ID（外键关联 users 表）';
COMMENT ON COLUMN loot_boxes.box_type IS '盲盒类型：daily_free（每日免费）、task（任务）、social（社交）、special（特殊）';
COMMENT ON COLUMN loot_boxes.box_rarity IS '盲盒稀有度：common（普通）、silver（银色）、gold（金色）、rainbow（彩虹）';
COMMENT ON COLUMN loot_boxes.source IS '盲盒来源描述（如"连续打卡3天"、"完成每日挑战"）';
COMMENT ON COLUMN loot_boxes.is_opened IS '是否已开启';
COMMENT ON COLUMN loot_boxes.opened_at IS '开启时间';
COMMENT ON COLUMN loot_boxes.created_at IS '盲盒创建时间';
COMMENT ON COLUMN loot_boxes.expires_at IS '过期时间（每日免费盲盒会过期，其他类型可为空）';

