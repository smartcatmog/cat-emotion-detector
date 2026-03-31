-- same_mood_matches 表：同心情匹配记录
-- 记录两个用户在同一天选择了相同情绪的匹配关系
-- 支持同心情广场、情绪缘分系统等功能

CREATE TABLE IF NOT EXISTS same_mood_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  matched_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  emotion_label TEXT NOT NULL,
  match_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  
  -- 确保不会记录自己和自己的匹配
  CONSTRAINT different_users CHECK (user_id != matched_user_id)
);

-- 创建索引以优化查询性能
-- 用于查询特定日期和情绪的所有匹配（同心情广场功能）
CREATE INDEX IF NOT EXISTS idx_same_mood_date_emotion ON same_mood_matches(match_date, emotion_label);

-- 用于查询用户的所有匹配记录
CREATE INDEX IF NOT EXISTS idx_same_mood_user ON same_mood_matches(user_id, match_date DESC);

-- 用于查询两个用户之间的匹配历史
CREATE INDEX IF NOT EXISTS idx_same_mood_users ON same_mood_matches(user_id, matched_user_id);

-- 用于按情绪标签查询匹配记录
CREATE INDEX IF NOT EXISTS idx_same_mood_emotion ON same_mood_matches(emotion_label);

-- 启用 Row Level Security (RLS)
ALTER TABLE same_mood_matches ENABLE ROW LEVEL SECURITY;

-- RLS 策略：所有人可以读取匹配记录（用于同心情广场和情绪缘分功能）
CREATE POLICY "Anyone can read same mood matches" ON same_mood_matches
  FOR SELECT USING (true);

-- RLS 策略：系统自动创建匹配记录（通过服务端 API）
-- 注意：实际应用中，这些记录应该由后端 API 使用 service role key 创建
-- 这里允许认证用户插入是为了开发和测试方便
CREATE POLICY "Authenticated users can insert matches" ON same_mood_matches
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- 注释说明
COMMENT ON TABLE same_mood_matches IS '同心情匹配记录表，记录两个用户在同一天选择了相同情绪';
COMMENT ON COLUMN same_mood_matches.user_id IS '用户ID（外键关联 users 表）';
COMMENT ON COLUMN same_mood_matches.matched_user_id IS '匹配到的用户ID（外键关联 users 表）';
COMMENT ON COLUMN same_mood_matches.emotion_label IS '匹配的情绪标签';
COMMENT ON COLUMN same_mood_matches.match_date IS '匹配日期';
COMMENT ON COLUMN same_mood_matches.created_at IS '记录创建时间';
COMMENT ON CONSTRAINT different_users ON same_mood_matches IS '确保不会记录自己和自己的匹配';
