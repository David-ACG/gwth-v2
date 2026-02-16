import type { MetadataRoute } from "next"
import { APP_URL } from "@/lib/config"

/**
 * Robots.txt configuration for search engine crawlers.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/dashboard/", "/settings/", "/profile/", "/bookmarks/", "/notifications/"],
    },
    sitemap: `${APP_URL}/sitemap.xml`,
  }
}
