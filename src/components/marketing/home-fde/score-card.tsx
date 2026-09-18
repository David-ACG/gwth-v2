import styles from "./home-fde.module.css"

/**
 * The score card, drawn in code rather than exported as a picture.
 *
 * David, 2026-09-15 (annotation a-20260915-211845-237ea3): *"We tried to
 * design a good-looking image of a scoring system that would be shown on
 * LinkedIn in the last version, but it wasn't particularly successful. Can we
 * try again? It needs to show the score and the trajectory that the student is
 * on whether they're improving their score or it's flatlining or it's not
 * being kept up to date"*.
 *
 * Three things follow from that, and they are the whole design:
 *
 * 1. **One card, three states.** The card a learner would put in front of
 *    somebody is the same object in all three cases, so the page shows one
 *    card three times rather than three different diagrams. The difference
 *    between them is then the only thing a reader has to look at.
 * 2. **The trajectory is a shape, not a colour.** Every stroke here is ink or
 *    a hairline. The three states are told apart by the line's pattern (solid
 *    rising, solid level, dashed where nothing has been recorded), by the
 *    shape of the marker on the last point (filled disc, hollow square, hollow
 *    ring), and by a word. Bible `tint-is-never-the-only-signal` and
 *    `paper-first-banned-patterns` both forbid a state carried by colour, and
 *    a card meant to be screenshotted will be seen in greyscale sooner or
 *    later.
 * 3. **No brand image.** It resembles something a learner could share, and it
 *    carries no other organisation's name, mark or template. GWTH has no
 *    integration with any social network and the page must not imply one.
 *
 * The numbers are illustrative and the card says so on the page beneath it.
 */

const VIEW_W = 260
const VIEW_H = 96
// The end marker has a radius of 4, so the plot has to inset by more than
// that or the last point is clipped by the viewBox. It was, at phone width.
const PAD_X = 7
const PAD_Y = 9

/** The band the sample histories are drawn inside. All three cards share one
 *  vertical scale, so a reader can compare their slopes honestly, and the band
 *  is the range the implemented formula can actually produce rather than a
 *  round number: 66 mandatory lessons at 1.5 points ceilings the score at 99,
 *  and no example here passes 71. A wider band pushed every line into the
 *  bottom third and left the flat one sitting on the axis. */
const SCALE_MIN = 0
const SCALE_MAX = 80

function pointsFor(history: readonly number[]): { x: number; y: number }[] {
  const span = Math.max(history.length - 1, 1)
  const range = SCALE_MAX - SCALE_MIN
  return history.map((value, i) => ({
    x: PAD_X + (i / span) * (VIEW_W - PAD_X * 2),
    y:
      VIEW_H -
      PAD_Y -
      ((Math.min(Math.max(value, SCALE_MIN), SCALE_MAX) - SCALE_MIN) / range) *
        (VIEW_H - PAD_Y * 2),
  }))
}

function pathFrom(points: { x: number; y: number }[]): string {
  return points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ")
}

export type MarkerKind = "filled" | "square" | "ring"

export type ScoreState = {
  id: string
  /** Where the learner is now, on the same scale in all three cards. */
  value: number
  /** The band the product already puts on that number, from
   *  `getTrajectoryLabel()` in `lib/progress/gwth-score.ts`. Taken from the
   *  code rather than invented, so the page and the product agree. */
  band: string
  /** Twelve readings, oldest first. */
  history: readonly number[]
  /** How many of those readings are real rather than carried forward. A stale
   *  card stops recording partway, and the rest of its line is drawn dashed. */
  recordedUpTo?: number
  state: string
  marker: MarkerKind
  said: string
}

/** The end marker. Three shapes, so the state survives a greyscale screenshot. */
function Marker({ x, y, kind }: { x: number; y: number; kind: MarkerKind }) {
  if (kind === "square") {
    return (
      <rect
        x={x - 4}
        y={y - 4}
        width={8}
        height={8}
        className={`${styles.scoreMarker} ${styles.scoreMarkerHollow}`}
      />
    )
  }
  if (kind === "ring") {
    return (
      <circle
        cx={x}
        cy={y}
        r={4}
        className={`${styles.scoreMarker} ${styles.scoreMarkerHollow}`}
      />
    )
  }
  return (
    <circle
      cx={x}
      cy={y}
      r={4}
      className={`${styles.scoreMarker} ${styles.scoreMarkerFilled}`}
    />
  )
}

/** The glyph beside the state word: an arrow, a level bar, a broken ring. */
function StateGlyph({ kind }: { kind: MarkerKind }) {
  const common = {
    width: 16,
    height: 16,
    viewBox: "0 0 16 16",
    "aria-hidden": true,
    focusable: "false" as const,
    className: styles.scoreGlyph,
  }
  if (kind === "square") {
    return (
      <svg {...common}>
        <path d="M2 8h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
      </svg>
    )
  }
  if (kind === "ring") {
    return (
      <svg {...common}>
        <circle cx="8" cy="8" r="5.5" stroke="currentColor" strokeWidth="2" fill="none" strokeDasharray="3 2.6" />
      </svg>
    )
  }
  return (
    <svg {...common}>
      <path
        d="M3 12L8 4l5 8"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  )
}

export function ScoreCard({
  state,
  cardClassName = "",
}: {
  state: ScoreState
  cardClassName?: string
}) {
  const points = pointsFor(state.history)
  const last = points[points.length - 1]!
  const cut = state.recordedUpTo ?? state.history.length
  const solid = points.slice(0, cut)
  const dashed = points.slice(Math.max(cut - 1, 0))
  return (
    <article className={`${cardClassName} ${styles.scoreCard}`} data-testid="score-card" data-state={state.id}>
      <p className={styles.scoreName}>GWTH score</p>
      <p className={styles.scoreFigure}>
        <span className={styles.scoreValue}>{state.value}</span>
        <span className={styles.scoreOf}>{state.band}</span>
      </p>
      <svg
        className={styles.scoreChart}
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        role="img"
        aria-label={`${state.state}. ${state.said}`}
        data-testid="score-chart"
      >
        {solid.length > 1 && (
          <path d={pathFrom(solid)} className={styles.scoreLine} data-testid="score-line-solid" />
        )}
        {dashed.length > 1 && (
          <path
            d={pathFrom(dashed)}
            className={`${styles.scoreLine} ${styles.scoreLineStale}`}
            data-testid="score-line-dashed"
          />
        )}
        <Marker x={last.x} y={last.y} kind={state.marker} />
      </svg>
      <p className={styles.scoreState}>
        <StateGlyph kind={state.marker} />
        <span>{state.state}</span>
      </p>
      <p className={styles.scoreSaid}>{state.said}</p>
    </article>
  )
}
