/**
 * Server-side Cloudflare R2 (S3-compatible) client — READ/CDN token (D5).
 *
 * The public read path for lesson media is the CDN base (see `mediaUrl` in
 * ./url.ts) — no S3 round-trip and no SDK on the hot path. This module is the
 * server-only client for the cases that DO need credentials:
 *   - presigning a GET URL for a private object, and
 *   - an ops health probe (list a prefix).
 *
 * Credentials come from the existing S3_* env vars and are the site's
 * READ/CDN-scoped token — split from the pipeline's WRITE-only token (D5). This
 * module must never be imported from a client component (it reads S3_SECRET_KEY).
 *
 * Everything is lazy: with the S3_* vars unset (dev / pre-cutover) `r2Client()`
 * returns null and callers fall back to the public CDN URL, so nothing breaks
 * before the R2 cutover.
 */

import "server-only"

import { S3Client, ListObjectsV2Command, GetObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"

const S3_ENDPOINT = process.env.S3_ENDPOINT
const S3_BUCKET = process.env.S3_BUCKET
const S3_ACCESS_KEY = process.env.S3_ACCESS_KEY
const S3_SECRET_KEY = process.env.S3_SECRET_KEY

let _client: S3Client | null = null

/** True when the READ/CDN S3 credentials are fully configured. */
export function r2Configured(): boolean {
  return Boolean(S3_ENDPOINT && S3_BUCKET && S3_ACCESS_KEY && S3_SECRET_KEY)
}

/** Lazily built singleton R2 client, or null when unconfigured. */
export function r2Client(): S3Client | null {
  if (!r2Configured()) return null
  if (_client) return _client
  _client = new S3Client({
    // R2 uses a fixed "auto" region and a path-style-safe virtual-host endpoint.
    region: "auto",
    endpoint: S3_ENDPOINT,
    credentials: {
      accessKeyId: S3_ACCESS_KEY as string,
      secretAccessKey: S3_SECRET_KEY as string,
    },
  })
  return _client
}

/** The configured bucket name (or null). */
export function r2Bucket(): string | null {
  return S3_BUCKET ?? null
}

/**
 * Presign a time-limited GET URL for a private object key.
 * Returns null when R2 is not configured. Public lesson media should be served
 * via the CDN (`mediaUrl`) instead — reserve this for genuinely private assets.
 */
export async function presignGet(
  key: string,
  expiresInSeconds = 3600,
): Promise<string | null> {
  const client = r2Client()
  if (!client || !S3_BUCKET) return null
  const cmd = new GetObjectCommand({ Bucket: S3_BUCKET, Key: key })
  return getSignedUrl(client, cmd, { expiresIn: expiresInSeconds })
}

/**
 * Ops health probe: list up to `max` keys under a prefix. Returns an object
 * describing reachability, for a /api health route or a manual check.
 */
export async function r2Health(
  prefix = "lessons/",
  max = 1,
): Promise<{ configured: boolean; reachable: boolean; sampleKey?: string; error?: string }> {
  if (!r2Configured()) return { configured: false, reachable: false }
  const client = r2Client()
  if (!client || !S3_BUCKET) return { configured: false, reachable: false }
  try {
    const out = await client.send(
      new ListObjectsV2Command({ Bucket: S3_BUCKET, Prefix: prefix, MaxKeys: max }),
    )
    return {
      configured: true,
      reachable: true,
      sampleKey: out.Contents?.[0]?.Key,
    }
  } catch (err) {
    return {
      configured: true,
      reachable: false,
      error: err instanceof Error ? err.message : String(err),
    }
  }
}
