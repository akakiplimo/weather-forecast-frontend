import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        // destination: 'http://localhost:8000/api/:path*', // For local development
        destination: process.env.NEXT_PUBLIC_API_URL + '/:path*',
      },
    ];
  },
};

export default nextConfig;
