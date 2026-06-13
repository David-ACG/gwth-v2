"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

/**
 * Collapsible "How this score is calculated" panel for the verify page.
 * Closed by default; opens by default on the educational state. The body
 * surfaces an institutional summary, a four-cell standing grid, and a
 * 12-month score-history sparkline. Numbers are illustrative for Stage
 * 4 and bind to the same `EXAMPLE_SCORE_HISTORY` series the home-page
 * hero already uses; real per-credential data is a follow-up beads
 * issue.
 */
export function CalcDisclosure({ defaultOpen = false }: { defaultOpen?: boolean }) {
  const [open, setOpen] = React.useState(defaultOpen)
  return (
    <section className="mt-4.5 border-2 border-foreground bg-card">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full cursor-pointer items-center justify-between gap-4 bg-transparent px-7 py-5 text-left font-sans text-foreground sm:px-8"
      >
        <div>
          <div className="font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            SECTION 02 / METHOD
          </div>
          <h3 className="mt-2 text-[20px] font-bold tracking-[-0.015em] sm:text-[22px]">
            How this score is calculated
          </h3>
        </div>
        <span className="whitespace-nowrap font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          {open ? "— Collapse" : "+ Expand"}
        </span>
      </button>

      {open && (
        <div className="border-t border-border px-7 pb-7 pt-2 sm:px-8 sm:pb-8">
          <p className="mt-4 text-[15px] leading-[1.6] text-muted-foreground">
            The GWTH Score is a weighted, decaying composite. It is recomputed
            weekly from four inputs: verified lesson completions, passing Q&amp;A
            on every mandatory lesson, three reviewed capstone projects, and a
            currentness multiplier that reflects activity over the last 90 days.
            A score above 100 places the holder in the top 1% of GWTH-issued
            credentials at the time of verification, not at the time of
            enrolment.
          </p>

          <div className="mt-5">
            <div className="font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
              CURRENT STANDING
            </div>
            <div className="mt-2.5 grid grid-cols-2 border border-border md:grid-cols-4">
              <DataCell label="LESSONS COMPLETED" value="62 / 64" sub="+ 2 OPTIONAL" />
              <DataCell label="CAPSTONES APPROVED" value="3 / 3" sub="ALL VERIFIED" />
              <DataCell label="CURRENTNESS" value="92%" sub="LAST 90 DAYS" />
              <DataCell label="DECAY CHECKED" value="11 MAY" sub="WEEKLY" last />
            </div>
          </div>

          <div className="mt-6">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <div className="font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                SCORE HISTORY · 12 MONTHS
              </div>
              <div className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-muted-foreground">
                ENROLLED 8 MAY 2025 · GRADUATED 8 AUG 2025
              </div>
            </div>
            <div className="mt-3 border border-border bg-background px-3 pb-1.5 pt-3.5">
              <Sparkline />
            </div>
          </div>

          <p className="mt-5 text-[14px] leading-[1.55] text-muted-foreground">
            Holder reached 100 on 12 February 2026 and has held a Top 1% tier
            for 86 consecutive days. Underlying project files remain private;
            the credential proves the score, not the work product.
          </p>
        </div>
      )}
    </section>
  )
}

/**
 * One cell in the four-cell "current standing" grid. The `last` flag
 * suppresses the right-side border on the rightmost cell so the grid
 * reads cleanly in both 2-up (mobile) and 4-up (desktop) layouts.
 */
function DataCell({
  label,
  value,
  sub,
  last = false,
}: {
  label: string
  value: string
  sub: string
  last?: boolean
}) {
  return (
    <div
      className={cn(
        "px-4 py-4 sm:px-5",
        !last && "md:border-r md:border-border"
      )}
    >
      <div className="font-mono text-[10.5px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </div>
      <div className="mt-1.5 text-[24px] font-bold tracking-[-0.02em] tabular-nums">
        {value}
      </div>
      <div className="mt-1 font-mono text-[9.5px] uppercase tracking-[0.16em] text-muted-foreground">
        {sub}
      </div>
    </div>
  )
}

/**
 * 12-month score sparkline. Renders an SVG line + tinted area + target
 * dashed line at 100, with three mono axis labels (start / mid / today).
 * Today's data point gets a filled marker; the rest are hollow. Series
 * matches `EXAMPLE_SCORE_HISTORY` for now; a follow-up beads issue
 * binds the real per-credential history.
 */
function Sparkline({
  data = [55, 58, 62, 64, 71, 78, 82, 88, 92, 96, 100, 104],
  width = 640,
  height = 96,
  target = 100,
}: {
  data?: readonly number[]
  width?: number
  height?: number
  target?: number
}) {
  const max = Math.max(...data, target) * 1.05
  const min = Math.min(...data) * 0.7
  const range = max - min || 1
  const stepX = width / (data.length - 1)
  const points: Array<[number, number]> = data.map((v, i) => [
    i * stepX,
    height - ((v - min) / range) * height,
  ])
  const path = points
    .map((p, i) => (i === 0 ? `M${p[0]},${p[1]}` : `L${p[0]},${p[1]}`))
    .join(" ")
  const areaPath = `${path} L${width},${height} L0,${height} Z`
  const targetY = height - ((target - min) / range) * height
  const lastIdx = points.length - 1
  const today = data[lastIdx]

  return (
    <svg
      width="100%"
      height={height + 28}
      viewBox={`0 0 ${width} ${height + 28}`}
      preserveAspectRatio="none"
      className="block"
      role="img"
      aria-label={`Score history: ${data[0]} twelve months ago to ${today} today, target ${target}`}
    >
      <line x1={0} y1={height} x2={width} y2={height} stroke="var(--border)" strokeWidth="1" />
      <line
        x1={0}
        y1={targetY}
        x2={width}
        y2={targetY}
        stroke="var(--foreground)"
        strokeWidth="1"
        strokeDasharray="3 3"
        opacity="0.45"
      />
      <text
        x={width - 4}
        y={targetY - 4}
        textAnchor="end"
        fontFamily="var(--font-jetbrains, monospace)"
        fontSize="9.5"
        letterSpacing="1.6"
        fill="var(--muted-foreground)"
        style={{ textTransform: "uppercase" }}
      >
        TARGET 100
      </text>
      <path d={areaPath} fill="var(--primary)" fillOpacity="0.1" />
      <path
        d={path}
        fill="none"
        stroke="var(--primary)"
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {points.map((p, i) => (
        <circle
          key={i}
          cx={p[0]}
          cy={p[1]}
          r={i === lastIdx ? 4 : 2.2}
          fill={i === lastIdx ? "var(--primary)" : "var(--card)"}
          stroke="var(--primary)"
          strokeWidth="1.5"
        />
      ))}
      <text
        x={0}
        y={height + 18}
        fontFamily="var(--font-jetbrains, monospace)"
        fontSize="9.5"
        letterSpacing="1.6"
        fill="var(--muted-foreground)"
        style={{ textTransform: "uppercase" }}
      >
        12 MONTHS AGO
      </text>
      <text
        x={width / 2}
        y={height + 18}
        textAnchor="middle"
        fontFamily="var(--font-jetbrains, monospace)"
        fontSize="9.5"
        letterSpacing="1.6"
        fill="var(--muted-foreground)"
        style={{ textTransform: "uppercase" }}
      >
        6 MONTHS AGO
      </text>
      <text
        x={width}
        y={height + 18}
        textAnchor="end"
        fontFamily="var(--font-jetbrains, monospace)"
        fontSize="9.5"
        letterSpacing="1.6"
        fill="var(--primary)"
        fontWeight="600"
        style={{ textTransform: "uppercase" }}
      >
        TODAY · {today}
      </text>
    </svg>
  )
}
