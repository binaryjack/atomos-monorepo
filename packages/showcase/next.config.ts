import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  basePath: '/docs',
  assetPrefix: '/atomos-monorepo/docs',
  experimental: {
  },
};

export default nextConfig;
