# MoodCat 社交娱乐功能设计

## 设计目标

让 MoodCat 从单次使用的工具转变为用户愿意反复登录的社交娱乐平台，通过以下策略提升用户粘性：

1. **社交互动**：用户之间的连接和互动
2. **游戏化机制**：收集、成就、排行榜
3. **个性化体验**：用户专属内容和记忆
4. **内容创作**：UGC 和创意表达
5. **情感共鸣**：基于情绪的社区归属感

## 核心功能设计

### 1. 猫咪情绪日历 📅

**功能描述**：
- 用户每天可以上传一张猫图或匹配一次心情，记录在个人情绪日历上
- 日历以月视图展示，每天显示当日的猫咪缩略图 + 情绪标签
- 点击日期查看当天的详细记录：猫图、情绪、心情描述、时间戳
- 连续打卡天数统计，显著展示"已连续记录 X 天"

**用户价值**：
- 情绪追踪：回顾自己的情绪变化趋势
- 习惯养成：每日打卡的仪式感
- 记忆相册：猫咪 + 心情的时光机

**技术实现**：
```typescript
interface DailyMoodRecord {
  id: string;
  user_id: string;
  date: string;              // YYYY-MM-DD
  cat_image_id: string;      // 关联 cat_images 表
  mood_text: string | null;  // 用户输入的心情描述
  emotion_label: EmotionLabel;
  created_at: string;
}

// 数据库表
CREATE TABLE daily_mood_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  date DATE NOT NULL,
  cat_image_id UUID REFERENCES cat_images(id),
  mood_text TEXT,
  emotion_label TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, date)  -- 每天只能记录一次
);

CREATE INDEX idx_daily_mood_user_date ON daily_mood_records(user_id, date DESC);
```

**UI 设计要点**：
- 月历网格，每个格子显示猫咪头像 + emoji 情绪图标
- 未记录的日期显示为空白或淡灰色
- 当前连续打卡天数用醒目的徽章展示
- 支持左右滑动切换月份

---

### 2. 情绪收集图鉴 🎴

**功能描述**：
- 26 种情绪标签，每种情绪用户需要收集至少 1 张猫图才能"解锁"
- 图鉴页面展示 26 个情绪卡片，已解锁显示代表猫图，未解锁显示剪影 + "?"
- 每种情绪可以收集多张猫图，显示收集进度（如"happy: 5/∞"）
- 特殊成就：
  - "情绪大师"：解锁全部 26 种情绪
  - "XX 专家"：某个情绪收集超过 10 张
  - "稀有猫猎人"：收集到点赞数 > 100 的猫图

**用户价值**：
- 收集欲：类似宝可梦图鉴的完成度驱动
- 探索动力：鼓励用户尝试不同心情匹配
- 炫耀资本：展示自己的收藏成就

**技术实现**：
```typescript
interface UserCollection {
  id: string;
  user_id: string;
  cat_image_id: string;
  emotion_label: EmotionLabel;
  collected_at: string;
}

// 数据库表
CREATE TABLE user_collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  cat_image_id UUID REFERENCES cat_images(id),
  emotion_label TEXT NOT NULL,
  collected_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, cat_image_id)  -- 同一张猫图只能收集一次
);

CREATE INDEX idx_user_collections_user ON user_collections(user_id, emotion_label);

// 查询用户图鉴完成度
SELECT 
  emotion_label,
  COUNT(*) as collected_count
FROM user_collections
WHERE user_id = $1
GROUP BY emotion_label;
```

**UI 设计要点**：
- 网格布局，每个情绪一个卡片
- 已解锁：显示最新收集的猫图 + 收集数量
- 未解锁：灰色剪影 + "未解锁" 提示
- 点击卡片查看该情绪的所有收藏
- 顶部显示总体进度条："已解锁 18/26 种情绪"

---

### 3. 每日情绪挑战 🎯

**功能描述**：
- 每天系统随机指定一个"今日情绪"（如"今日挑战：找到一只 dramatic 的猫"）
- 用户完成挑战（上传或匹配到该情绪的猫图）获得奖励：
  - 特殊徽章（如"Drama Queen"）
  - 双倍点赞权重（当天点赞的猫图获得 2 倍 likes）
- 挑战每日 00:00 UTC 刷新
- 显示全球完成挑战的用户数量

**用户价值**：
- 每日新鲜感：固定的回访理由
- 社区参与感：看到其他人也在完成同样的挑战
- 限时奖励：FOMO 心理驱动

**技术实现**：
```typescript
interface DailyChallenge {
  id: string;
  date: string;              // YYYY-MM-DD
  emotion_label: EmotionLabel;
  completed_count: number;   // 全球完成人数
}

interface UserChallengeCompletion {
  id: string;
  user_id: string;
  challenge_id: string;
  completed_at: string;
  badge_earned: string;
}

// 数据库表
CREATE TABLE daily_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL UNIQUE,
  emotion_label TEXT NOT NULL,
  completed_count INTEGER DEFAULT 0
);

CREATE TABLE user_challenge_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  challenge_id UUID REFERENCES daily_challenges(id),
  completed_at TIMESTAMPTZ DEFAULT now(),
  badge_earned TEXT,
  UNIQUE(user_id, challenge_id)
);
```

**UI 设计要点**：
- 首页顶部横幅："今日挑战：找到一只 😤 dramatic 的猫"
- 完成后显示庆祝动画 + 徽章解锁提示
- 显示"今日已有 1,234 人完成挑战"
- 未完成时显示倒计时："挑战将在 8 小时后刷新"

---

### 4. 猫咪情绪排行榜 🏆

**功能描述**：
- 多个维度的排行榜：
  - **最受欢迎猫咪**：按点赞数排序（周榜、月榜、总榜）
  - **情绪贡献榜**：上传猫图最多的用户
  - **收藏大师榜**：图鉴完成度最高的用户
  - **连续打卡榜**：连续记录天数最长的用户
- 每个榜单显示 Top 10，用户可以看到自己的排名
- 榜单每周一刷新，上周冠军获得特殊称号（如"本周猫王"）

**用户价值**：
- 竞争动力：排名攀升的成就感
- 社区认同：成为"名人"的荣誉感
- 对比参照：看到自己与他人的差距

**技术实现**：
```typescript
// 利用现有表 + 聚合查询
// 最受欢迎猫咪
SELECT 
  ci.*,
  ci.likes_count
FROM cat_images ci
WHERE created_at >= NOW() - INTERVAL '7 days'
ORDER BY likes_count DESC
LIMIT 10;

// 情绪贡献榜
SELECT 
  u.id,
  u.username,
  COUNT(ci.id) as upload_count
FROM users u
JOIN cat_images ci ON ci.uploaded_by = u.id
WHERE ci.created_at >= NOW() - INTERVAL '7 days'
GROUP BY u.id
ORDER BY upload_count DESC
LIMIT 10;

// 收藏大师榜
SELECT 
  u.id,
  u.username,
  COUNT(DISTINCT uc.emotion_label) as unique_emotions
FROM users u
JOIN user_collections uc ON uc.user_id = u.id
GROUP BY u.id
ORDER BY unique_emotions DESC, COUNT(uc.id) DESC
LIMIT 10;
```

**UI 设计要点**：
- Tab 切换不同榜单
- 前三名用金银铜奖牌图标
- 显示用户头像、昵称、数据（如"1,234 likes"）
- 自己的排名高亮显示，如果不在 Top 10 则在底部单独显示

---

### 5. 情绪社区广场 🌍

**功能描述**：
- 按情绪标签分类的社区频道（26 个频道）
- 用户可以在频道内：
  - 浏览该情绪的所有猫图（瀑布流）
  - 评论猫图（如"这只猫太 dramatic 了哈哈哈"）
  - 回复其他用户的评论
  - 点赞评论
- 热门评论置顶
- 每个频道显示实时活跃度（如"当前 42 人在线"）

**用户价值**：
- 情感共鸣：找到和自己有相同情绪的人
- 社交互动：评论区的交流和讨论
- 内容发现：看到更多有趣的猫图

**技术实现**：
```typescript
interface Comment {
  id: string;
  cat_image_id: string;
  user_id: string;
  content: string;
  parent_comment_id: string | null;  // 回复功能
  likes_count: number;
  created_at: string;
}

// 数据库表
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cat_image_id UUID REFERENCES cat_images(id),
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  parent_comment_id UUID REFERENCES comments(id),
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_comments_cat_image ON comments(cat_image_id, created_at DESC);
CREATE INDEX idx_comments_parent ON comments(parent_comment_id);
```

**UI 设计要点**：
- 左侧边栏：26 个情绪频道列表，显示每个频道的在线人数
- 主区域：瀑布流展示猫图，点击进入详情页
- 详情页：大图 + 评论区，支持回复和点赞
- 评论输入框支持 emoji 表情

---

### 6. 猫咪情绪故事 📖

**功能描述**：
- 用户可以创建"情绪故事"：选择 3-9 张猫图，配上文字，讲述一个情绪变化的故事
- 例如："我的一天"：早上 sleepy → 上班 anxious → 下班 happy
- 故事可以分享到社区，其他用户可以点赞和评论
- 热门故事在首页推荐位展示

**用户价值**：
- 创意表达：用猫图讲述自己的故事
- 情感宣泄：通过创作释放情绪
- 社交货币：优质故事获得关注和认可

**技术实现**：
```typescript
interface EmotionStory {
  id: string;
  user_id: string;
  title: string;
  description: string;
  cat_image_ids: string[];   // 有序数组，3-9 张
  likes_count: number;
  views_count: number;
  created_at: string;
}

// 数据库表
CREATE TABLE emotion_stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  cat_image_ids UUID[] NOT NULL,  -- PostgreSQL 数组类型
  likes_count INTEGER DEFAULT 0,
  views_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT valid_image_count CHECK (array_length(cat_image_ids, 1) BETWEEN 3 AND 9)
);

CREATE INDEX idx_emotion_stories_user ON emotion_stories(user_id);
CREATE INDEX idx_emotion_stories_popular ON emotion_stories(likes_count DESC, created_at DESC);
```

**UI 设计要点**：
- 创建页面：拖拽排序猫图，添加标题和描述
- 展示页面：横向滑动查看故事的每一张图
- 列表页面：卡片式布局，显示封面图 + 标题 + 点赞数

---

### 7. 情绪匹配好友 👥

**功能描述**：
- 系统根据用户的情绪记录，推荐"情绪相似"的其他用户
- 匹配算法：
  - 计算两个用户的情绪分布相似度（余弦相似度）
  - 优先推荐最近活跃的用户
- 用户可以关注其他用户，查看他们的：
  - 情绪日历
  - 收藏图鉴
  - 创作的故事
- 关注后可以在 Feed 流中看到对方的动态

#### 7.1 今日同心情好友 💫

**核心玩法**：实时匹配今天选择了相同情绪的用户

**功能细节**：

1. **实时匹配通知**
   - 用户完成今日心情记录后，系统立即查找今天选择相同情绪的其他用户
   - 弹出提示："今天有 42 个人和你一样感到 anxious"
   - 点击进入"同心情广场"

2. **同心情广场**
   - 显示今天选择相同情绪的所有用户（匿名或实名可选）
   - 每个用户卡片显示：
     - 头像 + 昵称
     - 他们选择的猫图
     - 心情描述文字（如果有）
     - "打个招呼"按钮
   - 实时更新人数："当前 42 人在线"

3. **快速社交互动**
   - **打招呼**：发送预设消息（"我也是这种感觉！"、"抱抱"、"一起加油"）
   - **共鸣点赞**：给对方的心情记录点"我懂"
   - **私信聊天**：开启一对一对话（需要对方同意）
   - **一键关注**：快速建立关注关系

4. **同心情历史**
   - 记录"情绪缘分"：显示你和某个用户有多少天选择了相同情绪
   - 特殊称号：
     - "情绪知己"：与某人有 7 天相同情绪
     - "灵魂伴侣"：与某人有 30 天相同情绪
   - 查看历史同心情记录："你和 @小明 在 3/15、3/20、3/25 都感到 happy"

5. **情绪共鸣墙**
   - 今日热门情绪排行："今天最多人感到 tired (1,234 人)"
   - 点击情绪标签，查看所有选择该情绪的用户
   - 用户可以在墙上留言："今天真的好累，但看到这么多人和我一样，突然觉得不孤单了"

6. **匹配提醒设置**
   - 用户可以设置：
     - "当有人和我选择相同情绪时通知我"
     - "只匹配我关注的人"
     - "匿名模式"（不显示在同心情广场）

**用户价值**：
- **即时情感共鸣**：发现"此刻和我一样"的人，减少孤独感
- **破冰社交**：共同情绪是天然的话题，降低社交门槛
- **社区归属感**：看到群体数据，感受"我不是一个人"
- **长期关系建立**：通过多次情绪重合，发现真正的"知己"

**场景示例**：

```
用户 A 今天上传了一只 anxious 的猫，描述："明天要面试，好紧张"
系统匹配到用户 B 也选择了 anxious，描述："考试前一天，睡不着"

用户 A 看到通知："今天有 15 个人和你一样感到 anxious"
点击进入，看到用户 B 的卡片
用户 A 点击"打招呼"，发送"一起加油！"
用户 B 收到消息，回复"谢谢，你也是！"
两人开始聊天，互相鼓励
第二天，两人都更新为 happy，系统提示："你和 @B 连续 2 天情绪同步了！"
```

**用户价值**：
- 情感连接：找到"懂我"的人
- 社交网络：建立基于情绪的社交关系
- 内容消费：持续看到感兴趣的内容

**技术实现**：
```typescript
interface UserFollow {
  id: string;
  follower_id: string;   // 关注者
  following_id: string;  // 被关注者
  created_at: string;
}

interface UserEmotionProfile {
  user_id: string;
  emotion_distribution: Record<EmotionLabel, number>;  // 每种情绪的占比
  last_updated: string;
}

interface SameMoodMatch {
  id: string;
  user_a_id: string;
  user_b_id: string;
  emotion_label: EmotionLabel;
  matched_date: string;      // YYYY-MM-DD
  interaction_type: 'greeting' | 'empathy_like' | 'chat' | null;
  created_at: string;
}

interface EmotionConnection {
  id: string;
  user_a_id: string;
  user_b_id: string;
  same_emotion_count: number;  // 累计相同情绪天数
  last_matched_date: string;
  connection_level: 'acquaintance' | 'friend' | 'soulmate';  // 1-6天/7-29天/30+天
}

// 数据库表
CREATE TABLE user_follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID NOT NULL,
  following_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(follower_id, following_id)
);

CREATE TABLE user_emotion_profiles (
  user_id UUID PRIMARY KEY,
  emotion_distribution JSONB NOT NULL,  -- {"happy": 0.2, "calm": 0.15, ...}
  last_updated TIMESTAMPTZ DEFAULT now()
);

-- 今日同心情匹配记录
CREATE TABLE same_mood_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_a_id UUID NOT NULL,
  user_b_id UUID NOT NULL,
  emotion_label TEXT NOT NULL,
  matched_date DATE NOT NULL,
  interaction_type TEXT,  -- 'greeting', 'empathy_like', 'chat'
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT ordered_users CHECK (user_a_id < user_b_id)  -- 确保 A < B，避免重复
);

CREATE INDEX idx_same_mood_date_emotion ON same_mood_matches(matched_date, emotion_label);
CREATE INDEX idx_same_mood_users ON same_mood_matches(user_a_id, user_b_id);

-- 情绪连接关系（累计）
CREATE TABLE emotion_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_a_id UUID NOT NULL,
  user_b_id UUID NOT NULL,
  same_emotion_count INTEGER DEFAULT 1,
  last_matched_date DATE NOT NULL,
  connection_level TEXT DEFAULT 'acquaintance',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_a_id, user_b_id),
  CONSTRAINT ordered_users CHECK (user_a_id < user_b_id)
);

CREATE INDEX idx_emotion_connections_level ON emotion_connections(connection_level, same_emotion_count DESC);

-- 查询今日同心情用户
CREATE OR REPLACE FUNCTION get_same_mood_users(
  p_user_id UUID,
  p_emotion_label TEXT,
  p_date DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE (
  user_id UUID,
  username TEXT,
  avatar_url TEXT,
  mood_text TEXT,
  cat_image_url TEXT,
  same_emotion_count INTEGER  -- 历史累计相同情绪天数
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id,
    u.username,
    u.avatar_url,
    dmr.mood_text,
    ci.image_url,
    COALESCE(ec.same_emotion_count, 0) as same_emotion_count
  FROM daily_mood_records dmr
  JOIN users u ON u.id = dmr.user_id
  JOIN cat_images ci ON ci.id = dmr.cat_image_id
  LEFT JOIN emotion_connections ec ON (
    (ec.user_a_id = p_user_id AND ec.user_b_id = u.id) OR
    (ec.user_b_id = p_user_id AND ec.user_a_id = u.id)
  )
  WHERE dmr.date = p_date
    AND dmr.emotion_label = p_emotion_label
    AND dmr.user_id != p_user_id
  ORDER BY ec.same_emotion_count DESC NULLS LAST, dmr.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- 更新情绪连接关系（触发器或定时任务）
CREATE OR REPLACE FUNCTION update_emotion_connection(
  p_user_a_id UUID,
  p_user_b_id UUID,
  p_date DATE
)
RETURNS VOID AS $$
DECLARE
  v_user_a UUID := LEAST(p_user_a_id, p_user_b_id);
  v_user_b UUID := GREATEST(p_user_a_id, p_user_b_id);
  v_count INTEGER;
  v_level TEXT;
BEGIN
  INSERT INTO emotion_connections (user_a_id, user_b_id, last_matched_date)
  VALUES (v_user_a, v_user_b, p_date)
  ON CONFLICT (user_a_id, user_b_id) 
  DO UPDATE SET 
    same_emotion_count = emotion_connections.same_emotion_count + 1,
    last_matched_date = p_date,
    updated_at = NOW()
  RETURNING same_emotion_count INTO v_count;
  
  -- 更新连接等级
  IF v_count >= 30 THEN
    v_level := 'soulmate';
  ELSIF v_count >= 7 THEN
    v_level := 'friend';
  ELSE
    v_level := 'acquaintance';
  END IF;
  
  UPDATE emotion_connections
  SET connection_level = v_level
  WHERE user_a_id = v_user_a AND user_b_id = v_user_b;
END;
$$ LANGUAGE plpgsql;

// 相似度计算（应用层实现）
function calculateSimilarity(profile1: UserEmotionProfile, profile2: UserEmotionProfile): number {
  // 余弦相似度算法
  // ...
}
```

**UI 设计要点**：
- **匹配通知弹窗**：
  - 大号数字显示同心情人数："42 人"
  - 情绪 emoji 动画效果
  - "去看看"按钮（主要）+ "稍后"按钮（次要）
  
- **同心情广场页面**：
  - 顶部：情绪标签 + 实时人数 + "刷新"按钮
  - 用户卡片网格（2 列布局）：
    - 头像（圆形）+ 昵称
    - 猫图缩略图
    - 心情文字（最多 2 行，超出省略）
    - 底部操作栏：打招呼 + 共鸣点赞 + 关注
  - 筛选选项："全部" / "仅关注的人" / "新朋友"
  
- **打招呼快捷回复**：
  - 底部弹出选择器，预设 6 个选项：
    - "我也是这种感觉！😊"
    - "抱抱，会好起来的 🤗"
    - "一起加油！💪"
    - "我懂你 🫂"
    - "要不要聊聊？💬"
    - "自定义消息..."
  
- **情绪缘分页面**：
  - 显示与某个用户的历史同心情记录
  - 时间线展示：日期 + 情绪标签 + 双方的猫图
  - 顶部显示累计天数和称号徽章
  - "继续保持同步"的鼓励文案
  
- **情绪共鸣墙**：
  - 顶部：今日情绪分布饼图（可交互）
  - 情绪标签列表，显示每个情绪的人数
  - 点击标签进入该情绪的同心情广场
  - 留言板：用户可以发表今日感想（类似朋友圈）

---

### 8. 情绪盲盒 🎁

**核心设计理念**：结合 Gacha 游戏机制 + 情绪收集 + 每日回访驱动

#### 8.1 盲盒类型与获取方式

**1. 每日免费盲盒**
- 每天 00:00 UTC 刷新，用户可免费开启 1 个
- 未开启的盲盒不会累积（鼓励每日登录）
- 开启后立即获得奖励

**2. 任务盲盒**
- 通过完成特定任务获得：
  - 连续打卡 3 天 → 1 个银色盲盒
  - 连续打卡 7 天 → 1 个金色盲盒
  - 上传 5 张猫图 → 1 个银色盲盒
  - 获得 50 个点赞 → 1 个金色盲盒
  - 完成每日挑战 → 1 个普通盲盒
  - 解锁 10 种情绪 → 1 个彩虹盲盒（特殊）

**3. 社交盲盒**
- 邀请好友注册 → 双方各得 1 个银色盲盒
- 与某人达成"情绪知己"（7 天同心情）→ 1 个金色盲盒
- 你的猫图进入周榜 Top 10 → 1 个彩虹盲盒

#### 8.2 盲盒稀有度系统

**普通盲盒（灰色）**
- 获取：每日免费、完成每日挑战
- 内容：
  - 80% 概率：普通猫图（点赞数 < 50）
  - 15% 概率：稀有猫图（点赞数 50-100）
  - 5% 概率：史诗猫图（点赞数 > 100）
  - 额外奖励：10% 概率获得普通徽章

**银色盲盒**
- 获取：连续打卡 3 天、上传 5 张猫图、邀请好友
- 内容：
  - 50% 概率：稀有猫图
  - 40% 概率：史诗猫图
  - 10% 概率：传说猫图（点赞数 > 500）
  - 额外奖励：30% 概率获得稀有徽章、20% 概率获得双倍点赞卡（24 小时）

**金色盲盒**
- 获取：连续打卡 7 天、获得 50 个点赞、达成情绪知己
- 内容：
  - 60% 概率：史诗猫图
  - 30% 概率：传说猫图
  - 10% 概率：神话猫图（点赞数 > 1000 或官方精选）
  - 额外奖励：50% 概率获得史诗徽章、30% 概率获得情绪称号（如"快乐大使"）

**彩虹盲盒（特殊）**
- 获取：解锁全部 26 种情绪、进入周榜 Top 3、特殊活动
- 内容：
  - 100% 保底：传说或神话猫图
  - 50% 概率：限定猫图（季节性、节日特供）
  - 额外奖励：100% 获得传说徽章 + 专属称号 + 7 天 VIP 特权

#### 8.3 盲盒内容详细设计

**猫图稀有度分级**
```typescript
interface CatImageRarity {
  id: string;
  cat_image_id: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';
  rarity_score: number;      // 综合评分（点赞数 + 收藏数 + 时间衰减）
  is_limited: boolean;       // 是否限定（季节性、节日）
  limited_tag: string | null; // 限定标签（如"2026春节"、"万圣节"）
  special_effect: string | null; // 特殊效果（如边框动画、粒子效果）
}

// 稀有度判定规则
function calculateRarity(catImage: CatImage): CatImageRarity {
  const score = catImage.likes_count * 1.0 + 
                catImage.collection_count * 2.0 + 
                catImage.share_count * 3.0;
  
  // 时间衰减：越新的图片需要更高分数才能达到高稀有度
  const daysSinceUpload = (Date.now() - catImage.created_at) / (1000 * 60 * 60 * 24);
  const adjustedScore = score * Math.min(1.0, daysSinceUpload / 30);
  
  if (adjustedScore > 1000) return 'mythic';
  if (adjustedScore > 500) return 'legendary';
  if (adjustedScore > 100) return 'epic';
  if (adjustedScore > 50) return 'rare';
  return 'common';
}
```

**额外奖励类型**
1. **徽章**：解锁新徽章（如"幸运儿"、"收藏家"）
2. **称号**：可在个人主页展示的称号（如"快乐大使"、"情绪大师"）
3. **道具卡**：
   - 双倍点赞卡：24 小时内你点赞的猫图获得 2 倍 likes
   - 情绪雷达卡：查看全球实时情绪分布热力图
   - 时光倒流卡：可以补签昨天的情绪日历
   - 盲盒钥匙：额外开启 1 个免费盲盒
4. **虚拟货币**：情绪币（可用于兑换特殊盲盒或道具）

#### 8.4 开盒动画与体验设计

**开盒流程**：
1. **盲盒展示**：
   - 3D 旋转的盒子模型（不同颜色对应不同稀有度）
   - 盒子表面有猫爪印和情绪 emoji 装饰
   - 点击"开启"按钮

2. **开启动画**（约 3-5 秒）：
   - 盒子震动 → 裂开 → 光芒四射
   - 猫图从盒子中飞出，带有粒子效果
   - 稀有度越高，光芒颜色越炫（灰 → 蓝 → 紫 → 金 → 彩虹）
   - 背景音效：盒子打开声 + 稀有度对应的音乐（史诗及以上有特殊音效）

3. **结果展示**：
   - 大图展示获得的猫图
   - 显示稀有度标签和情绪标签
   - 如果有额外奖励，依次弹出（徽章、称号、道具）
   - 底部按钮："加入收藏" / "分享" / "继续"

4. **跳过选项**：
   - 长按盒子可以跳过动画，直接看结果
   - 设置中可以开启"快速开盒模式"

**视觉设计要点**：
- 盒子外观：
  - 普通盲盒：灰色纸盒，简单猫爪印
  - 银色盲盒：银色金属质感，发光边缘
  - 金色盲盒：金色，表面有浮雕猫咪图案
  - 彩虹盲盒：渐变彩虹色，粒子环绕，最炫酷
- 稀有度颜色：
  - Common：灰色 #9E9E9E
  - Rare：蓝色 #2196F3
  - Epic：紫色 #9C27B0
  - Legendary：金色 #FFD700
  - Mythic：彩虹渐变

#### 8.5 盲盒库存与刷新机制

**每日盲盒刷新**：
- 每天 00:00 UTC，用户的"今日免费盲盒"状态重置
- 首页显著位置显示："今日盲盒已刷新！"（带闪烁动画）
- 如果用户昨天没开，显示："昨天的盲盒已过期，今天记得开哦"

**盲盒库存**：
- 用户可以持有多个未开启的盲盒（任务盲盒、社交盲盒）
- 库存页面显示所有盲盒，按稀有度排序
- 每个盲盒显示获得来源和时间
- 盲盒不会过期（除了每日免费盲盒）

**批量开盒**：
- 如果用户有多个同类型盲盒，可以选择"一键开启 x10"
- 批量开启时，动画加速，最后统一展示所有结果
- 显示统计："本次获得：稀有 x3、史诗 x1、普通 x6"

#### 8.6 盲盒历史与统计

**个人盲盒记录**：
- 查看所有开过的盲盒历史
- 统计数据：
  - 累计开启次数
  - 各稀有度获得数量（饼图）
  - 最幸运的一次（获得最高稀有度的记录）
  - 欧皇指数：(史诗及以上数量 / 总开启次数) * 100

**全球盲盒统计**：
- 今日全球开启盲盒总数
- 今日爆出的最稀有猫图（实时更新）
- 幸运榜：今天开出最多传说/神话猫图的用户

**用户价值**：
- **每日惊喜**：开盲盒的刺激感和期待感
- **收集驱动**：稀有猫图的收集欲
- **每日回访**：免费盲盒的固定回访理由
- **成就感**：开出稀有物品的满足感
- **社交货币**：稀有猫图可以炫耀和分享
- **长期目标**：通过任务获得更多盲盒

**技术实现**：
```typescript
interface LootBox {
  id: string;
  user_id: string;
  box_type: 'daily_free' | 'task' | 'social' | 'special';
  box_rarity: 'common' | 'silver' | 'gold' | 'rainbow';
  source: string;            // 获得来源描述（如"连续打卡7天"）
  is_opened: boolean;
  opened_at: string | null;
  created_at: string;
  expires_at: string | null; // 仅每日免费盲盒有过期时间
}

interface LootBoxReward {
  id: string;
  loot_box_id: string;
  reward_type: 'cat_image' | 'badge' | 'title' | 'item' | 'currency';
  reward_id: string;         // 关联的奖励 ID（cat_image_id, badge_id 等）
  rarity: 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';
  quantity: number;          // 数量（主要用于虚拟货币）
  created_at: string;
}

interface UserItem {
  id: string;
  user_id: string;
  item_type: 'double_like_card' | 'emotion_radar' | 'time_rewind' | 'lootbox_key';
  quantity: number;
  expires_at: string | null; // 道具过期时间（如双倍点赞卡 24 小时）
  created_at: string;
}

interface CatImageRarity {
  id: string;
  cat_image_id: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';
  rarity_score: number;
  is_limited: boolean;
  limited_tag: string | null;
  special_effect: string | null;
  updated_at: string;
}

// 数据库表
CREATE TABLE loot_boxes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  box_type TEXT NOT NULL,
  box_rarity TEXT NOT NULL,
  source TEXT NOT NULL,
  is_opened BOOLEAN DEFAULT FALSE,
  opened_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ,
  CONSTRAINT valid_box_type CHECK (box_type IN ('daily_free', 'task', 'social', 'special')),
  CONSTRAINT valid_box_rarity CHECK (box_rarity IN ('common', 'silver', 'gold', 'rainbow'))
);

CREATE INDEX idx_loot_boxes_user ON loot_boxes(user_id, is_opened);
CREATE INDEX idx_loot_boxes_expires ON loot_boxes(expires_at) WHERE expires_at IS NOT NULL;

CREATE TABLE loot_box_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  loot_box_id UUID REFERENCES loot_boxes(id),
  reward_type TEXT NOT NULL,
  reward_id TEXT NOT NULL,
  rarity TEXT NOT NULL,
  quantity INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT valid_reward_type CHECK (reward_type IN ('cat_image', 'badge', 'title', 'item', 'currency'))
);

CREATE INDEX idx_loot_box_rewards_box ON loot_box_rewards(loot_box_id);

CREATE TABLE user_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  item_type TEXT NOT NULL,
  quantity INTEGER DEFAULT 1,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT valid_item_type CHECK (item_type IN ('double_like_card', 'emotion_radar', 'time_rewind', 'lootbox_key'))
);

CREATE INDEX idx_user_items_user ON user_items(user_id, item_type);

CREATE TABLE cat_image_rarity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cat_image_id UUID UNIQUE REFERENCES cat_images(id),
  rarity TEXT NOT NULL,
  rarity_score NUMERIC(10, 2) NOT NULL,
  is_limited BOOLEAN DEFAULT FALSE,
  limited_tag TEXT,
  special_effect TEXT,
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT valid_rarity CHECK (rarity IN ('common', 'rare', 'epic', 'legendary', 'mythic'))
);

CREATE INDEX idx_cat_image_rarity_score ON cat_image_rarity(rarity, rarity_score DESC);

-- 每日免费盲盒检查
CREATE OR REPLACE FUNCTION check_daily_free_lootbox(p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN NOT EXISTS (
    SELECT 1 
    FROM loot_boxes 
    WHERE user_id = p_user_id 
      AND box_type = 'daily_free'
      AND created_at >= CURRENT_DATE
  );
END;
$$ LANGUAGE plpgsql;

-- 创建每日免费盲盒
CREATE OR REPLACE FUNCTION create_daily_free_lootbox(p_user_id UUID)
RETURNS UUID AS $$
DECLARE
  v_lootbox_id UUID;
BEGIN
  -- 检查今天是否已经创建
  IF NOT check_daily_free_lootbox(p_user_id) THEN
    RAISE EXCEPTION 'Daily free lootbox already created today';
  END IF;
  
  INSERT INTO loot_boxes (user_id, box_type, box_rarity, source, expires_at)
  VALUES (
    p_user_id, 
    'daily_free', 
    'common', 
    '每日免费盲盒',
    CURRENT_DATE + INTERVAL '1 day'  -- 明天 00:00 过期
  )
  RETURNING id INTO v_lootbox_id;
  
  RETURN v_lootbox_id;
END;
$$ LANGUAGE plpgsql;

-- 开启盲盒（生成奖励）
CREATE OR REPLACE FUNCTION open_lootbox(p_lootbox_id UUID)
RETURNS TABLE (
  reward_type TEXT,
  reward_id TEXT,
  rarity TEXT,
  quantity INTEGER
) AS $$
DECLARE
  v_box_rarity TEXT;
  v_user_id UUID;
  v_cat_image_id UUID;
  v_cat_rarity TEXT;
  v_random NUMERIC;
BEGIN
  -- 获取盲盒信息
  SELECT box_rarity, user_id INTO v_box_rarity, v_user_id
  FROM loot_boxes
  WHERE id = p_lootbox_id AND is_opened = FALSE;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Lootbox not found or already opened';
  END IF;
  
  -- 根据盲盒稀有度决定奖励
  v_random := random();
  
  -- 普通盲盒概率
  IF v_box_rarity = 'common' THEN
    IF v_random < 0.80 THEN
      v_cat_rarity := 'common';
    ELSIF v_random < 0.95 THEN
      v_cat_rarity := 'rare';
    ELSE
      v_cat_rarity := 'epic';
    END IF;
  -- 银色盲盒概率
  ELSIF v_box_rarity = 'silver' THEN
    IF v_random < 0.50 THEN
      v_cat_rarity := 'rare';
    ELSIF v_random < 0.90 THEN
      v_cat_rarity := 'epic';
    ELSE
      v_cat_rarity := 'legendary';
    END IF;
  -- 金色盲盒概率
  ELSIF v_box_rarity = 'gold' THEN
    IF v_random < 0.60 THEN
      v_cat_rarity := 'epic';
    ELSIF v_random < 0.90 THEN
      v_cat_rarity := 'legendary';
    ELSE
      v_cat_rarity := 'mythic';
    END IF;
  -- 彩虹盲盒（保底传说）
  ELSE
    IF v_random < 0.50 THEN
      v_cat_rarity := 'legendary';
    ELSE
      v_cat_rarity := 'mythic';
    END IF;
  END IF;
  
  -- 随机选择对应稀有度的猫图
  SELECT cir.cat_image_id INTO v_cat_image_id
  FROM cat_image_rarity cir
  WHERE cir.rarity = v_cat_rarity
  ORDER BY random()
  LIMIT 1;
  
  -- 插入奖励记录
  INSERT INTO loot_box_rewards (loot_box_id, reward_type, reward_id, rarity)
  VALUES (p_lootbox_id, 'cat_image', v_cat_image_id::TEXT, v_cat_rarity);
  
  -- 自动加入用户收藏
  INSERT INTO user_collections (user_id, cat_image_id, emotion_label)
  SELECT v_user_id, v_cat_image_id, ci.emotion_label
  FROM cat_images ci
  WHERE ci.id = v_cat_image_id
  ON CONFLICT (user_id, cat_image_id) DO NOTHING;
  
  -- 标记盲盒已开启
  UPDATE loot_boxes
  SET is_opened = TRUE, opened_at = NOW()
  WHERE id = p_lootbox_id;
  
  -- 返回奖励
  RETURN QUERY
  SELECT lbr.reward_type, lbr.reward_id, lbr.rarity, lbr.quantity
  FROM loot_box_rewards lbr
  WHERE lbr.loot_box_id = p_lootbox_id;
END;
$$ LANGUAGE plpgsql;

-- 定时任务：清理过期的每日免费盲盒
CREATE OR REPLACE FUNCTION cleanup_expired_lootboxes()
RETURNS INTEGER AS $$
DECLARE
  v_deleted_count INTEGER;
BEGIN
  DELETE FROM loot_boxes
  WHERE box_type = 'daily_free'
    AND is_opened = FALSE
    AND expires_at < NOW();
  
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  RETURN v_deleted_count;
END;
$$ LANGUAGE plpgsql;

-- 更新猫图稀有度（定时任务，每小时运行）
CREATE OR REPLACE FUNCTION update_cat_image_rarity()
RETURNS VOID AS $$
BEGIN
  INSERT INTO cat_image_rarity (cat_image_id, rarity, rarity_score)
  SELECT 
    ci.id,
    CASE 
      WHEN score > 1000 THEN 'mythic'
      WHEN score > 500 THEN 'legendary'
      WHEN score > 100 THEN 'epic'
      WHEN score > 50 THEN 'rare'
      ELSE 'common'
    END as rarity,
    score
  FROM (
    SELECT 
      ci.id,
      (ci.likes_count * 1.0 + 
       COALESCE(uc_count.count, 0) * 2.0 + 
       ci.share_count * 3.0) * 
       LEAST(1.0, EXTRACT(EPOCH FROM (NOW() - ci.created_at)) / (30 * 24 * 60 * 60)) as score
    FROM cat_images ci
    LEFT JOIN (
      SELECT cat_image_id, COUNT(*) as count
      FROM user_collections
      GROUP BY cat_image_id
    ) uc_count ON uc_count.cat_image_id = ci.id
  ) ci
  ON CONFLICT (cat_image_id) 
  DO UPDATE SET 
    rarity = EXCLUDED.rarity,
    rarity_score = EXCLUDED.rarity_score,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;
```

**UI 设计要点**：
- **首页盲盒入口**：
  - 右上角固定位置，显示盲盒图标 + 未开启数量徽章
  - 每日免费盲盒刷新时，图标闪烁动画 + "NEW" 标签
  - 点击进入盲盒库存页面
  
- **盲盒库存页面**：
  - 顶部：今日免费盲盒（大卡片，突出显示）
    - 显示倒计时："距离过期还有 8 小时"
    - "立即开启"按钮（主要 CTA）
  - 下方：其他盲盒网格（按稀有度排序）
    - 每个盲盒显示：类型、来源、获得时间
    - 长按可查看盲盒详情（概率说明）
  - 底部：盲盒历史入口
  
- **开盒页面**：
  - 全屏沉浸式体验
  - 中央：3D 旋转的盲盒模型
  - 底部："开启"按钮（大号，带呼吸动画）
  - 右上角："跳过动画"按钮（小号，半透明）
  - 背景：渐变色 + 粒子效果
  
- **结果展示页面**：
  - 顶部：稀有度标签（带颜色和图标）
  - 中央：猫图大图展示（带边框和特效）
  - 猫图下方：情绪标签 + 点赞数 + 收藏数
  - 额外奖励区域（如果有）：
    - 徽章/称号/道具卡片，横向滑动展示
  - 底部操作栏：
    - "加入收藏"（如果还没收藏）
    - "分享"（生成炫耀卡片）
    - "继续"（返回库存页面）
  
- **批量开盒页面**：
  - 选择模式：勾选多个盲盒
  - "一键开启 x5"按钮
  - 快速动画：盒子依次打开（每个 0.5 秒）
  - 结果汇总页面：
    - 统计卡片：各稀有度数量
    - 所有猫图缩略图网格
    - "查看详情"可逐个查看
  
- **盲盒历史页面**：
  - 时间线展示所有开过的盲盒
  - 每条记录显示：日期、盲盒类型、获得奖励
  - 顶部统计卡片：
    - 累计开启次数
    - 稀有度分布饼图
    - 欧皇指数（大号数字 + 进度条）
  - 筛选选项：按稀有度、按时间
  
- **概率说明页面**（透明度）：
  - 每种盲盒的详细概率表
  - 保底机制说明（如果有）
  - 稀有度颜色图例
  - 符合游戏行业透明度要求

---

### 9. 情绪徽章系统 🏅

**功能描述**：
- 用户通过完成特定成就解锁徽章，展示在个人主页
- 徽章类型：
  - **基础徽章**：首次上传、首次匹配、首次点赞
  - **收集徽章**：解锁 10/20/26 种情绪
  - **社交徽章**：获得 100/500/1000 点赞、关注 10 人
  - **活跃徽章**：连续打卡 7/30/100 天
  - **挑战徽章**：完成 10/50 次每日挑战
  - **稀有徽章**：上传被选为"周榜冠军"的猫图
- 徽章有不同等级（铜银金），显示获得日期

**用户价值**：
- 成就感：可视化的进步和荣誉
- 炫耀资本：稀有徽章的社交价值
- 长期目标：持续使用的动力

**技术实现**：
```typescript
interface Badge {
  id: string;
  name: string;
  description: string;
  icon_url: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlock_condition: string;  // JSON 描述解锁条件
}

interface UserBadge {
  id: string;
  user_id: string;
  badge_id: string;
  unlocked_at: string;
}

// 数据库表
CREATE TABLE badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  icon_url TEXT,
  rarity TEXT NOT NULL,
  unlock_condition JSONB NOT NULL
);

CREATE TABLE user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  badge_id UUID REFERENCES badges(id),
  unlocked_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, badge_id)
);
```

**UI 设计要点**：
- 徽章墙：网格展示所有徽章，未解锁显示灰色剪影
- 徽章详情：点击查看解锁条件和进度
- 个人主页：展示最珍贵的 3-5 个徽章
- 解锁动画：徽章从灰色变彩色 + 闪光效果

---

### 10. 情绪 AI 对话 💬

**功能描述**：
- 用户可以和 AI 进行情绪对话，AI 扮演"情绪导师"角色
- 对话场景：
  - 用户描述心情 → AI 推荐猫图 + 给出情绪建议
  - 用户上传猫图 → AI 分析情绪 + 询问用户是否有类似感受
  - 用户询问"为什么我最近总是 anxious" → AI 分析用户的情绪日历趋势
- 对话历史保存，用户可以回顾

**用户价值**：
- 情感陪伴：AI 的倾听和回应
- 自我认知：通过对话了解自己的情绪模式
- 趣味互动：拟人化的 AI 角色

**技术实现**：
```typescript
interface ChatMessage {
  id: string;
  user_id: string;
  role: 'user' | 'assistant';
  content: string;
  cat_image_id: string | null;  // 如果消息包含猫图
  created_at: string;
}

// 数据库表
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  cat_image_id UUID REFERENCES cat_images(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_chat_messages_user ON chat_messages(user_id, created_at DESC);
```

**UI 设计要点**：
- 聊天界面：类似微信的对话气泡
- AI 头像：可爱的猫咪形象
- 快捷回复：预设选项（如"我想看开心的猫"）
- 猫图卡片：在对话中嵌入猫图，可点击查看大图

---

## 用户增长与留存策略

### 新用户引导（Onboarding）

1. **欢迎页**：简短动画介绍 MoodCat 的核心玩法
2. **首次任务**：
   - 上传第一张猫图 → 解锁"新手"徽章
   - 完成第一次心情匹配 → 获得免费盲盒
   - 收藏第一张猫图 → 开启图鉴系统
3. **引导提示**：气泡提示引导用户探索各个功能

### 每日回访理由

- 每日免费盲盒（00:00 刷新）
- 每日情绪挑战（限时奖励）
- 情绪日历打卡（连续天数）
- 查看排行榜更新（每周一刷新）
- 查看关注用户的新动态

### 社交传播机制

- **分享卡片**：精美的猫图 + 情绪标签，带 MoodCat 水印
- **邀请奖励**：邀请好友注册，双方各获得 3 个盲盒
- **故事分享**：情绪故事可以分享到社交媒体
- **排行榜炫耀**：上榜用户可以生成"我是本周猫王"的分享图

### 长期留存机制

- **收集完成度**：图鉴系统的长期目标
- **社交关系**：关注的用户形成社交网络
- **个人数据**：情绪日历的历史记录价值
- **社区身份**：徽章、称号、排名的社会认同

---

## 技术架构调整

### 用户认证系统

由于新增社交功能，需要引入用户认证。采用**匿名/登录混合模式**，降低注册门槛。

#### 匿名 vs 登录功能对比

| 功能 | 匿名用户 | 登录用户 |
|------|---------|---------|
| 上传猫图（AI 分析） | ✅ | ✅ |
| 心情匹配（查看猫图） | ✅ | ✅ |
| 浏览社区广场 | ✅ | ✅ |
| 查看排行榜 | ✅ | ✅ |
| 情绪日历打卡 | ❌ 需要登录 | ✅ |
| 收藏图鉴 | ❌ 需要登录 | ✅ |
| 开盲盒 | ❌ 需要登录 | ✅ |
| 同心情匹配 + 私信 | ❌ 需要登录 | ✅ |
| 关注、评论、点赞 | ❌ 需要登录 | ✅ |

#### 用户表设计

```typescript
// 使用 Supabase Auth
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// 用户表
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE,
  username TEXT UNIQUE NOT NULL,  -- 支持中英文、数字、下划线
  display_name TEXT,  -- 显示名称（可以有空格、emoji）
  avatar_url TEXT,
  bio TEXT,
  wallet_address TEXT UNIQUE,  -- Web3 钱包地址（预留）
  web3_enabled BOOLEAN DEFAULT FALSE,  -- 是否启用 Web3 功能（预留）
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT username_length CHECK (char_length(username) >= 2 AND char_length(username) <= 20),
  CONSTRAINT username_format CHECK (username ~ '^[\u4e00-\u9fa5a-zA-Z0-9_]+$')  -- 中文、英文、数字、下划线
);

CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_wallet ON users(wallet_address) WHERE wallet_address IS NOT NULL;
```

#### 昵称规则

- **username**（唯一标识）：
  - 长度：2-20 字符
  - 允许：中文、英文、数字、下划线
  - 不允许：空格、特殊符号
  - 全局唯一
  - 示例：`小明`、`xiaoming`、`小明_123`、`MoodCat爱好者`

- **display_name**（显示名称）：
  - 可以包含空格、emoji
  - 示例：`小明 😊`、`Mood Cat Lover 🐱`
  - UI 中优先显示 display_name，如果为空则显示 username

#### 登录方式

- Email + Password（传统方式）
- Google OAuth（推荐，降低注册门槛）
- Apple Sign In（iOS 必需）

#### 引导注册策略

**场景 1：匿名用户上传第 3 张猫图**
```
提示："你已经上传了 3 张猫图！注册账号可以：
       ✨ 开启每日免费盲盒
       ✨ 收集 26 种情绪图鉴
       ✨ 找到和你同心情的朋友"
按钮：[注册领取奖励] [稍后再说]
```

**场景 2：匿名用户尝试点击"打卡"**
```
提示："打卡功能需要登录哦～注册只需 10 秒！"
按钮：[快速注册] [取消]
```

**场景 3：匿名用户停留超过 5 分钟**
```
底部浮窗："注册 MoodCat，解锁完整体验 🎁"
```

#### 关联现有表

```sql
-- 关联用户 ID（可选，匿名用户为 NULL）
ALTER TABLE cat_images ADD COLUMN uploaded_by UUID REFERENCES users(id);
ALTER TABLE daily_mood_records ADD COLUMN user_id UUID NOT NULL REFERENCES users(id);

-- 匿名上传的猫图不关联用户
CREATE INDEX idx_cat_images_uploader ON cat_images(uploaded_by) WHERE uploaded_by IS NOT NULL;
```

### 私信功能设计

#### 触发条件（避免骚扰）

采用**情绪缘分解锁机制**：
- 两个用户达成 3 天同心情 → 系统提示"你和 @小明 已经 3 天情绪同步了，要不要聊聊？"
- 点击后发送私信请求，对方可以接受/拒绝
- 接受后开启永久私信通道

#### 私信表设计

```typescript
interface DirectMessage {
  id: string;
  conversation_id: string;  // 会话 ID（两个用户共享）
  sender_id: string;
  receiver_id: string;
  content: string;
  message_type: 'text' | 'cat_image' | 'system';  // 消息类型
  cat_image_id: string | null;  // 如果是猫图消息
  is_read: boolean;
  created_at: string;
}

interface Conversation {
  id: string;
  user_a_id: string;
  user_b_id: string;
  last_message_at: string;
  unread_count_a: number;  // user_a 的未读数
  unread_count_b: number;  // user_b 的未读数
  status: 'pending' | 'active' | 'blocked';  // 会话状态
  created_at: string;
}

// 数据库表
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_a_id UUID NOT NULL,
  user_b_id UUID NOT NULL,
  last_message_at TIMESTAMPTZ DEFAULT now(),
  unread_count_a INTEGER DEFAULT 0,
  unread_count_b INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_a_id, user_b_id),
  CONSTRAINT ordered_users CHECK (user_a_id < user_b_id),
  CONSTRAINT valid_status CHECK (status IN ('pending', 'active', 'blocked'))
);

CREATE INDEX idx_conversations_users ON conversations(user_a_id, user_b_id);
CREATE INDEX idx_conversations_last_message ON conversations(last_message_at DESC);

CREATE TABLE direct_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id),
  sender_id UUID NOT NULL REFERENCES users(id),
  receiver_id UUID NOT NULL REFERENCES users(id),
  content TEXT NOT NULL,
  message_type TEXT DEFAULT 'text',
  cat_image_id UUID REFERENCES cat_images(id),
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT valid_message_type CHECK (message_type IN ('text', 'cat_image', 'system'))
);

CREATE INDEX idx_direct_messages_conversation ON direct_messages(conversation_id, created_at DESC);
CREATE INDEX idx_direct_messages_unread ON direct_messages(receiver_id, is_read) WHERE is_read = FALSE;
```

#### 私信功能特色

1. **情绪标签显示**：聊天界面顶部显示双方今日情绪
2. **共同情绪日历**：查看历史上哪些天你们情绪相同
3. **情绪同步提醒**：当对方今天选择了和你相同的情绪时，收到通知
4. **猫图快捷发送**：聊天中可以快速分享收藏的猫图
5. **消息已读状态**：显示对方是否已读

#### UI 设计要点

- 聊天界面：类似微信的对话气泡
- 顶部显示：对方昵称 + 今日情绪 emoji
- 猫图消息：大图展示，可点击查看详情
- 输入框：文字输入 + 猫图选择按钮
- 会话列表：显示最后一条消息 + 未读数量

### 实时功能

使用 Supabase Realtime 实现：
- 私信实时推送
- 评论区实时更新
- 在线人数统计
- 点赞数实时变化

```typescript
// 订阅私信更新
supabase
  .channel(`conversation:${conversationId}`)
  .on('postgres_changes', 
    { event: 'INSERT', schema: 'public', table: 'direct_messages', filter: `conversation_id=eq.${conversationId}` },
    (payload) => {
      // 显示新消息
    }
  )
  .subscribe();

// 订阅评论更新
supabase
  .channel('comments')
  .on('postgres_changes', 
    { event: 'INSERT', schema: 'public', table: 'comments' },
    (payload) => {
      // 更新评论列表
    }
  )
  .subscribe();
```

### Web3 功能预留（Phase 2）

#### 设计理念

采用**渐进式 Web3 升级策略**，从 Web2 平滑过渡到 Web3：

**Phase 1（当前 MVP）**：
- ✅ 预留钱包连接入口（UI 占位）
- ✅ 在首页/关于页面添加 Banner："🔮 Web3 功能即将上线：NFT 铸造、$MOOD 代币、链上交易市场"
- ✅ 数据库预留 wallet_address 字段
- ✅ 收集用户 Email（用于 Phase 2 通知）

**Phase 2（Web3 升级）**：
- 🔮 钱包连接（MetaMask、WalletConnect）
- 🔮 NFT 铸造（传说/神话级猫图）
- 🔮 $MOOD 代币经济
- 🔮 NFT 交易市场

#### 技术准备

```typescript
// 预留钱包接口
interface WalletConnection {
  address: string | null;
  chainId: number | null;
  isConnected: boolean;
}

// 用户表已添加钱包字段
// wallet_address TEXT UNIQUE
// web3_enabled BOOLEAN DEFAULT FALSE

// NFT 元数据结构（预留）
interface CatNFTMetadata {
  name: string;
  description: string;
  image: string;
  attributes: {
    emotion: EmotionLabel;
    rarity: 'legendary' | 'mythic';
    upload_date: string;
    likes_count: number;
  };
}
```

#### $MOOD 代币经济设计（Phase 2）

**赚取 $MOOD**：
- 上传猫图：+10 $MOOD
- 完成每日挑战：+50 $MOOD
- 达成情绪知己：+100 $MOOD
- 猫图进入周榜 Top 10：+500 $MOOD
- 社交互动（点赞、评论）：+1-5 $MOOD

**消费 $MOOD**：
- 购买特殊盲盒：100-500 $MOOD
- 铸造 NFT：1000 $MOOD
- 解锁 VIP 功能：500 $MOOD/月
- 打赏其他用户：自定义金额

#### UI 占位设计

```typescript
// 导航栏添加"钱包"按钮（灰色，不可点击）
<button disabled className="opacity-50">
  🔮 钱包（即将上线）
</button>

// 首页 Banner
<div className="bg-gradient-to-r from-purple-500 to-pink-500 p-4 rounded-lg">
  <h3>🔮 Web3 功能即将上线</h3>
  <p>NFT 铸造、$MOOD 代币、链上交易市场</p>
  <button>了解更多</button>
</div>
```

#### 技术选型（Phase 2）

- **区块链**：Polygon 或 Base（低 Gas 费）
- **钱包连接**：WalletConnect + RainbowKit
- **智能合约**：ERC-721（NFT）+ ERC-20（$MOOD）
- **存储**：IPFS（NFT 元数据和图片）

- **图片 CDN**：Supabase Storage + Cloudflare CDN
- **分页加载**：瀑布流、评论区使用虚拟滚动
- **缓存策略**：排行榜、热门内容使用 Redis 缓存（可选）
- **懒加载**：图片懒加载，减少首屏加载时间

### AI 模型选择与成本优化

#### 使用 Claude 3 Haiku（成本优化方案）

**模型选择**：
- ✅ **Claude 3 Haiku**（推荐）
  - 速度快（< 1 秒响应）
  - 成本低（比 Sonnet 便宜 10 倍）
  - 质量足够（情绪识别准确度 > 90%）
  - 支持图片识别（Vision）

**定价**：
- Input: $0.25 / 1M tokens
- Output: $1.25 / 1M tokens

**成本估算**：

| 用户规模 | 每日上传 | 每日匹配 | 每日成本 | 每月成本 |
|---------|---------|---------|---------|---------|
| 100 DAU | 50 次 | 100 次 | $0.017 | $0.50 |
| 500 DAU | 250 次 | 500 次 | $0.085 | $2.50 |
| 1000 DAU | 500 次 | 1000 次 | $0.165 | $5.00 |
| 5000 DAU | 2500 次 | 5000 次 | $0.825 | $25.00 |

**API 配置**：

```typescript
// api/analyze.ts 和 api/mood-match.ts
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// 使用 Haiku 模型
const model = "claude-3-haiku-20240307";

// 图片分析
const response = await anthropic.messages.create({
  model: model,
  max_tokens: 1024,
  messages: [
    {
      role: "user",
      content: [
        {
          type: "image",
          source: {
            type: "base64",
            media_type: "image/jpeg",
            data: base64Image,
          },
        },
        {
          type: "text",
          text: `分析这张猫的照片，判断猫的情绪状态。
请以 JSON 格式返回：
{
  "emotion_label": "happy" | "calm" | "sleepy" | ... (26种情绪之一),
  "confidence": 0-100,
  "description": "简要描述猫的情绪状态"
}
只返回 JSON，不要其他内容。`
        }
      ]
    }
  ]
});

// 心情匹配
const response = await anthropic.messages.create({
  model: model,
  max_tokens: 512,
  messages: [
    {
      role: "user",
      content: `用户描述了自己的心情："${mood_text}"
请分析这段文字的情绪，并映射到以下猫的情绪标签之一：
happy, calm, sleepy, curious, annoyed, anxious, resigned, dramatic, sassy, clingy, zoomies, suspicious, smug, confused, hangry, sad, angry, scared, disgusted, surprised, loved, bored, ashamed, tired, disappointed, melancholy

请以 JSON 格式返回：
{
  "emotion_label": "标签之一",
  "reasoning": "简要说明映射理由"
}
只返回 JSON，不要其他内容。`
    }
  ]
});
```

**省钱策略**：

1. **结果缓存**：
```typescript
// 缓存常见心情描述的结果
const moodCache = new Map<string, EmotionLabel>();

async function analyzeMood(mood_text: string) {
  const cacheKey = mood_text.toLowerCase().trim();
  if (moodCache.has(cacheKey)) {
    return moodCache.get(cacheKey);  // 不调用 API
  }
  
  const result = await callClaudeAPI(mood_text);
  moodCache.set(cacheKey, result);
  return result;
}
```

2. **Prompt 优化**：
   - 缩短 Prompt 长度
   - 减少不必要的说明
   - 直接要求 JSON 输出

3. **质量监控**：
   - 如果 Haiku 准确度不够，可以切换回 Sonnet
   - 只需改一行代码：`const model = "claude-3-5-sonnet-20241022"`

---

## 数据分析与迭代

### MVP 阶段数据分析方案

**Phase 1（MVP）**：使用 Supabase 内置工具，延后集成第三方分析

#### 方案 A：Supabase Dashboard（免费，内置）
- 直接在 Supabase 后台查看：
  - 表的行数（用户数、上传数、盲盒开启数）
  - 简单的 SQL 查询
  - 实时数据库活动

#### 方案 B：手动 SQL 查询

```sql
-- 快速查看关键指标（在 Supabase SQL Editor 运行）

-- 今日活跃用户（DAU）
SELECT COUNT(DISTINCT user_id) as dau
FROM daily_mood_records
WHERE date = CURRENT_DATE;

-- 总用户数
SELECT COUNT(*) FROM users;

-- 今日上传数
SELECT COUNT(*) FROM cat_images
WHERE DATE(created_at) = CURRENT_DATE;

-- 留存率查询
WITH first_visit AS (
  SELECT user_id, MIN(DATE(created_at)) as first_date
  FROM daily_mood_records
  GROUP BY user_id
),
return_visit AS (
  SELECT 
    fv.user_id,
    fv.first_date,
    DATE(dmr.created_at) as return_date,
    DATE(dmr.created_at) - fv.first_date as days_diff
  FROM first_visit fv
  JOIN daily_mood_records dmr ON fv.user_id = dmr.user_id
  WHERE DATE(dmr.created_at) > fv.first_date
)
SELECT 
  first_date,
  COUNT(DISTINCT user_id) as new_users,
  COUNT(DISTINCT CASE WHEN days_diff = 1 THEN user_id END) as day1_retention,
  COUNT(DISTINCT CASE WHEN days_diff = 7 THEN user_id END) as day7_retention,
  COUNT(DISTINCT CASE WHEN days_diff = 30 THEN user_id END) as day30_retention
FROM return_visit
GROUP BY first_date
ORDER BY first_date DESC;
```

#### 方案 C：创建分析视图

```sql
-- 创建每日统计视图
CREATE VIEW analytics_daily_stats AS
SELECT 
  DATE(created_at) as date,
  COUNT(DISTINCT user_id) as dau,
  COUNT(*) as total_checkins
FROM daily_mood_records
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- 查询最近 7 天数据
SELECT * FROM analytics_daily_stats
WHERE date >= CURRENT_DATE - INTERVAL '7 days';
```

### Phase 2：集成 Google Analytics 4

**等用户量起来后（DAU > 100）再集成**：
- Google Analytics 4（完全免费）
- 实时数据
- 自定义事件追踪
- 用户路径分析
- 留存率报告

### 关键指标（KPI）

**MVP 阶段关注**：
- **DAU/MAU**：日活/月活用户数
- **留存率**：次日留存、7 日留存、30 日留存
- **注册转化率**：匿名用户 → 注册用户
- **核心功能使用率**：
  - 上传猫图次数
  - 心情匹配次数
  - 盲盒开启次数
  - 同心情匹配次数

**Phase 2 关注**：
- 社交互动：点赞、评论、关注、私信数量
- 内容生产：每日上传猫图数量
- 收集完成度：图鉴解锁率
- Web3 转化率：钱包连接、NFT 铸造

### A/B 测试计划（Phase 2）

- 盲盒稀有度概率调整
- 每日挑战难度和奖励
- 推荐算法优化
- UI 布局和交互方式

---

## 技术栈总结

### 前端
- React 18 + TypeScript
- Vite（构建工具）
- Tailwind CSS（样式）
- Redux Toolkit（状态管理）
- React Router（路由）

### 后端
- Vercel Edge Functions（API）
- Supabase（数据库 + 存储 + 认证 + 实时）

### AI
- Claude 3 Haiku（图片分析 + 心情匹配）

### 部署
- Vercel（前端 + API）
- Supabase（数据库 + 存储）

### 成本估算（月）

**MVP 阶段（100 DAU）**：
- Supabase：$0（免费层）
- Vercel：$0（Hobby 层）
- Claude API：$0.50
- **总计：$0.50/月**

**成长阶段（1000 DAU）**：
- Supabase：$25（Pro 层）
- Vercel：$20（Pro 层）
- Claude API：$5
- **总计：$50/月**

**规模化阶段（10000 DAU）**：
- Supabase：$25-100（根据使用量）
- Vercel：$20-50（根据流量）
- Claude API：$50
- **总计：$95-200/月**

---

## 实施优先级

### Phase 1：核心社交功能（MVP）- 4-6 周
1. 用户认证系统（Supabase Auth + Google OAuth）
2. 匿名/登录混合模式
3. 情绪日历基础版
4. 收集图鉴基础版
5. 点赞和评论
6. **今日同心情匹配核心功能**（重点）
7. **私信功能**（情绪缘分解锁）

### Phase 2：游戏化机制 - 3-4 周
1. 每日挑战
2. 徽章系统基础版
3. 排行榜
4. **情绪盲盒完整系统**（重点）
   - 盲盒类型和稀有度
   - 开盒动画
   - 奖励系统
5. Web3 UI 占位（钱包入口 + Banner）

### Phase 3：深度社交 - 4-5 周
1. 关注系统
2. 情绪社区广场
3. 情绪故事
4. **情绪缘分与连接等级**
5. **同心情广场增强功能**（聊天、共鸣墙）

### Phase 4：Web3 升级 - 待定
1. 钱包连接（MetaMask、WalletConnect）
2. NFT 铸造系统
3. $MOOD 代币经济
4. NFT 交易市场

### Phase 5：AI 增强与优化 - 持续迭代
1. 情绪 AI 对话
2. 个性化推荐算法
3. 情绪趋势分析
4. 性能优化和 A/B 测试
5. Google Analytics 4 集成

---

## 总结

通过以上 10 个核心功能，MoodCat 将从单次使用的工具转变为：

1. **每日习惯**：日历打卡、每日挑战、免费盲盒
2. **收集游戏**：图鉴系统、徽章系统、稀有猫图
3. **社交平台**：评论互动、关注好友、情绪社区
4. **创作空间**：情绪故事、分享卡片
5. **情感陪伴**：AI 对话、情绪追踪

这些功能相互配合，形成完整的用户留存闭环，让用户有理由每天回来，并在社区中找到归属感和乐趣。


---

## 两大核心功能深度解析

### 🌟 今日同心情匹配：社交破冰的杀手锏

**为什么这个功能能提升留存？**

1. **即时情感共鸣**
   - 传统社交产品的痛点：不知道和谁聊、聊什么
   - 同心情匹配解决方案：共同情绪是天然的话题破冰器
   - 心理学依据：情感共鸣是人类最强的社交驱动力之一

2. **降低社交门槛**
   - 不需要精心准备的自我介绍
   - 不需要担心"冷场"
   - 预设的快捷回复让害羞用户也能轻松互动

3. **制造"命中注定"的感觉**
   - "今天有 42 人和你一样" → 归属感
   - "你和 @小明 连续 7 天情绪同步" → 缘分感
   - "情绪知己"、"灵魂伴侣"称号 → 特殊关系认同

4. **每日新鲜感**
   - 每天的情绪不同，匹配到的人也不同
   - 持续的新鲜感驱动每日回访
   - 可能遇到"老朋友"（之前匹配过的人），增加惊喜

**数据指标预期**：
- 使用同心情匹配功能的用户，次日留存率提升 30-50%
- 发生过社交互动（打招呼、聊天）的用户，7 日留存率提升 60-80%
- 达成"情绪知己"关系的用户，30 日留存率 > 85%

**与竞品的差异化**：
- 传统社交产品：基于兴趣、地理位置、外貌匹配
- MoodCat：基于实时情绪状态匹配
- 优势：更真实、更有温度、更容易产生深度连接

---

### 🎁 情绪盲盒：每日回访的成瘾机制

**为什么盲盒能提升留存？**

1. **变量奖励机制**（心理学核心）
   - 斯金纳箱实验：不确定的奖励比确定的奖励更能驱动行为
   - 每次开盒都有"这次会不会出传说"的期待
   - 多巴胺分泌 → 成瘾性 → 每日回访

2. **固定的回访理由**
   - 每天 00:00 刷新 → 固定的时间锚点
   - "今天的盲盒还没开" → FOMO（错失恐惧）
   - 不累积机制 → 必须每天来，否则浪费

3. **收集完成度驱动**
   - 稀有度系统 → 收集欲
   - "我还差 3 张传说猫图就集齐了" → 长期目标
   - 限定猫图（季节性）→ 紧迫感

4. **社交货币价值**
   - 开出稀有猫图 → 可以炫耀
   - "我的欧皇指数 85%，你呢？" → 社交话题
   - 分享开盒视频 → 病毒传播

5. **多层次奖励**
   - 主要奖励：猫图（满足收集欲）
   - 额外奖励：徽章、称号（满足成就感）
   - 道具奖励：双倍点赞卡（实用价值）
   - 虚拟货币：情绪币（经济系统）

**数据指标预期**：
- 开启过盲盒的用户，次日留存率提升 40-60%
- 连续 7 天开盲盒的用户，30 日留存率 > 80%
- 获得过稀有猫图的用户，分享率提升 3-5 倍

**盲盒设计的平衡性**：
- 避免过度氪金：每日免费盲盒 + 任务盲盒，保证 F2P 用户体验
- 概率透明：公开所有概率，符合法规要求
- 保底机制：连续开 X 个盲盒必出稀有（可选，防止用户流失）
- 非 P2W：稀有猫图只是收藏价值，不影响核心功能

---

## 两大功能的协同效应

**1. 社交 + 盲盒 = 社交货币循环**
```
开盲盒 → 获得稀有猫图 → 分享到同心情广场 → 
其他用户点赞/评论 → 社交互动 → 建立关系 → 
一起完成任务 → 获得更多盲盒 → 循环
```

**2. 每日双重回访理由**
- 早上：开每日免费盲盒（5 分钟）
- 晚上：记录今日心情 + 匹配同心情好友（10-30 分钟）
- 结果：每天至少 2 次打开 App

**3. 数据飞轮**
```
更多用户记录心情 → 同心情匹配池更大 → 
匹配质量更高 → 社交体验更好 → 
用户更愿意每日记录 → 更多猫图上传 → 
盲盒奖励池更丰富 → 开盒体验更好 → 
用户更愿意完成任务 → 更多互动 → 循环
```

**4. 长期关系建立路径**
```
Day 1: 通过同心情匹配认识 → 打招呼
Day 3: 连续 3 天同心情 → 开始聊天
Day 7: 达成"情绪知己" → 互相关注
Day 30: 达成"灵魂伴侣" → 成为真正的朋友
期间：一起开盲盒、分享稀有猫图、完成挑战
```

---

## 风险与应对

### 风险 1：社交骚扰
- **应对**：
  - 匿名模式选项
  - 举报和拉黑功能
  - AI 内容审核（敏感词过滤）
  - 限制每日打招呼次数（防止骚扰）

### 风险 2：盲盒成瘾性过强
- **应对**：
  - 每日免费盲盒只有 1 个（不鼓励过度消费）
  - 任务盲盒获取有上限
  - 不引入付费购买盲盒（至少 MVP 阶段）
  - 健康游戏提示

### 风险 3：用户疲劳
- **应对**：
  - 定期更新限定猫图（季节性内容）
  - 新情绪标签扩展（保持新鲜感）
  - 特殊活动（如"情绪周"、"盲盒节"）
  - 社区 UGC 内容（用户创作的故事）

### 风险 4：冷启动问题
- **应对**：
  - 初期用 AI 生成的"虚拟用户"填充同心情广场
  - 邀请机制：邀请好友获得奖励
  - KOL/网红合作：引入种子用户
  - 地推活动：线下猫咖、宠物店合作

---

## 实施路线图更新

### Phase 1：核心社交功能（MVP）- 4-6 周
1. 用户认证系统（Supabase Auth）
2. 情绪日历基础版
3. 收集图鉴基础版
4. 点赞和评论
5. **今日同心情匹配核心功能**（重点）

### Phase 2：游戏化机制 - 3-4 周
1. 每日挑战
2. 徽章系统基础版
3. 排行榜
4. **情绪盲盒完整系统**（重点）
   - 盲盒类型和稀有度
   - 开盒动画
   - 奖励系统

### Phase 3：深度社交 - 4-5 周
1. 关注系统
2. 情绪社区广场
3. 情绪故事
4. **情绪缘分与连接等级**
5. **同心情广场增强功能**（聊天、共鸣墙）

### Phase 4：AI 增强与优化 - 持续迭代
1. 情绪 AI 对话
2. 个性化推荐算法
3. 情绪趋势分析
4. 性能优化和 A/B 测试
