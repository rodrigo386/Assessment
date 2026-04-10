import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    // Logo is a local webp — next/image serves from /public by default
    unoptimized: false,
  },
  // Zero backend calls — no env-required rewrites/headers
};

export default nextConfig;
