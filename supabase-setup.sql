-- Create analyses table for storing analysis results
CREATE TABLE IF NOT EXISTS analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL CHECK (file_type IN ('image', 'video')),
  file_size INTEGER,
  emotion TEXT NOT NULL,
  confidence INTEGER CHECK (confidence >= 0 AND confidence <= 100),
  interpretation TEXT,
  recommendations TEXT[],
  image_url TEXT,
  data_collection_consent BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_analyses_user_id ON analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_analyses_created_at ON analyses(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analyses_emotion ON analyses(emotion);

-- Create annotations table for data labeling
CREATE TABLE IF NOT EXISTS annotations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  file_name TEXT NOT NULL,
  emotion TEXT NOT NULL,
  confidence INTEGER CHECK (confidence >= 0 AND confidence <= 100),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for annotations
CREATE INDEX IF NOT EXISTS idx_annotations_user_id ON annotations(user_id);
CREATE INDEX IF NOT EXISTS idx_annotations_created_at ON annotations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_annotations_emotion ON annotations(emotion);

-- Enable Row Level Security (RLS)
ALTER TABLE analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE annotations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for analyses table
CREATE POLICY "Anyone can read analyses" ON analyses
  FOR SELECT USING (true);

CREATE POLICY "Anyone can insert analyses" ON analyses
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own analyses" ON analyses
  FOR UPDATE USING (auth.uid() = user_id OR user_id IS NULL)
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can delete their own analyses" ON analyses
  FOR DELETE USING (auth.uid() = user_id OR user_id IS NULL);

-- Create RLS policies for annotations table
CREATE POLICY "Anyone can read annotations" ON annotations
  FOR SELECT USING (true);

CREATE POLICY "Anyone can insert annotations" ON annotations
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own annotations" ON annotations
  FOR UPDATE USING (auth.uid() = user_id OR user_id IS NULL)
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can delete their own annotations" ON annotations
  FOR DELETE USING (auth.uid() = user_id OR user_id IS NULL);

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public)
VALUES ('cat-images', 'cat-images', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('annotations', 'annotations', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies
CREATE POLICY "Public Access" ON storage.objects
  FOR SELECT USING (bucket_id = 'cat-images' OR bucket_id = 'annotations');

CREATE POLICY "Authenticated users can upload" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'cat-images' OR bucket_id = 'annotations');
