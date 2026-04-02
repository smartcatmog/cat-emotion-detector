-- Greetings / quick interactions between users
CREATE TABLE IF NOT EXISTS greetings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  to_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,  -- 'poke', 'hug', 'cheer', 'pat', 'wave'
  emotion_label TEXT,    -- context: what emotion they shared
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT valid_action CHECK (action IN ('poke', 'hug', 'cheer', 'pat', 'wave'))
);

CREATE INDEX IF NOT EXISTS idx_greetings_to_user ON greetings(to_user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_greetings_from_user ON greetings(from_user_id, created_at DESC);

ALTER TABLE greetings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "greetings_select" ON greetings FOR SELECT USING (true);
CREATE POLICY "greetings_insert" ON greetings FOR INSERT WITH CHECK (true);
