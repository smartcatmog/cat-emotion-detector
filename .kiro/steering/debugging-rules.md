# 调试规则 - 从登录问题中学到的教训

## 排查问题的正确顺序

在修改任何代码之前，先用工具验证每一层：

```
1. 前端发出请求了吗？（Network 面板）
2. 服务端收到了吗？（服务端日志）
3. 服务端返回了吗？（Response status）
4. 前端处理了吗？（Console 日志）
```

**不要跳步骤。** 每一层都要确认，再决定在哪里修。

## 修复前先问自己

1. 我有证据证明问题在这里吗？
2. 这个修复会引入新问题吗？
3. 有没有更简单的方案？

## 常见陷阱

### 第三方 SDK 在特定环境下可能失效
- 浏览器扩展（MetaMask 等）注入的 SES 沙箱会阻止某些 SDK 的 Promise resolve
- 症状：请求发出去了（服务端有日志），但前端 Promise 永远不返回
- 解法：把 SDK 调用移到服务端，前端只用原生 fetch

### 不要假设问题在哪里
- 看到"登录失败"不代表 Supabase 配置有问题
- 先用 curl 直接测试 API，确认服务端是否正常
- 再看前端 Network 面板，确认请求是否发出

### 一次性解决，不要分步修
- 发现根本原因后，设计完整方案再动手
- 不要"先改这一步看看"，这会引入更多变量

## 认证问题的正确架构

当浏览器环境不可信时（有扩展、沙箱等）：

```
前端 fetch('/api/auth') 
  → 服务端调用第三方 SDK 
  → 返回 { user, session, token }
  → 前端直接更新 React 状态
  → 同时存 localStorage 保持刷新后登录
```

不要依赖第三方 SDK 的客户端方法（如 setSession、onAuthStateChange）来管理状态。

---

## ⚠️ Vercel Hobby 计划限制 - 重要约束

**Vercel Hobby 计划最多只能部署 12 个 Serverless Functions。**

这是一个硬限制，超过会导致部署失败：
```
Error: No more than 12 Serverless Functions can be added to a Deployment on the Hobby plan.
```

### 如何计算 API 函数数量
- 每个 `api/*.ts` 文件 = 1 个函数
- 每个 `api/social/*.ts` 文件 = 1 个函数
- 总数不能超过 12 个

### 当前项目的 API 函数（12 个）
1. api/auth.ts
2. api/mint-nft.ts
3. api/social/calendar.ts
4. api/social/cat-signature.ts
5. api/social/checkin.ts
6. api/social/collection.ts
7. api/social/comments.ts
8. api/social/leaderboard.ts
9. api/social/lootbox.ts
10. api/social/messages.ts
11. api/social/notify.ts
12. api/social/same-mood.ts

### 已删除的冗余 API（为了保持在限制内）
- ❌ api/analyze.ts - 功能被 cat-signature.ts 替代
- ❌ api/mood-match.ts - 功能被 cat-signature.ts 替代
- ❌ api/social/cat-signature-updated.ts - 备份文件

### 重要提醒
- **不要添加新的 API 文件，除非删除现有的**
- **删除 API 文件后，必须同时更新 vercel.json 中的 functions 配置**
- **vercel.json 中的配置必须与实际存在的 API 文件一致**
- 如果需要更多 API，必须升级到 Vercel Pro 计划
