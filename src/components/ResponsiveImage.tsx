import React, { useState, useRef, useEffect } from 'react';
import { getImageSources } from '../utils/imageUtils';

interface ResponsiveImageProps {
  src: string;
  alt: string;
  className?: string;
  aspectRatio?: 'landscape' | 'portrait' | 'square' | 'wide';
  size?: 'small' | 'medium' | 'large' | 'full';
  loading?: 'lazy' | 'eager';
  objectFit?: 'cover' | 'contain' | 'fill';
}

const ResponsiveImage: React.FC<ResponsiveImageProps> = ({
  src,
  alt,
  className = '',
  aspectRatio = 'landscape',
  size = 'medium',
  loading = 'lazy',
  objectFit = 'cover',
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Aspect ratio mappings
  const aspectRatios = {
    landscape: '16/9',
    wide: '21/9',
    portrait: '9/16',
    square: '1/1',
  };

  // Size-based height mappings (for landscape)
  const sizeHeights = {
    small: { base: '150px', tablet: '140px', mobile: '130px' },
    medium: { base: '250px', tablet: '200px', mobile: '180px' },
    large: { base: '300px', tablet: '260px', mobile: '220px' },
    full: { base: '400px', tablet: '320px', mobile: '280px' },
  };

  useEffect(() => {
    if (loading === 'eager') {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: '50px' }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [loading]);

  const currentHeight = sizeHeights[size];

  return (
    <div
      ref={containerRef}
      className={`responsive-image-wrapper ${className}`}
      style={{
        width: '100%',
        position: 'relative',
        overflow: 'hidden',
        aspectRatio: aspectRatios[aspectRatio],
        minHeight: currentHeight.base,
        backgroundColor: 'var(--panel, #f9fafc)',
      }}
    >
      {!isLoaded && (
        <div
          className="image-placeholder"
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'var(--panel, #f9fafc)',
          }}
        />
      )}
      {isInView && (() => {
        const { webp, fallback } = getImageSources(src);
        
        return (
          <picture>
            {/* Try WebP first if available */}
            {webp && webp !== fallback && (
              <source
                srcSet={webp}
                type="image/webp"
              />
            )}
            {/* Fallback to original format */}
            <img
              src={fallback}
              alt={alt}
              loading={loading}
              decoding="async"
              width={aspectRatio === 'wide' ? 1920 : aspectRatio === 'portrait' ? 1080 : 1600}
              height={aspectRatio === 'wide' ? 823 : aspectRatio === 'portrait' ? 1920 : 900}
              onLoad={() => setIsLoaded(true)}
              onError={(e) => {
                // If WebP fails, try fallback
                const img = e.target as HTMLImageElement;
                const picture = img.closest('picture');
                
                // If this is the WebP source failing, try fallback
                if (picture && img.src !== fallback) {
                  // Find the img element and update its src to fallback
                  const fallbackImg = picture.querySelector('img');
                  if (fallbackImg && fallbackImg !== img) {
                    fallbackImg.src = fallback;
                  } else if (fallbackImg) {
                    // This is the fallback img, so WebP failed - use fallback
                    img.src = fallback;
                  }
                } else if (img.src === fallback) {
                  // Both WebP and fallback failed
                  img.style.display = 'none';
                }
              }}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                objectFit: objectFit,
                opacity: isLoaded ? 1 : 0,
                transition: 'opacity 0.3s ease',
              }}
            />
          </picture>
        );
      })()}
      <style>{`
        @media (max-width: 768px) {
          .responsive-image-wrapper {
            min-height: ${currentHeight.tablet} !important;
          }
        }
        @media (max-width: 480px) {
          .responsive-image-wrapper {
            min-height: ${currentHeight.mobile} !important;
          }
        }
      `}</style>
    </div>
  );
};

export default ResponsiveImage;

