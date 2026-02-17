"use client"

import { cn } from "@/lib/utils"

interface SpinnerProps {
  /** Size of the spinner in pixels. Defaults to 40. */
  size?: number
  /** Additional CSS classes */
  className?: string
}

/**
 * Branded loading spinner with animated rotating arcs.
 * Uses primary and accent colors from the design system.
 */
export function Spinner({ size = 40, className }: SpinnerProps) {
  const borderWidth = Math.max(2, Math.round(size / 16))

  return (
    <div
      className={cn("relative inline-flex items-center justify-center", className)}
      style={{ width: size, height: size }}
      role="status"
      aria-label="Loading"
    >
      <svg
        className="animate-spin"
        width={size}
        height={size}
        viewBox="0 0 50 50"
        style={{ animationDuration: "0.8s" }}
      >
        {/* Track */}
        <circle
          cx="25"
          cy="25"
          r="20"
          fill="none"
          stroke="currentColor"
          strokeWidth={borderWidth}
          className="text-muted/30"
        />
        {/* Primary arc */}
        <circle
          cx="25"
          cy="25"
          r="20"
          fill="none"
          strokeWidth={borderWidth}
          strokeLinecap="round"
          strokeDasharray="80 126"
          className="text-primary stroke-primary"
        />
      </svg>
      {/* Inner accent arc (counter-rotate) */}
      <svg
        className="absolute animate-spin-reverse"
        width={size * 0.6}
        height={size * 0.6}
        viewBox="0 0 50 50"
      >
        <circle
          cx="25"
          cy="25"
          r="20"
          fill="none"
          strokeWidth={borderWidth + 1}
          strokeLinecap="round"
          strokeDasharray="40 126"
          className="text-accent stroke-accent"
        />
      </svg>
    </div>
  )
}

/**
 * Full-page loading spinner centered on screen.
 * Used as the root and route-level loading state.
 */
export function PageSpinner() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
      <Spinner size={48} />
      <p className="text-sm text-muted-foreground animate-pulse">Loading...</p>
    </div>
  )
}
