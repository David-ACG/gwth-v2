import Link from "next/link"
import type { Metadata } from "next"
import {
  Users,
  Shield,
  Trophy,
  ArrowRight,
  MessageSquare,
  Check,
  Radar,
  Zap,
  ListChecks,
  Clock,
  BarChart3,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion"
import {
  COURSE_MONTHLY_PRICE,
  ONGOING_MONTHLY_PRICE,
  TOTAL_COURSE_COST,
  TOTAL_MANDATORY_LESSONS,
  TOTAL_OPTIONAL_LESSONS,
} from "@/lib/config"
import { UK_STATS, RESEARCH_SOURCES } from "@/components/marketing/data"

export const metadata: Metadata = {
  title: "AI Training for UK Teams",
  description:
    "Upskill your UK team with hands-on AI training. 94 projects, no coding required, vendor-neutral. Choose the syllabus that fits each role. £29/month per person for 3 months.",
}

type WhyItem = {
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>
  title: string
  description: string
}

const whyGwth: readonly WhyItem[] = [
  {
    icon: Zap,
    title: "Zero wasted time",
    description:
      "No repetition. No filler. No outdated material. Every lesson teaches the newest, most relevant applied AI skills. Your team's time is more valuable than the course — we treat it that way.",
  },
  {
    icon: Trophy,
    title: "94 hands-on projects with video walkthroughs",
    description:
      "Not slides. Not theory. Every lesson ends with a real project your team members build themselves, with a step-by-step video walkthrough for every single one.",
  },
  {
    icon: Users,
    title: "No coding required",
    description:
      "Everything is built by describing what you want in plain English. Your marketing team, your operations team, your finance team — they can all do this.",
  },
  {
    icon: ListChecks,
    title: "You choose the syllabus",
    description: `${TOTAL_MANDATORY_LESSONS} essential lessons are mandatory. ${TOTAL_OPTIONAL_LESSONS} optional lessons cover industry-specific and advanced topics. Team admins assign the right optional lessons to each role — no one wastes time on irrelevant content.`,
  },
  {
    icon: Radar,
    title: "Vendor-neutral (Tech Radar tracks 60+ tools)",
    description:
      "We do not sell tools. Our Tech Radar evaluates 60+ AI tools every day so your team learns the best option, not the one that paid for placement.",
  },
  {
    icon: BarChart3,
    title: "Dynamic certification",
    description:
      "Our scores reflect current competence, not a one-time exam. When tools change, assessments update. Scores that are six months old look six months old.",
  },
  {
    icon: Shield,
    title: "Built for the enterprise conversation",
    description:
      "Month 3 covers governance, ROI measurement, change management, and multi-agent systems. The strategic layer that boards and compliance teams need to hear.",
  },
]

const months = [
  {
    month: 1,
    title: "Personal AI Mastery",
    lessons: "24 mandatory",
    description:
      "From first AI conversation to building real tools — apps, websites, dashboards, research projects, and automations — by typing plain English.",
  },
  {
    month: 2,
    title: "Professional & Industry Application",
    lessons: "20 mandatory + 15 optional",
    description:
      "Industry-specific modules for healthcare, legal, finance, travel, creative, marketing, and HR. Your team builds applications that solve problems in their actual field.",
  },
  {
    month: 3,
    title: "Enterprise Transformation",
    lessons: "20 mandatory + 15 optional",
    description:
      "Multi-agent systems, self-hosted AI, governance frameworks, ROI measurement, and change management. The strategic layer that turns individual skills into organisational capability.",
  },
]

const faqs = [
  {
    question: "Can we choose which lessons our team completes?",
    answer: `Yes. The ${TOTAL_MANDATORY_LESSONS} mandatory lessons cover essential AI skills that everyone needs. Beyond that, there are ${TOTAL_OPTIONAL_LESSONS} optional lessons covering industry-specific applications, advanced topics, and specialisations. Team admins can assign relevant optional lessons per role — your marketing team does not need the same modules as your engineering team. Individual learners can also pick their own path from the optional lessons.`,
  },
  {
    question: "Will this displace our employees?",
    answer:
      "No. This course makes your existing team more productive. People who can use AI effectively are more valuable, not less. UK employment law provides strong protections, and the government's own AI strategy emphasises augmentation over replacement. Companies investing in AI training retain 34% more staff because employees feel invested in rather than threatened.",
  },
  {
    question: "Is our data safe?",
    answer:
      "The course teaches your team how to use AI responsibly, including when to use private/local models versus cloud APIs. Month 3 includes governance frameworks specifically designed for enterprise data handling. Your team will understand the security implications before they start building.",
  },
  {
    question: "What is the ROI?",
    answer: `The entire course costs £${TOTAL_COURSE_COST.toFixed(2)} per person over 3 months — less than 5 hours of an employee earning £30,000 a year. By Month 1, your team will be automating tasks that currently take hours. By Month 3, they will be building internal tools and leading AI transformation initiatives. The course pays for itself in the first week.`,
  },
  {
    question: "Our team is not technical. Is this appropriate?",
    answer:
      "This course was designed specifically for non-technical people. No coding. No command line. No technical prerequisites. Everything is built by describing what you want in plain English. If your team can write an email, they can complete this course.",
  },
  {
    question: "How is this different from vendor-specific training?",
    answer:
      "Vendor training teaches you one tool. We teach the skill of working with AI, using whichever tool is best for the job. Our Tech Radar tracks 60+ tools daily — when something better appears, we update the course immediately. Your team learns transferable skills, not product-specific workflows that become obsolete.",
  },
  {
    question: "How does this compare to the government's AI Skills Boost?",
    answer:
      "The government programme covers AI awareness basics in 20 minutes to 9 hours. That is roughly equivalent to our first two weeks. GWTH goes dramatically further — 94 hands-on projects, industry-specific modules, enterprise transformation, and content updated every day. Many teams complete the free government badge first, then use GWTH for the comprehensive skills their people actually need.",
  },
  {
    question: "Can employees complete this during working hours?",
    answer:
      "Many companies do exactly this, and it is the most effective approach. At 5 hours per week for 3 months, the time investment is modest. Because every lesson is practical and immediately applicable, employees start returning value from week one. The syllabus flexibility means admins can prioritise lessons most relevant to each team's daily work.",
  },
  {
    question: "Can we pilot with a small group first?",
    answer:
      "Absolutely. There is no minimum team size and no contract. Start with 2 people or 200. The admin dashboard is available for teams of 5+, but smaller groups work perfectly well with individual accounts.",
  },
  {
    question: "Can you create bespoke content for our company?",
    answer:
      "Yes. For teams of 100+, we can create bespoke lessons tailored specifically to your company's workflows, tools, and industry challenges. This means your team learns AI skills in the context of the work they actually do every day — not generic examples they have to mentally translate. Get in touch to discuss your requirements.",
  },
]

const howItWorks = [
  { label: "3 months", detail: "structured curriculum" },
  { label: "5 hours/week", detail: "per team member" },
  { label: "Fully online", detail: "no travel required" },
  { label: "Self-paced", detail: "fits any schedule" },
  { label: "Daily updates", detail: "always current" },
] as const

/**
 * /for-teams — B2B landing page. Editorial mast-head, then nine sections
 * (stats → time-cost framing → why → syllabus → how → investment → FAQ
 * → CTA). Visual vocabulary matches the homepage marketing components:
 * mono section eyebrows, `bg-card border-border` panels, no decorative
 * icon blobs. Lucide icons are used inline (functionally, next to
 * headings) rather than wrapped in coloured circles.
 */
export default function ForTeamsPage() {
  const teamPriceFeatures = [
    "Same price for teams — no bulk discount because it is already the lowest possible price",
    "No minimum contract, no lock-in",
    "Teams of 5+ get an admin dashboard with progress tracking and completion rates",
    "Admin chooses which optional lessons each role completes",
    "Cancel anytime, per seat",
  ]

  const syllabusBullets = [
    `${TOTAL_MANDATORY_LESSONS} mandatory lessons cover the essential AI skills everyone needs — no choices required`,
    `${TOTAL_OPTIONAL_LESSONS} optional lessons cover industry-specific and advanced topics`,
    "Team admins assign relevant optional lessons per role via the dashboard",
    "Individual learners (non-team) pick their own path from optional lessons",
    "Progress tracking shows completion rates per person and per department",
  ]

  return (
    <>
      {/* Section 1 — Mast-head */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 md:py-20 lg:px-8">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
            For Teams · UK
          </p>
          <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
            AI Training for Your Team
          </h1>
          <p className="mt-5 text-xl text-muted-foreground">
            UK businesses are falling behind on AI skills. The gap is not tools —
            it is training.
          </p>
        </div>
      </section>

      {/* Section 2 — UK research stats */}
      <section data-section="for-teams-stats" className="py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
              The numbers
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              The numbers are clear
            </h2>
          </div>
          <div className="mx-auto mt-12 grid max-w-4xl gap-6 sm:grid-cols-3">
            {UK_STATS.map((stat) => (
              <div
                key={stat.value}
                data-testid="for-teams-stat"
                className="rounded-2xl border border-border bg-card p-6 text-center shadow-sm"
              >
                <div
                  className="text-5xl font-bold tracking-tight text-foreground sm:text-6xl"
                  style={{ fontFeatureSettings: "'tnum'" }}
                >
                  {stat.value}
                </div>
                <p className="mt-3 text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
          <p className="mx-auto mt-8 max-w-2xl text-center font-mono text-xs uppercase tracking-wide text-muted-foreground">
            Source: UK Government / DSIT (Jan 2026) · {RESEARCH_SOURCES.join(" · ")}
          </p>
          <p className="mx-auto mt-6 max-w-2xl text-center text-muted-foreground">
            Most AI training fails because it teaches tools, not skills. The UK
            government&apos;s own research shows only 21% of workers feel
            confident using AI. A 20-minute vendor course will not change that.
            120 hours of hands-on, vendor-neutral training will.
          </p>
        </div>
      </section>

      {/* Section 3 — The Real Cost */}
      <section
        data-section="for-teams-time-cost"
        className="border-y border-border bg-muted/40 py-20 md:py-24"
      >
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              The real cost is not the course. It is your team&apos;s time.
            </h2>
            <p className="mt-6 text-lg text-muted-foreground">
              At £{COURSE_MONTHLY_PRICE.toFixed(2)}/month for 3 months, the entire
              course costs{" "}
              <strong className="text-foreground">
                £{TOTAL_COURSE_COST.toFixed(2)} per person
              </strong>
              . That is less than 5 hours of an employee earning £30,000 a year.
            </p>
          </div>
          <div className="mx-auto mt-12 grid max-w-3xl gap-6 sm:grid-cols-2">
            <div className="rounded-2xl border border-border bg-background p-6">
              <div className="flex items-center gap-2">
                <Clock
                  className="size-5 text-muted-foreground"
                  aria-hidden="true"
                />
                <h3 className="font-semibold">Typical AI training</h3>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Padded with filler. Repetitive. Outdated within weeks. Your team
                spends 40 hours on content that could be covered in 10.
              </p>
            </div>
            <div className="rounded-2xl border border-primary/40 bg-background p-6 ring-1 ring-primary/10">
              <div className="flex items-center gap-2">
                <Zap className="size-5 text-primary" aria-hidden="true" />
                <h3 className="font-semibold">GWTH</h3>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                No repetition. No filler. Only the newest, most relevant applied
                AI topics. Every minute of your team&apos;s time produces a
                practical skill they use immediately.
              </p>
            </div>
          </div>
          <p className="mx-auto mt-8 max-w-2xl text-center text-sm text-muted-foreground">
            When your employees complete lessons during working hours — as many
            companies encourage — the quality and efficiency of every lesson
            matters even more. You want zero wasted time. That is exactly what
            we deliver.
          </p>
        </div>
      </section>

      {/* Section 4 — Why GWTH for Teams (numbered grid, no icon-blobs) */}
      <section data-section="why-gwth" className="py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
              Differentiators
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              Why GWTH for Teams
            </h2>
          </div>
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {whyGwth.map((item, i) => (
              <article
                key={item.title}
                className="flex h-full flex-col rounded-2xl border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="flex items-center gap-3">
                  <span
                    className="font-mono text-xs uppercase tracking-wide text-muted-foreground"
                    aria-hidden="true"
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <item.icon
                    className="size-5 text-primary"
                    aria-hidden={true}
                  />
                </div>
                <h3 className="mt-4 text-lg font-semibold tracking-tight">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {item.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Section 5 — Syllabus Flexibility */}
      <section
        data-section="for-teams-syllabus"
        className="border-y border-border bg-muted/40 py-20 md:py-24"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
              Syllabus
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              Complete control over what your team learns
            </h2>
            <p className="mt-4 text-muted-foreground">
              Not every role needs every lesson. The team admin dashboard lets
              you build the right syllabus for each department. Every concept is
              introduced with a clear explanation of why it matters — not just
              what it is — so your team stays engaged because they understand
              the practical benefit before learning the skill.
            </p>
          </div>
          <div className="mx-auto mt-12 grid max-w-5xl gap-6 md:grid-cols-3">
            {months.map((month) => (
              <article
                key={month.month}
                className="rounded-2xl border border-border bg-background p-6 shadow-sm"
              >
                <p className="font-mono text-xs uppercase tracking-wide text-muted-foreground">
                  Month {month.month}
                </p>
                <h3 className="mt-3 text-xl font-bold tracking-tight">
                  {month.title}
                </h3>
                <p className="mt-1 font-mono text-[11px] uppercase tracking-wide text-primary">
                  {month.lessons}
                </p>
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                  {month.description}
                </p>
              </article>
            ))}
          </div>
          <div className="mx-auto mt-12 max-w-3xl rounded-2xl border border-border bg-background p-6 shadow-sm">
            <h3 className="font-semibold">How syllabus control works</h3>
            <ul className="mt-4 space-y-3">
              {syllabusBullets.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2 text-sm text-foreground"
                >
                  <Check
                    className="mt-0.5 size-4 shrink-0 text-accent"
                    aria-hidden="true"
                  />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Section 6 — How It Works (mini-stat grid) */}
      <section data-section="for-teams-how" className="py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
              Logistics
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              How it works
            </h2>
          </div>
          <div className="mx-auto mt-10 grid max-w-3xl grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-3 md:grid-cols-5">
            {howItWorks.map((item) => (
              <div key={item.label} className="text-center">
                <div className="text-lg font-bold text-foreground">
                  {item.label}
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {item.detail}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 7 — Investment */}
      <section
        data-section="for-teams-investment"
        className="border-y border-border bg-muted/40 py-20 md:py-24"
      >
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
              Investment
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              Same per-person price for any team size.
            </h2>
          </div>
          <div className="mt-10 rounded-2xl border border-primary bg-background p-8 shadow-lg ring-1 ring-primary/10">
            <div className="text-center">
              <div className="text-5xl font-bold tracking-tight">
                £{COURSE_MONTHLY_PRICE.toFixed(2)}
                <span className="ml-1 text-lg font-normal text-muted-foreground">
                  /month per person
                </span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                for 3 months (£{TOTAL_COURSE_COST.toFixed(2)} total per person),
                then £{ONGOING_MONTHLY_PRICE.toFixed(2)}/month ongoing for
                continued access and live skill scores.
              </p>
            </div>
            <ul className="mt-8 space-y-3">
              {teamPriceFeatures.map((feature) => (
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
          </div>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            All prices in GBP. International pricing coming soon. See the full
            pricing breakdown on the{" "}
            <Link
              href="/pricing"
              className="font-medium text-primary hover:underline"
            >
              pricing page
            </Link>
            .
          </p>
        </div>
      </section>

      {/* Section 8 — FAQ */}
      <section data-section="for-teams-faq" className="py-20 md:py-24">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
              Questions
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              Frequently asked questions
            </h2>
          </div>
          <Accordion type="single" collapsible className="mt-10 w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={faq.question} value={`faq-${index}`}>
                <AccordionTrigger className="text-left">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent>
                  <p className="leading-relaxed text-muted-foreground">
                    {faq.answer}
                  </p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Section 9 — CTA */}
      <section
        data-section="for-teams-cta"
        className="border-t border-border py-20 md:py-24"
      >
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Ready to upskill your UK team?
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Get in touch to discuss your team&apos;s needs, or let your people
            try a free lab right now.
          </p>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Button size="lg" asChild>
              <Link href="/contact" className="gap-2">
                <MessageSquare className="size-4" aria-hidden="true" />
                Get in Touch
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/tech-radar" className="gap-2">
                <Radar className="size-4" aria-hidden="true" />
                Browse the Tech Radar
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/labs" className="gap-2">
                Try Free Labs
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  )
}
