import type { MetadataRoute } from "next"

// Force dynamic so the ALLOW_INDEXING env check is evaluated at request
// time rather than baked in at build time — without this, /robots.txt
// would lock in whichever value ALLOW_INDEXING had during `next build`.
export const dynamic = "force-dynamic"

/**
 * Search crawlers that get their own named group (W26).
 *
 * Cloudflare's managed content-signals block is prepended to whatever the
 * origin serves, and it opens with its OWN `User-agent: *` carrying `Allow: /`.
 * Merged with our `User-agent: *` / `Disallow: /` that is a genuine
 * contradiction, and RFC 9309 settles an equally specific allow-versus-disallow
 * in favour of the allow — so the wildcard group on its own blocks nobody.
 *
 * A crawler obeys the MOST SPECIFIC user-agent group that matches it and
 * ignores the wildcard groups entirely. Naming the search engines here
 * therefore settles the question for every crawler that actually drives
 * indexing, without touching the Cloudflare-managed block, which carries the
 * Content-Signal AI-training reservations we want to keep. Switching
 * Cloudflare's managed robots.txt off in the dashboard removes the
 * contradiction at source; this is the half that lives in the repo.
 *
 * Either way the `X-Robots-Tag: noindex` header that src/proxy.ts stamps on
 * every pre-launch response stays the authoritative signal: robots.txt governs
 * crawling, not indexing.
 */
const SEARCH_CRAWLERS = [
  "Googlebot",
  "Googlebot-Image",
  "Googlebot-News",
  "Bingbot",
  "Slurp",
  "DuckDuckBot",
  "Baiduspider",
  "YandexBot",
  "Applebot",
]

/**
 * AI scrapers blocked by name, independently of the wildcard group. Overlaps
 * the Cloudflare-managed list on purpose: a named group in either block does
 * the job, and repeating them costs nothing if Cloudflare's managed robots.txt
 * is later switched off.
 */
const AI_SCRAPERS = [
  "GPTBot",
  "ChatGPT-User",
  "OAI-SearchBot",
  "Google-Extended",
  "CCBot",
  "anthropic-ai",
  "ClaudeBot",
  "Claude-Web",
  "Bytespider",
  "PerplexityBot",
  "Amazonbot",
  "Applebot-Extended",
  "FacebookBot",
  "meta-externalagent",
]

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
      // Named groups win over the wildcard, including Cloudflare's.
      ...[...SEARCH_CRAWLERS, ...AI_SCRAPERS].map((userAgent) => ({
        userAgent,
        disallow: "/",
      })),
    ],
  }
}
