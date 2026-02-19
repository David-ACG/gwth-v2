import Link from "next/link"
import type { Metadata } from "next"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Code2,
  RefreshCw,
  Shield,
  Trophy,
  Wrench,
  Heart,
  Briefcase,
  Baby,
  Store,
  AlertTriangle,
  ArrowRight,
  Radar,
  Check,
} from "lucide-react"
import { HeroSection } from "@/components/landing/hero-section"
import { MONTH_CONFIGS, COURSE_MONTHLY_PRICE, ONGOING_MONTHLY_PRICE } from "@/lib/config"

export const metadata: Metadata = {
  title: "GWTH.ai | Learn to Build with AI",
  description:
    "Learn to build apps, automate workflows, and solve real problems using AI — all in plain English. No coding required. 94 hands-on projects across 3 months.",
}

const differentiators = [
  {
    icon: Code2,
    title: "No coding required — and we mean it",
    description:
      "Every project is built by describing what you want in plain English. AI builds it. You guide it. That is the skill that matters now.",
  },
  {
    icon: RefreshCw,
    title: "Updated every day, not annually",
    description:
      "Our Tech Radar scans 47+ AI tools every single day. When a tool you learned gets replaced by something better, we update the lesson immediately.",
  },
  {
    icon: Shield,
    title: "Completely independent",
    description:
      "No sponsors. No ads. No vendor partnerships. When we recommend a tool, it is because we tested it against every alternative and it was the best option.",
  },
  {
    icon: Trophy,
    title: "Scores that employers can trust",
    description:
      "Our dynamic scoring system stays current. Your assessment results reflect what you can actually do with the tools that exist right now.",
  },
  {
    icon: Wrench,
    title: "Designed by people who build this stuff",
    description:
      "25 years of enterprise experience. Building with AI tools from day one — from the first release of Cursor to the first release of Claude Code.",
  },
  {
    icon: Heart,
    title: "We will hold your hand every step of the way",
    description:
      "Every single lesson includes a step-by-step video walkthrough where the instructor builds the project alongside you. You are never left guessing.",
  },
]

const audiences = [
  {
    icon: AlertTriangle,
    title: "You are worried AI will take your job",
    description:
      "Someone who knows how to use AI will be more productive than you. This course makes you that person. In three months, you will be the one your team asks for help.",
  },
  {
    icon: Briefcase,
    title: "You have been made redundant and need to reskill",
    description:
      "Five hours a week for three months. Every project you build goes in your portfolio. Every score is verifiable. Employers are hiring for exactly these skills.",
  },
  {
    icon: Store,
    title: "You run a small business",
    description:
      "Your competitors are already using AI. You do not need to hire a developer. Five hours a week for three months, and you will be able to do it all yourself.",
  },
  {
    icon: Baby,
    title: "You are a parent thinking about the future",
    description:
      "AI fluency will not be a nice-to-have — it will be table stakes. No coding required. If your teenager can describe what they want, they can build with AI.",
  },
]

/**
 * Landing page with 6 sections matching design-requirements:
 * Hero, What You'll Build, Why GWTH, Who This Is For, Pricing, Final CTA.
 */
export default function LandingPage() {
  return (
    <>
      {/* JSON-LD structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Course",
            name: "GWTH — Applied AI Skills",
            description:
              "Learn to build apps, automate workflows, and solve real problems using AI. 94 hands-on projects across 3 months. No coding required.",
            provider: {
              "@type": "Organization",
              name: "GWTH.ai",
              url: "https://gwth.ai",
            },
          }),
        }}
      />

      {/* Section 1: Hero */}
      <HeroSection />

      {/* Section 2: What You'll Build */}
      <section className="py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Three months from now, you will have built things most people think require a developer.
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Every lesson ends with a hands-on project you build yourself, plus a video walkthrough
              where the instructor takes you through it step by step.{" "}
              <strong className="text-foreground">94 projects across three months.</strong>{" "}
              Not quizzes about transformer architecture. Real things you build, use, and show to people.
            </p>
          </div>
          <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-3">
            {MONTH_CONFIGS.map((month) => (
              <Card
                key={month.month}
                className="group relative overflow-hidden transition-all duration-200 hover:shadow-lg hover:-translate-y-1"
              >
                <CardContent className="p-6">
                  <div className="mb-2 text-sm font-medium text-primary">
                    Month {month.month}
                  </div>
                  <h3 className="text-xl font-bold">{month.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {month.subtitle}
                  </p>
                  <p className="mt-3 text-sm text-muted-foreground">
                    {month.mandatoryLessons + month.optionalLessons} lessons.{" "}
                    {month.mandatoryLessons + month.optionalLessons} projects.
                    {month.optionalLessons > 0 &&
                      " Choose your industry specialisation."}
                  </p>
                  <p className="mt-3 text-sm">
                    {month.description}
                  </p>
                  <div className="mt-4 rounded-lg bg-muted/50 p-3">
                    <p className="text-xs font-medium text-muted-foreground">
                      Capstone Project
                    </p>
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

      {/* Section 3: Why GWTH */}
      <section className="border-t bg-muted/30 py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              An AI course that is actually honest with you.
            </h2>
          </div>
          <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {differentiators.map((item) => (
              <Card
                key={item.title}
                className="transition-all duration-200 hover:shadow-lg hover:-translate-y-1"
              >
                <CardContent className="p-6">
                  <div className="mb-4 inline-flex rounded-lg bg-primary/10 p-3">
                    <item.icon className="size-6 text-primary" />
                  </div>
                  <h3 className="text-base font-semibold">{item.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {item.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Section 4: Who This Is For */}
      <section className="py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Whether AI feels like a threat or an opportunity, this course makes it yours.
            </h2>
          </div>
          <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2">
            {audiences.map((item) => (
              <Card key={item.title}>
                <CardContent className="flex gap-4 p-6">
                  <div className="shrink-0">
                    <div className="inline-flex rounded-lg bg-accent/10 p-3">
                      <item.icon className="size-5 text-accent" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold">{item.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Section 5: Pricing */}
      <section className="border-t bg-muted/30 py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Less than the cost of one hour with an AI consultant.
            </h2>
          </div>
          <div className="mx-auto mt-12 max-w-lg">
            <Card className="border-primary shadow-lg">
              <CardContent className="p-8">
                <div className="text-center">
                  <div className="text-4xl font-bold">
                    ${COURSE_MONTHLY_PRICE.toFixed(2)}
                    <span className="text-lg font-normal text-muted-foreground">
                      /month for 3 months
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Then ${ONGOING_MONTHLY_PRICE.toFixed(2)}/month for ongoing access
                    to updated content and your live skill scores.
                  </p>
                </div>
                <ul className="mt-8 space-y-3">
                  {[
                    "94 hands-on projects with video walkthroughs",
                    "3 portfolio-ready capstone projects",
                    "Industry-specific modules for your field",
                    "Content updated every day",
                    "Dynamic scores that employers can verify",
                    "Tech Radar — 47+ tools tracked daily",
                    "No ads, no upsells, no hidden premium tier",
                  ].map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm">
                      <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-8 space-y-3">
                  <Button className="w-full" size="lg" asChild>
                    <Link href="/signup">Create Free Account</Link>
                  </Button>
                  <p className="text-center text-xs text-muted-foreground">
                    Start with free labs — no credit card required.
                  </p>
                </div>
                <p className="mt-6 text-center text-xs text-muted-foreground">
                  No yearly price. Cancel anytime. No lock-in. No penalty.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Section 6: Final CTA */}
      <section className="py-20 md:py-28">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            The best time to learn AI was six months ago. The second best time is right now.
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Every week you wait, the gap between people who can use AI and people who cannot
            gets wider. One course. Three months. Five hours a week. No coding. No theory.
            Just the skills that matter, updated every day so they stay relevant.
          </p>
          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Button size="lg" className="gap-2" asChild>
              <Link href="/signup">
                Create Free Account
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="gap-2" asChild>
              <Link href="/tech-radar">
                <Radar className="size-4" />
                Browse the Tech Radar
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  )
}
