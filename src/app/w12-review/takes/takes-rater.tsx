"use client"

import { useState } from "react"
import styles from "../review.module.css"
import rater from "./rater.module.css"

/** One staged take with its pipeline settings and any saved review. */
export interface TakeForReview {
  /** WAV file name under /explainer/takes/. */
  file: string
  /** Script variant key (fable100 / gpt100). */
  variant: string
  /** Take number. */
  take: number
  /** Settings recipe label from the harness (baseline / brisk / fast / ...). */
  variantLabel: string
  /** Human-readable settings line, e.g. "cfg 1.3 · 0.95x · gap 400ms · greedy". */
  settings: string
  /** Whisper WER of the stitched take. */
  wer?: number
  /** Duration in seconds. */
  duration?: number
  /** Saved review, if David has rated this take before. */
  review?: {
    score_pacing: number | null
    score_lifelikeness: number | null
    score_accuracy: number | null
    notes: string
  }
  /** Whether this take is currently picked as the final VO. */
  selectedAsFinal: boolean
}

/** The three lesson-intro scoring dimensions, in display order. */
const DIMENSIONS = [
  { key: "score_pacing", label: "Pacing / energy" },
  { key: "score_lifelikeness", label: "Lifelikeness" },
  { key: "score_accuracy", label: "Accuracy" },
] as const

type Scores = Record<(typeof DIMENSIONS)[number]["key"], number | null>

/** Per-take editable UI state. */
interface TakeState {
  scores: Scores
  notes: string
  final: boolean
  status: "idle" | "saving" | "saved" | "error"
}

/**
 * Rate-and-pick card list for the W12 voiceover takes, mirroring the
 * lesson-intro-video review flow: 1-5 scores for pacing, lifelikeness and
 * accuracy, free-text notes, and an exclusive "pick as final" toggle. Saves
 * through /api/w12-take-review into the take's meta sidecar so the winning
 * settings are recorded next to the audio.
 */
export function TakesRater({ takes }: { takes: TakeForReview[] }) {
  const [state, setState] = useState<Record<string, TakeState>>(() =>
    Object.fromEntries(
      takes.map((t) => [
        t.file,
        {
          scores: {
            score_pacing: t.review?.score_pacing ?? null,
            score_lifelikeness: t.review?.score_lifelikeness ?? null,
            score_accuracy: t.review?.score_accuracy ?? null,
          },
          notes: t.review?.notes ?? "",
          final: t.selectedAsFinal,
          status: "idle",
        } satisfies TakeState,
      ]),
    ),
  )

  /** Immutably patch one take's entry; no-op if the key is unknown. */
  const patch = (
    file: string,
    updater: (entry: TakeState) => TakeState,
    also?: (next: Record<string, TakeState>) => void,
  ) =>
    setState((s) => {
      const entry = s[file]
      if (!entry) return s
      const next = { ...s, [file]: updater(entry) }
      also?.(next)
      return next
    })

  const save = async (file: string, final?: boolean) => {
    const entry = state[file]
    if (!entry) return
    const isFinal = final ?? entry.final
    patch(file, (e) => ({ ...e, final: isFinal, status: "saving" }))
    try {
      const res = await fetch("/api/w12-take-review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          file,
          ...entry.scores,
          notes: entry.notes,
          selected_as_final: isFinal,
        }),
      })
      if (!res.ok) throw new Error(String(res.status))
      // picking one take as final un-picks the rest, matching the server
      patch(
        file,
        (e) => ({ ...e, status: "saved" }),
        (next) => {
          if (!isFinal) return
          for (const key of Object.keys(next)) {
            const other = next[key]
            if (key !== file && other?.final) {
              next[key] = { ...other, final: false }
            }
          }
        },
      )
    } catch {
      patch(file, (e) => ({ ...e, status: "error" }))
    }
  }

  return (
    <div className={styles.beats}>
      {takes.map((take) => {
        const entry = state[take.file]
        if (!entry) return null
        return (
          <article
            className={`${styles.beat} ${entry.final ? rater.finalCard : ""}`}
            key={take.file}
          >
            <div className={styles.beatHead}>
              <span className={styles.beatNo}>
                Take {take.take} · {take.variantLabel}
                {entry.final ? " · PICKED AS FINAL" : ""}
              </span>
              <span className={styles.mono}>
                {take.duration ? `${Math.round(take.duration)}s` : ""}
                {take.wer !== undefined ? ` · wer ${take.wer.toFixed(3)}` : ""}
              </span>
            </div>

            <p className={rater.settings}>{take.settings}</p>

            {/* preload none so a page of WAVs does not download eagerly */}
            <audio
              controls
              preload="none"
              src={`/explainer/takes/${take.file}`}
              style={{ width: "100%" }}
            />

            <div className={rater.scoreRows}>
              {DIMENSIONS.map((dim) => (
                <div className={rater.scoreRow} key={dim.key}>
                  <span className={rater.scoreLabel}>{dim.label}</span>
                  <span
                    className={rater.scoreButtons}
                    role="radiogroup"
                    aria-label={`${dim.label} for take ${take.take}`}
                  >
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        type="button"
                        role="radio"
                        aria-checked={entry.scores[dim.key] === n}
                        className={rater.scoreButton}
                        data-active={
                          entry.scores[dim.key] === n ? "true" : undefined
                        }
                        onClick={() =>
                          patch(take.file, (e) => ({
                            ...e,
                            scores: { ...e.scores, [dim.key]: n },
                            status: "idle",
                          }))
                        }
                      >
                        {n}
                      </button>
                    ))}
                  </span>
                </div>
              ))}
            </div>

            <textarea
              className={rater.notes}
              placeholder="Notes — what works, what to change (pace, warmth, emphasis)…"
              value={entry.notes}
              rows={2}
              onChange={(event) =>
                patch(take.file, (e) => ({
                  ...e,
                  notes: event.target.value,
                  status: "idle",
                }))
              }
            />

            <div className={rater.actions}>
              <button
                type="button"
                className={rater.saveButton}
                onClick={() => save(take.file)}
                disabled={entry.status === "saving"}
              >
                {entry.status === "saving"
                  ? "Saving…"
                  : entry.status === "saved"
                    ? "Saved ✓"
                    : "Save rating"}
              </button>
              <button
                type="button"
                className={rater.pickButton}
                data-picked={entry.final ? "true" : undefined}
                onClick={() => save(take.file, !entry.final)}
                disabled={entry.status === "saving"}
              >
                {entry.final ? "Picked as final ✓" : "Pick as final"}
              </button>
              {entry.status === "error" && (
                <span className={rater.error}>Save failed — try again</span>
              )}
            </div>
          </article>
        )
      })}
    </div>
  )
}
