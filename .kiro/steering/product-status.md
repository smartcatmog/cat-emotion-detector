# MoodCat 产品状态

## 网站
- URL: https://cat-emotion-detector.vercel.app
- GitHub: https://github.com/smartcatmog/cat-emotion-detector.git
- Vercel 项目: cat-emotion-detector-frontend
- Supabase: https://gfrbubfyznmkqchwjhtn.supabase.co

## 技术栈
- 前端: React + TypeScript + Tailwind CSS + Vite
- 后端: Vercel Serverless Functions (api/ 目录)
- 数据库: Supabase (PostgreSQL)
- AI: Claude Sonnet 4.6 (Anthropic)

## 已完成功能
- ✅ 心情匹配（输入心情 → AI 匹配猫图）
- ✅ 猫图分析（上传猫图 → AI 分析情绪）
- ✅ 登录/注册（服务端认证，绕过 SES 沙箱）
- ✅ 情绪日历（打卡记录，修复了月末日期 bug）
- ✅ 收集图鉴（26 种情绪）
- ✅ 情绪盲盒（打卡获得，游客模式可体验）
- ✅ 同心情广场（显示用户名、连续天数、社交链接）
- ✅ NFT 铸造（4 个稀有度等级，可下载证书）
- ✅ 中英文切换（全页面支持）
- ✅ 退出登录

## 认证架构（重要）
- 使用自定义 session 管理，不依赖 Supabase SDK 客户端方法
- 原因：浏览器 SES 沙箱（MetaMask 等扩展）会阻止 Supabase SDK 的 Promise resolve
- 方案：前端 fetch('/api/auth') → 服务端认证 → 返回 session → 存入 localStorage (key: 'moodcat_session')
- 相关文件：src/hooks/useAuth.ts, src/components/LoginModal.tsx, api/auth.ts

## 待完成 / 已知问题
- ⏳ 需要在 Supabase 执行: ALTER TABLE users ADD COLUMN IF NOT EXISTS social_link TEXT;
- ⏳ 上传猫图页面（Preview）的文字还是英文（File name, File size, Cancel, Analyze 等）
- ⏳ 分析猫咪页面标题还是英文
- ⏳ NFT 下载图片比例可能还有问题（html2canvas 跨域图片限制）
- ⏳ 用户个人资料页（修改用户名、头像等）
- ⏳ 私信功能（目前只有社交链接）

## 数据库已执行的 SQL
- supabase-setup.sql
- supabase-users.sql
- supabase-auth-sync.sql
- supabase-cat-images.sql
- supabase-daily-mood-records.sql
- supabase-user-collections.sql
- supabase-loot-boxes.sql
- supabase-same-mood-matches.sql
- supabase-nft-feature.sql（NFT 字段 + get_next_nft_token_id 函数）

## 重要账号
- vivicui@gmail.com - 主账号，user_id: c450484c-48e2-4cfd-a397-88ab71e0bf40
  - 已手动更新 username 为 'Vivian'
