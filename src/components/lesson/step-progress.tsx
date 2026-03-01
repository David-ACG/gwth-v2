"use client"

import { useState } from "react"
import { Check } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"

/** A single project milestone */
export interface Milestone {
  /** Milestone title */
  title: string
  /** Milestone description */
  description: string
}

interface StepProgressProps {
  /** Ordered list of milestones */
  milestones: Milestone[]
  /** Initially completed milestone indices */
  initialCompleted?: number[]
  /** Additional CSS classes */
  className?: string
}

/**
 * Numbered milestone list with checkboxes and a progress bar at top.
 * Vertical connecting line between milestones. Completed milestones
 * show a green check icon and muted text. Used in the Project section.
 */
export function StepProgress({
  milestones,
  initialCompleted = [],
  className,
}: StepProgressProps) {
  const [completed, setCompleted] = useState<Set<number>>(
    new Set(initialCompleted),
  )

  const completedCount = completed.size
  const totalCount = milestones.length
  const progressPercent =
    totalCount > 0 ? (completedCount / totalCount) * 100 : 0

  function toggleMilestone(index: number) {
    setCompleted((prev) => {
      const next = new Set(prev)
      if (next.has(index)) {
        next.delete(index)
      } else {
        next.add(index)
      }
      return next
    })
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Progress bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Progress</span>
          <span className="font-medium">
            {completedCount}/{totalCount} completed
          </span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-[width] duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Milestone list */}
      <div className="relative pl-8">
        {/* Vertical connecting line */}
        <div className="absolute left-[15px] top-3 bottom-3 w-px bg-border" />

        <ul className="space-y-4">
          {milestones.map((milestone, index) => {
            const isCompleted = completed.has(index)

            return (
              <li key={index} className="relative flex gap-3">
                {/* Step number circle */}
                <div
                  className={cn(
                    "absolute -left-8 flex size-[30px] shrink-0 items-center justify-center rounded-full border-2 text-xs font-semibold transition-colors",
                    isCompleted
                      ? "border-success bg-success text-success-foreground"
                      : "border-border bg-background text-muted-foreground",
                  )}
                >
                  {isCompleted ? (
                    <Check className="size-3.5" />
                  ) : (
                    index + 1
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 pt-0.5">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      checked={isCompleted}
                      onCheckedChange={() => toggleMilestone(index)}
                      aria-label={`Mark "${milestone.title}" as ${isCompleted ? "incomplete" : "complete"}`}
                      className="mt-0.5"
                    />
                    <div>
                      <p
                        className={cn(
                          "text-sm font-medium leading-snug",
                          isCompleted && "text-muted-foreground line-through",
                        )}
                      >
                        {milestone.title}
                      </p>
                      <p
                        className={cn(
                          "mt-0.5 text-sm leading-relaxed text-muted-foreground",
                          isCompleted && "opacity-60",
                        )}
                      >
                        {milestone.description}
                      </p>
                    </div>
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}
