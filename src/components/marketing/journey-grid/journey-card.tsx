import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Journey } from "@/components/marketing/data"

const accentClasses: Record<Journey["accent"], string> = {
  mint: "bg-accent/10 text-accent",
  aqua: "bg-primary/10 text-primary",
}

const statClasses: Record<Journey["accent"], string> = {
  mint: "bg-accent/10 text-accent",
  aqua: "bg-primary/10 text-primary",
}

type JourneyCardProps = {
  /** The journey to render. */
  journey: Journey
}

/**
 * Single journey card for JourneyGrid. The whole card is a link — there
 * is no inner-CTA link, so keyboard tab order stays linear (one stop per
 * card). A subtle chevron in the top-right hints at click affordance
 * without the per-card "See pricing" text-CTA that read as messy.
 */
export function JourneyCard({ journey }: JourneyCardProps) {
  return (
    <Link
      href={journey.href}
      data-testid="journey-card"
      data-accent={journey.accent}
      className="hover-lift group relative flex h-full flex-col rounded-2xl border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md"
    >
      <ArrowRight
        aria-hidden="true"
        className="absolute right-5 top-5 size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-foreground"
      />

      <div className="flex items-center justify-between gap-3 pr-7">
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

      {journey.stat ? (
        <div
          className={cn(
            "mt-5 rounded-xl px-4 py-3",
            statClasses[journey.accent]
          )}
        >
          <div className="text-2xl font-bold leading-tight">{journey.stat.value}</div>
          <div className="mt-0.5 text-xs text-current/80">{journey.stat.label}</div>
        </div>
      ) : null}
    </Link>
  )
}
