# 广西旅游网站 - 技术优化执行计划

**制定日期**: 2026-04-01  
**状态**: 分析完成，执行中

---

## 一、当前问题分析

### CSS 问题（来自综合审查报告v1.0 + v2.0）

| 指标 | 当前值 | 目标值 | 优先级 |
|------|--------|--------|--------|
| CSS 行数 | 6,774 行 | 拆分模块 | P0 |
| !important | 554 处 | < 50处 | P0 |
| 文件大小 | 138,182 字节 | < 50KB | P1 |

### 图片资源分析

| 指标 | 当前值 |
|------|--------|
| 图片元素 | 12 个 |
| 首屏图片 | 需要懒加载 |
| 背景图 | 无 |

---

## 二、优化方案

### 方案1: CSS 模块化拆分

将单一 styles.css 拆分为：

```
css/
├── base.css          (基础重置 + 变量)      ~200行
├── layout.css        (布局网格)             ~300行
├── components.css    (按钮、卡片、弹窗)     ~500行
├── sections.css      (页面区块)            ~1500行
├── header.css        (导航)                ~200行
├── footer.css        (底部)                ~150行
├── modal.css         (弹窗系统统一)         ~300行
├── forms.css         (表单样式)             ~300行
├── responsive.css    (响应式断点)           ~400行
└── utilities.css     (工具类)               ~300行
```

### 方案2: !important 移除策略

分类处理 554 处 !important：

| 类型 | 数量 | 处理方式 |
|------|------|----------|
| 媒体查询覆盖 | 200+ | 使用更具体的选择器 |
| 优先级问题 | 150+ | 重构 CSS 选择器结构 |
| JavaScript 动态样式 | 50+ | 使用 CSS 变量 |
| 第三方组件 | 100+ | 封装组件隔离 |
| 真正需要的 | ~50 | 保留但最少化 |

### 方案3: 图片懒加载方案

使用 Intersection Observer API：

```javascript
// 懒加载实现
const lazyLoad = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const img = entry.target;
      img.src = img.dataset.src;
      img.classList.add('loaded');
      lazyLoad.unobserve(img);
    }
  });
});
```

**首屏图片** (需要立即加载):
- Banner 图片
- 首屏房源卡片

**非首屏图片** (可以懒加载):
- 列表中的房源图片
- 合作伙伴 logo
- 底部详情图片

---

## 三、执行计划

### Phase 1: CSS 模块化拆分 (预计 30 分钟)

1. 创建 css/ 目录结构
2. 提取 base.css (变量 + reset)
3. 拆分 layout.css
4. 拆分 components.css
5. 拆分 sections.css
6. 更新 index.html 引用

### Phase 2: !important 清理 (预计 45 分钟)

1. 扫描并分类所有 !important
2. 处理优先级最高的 100 处
3. 验证页面显示正常
4. 继续处理剩余部分

### Phase 3: 图片懒加载 (预计 15 分钟)

1. 编写 lazyLoad.js 工具
2. 修改图片 HTML 结构
3. 测试所有图片正常显示

---

## 四、验证清单

- [ ] 所有页面样式正常
- [ ] 移动端响应式正常
- [ ] !important 减少到 100 以下
- [ ] 首屏加载时间 < 2秒
- [ ] 无控制台错误

---

## 五、依赖资源

- 暂无外部依赖
- 纯 CSS + 原生 JavaScript
- 可离线使用

---

*执行时间预计: 90 分钟*