import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable standalone output for Docker optimization
  output: 'standalone',
  
  // Optimize for production
  compress: true,
  
  // External packages for server components
  serverExternalPackages: ['exceljs'],
  
  // Image optimization
  images: {
    unoptimized: true, // For static exports if needed
  },

  async redirects() {
    return [
      {
        source: '/:path*',
        has: [
          { type: 'host', value: 'www.converto.dev' },
        ],
        destination: 'https://converto.dev/:path*',
        permanent: true,
      },
    ];
  },

  async headers() {
    const now = new Date().toUTCString();
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Last-Modified', value: now },
          { key: 'X-Robots-Tag', value: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1' },
        ],
      },
    ];
  },
};

export default nextConfig;
