import { cn } from "@/lib/utils"

interface LessonSectionProps {
  /** Section number (displayed as a solid primary badge) */
  number?: number
  /** Section title */
  title?: string
  /** Section content */
  children: React.ReactNode
  /** HTML id for scroll-to targeting */
  id?: string
  /** Whether this section uses the tinted (muted) background */
  tinted?: boolean
  /** Additional CSS classes */
  className?: string
}

/**
 * Wrapper component for lesson sections with V11 composite styling.
 * Features solid primary number badges and alternating bg-card/bg-muted/50 backgrounds.
 */
export function LessonSection({
  number,
  title,
  children,
  id,
  tinted = false,
  className,
}: LessonSectionProps) {
  return (
    <section
      id={id}
      className={cn(
        "p-8",
        tinted ? "bg-muted/50" : "bg-card",
        className,
      )}
    >
      {(number !== undefined || title) && (
        <div className="mb-5 flex items-center gap-3">
          {number !== undefined && (
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
              {String(number).padStart(2, "0")}
            </span>
          )}
          {title && (
            <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
          )}
        </div>
      )}
      {children}
    </section>
  )
}
