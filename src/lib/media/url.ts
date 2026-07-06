/**
 * Read-side media URL resolver (D5/D6/D7 — Cloudflare R2 + edge).
 *
 * The site is the READ/CDN consumer of lesson media (images, intro/build MP4,
 * narration audio, segments, PDFs). Media is stored in Cloudflare R2 and served
 * publicly through the edge on a media hostname (e.g. https://media.gwth.ai or
 * the reserved video.gwth.ai for video). This helper turns whatever reference a
 * lesson row carries into the URL the browser should actually fetch.
 *
 * It is deliberately tolerant so it works across three eras without a data
 * migration:
 *   1. New pipeline emits CDN URLs already          → passed through.
 *   2. Already-imported Month-1 rows carry legacy    → rewritten onto the CDN.
 *      P520 origin URLs (http://192.168.178.50:8088/api/lessons/...)
 *   3. A bare relative key ("lessons/m1_l01/...")    → prefixed with the CDN.
 *
 * When NEXT_PUBLIC_MEDIA_CDN_BASE_URL is unset (dev / pre-cutover) every input
 * is returned unchanged, so nothing breaks before the R2/edge cutover lands.
 *
 * The base URL is a public hostname (not a secret), hence NEXT_PUBLIC_* so the
 * same resolver works in both server and client components.
 */

const CDN_BASE = (process.env.NEXT_PUBLIC_MEDIA_CDN_BASE_URL ?? "").replace(
  /\/+$/,
  "",
)

/**
 * Legacy media origins whose `/api/lessons/...` path we fold onto the CDN.
 * The P520 pipeline historically handed out absolute URLs against its own box
 * (192.168.178.50:8088) or, transitionally, gwth.ai/api/lessons. R2 keys drop
 * the `/api/` segment: `/api/lessons/<id>/<type>/<file>` → `lessons/<id>/<type>/<file>`.
 */
const LEGACY_API_LESSONS_RE =
  /^(?:https?:\/\/[^/]+)?\/api\/lessons\/(.+)$/i

/** True for an absolute http(s) URL. */
function isAbsolute(ref: string): boolean {
  return /^https?:\/\//i.test(ref)
}

/**
 * Resolve a stored media reference to its public CDN/edge URL.
 * Returns the input unchanged when no CDN base is configured, or when the
 * reference is already an absolute non-legacy URL.
 */
export function mediaUrl<T extends string | null | undefined>(ref: T): T {
  if (!ref) return ref
  const value = String(ref)

  // No CDN configured yet: pre-cutover / dev — pass everything through.
  if (!CDN_BASE) return ref

  // Legacy `/api/lessons/...` (absolute against P520 OR site-relative): fold the
  // key onto the CDN, dropping the `/api/` segment to match the R2 key scheme.
  const legacy = value.match(LEGACY_API_LESSONS_RE)
  if (legacy) {
    return `${CDN_BASE}/lessons/${legacy[1]}` as T
  }

  // Any other absolute URL is assumed to already be a CDN/managed URL.
  if (isAbsolute(value)) return ref

  // Bare relative key (e.g. "lessons/m1_l01/video/intro.mp4"): prefix the CDN.
  const key = value.replace(/^\/+/, "")
  return `${CDN_BASE}/${key}` as T
}

/** The configured CDN base (empty string when unset). Exposed for diagnostics. */
export function mediaCdnBase(): string {
  return CDN_BASE
}

/**
 * Resolve a markdown image src from pipeline lesson bodies (learnContent) to
 * a renderable URL, or null when it should not be requested at all.
 *
 * The pipeline embeds figures as bare R2 keys ("lessons/<id>/assets/…" or
 * "lessons/<id>/images/…", W16) which resolve through mediaUrl(). Anything
 * absolute or self-contained (http(s)/data:/blob:) passes through, legacy
 * /api/lessons refs fold onto the CDN, and every other relative ref returns
 * null — those files are not hosted, so emitting them would only 404.
 */
export function markdownImageUrl(src: unknown): string | null {
  if (typeof src !== "string") return null
  const value = src.trim()
  if (!value) return null
  if (/^(data:|blob:)/i.test(value)) return value
  if (isAbsolute(value)) return mediaUrl(value)

  const key = value.replace(/^\/+/, "")
  if (/^(lessons|api\/lessons)\//i.test(key)) {
    const resolved = mediaUrl(key.startsWith("api/") ? `/${key}` : key)
    // Without a CDN base the key stays relative — hide it rather than 404.
    return isAbsolute(resolved) ? resolved : null
  }
  return null
}
