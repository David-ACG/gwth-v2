import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      // Add patterns as external image sources are identified
    ],
  },
};

export default nextConfig;
