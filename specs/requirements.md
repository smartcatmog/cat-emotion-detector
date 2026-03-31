# Requirements Document

## Introduction

本文档定义 cat-emotion-detector 的 MVP 需求，聚焦两个核心功能：猫图上传 + AI 情绪标注（内容生产端），以及用户输入心情 → 匹配猫图（内容消费端）。

技术栈：React + TypeScript + Vite + Tailwind CSS + Supabase + Claude API，部署于 Vercel。

## Glossary

- **System**: cat-emotion-detector 网站应用
- **User**: 使用网站的访客（无需账号）
- **Uploader**: 上传猫照片的用户
- **Cat_Image**: 用户上传的猫照片文件
- **Emotion_Label**: Claude AI 分析猫照片后生成的情绪标签（如：happy、calm、anxious）
- **Cat_Record**: 存储在 Supabase 中的一条记录，包含 Cat_Image URL 和 Emotion_Label
- **Mood_Input**: 用户输入的描述自身心情的文字
- **Claude_API**: Anthropic Claude 的 API 服务
- **Database**: Supabase 数据库
- **Storage**: Supabase Storage 文件存储
- **Image_Gallery**: Database 中所有已存储的 Cat_Record 集合
- **Pet_Name**: Uploader 为其猫填写的可选名字字段
- **Social_Link**: Uploader 提供的可选社交媒体链接（如 Instagram、Twitter 等）

## Requirements

### Requirement 1: 猫图上传

**User Story:** 作为 Uploader，我想上传猫的照片，这样我可以为数据库贡献内容。

#### Acceptance Criteria

1. THE System SHALL 提供图片上传界面，支持用户选择本地 Cat_Image 文件
2. WHEN 用户选择文件时，THE System SHALL 仅接受 JPEG、PNG、WebP 格式的图片
3. IF 用户选择的文件不是支持的图片格式，THEN THE System SHALL 显示错误提示
4. IF 用户选择的文件超过 10MB，THEN THE System SHALL 显示文件过大的错误提示
5. WHEN 用户提交上传时，THE System SHALL 将 Cat_Image 上传至 Storage 并获取公开访问 URL

### Requirement 2: AI 情绪标注

**User Story:** 作为 Uploader，我想让 AI 自动分析猫的情绪，这样每张图片都有对应的情绪标签。

#### Acceptance Criteria

1. WHEN Cat_Image 上传成功后，THE System SHALL 调用 Claude_API 分析猫的情绪
2. THE Claude_API SHALL 返回包含情绪标签（Emotion_Label）和置信度的分析结果
3. WHEN Claude_API 返回分析结果时，THE System SHALL 将 Cat_Image URL 和 Emotion_Label 作为一条 Cat_Record 存入 Database
4. IF Claude_API 调用失败，THEN THE System SHALL 显示错误提示，并不写入 Database
5. WHEN 存储成功后，THE System SHALL 向用户展示分析结果，包括情绪标签和 AI 的简要说明

### Requirement 3: 分析结果解析

**User Story:** 作为开发者，我需要正确解析 Claude API 返回的数据，这样情绪标签可以准确存储和展示。

#### Acceptance Criteria

1. THE System SHALL 解析 Claude_API 返回的 JSON 格式分析结果，提取 Emotion_Label 和置信度
2. IF Claude_API 返回的数据格式不符合预期，THEN THE System SHALL 使用默认值并在控制台记录警告
3. THE System SHALL 验证置信度分数在 0 到 100 的范围内
4. FOR ALL 有效的 Cat_Record 对象，序列化存入 Database 后读取应产生等效的对象（round-trip property）

### Requirement 4: 用户心情输入

**User Story:** 作为 User，我想输入一段描述自己心情的文字，这样系统可以为我匹配合适的猫图。

#### Acceptance Criteria

1. THE System SHALL 提供文本输入框，允许用户输入 Mood_Input
2. IF 用户提交空的 Mood_Input，THEN THE System SHALL 提示用户输入内容
3. WHEN 用户提交 Mood_Input 时，THE System SHALL 调用 Claude_API 分析文字中的情绪关键词
4. THE Claude_API SHALL 从 Mood_Input 中提取对应的 Emotion_Label

### Requirement 5: 猫图匹配与展示

**User Story:** 作为 User，我想看到与我心情匹配的猫图，这样我可以获得情绪共鸣。

#### Acceptance Criteria

1. WHEN Claude_API 返回 Mood_Input 对应的 Emotion_Label 后，THE System SHALL 从 Database 中查询匹配该 Emotion_Label 的 Cat_Record
2. THE System SHALL 从匹配结果中随机选取最多 3 张 Cat_Image 展示给用户
3. IF Database 中没有匹配该 Emotion_Label 的 Cat_Record，THEN THE System SHALL 提示用户暂无匹配的猫图
4. IF Claude_API 分析 Mood_Input 失败，THEN THE System SHALL 显示错误提示
5. WHEN 展示匹配结果时，THE System SHALL 同时显示匹配到的 Emotion_Label，让用户了解系统识别到的情绪

### Requirement 6: 错误处理

**User Story:** 作为 User，当出现错误时，我希望收到清晰的提示，这样我知道发生了什么。

#### Acceptance Criteria

1. WHEN API 调用失败时，THE System SHALL 显示用户友好的错误消息，而非技术错误信息
2. WHEN 网络请求失败时，THE System SHALL 提示用户检查网络连接并重试
3. THE System SHALL 为所有异步操作显示加载状态，避免用户重复提交

### Requirement 7: 多图选择

**User Story:** 作为 User，我想从多张匹配的猫图中选择最喜欢的一张，这样我可以获得更满意的匹配体验。

#### Acceptance Criteria

1. WHEN Image_Gallery 中匹配某个 Emotion_Label 的 Cat_Record 数量大于等于 5 时，THE System SHALL 展示多张候选 Cat_Image 供用户选择
2. WHEN 展示多张候选 Cat_Image 时，THE System SHALL 允许用户从中选择一张最喜欢的 Cat_Image
3. WHILE Image_Gallery 中匹配某个 Emotion_Label 的 Cat_Record 数量少于 5 时，THE System SHALL 按照现有逻辑展示最多 3 张 Cat_Image，不提供选择功能
4. WHEN 用户选择一张 Cat_Image 后，THE System SHALL 高亮显示用户选中的图片

### Requirement 8: 宠物名字

**User Story:** 作为 Uploader，我想为上传的猫照片填写宠物的名字，这样当其他用户看到这张图片时可以认识我的猫。

#### Acceptance Criteria

1. WHEN Uploader 上传 Cat_Image 时，THE System SHALL 提供一个可选的 Pet_Name 输入框
2. IF Uploader 填写了 Pet_Name，THEN THE System SHALL 将 Pet_Name 与 Cat_Record 一起存入 Database
3. IF Uploader 未填写 Pet_Name，THEN THE System SHALL 正常完成上传流程，Pet_Name 字段存储为空值
4. WHEN Cat_Image 被匹配展示给其他 User 时，THE System SHALL 在图片旁显示对应的 Pet_Name（如果存在）
5. IF Cat_Record 的 Pet_Name 为空值，THEN THE System SHALL 不显示名字区域

### Requirement 9: 社交媒体链接

**User Story:** 作为 Uploader，我想在上传猫照片时附上自己的社交媒体链接，这样其他用户可以关注我。

#### Acceptance Criteria

1. WHEN Uploader 上传 Cat_Image 时，THE System SHALL 提供一个可选的 Social_Link 输入框
2. IF Uploader 填写了 Social_Link，THEN THE System SHALL 验证链接格式为有效的 URL
3. IF Social_Link 格式无效，THEN THE System SHALL 显示格式错误提示，并阻止提交
4. IF Uploader 填写了有效的 Social_Link，THEN THE System SHALL 将 Social_Link 与 Cat_Record 一起存入 Database
5. IF Uploader 未填写 Social_Link，THEN THE System SHALL 正常完成上传流程，Social_Link 字段存储为空值
6. WHEN Cat_Image 被匹配展示给其他 User 时，THE System SHALL 在图片旁显示可点击的 Social_Link（如果存在）
7. WHEN User 点击 Social_Link 时，THE System SHALL 在新标签页中打开该链接
8. IF Cat_Record 的 Social_Link 为空值，THEN THE System SHALL 不显示链接区域

### Requirement 10: 26种情绪标签体系

**User Story:** 作为 User，我希望系统能准确识别更丰富的情绪，包括悲伤、愤怒、害怕、疲惫、惆怅等人类基本情感。

#### Acceptance Criteria

1. THE System SHALL 支持以下26种 Emotion_Label：happy, calm, sleepy, curious, annoyed, anxious, resigned, dramatic, sassy, clingy, zoomies, suspicious, smug, confused, hangry, sad, angry, scared, disgusted, surprised, loved, bored, ashamed, tired, disappointed, melancholy
2. THE Claude_API 的 Prompt SHALL 包含所有26种标签及其中英文语义映射
3. THE Database 的 emotion_label 约束 SHALL 允许所有26种标签值
4. THE System 的前端 EMOTION_EMOJI 映射 SHALL 包含所有26种标签对应的 emoji
5. WHEN 用户输入中文情绪词（如"伤心"、"惆怅"、"活着好累"）时，Claude_API SHALL 准确映射到对应的 Emotion_Label

### Requirement 11: 情绪标签纠正

**User Story:** 作为 User，当 AI 的情绪判断不准确时，我想纠正标签，这样数据库中的猫图可以被正确匹配。

#### Acceptance Criteria

1. WHEN 分析结果展示后，THE System SHALL 提供"Not accurate"反馈按钮
2. WHEN User 点击"Not accurate"时，THE System SHALL 展示26种 Emotion_Label 供用户选择
3. WHEN User 选择正确的 Emotion_Label 时，THE System SHALL 更新 Database 中该 Cat_Record 的 emotion_label 字段
4. WHEN User 选择正确的 Emotion_Label 时，THE System SHALL 同时保存一条 feedback 记录
5. WHEN 在 Mood Match 结果页中，THE System SHALL 在每张猫卡片上提供"标签不对？纠正一下"按钮
6. WHEN User 在猫卡片上纠正标签时，THE System SHALL 直接更新该 Cat_Record 的 emotion_label

### Requirement 12: 心情匹配反馈

**User Story:** 作为 User，当系统对我的心情解读不准确时，我想告诉系统我真正的感受，这样可以帮助改进匹配。

#### Acceptance Criteria

1. WHEN Mood Match 结果展示后，THE System SHALL 在结果下方显示"不是这个感觉？告诉我你真正的心情"入口
2. WHEN User 点击该入口时，THE System SHALL 展示26种 Emotion_Label 和一个自由输入框
3. WHEN User 选择一个 Emotion_Label 时，THE System SHALL 保存反馈到 mood_feedback 表（包含原始输入、AI 判断、用户纠正）
4. WHEN User 选择一个 Emotion_Label 时，THE System SHALL 用该标签重新搜索匹配的猫图并更新展示

### Requirement 13: 分享卡片生成

**User Story:** 作为 User，我想把匹配到的猫图生成一张好看的分享卡片，带上自己的文字，分享到社交媒体。

#### Acceptance Criteria

1. WHEN User 点击猫卡片或结果页的"Share"按钮时，THE System SHALL 弹出分享卡片编辑界面
2. THE 分享卡片 SHALL 使用 Canvas 合成，包含：猫图、情绪标签+emoji、用户自定义文字、MoodCat logo
3. THE System SHALL 提供文字输入框，允许用户输入最多20个字符的自定义文案
4. WHEN 用户输入文字时，THE Canvas SHALL 实时更新预览
5. THE System SHALL 提供"下载"按钮，将卡片导出为 PNG 图片
6. THE System SHALL 提供"分享"按钮，在支持 Web Share API 的设备上调用系统分享菜单（支持带图片分享）
7. IF 设备不支持 Web Share API，THEN THE System SHALL 降级为下载图片
8. THE System SHALL 提供 X/Twitter、Facebook、微博的快捷分享链接
9. THE 卡片输出尺寸 SHALL 为 1080x1350（4:5比例），适合 Instagram 和微信朋友圈

### Requirement 14: 导航与品牌

**User Story:** 作为 User，我希望导航简洁好用，品牌有辨识度。

#### Acceptance Criteria

1. THE System 的品牌名 SHALL 为"MoodCat"
2. THE 导航栏 SHALL 仅包含核心入口：Mood Match 和 Analyze
3. THE 导航栏 SHALL 包含指向 GitHub 仓库的"Star us"链接
4. Annotate Data、History、Privacy 等次要功能 SHALL 放在页脚
5. THE 页脚 SHALL 包含联系邮箱和 Twitter 链接
6. THE 页脚版权年份 SHALL 为 2026

### Requirement 15: 打赏功能（Demo）

**User Story:** 作为 User，我想给喜欢的猫主人打赏表示感谢。

#### Acceptance Criteria

1. WHEN User 点击猫卡片上的"Tip"按钮时，THE System SHALL 弹出打赏弹窗
2. THE 打赏弹窗 SHALL 显示金额选项（£1, £2, £5, £10）
3. THE System SHALL 明确标注"Real payments coming soon — no money will be charged"
4. WHEN User 点击金额后，THE System SHALL 显示感谢信息并明确说明"No charge — payment integration coming soon"
