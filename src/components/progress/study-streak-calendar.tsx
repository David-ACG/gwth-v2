import { cn } from "@/lib/utils"
import type { StudyStreak } from "@/lib/types"

interface StudyStreakCalendarProps {
  /** Study streak data including yearly activity */
  streak: StudyStreak
  /** Additional CSS classes */
  className?: string
}

/**
 * GitHub-style activity heatmap showing daily study activity.
 * Displays the last 365 days of activity with color intensity.
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
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <h3 className="text-sm font-medium">Study Streak</h3>
          <p className="text-xs text-muted-foreground">
            {streak.currentStreak} day streak · {streak.longestStreak} day best
          </p>
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <span>Less</span>
          {[0, 1, 2, 3].map((level) => (
            <div
              key={level}
              className={cn(
                "size-2.5 rounded-sm",
                level === 0 && "bg-muted",
                level === 1 && "bg-primary/25",
                level === 2 && "bg-primary/50",
                level === 3 && "bg-primary"
              )}
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
                className={cn(
                  "size-2.5 rounded-sm",
                  day.count === 0 && "bg-muted",
                  day.count === 1 && "bg-primary/25",
                  day.count === 2 && "bg-primary/50",
                  day.count >= 3 && "bg-primary"
                )}
                title={`${day.date.toLocaleDateString()}: ${day.count} items`}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
