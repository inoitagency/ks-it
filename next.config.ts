import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  output: "standalone",
  turbopack: { root: path.resolve(__dirname) },
  experimental: {
    cpus: 2,
    webpackMemoryOptimizations: true,
  },
  reactStrictMode: false,
};

export default nextConfig;
