# 部署检查清单

## 前置条件检查

- [ ] 已收集 37 张真猫照片
- [ ] 所有图片格式为 JPG 或 PNG
- [ ] 所有图片大小不超过 500KB
- [ ] 所有图片尺寸至少 400×400px

## 文件名检查

确保文件名完全匹配以下列表（包括中文字符和扩展名）：

### 能量×社交类（10 只）
- [ ] 困困猫.png 或 困困猫.jpg
- [ ] 躲柜子猫.jpg
- [ ] 炸毛猫.jpg
- [ ] 舔毛猫.jpg
- [ ] 委屈猫.jpg
- [ ] 暴冲猫.jpg
- [ ] 高冷观察猫.jpg
- [ ] 晒太阳猫.jpg
- [ ] 撒欢猫.jpg
- [ ] 黏人猫.jpg

### 焦虑系（3 只）
- [ ] 绷紧猫.jpg
- [ ] 玻璃猫.jpg
- [ ] 假睡猫.jpg

### 处境触发类（8 只）
- [ ] 周日晚上猫.jpg
- [ ] 中午猫.jpg
- [ ] 失眠猫.jpg
- [ ] 换季猫.jpg
- [ ] 假期结束猫.jpg
- [ ] 考前猫.jpg
- [ ] 迷路猫.jpg
- [ ] 生日猫.jpg

### 关系触发类（8 只）
- [ ] 装死猫.jpg
- [ ] 等门猫.jpg
- [ ] 炸锅猫.jpg
- [ ] 被遗忘猫.jpg
- [ ] 嫉妒猫.jpg
- [ ] 讨好猫.jpg
- [ ] 边界猫.jpg
- [ ] 冷战猫.jpg

### 成长触发类（6 只）
- [ ] 脱毛猫.jpg
- [ ] 刚洗完澡猫.jpg
- [ ] 窗台猫.jpg
- [ ] 独自修炼猫.jpg
- [ ] 老地方猫.jpg
- [ ] 第一次猫.jpg

### 补充类（2 只）
- [ ] 纸箱猫.jpg
- [ ] 发呆猫.jpg

## 上传步骤

### 1. 本地准备
```bash
# 确保所有图片都在一个文件夹中
ls -la /path/to/cat/images/
# 应该看到 37 个文件
```

### 2. 复制到项目
```bash
# 方式 A：使用命令行
cp /path/to/cat/images/* public/cats/

# 方式 B：手动拖拽
# 在 IDE 中打开 public/cats/ 文件夹
# 将所有图片拖拽进去
```

### 3. 验证文件
```bash
# 检查文件是否都在正确位置
ls -la public/cats/
# 应该看到 37 个图片文件 + .gitkeep
```

### 4. 提交到 Git
```bash
# 添加所有文件
git add public/cats/

# 检查状态
git status
# 应该看到 37 个新文件

# 提交
git commit -m "Add 37 real cat images for cat signature feature"

# 推送
git push origin main
```

### 5. 验证部署
```bash
# 等待 Vercel 部署完成（通常 1-2 分钟）
# 检查 Vercel Dashboard 或 GitHub Actions

# 部署完成后，访问网站
# https://cat-emotion-detector.vercel.app
```

## 测试步骤

### 1. 基础测试
- [ ] 访问网站首页
- [ ] 导航到"今日猫系签"页面
- [ ] 页面加载正常

### 2. 功能测试
- [ ] 输入心情文本（例如："今天很累"）
- [ ] 点击"生成我的今日猫签"
- [ ] 等待 API 响应

### 3. 图片显示测试
- [ ] 确认显示真猫照片而不是插画
- [ ] 图片加载正常（不模糊、不变形）
- [ ] 图片与猫的心态相符

### 4. 多只猫测试
- [ ] 测试至少 5 只不同的猫
- [ ] 每只猫都显示对应的真猫照片
- [ ] 没有 404 或加载错误

### 5. 浏览器兼容性测试
- [ ] Chrome/Edge
- [ ] Firefox
- [ ] Safari
- [ ] 移动浏览器

## 故障排查

### 问题：图片显示为插画而不是真猫照片

**检查清单：**
1. [ ] 文件是否在 `public/cats/` 目录
2. [ ] 文件名是否完全匹配（包括中文字符）
3. [ ] 文件格式是否为 JPG 或 PNG
4. [ ] 是否已提交到 Git
5. [ ] Vercel 部署是否完成
6. [ ] 浏览器缓存是否已清除（Ctrl+Shift+Delete）

**解决方案：**
```bash
# 1. 检查文件
ls -la public/cats/ | grep "困困猫"

# 2. 检查 Git 状态
git status public/cats/

# 3. 清除浏览器缓存并刷新
# Ctrl+Shift+Delete 打开清除缓存对话框

# 4. 检查网络请求
# 打开浏览器开发者工具 (F12)
# 进入 Network 标签
# 查看图片请求是否返回 200 OK
```

### 问题：某些图片加载失败

**检查清单：**
1. [ ] 文件是否损坏
2. [ ] 文件大小是否超过 500KB
3. [ ] 文件名是否有特殊字符

**解决方案：**
```bash
# 1. 检查文件大小
ls -lh public/cats/ | grep "困困猫"

# 2. 重新上传该文件
# 删除旧文件，上传新文件

# 3. 提交并部署
git add public/cats/
git commit -m "Fix cat image: 困困猫"
git push origin main
```

### 问题：部署失败

**检查清单：**
1. [ ] 文件名是否包含特殊字符
2. [ ] 文件总大小是否超过限制
3. [ ] Git 提交是否成功

**解决方案：**
```bash
# 1. 检查 Git 日志
git log --oneline -5

# 2. 检查 Vercel 部署日志
# 访问 Vercel Dashboard 查看错误信息

# 3. 重新推送
git push origin main --force
```

## 回滚步骤

如果部署出现问题，可以回滚：

```bash
# 1. 查看历史提交
git log --oneline

# 2. 回滚到上一个提交
git revert HEAD

# 3. 推送回滚
git push origin main

# Vercel 会自动部署回滚版本
```

## 成功标志

✅ 部署成功的标志：

1. Vercel Dashboard 显示"Deployment Successful"
2. 网站可以访问
3. 生成猫签时显示真猫照片
4. 所有 37 只猫都有对应的图片
5. 没有控制台错误

## 性能指标

部署后检查性能：

- [ ] 页面加载时间 < 3 秒
- [ ] API 响应时间 < 500ms
- [ ] 图片加载时间 < 2 秒
- [ ] 没有 404 错误
- [ ] 没有 CORS 错误

## 文档检查

- [ ] `QUICK_START_CAT_IMAGES.md` - 快速开始指南
- [ ] `CAT_IMAGES_INTEGRATION.md` - 完整集成指南
- [ ] `CAT_SYSTEM_ARCHITECTURE.md` - 系统架构文档
- [ ] `IMPLEMENTATION_STATUS.md` - 实现状态
- [ ] `DEPLOYMENT_CHECKLIST.md` - 本文件

## 最后检查

在宣布完成前，请确认：

- [ ] 所有 37 只猫都有真猫照片
- [ ] 没有任何图片显示为插画
- [ ] 网站在生产环境中正常运行
- [ ] 没有控制台错误或警告
- [ ] 移动设备上也能正常显示
- [ ] 所有文档都已更新

## 完成！

当所有检查项都打勾后，37 只猫的真猫图片集成就完成了！🎉

用户现在可以：
- 输入心情
- 获得匹配的猫签
- 看到真实的猫咪照片
- 获得个性化的建议和恢复方式
