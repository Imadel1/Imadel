# Firestore Image WebP Support

## Current Implementation

The frontend automatically handles WebP conversion for Firestore images:

1. **Automatic Detection**: `imageUtils.getImageSources()` tries to get WebP versions
2. **URL Transformation**: Attempts to convert image URLs to WebP format
3. **Fallback Support**: Automatically falls back to original format if WebP isn't available

## How It Works

### Client-Side (Current)

The `ResponsiveImage` component and `imageUtils` utility:

- Try to get WebP version by modifying the URL
- Use `<picture>` element for automatic browser selection
- Fall back to original format if WebP fails

**Limitations:**
- Only works if WebP version exists at the modified URL
- Firebase Storage doesn't automatically convert images
- External URLs may not have WebP versions

### Recommended: Backend Conversion

For best performance, convert images to WebP when uploading to Firebase Storage:

#### Option 1: Convert on Upload (Recommended)

Modify the upload function in `src/services/api.ts`:

```typescript
import sharp from 'sharp';

uploadSiteImage: async (key: keyof SiteImages, file: File): Promise<SiteImages> => {
  // Convert to WebP
  const webpBuffer = await sharp(await file.arrayBuffer())
    .webp({ quality: 80 })
    .toBuffer();
  
  // Upload original
  const originalPath = `site-images/${key}-${Date.now()}-${file.name}`;
  const originalRef = storageRef(storage, originalPath);
  await uploadBytes(originalRef, file);
  const originalUrl = await getDownloadURL(originalRef);
  
  // Upload WebP
  const webpPath = `site-images/${key}-${Date.now()}-${file.name.replace(/\.(jpg|jpeg|png)$/i, '.webp')}`;
  const webpRef = storageRef(storage, webpPath);
  await uploadBytes(webpRef, webpBuffer);
  const webpUrl = await getDownloadURL(webpRef);
  
  // Store both URLs
  const current = await mediaApi.getSiteImages();
  const updated: SiteImages = {
    ...current,
    [key]: originalUrl,
    [`${key}Webp`]: webpUrl, // Store WebP version separately
  };
  
  return await mediaApi.updateSiteImages(updated);
}
```

#### Option 2: Cloud Function (Firebase)

Create a Cloud Function that automatically converts images:

```javascript
// functions/index.js
const functions = require('firebase-functions');
const sharp = require('sharp');
const admin = require('firebase-admin');

exports.convertToWebP = functions.storage.object().onFinalize(async (object) => {
  const filePath = object.name;
  const bucket = admin.storage().bucket();
  const file = bucket.file(filePath);
  
  // Skip if already WebP
  if (filePath.endsWith('.webp')) return null;
  
  // Skip if not an image
  if (!filePath.match(/\.(jpg|jpeg|png)$/i)) return null;
  
  // Download, convert, upload
  const [buffer] = await file.download();
  const webpBuffer = await sharp(buffer).webp({ quality: 80 }).toBuffer();
  
  const webpPath = filePath.replace(/\.(jpg|jpeg|png)$/i, '.webp');
  const webpFile = bucket.file(webpPath);
  await webpFile.save(webpBuffer, { metadata: { contentType: 'image/webp' } });
  
  return null;
});
```

#### Option 3: CDN with Auto-Conversion

Use a CDN service that automatically converts images:

- **Cloudinary**: Automatic format conversion
- **ImageKit**: On-the-fly image optimization
- **Cloudflare Images**: Automatic WebP conversion

## Current Status

✅ **Working:**
- Static assets (automatic conversion during build)
- Local images (WebP versions generated)
- URL transformation (attempts to get WebP versions)

⚠️ **Needs Backend Support:**
- Firebase Storage images (need conversion on upload)
- Dynamic project/news images (need WebP versions stored)

## Testing

To test WebP support:

1. Open browser DevTools
2. Go to Network tab
3. Filter by "Img"
4. Check if images are loaded as WebP format
5. Look for `type: image/webp` in response headers

## Future Improvements

1. **Backend Conversion**: Implement automatic WebP conversion on upload
2. **Dual Storage**: Store both original and WebP versions
3. **CDN Integration**: Use CDN with automatic conversion
4. **Lazy Conversion**: Convert images on-demand if not already converted

