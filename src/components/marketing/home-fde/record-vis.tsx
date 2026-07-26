import styles from "./home-fde.module.css"

/*
 * RecordVis — the home page "what your record looks like" visual.
 *
 * This is the design David agreed on 2026-04-27 ("Variant B, Freshness Ring +
 * Sparkline", confirmed twice), recorded in
 * kanban/1_planning/HANDOFF_2026-04-27_phase-1b-score-design-iteration.md and
 * mocked at kanban/design-artefacts/2026-04-27/score-variants/variant-B-ring/.
 * Its two halves answer the two questions David keeps asking the card to
 * answer: the ring is where you stand right now, the sparkline is how you got
 * there and whether you have kept up.
 *
 * Two deliberate departures from the 2026-04-27 mock:
 *
 * 1. Register. The mock predates the FDE journal register, so it used a
 *    gradient ring, a glow drop-shadow and rounded caps, all three of which the
 *    style bible bans (bible.yaml, banned-ui-patterns). The shapes and the
 *    information are the mock's; the finish is FDE, meaning solid colour,
 *    hairlines and butt caps. Colour is set in home-fde.module.css so light and
 *    dark both work (teal on light, ochre on dark, as .credentialNumber
 *    already does).
 * 2. Subject. The mock plotted the GWTH Score against a pass line of 100. W8
 *    hid the GWTH Score for beta (ENABLE_GWTH_SCORE defaults off), so plotting
 *    it on the public home page would put back something the beta scope took
 *    out. The same two shapes are therefore plotted against the thing the card
 *    already talks about: lessons completed against the live curriculum.
 *
 * Every figure here is illustrative and the panel says so in its own copy. No
 * real learner is represented.
 */

/** Lessons completed, one point per week for the last twelve weeks. */
const COMPLETED = [18, 24, 29, 34, 39, 43, 47, 47, 51, 55, 60, 64] as const

/** Total lessons in the live curriculum (64 core + 30 optional). */
const CURRICULUM_TOTAL = 94

/**
 * The week a curriculum revision landed. The count holds steady because that
 * week's work went into redoing revised lessons rather than into new ones,
 * which is the "kept in step with the live curriculum" claim made visible.
 */
const REVISION_WEEK_INDEX = 7
const REVISED_LESSON_COUNT = 3

const RING_SIZE = 148
const RING_STROKE = 10
const RING_RADIUS = (RING_SIZE - RING_STROKE) / 2
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS

const CHART_WIDTH = 560
const CHART_HEIGHT = 96
const CHART_GUTTER = 34
/** Headroom above the curriculum line so its label is never clipped. */
const CHART_TOP_INSET = 14
const CHART_SCALE_MAX = 100

const completedToday = COMPLETED[COMPLETED.length - 1] ?? 0
const completedStart = COMPLETED[0] ?? 0
const completedGain = completedToday - completedStart
const completedFraction = completedToday / CURRICULUM_TOTAL
const completedPercent = Math.round(completedFraction * 100)

function chartY(value: number): number {
  const usable = CHART_HEIGHT - CHART_TOP_INSET
  return CHART_HEIGHT - (value / CHART_SCALE_MAX) * usable
}

function chartX(index: number): number {
  return (index / (COMPLETED.length - 1)) * CHART_WIDTH
}

const points = COMPLETED.map(
  (value, index) => [chartX(index), chartY(value)] as const,
)
const linePath = points
  .map((point, index) =>
    index === 0 ? `M${point[0]},${point[1]}` : `L${point[0]},${point[1]}`,
  )
  .join(" ")
const areaPath = `${linePath} L${CHART_WIDTH},${CHART_HEIGHT} L0,${CHART_HEIGHT} Z`
const curriculumY = chartY(CURRICULUM_TOTAL)
const revisionX = chartX(REVISION_WEEK_INDEX)
const revisionY = chartY(COMPLETED[REVISION_WEEK_INDEX] ?? 0)
const lastIndex = points.length - 1

const chartDescription =
  `Lessons completed, one point per week over twelve weeks: ` +
  `${completedStart} at the start, rising to ${completedToday} today, ` +
  `against a live curriculum of ${CURRICULUM_TOTAL} lessons. ` +
  `In week ${REVISION_WEEK_INDEX + 1} the count held steady while ` +
  `${REVISED_LESSON_COUNT} revised lessons were redone.`

const ringDescription =
  `${completedToday} of ${CURRICULUM_TOTAL} lessons complete, ` +
  `${completedPercent} per cent of the live curriculum.`

/**
 * The record visual: a completion ring, a twelve week progress line, and a
 * written read-out of both for anyone who cannot see them.
 */
export function RecordVis() {
  return (
    <div className={styles.recordVis}>
      <div className={styles.credentialRow}>
        <div className={styles.recordRing}>
          <svg
            className={styles.recordRingSvg}
            viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`}
            width={RING_SIZE}
            height={RING_SIZE}
            role="img"
            aria-label={ringDescription}
          >
            <circle
              className={styles.recordRingTrack}
              cx={RING_SIZE / 2}
              cy={RING_SIZE / 2}
              r={RING_RADIUS}
              strokeWidth={RING_STROKE}
              fill="none"
            />
            <circle
              className={styles.recordRingArc}
              cx={RING_SIZE / 2}
              cy={RING_SIZE / 2}
              r={RING_RADIUS}
              strokeWidth={RING_STROKE}
              strokeLinecap="butt"
              fill="none"
              strokeDasharray={`${RING_CIRCUMFERENCE * completedFraction} ${RING_CIRCUMFERENCE}`}
              transform={`rotate(-90 ${RING_SIZE / 2} ${RING_SIZE / 2})`}
            />
          </svg>
          <div className={styles.recordRingCentre} aria-hidden="true">
            <span className={styles.credentialNumber}>
              {completedToday}/{CURRICULUM_TOTAL}
            </span>
            <span className={styles.mono}>Lessons</span>
          </div>
        </div>
        <div className={styles.credentialFacts}>
          <div>
            <span>Format</span>
            <strong>Live record</strong>
          </div>
          <div>
            <span>Progress</span>
            <strong>Up {completedGain} in 12 weeks</strong>
          </div>
          <div>
            <span>Status</span>
            <strong>Current</strong>
          </div>
        </div>
      </div>

      <div className={styles.recordChart}>
        <svg
          viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT + CHART_GUTTER}`}
          role="img"
          aria-label={chartDescription}
        >
          <line
            className={styles.recordChartBaseline}
            x1={0}
            y1={CHART_HEIGHT}
            x2={CHART_WIDTH}
            y2={CHART_HEIGHT}
          />
          <line
            className={styles.recordChartReference}
            x1={0}
            y1={curriculumY}
            x2={CHART_WIDTH}
            y2={curriculumY}
            strokeDasharray="4 4"
          />
          <text
            className={styles.recordChartLabel}
            x={CHART_WIDTH}
            y={curriculumY - 7}
            textAnchor="end"
          >
            Live curriculum · {CURRICULUM_TOTAL}
          </text>

          <path className={styles.recordChartArea} d={areaPath} />
          <path className={styles.recordChartLine} d={linePath} fill="none" />

          <line
            className={styles.recordChartMarker}
            x1={revisionX}
            y1={revisionY}
            x2={revisionX}
            y2={CHART_HEIGHT}
            strokeDasharray="3 3"
          />
          <text
            className={styles.recordChartMarkerLabel}
            x={revisionX}
            y={revisionY - 10}
            textAnchor="middle"
          >
            {REVISED_LESSON_COUNT} revised, redone
          </text>

          {points.map((point, index) => (
            <circle
              key={point[0]}
              className={
                index === lastIndex
                  ? styles.recordChartPointToday
                  : styles.recordChartPoint
              }
              cx={point[0]}
              cy={point[1]}
              r={index === lastIndex ? 4 : 2.2}
            />
          ))}
          <text
            className={styles.recordChartToday}
            x={CHART_WIDTH}
            y={(points[lastIndex]?.[1] ?? 0) - 11}
            textAnchor="end"
          >
            Completed · {completedToday}
          </text>

          <text
            className={styles.recordChartAxis}
            x={0}
            y={CHART_HEIGHT + 23}
          >
            12 weeks ago
          </text>
          <text
            className={styles.recordChartAxis}
            x={CHART_WIDTH}
            y={CHART_HEIGHT + 23}
            textAnchor="end"
          >
            Today
          </text>
        </svg>
      </div>

      <p className={styles.recordCaption}>
        {completedToday} of {CURRICULUM_TOTAL} lessons complete, up{" "}
        {completedGain} over twelve weeks. In week{" "}
        {REVISION_WEEK_INDEX + 1} the curriculum changed and{" "}
        {REVISED_LESSON_COUNT} lessons were redone, so the record stayed
        current rather than climbing that week.
      </p>
    </div>
  )
}
