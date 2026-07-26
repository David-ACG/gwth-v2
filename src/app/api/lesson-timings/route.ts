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
import { mediaCdnBase } from "@/lib/media/url"

/** Cache hard: a lesson's word timings only change when the audio is re-cut. */
const CACHE_CONTROL = "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800"

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

export async function GET(request: Request) {
  const src = new URL(request.url).searchParams.get("src") ?? ""
  if (!isAllowedTimingsUrl(src, mediaCdnBase())) {
    return NextResponse.json(
      { error: "src must be a _timestamps.json file on the media CDN" },
      { status: 400 }
    )
  }

  let upstream: Response
  try {
    // Plain fetch, NOT Next's data cache: a 469KB body through the
    // incremental cache failed in the standalone production image while the
    // same request from a shell in that container succeeded. Edge caching is
    // handled by the Cache-Control below instead.
    upstream = await fetch(src, { cache: "no-store" })
  } catch (error) {
    console.error("[lesson-timings] upstream fetch failed", src, error)
    return NextResponse.json(
      { error: "timings fetch failed", reason: String(error) },
      { status: 502 }
    )
  }
  if (!upstream.ok) {
    // A lesson with no sidecar is normal, not an error: the viewer falls back
    // to word-count estimates. Pass the status through so it can tell.
    console.error("[lesson-timings] upstream", upstream.status, src)
    return NextResponse.json(
      { error: "timings not available", upstream: upstream.status },
      { status: upstream.status === 404 ? 404 : 502 }
    )
  }

  const body = await upstream.text()
  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": CACHE_CONTROL,
    },
  })
}
