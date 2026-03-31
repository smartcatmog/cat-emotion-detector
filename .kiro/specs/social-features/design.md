# MoodCat 社交娱乐功能设计文档

## 概述

本文档描述 MoodCat 社交娱乐功能的技术设计方案，包括数据库设计、API 设计、前端组件设计和技术选型。

## 技术栈

- **前端**：React 18 + TypeScript + Vite + Tailwind CSS
- **后端**：Vercel Edge Functions
- **数据库**：Supabase (PostgreSQL)
- **存储**：Supabase Storage
- **认证**：Supabase Auth
- **实时**：Supabase Realtime
- **AI**：Claude 3 Haiku
- **部署**：Vercel

## 数据库设计

### 用户表

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  wallet_address TEXT UNIQUE,  -- Web3 预留
  web3_enabled BOOLEAN DEFAULT FALSE,  -- Web3 预留
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT username_length CHECK (char_length(username) >= 2 AND char_length(username) <= 20),
  CONSTRAINT username_format CHECK (username ~ '^[\u4e00-\u9fa5a-zA-Z0-9_]+$')
);

CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_wallet ON users(wallet_address) WHERE wallet_address IS NOT NULL;
```

### 情绪日历表

```sql
CREATE TABLE daily_mood_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  date DATE NOT NULL,
  cat_image_id UUID REFERENCES cat_images(id),
  mood_text TEXT,
  emotion_label TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, date)
);

CREATE INDEX idx_daily_mood_user_date ON daily_mood_records(user_id, date DESC);
CREATE INDEX idx_daily_mood_date_emotion ON daily_mood_records(date, emotion_label);
```

### 用户收藏表

```sql
CREATE TABLE user_collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  cat_image_id UUID REFERENCES cat_images(id),
  emotion_label TEXT NOT NULL,
  collected_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, cat_image_id)
);

CREATE INDEX idx_user_collections_user ON user_collections(user_id, emotion_label);
```

### 每日挑战表

```sql
CREATE TABLE daily_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL UNIQUE,
  emotion_label TEXT NOT NULL,
  completed_count INTEGER DEFAULT 0
);

CREATE TABLE user_challenge_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  challenge_id UUID REFERENCES daily_challenges(id),
  completed_at TIMESTAMPTZ DEFAULT now(),
  badge_earned TEXT,
  UNIQUE(user_id, challenge_id)
);
```

### 同心情匹配表

```sql
CREATE TABLE same_mood_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_a_id UUID NOT NULL,
  user_b_id UUID NOT NULL,
  emotion_label TEXT NOT NULL,
  matched_date DATE NOT NULL,
  interaction_type TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT ordered_users CHECK (user_a_id < user_b_id)
);

CREATE INDEX idx_same_mood_date_emotion ON same_mood_matches(matched_date, emotion_label);
CREATE INDEX idx_same_mood_users ON same_mood_matches(user_a_id, user_b_id);
```

### 情绪连接表

```sql
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
  CONSTRAINT ordered_users CHECK (user_a_id < user_b_id),
  CONSTRAINT valid_level CHECK (connection_level IN ('acquaintance', 'friend', 'soulmate'))
);

CREATE INDEX idx_emotion_connections_level ON emotion_connections(connection_level, same_emotion_count DESC);
```

### 私信表

```sql
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

### 盲盒表

```sql
CREATE TABLE loot_boxes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
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
```

### 猫图稀有度表

```sql
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
```

### 徽章表

```sql
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
  user_id UUID NOT NULL REFERENCES users(id),
  badge_id UUID REFERENCES badges(id),
  unlocked_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, badge_id)
);
```

### 评论表

```sql
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cat_image_id UUID REFERENCES cat_images(id),
  user_id UUID NOT NULL REFERENCES users(id),
  content TEXT NOT NULL,
  parent_comment_id UUID REFERENCES comments(id),
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_comments_cat_image ON comments(cat_image_id, created_at DESC);
CREATE INDEX idx_comments_parent ON comments(parent_comment_id);
```

### 关注表

```sql
CREATE TABLE user_follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID NOT NULL REFERENCES users(id),
  following_id UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(follower_id, following_id)
);

CREATE INDEX idx_user_follows_follower ON user_follows(follower_id);
CREATE INDEX idx_user_follows_following ON user_follows(following_id);
```

## API 设计

### 认证相关

#### POST /api/auth/signup
注册新用户

**Request:**
```typescript
{
  email: string;
  password: string;
  username: string;
  display_name?: string;
}
```

**Response:**
```typescript
{
  success: boolean;
  user?: User;
  error?: string;
}
```

#### POST /api/auth/login
用户登录

#### POST /api/auth/google
Google OAuth 登录

### 情绪日历相关

#### POST /api/mood/checkin
每日打卡

**Request:**
```typescript
{
  cat_image_id: string;
  mood_text?: string;
  emotion_label: string;
}
```

#### GET /api/mood/calendar?user_id={id}&month={YYYY-MM}
获取用户日历

**Response:**
```typescript
{
  records: DailyMoodRecord[];
  streak_days: number;
}
```

### 收藏相关

#### POST /api/collection/add
添加收藏

**Request:**
```typescript
{
  cat_image_id: string;
}
```

#### GET /api/collection?user_id={id}
获取用户收藏图鉴

**Response:**
```typescript
{
  collections: {
    emotion_label: string;
    count: number;
    latest_image: CatImage;
  }[];
  total_emotions_unlocked: number;
}
```

### 同心情匹配相关

#### GET /api/same-mood?emotion={label}&date={YYYY-MM-DD}
获取今日同心情用户

**Response:**
```typescript
{
  users: {
    user_id: string;
    username: string;
    avatar_url: string;
    mood_text: string;
    cat_image_url: string;
    same_emotion_count: number;
  }[];
  total_count: number;
}
```

#### POST /api/same-mood/greeting
发送打招呼

**Request:**
```typescript
{
  receiver_id: string;
  message: string;
}
```

### 私信相关

#### POST /api/messages/request
发送私信请求

#### POST /api/messages/send
发送消息

**Request:**
```typescript
{
  conversation_id: string;
  content: string;
  message_type: 'text' | 'cat_image';
  cat_image_id?: string;
}
```

#### GET /api/messages/conversations
获取会话列表

#### GET /api/messages?conversation_id={id}
获取会话消息

### 盲盒相关

#### GET /api/lootbox/daily-check
检查今日免费盲盒

**Response:**
```typescript
{
  available: boolean;
  lootbox_id?: string;
}
```

#### POST /api/lootbox/open
开启盲盒

**Request:**
```typescript
{
  lootbox_id: string;
}
```

**Response:**
```typescript
{
  rewards: {
    reward_type: string;
    reward_id: string;
    rarity: string;
  }[];
}
```

#### GET /api/lootbox/inventory
获取盲盒库存

### 排行榜相关

#### GET /api/leaderboard?type={type}&period={week|month|all}
获取排行榜

**type**: `popular_cats` | `contributors` | `collectors` | `streak`

## 前端组件设计

### 页面结构

```
src/
├── pages/
│   ├── CalendarPage.tsx          # 情绪日历
│   ├── CollectionPage.tsx        # 收藏图鉴
│   ├── SameMoodPage.tsx          # 同心情广场
│   ├── MessagesPage.tsx          # 私信列表
│   ├── ConversationPage.tsx      # 私信对话
│   ├── LootboxPage.tsx           # 盲盒库存
│   ├── LeaderboardPage.tsx       # 排行榜
│   └── ProfilePage.tsx           # 个人主页
├── components/
│   ├── auth/
│   │   ├── LoginModal.tsx
│   │   ├── SignupModal.tsx
│   │   └── AnonymousPrompt.tsx
│   ├── calendar/
│   │   ├── MonthView.tsx
│   │   ├── DayCell.tsx
│   │   └── StreakBadge.tsx
│   ├── collection/
│   │   ├── EmotionGrid.tsx
│   │   ├── EmotionCard.tsx
│   │   └── ProgressBar.tsx
│   ├── same-mood/
│   │   ├── UserCard.tsx
│   │   ├── GreetingModal.tsx
│   │   └── EmotionWall.tsx
│   ├── messages/
│   │   ├── ConversationList.tsx
│   │   ├── MessageBubble.tsx
│   │   └── ChatInput.tsx
│   ├── lootbox/
│   │   ├── LootboxCard.tsx
│   │   ├── OpenAnimation.tsx
│   │   └── RewardDisplay.tsx
│   └── leaderboard/
│       ├── RankingList.tsx
│       └── RankCard.tsx
└── hooks/
    ├── useAuth.ts
    ├── useCalendar.ts
    ├── useCollection.ts
    ├── useSameMood.ts
    ├── useMessages.ts
    └── useLootbox.ts
```

### 关键组件

#### CalendarPage

```typescript
const CalendarPage = () => {
  const { user } = useAuth();
  const { records, streakDays, loading } = useCalendar(user?.id);
  
  return (
    <div>
      <StreakBadge days={streakDays} />
      <MonthView records={records} />
    </div>
  );
};
```

#### SameMoodPage

```typescript
const SameMoodPage = () => {
  const { emotion, date } = useParams();
  const { users, totalCount } = useSameMood(emotion, date);
  
  return (
    <div>
      <h2>今天有 {totalCount} 人和你一样感到 {emotion}</h2>
      <div className="grid grid-cols-2 gap-4">
        {users.map(user => (
          <UserCard key={user.user_id} user={user} />
        ))}
      </div>
    </div>
  );
};
```

#### LootboxPage

```typescript
const LootboxPage = () => {
  const { lootboxes, openLootbox } = useLootbox();
  const [opening, setOpening] = useState(false);
  
  const handleOpen = async (id: string) => {
    setOpening(true);
    const rewards = await openLootbox(id);
    // 显示开盒动画和奖励
  };
  
  return (
    <div>
      {lootboxes.map(box => (
        <LootboxCard 
          key={box.id} 
          box={box} 
          onOpen={handleOpen} 
        />
      ))}
    </div>
  );
};
```

## AI 集成

### Claude 3 Haiku 配置

```typescript
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const model = "claude-3-haiku-20240307";

// 图片分析
export async function analyzeCatEmotion(base64Image: string) {
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
  
  const content = response.content[0];
  if (content.type === 'text') {
    return JSON.parse(content.text);
  }
}

// 心情匹配
export async function matchMoodToEmotion(moodText: string) {
  const response = await anthropic.messages.create({
    model: model,
    max_tokens: 512,
    messages: [
      {
        role: "user",
        content: `用户描述了自己的心情："${moodText}"
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
  
  const content = response.content[0];
  if (content.type === 'text') {
    return JSON.parse(content.text);
  }
}
```

### 结果缓存

```typescript
const moodCache = new Map<string, string>();

export async function matchMoodWithCache(moodText: string) {
  const cacheKey = moodText.toLowerCase().trim();
  
  if (moodCache.has(cacheKey)) {
    return moodCache.get(cacheKey);
  }
  
  const result = await matchMoodToEmotion(moodText);
  moodCache.set(cacheKey, result.emotion_label);
  
  return result.emotion_label;
}
```

## 实时功能

### Supabase Realtime

```typescript
// 订阅私信更新
export function subscribeToConversation(conversationId: string, callback: (message: DirectMessage) => void) {
  return supabase
    .channel(`conversation:${conversationId}`)
    .on('postgres_changes', 
      { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'direct_messages', 
        filter: `conversation_id=eq.${conversationId}` 
      },
      (payload) => {
        callback(payload.new as DirectMessage);
      }
    )
    .subscribe();
}

// 订阅同心情匹配更新
export function subscribeToSameMood(emotion: string, date: string, callback: () => void) {
  return supabase
    .channel(`same_mood:${emotion}:${date}`)
    .on('postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'daily_mood_records',
        filter: `emotion_label=eq.${emotion}`
      },
      callback
    )
    .subscribe();
}
```

## 性能优化

### 图片优化
- 使用 Supabase Storage 的图片转换功能
- 缩略图：`?width=300&height=300`
- WebP 格式：`?format=webp`

### 数据库优化
- 所有查询都有对应的索引
- 使用 `LIMIT` 限制返回数量
- 分页加载（offset + limit）

### 前端优化
- React.lazy() 懒加载页面
- 虚拟滚动（react-window）
- 图片懒加载（Intersection Observer）
- 防抖和节流

## 部署架构

```
用户
  ↓
Vercel CDN
  ↓
Vercel Edge Functions (API)
  ↓
Supabase (数据库 + 存储 + 认证)
  ↓
Claude API (AI 分析)
```

## 成本估算

### 100 DAU
- Supabase: $0 (免费层)
- Vercel: $0 (Hobby 层)
- Claude API: $0.50
- **总计: $0.50/月**

### 1000 DAU
- Supabase: $25 (Pro 层)
- Vercel: $20 (Pro 层)
- Claude API: $5
- **总计: $50/月**

### 10000 DAU
- Supabase: $25-100
- Vercel: $20-50
- Claude API: $50
- **总计: $95-200/月**
