# Image Optimization Guide

## Current Performance Issues

- **LCP**: 5.22s (Target: <2.5s)
- **CLS**: 0.66 (Target: <0.1)

## Hero Image Optimization

The hero image is the LCP element and needs special attention:

### Recommended Steps

1. **Compress Hero Image Before Upload**
   - Target size: **< 500 KB** (currently may be 2MB+)
   - Use tools like:
     - [Squoosh](https://squoosh.app/) - Online image compressor
     - [TinyPNG](https://tinypng.com/) - PNG/JPEG compression
     - [ImageOptim](https://imageoptim.com/) - Desktop tool
   - Quality: 80-85% for JPEG, 80% for WebP

2. **Image Dimensions**
   - Recommended: **1920x1080px** (16:9 aspect ratio)
   - Maximum: **2560x1440px** (don't go larger)
   - Crop to focus on main subject

3. **Format**
   - Upload as **JPEG** (smaller than PNG for photos)
   - System automatically converts to WebP during build
   - WebP is 25-35% smaller than JPEG

### Upload Process

1. Compress image to < 500 KB
2. Upload via Admin Panel → Settings → Site Images → Hero Home URL
3. System will:
   - Store in Firebase Storage
   - Automatically preload for faster LCP
   - Use WebP when available

## General Image Guidelines

### For All Images

1. **File Size Limits**
   - Hero images: **< 500 KB**
   - Project/News images: **< 300 KB**
   - Partner logos: **< 100 KB**
   - Thumbnails: **< 50 KB**

2. **Dimensions**
   - Always specify width/height in code (prevents CLS)
   - Use responsive images with `ResponsiveImage` component
   - Aspect ratios:
     - Hero: 16:9 or 21:9
     - Cards: 21:9 (wide)
     - Thumbnails: 16:9

3. **Format Priority**
   - **WebP** (automatic conversion)
   - **JPEG** (for photos)
   - **PNG** (only for logos/transparency)

### Compression Tools

- **Online**: [Squoosh](https://squoosh.app/), [TinyPNG](https://tinypng.com/)
- **Desktop**: [ImageOptim](https://imageoptim.com/), [GIMP](https://www.gimp.org/)
- **Command Line**: `sharp` (already installed in project)

### Manual Compression Script

Run this to compress images before upload:

```bash
npm run convert:webp
```

This converts images to WebP, but you should compress the originals first.

## Performance Impact

### Before Optimization
- Hero image: ~2.6 MB
- LCP: 5.22s
- CLS: 0.66

### After Optimization (Expected)
- Hero image: ~400-500 KB (80% reduction)
- LCP: ~2.0-2.5s (50% improvement)
- CLS: ~0.1-0.2 (70% improvement)

## Firebase Storage Optimization

### Current Setup
- Images stored in Firebase Storage
- Served via Firebase CDN
- Automatic caching

### Recommendations
1. **Compress before upload** (most important)
2. **Use WebP format** (automatic conversion)
3. **Optimize dimensions** (don't upload 4K images)
4. **Consider CDN** (Firebase already provides this)

## Monitoring

Check performance after optimization:
1. Open Chrome DevTools
2. Go to Lighthouse tab
3. Run performance audit
4. Check LCP and CLS scores

Target metrics:
- **LCP**: < 2.5s (Good)
- **CLS**: < 0.1 (Good)
- **FCP**: < 1.8s (Good)

