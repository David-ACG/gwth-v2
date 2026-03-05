import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import {
  ArrowRight,
  Video,
  FlaskConical,
  BarChart3,
  Shield,
  Layers,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  MONTH_CONFIGS,
  TOTAL_MANDATORY_LESSONS,
  TOTAL_OPTIONAL_LESSONS,
} from "@/lib/config"

export const metadata: Metadata = {
  title: "Lessons",
  description:
    "94 hands-on AI lessons across 3 months. Video walkthroughs, real projects, dynamic scoring. No coding experience required.",
}

const features = [
  {
    icon: Video,
    title: "Video Walkthroughs",
    description:
      "Every lesson includes a video showing you exactly what to do, step by step.",
  },
  {
    icon: FlaskConical,
    title: `${TOTAL_MANDATORY_LESSONS + TOTAL_OPTIONAL_LESSONS} Projects`,
    description:
      "Build real apps, automations, and tools — not toy exercises. Every project works.",
  },
  {
    icon: BarChart3,
    title: "Dynamic Scoring",
    description:
      "Your score reflects what you know now, not what you knew last month. Content updates keep you current.",
  },
  {
    icon: Shield,
    title: "Vendor-Neutral",
    description:
      "Learn principles, not products. We cover every major AI platform so you can pick the right tool for the job.",
  },
]

/**
 * Public lessons landing page.
 * Showcases the 3-month course structure, features, and CTAs.
 */
export default function LessonsPage() {
  return (
    <>
      {/* Hero */}
      <section className="border-b bg-muted/30 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              What You&apos;ll Build
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              {TOTAL_MANDATORY_LESSONS} mandatory lessons + {TOTAL_OPTIONAL_LESSONS}{" "}
              optional deep-dives across 3 months. Go from your first AI
              conversation to deploying enterprise systems — by typing plain
              English.
            </p>
            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Button size="lg" className="gap-2" asChild>
                <Link href="/signup">
                  Sign Up
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="gap-2" asChild>
                <Link href="/labs">
                  <FlaskConical className="size-4" />
                  Try a Free Lab
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Month cards */}
      <section className="py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-2xl font-bold tracking-tight sm:text-3xl">
            3 Months. 3 Levels. Real Results.
          </h2>
          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
            {MONTH_CONFIGS.map((month) => (
              <Card key={month.month} className="relative overflow-hidden">
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary to-accent" />
                <CardContent className="p-6">
                  <div className="mb-3 flex items-center gap-2">
                    <Layers className="size-5 text-primary" />
                    <span className="text-sm font-medium text-primary">
                      Month {month.month}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold">{month.title}</h3>
                  <p className="mt-1 text-sm font-medium text-muted-foreground">
                    {month.subtitle}
                  </p>
                  <p className="mt-3 text-sm text-muted-foreground">
                    {month.description}
                  </p>
                  <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
                    <span>{month.mandatoryLessons} lessons</span>
                    {month.optionalLessons > 0 && (
                      <span>+ {month.optionalLessons} optional</span>
                    )}
                  </div>
                  <div className="mt-4 rounded-md bg-muted/50 p-3">
                    <p className="text-xs font-medium">Capstone Project</p>
                    <p className="mt-1 text-sm font-semibold">
                      {month.capstoneName}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {month.capstoneDescription}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t bg-muted/30 py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <div key={feature.title} className="text-center">
                <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-lg bg-primary/10">
                  <feature.icon className="size-6 text-primary" />
                </div>
                <h3 className="font-semibold">{feature.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why One Hour a Day */}
      <section className="py-16 md:py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 flex justify-center">
            <Image
              src="/five-hour-rule.png"
              alt="The 5-Hour Rule — Bill Gates, Warren Buffett, Elon Musk, and Oprah Winfrey all dedicate at least an hour a day to deliberate learning"
              width={900}
              height={450}
              className="w-full rounded-2xl"
            />
          </div>
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Why One Hour a Day?
          </h2>
          <div className="mt-6 space-y-4 text-lg leading-relaxed text-muted-foreground">
            <p>
              GWTH.ai is built around the 5-Hour Rule — the principle, coined by
              Michael Simmons, that no matter how busy successful people are, they
              always set aside at least an hour a day for deliberate learning. Bill
              Gates, Warren Buffett, Elon Musk, and Oprah Winfrey all follow this
              approach. Simmons traces the idea back to Benjamin Franklin, who
              consistently invested an hour a day in reading, writing, and tracking
              his goals. Entrepreneur Thomas Corley&apos;s five-year study of 233
              millionaires confirmed that 88% dedicate at least 30 minutes daily to
              self-education — not for fun, but to sharpen their edge. The research
              is clear: sustained daily learning beats occasional cramming every
              time.
            </p>
            <p>
              GWTH.ai lessons are designed to fit this rhythm. Each one delivers
              focused, practical AI skills in roughly an hour — five hours across
              your working week — so you build real capability without disrupting
              your life. Read, reflect, then apply what you&apos;ve learned through
              hands-on projects. As the AT&amp;T CEO warned, those who don&apos;t
              spend at least five to ten hours a week learning risk making
              themselves obsolete. In the age of AI, that&apos;s never been more
              true — and GWTH makes sure those five hours count.
            </p>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-16 md:py-20">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Ready to start building?
          </h2>
          <p className="mt-4 text-muted-foreground">
            Sign up for the course, or try a free lab first to see how it works.
          </p>
          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Button size="lg" className="gap-2" asChild>
              <Link href="/signup">
                Sign Up
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/pricing">View Pricing</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  )
}
