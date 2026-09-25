/**
 * Draft, not live (bead gwth-launch-8ksq, ship student-view-comments).
 *
 * The lesson pipeline (v3) writes a rewritten lesson next to the published one
 * as `content/lesson.candidate.md`. On the hlab preview, David reads that draft
 * in the REAL student viewer so he can comment on it and approve or send it
 * back. This module finds the draft on disk and hands the viewer its markdown.
 *
 * Only active when `LESSON_DRAFTS_DIR` is set (the preview box points it at
 * `~/gwth-dashboard/generated_lessons`). Production never sets it, so
 * `getLessonDraft` returns null there and the viewer shows the live lesson.
 *
 * Never throws: a missing folder, an unreadable file or anything else odd is
 * logged and reported as "no draft", so a pipeline hiccup can never break a
 * lesson page.
 */

import "server-only"
import { createHash } from "node:crypto"
import { readdir, readFile } from "node:fs/promises"
import path from "node:path"

/** Lesson ids the draft lookup accepts (m1_l01). Anything else is refused. */
export const LESSON_ID_PATTERN = /^m\d+_l\d{2}$/

/** Where the preview serves pipeline media when LESSON_DRAFT_MEDIA_BASE is unset. */
export const DEFAULT_DRAFT_MEDIA_BASE = "https://hlab.taila51191.ts.net:9490"

/** Result of {@link getLessonDraft}. */
export type LessonDraft =
  | { available: false }
  | { available: true; folder: string; learnContent: string }

/** The configured drafts root, or null when drafts are switched off. */
export function getLessonDraftsDir(): string | null {
  const dir = process.env.LESSON_DRAFTS_DIR?.trim()
  return dir ? dir : null
}

/**
 * The generated_lessons folder name for a lesson: the directory whose
 * basename starts with `${lessonId}_` (m1_l01 -> m1_l01_welcome_to_gwth_...).
 * Returns null when drafts are off, the id is malformed, or no folder matches.
 * When several match (should not happen), the alphabetically first wins so
 * the answer is stable.
 */
export async function resolveLessonFolder(
  lessonId: string
): Promise<string | null> {
  const root = getLessonDraftsDir()
  if (!root || !LESSON_ID_PATTERN.test(lessonId)) return null
  try {
    const entries = await readdir(root, { withFileTypes: true })
    const matches = entries
      .filter((e) => e.isDirectory() && e.name.startsWith(`${lessonId}_`))
      .map((e) => e.name)
      .sort()
    return matches[0] ?? null
  } catch (error) {
    console.error("[lesson-draft] cannot read LESSON_DRAFTS_DIR", error)
    return null
  }
}

/** Removes a leading YAML frontmatter block (--- ... ---) if present. */
export function stripFrontmatter(markdown: string): string {
  const match = markdown.match(/^﻿?---\r?\n[\s\S]*?\r?\n---[ \t]*(?:\r?\n|$)/)
  return match ? markdown.slice(match[0].length).replace(/^\s*\n/, "") : markdown
}

/**
 * Rewrites relative image references (`assets/...` and `./assets/...`) in
 * markdown image syntax and HTML src attributes to absolute URLs under the
 * preview media server, so the draft's pictures load in the viewer.
 */
export function rewriteDraftAssetUrls(
  markdown: string,
  folder: string,
  mediaBase: string
): string {
  const base = `${mediaBase.replace(/\/+$/, "")}/media/${folder}/content/assets/`
  return markdown
    .replace(/(\]\(\s*<?)(?:\.\/)?assets\//g, `$1${base}`)
    .replace(/(\bsrc=["'])(?:\.\/)?assets\//g, `$1${base}`)
}

function sha256(text: string): string {
  return createHash("sha256").update(text).digest("hex")
}

async function readOptional(file: string): Promise<string | null> {
  try {
    return await readFile(file, "utf8")
  } catch (error) {
    if ((error as NodeJS.ErrnoException)?.code === "ENOENT") return null
    throw error
  }
}

/**
 * The pipeline draft for a lesson, when one exists and differs from the
 * published text.
 *
 * - null: drafts are switched off (LESSON_DRAFTS_DIR unset).
 * - {available:false}: no folder, no candidate, candidate identical to the
 *   live lesson.md (sha256), or any error.
 * - {available:true, folder, learnContent}: the candidate markdown with its
 *   frontmatter stripped and image paths pointed at the preview media server.
 */
export async function getLessonDraft(
  lessonId: string
): Promise<LessonDraft | null> {
  const root = getLessonDraftsDir()
  if (!root) return null
  try {
    const folder = await resolveLessonFolder(lessonId)
    if (!folder) return { available: false }
    const contentDir = path.join(root, folder, "content")
    const [candidate, live] = await Promise.all([
      readOptional(path.join(contentDir, "lesson.candidate.md")),
      readOptional(path.join(contentDir, "lesson.md")),
    ])
    if (candidate === null || candidate.trim() === "") return { available: false }
    if (live !== null && sha256(candidate) === sha256(live)) {
      return { available: false }
    }
    const mediaBase =
      process.env.LESSON_DRAFT_MEDIA_BASE?.trim() || DEFAULT_DRAFT_MEDIA_BASE
    const learnContent = rewriteDraftAssetUrls(
      stripFrontmatter(candidate),
      folder,
      mediaBase
    )
    return { available: true, folder, learnContent }
  } catch (error) {
    console.error(`[lesson-draft] cannot load draft for ${lessonId}`, error)
    return { available: false }
  }
}
