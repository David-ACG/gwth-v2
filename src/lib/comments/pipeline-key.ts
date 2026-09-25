/**
 * Service-to-service auth for /api/pipeline/comments (the triage script).
 *
 * Same contract as /api/admin/import-lessons: the shared PIPELINE_API_KEY,
 * sent as the `x-api-key` header (or `apiKey` in the query or body). Fails
 * closed: with no key configured on the server nothing is let through.
 */
import { timingSafeEqual } from "node:crypto"
import { NextResponse } from "next/server"

/** Constant-time string comparison. */
function sameKey(a: string, b: string): boolean {
  const left = Buffer.from(a)
  const right = Buffer.from(b)
  if (left.length !== right.length) return false
  return timingSafeEqual(left, right)
}

/**
 * Returns null when the caller presented the right key, or the response to
 * send back (500 when the server has no key, 401 when the key is wrong).
 */
export function checkPipelineKey(
  request: Request,
  fallbackKey?: string | null
): NextResponse | null {
  const expected = process.env.PIPELINE_API_KEY
  if (!expected) {
    return NextResponse.json(
      { error: "PIPELINE_API_KEY not configured on server" },
      { status: 500 }
    )
  }
  const presented = request.headers.get("x-api-key") ?? fallbackKey ?? ""
  if (!presented || !sameKey(presented, expected)) {
    return NextResponse.json({ error: "Invalid API key" }, { status: 401 })
  }
  return null
}
