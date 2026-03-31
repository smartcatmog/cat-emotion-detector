-- Run this in your Supabase SQL editor
-- Updates the emotion_label constraint to include 26 emotions

ALTER TABLE cat_images
  DROP CONSTRAINT IF EXISTS cat_images_emotion_label_check;

ALTER TABLE cat_images
  ADD CONSTRAINT cat_images_emotion_label_check
  CHECK (emotion_label IN (
    'happy', 'calm', 'sleepy', 'curious', 'annoyed', 'anxious',
    'resigned', 'dramatic', 'sassy', 'clingy', 'zoomies', 'suspicious',
    'smug', 'confused', 'hangry',
    'sad', 'angry', 'scared', 'disgusted', 'surprised',
    'loved', 'bored', 'ashamed', 'tired', 'disappointed', 'melancholy'
  ));
