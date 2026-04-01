# 广西旅游网站 v2.0 - 手动任务清单

> 创建时间: 2026-04-01 11:05 CST

---

## ⚠️ 需要曾总手动完成的任务

| # | 任务 | 说明 | 状态 |
|---|------|------|------|
| 1 | **注册百度统计** | 访问 tongji.baidu.com 获取统计ID | ⏳ 待处理 |
| 2 | **注册 Sentry** | 访问 sentry.io 创建项目获取 DSN | ⏳ 待处理 |
| 3 | **注册微信小程序** | 访问 mp.weixin.qq.com 注册 | ⏳ 待处理 |
| 4 | **替换配置** | 将真实ID/DSN填入 js/config.js | ⏳ 待处理 |

---

## 📝 操作指南

### 1. 百度统计
```
1. 访问 https://tongji.baidu.com/
2. 注册账号 → 添加网站 → ai-key.top
3. 获取统计代码中的 hm.js? 后面的 ID
4. 替换 index.html 中的 BAIDU_TONGJI_ID
```

### 2. Sentry 错误监控
```
1. 访问 https://sentry.io/
2. 注册账号 → 创建项目 → 选择 JavaScript
3. 获取 DSN (格式: https://xxx@sentry.io/xxx)
4. 替换 index.html 中的 SENTRY_DSN
```

### 3. 微信小程序
```
1. 访问 https://mp.weixin.qq.com/
2. 注册小程序账号
3. 获取 AppID
4. 用于后续 UniApp 开发
```

---

## ✅ 已完成（无需曾总操作）

- [x] CSS 模块化重构
- [x] 移动端弹窗修复
- [x] 首屏性能优化
- [x] 代码质量审查 (7.8/10)
- [x] 小红书运营策略
- [x] 抖音运营策略
- [x] 小程序架构规划
- [x] 公众号运营规划
- [x] CI/CD 优化
- [x] Sentry 代码接入（只需替换 DSN）
- [x] PWA 优化
- [x] SEO 优化
- [x] 性能优化

---
*此文件由 OpenClaw Agent 自动生成*