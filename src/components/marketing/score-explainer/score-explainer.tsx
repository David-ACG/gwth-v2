"use client"

import * as React from "react"
import { ChevronDown, RefreshCw, Hammer, CheckCircle2, Calendar, AlertTriangle } from "lucide-react"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  TOTAL_MANDATORY_LESSONS,
  TOTAL_OPTIONAL_LESSONS,
  TOTAL_COURSE_MONTHS,
} from "@/lib/config"
import { cn } from "@/lib/utils"

const TOTAL_HANDS_ON = TOTAL_MANDATORY_LESSONS + TOTAL_OPTIONAL_LESSONS

/**
 * Inline emphasised number — primary-coloured, bold, tabular-nums so the
 * digits don't reflow on hover.
 */
function Num({ children }: { children: React.ReactNode }) {
  return <span className="font-bold tabular-nums text-primary">{children}</span>
}

type Tone = "primary" | "accent" | "warning"

type Bullet = {
  Icon: React.ComponentType<{ className?: string; strokeWidth?: number }>
  tone: Tone
  key: string
  body: React.ReactNode
}

/**
 * Five locked bullets — the credibility argument for the score. Numbers
 * derive from src/lib/config.ts so any change to course shape is
 * reflected here automatically. Copy is locked from the v2 mock at
 * kanban/design-artefacts/2026-04-27/score-variants/variant-B-ring/option-2-collapsible.html.
 */
const BULLETS: readonly Bullet[] = [
  {
    Icon: RefreshCw,
    tone: "primary",
    key: "Always current.",
    body: "Lessons update constantly so students stay on the cutting edge — and the score decays if they don't keep up.",
  },
  {
    Icon: Hammer,
    tone: "accent",
    key: "Hands-on, not lectured.",
    body: (
      <>
        Reaching <Num>100</Num> means completing <Num>{TOTAL_HANDS_ON}</Num>+ hands-on
        projects across {TOTAL_COURSE_MONTHS} modules — no passive watching.
      </>
    ),
  },
  {
    Icon: CheckCircle2,
    tone: "primary",
    key: "Tested, not assumed.",
    body: (
      <>
        Every lesson has check questions; the course requires <Num>3</Num> capstone
        projects to graduate.
      </>
    ),
  },
  {
    Icon: Calendar,
    tone: "accent",
    key: "Paced, not crammed.",
    body: (
      <>
        The course is <Num>{TOTAL_COURSE_MONTHS} months</Num>; lessons release in
        stages — no shortcuts, no rushing through.
      </>
    ),
  },
  {
    Icon: AlertTriangle,
    tone: "warning",
    key: "A high score is a recent score.",
    body: (
      <>
        Above <Num>100</Num> means top 1% of applied-AI practitioners <em>today</em>,
        not when they enrolled.
      </>
    ),
  },
] as const

/**
 * Collapsible employer-credibility panel mounted under the ScoreVis sparkline
 * inside the hero device. Defaults to collapsed; expands on click/keyboard
 * activation to reveal the five reasons the GWTH Score is credible to an
 * employer reviewing a candidate.
 */
export function ScoreExplainer({ className }: { className?: string }) {
  return (
    <Collapsible className={cn("w-full", className)} data-role="score-explainer">
      <CollapsibleTrigger
        className="group flex w-full items-center justify-between gap-3 rounded-lg border border-border bg-card px-3.5 py-2.5 text-left transition-all hover:border-primary hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring data-[state=open]:border-primary data-[state=open]:bg-primary/5"
        data-role="score-explainer-trigger"
      >
        <span className="flex items-center gap-2.5">
          <span className="grid size-5 place-items-center rounded-md bg-gradient-to-br from-primary/15 to-accent/15 text-primary">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
              className="size-3"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
          </span>
          <span className="flex flex-col gap-0.5">
            <span className="text-xs font-semibold leading-tight">
              What this score tells an employer
            </span>
            <span className="text-[10px] font-medium leading-tight tracking-wide text-muted-foreground">
              5 reasons it&apos;s credible
            </span>
          </span>
        </span>
        <ChevronDown
          className="size-4 text-muted-foreground transition-transform duration-300 group-data-[state=open]:rotate-180 group-data-[state=open]:text-primary"
          aria-hidden="true"
        />
      </CollapsibleTrigger>
      <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
        <ul
          className="mt-3 flex flex-col gap-3"
          data-role="score-explainer-bullets"
        >
          {BULLETS.map(({ Icon, tone, key, body }) => (
            <li key={key} className="flex items-start gap-3 text-xs leading-relaxed">
              <span
                className={cn(
                  "grid size-7 shrink-0 place-items-center rounded-md",
                  tone === "primary" && "bg-primary/10 text-primary",
                  tone === "accent" && "bg-accent/10 text-accent",
                  tone === "warning" && "bg-warning/15 text-warning"
                )}
              >
                <Icon className="size-3.5" strokeWidth={2} />
              </span>
              <span>
                <span className="font-semibold">{key}</span> {body}
              </span>
            </li>
          ))}
        </ul>
      </CollapsibleContent>
    </Collapsible>
  )
}
