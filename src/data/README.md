# 猫咪数据文件

## cats.json

包含所有37只猫的完整数据，包括：

- **id**: 猫的唯一标识符（英文下划线格式）
- **name**: 猫的中文名称
- **tagline**: 一句话描述（用户看到的第一印象）
- **explanation**: 详细解释（为什么用户现在是这只猫）
- **suggestion**: 建议（今天应该怎么做）
- **avoid**: 数组，3条今天不适合做的事
- **recovery_tags**: 数组，恢复方式标签
- **neighbor_cats**: 数组，邻近猫的中文名称（用于"换一种理解方式"功能）
- **energy**: 能量等级（low/medium/high）
- **social**: 社交需求（alone/want_company）
- **trigger_type**: 触发类型（physical/general/anxiety/situation/relationship/growth/positive）

## 使用方式

### 后端 (API)
```typescript
import catsData from '../../src/data/cats.json';
const CATS = {};
catsData.cats.forEach((cat) => {
  CATS[cat.id] = cat;
});
```

### 前端 (React)
```typescript
import catsData from '../data/cats.json';
const cat = catsData.cats.find(c => c.id === catId);
```

## 数据维护

- 修改文案时直接编辑 JSON 文件
- 添加新猫时确保 ID 唯一且使用下划线格式
- neighbor_cats 中的名称必须与其他猫的 name 字段匹配
- 所有文案应保持温暖、同理心的语气
