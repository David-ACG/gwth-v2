import { readFile, readdir, writeFile } from "node:fs/promises"
import path from "node:path"
import { NextResponse } from "next/server"

/** Staged takes + sidecars live here (review scaffolding, not production). */
const TAKES_DIR = path.join(process.cwd(), "public", "explainer", "takes")

/** Only pipeline-named take files are addressable — no path traversal. */
const TAKE_NAME = /^vv7b_explainer_[a-z0-9]+_perfect_\d+\.wav$/

/** Clamp a submitted score to the lesson-intro 1-5 scale (or null). */
function score(value: unknown): number | null {
  const n = Number(value)
  return Number.isInteger(n) && n >= 1 && n <= 5 ? n : null
}

/**
 * Persists David's rating for one W12 voiceover take into its staged
 * `.meta.json` sidecar, mirroring the lesson-intro-video review fields
 * (score_pacing / score_lifelikeness / score_accuracy / notes /
 * selected_as_final) so the winning settings are machine-readable later.
 * Review scaffolding only — deleted with the rest of w12-review at
 * finalisation.
 */
export async function POST(request: Request) {
  let body: {
    file?: string
    score_pacing?: unknown
    score_lifelikeness?: unknown
    score_accuracy?: unknown
    notes?: unknown
    selected_as_final?: unknown
  }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "invalid JSON" }, { status: 400 })
  }

  const file = body.file ?? ""
  if (!TAKE_NAME.test(file)) {
    return NextResponse.json({ error: "unknown take" }, { status: 400 })
  }
  const metaPath = path.join(TAKES_DIR, `${file}.meta.json`)

  let meta: Record<string, unknown>
  try {
    meta = JSON.parse(await readFile(metaPath, "utf-8"))
  } catch {
    return NextResponse.json({ error: "take not staged" }, { status: 404 })
  }

  meta.david_review = {
    score_pacing: score(body.score_pacing),
    score_lifelikeness: score(body.score_lifelikeness),
    score_accuracy: score(body.score_accuracy),
    notes: typeof body.notes === "string" ? body.notes.slice(0, 2000) : "",
    reviewed_at: new Date().toISOString(),
  }

  // "Pick as final" is exclusive: selecting one take clears the others.
  if (body.selected_as_final === true) {
    const files = await readdir(TAKES_DIR)
    for (const other of files) {
      if (!other.endsWith(".meta.json") || other === `${file}.meta.json`) continue
      try {
        const otherPath = path.join(TAKES_DIR, other)
        const otherMeta = JSON.parse(await readFile(otherPath, "utf-8"))
        if (otherMeta.selected_as_final) {
          otherMeta.selected_as_final = false
          await writeFile(otherPath, JSON.stringify(otherMeta, null, 2))
        }
      } catch {
        // unreadable sidecar: skip rather than fail the whole save
      }
    }
    meta.selected_as_final = true
  } else if (body.selected_as_final === false) {
    meta.selected_as_final = false
  }

  await writeFile(metaPath, JSON.stringify(meta, null, 2))
  return NextResponse.json({
    ok: true,
    file,
    review: meta.david_review,
    selected_as_final: meta.selected_as_final ?? false,
  })
}
