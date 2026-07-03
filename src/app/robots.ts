import type { MetadataRoute } from "next"

// Force dynamic so the ALLOW_INDEXING env check is evaluated at request
// time rather than baked in at build time — without this, /robots.txt
// would lock in whichever value ALLOW_INDEXING had during `next build`.
export const dynamic = "force-dynamic"

/**
 * Robots.txt: blocks all crawlers and AI scrapers during pre-launch.
 * No sitemap is exposed.
 *
 * ALLOW_INDEXING=1 inverts the default and allows all crawlers (used
 * by the Lighthouse audit harness so the SEO is-crawlable check
 * passes; will also drop in for the public launch).
 */
export default function robots(): MetadataRoute.Robots {
  if (process.env.ALLOW_INDEXING === "1") {
    return {
      rules: [
        {
          userAgent: "*",
          allow: "/",
        },
      ],
    }
  }

  return {
    rules: [
      {
        userAgent: "*",
        disallow: "/",
      },
      // Explicitly block known AI scrapers
      {
        userAgent: "GPTBot",
        disallow: "/",
      },
      {
        userAgent: "ChatGPT-User",
        disallow: "/",
      },
      {
        userAgent: "Google-Extended",
        disallow: "/",
      },
      {
        userAgent: "CCBot",
        disallow: "/",
      },
      {
        userAgent: "anthropic-ai",
        disallow: "/",
      },
      {
        userAgent: "ClaudeBot",
        disallow: "/",
      },
      {
        userAgent: "Bytespider",
        disallow: "/",
      },
      {
        userAgent: "PerplexityBot",
        disallow: "/",
      },
      {
        userAgent: "Amazonbot",
        disallow: "/",
      },
      {
        userAgent: "FacebookBot",
        disallow: "/",
      },
    ],
  }
}
