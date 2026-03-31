-- 修复 daily_mood_records -> users 的外键关联
-- 让 Supabase 能自动 join users 表

-- 确认外键存在（如果建表时已经有了就会报 already exists，忽略即可）
ALTER TABLE daily_mood_records
  DROP CONSTRAINT IF EXISTS daily_mood_records_user_id_fkey;

ALTER TABLE daily_mood_records
  ADD CONSTRAINT daily_mood_records_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- 同样修复 user_collections -> users
ALTER TABLE user_collections
  DROP CONSTRAINT IF EXISTS user_collections_user_id_fkey;

ALTER TABLE user_collections
  ADD CONSTRAINT user_collections_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- 修复 same_mood_matches -> users
ALTER TABLE same_mood_matches
  DROP CONSTRAINT IF EXISTS same_mood_matches_user_id_fkey;

ALTER TABLE same_mood_matches
  ADD CONSTRAINT same_mood_matches_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE same_mood_matches
  DROP CONSTRAINT IF EXISTS same_mood_matches_matched_user_id_fkey;

ALTER TABLE same_mood_matches
  ADD CONSTRAINT same_mood_matches_matched_user_id_fkey
  FOREIGN KEY (matched_user_id) REFERENCES users(id) ON DELETE CASCADE;
