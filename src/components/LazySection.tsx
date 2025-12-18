/**
 * LazySection - Lazy loads content when it comes into view
 * Improves initial page load by deferring below-the-fold content
 */
import React, { useState, useRef, useEffect } from 'react';
import type { ReactNode } from 'react';

interface LazySectionProps {
  children: ReactNode;
  fallback?: ReactNode;
  rootMargin?: string;
  threshold?: number;
  className?: string;
  onVisible?: () => void;
}

const LazySection: React.FC<LazySectionProps> = ({
  children,
  fallback = null,
  rootMargin = '200px', // Start loading 200px before visible
  threshold = 0.1,
  className = '',
  onVisible,
}) => {
  const [isInView, setIsInView] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasLoaded) {
          setIsInView(true);
          setHasLoaded(true);
          // Call onVisible callback if provided
          if (onVisible) {
            onVisible();
          }
          // Disconnect after first load
          if (sectionRef.current) {
            observer.unobserve(sectionRef.current);
          }
        }
      },
      {
        rootMargin,
        threshold,
      }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
      observer.disconnect();
    };
  }, [rootMargin, threshold, hasLoaded, onVisible]);

  return (
    <div ref={sectionRef} className={className}>
      {isInView ? children : fallback}
    </div>
  );
};

export default LazySection;

