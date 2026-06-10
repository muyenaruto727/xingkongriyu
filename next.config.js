/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // 环境变量配置
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
  },
};

module.exports = nextConfig;
