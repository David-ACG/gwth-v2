"use client"

import * as React from "react"
import { motion, useReducedMotion } from "motion/react"

const STEPS = [
  "Loaded 247 invoices from /Q1-2026",
  "12 flagged over £2,000 threshold",
  "4 suppliers past 30-day terms",
  "4 chase emails drafted · ready to review",
] as const

const STAGGER_SECONDS = 0.2

/**
 * PromptVis — invoice-triage workflow demo. The user prompt arrives as a
 * static block; the workflow steps reveal sequentially when the card
 * scrolls into view (~200ms stagger).
 *
 * When prefers-reduced-motion is set the steps render in their final
 * state immediately and no animation props are applied.
 */
export function PromptVis() {
  const prefersReduced = useReducedMotion()
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => {
    setMounted(true)
  }, [])
  // Render the static (non-animated) variant until mount so the SSR/hydration
  // pass and the first client paint are visually identical. Without this the
  // motion.li children land with `initial={{ opacity: 0 }}` inline styles for
  // a frame, which causes mobile snapshot flake.
  const animate = mounted && !prefersReduced

  return (
    <div
      data-section="prompt-vis"
      className="rounded-2xl border border-border bg-card p-5 shadow-sm"
    >
      <div className="flex items-center gap-3 border-b border-border pb-3">
        <span className="flex items-center gap-1" aria-hidden="true">
          <span className="size-2 rounded-full bg-destructive/70" />
          <span className="size-2 rounded-full bg-warning/70" />
          <span className="size-2 rounded-full bg-success/70" />
        </span>
        <span className="font-mono text-xs uppercase tracking-wide text-muted-foreground">
          lab 06 · invoice triage
        </span>
      </div>

      <div className="mt-4 space-y-4">
        <div data-role="prompt-user" className="rounded-xl bg-muted/60 p-4">
          <span className="font-mono text-[10px] uppercase tracking-wide text-muted-foreground">
            You
          </span>
          <p className="mt-2 text-sm text-foreground">
            Take last quarter&apos;s invoices, flag anything over £2,000, and draft a
            chase email to suppliers we&apos;ve not paid in 30 days.
          </p>
        </div>

        <div data-role="prompt-ai" className="rounded-xl border border-border bg-background p-4">
          <span className="font-mono text-[10px] uppercase tracking-wide text-muted-foreground">
            Workflow
          </span>
          <ol className="mt-3 space-y-2">
            {STEPS.map((step, i) => {
              const isFinal = i === STEPS.length - 1
              const stepClass =
                "flex items-start gap-2 text-sm text-foreground"
              const dotClass = `mt-1 inline-block size-1.5 shrink-0 rounded-full ${
                isFinal ? "bg-accent" : "bg-primary"
              }`
              if (!animate) {
                return (
                  <li key={step} data-testid="prompt-step" className={stepClass}>
                    <span className={dotClass} aria-hidden="true" />
                    <span>{step}</span>
                  </li>
                )
              }
              return (
                <motion.li
                  key={step}
                  data-testid="prompt-step"
                  className={stepClass}
                  initial={{ opacity: 0, y: 6 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.4 }}
                  transition={{ duration: 0.35, delay: i * STAGGER_SECONDS }}
                >
                  <span className={dotClass} aria-hidden="true" />
                  <span>{step}</span>
                </motion.li>
              )
            })}
          </ol>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
        <span className="font-mono text-[10px] uppercase tracking-wide text-muted-foreground">
          Plain English in · no Python
        </span>
        <span className="font-mono text-xs text-muted-foreground">2m 14s</span>
      </div>
    </div>
  )
}
