import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: "standalone",
  env: {
    DATABASE_URL: process.env.DATABASE_URL,
  },
};

export default nextConfig;
