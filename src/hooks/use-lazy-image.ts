'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

export interface UseLazyImageOptions {
  /**
   * Root margin for intersection observer
   */
  rootMargin?: string;
  /**
   * Threshold for intersection observer
   */
  threshold?: number | number[];
  /**
   * Enable lazy loading
   */
  enabled?: boolean;
  /**
   * Placeholder image URL
   */
  placeholder?: string;
  /**
   * Callback when image enters viewport
   */
  onIntersect?: () => void;
  /**
   * Callback when image loads
   */
  onLoad?: () => void;
  /**
   * Callback when image fails to load
   */
  onError?: () => void;
}

export interface UseLazyImageResult {
  /**
   * Ref to attach to the image element
   */
  ref: React.RefObject<HTMLImageElement>;
  /**
   * Current image source (placeholder or actual)
   */
  src: string;
  /**
   * Whether the image is in viewport
   */
  isIntersecting: boolean;
  /**
   * Whether the image has loaded
   */
  isLoaded: boolean;
  /**
   * Whether the image failed to load
   */
  hasError: boolean;
  /**
   * Whether the image is currently loading
   */
  isLoading: boolean;
  /**
   * Reset the image state
   */
  reset: () => void;
}

/**
 * Hook for lazy loading images with intersection observer
 */
export function useLazyImage(
  imageSrc: string,
  options: UseLazyImageOptions = {}
): UseLazyImageResult {
  const {
    rootMargin = '50px',
    threshold = 0.1,
    enabled = true,
    placeholder = '',
    onIntersect,
    onLoad,
    onError,
  } = options;

  const [isIntersecting, setIsIntersecting] = useState(!enabled);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Current source (placeholder or actual image)
  const currentSrc = isIntersecting ? imageSrc : placeholder;

  // Reset function
  const reset = useCallback(() => {
    setIsLoaded(false);
    setHasError(false);
    setIsLoading(false);
    setIsIntersecting(!enabled);
  }, [enabled]);

  // Set up intersection observer
  useEffect(() => {
    if (!enabled || !imgRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsIntersecting(true);
          setIsLoading(true);
          onIntersect?.();
          observer.disconnect();
        }
      },
      {
        rootMargin,
        threshold,
      }
    );

    observerRef.current = observer;
    observer.observe(imgRef.current);

    return () => {
      observer.disconnect();
    };
  }, [enabled, rootMargin, threshold, onIntersect]);

  // Handle image loading
  useEffect(() => {
    if (!imgRef.current || !isIntersecting) return;

    const img = imgRef.current;

    const handleLoad = () => {
      setIsLoaded(true);
      setIsLoading(false);
      setHasError(false);
      onLoad?.();
    };

    const handleError = () => {
      setHasError(true);
      setIsLoading(false);
      setIsLoaded(false);
      onError?.();
    };

    // If image is already loaded (cached), trigger load immediately
    if (img.complete && img.naturalWidth > 0) {
      handleLoad();
    } else {
      img.addEventListener('load', handleLoad);
      img.addEventListener('error', handleError);
    }

    return () => {
      img.removeEventListener('load', handleLoad);
      img.removeEventListener('error', handleError);
    };
  }, [isIntersecting, imageSrc, onLoad, onError]);

  // Clean up observer on unmount
  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  return {
    ref: imgRef,
    src: currentSrc,
    isIntersecting,
    isLoaded,
    hasError,
    isLoading,
    reset,
  };
}

/**
 * Hook for lazy loading multiple images
 */
export function useLazyImages(
  imageSrcs: string[],
  options: UseLazyImageOptions = {}
): UseLazyImageResult[] {
  const results = imageSrcs.map(src => useLazyImage(src, options));
  return results;
}

/**
 * Hook for preloading images
 */
export function useImagePreloader(
  imageSrcs: string[],
  options: {
    enabled?: boolean;
    crossOrigin?: string;
    onProgress?: (loaded: number, total: number) => void;
    onComplete?: () => void;
  } = {}
) {
  const { enabled = true, crossOrigin, onProgress, onComplete } = options;
  const [loadedCount, setLoadedCount] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (!enabled || imageSrcs.length === 0) return;

    let loaded = 0;
    const total = imageSrcs.length;

    const preloadImage = (src: string): Promise<void> => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          loaded++;
          setLoadedCount(loaded);
          onProgress?.(loaded, total);
          resolve();
        };
        img.onerror = reject;
        if (crossOrigin) img.crossOrigin = crossOrigin;
        img.src = src;
      });
    };

    Promise.all(imageSrcs.map(preloadImage))
      .then(() => {
        setIsComplete(true);
        onComplete?.();
      })
      .catch(error => {
        console.warn('Some images failed to preload:', error);
        setIsComplete(true);
        onComplete?.();
      });
  }, [imageSrcs, enabled, crossOrigin, onProgress, onComplete]);

  return {
    loadedCount,
    totalCount: imageSrcs.length,
    isComplete,
    progress: imageSrcs.length > 0 ? loadedCount / imageSrcs.length : 0,
  };
}

/**
 * Hook for responsive image loading
 */
export function useResponsiveImage(
  imageSrcs: {
    mobile?: string;
    tablet?: string;
    desktop?: string;
    default: string;
  },
  options: {
    breakpoints?: {
      mobile?: number;
      tablet?: number;
      desktop?: number;
    };
  } = {}
) {
  const {
    breakpoints = {
      mobile: 640,
      tablet: 1024,
      desktop: 1280,
    },
  } = options;

  const [currentSrc, setCurrentSrc] = useState(imageSrcs.default);

  useEffect(() => {
    const updateImageSrc = () => {
      const width = window.innerWidth;
      
      if (width <= breakpoints.mobile! && imageSrcs.mobile) {
        setCurrentSrc(imageSrcs.mobile);
      } else if (width <= breakpoints.tablet! && imageSrcs.tablet) {
        setCurrentSrc(imageSrcs.tablet);
      } else if (width <= breakpoints.desktop! && imageSrcs.desktop) {
        setCurrentSrc(imageSrcs.desktop);
      } else {
        setCurrentSrc(imageSrcs.default);
      }
    };

    updateImageSrc();
    window.addEventListener('resize', updateImageSrc);

    return () => {
      window.removeEventListener('resize', updateImageSrc);
    };
  }, [imageSrcs, breakpoints]);

  return currentSrc;
}

/**
 * Hook for image loading with retry logic
 */
export function useImageWithRetry(
  imageSrc: string,
  options: {
    maxRetries?: number;
    retryDelay?: number;
    fallbackSrc?: string;
    onRetry?: (attempt: number) => void;
  } = {}
) {
  const { maxRetries = 3, retryDelay = 1000, fallbackSrc, onRetry } = options;
  const [currentSrc, setCurrentSrc] = useState(imageSrc);
  const [retryCount, setRetryCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const retry = useCallback(() => {
    if (retryCount < maxRetries) {
      setTimeout(() => {
        setRetryCount(prev => prev + 1);
        setCurrentSrc(imageSrc);
        setIsLoading(true);
        setHasError(false);
        onRetry?.(retryCount + 1);
      }, retryDelay);
    } else if (fallbackSrc) {
      setCurrentSrc(fallbackSrc);
      setIsLoading(true);
      setHasError(false);
    }
  }, [retryCount, maxRetries, imageSrc, retryDelay, fallbackSrc, onRetry]);

  const handleLoad = useCallback(() => {
    setIsLoading(false);
    setHasError(false);
  }, []);

  const handleError = useCallback(() => {
    setIsLoading(false);
    setHasError(true);
    retry();
  }, [retry]);

  return {
    src: currentSrc,
    isLoading,
    hasError,
    retryCount,
    onLoad: handleLoad,
    onError: handleError,
    retry,
  };
}