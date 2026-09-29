"use client"

/**
 * "This part confused me" and "How was this lesson?" (bead gwth-launch-hqyp;
 * David's wording, 2026-09-28). Both are one tap to count, then an optional
 * note. Neither ever blocks the learner.
 */
import * as React from "react"
import { cn } from "@/lib/utils"
import { COPY } from "./copy"
import type { TrackFn } from "./use-lesson-tracker"
import styles from "./parts-lesson.module.css"

export function useConfused(opts: { partIndex: number; track: TrackFn; againLabel: string; onAgain: () => void }) {
  const [state, setState] = React.useState<"idle" | "open" | "sent">("idle")
  const [note, setNote] = React.useState("")
  const [thanks, setThanks] = React.useState("")
  const areaRef = React.useRef<HTMLTextAreaElement>(null)

  const link = (
    <button
      type="button"
      className={styles.linkish}
      disabled={state !== "idle"}
      onClick={() => {
        opts.track("confused", opts.partIndex)
        setState("open")
        requestAnimationFrame(() => areaRef.current?.focus({ preventScroll: true }))
      }}
      data-testid="confused-link"
    >
      {state === "idle" ? COPY.confused : COPY.confusedNoted}
    </button>
  )

  const panel =
    state === "idle" ? null : (
      <div className={cn(styles.quiet, styles.confusedPanel)} aria-live="polite" data-testid="confused-panel">
        {state === "sent" ? (
          <p style={{ margin: 0 }}>{thanks}</p>
        ) : (
          <>
            <label htmlFor={`confused-${opts.partIndex}`}>{COPY.confusedAsk}</label>
            <textarea
              id={`confused-${opts.partIndex}`}
              ref={areaRef}
              className={styles.textarea}
              value={note}
              maxLength={2000}
              onChange={(e) => setNote(e.target.value)}
            />
            <div className={styles.row}>
              <button type="button" className={styles.ghost} onClick={opts.onAgain}>
                {opts.againLabel}
              </button>
              <button
                type="button"
                className={styles.btn}
                onClick={() => {
                  const text = note.trim()
                  if (text) opts.track("confused_note", opts.partIndex, { note: text })
                  setThanks(text ? COPY.noteThanks : COPY.confusedThanks)
                  setState("sent")
                }}
              >
                {COPY.send}
              </button>
            </div>
          </>
        )}
      </div>
    )
  return { link, panel }
}

export function RatingCard({ track, lastPart }: { track: TrackFn; lastPart: number }) {
  const [hidden, setHidden] = React.useState(false)
  const [value, setValue] = React.useState<string | null>(null)
  const [done, setDone] = React.useState<string | null>(null)
  const [note, setNote] = React.useState("")
  if (hidden) return null
  return (
    <section className={cn(styles.panel, styles.rating)} aria-labelledby="rating-title" data-testid="rating-card">
      <button
        type="button"
        className={styles.dismiss}
        aria-label={COPY.dismiss}
        onClick={() => {
          if (!value) track("rating_dismissed", lastPart)
          setHidden(true)
        }}
      >
        ×
      </button>
      <h2 id="rating-title">{COPY.ratingTitle}</h2>
      <div className={styles.rateBtns} role="group" aria-labelledby="rating-title">
        {COPY.ratings.map((r) => (
          <button
            key={r.value}
            type="button"
            className={styles.ghost}
            aria-pressed={value === r.value}
            disabled={done !== null}
            onClick={() => {
              setValue(r.value)
              track("rating", lastPart, { value: r.value })
            }}
          >
            {value === r.value ? `✓ ${r.label}` : r.label}
          </button>
        ))}
      </div>
      <div aria-live="polite">
        {value && done === null ? (
          <div style={{ marginTop: 16 }}>
            <label htmlFor="rating-more">{COPY.ratingMore}</label>
            <textarea id="rating-more" className={styles.textarea} value={note} maxLength={2000} onChange={(e) => setNote(e.target.value)} />
            <div className={styles.row}>
              <button type="button" className={styles.linkish} onClick={() => setDone(COPY.ratingThanks)}>
                {COPY.noThanks}
              </button>
              <button
                type="button"
                className={styles.btn}
                onClick={() => {
                  const text = note.trim()
                  if (text) track("rating_note", lastPart, { note: text })
                  setDone(text ? COPY.noteThanks : COPY.ratingThanks)
                }}
              >
                {COPY.send}
              </button>
            </div>
          </div>
        ) : null}
        {done ? <p style={{ margin: "14px 0 0" }}>{done}</p> : null}
      </div>
    </section>
  )
}
