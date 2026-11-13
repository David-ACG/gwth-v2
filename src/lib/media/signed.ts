/**
 * Signed per-learner links for lesson media (bead gwth-launch-735c, decision 1:
 * "A, the website signs each link itself, using the storage key it already
 * has").
 *
 * When a signed-in learner opens a lesson, the page swaps every lesson media
 * reference (video, audio, pictures, in props and inside markdown or part
 * HTML) for an R2 presigned link made for that request. Each link lives at
 * most 3 hours, so a copied list of links stops working the same day. The
 * count of links handed out is recorded with the lesson view, which the
 * too-fast monitor reads.
 *
 * Switched on by MEDIA_SIGNED_LINKS=1 with the site's read-only R2 key set
 * (S3_*). Off, or when signing fails, every reference is left as it is, so
 * the page never breaks: the public addresses keep working until the GO LIVE
 * release closes them in Cloudflare (a free rule blocking /lessons/* on
 * media.gwth.ai, and the bucket's r2.dev address switched off).
 */
import "server-only"

import { GetObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { mediaCdnBase } from "@/lib/media/url"
import { r2Bucket, r2Client } from "@/lib/media/s3"
import {
  SIGNED_LINK_SECONDS,
  collectLessonRefs,
  rewriteLessonRefs,
  signingWindowStart,
} from "@/lib/media/signing-rules"

export function mediaSigningEnabled(): boolean {
  return process.env.MEDIA_SIGNED_LINKS === "1" && Boolean(r2Client() && r2Bucket())
}

/** Presign one key for the current window (same link all hour, lives 2 to 3 hours). */
async function presignKey(key: string, now: Date): Promise<string | null> {
  const client = r2Client()
  const bucket = r2Bucket()
  if (!client || !bucket) return null
  // Signed as of the start of the hour: a window started at 10:00 makes links
  // valid until 13:00, so even one handed out at 10:59 still has 2 hours.
  return getSignedUrl(client, new GetObjectCommand({ Bucket: bucket, Key: key }), {
    expiresIn: SIGNED_LINK_SECONDS,
    signingDate: signingWindowStart(now),
  })
}

/**
 * A copy of `value` with every lesson media reference swapped for a signed
 * link, and how many distinct files were signed. Unchanged (links: 0) when
 * signing is off or fails.
 */
export async function signLessonMedia<T>(
  value: T,
  now = new Date()
): Promise<{ value: T; links: number }> {
  if (!mediaSigningEnabled()) return { value, links: 0 }
  try {
    const refs = collectLessonRefs(value, mediaCdnBase())
    if (refs.size === 0) return { value, links: 0 }
    const byKey = new Map<string, string | null>()
    await Promise.all(
      [...new Set(refs.values())].map(async (key) => byKey.set(key, await presignKey(key, now)))
    )
    const signed = new Map<string, string>()
    for (const [ref, key] of refs) {
      const url = byKey.get(key)
      if (url) signed.set(ref, url)
    }
    return { value: rewriteLessonRefs(value, signed), links: byKey.size }
  } catch (error) {
    console.error("[media] signing failed; serving the plain links", error)
    return { value, links: 0 }
  }
}
