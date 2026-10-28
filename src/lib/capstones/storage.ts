/**
 * Where hand-in files are kept (bead gwth-launch-9289.2): a PRIVATE R2 bucket
 * of their own, under `hand-ins/<hand_in_id>/...`, never the public lesson
 * media bucket that media.gwth.ai serves.
 *
 * Configuration (server env only):
 *   HANDIN_S3_ENDPOINT, HANDIN_S3_BUCKET, HANDIN_S3_ACCESS_KEY, HANDIN_S3_SECRET_KEY
 *     a write-capable token scoped to the private hand-ins bucket. The site's
 *     S3_* token is read-only and for the public bucket, so it is not reused.
 *   HANDIN_LOCAL_DIR
 *     a folder on this machine, for the hlab preview and development only.
 * With neither set, hand-ins stay closed (the page says so) rather than
 * writing somewhere unplanned. Files are deleted 12 months after the mark is
 * final (decision 7b; the deletion job is bead gwth-launch-9289.11).
 */
import "server-only"

import { mkdir, readFile, rm, writeFile } from "node:fs/promises"
import { dirname, join, resolve, sep } from "node:path"
import {
  DeleteObjectsCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3"

/** Every hand-in key starts with this. */
export const HAND_IN_PREFIX = "hand-ins/"

/** The store the hand-in code writes through. */
export interface HandInStore {
  /** "r2" in production, "local" on the hlab preview. */
  kind: "r2" | "local"
  put(key: string, bytes: Uint8Array, contentType: string): Promise<void>
  get(key: string): Promise<Uint8Array | null>
  deletePrefix(prefix: string): Promise<void>
}

/** The R2 key of one handed-in file. */
export function fileKey(handInId: string, path: string): string {
  return `${HAND_IN_PREFIX}${handInId}/files/${path}`
}

/** The R2 key of the optional recording (kept apart: never sent to an AI). */
export function recordingKey(handInId: string, extension: string): string {
  return `${HAND_IN_PREFIX}${handInId}/recording/recording.${extension}`
}

function assertKey(key: string): void {
  if (!key.startsWith(HAND_IN_PREFIX) || key.split("/").includes("..")) {
    throw new Error(`refusing hand-in key outside ${HAND_IN_PREFIX}: ${key}`)
  }
}

function r2Store(): HandInStore | null {
  const endpoint = process.env.HANDIN_S3_ENDPOINT
  const bucket = process.env.HANDIN_S3_BUCKET
  const accessKeyId = process.env.HANDIN_S3_ACCESS_KEY
  const secretAccessKey = process.env.HANDIN_S3_SECRET_KEY
  if (!endpoint || !bucket || !accessKeyId || !secretAccessKey) return null
  const client = new S3Client({ region: "auto", endpoint, credentials: { accessKeyId, secretAccessKey } })
  return {
    kind: "r2",
    async put(key, bytes, contentType) {
      assertKey(key)
      await client.send(new PutObjectCommand({ Bucket: bucket, Key: key, Body: bytes, ContentType: contentType }))
    },
    async get(key) {
      assertKey(key)
      try {
        const out = await client.send(new GetObjectCommand({ Bucket: bucket, Key: key }))
        return out.Body ? new Uint8Array(await out.Body.transformToByteArray()) : null
      } catch (error) {
        if ((error as { name?: string }).name === "NoSuchKey") return null
        throw error
      }
    },
    async deletePrefix(prefix) {
      assertKey(prefix)
      let token: string | undefined
      do {
        const page = await client.send(new ListObjectsV2Command({ Bucket: bucket, Prefix: prefix, ContinuationToken: token }))
        const keys = (page.Contents ?? []).flatMap((o) => (o.Key ? [{ Key: o.Key }] : []))
        if (keys.length) await client.send(new DeleteObjectsCommand({ Bucket: bucket, Delete: { Objects: keys } }))
        token = page.IsTruncated ? page.NextContinuationToken : undefined
      } while (token)
    },
  }
}

function localStore(): HandInStore | null {
  const dir = process.env.HANDIN_LOCAL_DIR
  if (!dir) return null
  const root = resolve(dir)
  const pathFor = (key: string) => {
    assertKey(key)
    const full = resolve(root, key)
    if (!full.startsWith(root + sep)) throw new Error(`refusing hand-in key outside ${root}`)
    return full
  }
  return {
    kind: "local",
    async put(key, bytes) {
      const full = pathFor(key)
      await mkdir(dirname(full), { recursive: true })
      await writeFile(full, bytes)
    },
    async get(key) {
      try {
        return new Uint8Array(await readFile(pathFor(key)))
      } catch {
        return null
      }
    },
    async deletePrefix(prefix) {
      await rm(join(pathFor(prefix)), { recursive: true, force: true })
    },
  }
}

/** The configured store (R2 first), or null when hand-ins have nowhere to go. */
export function handInStore(): HandInStore | null {
  return r2Store() ?? localStore()
}
