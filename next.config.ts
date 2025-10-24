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
};

export default nextConfig;
