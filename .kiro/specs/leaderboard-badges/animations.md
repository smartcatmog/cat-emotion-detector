# 动画规格 - 原创猫咪角色动画

## 1. 猫咪角色动画

### 跳跃动画 (Jump)
- **触发**: 用户操作、成就解锁、排名变化
- **实现**: CSS keyframes
  - Y轴: 0 → -40px → 0 (缓动: cubic-bezier)
  - 持续时间: 0.6s
  - 重复: 1次或loop

### 摇尾巴动画 (Tail Wag)
- **触发**: 获得徽章、排名上升
- **实现**: CSS transform rotate
  - 尾巴旋转: -15° → 15° → -15°
  - 持续时间: 0.4s
  - 重复: 2-3次

### 眨眼动画 (Blink)
- **触发**: 闲置状态、定时循环
- **实现**: CSS scale/opacity
  - 眼睛: scale(1) → scale(0.1) → scale(1)
  - 持续时间: 0.2s
  - 间隔: 3-4s重复

---

## 2. 成就解锁动画

### 徽章出现 (Badge Pop)
- **触发**: 用户获得新徽章
- **实现**: 
  - 初始: scale(0) opacity(0)
  - 最终: scale(1) opacity(1)
  - 持续时间: 0.5s
  - 缓动: cubic-bezier(0.34, 1.56, 0.64, 1) (bounce)

### 闪光效果 (Shine)
- **触发**: 徽章出现后
- **实现**:
  - 背景渐变: 从左到右扫过
  - 持续时间: 1.5s
  - 重复: 2次
  - 颜色: rgba(255,255,255,0) → rgba(255,255,255,0.8) → rgba(255,255,255,0)

### 粒子效果 (Particles)
- **触发**: 徽章解锁时
- **实现**: SVG或CSS
  - 5-8个小星星/光点
  - 从徽章中心向外扩散
  - 持续时间: 0.8s
  - 透明度递减

---

## 3. 排行榜排名动画

### 数字滚动 (Number Roll)
- **触发**: 排行榜数据更新
- **实现**:
  - 从旧数值滚动到新数值
  - 持续时间: 0.8s
  - 缓动: ease-out
  - 示例: 1234 → 1567 (逐位滚动)

### 奖牌掉落 (Medal Drop)
- **触发**: 排名变化时
- **实现**:
  - 初始位置: 上方 (-100px)
  - 最终位置: 正常位置
  - 持续时间: 0.6s
  - 缓动: cubic-bezier(0.34, 1.56, 0.64, 1) (bounce)
  - 旋转: 0° → 360° (可选)

### 排名上升/下降指示 (Rank Change)
- **触发**: 排名变化
- **实现**:
  - 上升: ↑ 绿色 + 向上移动
  - 下降: ↓ 红色 + 向下移动
  - 持续时间: 0.4s
  - 然后淡出

---

## 4. 实现优先级

| 优先级 | 动画 | 组件 |
|--------|------|------|
| P1 | 徽章出现 + 闪光 | BadgeUnlock |
| P1 | 数字滚动 | LeaderboardPage |
| P2 | 猫咪跳跃 | CatCharacter |
| P2 | 奖牌掉落 | LeaderboardPage |
| P3 | 摇尾巴 | CatCharacter |
| P3 | 粒子效果 | BadgeUnlock |

---

## 5. 技术方案

### CSS Animations
- 简单动画: 跳跃、摇尾巴、眨眼、数字滚动
- 文件: `src/index.css` 或独立 `src/animations.css`

### SVG/Canvas
- 粒子效果: 使用 SVG 或 Canvas
- 文件: `src/components/ParticleEffect.tsx`

### React Components
- `CatCharacter.tsx` - 猫咪角色 + 动画控制
- `BadgeUnlock.tsx` - 徽章解锁动画
- `NumberRoll.tsx` - 数字滚动组件
- `MedalDrop.tsx` - 奖牌掉落动画

---

## 6. 集成点

- **LeaderboardPage**: 数字滚动、奖牌掉落、排名指示
- **CollectionPage**: 徽章出现、闪光、粒子效果
- **LootboxPage**: 猫咪跳跃、摇尾巴
- **全局**: 猫咪角色闲置动画 (可选)
