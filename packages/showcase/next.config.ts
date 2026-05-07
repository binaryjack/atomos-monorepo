import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  basePath: '/atomos-monorepo',
  assetPrefix: '',
  trailingSlash: true,
  experimental: {
  },
};

export default nextConfig;
