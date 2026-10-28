/**
 * Prepares a hand-in for the learner's preview (bead gwth-launch-9289.3):
 * hides private details in every text file and in the four answers with one
 * shared {@link Redactor}, and fingerprints the result.
 *
 * What the preview shows IS what is stored and what a marker is later sent:
 * the stored files are these redacted bytes, and {@link manifestHash} covers
 * every file's sha256 plus the redacted answers. The confirm step refuses
 * unless the learner ticks AND the hash they previewed equals the stored one.
 *
 * Files we cannot read as text (images, PDFs, slides) cannot be redacted; they
 * are kept as they are and flagged so the learner checks them before ticking.
 */
import "server-only"

import { createHash } from "node:crypto"
import type { AnswerId } from "./guides"
import { Redactor, type LabelUse, type NameEntry } from "./redact"
import type { BundleFile } from "./bundle"

/** Documents that are never read as text, even when they decode cleanly. */
const BINARY_EXTENSIONS = new Set([
  "pdf", "docx", "doc", "pptx", "ppt", "xlsx", "xls", "odt", "odp", "ods", "key", "pages", "numbers",
  "zip", "gz", "tar", "mp3", "mp4", "m4a", "mov", "webm", "wav", "heic", "ico", "woff", "woff2", "ttf",
])

/** Image extensions the preview can show. */
const IMAGE_EXTENSIONS = new Set(["png", "jpg", "jpeg", "webp", "gif"])

/** One file as it will be stored and sent. */
export interface PreparedFile {
  path: string
  /** "text" was read and redacted; "image" and "other" are kept as they are. */
  kind: "text" | "image" | "other"
  bytes: Uint8Array
  size: number
  sha256: string
  /** Replacements made in this file (always 0 for image and other). */
  replaced: number
}

/** The stored description of one file (no contents). */
export interface ManifestEntry {
  path: string
  kind: PreparedFile["kind"]
  size: number
  sha256: string
  replaced: number
}

/** A whole prepared hand-in. */
export interface PreparedHandIn {
  files: PreparedFile[]
  answers: Record<AnswerId, string>
  labels: LabelUse[]
  unusedNameLabels: string[]
  hash: string
}

function extensionOf(path: string): string {
  const name = path.split("/").pop() ?? ""
  const dot = name.lastIndexOf(".")
  return dot > 0 ? name.slice(dot + 1).toLowerCase() : name.toLowerCase()
}

/** Reads bytes as UTF-8 text, or null for anything that is not text. */
export function asText(path: string, bytes: Uint8Array): string | null {
  const ext = extensionOf(path)
  if (IMAGE_EXTENSIONS.has(ext) || BINARY_EXTENSIONS.has(ext)) return null
  if (bytes.subarray(0, 8192).includes(0)) return null
  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(bytes)
  } catch {
    return null
  }
}

function sha256(data: Uint8Array | string): string {
  return createHash("sha256").update(data).digest("hex")
}

/** The stored description of the prepared files. */
export function toManifest(files: PreparedFile[]): ManifestEntry[] {
  return files.map(({ path, kind, size, sha256, replaced }) => ({ path, kind, size, sha256, replaced }))
}

/**
 * One fingerprint for exactly what will be sent: every file's path and hash,
 * in path order, and the redacted answers.
 */
export function manifestHash(manifest: ManifestEntry[], answers: Record<string, string>): string {
  const canonical = JSON.stringify({
    files: [...manifest].sort((a, b) => a.path.localeCompare(b.path, "en")).map((f) => [f.path, f.sha256]),
    answers: Object.keys(answers)
      .sort()
      .map((k) => [k, answers[k]]),
  })
  return sha256(canonical)
}

/**
 * Redacts a bundle and the answers. Names are hidden only for the learner's
 * own details; the pattern step (emails, phones, postcodes, NHS, bank and
 * account numbers, keys) runs on every hand-in in case a real one is left in
 * the example.
 */
export function prepareHandIn(
  bundle: BundleFile[],
  answers: Record<AnswerId, string>,
  names: NameEntry[],
): PreparedHandIn {
  const redactor = new Redactor(names)
  const ordered = [...bundle].sort((a, b) => a.path.localeCompare(b.path, "en"))
  const encoder = new TextEncoder()
  const files: PreparedFile[] = ordered.map(({ path, bytes }) => {
    const text = asText(path, bytes)
    if (text === null) {
      const kind = IMAGE_EXTENSIONS.has(extensionOf(path)) ? "image" : "other"
      return { path, kind, bytes, size: bytes.length, sha256: sha256(bytes), replaced: 0 }
    }
    const redacted = redactor.redact(text)
    const out = redacted.replaced > 0 ? encoder.encode(redacted.text) : bytes
    return { path, kind: "text", bytes: out, size: out.length, sha256: sha256(out), replaced: redacted.replaced }
  })
  const redactedAnswers = Object.fromEntries(
    Object.entries(answers).map(([id, value]) => [id, redactor.redact(value).text]),
  ) as Record<AnswerId, string>
  return {
    files,
    answers: redactedAnswers,
    labels: redactor.summary(),
    unusedNameLabels: redactor.unusedNameLabels(),
    hash: manifestHash(toManifest(files), redactedAnswers),
  }
}
