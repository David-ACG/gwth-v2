/**
 * The seam where bead 9289.1's `marking_guide.json` replaces the built-in
 * expected-files list (bead gwth-launch-9289.2).
 *
 * A published guide is looked for in `<MARKING_GUIDES_DIR or LESSON_DRAFTS_DIR>/
 * <lesson dir>/content/marking_guide.json` with a top-level `"capstone"` equal
 * to the capstone id, and read through its `hand_in.files` list:
 *
 *   { "capstone": "familybot",
 *     "hand_in": { "files": [ { "id": "blueprint", "label": "Your FamilyBot Blueprint",
 *                               "name_hints": ["blueprint"], "extensions": ["md", "pdf"],
 *                               "required": true } ] } }
 *
 * Anything missing or malformed falls back to {@link builtInGuide}, so a bad
 * file can never close the hand-in page. When guides are published to the
 * database (as qna.json is), add that read here; callers do not change.
 */
import "server-only"

import { readFile, readdir } from "node:fs/promises"
import { join } from "node:path"
import { builtInGuide, type CapstoneGuide, type CapstoneId, type ExpectedFile } from "./guides"

const CACHE_MS = 60_000
let cache: { at: number; byCapstone: Map<string, ExpectedFile[]> } | null = null

/** Reads `hand_in.files` from a parsed guide, or null when it is not usable. */
export function expectedFilesFromGuide(json: unknown): ExpectedFile[] | null {
  const files = (json as { hand_in?: { files?: unknown } })?.hand_in?.files
  if (!Array.isArray(files) || files.length === 0) return null
  const out: ExpectedFile[] = []
  for (const raw of files) {
    const f = raw as Record<string, unknown>
    const hints = f.name_hints ?? f.nameHints
    if (typeof f.id !== "string" || typeof f.label !== "string" || !Array.isArray(hints)) return null
    const extensions = Array.isArray(f.extensions) ? f.extensions : []
    out.push({
      id: f.id,
      label: f.label,
      nameHints: hints.filter((h): h is string => typeof h === "string").map((h) => h.toLowerCase()),
      extensions: extensions.filter((e): e is string => typeof e === "string").map((e) => e.toLowerCase().replace(/^\./, "")),
      required: f.required !== false,
    })
  }
  return out
}

async function scan(): Promise<Map<string, ExpectedFile[]>> {
  const byCapstone = new Map<string, ExpectedFile[]>()
  const root = process.env.MARKING_GUIDES_DIR ?? process.env.LESSON_DRAFTS_DIR
  if (!root) return byCapstone
  let dirs: string[] = []
  try {
    dirs = await readdir(root)
  } catch {
    return byCapstone
  }
  for (const dir of dirs) {
    try {
      const json = JSON.parse(await readFile(join(root, dir, "content", "marking_guide.json"), "utf8"))
      const files = expectedFilesFromGuide(json)
      if (typeof json?.capstone === "string" && files) byCapstone.set(json.capstone, files)
    } catch {
      // No guide in this lesson, or not valid JSON: the built-in list stands.
    }
  }
  return byCapstone
}

/** The guide for one capstone: the published file when there is one, else the built-in list. */
export async function loadMarkingGuide(id: CapstoneId): Promise<CapstoneGuide> {
  if (!cache || Date.now() - cache.at > CACHE_MS) cache = { at: Date.now(), byCapstone: await scan() }
  const guide = builtInGuide(id)
  const published = cache.byCapstone.get(id)
  return published ? { ...guide, expectedFiles: published, source: "marking_guide.json" } : guide
}
