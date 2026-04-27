import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Journey } from "@/components/marketing/data"

const accentClasses: Record<Journey["accent"], string> = {
  mint: "bg-accent/10 text-accent",
  aqua: "bg-primary/10 text-primary",
}

type JourneyCardProps = {
  /** The journey to render. */
  journey: Journey
  /** Whether this card spans the full width of the grid (the 7th card). */
  wide?: boolean
}

/**
 * Single journey card for JourneyGrid. The whole card is a link — there
 * is no inner-CTA link, so keyboard tab order stays linear (one stop per
 * card).
 */
export function JourneyCard({ journey, wide = false }: JourneyCardProps) {
  return (
    <Link
      href={journey.href}
      data-testid="journey-card"
      data-accent={journey.accent}
      className={cn(
        "hover-lift group flex h-full flex-col rounded-2xl border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md",
        wide && "lg:col-span-3"
      )}
    >
      <div className="flex items-center justify-between">
        <span className="font-mono text-xs text-muted-foreground">{journey.n}</span>
        <span
          className={cn(
            "rounded-full px-3 py-1 text-xs font-semibold",
            accentClasses[journey.accent]
          )}
        >
          {journey.tag}
        </span>
      </div>

      <h3 className="mt-4 text-lg font-semibold tracking-tight text-foreground">
        {journey.title}
      </h3>

      <p className="mt-3 flex-1 text-sm text-muted-foreground">{journey.body}</p>

      <div className="mt-5 flex items-end justify-between gap-4">
        {journey.stat ? (
          <div className="min-w-0">
            <div className="text-xl font-bold text-foreground">{journey.stat.value}</div>
            <div className="truncate text-xs text-muted-foreground">
              {journey.stat.label}
            </div>
          </div>
        ) : (
          <span aria-hidden="true" />
        )}

        <span className="inline-flex items-center gap-1 text-sm font-medium text-foreground transition-transform group-hover:translate-x-0.5">
          {journey.cta}
          <ArrowRight className="size-4" />
        </span>
      </div>
    </Link>
  )
}
