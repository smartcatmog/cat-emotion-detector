-- Tree hole posts (anonymous or public mood venting)
CREATE TABLE IF NOT EXISTS treehouse_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,  -- NULL if truly anonymous
  content TEXT NOT NULL CHECK (char_length(content) BETWEEN 1 AND 500),
  emotion_label TEXT,
  is_anonymous BOOLEAN DEFAULT TRUE,
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_treehouse_created ON treehouse_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_treehouse_emotion ON treehouse_posts(emotion_label, created_at DESC);

-- Replies to tree hole posts
CREATE TABLE IF NOT EXISTS treehouse_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES treehouse_posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  content TEXT NOT NULL CHECK (char_length(content) BETWEEN 1 AND 300),
  is_anonymous BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_treehouse_replies_post ON treehouse_replies(post_id, created_at ASC);

ALTER TABLE treehouse_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "treehouse_posts_select" ON treehouse_posts FOR SELECT USING (true);
CREATE POLICY "treehouse_posts_insert" ON treehouse_posts FOR INSERT WITH CHECK (true);
CREATE POLICY "treehouse_posts_update" ON treehouse_posts FOR UPDATE USING (true);

ALTER TABLE treehouse_replies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "treehouse_replies_select" ON treehouse_replies FOR SELECT USING (true);
CREATE POLICY "treehouse_replies_insert" ON treehouse_replies FOR INSERT WITH CHECK (true);
