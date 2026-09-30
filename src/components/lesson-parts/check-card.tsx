"use client"

/**
 * One part's check question (bead gwth-launch-hqyp). Graded on the server.
 * Right: Continue unlocks. Wrong: kind feedback and another go. After two
 * wrong tries: the right answer, the explanation, "Read/Watch that bit
 * again", and Continue unlocks. Every state shows a glyph and words, never
 * colour alone.
 */
import * as React from "react"
import { cn } from "@/lib/utils"
import { MAX_WRONG_BEFORE_EXPLAIN, type LessonFormat } from "@/lib/lessons/parts"
import { COPY } from "./copy"
import styles from "./parts-lesson.module.css"

export interface ClientCheck {
  tries: number
  wrongTries: number
  resolved: boolean
  /** Options already picked and found wrong. */
  wrongPicks: number[]
  /** The option picked and found right, if any. */
  rightPick: number | null
  /** Feedback for the latest answer. */
  feedback: string | null
  /** Once resolved: the right option and why. */
  reveal: { answerIndex: number; explanation: string } | null
}

export const EMPTY_CHECK: ClientCheck = {
  tries: 0,
  wrongTries: 0,
  resolved: false,
  wrongPicks: [],
  rightPick: null,
  feedback: null,
  reveal: null,
}

export function CheckCard({
  partId,
  question,
  options,
  state,
  pending,
  error,
  format,
  onAnswer,
  onAgain,
}: {
  partId: string
  question: string
  options: string[]
  state: ClientCheck
  pending: boolean
  error: string | null
  format: LessonFormat
  onAnswer: (optionIndex: number) => void
  onAgain: () => void
}) {
  const qId = `check-q-${partId}`
  const answerIndex = state.reveal?.answerIndex ?? state.rightPick
  const explained = state.resolved && state.rightPick === null
  const lastWasWrong = !state.resolved && state.wrongTries > 0

  return (
    <section className={cn(styles.panel, styles.check)} aria-labelledby={qId} data-testid="check-card">
      <p className={styles.checkLabel}>{COPY.checkLabel}</p>
      <h3 id={qId} className={styles.checkQ}>
        {question}
      </h3>
      <ul className={styles.options}>
        {options.map((text, k) => {
          const isRight = answerIndex === k && state.resolved
          const isWrong = state.wrongPicks.includes(k)
          return (
            <li key={k}>
              <button
                type="button"
                className={cn(styles.option, isRight && styles.optRight, isWrong && styles.optWrong)}
                disabled={pending || state.resolved || isWrong}
                aria-describedby={isRight || isWrong ? `${qId}-tag-${k}` : undefined}
                onClick={() => onAnswer(k)}
                data-option={k}
              >
                <span className={styles.optGlyph} aria-hidden="true">
                  {isRight ? "✓" : isWrong ? "✗" : String.fromCharCode(65 + k)}
                </span>
                <span>{text}</span>
                {isRight ? (
                  <span id={`${qId}-tag-${k}`} className={styles.optTag}>
                    {COPY.rightAnswer}
                  </span>
                ) : isWrong ? (
                  <span id={`${qId}-tag-${k}`} className={styles.optTag}>
                    {COPY.notThisOne}
                  </span>
                ) : null}
              </button>
            </li>
          )
        })}
      </ul>
      <div className={styles.feedback} aria-live="polite">
        {pending ? <p className={styles.muted}>{COPY.saving}</p> : null}
        {error ? (
          <p className={styles.errorBox} role="alert" data-testid="check-error">
            <span aria-hidden="true">⚠</span> {error}
          </p>
        ) : null}
        {!pending && state.feedback ? (
          <div className={styles.feedbackBox} data-testid="check-feedback">
            {state.resolved && !explained ? <p>{state.feedback}</p> : null}
            {lastWasWrong ? (
              <p>
                {state.feedback} {state.wrongTries < MAX_WRONG_BEFORE_EXPLAIN ? COPY.tryAgain : null}
              </p>
            ) : null}
            {explained && state.reveal ? (
              <>
                <p>
                  <strong>{COPY.theAnswer(options[state.reveal.answerIndex] ?? "")}</strong>
                </p>
                <p>{state.reveal.explanation}</p>
              </>
            ) : null}
          </div>
        ) : null}
        {explained ? (
          <div className={styles.againRow}>
            <button type="button" className={styles.ghost} onClick={onAgain}>
              {format === "watch" ? COPY.watchAgain : COPY.readAgain}
            </button>
          </div>
        ) : null}
      </div>
    </section>
  )
}
