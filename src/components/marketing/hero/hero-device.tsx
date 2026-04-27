"use client"

import * as React from "react"
import Image from "next/image"
import { useTheme } from "next-themes"
import { ScoreVis } from "@/components/marketing/score-vis/score-vis"
import { ScoreExplainer } from "@/components/marketing/score-explainer/score-explainer"
import {
  EXAMPLE_SCORE_VALUE,
  EXAMPLE_SCORE_HISTORY,
} from "@/components/marketing/score-vis/example-data"

/**
 * Theme-aware GWTH brand mark. Renders /icon-light.png in light mode
 * (and during SSR / first paint to avoid hydration mismatch) and
 * /icon.png in dark mode.
 */
function GwthMark() {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => setMounted(true), [])
  const src = mounted && resolvedTheme === "dark" ? "/icon.png" : "/icon-light.png"
  return (
    <Image
      src={src}
      alt="GWTH"
      width={32}
      height={32}
      className="size-8"
      priority
    />
  )
}

/**
 * Hero device — a browser-frame mock containing a faux profile card with
 * the v2 ScoreVis widget at the centre. Adds a GWTH brand-mark header
 * above the ring and mounts the collapsible <ScoreExplainer> beneath the
 * sparkline so visitors can drill into the credibility argument without
 * the panel competing with the score for attention.
 *
 * The static frame renders synchronously with no entrance animation so
 * it does not shift LCP off the H1. Only the ScoreVis ring fill and
 * sparkline draw animate, and both are gated on prefers-reduced-motion.
 *
 * The figcaption beneath keeps the placeholder data honest — see the
 * "Illustrative" caveat for visitors.
 */
export function HeroDevice() {
  return (
    <figure data-role="hero-device" className="relative w-full max-w-md">
      <div className="rounded-2xl border border-border bg-card shadow-xl">
        <div className="flex items-center gap-2 border-b border-border px-4 py-3">
          <span className="size-2.5 rounded-full bg-destructive/70" aria-hidden="true" />
          <span className="size-2.5 rounded-full bg-warning/70" aria-hidden="true" />
          <span className="size-2.5 rounded-full bg-success/70" aria-hidden="true" />
          <span className="ml-3 truncate rounded-md bg-muted px-2 py-1 font-mono text-[11px] text-muted-foreground">
            gwth.ai/dashboard
          </span>
        </div>

        <div className="space-y-4 p-5">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-sm font-semibold text-primary-foreground">
              AE
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold text-foreground">Alex Example</div>
              <div className="truncate text-xs text-muted-foreground">
                Operations Lead · UK
              </div>
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
              className="mb-3 flex flex-col items-center gap-1.5"
              data-role="score-card-brand"
            >
              <GwthMark />
              <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-muted-foreground">
                GWTH Score
              </span>
            </div>

            <div className="flex justify-center">
              <ScoreVis
                value={EXAMPLE_SCORE_VALUE}
                history={EXAMPLE_SCORE_HISTORY}
                size="md"
              />
            </div>

            <div className="mt-1 flex justify-between font-mono text-[10px] text-muted-foreground">
              <span>3 months ago</span>
              <span>today</span>
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
