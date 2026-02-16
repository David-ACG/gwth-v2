import { Badge } from "@/components/ui/badge"
import { CheckCircle2, Circle, Clock, Lock } from "lucide-react"
import { cn } from "@/lib/utils"
import type { LessonStatus } from "@/lib/types"

interface StatusBadgeProps {
  /** The lesson status to display */
  status: LessonStatus
  /** Additional CSS classes */
  className?: string
}

const statusConfig: Record<
  LessonStatus,
  { label: string; icon: React.ElementType; className: string }
> = {
  completed: {
    label: "Completed",
    icon: CheckCircle2,
    className: "text-[var(--status-completed)] bg-[var(--status-completed)]/10 border-[var(--status-completed)]/20",
  },
  "in-progress": {
    label: "In Progress",
    icon: Clock,
    className: "text-[var(--status-in-progress)] bg-[var(--status-in-progress)]/10 border-[var(--status-in-progress)]/20",
  },
  available: {
    label: "Available",
    icon: Circle,
    className: "text-[var(--status-not-started)] bg-[var(--status-not-started)]/10 border-[var(--status-not-started)]/20",
  },
  locked: {
    label: "Locked",
    icon: Lock,
    className: "text-[var(--status-locked)] bg-[var(--status-locked)]/10 border-[var(--status-locked)]/20",
  },
}

/**
 * Colored badge with icon showing a lesson's completion status.
 * Conveys meaning through both color and text+icon (a11y).
 */
export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status]
  const Icon = config.icon

  return (
    <Badge
      variant="outline"
      className={cn("gap-1 font-normal", config.className, className)}
    >
      <Icon className="size-3" />
      {config.label}
    </Badge>
  )
}
