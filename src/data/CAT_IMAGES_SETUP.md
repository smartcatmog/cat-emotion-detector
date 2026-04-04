# 37只猫真猫图片配置指南

## 快速开始

### 方式1：使用Supabase Storage（推荐）

1. **上传图片到Supabase**
   - 登录 Supabase Dashboard
   - 进入 Storage → 创建新 bucket: `cat-photos`
   - 上传37张猫图片，命名格式：`{cat_id}.jpg`
   - 例如：`kun_kun_mao.jpg`, `duo_guizi_mao.jpg` 等

2. **获取公开URL**
   - 每张图片都会有一个公开URL
   - 格式：`https://{project}.supabase.co/storage/v1/object/public/cat-photos/{cat_id}.jpg`

3. **更新 `cat-images.json`**
   ```json
   {
     "images": {
       "kun_kun_mao": "https://gfrbubfyznmkqchwjhtn.supabase.co/storage/v1/object/public/cat-photos/kun_kun_mao.jpg",
       "duo_guizi_mao": "https://gfrbubfyznmkqchwjhtn.supabase.co/storage/v1/object/public/cat-photos/duo_guizi_mao.jpg",
       ...
     }
   }
   ```

### 方式2：使用CDN或图床

- 上传到 Cloudinary、阿里云OSS、七牛云等
- 获取每张图片的公开URL
- 更新 `cat-images.json`

### 方式3：本地存储（开发用）

- 将图片放在 `public/cats/` 目录
- 更新 `cat-images.json`：
  ```json
  {
    "images": {
      "kun_kun_mao": "/cats/kun_kun_mao.jpg",
      ...
    }
  }
  ```

## 37只猫的ID列表

### 能量×社交类（10只）
- `kun_kun_mao` - 困困猫
- `duo_guizi_mao` - 躲柜子猫
- `zha_mao_mao` - 炸毛猫
- `tian_mao_mao` - 舔毛猫
- `wei_qu_mao` - 委屈猫
- `bao_chong_mao` - 暴冲猫
- `gaoleng_guancha_mao` - 高冷观察猫
- `shai_taiyang_mao` - 晒太阳猫
- `sa_huan_mao` - 撒欢猫
- `nian_ren_mao` - 黏人猫

### 焦虑系（3只）
- `beng_jin_mao` - 绷紧猫
- `boli_mao` - 玻璃猫
- `jia_shui_mao` - 假睡猫

### 处境触发类（8只）
- `zhouri_wanshang_mao` - 周日晚上猫
- `zhongwu_mao` - 中午猫
- `shimian_mao` - 失眠猫
- `huanji_mao` - 换季猫
- `jiaqijieshu_mao` - 假期结束猫
- `kaoshi_mao` - 考前猫
- `milu_mao` - 迷路猫
- `shengri_mao` - 生日猫

### 关系触发类（8只）
- `zhuangsi_mao` - 装死猫
- `dengmen_mao` - 等门猫
- `zhaguo_mao` - 炸锅猫
- `beiyiwang_mao` - 被遗忘猫
- `jidu_mao` - 嫉妒猫
- `taohao_mao` - 讨好猫
- `bianjie_mao` - 边界猫
- `lengzhan_mao` - 冷战猫

### 成长触发类（6只）
- `tuomao_mao` - 脱毛猫
- `gangxizaowan_mao` - 刚洗完澡猫
- `chuangtai_mao` - 窗台猫
- `duzilianxi_mao` - 独自修炼猫
- `laodifang_mao` - 老地方猫
- `diyici_mao` - 第一次猫

### 补充类（2只）
- `zhixiang_mao` - 纸箱猫
- `fadai_mao` - 发呆猫

## 图片要求

- **格式**：JPG 或 PNG
- **尺寸**：建议 400×400px 或更大
- **大小**：单张不超过 500KB
- **内容**：真实的猫咪照片，能体现该心态的表情/姿态

## 更新API

编辑 `api/social/cat-signature.ts` 中的 `CAT_IMAGES` 对象：

```typescript
const CAT_IMAGES: Record<string, string> = {
  kun_kun_mao: 'https://your-cdn.com/kun_kun_mao.jpg',
  duo_guizi_mao: 'https://your-cdn.com/duo_guizi_mao.jpg',
  // ... 其他36只猫
};
```

## 测试

1. 生成猫签
2. 检查返回的 `catPhoto` 字段是否有URL
3. 前端应该显示真猫照片

## 常见问题

**Q: 图片加载失败怎么办？**
A: 检查URL是否正确、是否公开可访问、CORS设置是否允许

**Q: 可以用SVG插画作为备选吗？**
A: 可以，在 `CatSignaturePage.tsx` 中添加备选逻辑

**Q: 如何批量上传到Supabase？**
A: 使用 Supabase CLI 或 JavaScript SDK 的批量上传功能
