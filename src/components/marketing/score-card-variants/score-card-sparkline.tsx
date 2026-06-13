import { computeScoreTrend, type ScoreTrendDirection } from "@/lib/score-trend"
import {
  ScoreCardHeader,
  ScoreTrendPill,
  type ScoreCardProps,
} from "./score-card-shared"

const SPARKLINE_WIDTH = 320
const SPARKLINE_HEIGHT = 56
const SPARKLINE_PADDING = 4

/**
 * Render a tiny SVG sparkline from a score history. The line is
 * coloured by the trend direction so the chart visually agrees with
 * the trend pill above it.
 */
function Sparkline({
  history,
  direction,
}: {
  history: readonly number[]
  direction: ScoreTrendDirection
}) {
  if (history.length < 2) return null
  const min = Math.min(...history)
  const max = Math.max(...history)
  const range = max - min || 1
  const innerW = SPARKLINE_WIDTH - SPARKLINE_PADDING * 2
  const innerH = SPARKLINE_HEIGHT - SPARKLINE_PADDING * 2
  const points = history.map((v, i) => {
    const x = SPARKLINE_PADDING + (i / (history.length - 1)) * innerW
    const y =
      SPARKLINE_PADDING + innerH - ((v - min) / range) * innerH
    return `${x.toFixed(2)},${y.toFixed(2)}`
  })
  const stroke =
    direction === "up"
      ? "var(--success)"
      : direction === "down"
        ? "var(--destructive)"
        : "var(--muted-foreground)"
  return (
    <svg
      viewBox={`0 0 ${SPARKLINE_WIDTH} ${SPARKLINE_HEIGHT}`}
      width="100%"
      height={SPARKLINE_HEIGHT}
      preserveAspectRatio="none"
      role="presentation"
      aria-hidden="true"
      className="block"
    >
      <polyline
        points={points.join(" ")}
        fill="none"
        stroke={stroke}
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/**
 * Variant B — Ticker plus tiny sparkline. Same headline number /
 * trend pill as the minimal variant, with a small directional
 * sparkline beneath that visually echoes the trend direction.
 */
export function ScoreCardSparkline({
  history,
  periodLabel = "vs 3 months ago",
}: ScoreCardProps) {
  const trend = computeScoreTrend(history)
  return (
    <div className="space-y-5">
      <ScoreCardHeader />
      <div className="flex flex-col items-center gap-2">
        <span className="text-7xl font-bold tabular-nums tracking-[-0.025em] text-foreground">
          {trend.current}
        </span>
        <ScoreTrendPill trend={trend} />
      </div>
      <div>
        <Sparkline history={history} direction={trend.direction} />
        <div className="mt-1 flex justify-between font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
          <span>3 months ago</span>
          <span>{periodLabel === "vs 3 months ago" ? "today" : "today"}</span>
        </div>
      </div>
    </div>
  )
}
