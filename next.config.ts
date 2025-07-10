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
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.gstatic.com https://www.googleapis.com https://apis.google.com https://firebasestorage.googleapis.com https://www.google.com https://js.stripe.com https://checkout.stripe.com https://maps.googleapis.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "img-src 'self' blob: data: https://placehold.co https://firebasestorage.googleapis.com https://www.google.com https://maps.googleapis.com https://maps.gstatic.com",
              "font-src 'self' https://fonts.gstatic.com data:",
              "connect-src 'self' https://api.openai.com https://generativelanguage.googleapis.com https://firebasestorage.googleapis.com https://www.googleapis.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://firebaseinstallations.googleapis.com https://fcmregistrations.googleapis.com https://content-firebaseappcheck.googleapis.com https://firebaseremoteconfig.googleapis.com https://firebaselogging.googleapis.com https://firebase-settings.googleusercontent.com https://firestore.googleapis.com https://vitals.vercel-insights.com wss://localhost:* ws://localhost:* http://localhost:* https://localhost:*",
              "frame-src 'self' https://www.google.com https://checkout.stripe.com https://js.stripe.com",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'self'",
              "block-all-mixed-content",
              "upgrade-insecure-requests"
            ].join('; ')
          }
        ]
      }
    ]
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
