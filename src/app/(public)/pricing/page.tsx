import Link from "next/link"
import type { Metadata } from "next"
import { Check, ArrowRight, FlaskConical, BookOpen, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  COURSE_MONTHLY_PRICE,
  ONGOING_MONTHLY_PRICE,
  TOTAL_COURSE_COST,
  ONGOING_NEW_CONTENT_HOURS,
  TOTAL_OPTIONAL_LESSONS,
} from "@/lib/config"

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Free labs to start, £29/month for the 3-month course, then just £7.50/month to stay current. UK-first pricing in GBP. No lock-in, cancel anytime.",
}

const freeFeatures = [
  "Access to all free labs",
  "Build real projects with AI",
  "No credit card required",
  "No time limit — free forever",
]

const courseFeatures = [
  "94 hands-on projects with video walkthroughs",
  "3 portfolio-ready capstone projects on real domains",
  "Industry-specific modules for your exact field",
  "Dynamic certification scores employers can verify",
  "Content updated every day — never goes stale",
  "Access to the GWTH Tech Radar (60+ tools tracked)",
  "No ads, no upsells, no hidden premium tier",
]

const ongoingFeatures = [
  "Keep your dynamic score as high as possible — scores decay if you stop",
  `~${ONGOING_NEW_CONTENT_HOURS} hours of new content every month (AI changes fast)`,
  `Work through the ${TOTAL_OPTIONAL_LESSONS} optional lessons you skipped in the first 3 months`,
  "New tools added to Tech Radar as they launch",
  "Updated lessons when tools change — your training never goes stale",
  "Access to new industry modules as they are released",
  "Score history and progression analytics",
  "Cancel anytime — no lock-in, no penalty",
]

/**
 * Pricing page with three tiers: Free Labs, The Course, and Stay Current.
 * Emphasises the £7.50/month ongoing value after the 3-month course.
 */
export default function PricingPage() {
  return (
    <div className="py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Less than the cost of one hour with an AI consultant.
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Start free. Learn everything in 3 months. Stay current for less
            than a flat white.
          </p>
        </div>

        {/* Three-tier pricing grid */}
        <div className="mx-auto mt-16 grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-3">
          {/* Tier 1: Free Labs */}
          <Card className="flex flex-col">
            <CardContent className="flex flex-1 flex-col p-8">
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                  <FlaskConical className="size-6 text-muted-foreground" />
                </div>
                <h2 className="text-lg font-semibold">Free Labs</h2>
                <div className="mt-4 text-5xl font-bold">
                  £0
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  forever — no card required
                </p>
              </div>

              <ul className="mt-8 flex-1 space-y-3">
                {freeFeatures.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm">
                    <Check className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-8">
                <Button variant="outline" className="w-full" size="lg" asChild>
                  <Link href="/signup">Join the Waitlist</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Tier 2: The Course (highlighted) */}
          <Card className="relative flex flex-col border-primary shadow-lg">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="rounded-full bg-primary px-4 py-1 text-xs font-semibold text-primary-foreground">
                Most Popular
              </span>
            </div>
            <CardContent className="flex flex-1 flex-col p-8">
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <BookOpen className="size-6 text-primary" />
                </div>
                <h2 className="text-lg font-semibold">The Course</h2>
                <div className="mt-4 text-5xl font-bold">
                  £{COURSE_MONTHLY_PRICE.toFixed(2)}
                  <span className="text-lg font-normal text-muted-foreground">
                    /mo
                  </span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  for 3 months (£{TOTAL_COURSE_COST.toFixed(2)} total)
                </p>
              </div>

              <ul className="mt-8 flex-1 space-y-3">
                {courseFeatures.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm">
                    <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-8">
                <Button className="w-full" size="lg" asChild>
                  <Link href="/signup">
                    Join the Earlybird Waitlist
                    <ArrowRight className="ml-2 size-4" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Tier 3: Stay Current */}
          <Card className="flex flex-col border-accent/50">
            <CardContent className="flex flex-1 flex-col p-8">
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-accent/10">
                  <TrendingUp className="size-6 text-accent" />
                </div>
                <h2 className="text-lg font-semibold">Stay Current</h2>
                <div className="mt-4 text-5xl font-bold">
                  £{ONGOING_MONTHLY_PRICE.toFixed(2)}
                  <span className="text-lg font-normal text-muted-foreground">
                    /mo
                  </span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  after completing the course
                </p>
              </div>

              <ul className="mt-8 flex-1 space-y-3">
                {ongoingFeatures.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm">
                    <Check className="mt-0.5 size-4 shrink-0 text-accent" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-8">
                <Button
                  variant="outline"
                  className="w-full border-accent/50 text-accent hover:bg-accent/10"
                  size="lg"
                  disabled
                >
                  Included After Course
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Earlybird note */}
        <div className="mx-auto mt-10 max-w-2xl text-center">
          <p className="text-sm text-muted-foreground">
            We are currently accepting earlybird testers. Create a free account to
            join the waiting list and be first to access the course when it
            launches. We are launching in the UK first. International pricing in
            USD and EUR will follow.
          </p>
        </div>

        {/* No yearly price note */}
        <div className="mx-auto mt-4 max-w-2xl text-center">
          <p className="text-sm text-muted-foreground">
            <strong>No yearly price.</strong> We believe the course is good
            enough that you will want to stay — but you are free to leave at any
            point. No lock-in. No penalty. That keeps us honest.
          </p>
        </div>

        {/* For Teams section */}
        <div className="mx-auto mt-16 max-w-2xl">
          <Card>
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold">For Teams</h2>
              <p className="mt-2 text-muted-foreground">
                Same per-person price for UK teams of any size. No bulk
                discounts — it is already the lowest possible price. Teams of 5+
                get an admin dashboard with progress tracking, completion rates,
                and the ability to choose which optional lessons each role
                completes. For teams of 100+, we can create bespoke lessons
                tailored specifically to your company&apos;s workflows, tools,
                and industry challenges.
              </p>
              <div className="mt-6 flex flex-wrap gap-4">
                <Button variant="outline" asChild>
                  <Link href="/contact">Get in Touch</Link>
                </Button>
                <Button variant="ghost" className="gap-2" asChild>
                  <Link href="/for-teams">
                    Learn more
                    <ArrowRight className="size-4" />
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
