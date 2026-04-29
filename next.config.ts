import type { NextConfig } from "next"
import bundleAnalyzer from "@next/bundle-analyzer"

const nextConfig: NextConfig = {
  output: "standalone",
  compress: true,
  images: {
    remotePatterns: [
      // Add patterns as external image sources are identified
    ],
  },
  // Drops dead-code from per-icon imports of lucide-react and per-section
  // motion imports — without this the homepage pulls in the entire
  // surface of each package on the critical path.
  experimental: {
    optimizePackageImports: ["lucide-react", "motion", "motion/react"],
  },
}

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
})

export default withBundleAnalyzer(nextConfig)
