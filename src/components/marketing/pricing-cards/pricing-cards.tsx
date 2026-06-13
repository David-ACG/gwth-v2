import Link from "next/link"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { MotionSection } from "@/components/marketing/motion-section"
import { PRICING } from "@/components/marketing/data"

/**
 * PricingCards — three-tier pricing grid. Prices come from
 * src/lib/config.ts via marketing/data.ts so the marketing copy cannot
 * drift from the canonical pricing constants. The middle tier is
 * highlighted via `data-featured="true"` and a primary border.
 *
 * @param headingless When true, skips the section heading + subhead so a
 *                    dedicated /pricing page can supply its own page-level
 *                    H1 above the grid. Default false (homepage usage).
 */
export function PricingCards({ headingless = false }: { headingless?: boolean } = {}) {
  return (
    <MotionSection
      data-section="pricing"
      className={headingless ? "pb-16 md:pb-20" : "py-20 md:py-28"}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {!headingless && (
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Less than the cost of one hour with an AI consultant.
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Start free. Unlock one course month at a time. Stay current for less
              than a flat white.
            </p>
          </div>
        )}

        <div className={cn("grid gap-6 lg:grid-cols-3", !headingless && "mt-14")}>
          {PRICING.map((tier) => {
            const featured = Boolean(tier.flag)
            return (
              <article
                key={tier.id}
                data-testid="pricing-tier"
                data-tier={tier.id}
                data-featured={featured ? "true" : undefined}
                className={cn(
                  "relative flex h-full flex-col rounded-2xl border bg-card p-7 shadow-sm transition-all",
                  featured
                    ? "border-primary shadow-lg ring-1 ring-primary/20 lg:-translate-y-1 hover:shadow-xl"
                    : "border-border hover:shadow-md"
                )}
              >
                {tier.flag && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground shadow-sm">
                    {tier.flag}
                  </span>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                    {tier.badge}
                  </span>
                </div>
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="text-4xl font-bold tracking-tight text-foreground">
                    {tier.price}
                  </span>
                  <span className="text-sm text-muted-foreground">{tier.per}</span>
                </div>
                <ul className="mt-6 flex-1 space-y-3">
                  {tier.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-2 text-sm text-foreground"
                    >
                      <Check
                        className="mt-0.5 size-4 shrink-0 text-accent"
                        aria-hidden="true"
                      />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-7">
                  {tier.cta.style === "disabled" ? (
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      disabled
                      aria-disabled="true"
                    >
                      {tier.cta.label}
                    </Button>
                  ) : (
                    <Button
                      asChild
                      className="w-full"
                      variant={tier.cta.style === "ghost" ? "outline" : "default"}
                    >
                      <Link href={tier.cta.href}>{tier.cta.label}</Link>
                    </Button>
                  )}
                </div>
              </article>
            )
          })}
        </div>

        <p className="mt-10 text-center font-mono text-xs text-muted-foreground">
          No yearly price · Cancel anytime · No lock-in · UK-first pricing for
          teams
        </p>
      </div>
    </MotionSection>
  )
}
