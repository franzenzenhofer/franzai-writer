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
  // Turbopack configuration (stable in Next.js 15.3+)
  turbopack: {
    resolveAlias: {
      // Fix Zod v3 import issues
      'zod/v3': 'zod',
      './v3/index.js': 'zod',
    },
  },
};

export default nextConfig;
