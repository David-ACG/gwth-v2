import { readdir, readFile } from "node:fs/promises"
import path from "node:path"
import styles from "../review.module.css"

/** Takes are staged here (copied from the TTS pipeline output when ready). */
const TAKES_DIR = path.join(process.cwd(), "public", "explainer", "takes")

/** Reads fresh on every request so new takes appear without a rebuild. */
export const dynamic = "force-dynamic"

interface Take {
  /** File name under /explainer/takes/. */
  file: string
  /** Script variant key parsed from the file name. */
  variant: "fable100" | "gpt100"
  /** Take number parsed from the file name. */
  take: number
  /** Whisper WER from the sidecar meta, if present. */
  wer?: number
  /** Duration in seconds from the sidecar meta, if present. */
  duration?: number
}

const VARIANT_LABELS: Record<Take["variant"], string> = {
  fable100: "Claude Fable · 100s (your favourite)",
  gpt100: "Fable + ChatGPT 5.5 Extra High · 100s (second favourite)",
}

/** Lists staged takes with their sidecar metadata; empty until staged. */
async function loadTakes(): Promise<Take[]> {
  let files: string[] = []
  try {
    files = await readdir(TAKES_DIR)
  } catch {
    return []
  }
  const takes: Take[] = []
  for (const file of files) {
    const match = /^vv7b_explainer_(fable100|gpt100)_perfect_(\d+)\.wav$/.exec(
      file,
    )
    if (!match) continue
    const take: Take = {
      file,
      variant: match[1] as Take["variant"],
      take: Number(match[2]),
    }
    try {
      const meta = JSON.parse(
        await readFile(path.join(TAKES_DIR, `${file}.meta.json`), "utf-8"),
      ) as { wer?: number; duration_seconds?: number }
      take.wer = meta.wer
      take.duration = meta.duration_seconds
    } catch {
      // sidecar optional; the player still works without it
    }
    takes.push(take)
  }
  return takes.sort(
    (a, b) => a.variant.localeCompare(b.variant) || a.take - b.take,
  )
}

/**
 * VV7B takes for David's ear (decision: which take becomes the explainer VO).
 * Ten quality-gated takes, five per script variant, in David's cloned VV7B
 * voice with G-W-T-H spelled out. Review-only; deleted at finalisation.
 */
export default async function W12TakesPage() {
  const takes = await loadTakes()
  const variants = ["fable100", "gpt100"] as const

  return (
    <main className={styles.page}>
      <p className={styles.eyebrow}>Decision 2 · the voice take</p>
      <h1 className={styles.h1}>
        Ten takes, <em>your ear decides</em>.
      </h1>
      <p className={styles.lead}>
        Every take below passed the lesson-grade quality gate: chunked VV7B
        generation in your voice, Whisper word-error check on each chunk and on
        the stitched whole, no garbled openings, no warmup residue, GWTH spoken
        as G, W, T, H. Listen with headphones, note the script and take number
        you like, and tell me in chat.
      </p>

      {takes.length === 0 ? (
        <div className={styles.callout}>
          <p>
            <strong>Still rendering.</strong> The pipeline is generating and
            quality-checking takes now. Refresh this page later; takes appear
            here as soon as they are staged.
          </p>
        </div>
      ) : (
        variants.map((variant) => {
          const group = takes.filter((t) => t.variant === variant)
          if (group.length === 0) return null
          return (
            <section key={variant} style={{ marginTop: "2.5rem" }}>
              <h2 className={styles.sectionTitle}>{VARIANT_LABELS[variant]}</h2>
              <div className={styles.beats}>
                {group.map((take) => (
                  <article className={styles.beat} key={take.file}>
                    <div className={styles.beatHead}>
                      <span className={styles.beatNo}>
                        Take {take.take}
                      </span>
                      <span className={styles.mono}>
                        {take.duration
                          ? `${Math.round(take.duration)}s`
                          : ""}
                        {take.wer !== undefined
                          ? ` · wer ${take.wer.toFixed(3)}`
                          : ""}
                      </span>
                    </div>
                    {/* Native audio keeps this dependency-free; preload none
                        so ten WAVs do not download eagerly. */}
                    <audio
                      controls
                      preload="none"
                      src={`/explainer/takes/${take.file}`}
                      style={{ width: "100%" }}
                    />
                  </article>
                ))}
              </div>
            </section>
          )
        })
      )}
    </main>
  )
}
