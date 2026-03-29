# Cat Emotion Detector - Deployment Guide

## 快速部署到Vercel (5分钟)

### 前置条件
- GitHub账号
- Vercel账号 (免费)
- Supabase账号 (免费)

### 步骤1: 准备GitHub仓库

```bash
# 初始化Git (如果还没有)
git init
git add .
git commit -m "Initial commit: Cat Emotion Detector MVP"

# 添加远程仓库
git remote add origin https://github.com/YOUR_USERNAME/cat-emotion-detector.git
git branch -M main
git push -u origin main
```

### 步骤2: 设置Supabase

1. 访问 https://supabase.com
2. 点击"New Project"
3. 填写项目信息:
   - Project Name: `cat-emotion-detector`
   - Database Password: 设置一个强密码
   - Region: 选择离你最近的地区
4. 等待项目创建 (2-3分钟)
5. 复制以下信息:
   - **Project URL**: Settings → API → Project URL
   - **Anon Key**: Settings → API → anon (public)

### 步骤3: 部署到Vercel

1. 访问 https://vercel.com
2. 点击"New Project"
3. 选择"Import Git Repository"
4. 选择你的 `cat-emotion-detector` 仓库
5. 配置环境变量:
   ```
   VITE_SUPABASE_URL=your-supabase-url
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   VITE_GOOGLE_VISION_API_KEY=AIzaSyC9yFMn5m826yEsnCoFlflYCVKOuryArIw
   ```
6. 点击"Deploy"
7. 等待部署完成 (2-3分钟)

### 步骤4: 验证部署

部署完成后，你会得到一个URL，例如:
```
https://cat-emotion-detector.vercel.app
```

访问这个URL，你应该能看到你的应用！

---

## 环境变量说明

| 变量 | 说明 | 获取方式 |
|------|------|---------|
| `VITE_SUPABASE_URL` | Supabase项目URL | Supabase Dashboard → Settings → API |
| `VITE_SUPABASE_ANON_KEY` | Supabase公开密钥 | Supabase Dashboard → Settings → API |
| `VITE_GOOGLE_VISION_API_KEY` | Google Vision API密钥 | 已配置 |

---

## 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产版本
npm run preview
```

---

## 常见问题

### Q: 部署后看不到样式?
A: 清除浏览器缓存，或者在Vercel中重新部署

### Q: 环境变量没有生效?
A: 在Vercel中重新部署，或者检查变量名是否正确

### Q: 如何更新已部署的应用?
A: 推送代码到GitHub，Vercel会自动部署

```bash
git add .
git commit -m "Update: Add new features"
git push origin main
```

---

## 下一步

1. ✅ 部署到Vercel
2. 🔄 集成Supabase数据库
3. 📊 添加数据标注功能
4. 🚀 收集用户反馈
5. 🤖 训练自己的模型

---

## 支持

有问题? 查看:
- [Vercel文档](https://vercel.com/docs)
- [Supabase文档](https://supabase.com/docs)
- [Vite文档](https://vitejs.dev)
