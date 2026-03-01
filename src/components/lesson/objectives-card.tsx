import { Target, CircleCheck } from "lucide-react"
import { cn } from "@/lib/utils"

interface ObjectivesCardProps {
  /** List of learning objective strings */
  objectives: string[]
  /** Additional CSS classes */
  className?: string
}

/**
 * "What you'll learn" card displayed below the intro video.
 * Shows a checklist of lesson objectives with icons.
 * Uses primary/5 background with a subtle primary border.
 */
export function ObjectivesCard({ objectives, className }: ObjectivesCardProps) {
  if (objectives.length === 0) return null

  return (
    <div
      className={cn(
        "rounded-lg border border-primary/20 bg-primary/5 p-6",
        className,
      )}
    >
      <div className="mb-4 flex items-center gap-2">
        <Target className="size-5 text-primary" />
        <h3 className="text-base font-semibold">What you&apos;ll learn</h3>
      </div>
      <ul className="space-y-2.5">
        {objectives.map((objective, i) => (
          <li key={i} className="flex items-start gap-2.5">
            <CircleCheck className="mt-0.5 size-4 shrink-0 text-primary/70" />
            <span className="text-[0.9375rem] leading-relaxed">
              {objective}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
