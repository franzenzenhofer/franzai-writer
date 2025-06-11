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
    ],
  },
  // Run unused code analysis as part of build (non-blocking)
  webpack: (config, { isServer, dev }) => {
    // Only run in production builds
    if (!dev && isServer) {
      const { execSync } = require('child_process');
      try {
        console.log('🔍 Checking for unused code...');
        execSync('npx knip', { stdio: 'inherit' });
      } catch (error) {
        console.warn('⚠️  Unused code detected - see output above (non-blocking)');
      }
    }
    return config;
  },
};

export default nextConfig;
