/**
 * Which media references get a signed per-learner link, and how they are found
 * and replaced (bead gwth-launch-735c, decision 1: "A, the website signs each
 * link itself").
 *
 * Pure, so it is shared by the server signer (./signed.ts) and its tests.
 *
 * Only LESSON media is signed: R2 keys under `lessons/`. The homepage film, the
 * free Start Here lesson and email pictures live under `site/` and `email/`
 * and stay public, so this module never touches them.
 *
 * A reference can be:
 *   - a CDN URL:            https://media.gwth.ai/lessons/m1_l01/video/intro.mp4
 *   - a legacy P520 URL:    http://192.168.178.50:8088/api/lessons/m1_l01/...
 *   - a bare R2 key:        lessons/m1_l01/assets/figure.png   (markdown bodies)
 * Inside a longer text (markdown, part HTML) CDN URLs are found anywhere, but a
 * bare key is only taken where it is an image or link target (`](key` or
 * `src="key"`), so prose that merely mentions a folder name is left alone.
 */

/** Links are made for a fixed one-hour window so a page's links stay the same
 * (and cacheable) within the hour, and each lives 3 hours from the start of
 * its window: never more than 3 hours, never less than 2. */
export const SIGNING_WINDOW_SECONDS = 60 * 60
export const SIGNED_LINK_SECONDS = 3 * 60 * 60

export function signingWindowStart(now: Date): Date {
  const w = SIGNING_WINDOW_SECONDS * 1000
  return new Date(Math.floor(now.getTime() / w) * w)
}

const LEGACY_API_RE = /^(?:https?:\/\/[^/]+)?\/api\/(lessons\/.+)$/i

function stripQuery(value: string): string {
  return value.replace(/[?#].*$/, "")
}

function safeDecode(value: string): string {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

/**
 * The R2 key behind a lesson media reference, or null when the reference is
 * not lesson media we host (other folders, other hosts, data: URLs).
 */
export function lessonKeyOf(ref: unknown, cdnBase: string): string | null {
  if (typeof ref !== "string") return null
  const value = ref.trim()
  if (!value) return null
  const base = cdnBase.replace(/\/+$/, "")

  let path: string | null = null
  if (base && value.startsWith(`${base}/`)) {
    path = value.slice(base.length + 1)
  } else {
    const legacy = value.match(LEGACY_API_RE)
    if (legacy) path = legacy[1] ?? null
    else if (!/^[a-z][a-z0-9+.-]*:/i.test(value) && !value.startsWith("//")) {
      path = value.replace(/^\/+/, "")
    }
  }
  if (!path) return null
  path = safeDecode(stripQuery(path))
  // Refuse control characters in a key.
  if (!/^lessons\/[^\u0000-\u001f]+$/.test(path) || path.includes("..")) return null
  return path
}

function escapeRe(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

const REF_CHARS = "[^\\s\"'()<>\\]\\\\]+"

/**
 * Every lesson media reference inside `text`: each match's exact substring and
 * its key. A whole-string reference is returned as one match.
 */
export function findLessonRefs(
  text: string,
  cdnBase: string
): Array<{ ref: string; key: string }> {
  const out: Array<{ ref: string; key: string }> = []
  const seen = new Set<string>()
  const push = (ref: string) => {
    if (seen.has(ref)) return
    const key = lessonKeyOf(ref, cdnBase)
    if (key) {
      seen.add(ref)
      out.push({ ref, key })
    }
  }

  // A value that IS a reference (a video URL prop, a bare key).
  if (!/\s/.test(text.trim())) {
    push(text.trim())
    if (out.length) return out
  }

  const base = cdnBase.replace(/\/+$/, "")
  if (base) {
    const cdnRe = new RegExp(`${escapeRe(base)}/lessons/${REF_CHARS}`, "g")
    for (const m of text.matchAll(cdnRe)) push(m[0])
  }
  // Image and link targets: markdown `](ref` and HTML `src="ref"` / `href='ref'`.
  const targetRe = new RegExp(`(?:\\]\\(\\s*|(?:src|href)=["'])(${REF_CHARS})`, "g")
  for (const m of text.matchAll(targetRe)) if (m[1]) push(m[1])
  return out
}

/** Replace each found reference with its signed link. */
export function replaceLessonRefs(
  text: string,
  signed: ReadonlyMap<string, string>
): string {
  if (signed.size === 0) return text
  if (signed.has(text.trim())) return signed.get(text.trim()) as string
  // Longest first, so a URL is never half-replaced by a shorter key inside it.
  const refs = [...signed.keys()].sort((a, b) => b.length - a.length)
  const re = new RegExp(refs.map(escapeRe).join("|"), "g")
  return text.replace(re, (m, offset: number, whole: string) => {
    // A bare key is only replaced where it is a target, never mid-URL.
    const before = whole.slice(Math.max(0, offset - 1), offset)
    if (!/^https?:/i.test(m) && /[A-Za-z0-9_./-]/.test(before)) return m
    return signed.get(m) ?? m
  })
}

/** Walk plain objects and arrays; collect every lesson reference in strings. */
export function collectLessonRefs(value: unknown, cdnBase: string): Map<string, string> {
  const refs = new Map<string, string>()
  const walk = (v: unknown, depth: number) => {
    if (depth > 12 || v == null) return
    if (typeof v === "string") {
      if (v.includes("lessons/")) {
        for (const { ref, key } of findLessonRefs(v, cdnBase)) refs.set(ref, key)
      }
      return
    }
    if (Array.isArray(v)) {
      for (const item of v) walk(item, depth + 1)
      return
    }
    if (typeof v === "object" && Object.getPrototypeOf(v) === Object.prototype) {
      for (const item of Object.values(v as Record<string, unknown>)) walk(item, depth + 1)
    }
  }
  walk(value, 0)
  return refs
}

/** A copy of `value` with every reference swapped for its signed link. */
export function rewriteLessonRefs<T>(value: T, signed: ReadonlyMap<string, string>): T {
  if (signed.size === 0) return value
  const walk = (v: unknown, depth: number): unknown => {
    if (depth > 12 || v == null) return v
    if (typeof v === "string") return v.includes("lessons/") ? replaceLessonRefs(v, signed) : v
    if (Array.isArray(v)) return v.map((item) => walk(item, depth + 1))
    if (typeof v === "object" && Object.getPrototypeOf(v) === Object.prototype) {
      const out: Record<string, unknown> = {}
      for (const [k, item] of Object.entries(v as Record<string, unknown>)) out[k] = walk(item, depth + 1)
      return out
    }
    return v
  }
  return walk(value, 0) as T
}
