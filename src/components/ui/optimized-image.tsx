'use client';

import { useState, useEffect, forwardRef } from 'react';
import Image, { ImageProps } from 'next/image';
import { cn } from '@/lib/utils';

interface OptimizedImageProps extends Omit<ImageProps, 'onLoad' | 'onError'> {
  /**
   * Show a progressive loading blur effect
   */
  progressive?: boolean;
  /**
   * Generate a blur data URL for progressive loading
   */
  blurDataURL?: string;
  /**
   * Custom loading component
   */
  loadingComponent?: React.ReactNode;
  /**
   * Custom error component
   */
  errorComponent?: React.ReactNode;
  /**
   * Callback when image loads successfully
   */
  onLoad?: () => void;
  /**
   * Callback when image fails to load
   */
  onError?: () => void;
  /**
   * Enable intersection observer for lazy loading
   */
  lazy?: boolean;
  /**
   * Intersection observer options
   */
  intersectionOptions?: IntersectionObserverInit;
  /**
   * Priority loading hint
   */
  priority?: boolean;
  /**
   * Quality hint for image optimization
   */
  quality?: number;
  /**
   * Preferred image format for optimization
   */
  format?: 'webp' | 'avif' | 'auto';
}

const OptimizedImage = forwardRef<HTMLImageElement, OptimizedImageProps>(
  ({
    src,
    alt,
    className,
    progressive = true,
    blurDataURL,
    loadingComponent,
    errorComponent,
    onLoad,
    onError,
    lazy = true,
    intersectionOptions,
    priority = false,
    quality = 80,
    format = 'auto',
    ...props
  }, ref) => {
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);
    const [isVisible, setIsVisible] = useState(!lazy || priority);
    const [optimizedSrc, setOptimizedSrc] = useState<string>(src);

    // Intersection Observer for lazy loading
    useEffect(() => {
      if (!lazy || priority || isVisible) return;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.disconnect();
          }
        },
        {
          threshold: 0.1,
          rootMargin: '50px',
          ...intersectionOptions,
        }
      );

      const element = document.getElementById(`optimized-image-${src}`);
      if (element) {
        observer.observe(element);
      }

      return () => observer.disconnect();
    }, [lazy, priority, isVisible, src, intersectionOptions]);

    // Optimize image URL for modern formats
    useEffect(() => {
      if (!src || typeof src !== 'string') return;

      let optimized = src;

      // For Firebase Storage URLs, add optimization parameters
      if (src.includes('firebasestorage.googleapis.com')) {
        const url = new URL(src);
        
        // Add quality parameter
        if (quality !== 80) {
          url.searchParams.set('quality', quality.toString());
        }

        // Add format parameter for modern formats
        if (format === 'webp') {
          url.searchParams.set('format', 'webp');
        } else if (format === 'avif') {
          url.searchParams.set('format', 'avif');
        }

        optimized = url.toString();
      }

      setOptimizedSrc(optimized);
    }, [src, quality, format]);

    // Generate blur data URL for progressive loading
    const generateBlurDataURL = (width: number = 10, height: number = 10): string => {
      if (blurDataURL) return blurDataURL;
      
      // Create a simple blur data URL using canvas
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) return '';
      
      canvas.width = width;
      canvas.height = height;
      
      // Create a gradient blur effect
      const gradient = ctx.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, 'rgba(200, 200, 200, 0.8)');
      gradient.addColorStop(1, 'rgba(240, 240, 240, 0.6)');
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);
      
      return canvas.toDataURL();
    };

    const handleLoad = () => {
      setIsLoading(false);
      setHasError(false);
      onLoad?.();
    };

    const handleError = () => {
      setIsLoading(false);
      setHasError(true);
      onError?.();
    };

    // Show loading state
    if (!isVisible) {
      return (
        <div
          id={`optimized-image-${src}`}
          className={cn(
            'bg-gray-100 animate-pulse rounded-lg flex items-center justify-center',
            className
          )}
          style={{
            width: props.width || 'auto',
            height: props.height || 'auto',
            aspectRatio: props.width && props.height ? 
              `${props.width} / ${props.height}` : 'auto',
          }}
        >
          {loadingComponent || (
            <div className="text-gray-400 text-sm">Loading...</div>
          )}
        </div>
      );
    }

    // Show error state
    if (hasError) {
      return (
        <div
          className={cn(
            'bg-gray-100 border border-gray-200 rounded-lg flex items-center justify-center',
            className
          )}
          style={{
            width: props.width || 'auto',
            height: props.height || 'auto',
            aspectRatio: props.width && props.height ? 
              `${props.width} / ${props.height}` : 'auto',
          }}
        >
          {errorComponent || (
            <div className="text-gray-500 text-sm">
              <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Failed to load image
            </div>
          )}
        </div>
      );
    }

    // Main image component
    return (
      <div className="relative">
        <Image
          ref={ref}
          src={optimizedSrc}
          alt={alt}
          className={cn(
            'transition-opacity duration-300',
            isLoading && progressive ? 'opacity-0' : 'opacity-100',
            className
          )}
          onLoad={handleLoad}
          onError={handleError}
          priority={priority}
          quality={quality}
          placeholder={progressive ? 'blur' : 'empty'}
          blurDataURL={progressive ? generateBlurDataURL() : undefined}
          {...props}
        />
        
        {/* Loading overlay for progressive loading */}
        {isLoading && progressive && (
          <div className="absolute inset-0 bg-gray-100 animate-pulse rounded-lg flex items-center justify-center">
            {loadingComponent || (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-4 h-4 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-4 h-4 bg-blue-500 rounded-full animate-bounce"></div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }
);

OptimizedImage.displayName = 'OptimizedImage';

export { OptimizedImage };
export type { OptimizedImageProps };