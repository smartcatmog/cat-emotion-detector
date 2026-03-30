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
