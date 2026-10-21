"use client"

import { useRef, useState } from "react"
import { levelLabel, ordinalWord } from "@/lib/model-lab-format"
import styles from "./model-lab.module.css"

/** One file of a blind answer, ready to show (markdown already rendered on the server). */
export type ClientAnswerFile =
  | {
      /** Markdown, rendered to safe HTML on the server. */
      kind: "md"
      /** File name, e.g. "pilot_plan.md". */
      name: string
      /** The rendered HTML. */
      html: string
    }
  | {
      /** A model-written page (sandboxed frame) or chart (image). */
      kind: "html" | "svg"
      /** File name. */
      name: string
      /** Path under /labs-files/. */
      src: string
    }
  | {
      /** A screenshot with a link to the page or the full-size picture. */
      kind: "shot"
      /** File name of the page shown. */
      name: string
      /** Screenshot path. */
      src: string
      /** Where the link goes. */
      href: string
      /** Link label. */
      label: string
    }

/** One blind answer, with what the reveal shows. */
export interface ClientAnswer {
  /** "A" to "D". */
  letter: string
  /** Model name, hidden until the visitor picks. */
  name: string
  /** Thinking level. */
  level: string
  /** Mark out of 100 on this task. */
  score: number
  /** Whether it caught the trap. */
  basics: boolean
  /** About what it cost. */
  cost: string
  /** The answer's files. */
  files: ClientAnswerFile[]
}

/** Props for {@link WhichWouldYouUse}. */
interface WhichWouldYouUseProps {
  /** The four answers, in their fixed shuffled order. */
  answers: ClientAnswer[]
}

/** "board_note.md" as "board note", for the "Read the ..." summary. */
function fileLabel(name: string): string {
  return name.replace(/\.md$/, "").replace(/_/g, " ")
}

function AnswerFile({
  file,
  title,
  visual,
}: {
  file: ClientAnswerFile
  title: string
  visual: boolean
}) {
  if (file.kind === "shot") {
    return (
      <>
        {/* A model's own screenshot under /labs-files: plain img, because its
            size is unknown and next/image would re-encode the evidence. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className={`${styles.chart} ${styles.shot}`}
          alt={`${title}: screenshot`}
          src={file.src}
          loading="lazy"
        />
        <p>
          <a className={styles.tryLink} href={file.href} target="_blank" rel="noopener">
            {file.label}
          </a>
        </p>
      </>
    )
  }
  if (file.kind !== "md") {
    if (file.kind === "html") {
      return (
        <iframe
          className={styles.app}
          title={title}
          sandbox="allow-scripts allow-forms allow-modals"
          loading="lazy"
          src={file.src}
        />
      )
    }
    // An SVG as an image never runs its script.
    // eslint-disable-next-line @next/next/no-img-element
    return <img className={styles.chart} alt={`${title}: chart`} src={file.src} />
  }
  const body = (
    <div
      className={`lesson-prose ${styles.md}`}
      // Rendered on the server by renderAnswerMarkdown: raw HTML dropped,
      // links and images made safe (lib/model-lab-markdown.ts).
      dangerouslySetInnerHTML={{ __html: file.html }}
    />
  )
  if (!visual) return body
  return (
    <details className={styles.details}>
      <summary>Read the {fileLabel(file.name)}</summary>
      {body}
    </details>
  )
}

/**
 * "Which would you use?": four real answers to the lab's main task with the
 * names hidden. The visitor picks one, then every card reveals who wrote it,
 * our mark, the cost and whether it caught the trap, and a line says where our
 * marks put their choice.
 *
 * Visitor vote counts are out of scope for v1 (they need a table), so the
 * reveal states only our own marks.
 */
export function WhichWouldYouUse({ answers }: WhichWouldYouUseProps) {
  const [picked, setPicked] = useState<number | null>(null)
  const cards = useRef<(HTMLDivElement | null)[]>([])
  const visual = answers.some((a) => a.files.some((f) => f.kind !== "md"))

  function pick(i: number) {
    setPicked(i)
    // After the reveal the card is taller; bring the chosen one into view.
    requestAnimationFrame(() => cards.current[i]?.scrollIntoView?.({ block: "start" }))
  }

  const order = [...answers.keys()].sort((x, y) => answers[y]!.score - answers[x]!.score)

  return (
    <>
      <div className={`${styles.answers} ${visual ? styles.answersVisual : ""}`}>
        {answers.map((a, i) => (
          <div
            key={a.letter}
            ref={(el) => {
              cards.current[i] = el
            }}
            className={`${styles.card} ${styles.answer} ${picked === i ? styles.answerMine : ""}`}
            data-testid="lab-answer"
          >
            <div className={styles.answerHead}>
              <span className={styles.answerLetter}>Answer {a.letter}</span>
              {picked === i ? <span className={styles.meta}>Your choice</span> : null}
            </div>
            <div
              className={styles.answerBody}
              tabIndex={0}
              role="region"
              aria-label={`Answer ${a.letter}`}
            >
              {a.files.length ? (
                a.files.map((f) => (
                  <AnswerFile key={f.name} file={f} title={`Answer ${a.letter}`} visual={visual} />
                ))
              ) : (
                <p>No answer was produced.</p>
              )}
            </div>
            {picked === null ? (
              <button type="button" className={styles.buttonPrimary} onClick={() => pick(i)}>
                I would use answer {a.letter}
              </button>
            ) : (
              <div className={styles.reveal} data-testid="lab-reveal">
                <strong>{a.name}</strong>, {levelLabel(a.level)}
                <br />
                Our mark: {a.score} out of 100 · about {a.cost} ·{" "}
                {a.basics ? (
                  "Passed the trap"
                ) : (
                  <span className={styles.bad}>
                    <span aria-hidden="true">✗ </span>Fell for the trap
                  </span>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
      <div aria-live="polite">
        {picked !== null ? (
          <ResultLine answers={answers} picked={picked} order={order} />
        ) : null}
      </div>
    </>
  )
}

function ResultLine({
  answers,
  picked,
  order,
}: {
  answers: ClientAnswer[]
  picked: number
  order: number[]
}) {
  const place = order.indexOf(picked) + 1
  const mine = answers[picked]!
  const top = answers[order[0]!]!
  return (
    <p className={styles.result} data-testid="lab-result">
      You chose answer {mine.letter}, by {mine.name}. Our marks put it {ordinalWord(place)} of
      these four
      {place === 1 ? "." : `. The highest marked was answer ${top.letter}, by ${top.name}.`}
    </p>
  )
}
