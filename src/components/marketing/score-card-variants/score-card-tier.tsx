import { computeScoreTrend } from "@/lib/score-trend"
import {
  ScoreCardHeader,
  ScoreTrendPill,
  type ScoreCardProps,
} from "./score-card-shared"

/**
 * Variant C — Ticker plus tier badge. Drops the chart entirely; the
 * tier label (e.g. "TOP 1%") sits beside the headline score so the
 * card answers "how good is this number" without visual clutter.
 */
export function ScoreCardTier({
  history,
  tierLabel,
  periodLabel = "vs 3 months ago",
}: ScoreCardProps) {
  const trend = computeScoreTrend(history)
  return (
    <div className="space-y-5">
      <ScoreCardHeader />
      <div className="flex flex-col items-center gap-2 py-4">
        <div className="flex items-baseline gap-3">
          <span className="text-7xl font-bold tabular-nums tracking-[-0.025em] text-foreground">
            {trend.current}
          </span>
          <span className="rounded-full border border-primary/40 bg-primary/10 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-[0.14em] text-primary">
            {tierLabel}
          </span>
        </div>
        <ScoreTrendPill trend={trend} showPercent={false} />
        <span className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
          {periodLabel}
        </span>
      </div>
    </div>
  )
}
