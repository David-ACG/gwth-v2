/**
 * Data access for Model Arena labs (the current lab format, David 2026-07-22).
 *
 * A lab is a head-to-head test: two AI tools, one realistic task, the same
 * prompt, outputs shown verbatim side by side, a beginner rubric, and a dated
 * verdict. Only ~6 labs are LIVE at any time; they are deliberately perishable,
 * because models keep changing. Superseded labs are never deleted, they become
 * the ARCHIVE, which gains value as you compare model generations over time.
 *
 * Content is authored by launch task L23 and lives as JSON alongside its schema
 * in `model-arena/`. This module is the single seam the UI reads through, so
 * wiring a DB-backed source later is a swap here, not in the pages. It sits
 * beside `labs.ts` (the retired tiered labs, kept only to render the archive).
 */

import type { ModelArenaLab } from "@/lib/types"
import pilotJobAdvert from "./model-arena/lab-01-job-advert-claude-vs-chatgpt.json"
import messySpreadsheet from "./model-arena/lab-02-messy-spreadsheet-claude-vs-chatgpt.json"
import citeYourSources from "./model-arena/lab-03-cite-your-sources-claude-vs-chatgpt.json"
import weeklyChore from "./model-arena/lab-04-automate-a-weekly-chore-claude-vs-chatgpt.json"

/**
 * The authored Model Arena labs, newest test first. Sourced from the staged
 * JSON fixtures: the job-advert pilot (L23) plus the data, research and
 * automation matchups added by L26 to bring the live rotation to four. The cast
 * is safe because the JSON is authored to `model-arena.schema.json` (validated
 * by the authoring tone/schema gate); the `format` discriminant is
 * `"model-arena"` for every entry.
 *
 * Labs of the same test date keep this order, because `byNewest` compares only
 * the date and Array.prototype.sort is stable.
 */
const ARENA_LABS: ModelArenaLab[] = [
  messySpreadsheet as unknown as ModelArenaLab,
  citeYourSources as unknown as ModelArenaLab,
  weeklyChore as unknown as ModelArenaLab,
  pilotJobAdvert as unknown as ModelArenaLab,
]

/**
 * Sorts labs by test date, newest first (ISO date strings sort lexically).
 */
function byNewest(a: ModelArenaLab, b: ModelArenaLab): number {
  return b.testedOn.localeCompare(a.testedOn)
}

/**
 * Returns every Model Arena lab, live and archived, newest test first.
 */
export function getArenaLabs(): ModelArenaLab[] {
  return [...ARENA_LABS].sort(byNewest)
}

/**
 * Returns the currently LIVE arena labs (the ~6 in rotation), newest first.
 */
export function getLiveArenaLabs(): ModelArenaLab[] {
  return getArenaLabs().filter((lab) => lab.status === "live")
}

/**
 * Returns the ARCHIVED arena labs (superseded but kept), newest first.
 * Legacy tiered labs are archived separately via `getArchiveLabs()` in labs.ts.
 */
export function getArchivedArenaLabs(): ModelArenaLab[] {
  return getArenaLabs().filter((lab) => lab.status === "archived")
}

/**
 * Returns a single Model Arena lab by slug, or null if none matches.
 */
export function getArenaLab(slug: string): ModelArenaLab | null {
  return ARENA_LABS.find((lab) => lab.slug === slug) ?? null
}

/**
 * Formats an arena ISO test date as a British long date, e.g. "23 July 2026".
 * Used for the "Tested on" line and archive dates. Kept here so every arena
 * surface stamps the date identically.
 */
export function formatTestedOn(iso: string): string {
  const date = new Date(`${iso}T00:00:00Z`)
  if (Number.isNaN(date.getTime())) return iso
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date)
}
