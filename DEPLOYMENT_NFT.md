# NFT 功能部署指南

## 1. 数据库迁移

在 Supabase Dashboard → SQL Editor 中执行：

```sql
-- 复制 supabase-nft-feature.sql 的内容并执行
```

或者使用命令行：
```bash
# 如果你有 Supabase CLI
supabase db push
```

## 2. 验证数据库

执行以下查询确认字段已添加：

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'cat_images' 
AND column_name LIKE 'nft%';
```

应该看到：
- nft_token_id (text)
- nft_minted_at (timestamp with time zone)
- nft_rarity (text)
- is_nft (boolean)

## 3. 测试函数

```sql
SELECT get_next_nft_token_id();
-- 应该返回: #0000001
```

## 4. 部署到 Vercel

```bash
git add .
git commit -m "feat: add NFT minting feature"
git push origin main
```

Vercel 会自动部署。

## 5. 测试流程

1. 访问网站
2. 上传一张猫图（确保勾选"Add to gallery"）
3. 分析完成后，点击"铸造 NFT 证书"按钮
4. 查看生成的 NFT 证书
5. 在图鉴页面查看 NFT 徽章

## 6. 功能清单

✅ 数据库字段添加
✅ NFT Token ID 生成函数
✅ 铸造 NFT API (`/api/mint-nft`)
✅ 结果页面铸造按钮
✅ NFT 证书组件
✅ 图鉴页面 NFT 徽章
✅ 稀有度系统（4 个等级）
✅ NFT 预览页面

## 7. 稀有度分布

- Legendary (传说): 3 种情绪
- Epic (史诗): 6 种情绪
- Rare (稀有): 6 种情绪
- Common (普通): 其余情绪

## 8. 后续优化

- [ ] 添加 html2canvas 实现证书下载
- [ ] NFT 排行榜
- [ ] 限量版 NFT（每日限额）
- [ ] 特殊节日版 NFT
- [ ] 成就系统
- [ ] 真实区块链 NFT 升级
