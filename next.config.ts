import type { NextConfig } from "next"
import bundleAnalyzer from "@next/bundle-analyzer"

const nextConfig: NextConfig = {
  output: "standalone",
  compress: true,
  // Dev-only: David reviews the dev server from his P53 over the LAN.
  // Without this, Next 16 blocks /_next/* requests from the IP origin and
  // pages render but never hydrate (dead buttons, no interactivity).
  allowedDevOrigins: ["192.168.178.50"],
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
