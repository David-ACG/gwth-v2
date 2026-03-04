import Link from "next/link"
import type { Metadata } from "next"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  ArrowRight,
  Check,
  Minus,
  GraduationCap,
  Quote,
} from "lucide-react"
import { COURSE_MONTHLY_PRICE } from "@/lib/config"

export const metadata: Metadata = {
  title: "Why GWTH | Beyond the Government AI Skills Boost",
  description:
    "The UK government's AI Skills Boost covers the basics. GWTH.ai goes dramatically further with 94 hands-on projects, vendor-neutral training, and enterprise transformation over 3 months.",
}

/** Press quotes with source attribution, all sourced from research files. */
const pressQuotes = [
  {
    quote:
      "The hub is simply a bookmark or affiliate list of online courses that are already available.",
    source: "Computer Weekly",
    detail: "Digital sovereignty analysis",
  },
  {
    quote:
      "All 14 benchmarked courses come from US big tech companies\u2026 the opposite of positioning the UK as an AI maker, not an AI taker.",
    source: "Computer Weekly",
    detail: "On vendor dependency",
  },
  {
    quote: "A copy and paste of past failure.",
    source: "FE Week",
    detail: "Comparison to pandemic-era skills toolkits",
  },
  {
    quote:
      "The website feels messy. I am an everyday person. I do not want to be a programmer. I just want to understand how to use AI.",
    source: "User feedback",
    detail: "AI Skills Hub user testing",
  },
  {
    quote:
      "The AI Skills Hub seems mostly to consist of rehashed sales propaganda written by big tech and low-quality slide decks meant for other countries.",
    source: "Ed Newton-Rex",
    detail: "AI researcher and Fairly Trained founder",
  },
]

/** Comparison table rows: dimension, government description, GWTH description, whether GWTH has advantage. */
const comparisonRows = [
  {
    dimension: "Price",
    government: "Free",
    gwth: `\u00A3${COURSE_MONTHLY_PRICE.toFixed(2)}/month for 3 months`,
    gwthAdvantage: false,
  },
  {
    dimension: "Depth",
    government: "Foundation (20 min \u2013 9 hrs per course)",
    gwth: "Comprehensive (120+ hrs over 3 months)",
    gwthAdvantage: true,
  },
  {
    dimension: "Scope",
    government: "Basic AI awareness and prompting",
    gwth: "Use, Implement, Build, Transform",
    gwthAdvantage: true,
  },
  {
    dimension: "Hands-on projects",
    government: "None",
    gwth: "94 projects with video walkthroughs",
    gwthAdvantage: true,
  },
  {
    dimension: "Tool bias",
    government: "Vendor-specific (Google, Microsoft, Amazon)",
    gwth: "Independent, vendor-neutral",
    gwthAdvantage: true,
  },
  {
    dimension: "Content freshness",
    government: "Static, some courses from 2023\u20132024",
    gwth: "Updated every day via Tech Radar",
    gwthAdvantage: true,
  },
  {
    dimension: "Enterprise content",
    government: "None",
    gwth: "Month 3: governance, ROI, change management",
    gwthAdvantage: true,
  },
  {
    dimension: "Progression pathway",
    government: "None beyond foundation",
    gwth: "3-month structured pathway",
    gwthAdvantage: true,
  },
  {
    dimension: "Assessment",
    government: "Badge on completion",
    gwth: "Dynamic scoring that stays current",
    gwthAdvantage: true,
  },
  {
    dimension: "Community",
    government: "None",
    gwth: "Peer support, forums, office hours",
    gwthAdvantage: true,
  },
  {
    dimension: "UK focus",
    government: "Courses from US companies",
    gwth: "Built in the UK, UK-focused content",
    gwthAdvantage: true,
  },
  {
    dimension: "Coding skills",
    government: "Not covered",
    gwth: "Progressive: no-code to AI-assisted coding",
    gwthAdvantage: true,
  },
  {
    dimension: "Automation",
    government: "Basic admin tasks",
    gwth: "Full pipeline: Zapier to n8n to custom systems",
    gwthAdvantage: true,
  },
]

/** Key UK statistics for the numbers grid. */
const stats = [
  { value: "21%", label: "of UK workers feel confident using AI" },
  { value: "1 in 6", label: "UK businesses were using AI as of mid-2025" },
  {
    value: "\u00A3400bn",
    label: "potential AI contribution to UK economy by 2030",
  },
  { value: "94", label: "hands-on projects in the GWTH course" },
]

/**
 * Why GWTH comparison page.
 * Provides a factual, evidence-based comparison between the UK government's
 * AI Skills Boost programme and GWTH.ai, using real press quotes and statistics.
 */
export default function WhyGwthPage() {
  return (
    <>
      {/* JSON-LD structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: "Why GWTH | Beyond the Government AI Skills Boost",
            description:
              "The UK government's AI Skills Boost covers the basics. GWTH.ai goes dramatically further with 94 hands-on projects, vendor-neutral training, and enterprise transformation over 3 months.",
            url: "https://gwth.ai/why-gwth",
            provider: {
              "@type": "Organization",
              name: "GWTH.ai",
              url: "https://gwth.ai",
            },
          }),
        }}
      />

      {/* Section 1: Hero */}
      <section className="py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="relative mx-auto mb-6 h-28 w-28">
              <div
                className="absolute inset-4 rounded-2xl opacity-40 blur-xl"
                style={{ backgroundColor: "#33BBFF" }}
              />
              <div
                className="relative flex h-full w-full items-center justify-center rounded-2xl bg-background shadow-xl"
                style={{
                  border: "2px solid #33BBFF30",
                  transform: "translateY(-4px)",
                }}
              >
                <GraduationCap
                  className="h-12 w-12"
                  style={{ color: "#33BBFF" }}
                  strokeWidth={1.5}
                />
              </div>
            </div>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              Completed the AI Skills Boost?
              <br />
              Here is what comes next.
            </h1>
            <p className="mt-6 text-lg text-muted-foreground">
              The UK government has the right idea &mdash; upskilling the nation
              on AI is essential. But there is a gap between a 20-minute
              foundation course and the skills that actually transform careers
              and businesses.
            </p>
            <p className="mt-4 text-xl font-semibold text-primary">
              Only 21% of UK workers feel confident using AI at work.
            </p>
            <p className="mt-2 text-sm text-muted-foreground italic">
              Source: UK Government / DSIT research, January 2026
            </p>
          </div>
        </div>
      </section>

      {/* Section 2: What the Government Programme Covers */}
      <section className="border-t bg-muted/30 py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              What the Government Programme Covers
            </h2>
            <div className="mt-8 space-y-4 text-lg leading-relaxed text-muted-foreground">
              <p>
                The AI Skills Boost is a government-backed programme targeting 10
                million UK workers by 2030. It offers 14 free, benchmarked
                foundation courses from eight technology providers &mdash;
                including Google, Microsoft, Amazon, IBM, and Salesforce &mdash;
                covering basic AI awareness, prompting, and responsible use.
              </p>
              <p>
                Courses range from 20 minutes to 9 hours. Completers receive a
                government-backed virtual AI Foundations Badge, benchmarked
                against Skills England&apos;s AI Foundation Skills for Work
                Framework. The programme is delivered by PwC under a
                &pound;4.1&nbsp;million contract.
              </p>
              <p className="font-medium text-foreground">
                This is a good starting point. The government calls it &ldquo;the
                biggest targeted training programme since the Open
                University.&rdquo; We agree with the ambition. The question is
                whether 20 minutes of vendor-produced content is enough to
                transform how people actually work.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: What the Press Says */}
      <section className="py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              What the Press Says
            </h2>
            <p className="mt-4 text-muted-foreground">
              The AI Skills Hub has received significant scrutiny since launch.
              These are real quotes from published sources.
            </p>
          </div>
          <div className="mx-auto mt-12 max-w-3xl space-y-6">
            {pressQuotes.map((item) => (
              <Card
                key={item.quote}
                className="border-l-4 border-l-primary"
              >
                <CardContent className="p-6">
                  <div className="flex gap-3">
                    <Quote className="mt-1 size-5 shrink-0 text-primary opacity-60" />
                    <div>
                      <p className="text-lg italic leading-relaxed">
                        &ldquo;{item.quote}&rdquo;
                      </p>
                      <p className="mt-3 text-sm text-muted-foreground">
                        <span className="font-semibold">{item.source}</span>
                        {" \u2014 "}
                        {item.detail}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Section 4: Side-by-Side Comparison Table */}
      <section className="border-t bg-muted/30 py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Side-by-Side Comparison
            </h2>
            <p className="mt-4 text-muted-foreground">
              A factual comparison of what each programme offers.
            </p>
          </div>

          {/* Desktop table (md and above) */}
          <div className="mx-auto mt-12 hidden max-w-5xl md:block">
            <div className="overflow-hidden rounded-lg border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="px-6 py-4 text-left font-semibold">
                      Dimension
                    </th>
                    <th className="px-6 py-4 text-left font-semibold">
                      Government AI Skills Boost
                    </th>
                    <th className="px-6 py-4 text-left font-semibold">
                      GWTH.ai
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonRows.map((row, index) => (
                    <tr
                      key={row.dimension}
                      className={index % 2 === 0 ? "bg-card" : "bg-muted/20"}
                    >
                      <td className="px-6 py-4 font-medium">{row.dimension}</td>
                      <td className="px-6 py-4 text-muted-foreground">
                        <span className="inline-flex items-center gap-2">
                          <Minus className="size-4 shrink-0 text-muted-foreground/50" />
                          {row.government}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-2">
                          {row.gwthAdvantage ? (
                            <Check className="size-4 shrink-0 text-green-600 dark:text-green-400" />
                          ) : (
                            <Minus className="size-4 shrink-0 text-muted-foreground/50" />
                          )}
                          {row.gwth}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile stacked cards (below md) */}
          <div className="mx-auto mt-12 max-w-lg space-y-4 md:hidden">
            {comparisonRows.map((row) => (
              <Card key={row.dimension}>
                <CardContent className="p-4">
                  <h3 className="font-semibold">{row.dimension}</h3>
                  <div className="mt-3 space-y-2 text-sm">
                    <div className="flex items-start gap-2">
                      <Minus className="mt-0.5 size-4 shrink-0 text-muted-foreground/50" />
                      <div>
                        <span className="text-xs font-medium text-muted-foreground">
                          Government
                        </span>
                        <p className="text-muted-foreground">
                          {row.government}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      {row.gwthAdvantage ? (
                        <Check className="mt-0.5 size-4 shrink-0 text-green-600 dark:text-green-400" />
                      ) : (
                        <Minus className="mt-0.5 size-4 shrink-0 text-muted-foreground/50" />
                      )}
                      <div>
                        <span className="text-xs font-medium text-primary">
                          GWTH.ai
                        </span>
                        <p>{row.gwth}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Section 5: The Numbers */}
      <section className="py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              The Numbers
            </h2>
          </div>
          <div className="mx-auto mt-12 grid max-w-4xl grid-cols-2 gap-8 md:grid-cols-4">
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
          <p className="mx-auto mt-8 max-w-2xl text-center text-sm text-muted-foreground italic">
            Statistics from UK Government / DSIT research (January 2026) and
            GWTH.ai course data.
          </p>
        </div>
      </section>

      {/* Section 6: GWTH Fills the Gap */}
      <section className="border-t bg-muted/30 py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              GWTH Fills the Gap
            </h2>
            <div className="mt-8 space-y-6 text-lg leading-relaxed text-muted-foreground">
              <p>
                The government programme is not a competitor &mdash; it is a
                starting point. We welcome every worker who earns their AI
                Foundations Badge. The goal is the same: get the UK workforce
                confident and capable with AI.
              </p>
              <p>
                GWTH covers everything the government programme does in the first
                two weeks of Month&nbsp;1. The remaining ten weeks go dramatically
                further &mdash; from advanced prompting and vendor-neutral tool
                evaluation to building real applications, automating workflows,
                and analysing data with AI.
              </p>
              <p>
                Months 2 and 3 have zero government equivalent. Enterprise-scale
                AI transformation, multi-agent systems, governance frameworks,
                ROI measurement, and change management &mdash; none of this
                exists in the government programme, yet it is precisely what UK
                businesses need to capture the &pound;400&nbsp;billion AI
                opportunity.
              </p>
              <p className="font-medium text-foreground">
                GWTH is the natural next step after the government badge. Not a
                replacement &mdash; a continuation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 7: CTA */}
      <section className="py-20 md:py-28">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Start Where the Government Stops
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            The foundation is free. The transformation is
            &pound;{COURSE_MONTHLY_PRICE.toFixed(2)}/month for 3 months. 94
            projects, vendor-neutral, updated every day, built in the UK.
          </p>
          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Button size="lg" className="gap-2" asChild>
              <Link href="/signup">
                Get Started
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/pricing">See Our Pricing</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/labs">Try a Free Lab</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  )
}
