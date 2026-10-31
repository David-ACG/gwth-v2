/**
 * Test hand-ins with KNOWN intended bands, for the two-judge runner
 * (bead gwth-launch-9289.5) and the agreement test (bead gwth-launch-9289.8).
 * The cases themselves are data under ./handins/<capstone>/<case-id>/; see
 * ./README.md for what each one is for (bead gwth-launch-9289.9).
 *
 * Server and test use only: it reads the files from disk. Everything in the
 * fixtures is made up (the lessons' example household and companies, the
 * fictional Southbridge Community Trust); no real person's data.
 *
 * Two file-name conventions, so a fixture looks like the stored hand-in:
 *   - `name.ts.fixture` is the learner's `name.ts`. Code files carry the
 *     suffix only so the site's own type check and lint leave them alone;
 *     `path` and `originalPath` both drop it.
 *   - `report.pdf.txt` is the text pulled out of the learner's `report.pdf`,
 *     exactly as the hand-in stores a PDF or Word file (pages split by a form
 *     feed). `path` keeps the stored name; `originalPath` is the learner's.
 */
import "server-only"

import { readFile, readdir } from "node:fs/promises"
import { join, relative, sep } from "node:path"
import type { CapstoneId } from "../guides"

/** The marking guide's criterion levels and overall bands share these ids. */
export type Level = "not_yet" | "pass" | "good" | "excellent"

/** One handed-in file, as the store would hold it. */
export interface FixtureFile {
  /** Stored path inside the hand-in ("southbridge_report.pdf.txt"). */
  path: string
  /** The learner's own file name ("southbridge_report.pdf"). */
  originalPath: string
  bytes: Uint8Array
}

/** The four written answers (HAND_IN_QUESTIONS). */
export interface FixtureAnswers {
  built: string
  checked: string
  fixed: string
  next: string
}

/** What the case was written to test: the mark a careful marker should give. */
export interface FixtureMeta {
  capstone: CapstoneId
  /** "planted": a deliberate problem or a borderline total; "made-up": an ordinary piece. */
  kind: "planted" | "made-up"
  intended_band: Level
  intended_total: number
  criteria: { id: string; level: Level }[]
  basics: { id: string; met: boolean }[]
  planted_problem: string | null
  why: string
}

export interface FixtureCase {
  capstone: CapstoneId
  caseId: string
  files: FixtureFile[]
  answers: FixtureAnswers
  meta: FixtureMeta
}

export const CAPSTONES: CapstoneId[] = ["familybot", "askmyco", "askeveryone"]
const LEVELS: Level[] = ["not_yet", "pass", "good", "excellent"]

/** Level to fraction of a criterion's points (the guides' shared scale). */
export const LEVEL_FRACTION: Record<Level, number> = { not_yet: 0, pass: 0.5, good: 0.75, excellent: 1 }

/** Where the cases live (CAPSTONE_FIXTURES_DIR overrides; the default assumes the repo root is the working directory). */
export const FIXTURES_DIR = process.env.CAPSTONE_FIXTURES_DIR ?? join(process.cwd(), "src", "lib", "capstones", "fixtures", "handins")

/** The guide's bands: under 40 Not yet, 40 Pass, 60 Good, 80 Excellent; any unmet basic is Not yet. */
export function bandFor(total: number, basicsMet: boolean): Level {
  if (!basicsMet) return "not_yet"
  if (total >= 80) return "excellent"
  if (total >= 60) return "good"
  if (total >= 40) return "pass"
  return "not_yet"
}

/** A total from criterion levels and each criterion's points. */
export function totalFor(levels: { id: string; level: Level }[], points: Record<string, number>): number {
  return Math.round(levels.reduce((sum, c) => sum + (points[c.id] ?? Number.NaN) * LEVEL_FRACTION[c.level], 0) * 100) / 100
}

function fail(where: string, message: string): never {
  throw new Error(`fixture ${where}: ${message}`)
}

function isLevel(v: unknown): v is Level {
  return typeof v === "string" && (LEVELS as string[]).includes(v)
}

/** Checks a parsed case.json; throws with the case and the field when it is wrong. */
export function parseMeta(json: unknown, where: string): FixtureMeta {
  const m = json as Record<string, unknown>
  if (!m || typeof m !== "object") fail(where, "case.json is not an object")
  if (!CAPSTONES.includes(m.capstone as CapstoneId)) fail(where, `unknown capstone ${String(m.capstone)}`)
  if (m.kind !== "planted" && m.kind !== "made-up") fail(where, `kind must be planted or made-up`)
  if (!isLevel(m.intended_band)) fail(where, `intended_band ${String(m.intended_band)} is not a level`)
  if (typeof m.intended_total !== "number" || m.intended_total < 0 || m.intended_total > 100) fail(where, "intended_total must be 0 to 100")
  if (!Array.isArray(m.criteria) || m.criteria.length === 0) fail(where, "criteria must be a non-empty list")
  for (const c of m.criteria as Record<string, unknown>[]) {
    if (typeof c?.id !== "string" || !isLevel(c.level)) fail(where, `bad criterion ${JSON.stringify(c)}`)
  }
  if (!Array.isArray(m.basics) || m.basics.length === 0) fail(where, "basics must be a non-empty list")
  for (const b of m.basics as Record<string, unknown>[]) {
    if (typeof b?.id !== "string" || typeof b.met !== "boolean") fail(where, `bad basic ${JSON.stringify(b)}`)
  }
  if (m.planted_problem !== null && typeof m.planted_problem !== "string") fail(where, "planted_problem must be text or null")
  if (m.kind === "planted" && !m.planted_problem) fail(where, "a planted case must say what was planted")
  if (typeof m.why !== "string" || !m.why) fail(where, "why must be text")
  return m as unknown as FixtureMeta
}

/** Checks a parsed answers.json against the hand-in form's length rules. */
export function parseAnswers(json: unknown, where: string): FixtureAnswers {
  const a = json as Record<string, unknown>
  for (const key of ["built", "checked", "fixed", "next"] as const) {
    const v = a?.[key]
    if (typeof v !== "string" || v.length < 20 || v.length > 2000) fail(where, `answer "${key}" must be 20 to 2000 characters`)
  }
  return a as unknown as FixtureAnswers
}

function storedName(rel: string): { path: string; originalPath: string } {
  const path = rel.replace(/\.fixture$/, "")
  const originalPath = path.replace(/\.(pdf|docx)\.txt$/i, ".$1")
  return { path, originalPath }
}

async function walk(dir: string): Promise<string[]> {
  const out: string[] = []
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) out.push(...(await walk(full)))
    else out.push(full)
  }
  return out
}

/** One case by capstone and id. */
export async function loadFixture(capstone: CapstoneId, caseId: string, root = FIXTURES_DIR): Promise<FixtureCase> {
  const dir = join(root, capstone, caseId)
  const where = `${capstone}/${caseId}`
  const meta = parseMeta(JSON.parse(await readFile(join(dir, "case.json"), "utf8")), where)
  if (meta.capstone !== capstone) fail(where, `case.json says capstone ${meta.capstone}`)
  const answers = parseAnswers(JSON.parse(await readFile(join(dir, "answers.json"), "utf8")), where)
  const filesDir = join(dir, "files")
  const paths = (await walk(filesDir)).sort()
  if (paths.length === 0) fail(where, "no files")
  const files: FixtureFile[] = []
  for (const full of paths) {
    const rel = relative(filesDir, full).split(sep).join("/")
    files.push({ ...storedName(rel), bytes: new Uint8Array(await readFile(full)) })
  }
  return { capstone, caseId, files, answers, meta }
}

/** Every case, or one capstone's, sorted by capstone then case id. */
export async function loadFixtures(filter: { capstone?: CapstoneId; kind?: FixtureMeta["kind"] } = {}, root = FIXTURES_DIR): Promise<FixtureCase[]> {
  const out: FixtureCase[] = []
  for (const capstone of CAPSTONES) {
    if (filter.capstone && filter.capstone !== capstone) continue
    let ids: string[] = []
    try {
      ids = (await readdir(join(root, capstone), { withFileTypes: true })).filter((d) => d.isDirectory()).map((d) => d.name)
    } catch {
      continue
    }
    for (const id of ids.sort()) {
      const c = await loadFixture(capstone, id, root)
      if (!filter.kind || c.meta.kind === filter.kind) out.push(c)
    }
  }
  return out
}
