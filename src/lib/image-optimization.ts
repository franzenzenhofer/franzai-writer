/**
 * Image optimization utilities for Franz AI Writer
 * Provides compression, format conversion, and optimization helpers
 */

export interface ImageOptimizationOptions {
  /**
   * Target quality (0-100)
   */
  quality?: number;
  /**
   * Target format
   */
  format?: 'webp' | 'avif' | 'jpeg' | 'png' | 'auto';
  /**
   * Maximum width
   */
  maxWidth?: number;
  /**
   * Maximum height
   */
  maxHeight?: number;
  /**
   * Progressive loading
   */
  progressive?: boolean;
  /**
   * Blur amount for placeholder (0-40)
   */
  blurAmount?: number;
}

export interface OptimizedImageResult {
  /**
   * Optimized image data URL
   */
  dataUrl: string;
  /**
   * Blur placeholder data URL
   */
  blurDataUrl?: string;
  /**
   * Final width
   */
  width: number;
  /**
   * Final height
   */
  height: number;
  /**
   * Compression ratio achieved
   */
  compressionRatio: number;
  /**
   * Original file size in bytes
   */
  originalSize: number;
  /**
   * Optimized file size in bytes
   */
  optimizedSize: number;
  /**
   * Format used
   */
  format: string;
}

/**
 * Optimize image using browser APIs
 */
export async function optimizeImage(
  imageSource: string | File | Blob,
  options: ImageOptimizationOptions = {}
): Promise<OptimizedImageResult> {
  const {
    quality = 80,
    format = 'auto',
    maxWidth = 1920,
    maxHeight = 1080,
    progressive = true,
    blurAmount = 10,
  } = options;

  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    if (!ctx) {
      reject(new Error('Canvas not supported'));
      return;
    }

    img.onload = () => {
      // Calculate optimal dimensions
      const { width: targetWidth, height: targetHeight } = calculateOptimalDimensions(
        img.width,
        img.height,
        maxWidth,
        maxHeight
      );

      canvas.width = targetWidth;
      canvas.height = targetHeight;

      // Draw image with optimal settings
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

      // Determine optimal format
      const targetFormat = getOptimalFormat(format, img.src);
      const mimeType = `image/${targetFormat}`;
      const qualityValue = quality / 100;

      // Create optimized image
      const optimizedDataUrl = canvas.toDataURL(mimeType, qualityValue);
      
      // Calculate sizes
      const originalSize = estimateImageSize(img.src);
      const optimizedSize = estimateDataUrlSize(optimizedDataUrl);
      const compressionRatio = originalSize > 0 ? (optimizedSize / originalSize) : 1;

      // Create blur placeholder if progressive
      let blurDataUrl: string | undefined;
      if (progressive) {
        blurDataUrl = createBlurPlaceholder(canvas, blurAmount);
      }

      resolve({
        dataUrl: optimizedDataUrl,
        blurDataUrl,
        width: targetWidth,
        height: targetHeight,
        compressionRatio,
        originalSize,
        optimizedSize,
        format: targetFormat,
      });
    };

    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };

    // Handle different input types
    if (typeof imageSource === 'string') {
      img.src = imageSource;
    } else if (imageSource instanceof File || imageSource instanceof Blob) {
      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(imageSource);
    }
  });
}

/**
 * Calculate optimal dimensions while maintaining aspect ratio
 */
export function calculateOptimalDimensions(
  originalWidth: number,
  originalHeight: number,
  maxWidth: number,
  maxHeight: number
): { width: number; height: number } {
  const aspectRatio = originalWidth / originalHeight;

  let width = originalWidth;
  let height = originalHeight;

  // Scale down if too large
  if (width > maxWidth) {
    width = maxWidth;
    height = width / aspectRatio;
  }

  if (height > maxHeight) {
    height = maxHeight;
    width = height * aspectRatio;
  }

  return {
    width: Math.round(width),
    height: Math.round(height),
  };
}

/**
 * Determine optimal image format based on browser support and content
 */
export function getOptimalFormat(
  preferredFormat: string,
  imageSource: string
): 'webp' | 'avif' | 'jpeg' | 'png' {
  if (preferredFormat !== 'auto') {
    return preferredFormat as 'webp' | 'avif' | 'jpeg' | 'png';
  }

  // Check browser support for modern formats
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;

  // Test AVIF support
  if (canvas.toDataURL('image/avif').includes('data:image/avif')) {
    return 'avif';
  }

  // Test WebP support
  if (canvas.toDataURL('image/webp').includes('data:image/webp')) {
    return 'webp';
  }

  // Fallback to JPEG for photos, PNG for graphics
  if (imageSource.includes('photo') || imageSource.includes('camera')) {
    return 'jpeg';
  }

  return 'png';
}

/**
 * Create blur placeholder for progressive loading
 */
export function createBlurPlaceholder(
  sourceCanvas: HTMLCanvasElement,
  blurAmount: number = 10
): string {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) return '';

  // Small size for placeholder
  canvas.width = 40;
  canvas.height = 40;

  // Draw scaled down version
  ctx.drawImage(sourceCanvas, 0, 0, 40, 40);

  // Apply blur effect
  ctx.filter = `blur(${blurAmount}px)`;
  ctx.drawImage(canvas, 0, 0);

  return canvas.toDataURL('image/jpeg', 0.5);
}

/**
 * Estimate image size from data URL
 */
export function estimateDataUrlSize(dataUrl: string): number {
  if (!dataUrl.startsWith('data:')) return 0;
  
  const base64 = dataUrl.split(',')[1];
  if (!base64) return 0;
  
  // Base64 encoding increases size by ~33%
  return Math.round((base64.length * 3) / 4);
}

/**
 * Estimate image size from URL (rough estimate)
 */
export function estimateImageSize(url: string): number {
  if (url.startsWith('data:')) {
    return estimateDataUrlSize(url);
  }
  
  // For HTTP URLs, we can't easily get size without fetch
  // Return a reasonable estimate based on typical AI image sizes
  return 1024 * 1024; // 1MB estimate
}

/**
 * Get responsive image sizes string for Next.js Image component
 */
export function getResponsiveImageSizes(
  breakpoints: Record<string, number> = {}
): string {
  const defaultBreakpoints = {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    '2xl': 1536,
    ...breakpoints,
  };

  const sizes = [
    `(max-width: ${defaultBreakpoints.sm}px) 100vw`,
    `(max-width: ${defaultBreakpoints.md}px) 80vw`,
    `(max-width: ${defaultBreakpoints.lg}px) 60vw`,
    `(max-width: ${defaultBreakpoints.xl}px) 50vw`,
    '40vw',
  ];

  return sizes.join(', ');
}

/**
 * Preload critical images for better performance
 */
export function preloadImage(src: string, crossOrigin?: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    if (crossOrigin) img.crossOrigin = crossOrigin;
    img.src = src;
  });
}

/**
 * Batch preload multiple images
 */
export async function preloadImages(
  srcs: string[],
  options: { crossOrigin?: string; maxConcurrent?: number } = {}
): Promise<void> {
  const { crossOrigin, maxConcurrent = 3 } = options;
  
  const batches = [];
  for (let i = 0; i < srcs.length; i += maxConcurrent) {
    batches.push(srcs.slice(i, i + maxConcurrent));
  }

  for (const batch of batches) {
    await Promise.all(
      batch.map(src => preloadImage(src, crossOrigin))
    );
  }
}

/**
 * Generate blur data URL for an image
 */
export function generateBlurDataUrl(
  width: number = 10,
  height: number = 10,
  color: string = '#e5e7eb'
): string {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) return '';

  canvas.width = width;
  canvas.height = height;

  // Create gradient
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, color);
  gradient.addColorStop(1, adjustColor(color, -20));

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  return canvas.toDataURL('image/jpeg', 0.5);
}

/**
 * Adjust color brightness
 */
function adjustColor(color: string, amount: number): string {
  const usePound = color[0] === '#';
  const col = usePound ? color.slice(1) : color;
  const num = parseInt(col, 16);
  
  let r = (num >> 16) + amount;
  let g = (num >> 8 & 0x00FF) + amount;
  let b = (num & 0x0000FF) + amount;

  r = r > 255 ? 255 : r < 0 ? 0 : r;
  g = g > 255 ? 255 : g < 0 ? 0 : g;
  b = b > 255 ? 255 : b < 0 ? 0 : b;

  return (usePound ? '#' : '') + ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
}

/**
 * Check if browser supports modern image formats
 */
export function checkImageFormatSupport(): {
  webp: boolean;
  avif: boolean;
  jpeg: boolean;
  png: boolean;
} {
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;

  return {
    webp: canvas.toDataURL('image/webp').includes('data:image/webp'),
    avif: canvas.toDataURL('image/avif').includes('data:image/avif'),
    jpeg: true,
    png: true,
  };
}