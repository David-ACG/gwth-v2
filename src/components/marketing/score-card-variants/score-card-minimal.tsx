import { computeScoreTrend } from "@/lib/score-trend"
import {
  ScoreCardHeader,
  ScoreTrendPill,
  type ScoreCardProps,
} from "./score-card-shared"

/**
 * Variant A — Minimal ticker. Headline number, trend pill below,
 * period label as footnote. No chart, no tier badge. Closest visual
 * cousin to a Robinhood lock-screen widget.
 */
export function ScoreCardMinimal({
  history,
  periodLabel = "vs 3 months ago",
}: ScoreCardProps) {
  const trend = computeScoreTrend(history)
  return (
    <div className="space-y-5">
      <ScoreCardHeader />
      <div className="flex flex-col items-center gap-2 py-4">
        <span className="text-7xl font-bold tabular-nums tracking-[-0.025em] text-foreground">
          {trend.current}
        </span>
        <ScoreTrendPill trend={trend} />
        <span className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
          {periodLabel}
        </span>
      </div>
    </div>
  )
}
