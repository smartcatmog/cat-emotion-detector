CREATE TABLE IF NOT EXISTS user_follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(follower_id, following_id),
  CONSTRAINT no_self_follow CHECK (follower_id != following_id)
);

CREATE INDEX IF NOT EXISTS idx_follows_follower ON user_follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following ON user_follows(following_id);

ALTER TABLE user_follows ENABLE ROW LEVEL SECURITY;
CREATE POLICY "follows_select" ON user_follows FOR SELECT USING (true);
CREATE POLICY "follows_insert" ON user_follows FOR INSERT WITH CHECK (true);
CREATE POLICY "follows_delete" ON user_follows FOR DELETE USING (true);

-- Add follower/following counts to users (denormalized for performance)
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS follower_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS following_count INTEGER DEFAULT 0;
