# Implementation Plan: Cat Emotion Detector - UI Enhancement & Social Features

## Overview

基于 React + TypeScript + Vite + Tailwind CSS + Supabase + Claude API 技术栈，实现猫图上传情绪分析和心情匹配两大核心功能，包含宠物名字和社交媒体链接等社交特性。任务按依赖关系排序：基础设施 → API 层 → 前端组件 → 集成联调。

## Tasks

- [ ] 1. 基础设施：数据库、类型定义和工具函数
  - [ ] 1.1 创建 TypeScript 类型定义文件 `src/lib/types.ts`
    - 定义 `EmotionLabel` 类型（6 个标准标签）
    - 定义 `CatRecord`、`ClaudeAnalysisResult`、`ClaudeMoodResult`、`AnalysisResult`、`MoodMatchResult` 接口
    - 定义 API 请求/响应接口 `AnalyzeResponse`、`MoodMatchRequest`、`MoodMatchResponse`
    - _Requirements: 3.1, 3.3, 3.4, 8.2, 9.4_

  - [ ] 1.2 创建验证工具函数 `src/lib/validators.ts`
    - 实现 `validateFile(file: File)` 函数：检查 MIME type（JPEG/PNG/WebP）和文件大小（≤10MB）
    - 实现 `validateMoodInput(text: string)` 函数：拒绝空字符串和纯空白字符串
    - 实现 `validateSocialLink(url: string)` 函数：验证 URL 格式（http/https 协议）
    - _Requirements: 1.2, 1.3, 1.4, 4.2, 9.2, 9.3_

  - [ ]* 1.3 编写验证函数的属性测试 `src/__tests__/validators.property.test.ts`
    - **Property 1: File validation accepts only valid format and size**
    - **Validates: Requirements 1.2, 1.4**
    - **Property 4: Whitespace-only mood input is rejected**
    - **Validates: Requirements 4.2**
    - **Property 10: URL validation accepts valid URLs and rejects invalid ones**
    - **Validates: Requirements 9.2, 9.3**

  - [ ] 1.4 创建解析工具函数 `src/lib/parsers.ts`
    - 实现 `parseAnalysisResult(json: string)` 函数：从 Claude 返回的 JSON 中提取 emotion_label、confidence、description，畸形 JSON 返回默认值
    - 实现 `parseMoodResult(json: string)` 函数：从 Claude 返回的 JSON 中提取 emotion_label，验证为标准标签之一
    - _Requirements: 3.1, 3.2, 3.3, 4.4_

  - [ ]* 1.5 编写解析函数的属性测试 `src/__tests__/parsers.property.test.ts`
    - **Property 2: Claude analysis response parsing extracts valid fields**
    - **Validates: Requirements 2.2, 3.1, 3.3**
    - **Property 5: Mood response parsing returns valid EmotionLabel**
    - **Validates: Requirements 4.4**

  - [ ] 1.6 创建选择逻辑函数 `src/lib/selectors.ts`
    - 实现 `selectRandomCats(cats: CatRecord[], max: number)` 函数：从列表中随机选取最多 max 条记录
    - 实现 `determineDisplayMode(totalMatches: number, cats: CatRecord[])` 函数：根据匹配总数决定 selection_mode 和返回数量
    - _Requirements: 5.2, 7.1, 7.3_

  - [ ]* 1.7 编写选择逻辑的属性测试 `src/__tests__/selectors.property.test.ts`
    - **Property 7: Random selection returns at most 3 items from source**
    - **Validates: Requirements 5.2**
    - **Property 9: Display mode threshold based on match count**
    - **Validates: Requirements 7.1, 7.3**

  - [ ] 1.8 创建错误格式化函数 `src/lib/errors.ts`
    - 实现 `formatUserError(error: unknown)` 函数：将技术错误转换为用户友好的中文提示，不暴露堆栈或状态码
    - _Requirements: 6.1, 6.2_

  - [ ]* 1.9 编写错误格式化的属性测试 `src/__tests__/errors.property.test.ts`
    - **Property 8: Error formatting produces user-friendly messages**
    - **Validates: Requirements 6.1**

  - [ ] 1.10 创建 Supabase 数据库表和 Storage bucket
    - 编写 SQL 迁移脚本创建 `cat_images` 表（含 id, image_url, emotion_label, confidence, description, pet_name, social_link, created_at 字段）
    - 添加 `emotion_label` 的 CHECK 约束和索引 `idx_cat_images_emotion`
    - 创建 `cat-images` 公开 Storage bucket
    - _Requirements: 1.5, 2.3, 3.4, 8.2, 9.4_

- [ ] 2. Checkpoint - 确保基础设施就绪
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 3. API 层：Vercel Edge Functions
  - [ ] 3.1 改造 `/api/analyze` 端点
    - 接收 multipart/form-data（图片文件 + 可选 pet_name + 可选 social_link）
    - 验证文件格式和大小，验证 social_link 格式（如提供）
    - 上传图片到 Supabase Storage，获取公开 URL
    - 将图片 base64 发送给 Claude API，使用设计文档中的情绪分析 Prompt
    - 解析 Claude 返回结果，使用 `parseAnalysisResult` 提取字段
    - 将 Cat_Record（含 pet_name、social_link）存入 Supabase Database
    - 返回 `AnalyzeResponse` 格式的 JSON
    - _Requirements: 1.2, 1.3, 1.4, 1.5, 2.1, 2.2, 2.3, 2.4, 2.5, 3.1, 3.2, 3.3, 8.2, 8.3, 9.2, 9.3, 9.4, 9.5_

  - [ ] 3.2 创建 `/api/mood-match` 端点
    - 接收 JSON body（mood_text 字段）
    - 验证 mood_text 非空（使用 `validateMoodInput`）
    - 调用 Claude API 分析心情文字，使用设计文档中的心情分析 Prompt
    - 解析 Claude 返回结果，使用 `parseMoodResult` 提取 emotion_label
    - 从 Supabase 查询匹配 emotion_label 的 Cat_Record（含 pet_name、social_link）
    - 根据匹配总数决定 selection_mode（≥5 返回最多 6 条，<5 返回最多 3 条）
    - 返回 `MoodMatchResponse` 格式的 JSON
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 5.1, 5.2, 5.3, 5.4, 5.5, 7.1, 7.3_

  - [ ]* 3.3 编写序列化 round-trip 属性测试 `src/__tests__/serialization.property.test.ts`
    - **Property 3: CatRecord serialization round-trip**
    - **Validates: Requirements 3.4, 8.2, 8.3, 9.4, 9.5**

  - [ ]* 3.4 编写数据库查询属性测试 `src/__tests__/query.property.test.ts`
    - **Property 6: Emotion query returns only matching records**
    - **Validates: Requirements 5.1**

- [ ] 4. Checkpoint - 确保 API 层功能正常
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 5. 前端组件：上传模式
  - [ ] 5.1 创建 `CatUploader` 组件 `src/components/CatUploader.tsx`
    - 文件选择器：接受 JPEG/PNG/WebP，选择后显示图片预览
    - 使用 `validateFile` 进行前端文件验证，无效时显示错误提示
    - 可选 Pet_Name 输入框（placeholder: "给你的猫起个名字吧"）
    - 可选 Social_Link 输入框（placeholder: "你的社交媒体链接"），实时验证 URL 格式
    - 提交按钮，提交时显示加载状态并禁用重复提交
    - 调用 `/api/analyze` 端点，成功后回调 `onUploadComplete`
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.1, 6.3, 8.1, 8.2, 8.3, 9.1, 9.2, 9.3_

  - [ ] 5.2 创建 `EmotionResult` 组件 `src/components/EmotionResult.tsx`
    - 展示分析结果：情绪标签、置信度、AI 描述
    - 展示上传的图片、宠物名字（如有）和社媒链接（如有）
    - _Requirements: 2.5, 8.4, 9.6_

  - [ ] 5.3 创建 `UploadPage` 页面 `src/pages/UploadPage.tsx`
    - 组合 `CatUploader` 和 `EmotionResult` 组件
    - 管理上传状态和分析结果状态
    - 使用 `ErrorMessage` 组件展示错误
    - _Requirements: 1.1, 2.5_

- [ ] 6. 前端组件：心情匹配模式
  - [ ] 6.1 创建 `MoodInput` 组件 `src/components/MoodInput.tsx`
    - 文本输入框 + 提交按钮
    - 使用 `validateMoodInput` 进行空输入验证
    - 提交时显示加载状态并禁用重复提交
    - 调用 `/api/mood-match` 端点，成功后回调 `onMatchComplete`
    - _Requirements: 4.1, 4.2, 6.3_

  - [ ] 6.2 创建 `CatGallery` 组件 `src/components/CatGallery.tsx`
    - 卡片网格展示匹配的猫图
    - 每张卡片显示图片、情绪标签
    - 当 `pet_name` 非空时显示宠物名字
    - 当 `social_link` 非空时显示可点击链接图标（`target="_blank"` + `rel="noopener noreferrer"`）
    - 多图选择模式（`selectionMode=true`）：展示候选图，用户可点击选择，选中图片高亮（边框 + 勾选标记）
    - 普通模式（`selectionMode=false`）：展示最多 3 张，无选择交互
    - _Requirements: 5.1, 5.2, 5.5, 7.1, 7.2, 7.3, 7.4, 8.4, 8.5, 9.6, 9.7, 9.8_

  - [ ]* 6.3 编写展示逻辑的属性测试 `src/__tests__/display.property.test.ts`
    - **Property 11: Pet name conditional display**
    - **Validates: Requirements 8.4, 8.5**
    - **Property 12: Social link conditional display**
    - **Validates: Requirements 9.6, 9.7, 9.8**

  - [ ] 6.4 创建 `MoodMatchPage` 页面 `src/pages/MoodMatchPage.tsx`
    - 组合 `MoodInput` 和 `CatGallery` 组件
    - 管理心情匹配状态和结果状态
    - 展示匹配到的 Emotion_Label
    - 无匹配时显示提示信息
    - 使用 `ErrorMessage` 组件展示错误
    - _Requirements: 4.1, 5.1, 5.3, 5.5_

- [ ] 7. 公共组件和错误处理
  - [ ] 7.1 创建 `ErrorMessage` 组件 `src/components/ErrorMessage.tsx`
    - 统一错误提示 UI，接收错误消息字符串
    - 使用 `formatUserError` 格式化技术错误
    - _Requirements: 6.1, 6.2_

  - [ ] 7.2 创建 `LoadingSpinner` 组件 `src/components/LoadingSpinner.tsx`
    - 统一加载状态 UI，用于所有异步操作
    - _Requirements: 6.3_

- [ ] 8. 集成和路由
  - [ ] 8.1 更新 `App.tsx` 路由和导航
    - 添加上传模式和心情匹配模式的路由
    - 添加页面间导航（Tab 切换或导航栏）
    - 确保所有组件正确连接
    - _Requirements: 1.1, 4.1_

  - [ ]* 8.2 编写集成测试
    - 测试上传流程端到端（mock API）
    - 测试心情匹配流程端到端（mock API）
    - 测试错误场景（网络失败、API 错误）
    - _Requirements: 1.1-1.5, 4.1-4.4, 5.1-5.5, 6.1-6.3_

- [ ] 9. Final Checkpoint - 确保所有功能正常
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- 每个任务引用了具体的需求编号，确保可追溯性
- Checkpoints 确保增量验证，避免问题累积
- 属性测试验证通用正确性属性，单元测试验证具体示例和边界情况
- Supabase 数据库表和 Storage bucket 需要在 Supabase Dashboard 或 CLI 中手动创建/执行 SQL
