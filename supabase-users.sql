-- MoodCat 用户表
-- 支持匿名和登录用户的混合模式
-- 预留 Web3 功能字段

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  wallet_address TEXT UNIQUE,  -- Web3 预留
  web3_enabled BOOLEAN DEFAULT FALSE,  -- Web3 预留
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  -- Username 长度约束：2-20 字符
  CONSTRAINT username_length CHECK (char_length(username) >= 2 AND char_length(username) <= 20),
  
  -- Username 格式约束：支持中文、英文、数字、下划线
  CONSTRAINT username_format CHECK (username ~ '^[\u4e00-\u9fa5a-zA-Z0-9_]+$')
);

-- 创建索引以优化查询性能
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email) WHERE email IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_users_wallet ON users(wallet_address) WHERE wallet_address IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at DESC);

-- 启用 Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- RLS 策略：所有人可以读取用户基本信息（用于社交功能）
CREATE POLICY "Anyone can read user profiles" ON users
  FOR SELECT USING (true);

-- RLS 策略：用户只能更新自己的信息
CREATE POLICY "Users can update their own profile" ON users
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- RLS 策略：用户只能删除自己的账号
CREATE POLICY "Users can delete their own account" ON users
  FOR DELETE USING (auth.uid() = id);

-- 创建更新 updated_at 的触发器函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 为 users 表添加触发器
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 注释说明
COMMENT ON TABLE users IS 'MoodCat 用户表，支持匿名和登录用户';
COMMENT ON COLUMN users.username IS '用户名（唯一标识），支持中文、英文、数字、下划线，2-20字符';
COMMENT ON COLUMN users.display_name IS '显示名称，可包含空格和emoji';
COMMENT ON COLUMN users.wallet_address IS 'Web3 钱包地址（Phase 2 功能）';
COMMENT ON COLUMN users.web3_enabled IS 'Web3 功能是否启用（Phase 2 功能）';
