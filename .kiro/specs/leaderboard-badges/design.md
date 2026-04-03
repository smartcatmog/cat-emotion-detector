# 排行榜 + 徽章系统设计

## 1. 排行榜系统

### 1.1 排行榜类型

**最受欢迎猫咪榜**
- 按点赞数排序（周榜、月榜、总榜）
- 显示：猫图缩略图、点赞数、上传者名字、情绪标签
- 更新频率：实时

**情绪贡献榜**
- 上传猫图最多的用户
- 显示：用户头像、用户名、上传数量、最常上传的情绪
- 更新频率：每小时

**收藏大师榜**
- 图鉴完成度最高的用户（已解锁的情绪种类数）
- 显示：用户头像、用户名、解锁情绪数/26、最新解锁的情绪
- 更新频率：每小时

**连续打卡榜**
- 连续记录天数最长的用户
- 显示：用户头像、用户名、连续天数、当前情绪
- 更新频率：每天

### 1.2 排行榜 UI

**排行榜页面结构**
- 顶部：Tab 切换（最受欢迎、贡献榜、收藏大师、连续打卡）
- 时间范围选择（仅最受欢迎）：周/月/总
- 排行榜列表：
  - 前 3 名：金银铜奖牌 + 大卡片
  - 4-10 名：序号 + 普通卡片
  - 11+ 名："你的排名"单独显示（如果不在 Top 10）

**卡片内容**
- 排名 + 奖牌/序号
- 用户头像 + 昵称
- 主要数据（点赞数/上传数/解锁数/连续天数）
- 次要信息（最常情绪/最新情绪等）

### 1.3 数据库表

```sql
-- 排行榜缓存（每小时更新）
CREATE TABLE leaderboard_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL, -- 'popular_cats', 'contributors', 'collectors', 'streaks'
  period TEXT NOT NULL, -- 'week', 'month', 'all' (仅 popular_cats)
  rank INTEGER NOT NULL,
  entity_id UUID NOT NULL, -- cat_image_id 或 user_id
  score INTEGER NOT NULL,
  metadata JSONB, -- 额外数据
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(type, period, rank)
);

CREATE INDEX idx_leaderboard_type_period ON leaderboard_cache(type, period, rank);
```

---

## 2. 徽章系统

### 2.1 徽章类型

**基础徽章**（自动解锁）
- 首次上传：上传第 1 张猫图
- 首次匹配：第 1 次心情匹配
- 首次打卡：第 1 次情绪日历打卡
- 首次点赞：第 1 次点赞猫图

**收集徽章**
- 收集家：解锁 5 种情绪
- 收集者：解锁 10 种情绪
- 收集大师：解锁 20 种情绪
- 情绪大师：解锁全部 26 种情绪

**活跃徽章**
- 周打卡：连续打卡 7 天
- 月打卡：连续打卡 30 天
- 百日打卡：连续打卡 100 天

**社交徽章**
- 受欢迎：获得 100 个点赞
- 明星：获得 500 个点赞
- 传奇：获得 1000 个点赞

**上传徽章**
- 贡献者：上传 10 张猫图
- 创作者：上传 50 张猫图
- 大师：上传 100 张猫图

**排行榜徽章**
- 周冠军：最受欢迎猫咪榜周冠军
- 月冠军：最受欢迎猫咪榜月冠军
- 贡献王：情绪贡献榜冠军

### 2.2 徽章等级

每个徽章有 3 个等级：
- 🥉 铜牌（基础）
- 🥈 银牌（进阶）
- 🥇 金牌（高级）

例如"收集家"：
- 铜：5 种情绪
- 银：10 种情绪
- 金：20 种情绪

### 2.3 徽章 UI

**个人主页徽章展示**
- 顶部：展示最珍贵的 3-5 个徽章（大图标）
- 下方：所有徽章网格（小图标）
  - 已解锁：彩色 + 获得日期
  - 未解锁：灰色 + 解锁条件进度条

**徽章详情弹窗**
- 徽章大图 + 名称 + 描述
- 解锁条件 + 当前进度
- 获得日期（已解锁）

### 2.4 数据库表

```sql
-- 徽章定义
CREATE TABLE badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  icon_url TEXT,
  category TEXT NOT NULL, -- 'basic', 'collection', 'activity', 'social', 'upload', 'leaderboard'
  tier TEXT NOT NULL, -- 'bronze', 'silver', 'gold'
  unlock_condition JSONB NOT NULL, -- {"type": "likes_count", "value": 100}
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 用户徽章
CREATE TABLE user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  badge_id UUID NOT NULL REFERENCES badges(id),
  unlocked_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, badge_id)
);

CREATE INDEX idx_user_badges_user ON user_badges(user_id);
```

---

## 3. 实现优先级

1. **排行榜**（最受欢迎猫咪 → 其他）
2. **徽章系统**（基础徽章 → 其他）
3. **个人主页集成**（展示排名 + 徽章）
