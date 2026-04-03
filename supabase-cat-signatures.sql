-- Cat Signatures Table
CREATE TABLE IF NOT EXISTS cat_signatures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  personality_id TEXT NOT NULL,
  personality_name TEXT NOT NULL,
  emoji TEXT NOT NULL,
  mood_input TEXT NOT NULL,
  emotion_vector JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX idx_cat_signatures_user_id ON cat_signatures(user_id);
CREATE INDEX idx_cat_signatures_created_at ON cat_signatures(created_at DESC);
CREATE INDEX idx_cat_signatures_personality ON cat_signatures(personality_id);

-- Enable RLS
ALTER TABLE cat_signatures ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only see their own signatures
CREATE POLICY "Users can view their own signatures"
  ON cat_signatures
  FOR SELECT
  USING (auth.uid() = user_id);

-- RLS Policy: Users can insert their own signatures
CREATE POLICY "Users can insert their own signatures"
  ON cat_signatures
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Function to get user's signature statistics
CREATE OR REPLACE FUNCTION get_signature_stats(user_id_param UUID)
RETURNS TABLE (
  total_signatures INT,
  most_common_personality TEXT,
  most_common_count INT,
  this_week_count INT,
  recovery_methods TEXT[]
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::INT as total_signatures,
    (SELECT personality_name FROM cat_signatures 
     WHERE user_id = user_id_param 
     GROUP BY personality_name 
     ORDER BY COUNT(*) DESC 
     LIMIT 1)::TEXT as most_common_personality,
    (SELECT COUNT(*)::INT FROM cat_signatures 
     WHERE user_id = user_id_param 
     GROUP BY personality_name 
     ORDER BY COUNT(*) DESC 
     LIMIT 1) as most_common_count,
    (SELECT COUNT(*)::INT FROM cat_signatures 
     WHERE user_id = user_id_param 
     AND created_at >= NOW() - INTERVAL '7 days') as this_week_count,
    ARRAY[]::TEXT[] as recovery_methods;
END;
$$ LANGUAGE plpgsql;
