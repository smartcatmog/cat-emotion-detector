# MoodCat 需求文档

## 简介

MoodCat — AI 猫咪情绪检测器。用户上传猫照片，AI 标注情绪；用户输入心情，匹配对应猫图。
技术栈：React + TypeScript + Vite + Tailwind + Supabase + Claude API，部署 Vercel。

## 术语

- **Emotion_Label**: 26种情绪标签（happy, calm, sleepy, curious, annoyed, anxious, resigned, dramatic, sassy, clingy, zoomies, suspicious, smug, confused, hangry, sad, angry, scared, disgusted, surprised, loved, bored, ashamed, tired, disappointed, melancholy）
- **Cat_Record**: Supabase 中一条记录，含图片URL、Emotion_Label、Pet_Name、Social_Link
- **Mood_Input**: 用户描述心情的文字（支持中英文）

## R1: 猫图上传 + AI 标注

用户上传猫照片 → AI 分析情绪 → 存入数据库。

- 支持 JPEG/PNG/WebP，≤10MB
- Claude API 返回 Emotion_Label + 置信度 + 描述
- 可选填 Pet_Name 和 Social_Link
- 可选"加入 Gallery"（默认开启）
- 两条路径（前端直调 / API 代理）均须存图到 gallery 并返回 gallery_id

## R2: 心情匹配

用户输入心情 → AI 映射到 Emotion_Label → 从数据库查询匹配猫图。

- 支持中英文输入（"惆怅"→ melancholy，"活着好累"→ tired）
- 匹配结果随机展示，≥5条时展示6张，<5条时展示3张
- 无匹配时提示"No cats match this mood yet"并引导上传

## R3: 26种情绪标签

覆盖人类基本情感，AI Prompt 包含所有标签的中英文语义映射。
数据库 CHECK 约束、前端 EMOJI 映射、API Prompt 三处须保持同步。

## R4: 标签纠正

AI 判断不准时，用户可纠正。

- 分析结果页：点"Not accurate" → 选标签 → 直接更新数据库 + 保存 feedback
- 猫卡片上："标签不对？纠正一下" → 选标签 → 更新数据库
- 只允许从26个标签中选择，不支持自由输入

## R5: 心情反馈

Mood Match 结果不准时，用户可反馈。

- "不是这个感觉？告诉我你真正的心情" → 展示26个标签
- 选择后保存到 mood_feedback 表（原始输入、AI判断、用户纠正）
- 选择后用新标签重新搜索猫图

## R6: 分享卡片

Canvas 合成分享图，支持自定义文字。

- 卡片内容：猫图 + Emotion_Label + emoji + 用户文字 + MoodCat logo
- 尺寸 1080x1350（4:5），适合 Instagram/微信
- 用户可输入≤20字自定义文案，实时预览
- 下载 PNG / Web Share API 系统分享（不支持则降级下载）
- 快捷链接：X、Facebook、微博

## R7: 导航与品牌

- 品牌名：MoodCat
- 导航栏：Mood Match + Analyze + Star us（GitHub）
- 页脚：Annotate Data、History、Privacy、联系邮箱、Twitter
- 版权 © 2026 MoodCat

## R8: 互动功能

- Like：点赞猫图，调用 increment_likes RPC
- Tip（Demo）：£1/£2/£5/£10，明确标注"no money will be charged"
- Save：下载猫图原图

## R9: 错误处理

- API 失败显示用户友好提示
- 所有异步操作显示 loading 状态
- 图片格式/大小校验前置
