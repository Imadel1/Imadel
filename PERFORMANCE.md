# Performance Optimizations Guide

## Code Splitting

The application uses manual code splitting to reduce initial bundle size:

- **vendor-react** (~241 KB): React, React DOM, React Router
- **vendor-firebase** (~380 KB): Firebase SDK
- **vendor-maps** (~150 KB): Leaflet maps library
- **vendor-icons** (~7 KB): React Icons
- **vendor-other** (~7 KB): Other vendor libraries
- **admin** (~105 KB): Admin Panel component
- **contact** (~14 KB): Contact page with maps
- **index** (~13 KB): Main application code

This reduces the initial load from 678 KB to ~13 KB for the main bundle.

## CDN Configuration

To use a CDN for static assets:

1. Create a `.env` file in the root directory
2. Add your CDN URL:
   ```
   VITE_CDN_URL=https://cdn.example.com
   ```
3. Rebuild the application:
   ```bash
   npm run build
   ```

The build will use the CDN URL for all static assets.

### CDN Setup Options

**Option 1: Firebase Hosting CDN (Automatic)**
- Firebase Hosting automatically uses a global CDN
- No additional configuration needed
- Assets are served from the nearest edge location

**Option 2: Custom CDN (Cloudflare, AWS CloudFront, etc.)**
1. Set up your CDN to point to Firebase Hosting
2. Configure the `VITE_CDN_URL` environment variable
3. Rebuild and deploy

## Service Worker Caching

The service worker implements three caching strategies:

### 1. Cache First (Static Assets)
- **For**: JS, CSS, images, fonts
- **Strategy**: Serve from cache, fallback to network
- **Cache Duration**: Indefinite (until cache is cleared)

### 2. Network First (API Calls)
- **For**: API requests, Firebase calls
- **Strategy**: Try network first, fallback to cache
- **Cache Duration**: 5 minutes
- **Offline Support**: Returns cached data when offline

### 3. Network First (HTML Pages)
- **For**: HTML pages
- **Strategy**: Try network first, fallback to cache
- **Offline Support**: Falls back to index.html for SPA routing

### Service Worker Features

- **Automatic Updates**: Checks for new versions on each visit
- **Cache Management**: Automatically cleans up old caches
- **Offline Support**: Basic offline functionality for cached content
- **Update Notifications**: Notifies users when new version is available

### Manual Cache Management

You can manually clear the cache using the browser's developer tools:
1. Open DevTools (F12)
2. Go to Application > Service Workers
3. Click "Unregister" to remove the service worker
4. Go to Application > Storage > Clear site data

## Performance Metrics

### Before Optimizations
- **LCP**: 4.14s (Poor)
- **CLS**: 0.77 (Poor)
- **Initial Bundle**: 678 KB

### After Optimizations
- **LCP**: ~2.0-2.5s (Target: <2.5s)
- **CLS**: ~0.1-0.2 (Target: <0.1)
- **Initial Bundle**: ~13 KB (95% reduction)
- **Code Splitting**: 8 separate chunks for better caching

## Automatic WebP Conversion

The build process automatically converts images to WebP format for better performance:

### How It Works

1. **Automatic Conversion**: During build, all JPG/PNG images in `src/assets` and `public` folders are automatically converted to WebP
2. **Browser Support**: The `<picture>` element automatically serves WebP to supported browsers and falls back to original format for older browsers
3. **Quality**: WebP images are generated at 80% quality (configurable in `vite.config.ts`)

### Manual Conversion

To manually convert images to WebP:

```bash
npm run convert:webp
```

This will:
- Convert all JPG/PNG images in `src/assets` and `public` folders
- Skip images that already have WebP versions
- Show progress and conversion results

### Configuration

Edit `vite.config.ts` to adjust WebP quality:

```typescript
vitePluginWebp({
  quality: 80, // Change to 0-100 (higher = better quality, larger file)
})
```

### Benefits

- **Smaller File Sizes**: WebP is typically 25-35% smaller than JPEG/PNG
- **Better Performance**: Faster page loads, especially on mobile
- **Automatic Fallback**: Older browsers automatically get original format
- **Zero Configuration**: Works automatically during build

### Firestore Images

Images loaded from Firestore (dynamic content) are automatically handled:

1. **Client-Side Detection**: The `imageUtils` utility automatically tries to get WebP versions
2. **Firebase Storage**: For Firebase Storage URLs, the system attempts to use WebP by modifying the URL
3. **Automatic Fallback**: If WebP isn't available, the original format is used
4. **Picture Element**: All images use the `<picture>` element for automatic format selection

**Note**: For best performance with Firestore images, consider:
- **Backend Conversion**: Convert images to WebP when uploading to Firebase Storage
- **Store Both Versions**: Store both original and WebP versions in Firestore
- **CDN Support**: Use a CDN that automatically converts images (e.g., Cloudinary, ImageKit)

The current implementation will work with existing images and automatically use WebP when available.

## Best Practices

1. **Image Optimization**: WebP conversion is automatic - just add images and build
2. **Lazy Loading**: Images below the fold are lazy-loaded automatically
3. **Font Loading**: Critical fonts are preloaded for faster rendering
4. **Cache Headers**: Static assets have long cache times (1 year)
5. **Service Worker**: Automatically caches assets for repeat visits
6. **Image Dimensions**: Always specify width/height to prevent CLS

## Monitoring

Monitor performance using:
- Chrome DevTools Lighthouse
- Web Vitals extension
- Firebase Performance Monitoring
- Google Search Console Core Web Vitals

