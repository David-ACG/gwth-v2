import type { NextConfig } from "next"
import bundleAnalyzer from "@next/bundle-analyzer"

const nextConfig: NextConfig = {
  output: "standalone",
  compress: true,
  // Dev-only: David reviews the dev server from his P53 over the LAN and
  // over Tailscale. Without this, Next 16 blocks /_next/* requests (incl.
  // the HMR websocket) from these origins — pages render but never hydrate
  // or hot-reload (dead buttons, stale tabs that miss later edits).
  allowedDevOrigins: [
    "192.168.178.50",
    "hlab.taila51191.ts.net",
    "100.79.248.39",
  ],
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
