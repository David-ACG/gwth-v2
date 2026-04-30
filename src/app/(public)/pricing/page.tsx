import Link from "next/link"
import type { Metadata } from "next"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PricingCards } from "@/components/marketing/pricing-cards/pricing-cards"

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Free labs to start, £29/month for the 3-month course, then just £7.50/month to stay current. UK-first pricing in GBP. No lock-in, cancel anytime.",
}

/**
 * Pricing page — editorial mast-head, the canonical PricingCards grid,
 * a tightened supplemental block (waitlist + no-yearly notes), and a
 * dedicated For Teams CTA. The pricing tiers themselves come from the
 * shared `<PricingCards>` component so /pricing and the homepage share
 * a single source of truth for tier copy, prices, and CTA destinations.
 */
export default function PricingPage() {
  return (
    <>
      {/* Mast-head — owns the page H1; PricingCards renders headingless below. */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 md:py-20 lg:px-8">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Pricing · UK GBP
          </p>
          <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
            Less than the cost of one hour with an AI consultant.
          </h1>
          <p className="mt-5 text-lg text-muted-foreground">
            Start free. Learn everything in 3 months. Stay current for less than a
            flat white.
          </p>
        </div>
      </section>

      <PricingCards headingless />

      {/* Supplemental notes — kept as plain prose so the cards stay the focus. */}
      <section
        data-section="pricing-notes"
        className="border-y border-border bg-muted/40"
      >
        <div className="mx-auto grid max-w-5xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-2 md:py-16 lg:px-8">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
              Earlybird
            </p>
            <p className="mt-3 text-sm leading-relaxed text-foreground">
              We are currently accepting earlybird testers. Create a free account
              to join the waiting list and be first to access the course when it
              launches. We are launching in the UK first; international pricing
              in USD and EUR will follow.
            </p>
          </div>
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
              No yearly price
            </p>
            <p className="mt-3 text-sm leading-relaxed text-foreground">
              We believe the course is good enough that you will want to stay —
              but you are free to leave at any point. No lock-in. No penalty.
              That keeps us honest.
            </p>
          </div>
        </div>
      </section>

      {/* For Teams — quiet section, two columns on desktop, with primary CTA. */}
      <section data-section="for-teams-cta" className="py-20 md:py-24">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 md:grid-cols-[1fr_auto] md:items-end md:gap-16">
            <div className="max-w-2xl">
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
                For Teams
              </p>
              <h2 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
                Same per-person price for UK teams of any size.
              </h2>
              <p className="mt-4 text-base leading-relaxed text-muted-foreground">
                No bulk discounts — it is already the lowest possible price.
                Teams of 5+ get an admin dashboard with progress tracking,
                completion rates, and the ability to choose which optional
                lessons each role completes. For teams of 100+, we can create
                bespoke lessons tailored specifically to your company&apos;s
                workflows, tools, and industry challenges.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row md:flex-col md:items-end">
              <Button asChild size="lg">
                <Link href="/contact">Get in Touch</Link>
              </Button>
              <Button variant="ghost" className="gap-2" asChild>
                <Link href="/for-teams">
                  Learn more
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
