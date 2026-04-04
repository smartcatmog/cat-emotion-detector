# 快速开始：上传37只猫的真猫图片

## 3步完成集成

### 1️⃣ 准备图片文件

收集37张真猫照片，命名如下：

```
困困猫.png
躲柜子猫.jpg
炸毛猫.jpg
舔毛猫.jpg
委屈猫.jpg
暴冲猫.jpg
高冷观察猫.jpg
晒太阳猫.jpg
撒欢猫.jpg
黏人猫.jpg
绷紧猫.jpg
玻璃猫.jpg
假睡猫.jpg
周日晚上猫.jpg
中午猫.jpg
失眠猫.jpg
换季猫.jpg
假期结束猫.jpg
考前猫.jpg
迷路猫.jpg
生日猫.jpg
装死猫.jpg
等门猫.jpg
炸锅猫.jpg
被遗忘猫.jpg
嫉妒猫.jpg
讨好猫.jpg
边界猫.jpg
冷战猫.jpg
脱毛猫.jpg
刚洗完澡猫.jpg
窗台猫.jpg
独自修炼猫.jpg
老地方猫.jpg
第一次猫.jpg
纸箱猫.jpg
发呆猫.jpg
```

### 2️⃣ 上传到项目

```bash
# 将所有图片复制到 public/cats/ 目录
cp /path/to/your/cat/images/* public/cats/

# 或者手动拖拽到 public/cats/ 文件夹
```

### 3️⃣ 提交并部署

```bash
git add public/cats/
git commit -m "Add 37 real cat images"
git push origin main
```

Vercel 会自动部署，1-2分钟后访问网站就能看到真猫照片。

## 验证

1. 访问 https://cat-emotion-detector.vercel.app
2. 进入"今日猫系签"页面
3. 输入心情，生成猫签
4. 应该看到真猫照片 ✅

## 如果图片加载失败

检查清单：
- [ ] 文件名是否完全匹配（包括中文字符）
- [ ] 文件格式是否为 JPG 或 PNG
- [ ] 文件大小是否超过 500KB
- [ ] 是否已提交到 Git
- [ ] Vercel 部署是否完成

## 需要帮助？

查看详细文档：
- `CAT_IMAGES_INTEGRATION.md` - 完整集成指南
- `src/data/CAT_IMAGES_SETUP.md` - 技术细节
