import * as React from "react"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"
import { LogoGwthMark } from "@/components/marketing/redesign/logo-gwth"
import { ScoreExplainer } from "@/components/marketing/score-explainer/score-explainer"
import { EXAMPLE_SCORE_HISTORY } from "@/components/marketing/score-vis/example-data"
import {
  QrCode,
  DEMO_SCORE_URL,
  DEMO_SCORE_URL_DISPLAY,
} from "@/components/marketing/hero/qr-code"
import { computeScoreTrend, formatDeltaAbs } from "@/lib/score-trend"
import { getPercentileLabel } from "@/lib/progress/gwth-score"
import { cn } from "@/lib/utils"

/**
 * Hero device — a browser-frame mock containing a faux profile card
 * with a share-ticker-style score readout: big score number, tier
 * pill ("Top 1%"), and a trend pill showing the 3-month delta with
 * an up/down arrow (or "Stable" when |Δ| < 3 score points). The
 * collapsible <ScoreExplainer> beneath surfaces the credibility
 * argument without competing for attention.
 *
 * Variant C ("Ticker + tier badge") was chosen 2026-05-08 from the
 * `/score-card-variants` comparison page. The percentage delta is
 * intentionally hidden because the tier pill already communicates
 * relative magnitude.
 *
 * No entrance animation — keeps LCP on the H1.
 */
export function HeroDevice() {
  const trend = computeScoreTrend(EXAMPLE_SCORE_HISTORY)
  const tierLabel = getPercentileLabel(trend.current).replace(
    " trajectory",
    ""
  )
  const trendStyle =
    trend.direction === "up"
      ? { icon: TrendingUp, color: "text-success", srLabel: "trending up" }
      : trend.direction === "down"
        ? {
            icon: TrendingDown,
            color: "text-destructive",
            srLabel: "trending down",
          }
        : { icon: Minus, color: "text-muted-foreground", srLabel: "stable" }
  const TrendIcon = trendStyle.icon

  return (
    <figure data-role="hero-device" className="relative w-full max-w-md">
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
          <span
            data-role="score-card-url"
            className="ml-3 truncate rounded-md bg-muted px-2 py-1 font-mono text-[11px] text-muted-foreground"
          >
            {DEMO_SCORE_URL_DISPLAY}
          </span>
        </div>

        <div className="space-y-4 p-5">
          <div className="flex items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-sm font-semibold text-primary-foreground">
                AE
              </div>
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold text-foreground">
                  Alex Example
                </div>
                <div className="truncate text-xs text-muted-foreground">
                  Operations Lead · UK
                </div>
              </div>
            </div>
            <div
              data-role="score-card-verify"
              className="shrink-0 rounded-md border border-border bg-card p-1.5 text-foreground"
            >
              <QrCode
                value={DEMO_SCORE_URL}
                size={56}
                title={`Scan to open ${DEMO_SCORE_URL_DISPLAY}`}
              />
            </div>
          </div>

          <div className="relative rounded-xl border border-border bg-muted/40 p-5">
            <span
              data-role="score-card-example-pill"
              className="absolute right-3.5 top-3.5 rounded-full bg-muted px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.08em] text-muted-foreground"
            >
              Example
            </span>

            <div
              className="mb-4 flex flex-col items-center gap-2"
              data-role="score-card-brand"
            >
              <LogoGwthMark className="size-9" />
              <span className="text-[14px] font-bold uppercase tracking-[0.16em] text-foreground">
                GWTH Score
              </span>
            </div>

            <div
              className="flex flex-col items-center gap-2 py-2"
              data-role="score-card-readout"
            >
              <div className="flex items-baseline gap-3">
                <span
                  data-role="score-card-value"
                  className="text-7xl font-bold tabular-nums tracking-[-0.025em] text-foreground"
                >
                  {trend.current}
                </span>
                <span
                  data-role="score-card-tier"
                  className="rounded-full border border-primary/40 bg-primary/10 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-[0.14em] text-primary"
                >
                  {tierLabel}
                </span>
              </div>

              <span
                data-role="score-card-trend"
                className={cn(
                  "inline-flex items-center gap-1.5 text-sm font-semibold tabular-nums",
                  trendStyle.color
                )}
              >
                <TrendIcon className="size-4" aria-hidden="true" />
                <span className="sr-only">{trendStyle.srLabel}</span>
                {trend.direction === "stable"
                  ? "Stable"
                  : formatDeltaAbs(trend.deltaAbs)}
              </span>

              <span className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                vs 3 months ago
              </span>
            </div>

            <div className="mt-4">
              <ScoreExplainer />
            </div>
          </div>
        </div>
      </div>

      <figcaption className="mt-3 text-center text-xs italic text-muted-foreground">
        Illustrative — your actual GWTH Score reflects verified work.
      </figcaption>
    </figure>
  )
}
