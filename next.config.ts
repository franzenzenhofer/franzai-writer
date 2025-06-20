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
        ? config.watchOptions.ignored.filter(path => path && path.length > 0)
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
