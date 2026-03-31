-- NFT 功能：为 cat_images 表添加 NFT 相关字段

-- 添加 NFT 字段
ALTER TABLE cat_images 
ADD COLUMN IF NOT EXISTS is_nft BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS nft_token_id TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS nft_minted_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS nft_rarity TEXT CHECK (nft_rarity IN ('common', 'rare', 'epic', 'legendary'));

-- 创建索引以优化查询
CREATE INDEX IF NOT EXISTS idx_cat_images_nft ON cat_images(is_nft) WHERE is_nft = true;
CREATE INDEX IF NOT EXISTS idx_cat_images_rarity ON cat_images(nft_rarity) WHERE nft_rarity IS NOT NULL;

-- 注释说明
COMMENT ON COLUMN cat_images.is_nft IS '是否已铸造为 NFT';
COMMENT ON COLUMN cat_images.nft_token_id IS 'NFT 唯一编号，格式：#0000001';
COMMENT ON COLUMN cat_images.nft_minted_at IS 'NFT 铸造时间';
COMMENT ON COLUMN cat_images.nft_rarity IS 'NFT 稀有度：common/rare/epic/legendary';

-- 创建函数：获取下一个 NFT Token ID
CREATE OR REPLACE FUNCTION get_next_nft_token_id()
RETURNS TEXT AS $$
DECLARE
  next_id INTEGER;
BEGIN
  SELECT COALESCE(MAX(CAST(SUBSTRING(nft_token_id FROM 2) AS INTEGER)), 0) + 1
  INTO next_id
  FROM cat_images
  WHERE nft_token_id IS NOT NULL;
  
  RETURN '#' || LPAD(next_id::TEXT, 7, '0');
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_next_nft_token_id IS '生成下一个 NFT Token ID（格式：#0000001）';
