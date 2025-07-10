import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
        port: '',
        pathname: '/**',
      },
    ],
    // Enable modern image formats (WebP, AVIF)
    formats: ['image/avif', 'image/webp'],
    // Default quality for optimized images
    quality: 80,
    // Enable responsive image sizes
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Optimize images for better loading performance
    minimumCacheTTL: 86400, // 24 hours
    dangerouslyAllowSVG: false,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    // Enable placeholder blur for better UX
    placeholder: 'blur',
    // Lazy loading by default
    loading: 'lazy',
  },
  // Turbopack configuration (stable in Next.js 15.3+)
  turbopack: {
    resolveAlias: {
      // Fix Zod v3 import issues
      'zod/v3': 'zod',
      './v3/index.js': 'zod',
    },
  },
  // Webpack configuration to fix Watchpack error
  webpack: (config) => {
    // Exclude Node binary from being watched
    const ignoredPaths = ['/usr/local/bin/node', '**/node_modules', '**/.git'];
    
    if (config.watchOptions && config.watchOptions.ignored) {
      // Get existing ignored paths, filtering out empty values
      const existingIgnored = Array.isArray(config.watchOptions.ignored) 
        ? config.watchOptions.ignored.filter((path: any) => path && path.length > 0)
        : (config.watchOptions.ignored && config.watchOptions.ignored.length > 0 ? [config.watchOptions.ignored] : []);
      
      // Create a new watchOptions object to avoid mutating the read-only property
      config.watchOptions = {
        ...config.watchOptions,
        ignored: [...existingIgnored, ...ignoredPaths],
      };
    } else {
      config.watchOptions = {
        ...config.watchOptions,
        ignored: ignoredPaths,
      };
    }
    return config;
  },
};

export default nextConfig;
