import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable standalone output for Docker optimization
  output: 'standalone',
  
  // Optimize for production
  compress: true,
  
  // Enable experimental features for better performance
  experimental: {
    // Enable server components
    serverComponentsExternalPackages: ['exceljs'],
  },
  
  // Image optimization
  images: {
    unoptimized: true, // For static exports if needed
  },
};

export default nextConfig;
