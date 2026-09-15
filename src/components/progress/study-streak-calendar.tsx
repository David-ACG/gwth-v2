import { cn } from "@/lib/utils"
import type { StudyStreak } from "@/lib/types"

interface StudyStreakCalendarProps {
  /** Study streak data including yearly activity */
  streak: StudyStreak
  /** Additional CSS classes */
  className?: string
}

/** Cell colour for an activity count, using the FDE dash tokens. */
function heatStyle(count: number): React.CSSProperties {
  if (count === 0) return { background: "var(--v-line-soft)" }
  if (count === 1) return { background: "var(--v-accent)", opacity: 0.4 }
  if (count === 2) return { background: "var(--v-accent)", opacity: 0.65 }
  return { background: "var(--v-accent)" }
}

/*
 * Metadata label. JetBrains Mono, small caps and letter-spaced tracking are
 * all retired as LABEL treatments (paper-first-register,
 * paper-first-banned-patterns): metadata is Public Sans, small, --v-muted.
 * Batch 1.
 */
const META_LABEL: React.CSSProperties = {
  fontFamily: "var(--font-sans)",
  fontSize: "var(--fde-mono-sm)",
  fontWeight: 500,
  color: "var(--v-muted)",
}

/**
 * Activity heatmap showing daily study activity over the last 365 days.
 * Drawn in the paper-first register: softened cells coloured by the --v-*
 * tokens and Public Sans metadata, with no rule under the head.
 * Must be rendered inside an FDE token scope (a `.shell` palette block).
 * Used only by the /progress page.
 */
export function StudyStreakCalendar({
  streak,
  className,
}: StudyStreakCalendarProps) {
  // Group activity by week for the grid layout
  const weeks: { date: Date; count: number }[][] = []
  let currentWeek: { date: Date; count: number }[] = []

  for (const day of streak.yearlyActivity) {
    if (currentWeek.length === 7) {
      weeks.push(currentWeek)
      currentWeek = []
    }
    currentWeek.push(day)
  }
  if (currentWeek.length > 0) {
    weeks.push(currentWeek)
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-baseline justify-between gap-4 flex-wrap">
        <div>
          <h3
            style={{
              fontSize: "1.05rem",
              fontWeight: 600,
              letterSpacing: "-0.01em",
            }}
          >
            Study Streak
          </h3>
          <p style={META_LABEL} className="mt-1">
            {streak.currentStreak} day streak · {streak.longestStreak} day best
          </p>
        </div>
        <div className="flex items-center gap-1.5" style={META_LABEL}>
          <span>Less</span>
          {[0, 1, 2, 3].map((level) => (
            <span
              key={level}
              className="inline-block size-2.5 rounded-[2px]"
              style={heatStyle(level)}
            />
          ))}
          <span>More</span>
        </div>
      </div>

      <div className="flex gap-[3px] overflow-x-auto pb-1">
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="flex flex-col gap-[3px]">
            {week.map((day, dayIndex) => (
              <div
                key={dayIndex}
                className="size-2.5 rounded-[2px]"
                style={heatStyle(day.count)}
                title={`${day.date.toLocaleDateString()}: ${day.count} items`}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
