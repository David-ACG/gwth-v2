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

/** One marking criterion, as the judges read it. */
export interface GuideCriterion {
  id: string
  name: string
  points: number
  descriptors: { pass: string; good: string; excellent: string }
  /** The same descriptors written to the learner. */
  student?: { pass: string; good: string; excellent: string }
}

/** One basics line: miss it and the band is Not yet whatever the points. */
export interface GuideBasic {
  id: string
  name: string
  text: string
  student?: string
}

/** The parts of a published `marking_guide.json` the marker uses. */
export interface MarkingGuide {
  capstone: CapstoneId
  title: string
  studentTitle: string
  handInText: string
  criteria: GuideCriterion[]
  basics: GuideBasic[]
  answersNote: string
  expectedFiles: ExpectedFile[]
}

const CACHE_MS = 60_000
let cache: { at: number; byCapstone: Map<string, unknown> } | null = null

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

/** Reads the marker's view of a parsed guide, or null when it is not usable. */
export function markingGuideFromJson(json: unknown): MarkingGuide | null {
  const g = json as Record<string, unknown>
  const expectedFiles = expectedFilesFromGuide(json)
  if (!g || typeof g.capstone !== "string" || !Array.isArray(g.criteria) || !Array.isArray(g.basics) || !expectedFiles) return null
  const criteria = (g.criteria as Record<string, unknown>[]).map((c) => c as unknown as GuideCriterion)
  if (criteria.some((c) => typeof c.id !== "string" || typeof c.points !== "number" || !c.descriptors?.pass)) return null
  if (criteria.reduce((n, c) => n + c.points, 0) !== 100) return null
  const handIn = g.hand_in as { text?: string } | undefined
  return {
    capstone: g.capstone as CapstoneId,
    title: String(g.title ?? g.capstone),
    studentTitle: String(g.student_title ?? g.title ?? g.capstone),
    handInText: String(handIn?.text ?? ""),
    criteria,
    basics: (g.basics as GuideBasic[]).filter((b) => typeof b.id === "string" && typeof b.text === "string"),
    answersNote: String(g.answers_note ?? ""),
    expectedFiles,
  }
}

async function scan(): Promise<Map<string, unknown>> {
  const byCapstone = new Map<string, unknown>()
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
      if (typeof json?.capstone === "string" && expectedFilesFromGuide(json)) byCapstone.set(json.capstone, json)
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
  const published = expectedFilesFromGuide(cache.byCapstone.get(id))
  return published ? { ...guide, expectedFiles: published, source: "marking_guide.json" } : guide
}

/**
 * The full published guide the judges mark against, or null when none is
 * published. There is no built-in fall-back: marking without the approved
 * criteria would be marking against nothing.
 */
export async function loadPublishedGuide(id: CapstoneId): Promise<MarkingGuide | null> {
  if (!cache || Date.now() - cache.at > CACHE_MS) cache = { at: Date.now(), byCapstone: await scan() }
  return markingGuideFromJson(cache.byCapstone.get(id))
}
