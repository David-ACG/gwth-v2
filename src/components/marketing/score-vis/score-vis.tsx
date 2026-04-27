"use client"

import * as React from "react"
import { motion, useReducedMotion } from "motion/react"
import { cn } from "@/lib/utils"
import { EXAMPLE_SUB_SCORES } from "./example-data"

export type ScoreVisSize = "sm" | "md" | "lg"

export type ScoreVisProps = {
  /** Current score value (0..130). 100 is the pass line by default. */
  value: number
  /** Pass-line threshold; defaults to 100. Bonus halo fills 100..130. */
  passLine?: number
  /** History points used to render the 30-day sparkline. */
  history?: readonly number[]
  /** Size preset. sm=120px / md=180px / lg=240px outer ring. */
  size?: ScoreVisSize
  /** Override the auto-derived ARIA label. */
  ariaLabel?: string
  /** Optional className passed to the root container. */
  className?: string
}

const SIZE_CONFIG: Record<ScoreVisSize, { outer: number; ring: number; stroke: number }> = {
  sm: { outer: 120, ring: 48, stroke: 10 },
  md: { outer: 180, ring: 72, stroke: 12 },
  lg: { outer: 240, ring: 96, stroke: 14 },
}

const SPARKLINE_WIDTH = 120
const SPARKLINE_HEIGHT = 24
const SPARKLINE_RANGE_MIN = 60
const SPARKLINE_RANGE_MAX = 130

const clamp = (n: number, lo: number, hi: number): number => Math.max(lo, Math.min(hi, n))

const subtitleFor = (value: number, passLine: number, history: readonly number[]): string => {
  if (history.length >= 2) {
    const prev = history[history.length - 2]
    const last = history[history.length - 1]
    if (prev >= passLine && last < passLine) return "Decaying"
  }
  return value >= passLine ? "Passing" : "Building"
}

const buildSparklinePath = (history: readonly number[]): string => {
  if (history.length === 0) return ""
  const stepX = history.length > 1 ? SPARKLINE_WIDTH / (history.length - 1) : SPARKLINE_WIDTH
  const range = SPARKLINE_RANGE_MAX - SPARKLINE_RANGE_MIN
  return history
    .map((v, i) => {
      const x = i * stepX
      const norm = (clamp(v, SPARKLINE_RANGE_MIN, SPARKLINE_RANGE_MAX) - SPARKLINE_RANGE_MIN) / range
      const y = SPARKLINE_HEIGHT - norm * SPARKLINE_HEIGHT
      return `${i === 0 ? "M" : "L"}${x.toFixed(2)} ${y.toFixed(2)}`
    })
    .join(" ")
}

const sparklineYForValue = (v: number): number => {
  const range = SPARKLINE_RANGE_MAX - SPARKLINE_RANGE_MIN
  const norm = (clamp(v, SPARKLINE_RANGE_MIN, SPARKLINE_RANGE_MAX) - SPARKLINE_RANGE_MIN) / range
  return SPARKLINE_HEIGHT - norm * SPARKLINE_HEIGHT
}

const lastSegmentDecays = (history: readonly number[], passLine: number): boolean => {
  if (history.length < 2) return false
  const prev = history[history.length - 2]
  const last = history[history.length - 1]
  return prev >= passLine && last < passLine
}

/**
 * Freshness Ring + Sparkline score widget.
 *
 * Shows the current score as a stroked SVG arc that fills 0 → passLine.
 * When `value > passLine`, a second halo arc overlays the bonus zone
 * (100 → 130). Beneath the ring, a 30-day sparkline draws history with
 * a pass-line reference and an amber decay segment when the most recent
 * point crosses the pass-line downward.
 *
 * Respects `prefers-reduced-motion` for the pulse-on-crossing animation
 * and the sparkline progressive draw.
 *
 * The "Example score" pill in the top-right and the visually-hidden
 * sub-score `<dl>` keep the widget honest about the placeholder data
 * (see ./example-data.ts).
 */
export function ScoreVis({
  value,
  passLine = 100,
  history = [],
  size = "md",
  ariaLabel,
  className,
}: ScoreVisProps) {
  const prefersReduced = useReducedMotion()
  const cfg = SIZE_CONFIG[size]
  const r = cfg.ring
  const C = 2 * Math.PI * r
  const center = cfg.outer / 2

  const primaryFraction = clamp(value / passLine, 0, 1)
  const primaryOffset = C * (1 - primaryFraction)
  const overflow = value > passLine
  const haloFraction = clamp((value - passLine) / 30, 0, 1)
  const haloOffset = C * (1 - haloFraction)

  const subtitle = subtitleFor(value, passLine, history)
  const decay = lastSegmentDecays(history, passLine)
  const sparkPath = buildSparklinePath(history)
  const passLineY = sparklineYForValue(passLine)

  const decaySegmentPath = (() => {
    if (!decay || history.length < 2) return null
    const stepX = history.length > 1 ? SPARKLINE_WIDTH / (history.length - 1) : SPARKLINE_WIDTH
    const i = history.length - 1
    const xPrev = (i - 1) * stepX
    const xLast = i * stepX
    const yPrev = sparklineYForValue(history[i - 1])
    const yLast = sparklineYForValue(history[i])
    return `M${xPrev.toFixed(2)} ${yPrev.toFixed(2)} L${xLast.toFixed(2)} ${yLast.toFixed(2)}`
  })()

  const stateLabel = value >= passLine ? "currently passing" : "currently below pass line"
  const computedAriaLabel =
    ariaLabel ??
    `GWTH Score example: ${value} out of ${passLine}, ${stateLabel}. Illustrative only.`

  const ringSvg = (
    <svg
      width={cfg.outer}
      height={cfg.outer}
      viewBox={`0 0 ${cfg.outer} ${cfg.outer}`}
      aria-hidden="true"
      className="block"
    >
      <circle
        cx={center}
        cy={center}
        r={r}
        fill="none"
        stroke="var(--muted)"
        strokeWidth={cfg.stroke}
      />
      <circle
        data-role="score-ring-progress"
        cx={center}
        cy={center}
        r={r}
        fill="none"
        stroke="var(--primary)"
        strokeWidth={cfg.stroke}
        strokeLinecap="round"
        strokeDasharray={C}
        strokeDashoffset={primaryOffset}
        transform={`rotate(-90 ${center} ${center})`}
      />
      {overflow && (
        <circle
          data-role="score-halo"
          cx={center}
          cy={center}
          r={r}
          fill="none"
          stroke="var(--accent)"
          strokeWidth={cfg.stroke}
          strokeLinecap="round"
          strokeDasharray={C}
          strokeDashoffset={haloOffset}
          opacity={0.85}
          transform={`rotate(-90 ${center} ${center})`}
        />
      )}
    </svg>
  )

  const ringWrapper = prefersReduced ? (
    <div data-role="score-pulse" className="relative">
      {ringSvg}
    </div>
  ) : (
    <motion.div
      data-role="score-pulse"
      key={value >= passLine ? "pass" : "fail"}
      initial={{ scale: 1 }}
      animate={{ scale: [1, 1.05, 1] }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="relative"
    >
      {ringSvg}
    </motion.div>
  )

  return (
    <div
      role="img"
      aria-label={computedAriaLabel}
      className={cn("relative inline-flex flex-col items-center gap-3", className)}
      style={{ fontFeatureSettings: "'tnum'" }}
    >
      <span className="absolute right-0 top-0 rounded-full bg-muted/80 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
        Example score
      </span>

      <div className="relative" style={{ width: cfg.outer, height: cfg.outer }}>
        {ringWrapper}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="font-semibold leading-none text-foreground"
            style={{
              fontFeatureSettings: "'tnum'",
              fontSize: size === "lg" ? "3.5rem" : size === "md" ? "2.75rem" : "1.75rem",
            }}
          >
            {value}
          </span>
          <span className="mt-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {subtitle}
          </span>
        </div>
      </div>

      <svg
        data-role="sparkline"
        width={SPARKLINE_WIDTH}
        height={SPARKLINE_HEIGHT}
        viewBox={`0 0 ${SPARKLINE_WIDTH} ${SPARKLINE_HEIGHT}`}
        aria-hidden="true"
        className="block"
      >
        <line
          x1={0}
          x2={SPARKLINE_WIDTH}
          y1={passLineY}
          y2={passLineY}
          stroke="var(--muted-foreground)"
          strokeWidth={1}
          strokeDasharray="2 3"
          opacity={0.6}
        />
        {sparkPath && !prefersReduced && (
          <motion.path
            d={sparkPath}
            fill="none"
            stroke="var(--primary)"
            strokeWidth={1.5}
            strokeLinejoin="round"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          />
        )}
        {sparkPath && prefersReduced && (
          <path
            d={sparkPath}
            fill="none"
            stroke="var(--primary)"
            strokeWidth={1.5}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        )}
        {decaySegmentPath && (
          <path
            data-role="sparkline-decay"
            d={decaySegmentPath}
            fill="none"
            stroke="var(--warning)"
            strokeWidth={2}
            strokeLinecap="round"
          />
        )}
      </svg>

      <dl className="sr-only">
        {EXAMPLE_SUB_SCORES.map((s) => (
          <div key={s.label}>
            <dt>{s.label}</dt>
            <dd>{s.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
