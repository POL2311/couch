import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  serverExternalPackages: ["xlsx", "jszip"],
};

export default nextConfig;
