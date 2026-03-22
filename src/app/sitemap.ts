import type { MetadataRoute } from "next"

/**
 * Sitemap: returns empty during pre-launch to prevent search engine indexing.
 * Will be restored with full page list when the site launches publicly.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return []
}
