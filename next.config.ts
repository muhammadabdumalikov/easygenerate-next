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
          { type: 'host', value: 'www.converto.app' },
        ],
        destination: 'https://converto.app/:path*',
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
        ],
      },
    ];
  },
};

export default nextConfig;
