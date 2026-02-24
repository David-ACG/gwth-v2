import Link from "next/link"
import type { Metadata } from "next"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Shield,
  RefreshCw,
  Trophy,
  Heart,
  Code2,
  Wrench,
  ArrowRight,
  Radar,
} from "lucide-react"

export const metadata: Metadata = {
  title: "About",
  description:
    "GWTH.ai is an independent AI course built by practitioners, not marketers. 94 projects, 47+ tools tracked daily, updated every day. No sponsors, no ads, no vendor partnerships.",
}

const principles = [
  {
    icon: Code2,
    color: "#33BBFF",
    title: "If you can describe it in plain English, you can build it with AI.",
    description:
      "Every project in this course is built by describing what you want to an AI tool. No syntax to memorise. No frameworks to install. The skill is knowing what to ask for and how to guide the result.",
  },
  {
    icon: Wrench,
    color: "#4A6CF7",
    title: "Build, don't just learn.",
    description:
      "Every single lesson ends with a practical output you can use, show to someone, or put in a portfolio. Theory without application is entertainment, not education.",
  },
  {
    icon: Trophy,
    color: "#F59E0B",
    title: "Real problems, not toy examples.",
    description:
      "You will not build a to-do app. You will build things that solve actual problems — automate a workflow, analyse real data, deploy something on a real domain. The kind of work people get paid to do.",
  },
]

const differentiators = [
  {
    icon: RefreshCw,
    color: "#0E7C7B",
    title: "Updated every day",
    description:
      "Our Tech Radar scans 47+ AI tools every single day. When a tool gets replaced by something better, we update the lesson that same day. Most courses are out of date before you finish them. Ours never is.",
  },
  {
    icon: Trophy,
    color: "#F59E0B",
    title: "Dynamic scoring that stays current",
    description:
      "Your scores are not a snapshot of what you knew on test day. They are living assessments tied to the tools that exist right now. When the landscape shifts, your scores update to reflect current relevance.",
  },
  {
    icon: Heart,
    color: "#E53935",
    title: "Video walkthroughs for every project",
    description:
      "Every single one of the 94 projects includes a step-by-step video where the instructor builds it alongside you. You are never left staring at a blank screen wondering what to do next.",
  },
  {
    icon: Wrench,
    color: "#4A6CF7",
    title: "Designed by practitioners, not marketers",
    description:
      "Built by someone who has shipped enterprise software for 25 years and has been building with AI tools from day one. Not by a marketing team who discovered AI last year and saw a business opportunity.",
  },
]

const stats = [
  { value: "94", label: "Hands-on projects" },
  { value: "47+", label: "Tools tracked daily" },
  { value: "3", label: "Months to completion" },
  { value: "3", label: "Capstone projects" },
]

/**
 * About page describing GWTH.ai's story, philosophy, independence pledge,
 * differentiators, key numbers, and call to action.
 */
export default function AboutPage() {
  return (
    <>
      {/* Section 1: Hero */}
      <section className="py-20 md:py-28">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            An AI course that is actually honest with you.
          </h1>
          <p className="mt-6 text-lg text-muted-foreground">
            Most AI courses are built by marketers who learned AI last year.
            GWTH is built by a solution architect with 25 years of enterprise
            experience who has been building with AI tools from day one — from
            the first release of Cursor to the first release of Claude Code.
          </p>
        </div>
      </section>

      {/* Section 2: The GWTH Story */}
      <section className="border-t bg-muted/30 py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              The GWTH Story
            </h2>
            <div className="mt-8 space-y-6 text-lg leading-relaxed text-muted-foreground">
              <p>
                GWTH started with a simple observation: the people teaching AI
                courses were not the people actually building with AI. They were
                content creators who spotted a trend, repackaged documentation
                into slide decks, and charged a premium for information you could
                find for free.
              </p>
              <p>
                The founder of GWTH is a solution architect with 25 years of
                enterprise experience. Not 25 years of teaching — 25 years of
                building software that businesses depend on. When AI tools
                started shipping, he was one of the first to use them in
                production. From the first release of Cursor to the first
                release of Claude Code, he was there — not watching demos,
                but building real things.
              </p>
              <p>
                That experience shapes every part of this course. The projects
                are not contrived examples designed to make the tool look good.
                They are the kind of problems you actually encounter when you
                try to build something real. The recommendations are not based
                on who sponsors the channel. They are based on testing every
                alternative and picking the one that works best.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Our Philosophy */}
      <section className="py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Our Philosophy
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Three principles guide everything we build.
            </p>
          </div>
          <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-3">
            {principles.map((item) => (
              <Card
                key={item.title}
                className="transition-all duration-200 hover:shadow-lg hover:-translate-y-1"
              >
                <CardContent className="p-6">
                  <div
                    className="mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-card shadow-xl"
                    style={{ border: `1.5px solid ${item.color}30` }}
                  >
                    <item.icon
                      className="h-10 w-10"
                      style={{ color: item.color }}
                      strokeWidth={1.5}
                    />
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

      {/* Section 4: Independence Pledge */}
      <section className="border-t bg-muted/30 py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <div className="flex items-start gap-4">
              <div className="shrink-0">
                <div
                  className="flex h-16 w-16 items-center justify-center rounded-2xl bg-card shadow-xl"
                  style={{ border: "1.5px solid #388E3C30" }}
                >
                  <Shield
                    className="h-8 w-8"
                    style={{ color: "#388E3C" }}
                    strokeWidth={1.5}
                  />
                </div>
              </div>
              <div>
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                  Independence Pledge
                </h2>
                <div className="mt-6 space-y-4 text-lg leading-relaxed text-muted-foreground">
                  <p>
                    GWTH has no sponsors. No ads. No vendor partnerships. No
                    affiliate links. No revenue share agreements with any tool
                    we recommend.
                  </p>
                  <p>
                    When we tell you that Tool A is better than Tool B, it is
                    because we tested both of them — and every other alternative
                    — against the same set of real-world tasks. Our only
                    incentive is to give you the best possible recommendation,
                    because that is the only thing that keeps you subscribed.
                  </p>
                  <p>
                    This matters more in AI than in any other field. The tools
                    change every week. The companies behind them spend enormous
                    amounts on influencer marketing. If your instructor has a
                    partnership with a tool vendor, their recommendations are
                    compromised whether they admit it or not.
                  </p>
                  <p className="font-medium text-foreground">
                    Our revenue comes from subscriptions. That is it. Your trust
                    is the only thing we sell to.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 5: What Makes Us Different */}
      <section className="py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              What Makes Us Different
            </h2>
          </div>
          <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2">
            {differentiators.map((item) => (
              <Card
                key={item.title}
                className="transition-all duration-200 hover:shadow-lg hover:-translate-y-1"
              >
                <CardContent className="flex gap-4 p-6">
                  <div className="shrink-0">
                    <div
                      className="flex h-16 w-16 items-center justify-center rounded-2xl bg-card shadow-xl"
                      style={{ border: `1.5px solid ${item.color}30` }}
                    >
                      <item.icon
                        className="h-8 w-8"
                        style={{ color: item.color }}
                        strokeWidth={1.5}
                      />
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

      {/* Section 6: The Numbers */}
      <section className="border-t bg-muted/30 py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              The Numbers
            </h2>
          </div>
          <div className="mx-auto mt-12 grid max-w-3xl grid-cols-2 gap-8 md:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-4xl font-bold text-primary">
                  {stat.value}
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 7: CTA */}
      <section className="py-20 md:py-28">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            See for yourself.
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Our labs are free. No credit card. No trial that expires. Pick one,
            build something with AI, and decide if this is the kind of course
            you have been looking for.
          </p>
          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Button size="lg" className="gap-2" asChild>
              <Link href="/labs">
                Start with a Free Lab
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
