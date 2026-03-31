-- daily_mood_records 表：情绪日历每日打卡记录
-- 用户每天可以记录一次心情（上传猫图或匹配心情）
-- 支持情绪日历、连续打卡统计、同心情匹配等功能

CREATE TABLE IF NOT EXISTS daily_mood_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  emotion_label TEXT NOT NULL,
  cat_image_id UUID REFERENCES cat_images(id) ON DELETE SET NULL,
  mood_text TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  
  -- 确保每个用户每天只能记录一次心情
  CONSTRAINT unique_user_date UNIQUE(user_id, date)
);

-- 创建索引以优化查询性能
-- 用于查询用户的日历记录（按日期倒序）
CREATE INDEX IF NOT EXISTS idx_daily_mood_user_date ON daily_mood_records(user_id, date DESC);

-- 用于查询特定日期和情绪的所有用户（同心情匹配功能）
CREATE INDEX IF NOT EXISTS idx_daily_mood_date_emotion ON daily_mood_records(date, emotion_label);

-- 用于按情绪标签查询（情绪统计功能）
CREATE INDEX IF NOT EXISTS idx_daily_mood_emotion ON daily_mood_records(emotion_label);

-- 启用 Row Level Security (RLS)
ALTER TABLE daily_mood_records ENABLE ROW LEVEL SECURITY;

-- RLS 策略：所有人可以读取心情记录（用于同心情匹配和社区功能）
CREATE POLICY "Anyone can read mood records" ON daily_mood_records
  FOR SELECT USING (true);

-- RLS 策略：用户只能插入自己的心情记录
CREATE POLICY "Users can insert their own mood records" ON daily_mood_records
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS 策略：用户只能更新自己的心情记录
CREATE POLICY "Users can update their own mood records" ON daily_mood_records
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS 策略：用户只能删除自己的心情记录
CREATE POLICY "Users can delete their own mood records" ON daily_mood_records
  FOR DELETE USING (auth.uid() = user_id);

-- 注释说明
COMMENT ON TABLE daily_mood_records IS '情绪日历每日打卡记录表';
COMMENT ON COLUMN daily_mood_records.user_id IS '用户ID（外键关联 users 表）';
COMMENT ON COLUMN daily_mood_records.date IS '记录日期（每个用户每天只能记录一次）';
COMMENT ON COLUMN daily_mood_records.emotion_label IS '情绪标签（26种情绪之一）';
COMMENT ON COLUMN daily_mood_records.cat_image_id IS '关联的猫图ID（外键关联 cat_images 表）';
COMMENT ON COLUMN daily_mood_records.mood_text IS '用户的心情描述文字（可选）';
COMMENT ON COLUMN daily_mood_records.created_at IS '记录创建时间';
COMMENT ON CONSTRAINT unique_user_date ON daily_mood_records IS '确保每个用户每天只能记录一次心情';
