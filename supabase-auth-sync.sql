-- 允许用户注册时插入自己的 profile
CREATE POLICY "Users can insert their own profile" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- 可选：Auth 注册时自动创建 users 记录的触发器
-- 如果前端已经手动 insert，这个触发器会冲突，可以不执行
-- CREATE OR REPLACE FUNCTION handle_new_user()
-- RETURNS TRIGGER AS $$
-- BEGIN
--   INSERT INTO public.users (id, email, username, display_name)
--   VALUES (NEW.id, NEW.email, split_part(NEW.email, '@', 1), split_part(NEW.email, '@', 1))
--   ON CONFLICT (id) DO NOTHING;
--   RETURN NEW;
-- END;
-- $$ LANGUAGE plpgsql SECURITY DEFINER;
-- 
-- DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
-- CREATE TRIGGER on_auth_user_created
--   AFTER INSERT ON auth.users
--   FOR EACH ROW EXECUTE FUNCTION handle_new_user();
