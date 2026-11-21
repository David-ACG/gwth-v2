import type { CSSProperties, ReactNode } from "react"
import { LogoGwth } from "@/components/marketing/redesign/logo-gwth"
import styles from "./score-badge.module.css"

/**
 * The GWTH.ai score badge: one object for the home page story, the learner's
 * score page and the picture they add to LinkedIn.
 *
 * David picked this design on 21 Nov 2026 (bead gwth-launch-phjb, round 3,
 * "Ring on the left: the title across the top, words beside the ring"). His
 * words on round 2: *"it looks slightly over cluttered ... have only the
 * essential information on there, and make sure that people know that it's
 * gwth.ai ... maybe it should go at the top with the gwth.ai logo and then
 * something saying score"*. Earlier the same day: *"You only need month 3,
 * month 2, and month 1 projects. That's all. You don't need to say what the
 * project is, because we may change that later."*
 *
 * So, top to bottom and nothing else: the GWTH.ai logo with the word score as
 * the title, the learner's name, the ring with the number, one status line,
 * the three project grades, and a footer line. No band names (David: "that's
 * going to be quite difficult to define, and we may get some comeback from
 * it"), no quiz results, no lesson counts.
 *
 * The badge sizes everything from its own width (container units), so it is
 * the same drawing at 300 pixels in a profile and at full width on a page.
 *
 * The ring is drawn from two numbers: `shown`, the points the learner holds
 * today, and `earned`, the points they earned. When the fall-back rule has
 * taken points away (`gwth-score.ts`), the gap between them is drawn dashed,
 * so a fall is a shape and a word, never a colour alone (Bible
 * `tint-is-never-the-only-signal`).
 */

export type ProjectGrade = "Not yet" | "Pass" | "Good" | "Excellent" | "Not handed in"

/** What the status line under the name says. */
export type BadgeStatus = "date" | "up" | "fall" | "ok"

export type ScoreBadgeProps = {
  name: string
  /** Points held today, 0 to 100. */
  shown: number
  /** Points earned before any fall; defaults to `shown`. */
  earned?: number
  /** The number in the ring when it differs from `shown` (the animation sets it). */
  display?: ReactNode
  status: BadgeStatus
  /** "9 March 2027": used by the `date` status line. */
  dateLabel: string
  grades: readonly [ProjectGrade, ProjectGrade, ProjectGrade]
  /** The footer: the link to today's score (no href for an example), or when the score last changed. */
  foot: { kind: "link"; href?: string; label: string } | { kind: "changed"; date: ReactNode }
  /** Unique within the page: names the SVG mask. */
  id: string
  className?: string
  /** Marks the three grades for the home page story (`data-at="p1"` ...). */
  stepMarks?: boolean
  style?: CSSProperties
}

const R = 47.5
const W = 11

function polar(r: number, v: number): [number, number] {
  const a = ((-90 + 3.6 * v) * Math.PI) / 180
  return [60 + r * Math.cos(a), 60 + r * Math.sin(a)]
}

function Tick({ r0, r1, v, w, className }: { r0: number; r1: number; v: number; w: number; className?: string }) {
  const [x1, y1] = polar(r0, v)
  const [x2, y2] = polar(r1, v)
  return (
    <line
      className={className}
      x1={x1.toFixed(2)}
      y1={y1.toFixed(2)}
      x2={x2.toFixed(2)}
      y2={y2.toFixed(2)}
      strokeWidth={w}
    />
  )
}

export function ScoreRing({ id, children }: { id: string; children: ReactNode }) {
  const mask = `score-ring-${id}`
  return (
    <div className={styles.ring}>
      <svg viewBox="0 0 120 120" aria-hidden="true">
        <defs>
          <mask id={mask} maskUnits="userSpaceOnUse" x="-10" y="-10" width="140" height="140">
            <circle className={styles.rgMask} cx="60" cy="60" r={R} pathLength={100} />
          </mask>
        </defs>
        <circle className={styles.rgTrack} cx="60" cy="60" r={R} strokeWidth={W} />
        <circle
          className={styles.rgFill}
          cx="60"
          cy="60"
          r={R}
          strokeWidth={W}
          pathLength={100}
          transform="rotate(-90 60 60)"
        />
        <circle
          className={styles.rgLost}
          cx="60"
          cy="60"
          r={R}
          strokeWidth={W}
          mask={`url(#${mask})`}
          transform="rotate(-90 60 60)"
        />
        <circle className={styles.rgEdge} cx="60" cy="60" r={R + W / 2} />
        <circle className={styles.rgEdge} cx="60" cy="60" r={R - W / 2} />
        {[0, 25, 50, 75].map((v) => (
          <Tick key={v} className={styles.rgInk} r0={55.8} r1={59.2} v={v} w={1.5} />
        ))}
        <g className={styles.rgSpin}>
          <Tick className={styles.rgGap} r0={R - W / 2 - 1.2} r1={R + W / 2 + 1.2} v={0} w={4.6} />
          <Tick className={styles.rgInk} r0={R - W / 2 - 2.2} r1={R + W / 2 + 2.2} v={0} w={2.2} />
        </g>
      </svg>
      <div className={styles.ringIn}>{children}</div>
    </div>
  )
}

function Glyph({ d }: { d: string }) {
  return (
    <svg className={styles.glyph} viewBox="0 0 16 16" aria-hidden="true">
      <path d={d} />
    </svg>
  )
}

const UP = "M3 11l5-6 5 6"
const DOWN = "M3 5l5 6 5-6"
const TICK = "M2.5 8.5l3.5 3.5 7.5-8"

export function ScoreBadge({
  name,
  shown,
  earned,
  display,
  status,
  dateLabel,
  grades,
  foot,
  id,
  className,
  stepMarks = false,
  style,
}: ScoreBadgeProps) {
  const vars = { "--shown": shown, "--earned": earned ?? shown, ...style } as CSSProperties
  return (
    <div
      className={`${styles.badge}${className ? ` ${className}` : ""}`}
      data-status={status}
      data-testid="score-badge"
      style={vars}
    >
      <div className={styles.inner}>
        <p className={styles.title}>
          <LogoGwth className={styles.logo} title="GWTH.ai" />
          <span className={styles.word}>score</span>
        </p>
        <p className={styles.name}>{name}</p>
        <div className={styles.ringCell}>
          <ScoreRing id={id}>
            <span className={styles.num} data-score-num>
              {display ?? Math.round(shown)}
            </span>
            <small>out of 100</small>
          </ScoreRing>
        </div>
        <p className={styles.status}>
          <span data-s="date">Score on {dateLabel}</span>
          <span data-s="up">
            <Glyph d={UP} />
            Going up
          </span>
          <span data-s="fall">
            <Glyph d={DOWN} />
            Falling
          </span>
          <span data-s="ok">
            <Glyph d={TICK} />
            Up to date
          </span>
        </p>
        <dl className={styles.months}>
          {grades.map((grade, i) => (
            <div key={i}>
              <dt>
                Month {i + 1} <span>project</span>
              </dt>
              <dd data-at={stepMarks ? `p${i + 1}` : undefined}>{grade}</dd>
            </div>
          ))}
        </dl>
        <div className={styles.foot}>
          {foot.kind === "link" ? (
            <>
              <span className={styles.footKey}>Check today&apos;s score</span>
              {foot.href ? (
                <a className={styles.footValue} href={foot.href}>
                  {foot.label}
                </a>
              ) : (
                <span className={styles.footValue}>{foot.label}</span>
              )}
            </>
          ) : (
            <>
              <span className={styles.footKey}>Last changed</span>
              <span className={styles.footValue}>{foot.date}</span>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
