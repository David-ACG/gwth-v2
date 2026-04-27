"use client"

import * as React from "react"
import { ScoreVis } from "@/components/marketing/score-vis/score-vis"
import {
  EXAMPLE_SCORE_VALUE,
  EXAMPLE_SCORE_HISTORY,
} from "@/components/marketing/score-vis/example-data"

/**
 * Hero device — a browser-frame mock containing a faux profile card with
 * the ScoreVis widget at the centre.
 *
 * The static frame renders synchronously with no entrance animation so
 * it does not shift LCP off the H1. Only the ScoreVis ring fill and
 * sparkline draw animate, and both are gated on prefers-reduced-motion.
 *
 * The figcaption beneath keeps the placeholder data honest — see the
 * 'Example score' pill rendered inside ScoreVis itself.
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

          <div className="rounded-xl border border-border bg-muted/40 p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                GWTH Dynamic Score
              </span>
              <span
                data-mask="date"
                className="font-mono text-[10px] text-muted-foreground"
              >
                live · updated today
              </span>
            </div>

            <div className="flex justify-center">
              <ScoreVis
                value={EXAMPLE_SCORE_VALUE}
                history={EXAMPLE_SCORE_HISTORY}
                size="md"
              />
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
