import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  serverRuntimeConfig: {
    maxDuration: 60, // This sets max duration to 60 seconds
  },
};

export default nextConfig;
