# 图片懒加载方案

**日期**: 2026-04-01  
**目标**: 优化首屏加载速度

---

## 一、图片资源统计

| 类型 | 数量 | 首屏必需 |
|------|------|----------|
| Banner/轮播图 | 5张 | ✅ 是 |
| 房源卡片图 | ~20张 | ✅ 部分是 |
| 装饰图标 | 若干 | ❌ 否 |
| Logo | 1个 | ✅ 是 |

**总计**: 约 30 张图片

---

## 二、懒加载方案

### 方案 A: Native Lazy Loading (推荐)

```html
<img src="placeholder.jpg" loading="lazy" alt="...">
```

**优点**:
- 浏览器原生支持
- 无 JavaScript 依赖
- 性能好

**缺点**:
- 不支持 IE 浏览器
- 无法控制加载阈值

### 方案 B: Intersection Observer (推荐)

```javascript
// 创建观察器
const lazyLoad = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const img = entry.target;
      img.src = img.dataset.src;
      img.classList.add('loaded');
      lazyLoad.unobserve(img);
    }
  });
}, {
  rootMargin: '50px 0px',  // 提前 50px 开始加载
  threshold: 0.01
});

// 观察所有懒加载图片
document.querySelectorAll('[data-src]').forEach(img => {
  lazyLoad.observe(img);
});
```

**优点**:
- 可自定义加载时机
- 支持加载完成回调
- 兼容性好

**缺点**:
- 需要少量 JavaScript

---

## 三、实施步骤

### 1. 标记需要懒加载的图片

在 HTML 中添加 `data-src` 属性：

```html
<!-- 原始 -->
<img src="image.jpg" alt="...">

<!-- 懒加载版本 -->
<img data-src="image.jpg" src="placeholder.jpg" class="lazy" alt="...">
```

### 2. 添加 CSS 样式

```css
.lazy {
  opacity: 0;
  transition: opacity 0.3s;
}

.lazy.loaded {
  opacity: 1;
}
```

### 3. 初始化懒加载

```javascript
document.addEventListener('DOMContentLoaded', () => {
  const lazyLoad = new IntersectionObserver(/* ... */);
  document.querySelectorAll('.lazy').forEach(img => lazyLoad.observe(img));
});
```

---

## 四、首屏优化建议

### 必须立即加载 (首屏内)
- Banner 轮播第一张
- 首屏前 6 个房源卡片
- 导航 Logo

### 可以懒加载
- 滚动到底部的房源
- 非视口内的图片
- 装饰性图标

---

## 五、验证

```bash
# 测试 Lighthouse Performance
# 预期首屏图片加载时间 < 1.5s
```

---

*方案完成，等待执行*