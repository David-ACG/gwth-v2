import Link from "next/link"
import type { Metadata } from "next"
import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  COURSE_MONTHLY_PRICE,
  ONGOING_MONTHLY_PRICE,
  TEAMS_EMAIL,
} from "@/lib/config"

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "One course. $37.50/month for 3 months. Then $7.50/month ongoing. No yearly price, no lock-in, cancel anytime.",
}

const included = [
  "94 hands-on projects with video walkthroughs (not random YouTube tutorials)",
  "3 portfolio-ready capstone projects deployed on real domains",
  "Industry-specific modules for your exact field",
  "Content that updates every day so your skills never go stale",
  "Dynamic scores that employers can verify",
  "Access to the GWTH Tech Radar — 47+ tools tracked daily",
  "No ads, no upsells, no hidden premium tier",
]

/**
 * Pricing page with single course pricing, free labs CTA, and employer section.
 * No tiered comparison, no discount codes, no total price shown.
 */
export default function PricingPage() {
  return (
    <div className="py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-4xl font-bold tracking-tight">
            Less than the cost of one hour with an AI consultant.
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            One course. Three months. Everything you need to build with AI.
          </p>
        </div>

        {/* Main pricing card */}
        <div className="mx-auto mt-12 max-w-lg">
          <Card className="border-primary shadow-lg">
            <CardContent className="p-8">
              <div className="text-center">
                <h2 className="text-lg font-semibold">The Course</h2>
                <div className="mt-4 text-5xl font-bold">
                  ${COURSE_MONTHLY_PRICE.toFixed(2)}
                  <span className="text-lg font-normal text-muted-foreground">
                    /month
                  </span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  for 3 months — full access to all lessons, labs, capstone projects,
                  industry specialisations, and dynamic scoring.
                </p>
                <div className="mt-4 rounded-lg bg-muted/50 p-3">
                  <p className="text-sm">
                    After completing the course:{" "}
                    <strong>${ONGOING_MONTHLY_PRICE.toFixed(2)}/month</strong>
                    {" "} — Ongoing access to updated content, new tools as they emerge,
                    and your live skill scores. Cancel anytime.
                  </p>
                </div>
              </div>

              <ul className="mt-8 space-y-3">
                {included.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm">
                    <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-8">
                <Button className="w-full" size="lg" asChild>
                  <Link href="/signup">Create Free Account</Link>
                </Button>
                <p className="mt-3 text-center text-xs text-muted-foreground">
                  Start with free labs — no credit card required.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* No yearly price note */}
        <div className="mx-auto mt-8 max-w-lg text-center">
          <p className="text-sm text-muted-foreground">
            <strong>No yearly price.</strong> We believe the course is good enough
            that you will want to stay — but you are free to leave at any point.
            No lock-in. No penalty. That keeps us honest.
          </p>
        </div>

        {/* Try before you subscribe */}
        <div className="mx-auto mt-16 max-w-lg text-center">
          <h2 className="text-2xl font-bold">Try Before You Subscribe</h2>
          <p className="mt-2 text-muted-foreground">
            Our labs are free. No credit card. No trial period that expires. Build
            something with AI right now and see if this is for you.
          </p>
          <div className="mt-6">
            <Button variant="outline" size="lg" asChild>
              <Link href="/signup">Start with a Free Lab</Link>
            </Button>
          </div>
        </div>

        {/* Employer/Teams section */}
        <div className="mx-auto mt-20 max-w-2xl">
          <Card>
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold">For Teams</h2>
              <p className="mt-2 text-muted-foreground">
                Same per-person price. No bulk discounts — it is already the lowest
                possible price. Teams of 5+ get an enterprise admin dashboard with
                progress tracking, completion rates, and the ability to designate
                relevant optional lessons.
              </p>
              <div className="mt-6">
                <Button variant="outline" asChild>
                  <Link href={`mailto:${TEAMS_EMAIL}`}>
                    Contact {TEAMS_EMAIL}
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
