/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "standalone",
  env: {
    DATABASE_URL: process.env.DATABASE_URL,
  },
  serverExternalPackages: [], // Add any external packages here if needed
  experimental: {
    trace: false,
  },
};

module.exports = nextConfig;
