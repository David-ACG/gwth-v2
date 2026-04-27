"use client"

import * as React from "react"
import { motion, useReducedMotion } from "motion/react"
import { cn } from "@/lib/utils"

export type ScoreVisSize = "sm" | "md" | "lg"

export type ScoreVisProps = {
  /** Current score value. 100 is the pass line by default; ladder runs 80/100/130. */
  value: number
  /** Pass-line threshold; defaults to 100. Bonus halo fills 100..130. */
  passLine?: number
  /** History points used to render the 3-month sparkline. */
  history?: readonly number[]
  /** Size preset. sm=120px / md=180px / lg=240px outer ring. */
  size?: ScoreVisSize
  /** Override the auto-derived ARIA label. */
  ariaLabel?: string
  /** Optional className passed to the root container. */
  className?: string
}

const SIZE_CONFIG: Record<
  ScoreVisSize,
  { outer: number; ring: number; stroke: number; sparkW: number; sparkH: number }
> = {
  sm: { outer: 120, ring: 48, stroke: 10, sparkW: 160, sparkH: 56 },
  md: { outer: 180, ring: 72, stroke: 12, sparkW: 220, sparkH: 56 },
  lg: { outer: 240, ring: 96, stroke: 14, sparkW: 280, sparkH: 56 },
}

const PASS_Y = 20
const TOP_Y = 6
const PASS_SCORE = 100
const TOP_SCORE = 145

const clamp = (n: number, lo: number, hi: number): number => Math.max(lo, Math.min(hi, n))

/**
 * Tier subtitle using the locked 80/100/130 ladder. The sparkline
 * shape (and amber decay segment) communicates "slipping" visually,
 * so the label is kept to a static tier name.
 */
const subtitleFor = (value: number): string => {
  if (value >= 130) return "Top 0.5%"
  if (value >= 100) return "Top 1%"
  if (value >= 80) return "Top 5%"
  return "Working towards"
}

const tierKindFor = (value: number): "elite" | "pass" | "muted" => {
  if (value >= 130) return "elite"
  if (value >= 80) return "pass"
  return "muted"
}

const lastSegmentDecays = (history: readonly number[], passLine: number): boolean => {
  if (history.length < 2) return false
  const prev = history[history.length - 2]
  const last = history[history.length - 1]
  if (prev === undefined || last === undefined) return false
  return prev >= passLine && last < passLine
}

/**
 * Freshness Ring + Sparkline score widget (v2).
 *
 * Shows the current score as a stroked SVG arc that fills 0 → passLine
 * (the top-1% line). When `value > passLine`, a second halo arc overlays
 * the bonus zone (100 → 130, top 0.5% tier). Beneath the ring, a 3-month
 * sparkline draws history with a top-1% reference line, a primary→accent
 * gradient fill underneath, and an amber decay segment when the most
 * recent point slips below the pass line.
 *
 * Visual updates over v1:
 *   - Ring stroke uses a primary→accent linear gradient (tier elite).
 *   - Score number uses a primary→accent text gradient.
 *   - Tier label sits inside the ring, below the number.
 *   - Sparkline y-mapping is two-segment piecewise so elite scores reach
 *     the top of the viewBox without clipping the dashed pass-line.
 *
 * Respects `prefers-reduced-motion` for the pulse-on-crossing animation
 * and the sparkline progressive draw.
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
  const sparkW = cfg.sparkW
  const sparkH = cfg.sparkH
  const bottomY = sparkH

  const primaryFraction = clamp(value / passLine, 0, 1)
  const primaryOffset = C * (1 - primaryFraction)
  const overflow = value > passLine
  const haloFraction = clamp((value - passLine) / 30, 0, 1)
  const haloOffset = C * (1 - haloFraction)

  const subtitle = subtitleFor(value)
  const tierKind = tierKindFor(value)
  const decay = lastSegmentDecays(history, passLine)

  // IDs must be size-suffixed so multiple instances on the page don't collide.
  const gradId = `score-ring-grad-${size}`
  const fillGradId = `score-spark-fill-${size}`

  const sparklineYForValue = (v: number): number =>
    v >= PASS_SCORE
      ? PASS_Y - clamp((v - PASS_SCORE) / (TOP_SCORE - PASS_SCORE), 0, 1) * (PASS_Y - TOP_Y)
      : bottomY - clamp(v / PASS_SCORE, 0, 1) * (bottomY - PASS_Y)

  const buildPoints = (hist: readonly number[]): string => {
    if (hist.length === 0) return ""
    const stepX = hist.length > 1 ? sparkW / (hist.length - 1) : sparkW
    return hist
      .map((v, i) => `${(i * stepX).toFixed(2)},${sparklineYForValue(v).toFixed(2)}`)
      .join(" ")
  }

  const buildPath = (hist: readonly number[]): string => {
    if (hist.length === 0) return ""
    const stepX = hist.length > 1 ? sparkW / (hist.length - 1) : sparkW
    return hist
      .map((v, i) => {
        const x = i * stepX
        const y = sparklineYForValue(v)
        return `${i === 0 ? "M" : "L"}${x.toFixed(2)} ${y.toFixed(2)}`
      })
      .join(" ")
  }

  const sparkPath = buildPath(history)
  const sparkPolyPoints = buildPoints(history)
  const sparkFillPolygon = sparkPolyPoints
    ? `${sparkPolyPoints} ${sparkW},${bottomY} 0,${bottomY}`
    : ""
  const passLineY = PASS_Y

  const decaySegmentPath = (() => {
    if (!decay || history.length < 2) return null
    const stepX = history.length > 1 ? sparkW / (history.length - 1) : sparkW
    const i = history.length - 1
    const prevValue = history[i - 1]
    const lastValue = history[i]
    if (prevValue === undefined || lastValue === undefined) return null
    const xPrev = (i - 1) * stepX
    const xLast = i * stepX
    const yPrev = sparklineYForValue(prevValue)
    const yLast = sparklineYForValue(lastValue)
    return `M${xPrev.toFixed(2)} ${yPrev.toFixed(2)} L${xLast.toFixed(2)} ${yLast.toFixed(2)}`
  })()

  const computedAriaLabel =
    ariaLabel ?? `GWTH Score example: ${value}, ${subtitle}. Illustrative only.`

  const ringSvg = (
    <svg
      width={cfg.outer}
      height={cfg.outer}
      viewBox={`0 0 ${cfg.outer} ${cfg.outer}`}
      aria-hidden="true"
      className="block"
    >
      <defs>
        <linearGradient
          id={gradId}
          x1="0%"
          y1="0%"
          x2="100%"
          y2="100%"
          gradientTransform="rotate(45)"
        >
          <stop offset="0%" stopColor="var(--primary)" />
          <stop offset="100%" stopColor="var(--accent)" />
        </linearGradient>
      </defs>
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
        stroke={`url(#${gradId})`}
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
          opacity={0.9}
          style={{ filter: "drop-shadow(0 0 10px oklch(0.65 0.16 165 / 0.45))" }}
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

  const tierClass = cn(
    "mt-1 text-[11px] font-bold uppercase leading-none tracking-[0.06em] tabular-nums",
    tierKind === "elite" &&
      "bg-gradient-to-br from-primary to-accent bg-clip-text text-transparent",
    tierKind === "pass" && "text-success",
    tierKind === "muted" && "text-muted-foreground"
  )

  return (
    <div
      role="img"
      aria-label={computedAriaLabel}
      className={cn("relative inline-flex flex-col items-center gap-3", className)}
      style={{ fontFeatureSettings: "'tnum'" }}
    >
      <div className="relative" style={{ width: cfg.outer, height: cfg.outer }}>
        {ringWrapper}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="bg-gradient-to-br from-primary to-accent bg-clip-text font-extrabold leading-none tracking-[-0.04em] text-transparent"
            style={{
              fontFeatureSettings: "'tnum'",
              fontSize: size === "lg" ? "4rem" : size === "md" ? "3rem" : "2rem",
            }}
          >
            {value}
          </span>
          <span data-role="ring-tier-label" className={tierClass}>
            {subtitle}
          </span>
        </div>
      </div>

      <svg
        data-role="sparkline"
        width={sparkW}
        height={sparkH}
        viewBox={`0 0 ${sparkW} ${sparkH}`}
        preserveAspectRatio="none"
        aria-hidden="true"
        className="block"
      >
        <defs>
          <linearGradient id={fillGradId} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.28} />
            <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
          </linearGradient>
        </defs>
        {sparkFillPolygon && (
          <polygon
            data-role="sparkline-fill"
            points={sparkFillPolygon}
            fill={`url(#${fillGradId})`}
          />
        )}
        <line
          x1={0}
          x2={sparkW}
          y1={passLineY}
          y2={passLineY}
          stroke="var(--muted-foreground)"
          strokeWidth={1}
          strokeDasharray="3 4"
          opacity={0.55}
        />
        {sparkPath && !prefersReduced && (
          <motion.path
            d={sparkPath}
            fill="none"
            stroke="var(--primary)"
            strokeWidth={2.5}
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
            strokeWidth={2.5}
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
            strokeWidth={3}
            strokeLinecap="round"
          />
        )}
      </svg>
    </div>
  )
}
