import Link from "next/link"
import type { Metadata } from "next"
import {
  Users,
  Shield,
  Trophy,
  Briefcase,
  BarChart3,
  ArrowRight,
  MessageSquare,
  Check,
  Radar,
  Zap,
  ListChecks,
  Clock,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
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

export const metadata: Metadata = {
  title: "AI Training for Teams",
  description:
    "Upskill your team with hands-on AI training. 94 projects, no coding required, vendor-neutral. Choose the syllabus that fits each role. $37.50/month per person for 3 months.",
}

const whyGwth = [
  {
    icon: Zap,
    color: "#00ACC1",
    title: "Zero wasted time",
    description:
      "No repetition. No filler. No outdated material. Every lesson teaches the newest, most relevant applied AI skills. Your team's time is more valuable than the course — we treat it that way.",
  },
  {
    icon: Trophy,
    color: "#F59E0B",
    title: "94 hands-on projects with video walkthroughs",
    description:
      "Not slides. Not theory. Every lesson ends with a real project your team members build themselves, with a step-by-step video walkthrough for every single one.",
  },
  {
    icon: Users,
    color: "#33BBFF",
    title: "No coding required",
    description:
      "Everything is built by describing what you want in plain English. Your marketing team, your operations team, your finance team — they can all do this.",
  },
  {
    icon: ListChecks,
    color: "#1CBA93",
    title: "You choose the syllabus",
    description:
      `${TOTAL_MANDATORY_LESSONS} essential lessons are mandatory. ${TOTAL_OPTIONAL_LESSONS} optional lessons cover industry-specific and advanced topics. Team admins assign the right optional lessons to each role — no one wastes time on irrelevant content.`,
  },
  {
    icon: Radar,
    color: "#0E7C7B",
    title: "Vendor-neutral (Tech Radar tracks 60+ tools)",
    description:
      "We do not sell tools. Our Tech Radar evaluates 60+ AI tools every day so your team learns the best option, not the one that paid for placement.",
  },
  {
    icon: BarChart3,
    color: "#4A6CF7",
    title: "Dynamic certification",
    description:
      "Our scores reflect current competence, not a one-time exam. When tools change, assessments update. Scores that are six months old look six months old.",
  },
  {
    icon: Shield,
    color: "#388E3C",
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
    answer:
      `Yes. The ${TOTAL_MANDATORY_LESSONS} mandatory lessons cover essential AI skills that everyone needs. Beyond that, there are ${TOTAL_OPTIONAL_LESSONS} optional lessons covering industry-specific applications, advanced topics, and specialisations. Team admins can assign relevant optional lessons per role — your marketing team does not need the same modules as your engineering team. Individual learners can also pick their own path from the optional lessons.`,
  },
  {
    question: "Will this displace our employees?",
    answer:
      "No. This course makes your existing team more productive. People who can use AI effectively are more valuable, not less. Companies investing in AI training retain 34% more staff because employees feel invested in rather than threatened.",
  },
  {
    question: "Is our data safe?",
    answer:
      "The course teaches your team how to use AI responsibly, including when to use private/local models versus cloud APIs. Month 3 includes governance frameworks specifically designed for enterprise data handling. Your team will understand the security implications before they start building.",
  },
  {
    question: "What is the ROI?",
    answer:
      `The entire course costs $${TOTAL_COURSE_COST.toFixed(2)} per person over 3 months — less than 5 hours of a $50k employee's time. By Month 1, your team will be automating tasks that currently take hours. By Month 3, they will be building internal tools and leading AI transformation initiatives. The course pays for itself in the first week.`,
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
    question: "Can employees complete this during working hours?",
    answer:
      "Many companies do exactly this, and it is the most effective approach. At 5 hours per week for 3 months, the time investment is modest. Because every lesson is practical and immediately applicable, employees start returning value from week one. The syllabus flexibility means admins can prioritise lessons most relevant to each team's daily work.",
  },
  {
    question: "Can we pilot with a small group first?",
    answer:
      "Absolutely. There is no minimum team size and no contract. Start with 2 people or 200. The admin dashboard is available for teams of 5+, but smaller groups work perfectly well with individual accounts.",
  },
]

/**
 * Teams/employer landing page.
 * Presents the business case for team AI training with emphasis on
 * time efficiency, syllabus flexibility, and practical value.
 */
export default function ForTeamsPage() {
  return (
    <div>
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
                <Briefcase
                  className="h-12 w-12"
                  style={{ color: "#33BBFF" }}
                  strokeWidth={1.5}
                />
              </div>
            </div>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              AI Training for Your Team
            </h1>
            <p className="mt-4 text-xl text-muted-foreground">
              The gap is not tools. It is skills.
            </p>
          </div>
        </div>
      </section>

      {/* Section 2: Business Case */}
      <section className="border-t bg-muted/30 py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              The numbers are clear
            </h2>
          </div>
          <div className="mx-auto mt-12 grid max-w-4xl grid-cols-1 gap-6 sm:grid-cols-3">
            {[
              {
                stat: "5%",
                label: "of companies generate meaningful value from AI at scale",
              },
              {
                stat: "70%",
                label: "of digital transformations fail due to people and process",
              },
              {
                stat: "34%",
                label: "more staff retained by companies investing in AI training",
              },
            ].map((item) => (
              <Card key={item.stat}>
                <CardContent className="p-6 text-center">
                  <div className="text-4xl font-bold text-primary">
                    {item.stat}
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {item.label}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
          <p className="mx-auto mt-8 max-w-2xl text-center text-muted-foreground">
            Most AI training fails because it teaches tools, not skills. Your team
            finishes a vendor workshop, the tool updates, and everything they learned
            is obsolete. We teach the skill of working with AI — which tool is best
            changes every week, but the skill transfers.
          </p>
        </div>
      </section>

      {/* Section 3: The Real Cost */}
      <section className="py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <div className="text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                The real cost is not the course. It is your team&apos;s time.
              </h2>
              <p className="mt-6 text-lg text-muted-foreground">
                At ${COURSE_MONTHLY_PRICE.toFixed(2)}/month for 3 months, the entire
                course costs <strong className="text-foreground">${TOTAL_COURSE_COST.toFixed(2)} per person</strong>.
                That is less than 5 hours of an employee earning $50k a year.
              </p>
            </div>
            <div className="mx-auto mt-12 grid max-w-2xl grid-cols-1 gap-6 sm:grid-cols-2">
              <Card>
                <CardContent className="p-6">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
                    <Clock className="size-5 text-destructive" />
                  </div>
                  <h3 className="font-semibold">Typical AI training</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Padded with filler. Repetitive. Outdated within weeks.
                    Your team spends 40 hours on content that could be
                    covered in 10.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-primary/50">
                <CardContent className="p-6">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <Zap className="size-5 text-primary" />
                  </div>
                  <h3 className="font-semibold">GWTH</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    No repetition. No filler. Only the newest, most relevant
                    applied AI topics. Every minute of your team&apos;s time
                    produces a practical skill they use immediately.
                  </p>
                </CardContent>
              </Card>
            </div>
            <p className="mx-auto mt-8 max-w-2xl text-center text-sm text-muted-foreground">
              When your employees complete lessons during working hours — as many
              companies encourage — the quality and efficiency of every lesson
              matters even more. You want zero wasted time. That is exactly what
              we deliver.
            </p>
          </div>
        </div>
      </section>

      {/* Section 4: Why GWTH for Teams */}
      <section className="border-t bg-muted/30 py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Why GWTH for Teams
            </h2>
          </div>
          <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {whyGwth.map((item) => (
              <Card
                key={item.title}
                className="text-center transition-shadow hover:shadow-lg"
              >
                <CardContent className="p-6">
                  <div className="relative mx-auto mb-4 h-28 w-28">
                    <div
                      className="absolute inset-4 rounded-2xl opacity-40 blur-xl"
                      style={{ backgroundColor: item.color }}
                    />
                    <div
                      className="relative flex h-full w-full items-center justify-center rounded-2xl bg-background shadow-xl"
                      style={{
                        border: `2px solid ${item.color}30`,
                        transform: "translateY(-4px)",
                      }}
                    >
                      <item.icon
                        className="h-12 w-12"
                        style={{ color: item.color }}
                        strokeWidth={1.5}
                      />
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold">{item.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {item.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Section 5: Syllabus Flexibility */}
      <section className="py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Complete control over what your team learns
            </h2>
            <p className="mt-4 text-muted-foreground">
              Not every role needs every lesson. The team admin dashboard lets
              you build the right syllabus for each department. Month 1 is
              designed for individuals and families first — personal AI mastery
              that naturally adapts to any team context.
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Every concept is introduced with a clear explanation of why it matters — not
              just what it is. That &quot;why you should care&quot; approach means your team
              members stay engaged because they understand the practical benefit before
              learning the skill.
            </p>
          </div>
          <div className="mx-auto mt-12 grid max-w-4xl grid-cols-1 gap-6 md:grid-cols-3">
            {months.map((month) => (
              <Card
                key={month.month}
                className="group relative overflow-hidden transition-all duration-200 hover:shadow-lg hover:-translate-y-1"
              >
                <CardContent className="p-6">
                  <div className="mb-2 text-sm font-medium text-primary">
                    Month {month.month}
                  </div>
                  <h3 className="text-xl font-bold">{month.title}</h3>
                  <p className="mt-1 text-xs font-medium text-accent">
                    {month.lessons}
                  </p>
                  <p className="mt-3 text-sm text-muted-foreground">
                    {month.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="mx-auto mt-10 max-w-2xl">
            <div className="rounded-lg border bg-card p-6">
              <h3 className="font-semibold">How syllabus control works</h3>
              <ul className="mt-4 space-y-3">
                {[
                  `${TOTAL_MANDATORY_LESSONS} mandatory lessons cover the essential AI skills everyone needs — no choices required`,
                  `${TOTAL_OPTIONAL_LESSONS} optional lessons cover industry-specific and advanced topics`,
                  "Team admins assign relevant optional lessons per role via the dashboard",
                  "Individual learners (non-team) pick their own path from optional lessons",
                  "Progress tracking shows completion rates per person and per department",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm">
                    <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Section 6: How It Works */}
      <section className="border-t bg-muted/30 py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              How it works
            </h2>
          </div>
          <div className="mx-auto mt-12 grid max-w-3xl grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-5">
            {[
              { label: "3 months", detail: "structured curriculum" },
              { label: "5 hours/week", detail: "per team member" },
              { label: "Fully online", detail: "no travel required" },
              { label: "Self-paced", detail: "fits any schedule" },
              { label: "Daily updates", detail: "always current" },
            ].map((item) => (
              <div key={item.label} className="text-center">
                <div className="text-lg font-bold">{item.label}</div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {item.detail}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 7: Investment */}
      <section className="py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Investment
            </h2>
          </div>
          <div className="mx-auto mt-12 max-w-lg">
            <Card className="border-primary shadow-lg">
              <CardContent className="p-8">
                <div className="text-center">
                  <div className="text-5xl font-bold">
                    ${COURSE_MONTHLY_PRICE.toFixed(2)}
                    <span className="text-lg font-normal text-muted-foreground">
                      /month per person
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    for 3 months (${TOTAL_COURSE_COST.toFixed(2)} total per person), then ${ONGOING_MONTHLY_PRICE.toFixed(2)}/month
                    ongoing for continued access and live skill scores.
                  </p>
                </div>
                <ul className="mt-8 space-y-3">
                  {[
                    "Same price for teams — no bulk discount because it is already the lowest possible price",
                    "No minimum contract, no lock-in",
                    "Teams of 5+ get an admin dashboard with progress tracking and completion rates",
                    "Admin chooses which optional lessons each role completes",
                    "Cancel anytime, per seat",
                  ].map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm">
                      <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Section 8: FAQ */}
      <section className="border-t bg-muted/30 py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Frequently asked questions
            </h2>
          </div>
          <div className="mx-auto mt-12 max-w-2xl">
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={faq.question} value={`faq-${index}`}>
                  <AccordionTrigger>{faq.question}</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-muted-foreground">{faq.answer}</p>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* Section 9: CTA */}
      <section className="py-20 md:py-28">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Ready to upskill your team?
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Get in touch to discuss your team&apos;s needs, or let your people
            try a free lab right now.
          </p>
          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Button size="lg" className="gap-2" asChild>
              <Link href="/contact">
                <MessageSquare className="size-4" />
                Get in Touch
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="gap-2" asChild>
              <Link href="/tech-radar">
                <Radar className="size-4" />
                Browse the Tech Radar
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="gap-2" asChild>
              <Link href="/labs">
                Try Free Labs
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
