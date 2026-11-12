/**
 * Same-origin proxy for a lesson narration's word-timing sidecar.
 *
 * The viewer needs `kokoro_main_timestamps.json` to know where each page
 * begins in the recording (see src/lib/lessons/audio-alignment.ts). The file
 * sits on the media CDN, and the CDN sends no `Access-Control-Allow-Origin`,
 * so a direct `fetch()` from gwth.ai is blocked by the browser. Images and
 * audio are unaffected — `<img>` and `<audio>` are not CORS-gated — which is
 * why this only bit the one thing that reads media as DATA. The viewer fell
 * back to word-count estimates and nobody saw an error.
 *
 * Rather than open CORS on the whole media bucket, the site fetches the file
 * for the browser. Requests are pinned to the configured CDN origin and to the
 * `_timestamps.json` suffix, so this cannot be used to fetch anything else.
 */
import { NextResponse } from "next/server"
import { eq } from "drizzle-orm"
import { GetObjectCommand } from "@aws-sdk/client-s3"
import { mediaCdnBase, mediaUrl } from "@/lib/media/url"
import { r2Bucket, r2Client } from "@/lib/media/s3"
import { lessonKeyOf } from "@/lib/media/signing-rules"
import { timestampsUrlFor } from "@/lib/lessons/audio-alignment"
import { checkLessonAccess } from "@/lib/lessons/lesson-access"
import { getSessionEmail } from "@/lib/auth"

/**
 * Cached in the learner's browser only: since bead gwth-launch-735c the
 * timings are for signed-in learners with access to the lesson, so no shared
 * cache may keep a copy. The server memoises below instead.
 */
const CACHE_CONTROL = "private, max-age=3600"

/**
 * The media hostname sits behind Cloudflare bot protection, which answers 403
 * to Node's default `user-agent: node`. Measured from inside the production
 * container: bare fetch 403, this UA 200, and a spoofed Chrome UA 403 as well
 * (Cloudflare cross-checks the TLS fingerprint, so pretending to be a browser
 * is worse than saying who we are). Identify the site honestly.
 */
const UPSTREAM_USER_AGENT = "Mozilla/5.0 (compatible; GWTH-site/1.0; +https://gwth.ai)"

/**
 * Fetched sidecars, kept for the life of the process. A lesson's word timings
 * only change when its audio is re-cut, and there are 26 lessons, so this is
 * bounded and tiny. It also means the intermittent Cloudflare challenge below
 * is paid at most once per lesson per container.
 */
const memoryCache = new Map<string, string>()

/**
 * True when `src` is a timings file on the configured media CDN. Anything else
 * is refused: this endpoint takes a URL from the client, so the origin check is
 * what stops it becoming an open proxy into the private network.
 */
export function isAllowedTimingsUrl(src: string, cdnBase: string): boolean {
  if (!cdnBase) return false
  let target: URL
  let base: URL
  try {
    target = new URL(src)
    base = new URL(cdnBase)
  } catch {
    return false
  }
  if (target.origin !== base.origin) return false
  if (target.search || target.hash) return false
  return target.pathname.endsWith("_timestamps.json")
}

/**
 * ?lesson=<id> (what the lesson page sends since bead gwth-launch-735c): the
 * caller must be a signed-in learner with access to that lesson, and the file
 * is read straight from storage, so it keeps working once the public lesson
 * folder on the CDN is closed. ?src=<cdn url> (older pages) needs a session.
 */
export async function GET(request: Request) {
  const params = new URL(request.url).searchParams
  const lessonId = params.get("lesson")
  if (lessonId !== null) return lessonTimings(lessonId)

  if (!(await getSessionEmail())) {
    return NextResponse.json({ error: "sign in to continue this lesson" }, { status: 401 })
  }
  const src = params.get("src") ?? ""
  if (!isAllowedTimingsUrl(src, mediaCdnBase())) {
    return NextResponse.json(
      { error: "src must be a _timestamps.json file on the media CDN" },
      { status: 400 }
    )
  }
  return timingsFor(src)
}

async function lessonTimings(lessonId: string): Promise<NextResponse> {
  if (!/^m\d+_l\d{2}$/.test(lessonId)) {
    return NextResponse.json({ error: "bad lesson" }, { status: 400 })
  }
  const access = await checkLessonAccess(lessonId)
  if (!access.ok) return NextResponse.json({ error: access.message }, { status: access.status })
  let audio: string | null = null
  try {
    const { getDb } = await import("@/db")
    const { lessons } = await import("@/db/schema")
    const rows = await getDb()
      .select({ audio: lessons.audioFileUrl })
      .from(lessons)
      .where(eq(lessons.id, lessonId))
      .limit(1)
    audio = rows[0]?.audio ?? null
  } catch (error) {
    console.error("[lesson-timings] lesson lookup failed", lessonId, error)
  }
  const src = timestampsUrlFor(mediaUrl(audio))
  if (!src) return NextResponse.json({ error: "no narration timings for this lesson" }, { status: 404 })
  return timingsFor(src)
}

/** Read the sidecar from R2 with the site's key, or null when that is not set up. */
async function readFromStorage(src: string): Promise<{ body: string | null; status: number } | null> {
  const client = r2Client()
  const bucket = r2Bucket()
  const key = lessonKeyOf(src, mediaCdnBase())
  if (!client || !bucket || !key) return null
  try {
    const out = await client.send(new GetObjectCommand({ Bucket: bucket, Key: key }))
    const body = (await out.Body?.transformToString()) ?? null
    return { body, status: body === null ? 502 : 200 }
  } catch (error) {
    const status = (error as { $metadata?: { httpStatusCode?: number } })?.$metadata?.httpStatusCode ?? 502
    if (status !== 404) console.error("[lesson-timings] storage read failed", key, error)
    return { body: null, status }
  }
}

async function timingsFor(src: string): Promise<NextResponse> {
  const cached = memoryCache.get(src)
  if (cached) return timingsResponse(cached)

  let body: string | null = null
  let lastStatus = 0
  const stored = await readFromStorage(src)
  if (stored) {
    if (stored.body === null) {
      return NextResponse.json(
        { error: "timings not available", upstream: stored.status },
        { status: stored.status === 404 ? 404 : 502 }
      )
    }
    memoryCache.set(src, stored.body)
    return timingsResponse(stored.body)
  }
  // Cloudflare answers the FIRST request from this server with a managed
  // challenge (`cf-mitigated: challenge`, HTTP 403) and then lets the next one
  // straight through — observed repeatedly from inside the production
  // container. One retry is enough in practice; three is cheap insurance.
  for (let attempt = 0; attempt < 3; attempt += 1) {
    let upstream: Response
    try {
      // Plain fetch, NOT Next's data cache: this response is 469KB and is
      // memoised below instead.
      upstream = await fetch(src, {
        cache: "no-store",
        headers: {
          "user-agent": UPSTREAM_USER_AGENT,
          accept: "application/json",
        },
      })
    } catch (error) {
      console.error("[lesson-timings] fetch threw", src, error)
      return NextResponse.json(
        { error: "timings fetch failed", reason: String(error) },
        { status: 502 }
      )
    }
    lastStatus = upstream.status
    if (upstream.ok) {
      body = await upstream.text()
      break
    }
    // A lesson with no sidecar is normal, not an error: the viewer falls back
    // to word-count estimates. Do not burn retries on it.
    if (upstream.status === 404) break
    console.warn(
      "[lesson-timings] upstream",
      upstream.status,
      upstream.headers.get("cf-mitigated") ?? "",
      `attempt ${attempt + 1}`,
      src
    )
  }

  if (body === null) {
    return NextResponse.json(
      { error: "timings not available", upstream: lastStatus },
      { status: lastStatus === 404 ? 404 : 502 }
    )
  }

  memoryCache.set(src, body)
  return timingsResponse(body)
}

/** The JSON response, with the caching headers the edge should honour. */
function timingsResponse(body: string): NextResponse {
  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": CACHE_CONTROL,
    },
  })
}
