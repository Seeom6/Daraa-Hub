/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    '@daraa/types',
    '@daraa/utils',
    '@daraa/api',
    '@daraa/state',
    '@daraa/core',
    '@daraa/ui',
    '@daraa/theme',
  ],
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
  },
};

module.exports = nextConfig;

