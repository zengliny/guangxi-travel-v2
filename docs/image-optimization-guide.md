# 图片优化指南 (Image Optimization Guide)

> 广西旅游网站 v2 图片资源优化方案

## 📊 当前图片状态

| 文件 | 原始大小 | 类型 | 尺寸 |
|------|----------|------|------|
| wechat-qr.jpg | 169KB | PNG (误标) | 741x722 |
| wechat-qr.png | 169KB | PNG | 741x722 |
| icon-192.png | 547B | PNG | 192x192 |
| icon-512.png | 1.8KB | PNG | 512x512 |

> ⚠️ `wechat-qr.jpg` 实际上是 PNG 文件但被标记为 JPG

---

## 🎯 推荐策略

### 1. 使用 WebP 格式

WebP 相比 JPEG/PNG 有以下优势：

| 对比项 | JPEG | PNG | WebP |
|--------|------|-----|------|
| 透明度 | ❌ | ✅ | ✅ |
| 压缩率(有损) | 70% | 100% | **30-50%** |
| 压缩率(无损) | 70% | 60-80% | **60-80%** |
| 浏览器支持 | 100% | 100% | **98%+** |

### 2. 建议的图片大小限制

| 用途 | 最大宽度 | 最大文件大小 | 推荐格式 |
|------|----------|--------------|----------|
| 轮播图/首图 | 1920px | 200KB | WebP |
| 内容图片 | 1200px | 100KB | WebP |
| 缩略图 | 600px | 30KB | WebP |
| 图标/Favicon | 512px | 10KB | PNG/WebP |
| 二维码 | 400px | 50KB | PNG/WebP |

---

## 🔧 转换命令示例

### 使用 ImageMagick (推荐)

```bash
# 安装
apt-get install imagemagick

# PNG 转 WebP (有损)
convert input.png -quality 80 output.webp

# PNG 转 WebP (无损)
convert input.png -lossless output.webp

# JPEG 转 WebP
convert input.jpg -quality 85 output.webp

# 批量转换
for f in *.png; do convert "$f" -quality 80 "${f%.png}.webp"; done
```

### 使用 Python Pillow

```python
from PIL import Image

def convert_to_webp(input_path, output_path, quality=80):
    img = Image.open(input_path)
    
    # 处理透明度
    if img.mode in ('RGBA', 'LA'):
        background = Image.new('RGB', img.size, (255, 255, 255))
        background.paste(img, mask=img.split()[-1])
        img = background
    elif img.mode != 'RGB':
        img = img.convert('RGB')
    
    img.save(output_path, 'WEBP', quality=quality, method=6)

# 使用示例
convert_to_webp('wechat-qr.png', 'wechat-qr.webp', quality=80)
```

### 使用 cwebp (Google)

```bash
# 安装
apt-get install webp

# 简单转换
cwebp -q 80 input.png -o output.webp

# 批量
ls *.png | xargs -I {} cwebp -q 80 {} -o {}.webp
```

### 使用 ffmpeg

```bash
# 视频帧或图片转换
ffmpeg -i input.png -c:v libwebp -quality 80 output.webp
```

---

## 🚀 使用优化脚本

```bash
# 运行优化脚本
cd /root/.openclaw/workspace/guangxi-travel-v2
bash scripts/optimize-images.sh
```

输出到: `images/optimized/`

---

## 📋 最佳实践

### 1. 图片加载优化

```html
<!-- 懒加载 -->
<img src="photo.webp" loading="lazy" alt="涠洲岛">

<!-- 响应式图片 -->
<picture>
  <source srcset="photo-desktop.webp" media="(min-width: 1024px)">
  <source srcset="photo-mobile.webp" media="(max-width: 768px)">
  <img src="photo-desktop.webp" alt="德天瀑布">
</picture>
```

### 2. 缓存策略

```
# CDN 缓存建议
- WebP/JPEG: 1年 (max-age=31536000)
- 图标/Favicon: 1年
- 大图片: 1个月
```

### 3. 现代化格式优先级

```
1. WebP (现代浏览器)
2. JPEG (兼容性优先)
3. PNG (需要透明度)
```

---

## 📈 预期优化效果

| 文件 | 原始 | WebP | 节省 |
|------|------|------|------|
| wechat-qr | 169KB | ~30KB | **82%** |
| icon-192 | 547B | ~400B | 27% |
| icon-512 | 1.8KB | ~1.2KB | 33% |

**总体预期节省: 60-80%**

---

## 🔄 CI/CD 集成

建议在部署时自动运行优化:

```yaml
# .github/workflows/deploy.yml
- name: Optimize Images
  run: |
    bash scripts/optimize-images.sh
    git add images/optimized/
    git commit -m "chore: optimize images"
```

---

*更新于: 2026-04-01*
*项目: 广西旅游网站 v2*