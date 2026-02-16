"use client"

import { cn } from "@/lib/utils"

interface ProgressRingProps {
  /** Progress value from 0 to 1 */
  value: number
  /** Size of the ring in pixels */
  size?: number
  /** Stroke width in pixels */
  strokeWidth?: number
  /** Additional CSS classes */
  className?: string
  /** Content to render inside the ring (e.g., percentage label) */
  children?: React.ReactNode
}

/**
 * Circular SVG progress indicator.
 * Renders a ring with a filled arc proportional to the progress value.
 */
export function ProgressRing({
  value,
  size = 64,
  strokeWidth = 4,
  className,
  children,
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - value * circumference

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg width={size} height={size} className="-rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-muted/30"
        />
        {/* Progress arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="text-primary transition-[stroke-dashoffset] duration-700 ease-out"
        />
      </svg>
      {children && (
        <div className="absolute inset-0 flex items-center justify-center">
          {children}
        </div>
      )}
    </div>
  )
}
