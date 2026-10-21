/**
 * Data access for the Model Lab: the six results pages at /labs (David,
 * 2026-10-21, option A, which replaced the four Model Arena labs).
 *
 * Every new AI model gets the same real UK work tasks in six superpowers.
 * Computer checks and AI judges mark the answers; the pages show the picks,
 * four blind answers to the main task and every set-up's marks.
 *
 * The JSON in `model-lab/` is GENERATED: model-bakeoff's
 * `lab/site/export_gwth.py` writes it from the lab's results, together with
 * every file the pages reference under `public/labs-files/`. Do not hand-edit
 * either; re-run the export. This module is the single seam the UI reads
 * through.
 *
 * `server-only` because the lab files carry every table row's markdown answer
 * (several hundred KB): only the fields a page needs may cross into a client
 * component, never the module itself.
 */
import "server-only"

import type {
  ModelLabData,
  ModelLabIndex,
  ModelLabRow,
  ModelLabSlug,
  ModelLabSummary,
} from "@/lib/types"
import { MODEL_LAB_PAGE_SLUGS } from "@/lib/labs-files"
import indexJson from "./model-lab/index.json"
import research from "./model-lab/research.json"
import content from "./model-lab/content.json"
import thinking from "./model-lab/thinking.json"
import building from "./model-lab/building.json"
import data from "./model-lab/data.json"
import automation from "./model-lab/automation.json"

/** The six lab slugs, in menu order (one list, shared with the proxy). */
export const MODEL_LAB_SLUGS: readonly ModelLabSlug[] = MODEL_LAB_PAGE_SLUGS

/**
 * The generated files, keyed by slug. The casts are safe because the exporter
 * writes exactly these shapes; `model-lab.test.ts` checks the files against
 * the fields the pages read, so a changed export fails a test rather than a
 * page.
 */
const LABS: Record<ModelLabSlug, ModelLabData> = {
  research: research as unknown as ModelLabData,
  content: content as unknown as ModelLabData,
  thinking: thinking as unknown as ModelLabData,
  building: building as unknown as ModelLabData,
  data: data as unknown as ModelLabData,
  automation: automation as unknown as ModelLabData,
}

const INDEX = indexJson as unknown as ModelLabIndex

/**
 * Whether a string is one of the six lab slugs.
 */
export function isModelLabSlug(slug: string): slug is ModelLabSlug {
  return (MODEL_LAB_SLUGS as readonly string[]).includes(slug)
}

/**
 * Returns the lab index: the six labs, the test dates and the model count.
 */
export function getModelLabIndex(): ModelLabIndex {
  return INDEX
}

/**
 * Returns the six labs' summaries, in menu order.
 */
export function getModelLabs(): ModelLabSummary[] {
  return INDEX.labs
}

/**
 * Returns one lab's full page data, or null for any other slug.
 */
export function getModelLab(slug: string): ModelLabData | null {
  return isModelLabSlug(slug) ? LABS[slug] : null
}

/**
 * Returns one table row's markdown answer files (name and text), or null when
 * the lab or the set-up is not on the page. Only rows that are in the table
 * can be asked for, so the caller cannot reach any other file.
 */
export function getRowAnswerMarkdown(
  slug: string,
  setup: string,
): { name: string; text: string }[] | null {
  const row = getModelLab(slug)?.table.find((r) => r.setup === setup)
  if (!row) return null
  return row.sig_files.flatMap((f) =>
    f.name.endsWith(".md") && typeof f.text === "string"
      ? [{ name: f.name, text: f.text }]
      : [],
  )
}

/**
 * A table row without its markdown text, for a client component's props: the
 * text is fetched only when a visitor opens the row.
 */
export function rowForClient(row: ModelLabRow): ModelLabRow {
  return {
    ...row,
    sig_files: row.sig_files.map(({ name, src }) => ({ name, src })),
  }
}
