import * as React from "react"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"
import { LogoGwthMark } from "@/components/marketing/redesign/logo-gwth"
import {
  formatDeltaAbs,
  formatDeltaPct,
  type ScoreTrend,
  type ScoreTrendDirection,
} from "@/lib/score-trend"
import { cn } from "@/lib/utils"

/**
 * Shared props consumed by every score-card variant on the
 * comparison page. The variants all share the same data contract so
 * a chosen winner can be ported back into HeroDevice without
 * touching call-sites.
 */
export type ScoreCardProps = {
  /** Most recent score (also the last value in `history`). */
  value: number
  /** Score history, oldest first / newest last. ≥ 1 entry. */
  history: readonly number[]
  /** Static "Top 1%" / "Top 5%" tier label, shown on the tier variant. */
  tierLabel: string
  /** Period label rendered alongside the delta, e.g. "vs 3 months ago". */
  periodLabel?: string
  className?: string
}

/**
 * Map a trend direction to the matching colour token, lucide icon,
 * and screen-reader text. Centralised so all variants stay in sync.
 *
 * Colours use OKLCH custom-property tokens from `globals.css`:
 *   up     -> --success (green)
 *   down   -> --destructive (red)
 *   stable -> --muted-foreground (neutral grey)
 */
export function trendStyling(direction: ScoreTrendDirection): {
  Icon: typeof TrendingUp
  colorClass: string
  srLabel: string
} {
  switch (direction) {
    case "up":
      return {
        Icon: TrendingUp,
        colorClass: "text-success",
        srLabel: "trending up",
      }
    case "down":
      return {
        Icon: TrendingDown,
        colorClass: "text-destructive",
        srLabel: "trending down",
      }
    case "stable":
      return {
        Icon: Minus,
        colorClass: "text-muted-foreground",
        srLabel: "stable",
      }
  }
}

/**
 * Browser-frame mock used by the comparison page so each variant
 * sits inside the same gwth.ai/score chrome. Mirrors the frame from
 * `HeroDevice` so the chosen variant ports back without surprises.
 */
export function ScoreCardFrame({
  variantLabel,
  children,
}: {
  variantLabel: string
  children: React.ReactNode
}) {
  return (
    <figure className="relative w-full max-w-md">
      <div className="rounded-2xl border border-border bg-card shadow-xl">
        <div className="flex items-center gap-2 border-b border-border px-4 py-3">
          <span
            className="size-2.5 rounded-full bg-destructive/70"
            aria-hidden="true"
          />
          <span
            className="size-2.5 rounded-full bg-warning/70"
            aria-hidden="true"
          />
          <span
            className="size-2.5 rounded-full bg-success/70"
            aria-hidden="true"
          />
          <span className="ml-3 truncate rounded-md bg-muted px-2 py-1 font-mono text-[11px] text-muted-foreground">
            gwth.ai/score
          </span>
        </div>
        <div className="p-5">{children}</div>
      </div>
      <figcaption className="mt-2 text-center font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
        {variantLabel}
      </figcaption>
    </figure>
  )
}

/**
 * Header block shared by every variant — small G-mark + "GWTH Score"
 * label + Example pill. Identical to the HeroDevice scoreboard header
 * so the chosen variant ports back unchanged.
 */
export function ScoreCardHeader() {
  return (
    <div className="relative">
      <span className="absolute right-0 top-0 rounded-full bg-muted px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
        Example
      </span>
      <div className="flex flex-col items-center gap-1.5">
        <LogoGwthMark className="size-8" />
        <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-muted-foreground">
          GWTH Score
        </span>
      </div>
    </div>
  )
}

/**
 * Inline trend pill — `[icon] +8  +8.3%` / `— stable` / `▼ -25 -20.8%`.
 * Always reflects the latest delta against the earliest history
 * point. Pulled out so each card variant renders identical pill UX.
 *
 * `showPercent` defaults to true; pass false on cards that already
 * surface a tier badge ("Top 1%") so the absolute delta and the tier
 * carry the magnitude story without redundant duplication.
 */
export function ScoreTrendPill({
  trend,
  size = "md",
  showPercent = true,
}: {
  trend: ScoreTrend
  size?: "sm" | "md"
  showPercent?: boolean
}) {
  const { Icon, colorClass, srLabel } = trendStyling(trend.direction)
  const fontSize = size === "sm" ? "text-[12px]" : "text-sm"
  const iconSize = size === "sm" ? "size-3.5" : "size-4"
  if (trend.direction === "stable") {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 font-semibold tabular-nums",
          fontSize,
          colorClass
        )}
      >
        <Icon className={iconSize} aria-hidden="true" />
        <span className="sr-only">{srLabel}</span>
        Stable
      </span>
    )
  }
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 font-semibold tabular-nums",
        fontSize,
        colorClass
      )}
    >
      <Icon className={iconSize} aria-hidden="true" />
      <span className="sr-only">{srLabel}</span>
      {formatDeltaAbs(trend.deltaAbs)}
      {showPercent && (
        <span className="opacity-70">{formatDeltaPct(trend.deltaPct)}</span>
      )}
    </span>
  )
}
