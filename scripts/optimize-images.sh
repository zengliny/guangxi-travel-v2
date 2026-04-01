#!/bin/bash
# ============================================
# 图片优化脚本 - Image Optimization Script
# ============================================
# 使用 Python PIL/Pillow 进行图片压缩和 WebP 转换
# 输出到 images/optimized/ 目录

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
IMAGES_DIR="$PROJECT_DIR/images"
OUTPUT_DIR="$IMAGES_DIR/optimized"

echo "========================================"
echo "🖼️  广西旅游网站 - 图片优化脚本"
echo "========================================"
echo ""
echo "📁 输入目录: $IMAGES_DIR"
echo "📁 输出目录: $OUTPUT_DIR"
echo ""

# 创建输出目录
mkdir -p "$OUTPUT_DIR"

# 检查 Python 是否有 Pillow
check_pillow() {
    python3 -c "from PIL import Image" 2>/dev/null
    return $?
}

# 如果没有 Pillow，使用内置方法
if ! check_pillow; then
    echo "⚠️  未检测到 Pillow，使用内置 PNG 优化方法"
    
    # 创建 Python 优化脚本（不依赖 Pillow）
    cat > "$OUTPUT_DIR/optimize.py" << 'PYEOF'
#!/usr/bin/env python3
"""图片优化脚本 - 使用内置库"""
import os
import struct
import zlib
import sys

def optimize_png(input_path, output_path):
    """优化 PNG 文件（移除不必要的数据）"""
    with open(input_path, 'rb') as f:
        data = f.read()
    
    # PNG 文件签名
    if not data[:8] == b'\x89PNG\r\n\x1a\n':
        print(f"  ⚠️  不是 PNG 文件，跳过")
        return False
    
    # 简单优化：重建 PNG 只保留必要的 chunks
    chunks = []
    pos = 8
    while pos < len(data):
        length = struct.unpack('>I', data[pos:pos+4])[0]
        chunk_type = data[pos+4:pos+8]
        chunk_data = data[pos+8:pos+8+length]
        crc = data[pos+8+length:pos+12+length]
        
        # 只保留: IHDR, IDAT, IEND
        if chunk_type in [b'IHDR', b'IDAT', b'IEND', b'PLTE', b'tRNS']:
            chunks.append(data[pos:pos+12+length])
        
        pos += 12 + length
    
    # 写入优化后的文件
    with open(output_path, 'wb') as f:
        f.write(b''.join(chunks))
    
    return True

def convert_to_webp(input_path, output_path):
    """使用 ffmpeg 转换为 WebP（如果可用）"""
    import subprocess
    try:
        subprocess.run(['ffmpeg', '-i', input_path, '-y', output_path], 
                      capture_output=True, check=True)
        return True
    except:
        return False

def main():
    images_dir = sys.argv[1] if len(sys.argv) > 1 else 'images'
    output_dir = sys.argv[2] if len(sys.argv) > 2 else 'images/optimized'
    
    os.makedirs(output_dir, exist_ok=True)
    
    # 支持的图片格式
    extensions = ['.png', '.jpg', '.jpeg', '.webp']
    
    for filename in os.listdir(images_dir):
        ext = os.path.splitext(filename)[1].lower()
        if ext not in extensions:
            continue
            
        input_path = os.path.join(images_dir, filename)
        output_path = os.path.join(output_dir, filename)
        
        # 优化 PNG
        if ext == '.png':
            print(f"📦 优化 PNG: {filename}")
            if optimize_png(input_path, output_path):
                orig_size = os.path.getsize(input_path)
                new_size = os.path.getsize(output_path)
                print(f"   {orig_size} → {new_size} 字节 (压缩率: {new_size/orig_size*100:.1f}%)")
        else:
            # 直接复制其他格式
            print(f"📋 复制: {filename}")
            with open(input_path, 'rb') as f:
                with open(output_path, 'wb') as o:
                    o.write(f.read())
    
    print("\n✅ 优化完成!")

if __name__ == '__main__':
    main()
PYEOF
    chmod +x "$OUTPUT_DIR/optimize.py"
    
    echo "🔄 运行图片优化..."
    cd "$PROJECT_DIR"
    python3 "$OUTPUT_DIR/optimize.py" "$IMAGES_DIR" "$OUTPUT_DIR"
    
else
    echo "✅ 检测到 Pillow，使用高级压缩"
    
    # 创建使用 Pillow 的优化脚本
    cat > "$OUTPUT_DIR/optimize_pillow.py" << 'PYEOF'
#!/usr/bin/env python3
"""图片优化脚本 - 使用 Pillow"""
import os
import sys
from PIL import Image

def optimize_image(input_path, output_path, quality=85, max_width=1200):
    """优化图片：压缩并调整大小"""
    try:
        img = Image.open(input_path)
        
        # 调整大小（如果超过最大宽度）
        if img.width > max_width:
            ratio = max_width / img.width
            new_height = int(img.height * ratio)
            img = img.resize((max_width, new_height), Image.Resampling.LANCZOS)
        
        # 保存为优化格式
        ext = os.path.splitext(output_path)[1].lower()
        
        if ext in ['.jpg', '.jpeg']:
            img = img.convert('RGB')
            img.save(output_path, 'JPEG', quality=quality, optimize=True)
        elif ext == '.png':
            img.save(output_path, 'PNG', optimize=True)
        elif ext == '.webp':
            img.save(output_path, 'WEBP', quality=quality, method=6)
        else:
            img.save(output_path)
        
        return True
    except Exception as e:
        print(f"  ❌ 错误: {e}")
        return False

def convert_to_webp(input_path, output_path, quality=80):
    """转换为 WebP 格式"""
    try:
        img = Image.open(input_path)
        
        # 处理透明度
        if img.mode in ('RGBA', 'LA') or (img.mode == 'P' and 'transparency' in img.info):
            background = Image.new('RGB', img.size, (255, 255, 255))
            if img.mode == 'P':
                img = img.convert('RGBA')
            background.paste(img, mask=img.split()[-1] if img.mode in ('RGBA', 'LA') else None)
            img = background
        elif img.mode != 'RGB':
            img = img.convert('RGB')
        
        img.save(output_path, 'WEBP', quality=quality, method=6)
        return True
    except Exception as e:
        print(f"  ❌ WebP 转换失败: {e}")
        return False

def main():
    images_dir = sys.argv[1] if len(sys.argv) > 1 else 'images'
    output_dir = sys.argv[2] if len(sys.argv) > 2 else 'images/optimized'
    webp_quality = int(sys.argv[3]) if len(sys.argv) > 3 else 80
    
    os.makedirs(output_dir, exist_ok=True)
    
    extensions = ['.png', '.jpg', '.jpeg', '.webp']
    
    print("📊 图片优化统计")
    print("-" * 50)
    
    total_orig = 0
    total_new = 0
    
    for filename in sorted(os.listdir(images_dir)):
        ext = os.path.splitext(filename)[1].lower()
        if ext not in extensions:
            continue
        
        input_path = os.path.join(images_dir, filename)
        
        # 跳过已优化的文件
        if 'optimized' in input_path:
            continue
        
        orig_size = os.path.getsize(input_path)
        total_orig += orig_size
        
        base_name = os.path.splitext(filename)[0]
        
        # 优化原格式
        if ext in ['.jpg', '.jpeg']:
            output_path = os.path.join(output_dir, f"{base_name}_optimized.jpg")
            print(f"📦 优化 JPEG: {filename}")
            if optimize_image(input_path, output_path):
                new_size = os.path.getsize(output_path)
                total_new += new_size
                print(f"   {orig_size:,} → {new_size:,} 字节 (节省 {(1-new_size/orig_size)*100:.1f}%)")
            
            # 同时生成 WebP
            webp_path = os.path.join(output_dir, f"{base_name}.webp")
            print(f"🔄 转换为 WebP: {base_name}.webp")
            if convert_to_webp(input_path, webp_path, webp_quality):
                webp_size = os.path.getsize(webp_path)
                print(f"   WebP 大小: {webp_size:,} 字节")
        
        elif ext == '.png':
            output_path = os.path.join(output_dir, f"{base_name}_optimized.png")
            print(f"📦 优化 PNG: {filename}")
            if optimize_image(input_path, output_path):
                new_size = os.path.getsize(output_path)
                total_new += new_size
                print(f"   {orig_size:,} → {new_size:,} 字节 (节省 {(1-new_size/orig_size)*100:.1f}%)")
            
            # 同时生成 WebP
            webp_path = os.path.join(output_dir, f"{base_name}.webp")
            print(f"🔄 转换为 WebP: {base_name}.webp")
            if convert_to_webp(input_path, webp_path, webp_quality):
                webp_size = os.path.getsize(webp_path)
                print(f"   WebP 大小: {webp_size:,} 字节")
        
        elif ext == '.webp':
            # 直接复制 WebP
            output_path = os.path.join(output_dir, filename)
            print(f"📋 复制 WebP: {filename}")
            with open(input_path, 'rb') as f:
                with open(output_path, 'wb') as o:
                    o.write(f.read())
            total_new += orig_size
    
    print("-" * 50)
    print(f"📈 总计: {total_orig:,} → {total_new:,} 字节")
    if total_orig > 0:
        print(f"   总体节省: {(1-total_new/total_orig)*100:.1f}%")
    print("\n✅ 图片优化完成!")
    print(f"📁 输出目录: {output_dir}")

if __name__ == '__main__':
    main()
PYEOF
    chmod +x "$OUTPUT_DIR/optimize_pillow.py"
    
    echo "🔄 运行图片优化..."
    cd "$PROJECT_DIR"
    python3 "$OUTPUT_DIR/optimize_pillow.py" "$IMAGES_DIR" "$OUTPUT_DIR"
fi

echo ""
echo "📁 优化后的文件:"
ls -lh "$OUTPUT_DIR/"