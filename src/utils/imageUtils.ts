/**
 * Image utility functions for WebP support
 * Handles both static assets and dynamic Firestore images
 */

/**
 * Attempts to get WebP version of an image URL
 * Works with:
 * - Firebase Storage URLs
 * - Static asset URLs
 * - External URLs (if they support WebP)
 * 
 * @param imageUrl - Original image URL
 * @returns WebP URL if possible, otherwise original URL
 */
export function getWebPUrl(imageUrl: string | undefined | null): string {
  if (!imageUrl) {
    return '';
  }

  // Skip if already WebP
  if (imageUrl.toLowerCase().endsWith('.webp')) {
    return imageUrl;
  }

  // Skip if it's a data URL or base64
  if (imageUrl.startsWith('data:') || imageUrl.startsWith('blob:')) {
    return imageUrl;
  }

  // Skip if it's an external URL that doesn't support WebP conversion
  // (e.g., Unsplash, external CDNs without WebP support)
  if (imageUrl.includes('unsplash.com') || 
      imageUrl.includes('placeholder') ||
      imageUrl.includes('via.placeholder.com')) {
    return imageUrl;
  }

  // Firebase Storage URLs - don't auto-convert unless WebP version exists
  // Firebase Storage URLs look like: https://firebasestorage.googleapis.com/...
  // We can't assume WebP exists, so return original URL
  // The backend should store both original and WebP versions separately
  if (imageUrl.includes('firebasestorage.googleapis.com')) {
    // Don't try to convert Firebase Storage URLs automatically
    // Return original - WebP conversion should be handled by backend
    return imageUrl;
  }

  // Static assets (local imports) - replace extension
  if (!imageUrl.startsWith('http') && !imageUrl.startsWith('//')) {
    return imageUrl.replace(/\.(jpg|jpeg|png)$/i, '.webp');
  }

  // External URLs - try replacing extension
  // This works if the server has WebP versions available
  try {
    const url = new URL(imageUrl);
    const pathname = url.pathname;
    
    // Replace extension in pathname
    const webpPathname = pathname.replace(/\.(jpg|jpeg|png)$/i, '.webp');
    
    if (webpPathname !== pathname) {
      url.pathname = webpPathname;
      return url.toString();
    }
  } catch {
    // Invalid URL, return original
  }

  return imageUrl;
}

/**
 * Checks if WebP is supported by the browser
 */
export function isWebPSupported(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  // Check if browser supports WebP
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  
  return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
}

/**
 * Gets both WebP and fallback URLs for use in <picture> element
 * @param imageUrl - Original image URL
 * @returns Object with webp and fallback URLs
 */
export function getImageSources(imageUrl: string | undefined | null): {
  webp: string;
  fallback: string;
} {
  const fallback = imageUrl || '';
  
  // Don't try WebP for Firebase Storage URLs unless we know it exists
  // Firebase Storage doesn't automatically convert images
  if (fallback.includes('firebasestorage.googleapis.com')) {
    return {
      webp: '', // Don't try WebP for Firebase Storage
      fallback,
    };
  }
  
  const webp = getWebPUrl(imageUrl);

  return {
    webp: webp !== fallback ? webp : '',
    fallback,
  };
}

