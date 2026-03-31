# MoodCat NFT 设计方案

## 设计样本

基于你上传的虎斑猫照片，我设计了 4 个等级的 NFT 证书：

### 视觉效果预览

访问 `/nft-preview` 路由可以看到完整的设计样本

### 设计特点

#### 1. 传说级 (Legendary) - 金色
- 渐变色：金黄色到橙色
- 发光效果：金色光晕
- 适用情绪：suspicious（怀疑）, dramatic（戏精）, hangry（饿怒）
- 稀有度：最高

#### 2. 史诗级 (Epic) - 紫色
- 渐变色：紫色系
- 发光效果：紫色光晕
- 适用情绪：smug（得意）, sassy（傲娇）, zoomies（疯跑）
- 稀有度：高

#### 3. 稀有级 (Rare) - 蓝色
- 渐变色：蓝色系
- 发光效果：蓝色光晕
- 适用情绪：curious（好奇）, annoyed（烦躁）, anxious（焦虑）
- 稀有度：中

#### 4. 普通级 (Common) - 灰色
- 渐变色：灰色系
- 发光效果：灰色光晕
- 适用情绪：happy（开心）, calm（平静）, sleepy（困倦）
- 稀有度：基础

## 证书内容

每个 NFT 证书包含：

1. **顶部装饰条** - 根据稀有度显示不同颜色
2. **标题区** - "MoodCat NFT" + 稀有度徽章
3. **猫图片** - 主要展示区，带边框和发光效果
4. **Token ID 水印** - 显示在图片右上角
5. **信息区**：
   - 猫咪名字（可选）
   - 情绪标签（中英文）
   - 铸造日期
   - Token ID
6. **底部认证标记** - "Certified by MoodCat AI"

## 技术实现

### 数据库改动

```sql
ALTER TABLE cat_images 
ADD COLUMN is_nft BOOLEAN DEFAULT false,
ADD COLUMN nft_token_id TEXT UNIQUE,
ADD COLUMN nft_minted_at TIMESTAMPTZ,
ADD COLUMN nft_rarity TEXT CHECK (nft_rarity IN ('common', 'rare', 'epic', 'legendary'));
```

### Token ID 生成

两种方案：

1. **简单方案**：时间戳 + 随机数
```typescript
const tokenId = `CAT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
```

2. **序号方案**：#0000001 格式（推荐）
```typescript
const tokenId = `#${String(totalNFTCount + 1).padStart(7, '0')}`;
```

### 稀有度算法

根据情绪标签自动分配稀有度：

```typescript
const rarityMap: Record<string, 'common' | 'rare' | 'epic' | 'legendary'> = {
  // Legendary (3 种)
  suspicious: 'legendary',
  dramatic: 'legendary',
  hangry: 'legendary',
  
  // Epic (6 种)
  smug: 'epic',
  sassy: 'epic',
  zoomies: 'epic',
  confused: 'epic',
  resigned: 'epic',
  melancholy: 'epic',
  
  // Rare (6 种)
  curious: 'rare',
  annoyed: 'rare',
  anxious: 'rare',
  clingy: 'rare',
  disappointed: 'rare',
  ashamed: 'rare',
  
  // Common (其余)
  happy: 'common',
  calm: 'common',
  sleepy: 'common',
  sad: 'common',
  angry: 'common',
  scared: 'common',
  disgusted: 'common',
  surprised: 'common',
  loved: 'common',
  bored: 'common',
  tired: 'common',
};
```

## 用户流程

### 铸造 NFT

1. 用户上传猫图 → AI 分析情绪
2. 在结果页面显示 "铸造 NFT" 按钮
3. 点击后：
   - 生成唯一 Token ID
   - 根据情绪分配稀有度
   - 更新数据库 `is_nft = true`
   - 显示精美的 NFT 证书
4. 用户可以：
   - 下载证书图片
   - 分享到社交媒体
   - 在图鉴中查看（带 NFT 徽章）

### 图鉴展示

在 CollectionPage 中：
- NFT 的猫图显示特殊边框
- 显示 NFT 徽章 🏆
- 显示稀有度标签
- 可以查看完整证书

## 游戏化元素

### 1. 限量版
- 每天只能铸造 100 个 NFT
- 创造稀缺性

### 2. 特殊节日版
- 春节猫 🧧
- 圣诞猫 🎄
- 万圣节猫 🎃

### 3. 成就系统
- 收集全部 15 种情绪 → 解锁"情绪大师"徽章
- 收集 10 个传说级 NFT → 解锁"传说收藏家"
- 第一个铸造某种情绪 → "首发者"徽章

### 4. 排行榜
- NFT 数量排行
- 稀有度积分排行
- 最受欢迎的猫（点赞数）

## 下一步

1. ✅ 创建 NFT 证书组件
2. ✅ 创建预览页面
3. ⏳ 添加数据库字段
4. ⏳ 实现铸造 API
5. ⏳ 在结果页面添加"铸造 NFT"按钮
6. ⏳ 在图鉴页面显示 NFT 徽章
7. ⏳ 添加下载证书功能

## 时间估算

- MVP（基础铸造 + 证书展示）：2 小时
- 完整功能（图鉴集成 + 下载）：3-4 小时
- 游戏化元素：额外 2-3 小时

## 产品价值

### 情感价值
- 猫主人的自豪感："我的猫是独一无二的"
- 收藏欲望：稀有度系统激发收集欲
- 社交货币：可以炫耀给朋友

### 用户留存
- 每天打卡铸造 NFT
- 收集不同情绪的猫
- 参与排行榜竞争

### 变现潜力（未来）
- 真实 NFT 升级（收费）
- 实体周边（印刷证书、贴纸）
- 打赏功能（给喜欢的猫 NFT 打赏）
