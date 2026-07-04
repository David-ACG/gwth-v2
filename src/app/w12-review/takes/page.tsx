import { readdir, readFile } from "node:fs/promises"
import path from "node:path"
import styles from "../review.module.css"
import { TakesRater, type TakeForReview } from "./takes-rater"

/** Takes are staged here by the run supervisor as each one passes the gate. */
const TAKES_DIR = path.join(process.cwd(), "public", "explainer", "takes")

/** Reads fresh on every request so new takes appear without a rebuild. */
export const dynamic = "force-dynamic"

const VARIANT_LABELS: Record<string, string> = {
  fable100: "Claude Fable · 100s (your favourite)",
  gpt100: "Fable + ChatGPT 5.5 Extra High · 100s (second favourite)",
}

/** Shape of the pipeline sidecar fields this page reads. */
interface TakeMeta {
  wer?: number
  duration_seconds?: number
  variant_label?: string
  cfg_scale?: number
  speed?: number
  sentence_gap_ms?: number
  do_sample?: boolean
  temperature?: number
  selected_as_final?: boolean
  david_review?: TakeForReview["review"]
}

/** Formats the settings recipe line shown under each take heading. */
function settingsLine(meta: TakeMeta): string {
  if (meta.cfg_scale === undefined) return "settings unknown"
  const sampling = meta.do_sample
    ? `sampled t=${meta.temperature}`
    : "greedy"
  return (
    `cfg ${meta.cfg_scale} · ${meta.speed}x speed · ` +
    `${meta.sentence_gap_ms}ms gaps · ${sampling}`
  )
}

/** Lists staged takes with settings + any saved review; empty until staged. */
async function loadTakes(): Promise<TakeForReview[]> {
  let files: string[] = []
  try {
    files = await readdir(TAKES_DIR)
  } catch {
    return []
  }
  const takes: TakeForReview[] = []
  for (const file of files) {
    const match = /^vv7b_explainer_([a-z0-9]+)_perfect_(\d+)\.wav$/.exec(file)
    if (!match || !match[1] || !match[2]) continue
    let meta: TakeMeta = {}
    try {
      meta = JSON.parse(
        await readFile(path.join(TAKES_DIR, `${file}.meta.json`), "utf-8"),
      ) as TakeMeta
    } catch {
      // sidecar optional; the player and rater still work without it
    }
    takes.push({
      file,
      variant: match[1],
      take: Number(match[2]),
      variantLabel: meta.variant_label ?? "baseline (lesson recipe)",
      settings: settingsLine(meta),
      wer: meta.wer,
      duration: meta.duration_seconds,
      review: meta.david_review,
      selectedAsFinal: meta.selected_as_final === true,
    })
  }
  return takes.sort(
    (a, b) => a.variant.localeCompare(b.variant) || a.take - b.take,
  )
}

/**
 * VV7B takes for David's ear — now a rate-and-pick page mirroring the
 * lesson-intro-video review flow. Each take shows its settings recipe;
 * David scores pacing/lifelikeness/accuracy, comments, and picks the final.
 * Ratings persist into the takes' meta sidecars so the winning settings are
 * recorded for the runner-up script render and future videos.
 */
export default async function W12TakesPage() {
  const takes = await loadTakes()
  const variants = ["fable100", "gpt100"] as const

  return (
    <main className={styles.page}>
      <p className={styles.eyebrow}>Decision 2 · the voice take</p>
      <h1 className={styles.h1}>
        Rate the takes, <em>pick the final</em>.
      </h1>
      <p className={styles.lead}>
        Every take passed the lesson-grade quality gate (chunked VV7B in your
        voice, Whisper word-error checks, GWTH spoken as G, W, T, H). Each take
        uses a different pace and energy recipe — the settings are printed on
        the card. Score all three dimensions, note what you hear, and pick one
        as the final. Ratings save to the take&rsquo;s metadata so the winning
        settings drive the runner-up script and future videos.
      </p>

      {takes.length === 0 ? (
        <div className={styles.callout}>
          <p>
            <strong>Still rendering.</strong> The pipeline is generating and
            quality-checking takes now. Refresh this page; takes appear here as
            soon as they are staged.
          </p>
        </div>
      ) : (
        variants.map((variant) => {
          const group = takes.filter((t) => t.variant === variant)
          if (group.length === 0) return null
          return (
            <section key={variant} style={{ marginTop: "2.5rem" }}>
              <h2 className={styles.sectionTitle}>
                {VARIANT_LABELS[variant] ?? variant}
              </h2>
              <TakesRater takes={group} />
            </section>
          )
        })
      )}
    </main>
  )
}
