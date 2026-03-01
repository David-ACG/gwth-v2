import { cn } from "@/lib/utils"

interface LessonSectionProps {
  /** Optional section number (displayed as a badge) */
  number?: number
  /** Section title */
  title?: string
  /** Section content */
  children: React.ReactNode
  /** HTML id for scroll-to targeting */
  id?: string
  /** Additional CSS classes */
  className?: string
}

/**
 * Wrapper component that adds consistent spacing and optional section numbering.
 * Used to visually separate the 5 lesson sections (Intro, Objectives, Content, Q&A, Project).
 */
export function LessonSection({
  number,
  title,
  children,
  id,
  className,
}: LessonSectionProps) {
  return (
    <section id={id} className={cn("py-8", className)}>
      {(number !== undefined || title) && (
        <div className="mb-6 flex items-center gap-3">
          {number !== undefined && (
            <span className="flex size-7 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
              {number}
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
