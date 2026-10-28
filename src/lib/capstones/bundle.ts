/**
 * Turns what a learner hands in (files, a zip, or a GitHub repo link) into one
 * flat list of files (bead gwth-launch-9289.2).
 *
 * Limits keep one hand-in to a size a marker can read and a server can hold:
 * build output, dependencies and system clutter are dropped, and a zip is
 * refused if it would unpack beyond {@link LIMITS}. A repo link must be a
 * public GitHub repository; a private one has to be handed in as a zip.
 */
import "server-only"

import { unzipSync } from "fflate"

/** One handed-in file, by its path inside the project folder. */
export interface BundleFile {
  path: string
  bytes: Uint8Array
}

/** Thrown with a message the learner can act on. */
export class HandInInputError extends Error {}

/** Size limits for one hand-in. */
export const LIMITS = {
  maxFiles: 300,
  maxFileBytes: 10 * 1024 * 1024,
  maxTotalBytes: 25 * 1024 * 1024,
  maxZipBytes: 25 * 1024 * 1024,
  maxRecordingBytes: 40 * 1024 * 1024,
} as const

/** Folders and files that are never part of the work. */
const JUNK = [
  /(^|\/)node_modules\//,
  /(^|\/)\.git\//,
  /(^|\/)__MACOSX\//,
  /(^|\/)\.next\//,
  /(^|\/)(dist|build|out|coverage)\//,
  /(^|\/)(\.venv|venv|__pycache__|\.pytest_cache)\//,
  /(^|\/)\.DS_Store$/,
  /(^|\/)Thumbs\.db$/,
  /(^|\/)desktop\.ini$/i,
]

/** Cleans a path from a browser or a zip: forward slashes, no "..", no leading "/". */
export function cleanPath(raw: string): string | null {
  const parts = raw
    .replace(/\\/g, "/")
    .split("/")
    .map((p) => p.trim())
    .filter((p) => p && p !== ".")
  if (parts.some((p) => p === "..")) return null
  const path = parts.join("/")
  return path && path.length <= 300 ? path : null
}

function isJunk(path: string): boolean {
  return JUNK.some((re) => re.test(path))
}

/**
 * Drops clutter, removes one folder wrapped around everything (a GitHub zip
 * is "repo-main/..."), checks the limits and sorts by path.
 */
export function finishBundle(files: BundleFile[]): BundleFile[] {
  let kept = files.filter((f) => !isJunk(f.path) && f.bytes.length > 0)
  const tops = new Set(kept.map((f) => f.path.split("/")[0]))
  if (tops.size === 1 && kept.every((f) => f.path.includes("/"))) {
    kept = kept.map((f) => ({ ...f, path: f.path.slice(f.path.indexOf("/") + 1) }))
  }
  const seen = new Set<string>()
  kept = kept.filter((f) => (seen.has(f.path) ? false : (seen.add(f.path), true)))
  if (kept.length === 0) throw new HandInInputError("We could not find any files in what you handed in.")
  if (kept.length > LIMITS.maxFiles) {
    throw new HandInInputError(`That is ${kept.length} files. Please hand in ${LIMITS.maxFiles} or fewer: leave out anything the marking guide does not ask for.`)
  }
  const big = kept.find((f) => f.bytes.length > LIMITS.maxFileBytes)
  if (big) throw new HandInInputError(`${big.path} is over 10 MB. Please make it smaller or leave it out.`)
  const total = kept.reduce((n, f) => n + f.bytes.length, 0)
  if (total > LIMITS.maxTotalBytes) throw new HandInInputError("Your files add up to more than 25 MB. Please leave out large files the marking guide does not ask for.")
  return kept.sort((a, b) => a.path.localeCompare(b.path, "en"))
}

/** Files uploaded from the page (one by one, or a whole folder). */
export async function fromUploads(files: File[]): Promise<BundleFile[]> {
  const out: BundleFile[] = []
  for (const file of files) {
    // A folder upload sends the folder path as the file name.
    const path = cleanPath(file.name)
    if (!path) continue
    if (file.size > LIMITS.maxFileBytes) throw new HandInInputError(`${path} is over 10 MB. Please make it smaller or leave it out.`)
    out.push({ path, bytes: new Uint8Array(await file.arrayBuffer()) })
  }
  return finishBundle(out)
}

/** The files inside a zip, refusing one that would unpack too large. */
export function fromZip(zip: Uint8Array): BundleFile[] {
  if (zip.length > LIMITS.maxZipBytes) throw new HandInInputError("Your zip is over 25 MB. Please leave out large files the marking guide does not ask for.")
  let declared = 0
  let unpacked: Record<string, Uint8Array>
  try {
    unpacked = unzipSync(zip, {
      filter: (entry) => {
        const path = cleanPath(entry.name)
        if (!path || entry.name.endsWith("/") || isJunk(path)) return false
        declared += entry.originalSize
        if (entry.originalSize > LIMITS.maxFileBytes || declared > LIMITS.maxTotalBytes * 2) {
          throw new HandInInputError("Keep each file in your zip to 10 MB or less, and all files to 25 MB in total after unzipping.")
        }
        return true
      },
    })
  } catch (error) {
    if (error instanceof HandInInputError) throw error
    throw new HandInInputError("We could not open that zip. Please make a new one and try again.")
  }
  return finishBundle(
    Object.entries(unpacked).flatMap(([name, bytes]) => {
      const path = cleanPath(name)
      return path ? [{ path, bytes }] : []
    }),
  )
}

/** Owner and repo from a GitHub link, or null when it is not one. */
export function parseGitHubUrl(raw: string): { owner: string; repo: string } | null {
  let url: URL
  try {
    url = new URL(raw.trim())
  } catch {
    return null
  }
  if (url.protocol !== "https:" || !/^(www\.)?github\.com$/i.test(url.hostname)) return null
  const [owner, repo] = url.pathname.split("/").filter(Boolean)
  const name = repo?.replace(/\.git$/i, "")
  if (!owner || !name || !/^[A-Za-z0-9-]{1,39}$/.test(owner) || !/^[A-Za-z0-9._-]{1,100}$/.test(name)) return null
  return { owner, repo: name }
}

/**
 * Downloads a public GitHub repository as a zip and unpacks it. Only
 * github.com is fetched, so a link cannot point the server anywhere else.
 */
export async function fromGitHub(raw: string, fetchImpl: typeof fetch = fetch): Promise<BundleFile[]> {
  const repo = parseGitHubUrl(raw)
  if (!repo) throw new HandInInputError("That does not look like a GitHub project link. Use a link like https://github.com/your-name/your-project.")
  const response = await fetchImpl(`https://codeload.github.com/${repo.owner}/${repo.repo}/zip/HEAD`, {
    signal: AbortSignal.timeout(30_000),
    redirect: "follow",
  }).catch(() => null)
  if (!response || !response.ok || !response.body) {
    throw new HandInInputError("We could not download that GitHub project. Check the link and make sure the project is public, or hand in a zip file instead.")
  }
  const reader = response.body.getReader()
  const chunks: Uint8Array[] = []
  let size = 0
  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    size += value.length
    if (size > LIMITS.maxZipBytes) {
      await reader.cancel()
      throw new HandInInputError("The download from GitHub is over 25 MB. Please hand in a zip file with only the files the marking guide asks for.")
    }
    chunks.push(value)
  }
  const zip = new Uint8Array(size)
  let offset = 0
  for (const chunk of chunks) {
    zip.set(chunk, offset)
    offset += chunk.length
  }
  return fromZip(zip)
}
