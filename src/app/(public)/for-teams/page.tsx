import Link from "next/link"
import type { Metadata } from "next"
import {
  Users,
  Shield,
  Trophy,
  Briefcase,
  BarChart3,
  ArrowRight,
  Mail,
  Check,
  Radar,
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
  TEAMS_EMAIL,
  COURSE_MONTHLY_PRICE,
  ONGOING_MONTHLY_PRICE,
} from "@/lib/config"

export const metadata: Metadata = {
  title: "AI Training for Teams",
  description:
    "Upskill your team with hands-on AI training. 94 projects, no coding required, vendor-neutral. $37.50/month per person for 3 months.",
}

const whyGwth = [
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
    icon: Radar,
    color: "#0E7C7B",
    title: "Vendor-neutral (Tech Radar tracks 47+ tools)",
    description:
      "We do not sell tools. Our Tech Radar evaluates 47+ AI tools every day so your team learns the best option, not the one that paid for placement.",
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
    description:
      "From first AI conversation to building real tools — apps, websites, dashboards, research projects, and automations — by typing plain English.",
  },
  {
    month: 2,
    title: "Professional & Industry Application",
    description:
      "Industry-specific modules for healthcare, legal, finance, travel, creative, marketing, and HR. Your team builds applications that solve problems in their actual field.",
  },
  {
    month: 3,
    title: "Enterprise Transformation",
    description:
      "Multi-agent systems, self-hosted AI, governance frameworks, ROI measurement, and change management. The strategic layer that turns individual skills into organisational capability.",
  },
]

const faqs = [
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
      "The course costs less than a single hour of AI consulting per employee. By Month 1, your team will be automating tasks that currently take hours. By Month 3, they will be building internal tools and leading AI transformation initiatives. Most teams report time savings within the first two weeks.",
  },
  {
    question: "Our team is not technical. Is this appropriate?",
    answer:
      "This course was designed specifically for non-technical people. No coding. No command line. No technical prerequisites. Everything is built by describing what you want in plain English. If your team can write an email, they can complete this course.",
  },
  {
    question: "How is this different from vendor-specific training?",
    answer:
      "Vendor training teaches you one tool. We teach the skill of working with AI, using whichever tool is best for the job. Our Tech Radar tracks 47+ tools daily — when something better appears, we update the course immediately. Your team learns transferable skills, not product-specific workflows that become obsolete.",
  },
  {
    question: "Can we pilot with a small group first?",
    answer:
      "Absolutely. There is no minimum team size and no contract. Start with 2 people or 200. The admin dashboard is available for teams of 5+, but smaller groups work perfectly well with individual accounts.",
  },
]

/**
 * Teams/employer landing page.
 * Presents the business case for team AI training with pricing,
 * curriculum overview, differentiators, and an FAQ section.
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

      {/* Section 3: Why GWTH for Teams */}
      <section className="py-20 md:py-28">
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

      {/* Section 4: What Your Team Will Build */}
      <section className="border-t bg-muted/30 py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              What your team will build
            </h2>
            <p className="mt-4 text-muted-foreground">
              Three months. From first AI conversation to leading an enterprise
              AI transformation.
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
                  <p className="mt-3 text-sm text-muted-foreground">
                    {month.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Section 5: How It Works */}
      <section className="py-20 md:py-28">
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

      {/* Section 6: Investment */}
      <section className="border-t bg-muted/30 py-20 md:py-28">
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
                    for 3 months, then ${ONGOING_MONTHLY_PRICE.toFixed(2)}/month
                    ongoing for continued access and live skill scores.
                  </p>
                </div>
                <ul className="mt-8 space-y-3">
                  {[
                    "Same price for teams — no bulk discount because it is already the lowest possible price",
                    "No minimum contract, no lock-in",
                    "Teams of 5+ get an admin dashboard with progress tracking and completion rates",
                    "Admin can designate relevant optional lessons per role",
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

      {/* Section 7: FAQ */}
      <section className="py-20 md:py-28">
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

      {/* Section 8: CTA */}
      <section className="border-t bg-muted/30 py-20 md:py-28">
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
              <Link href={`mailto:${TEAMS_EMAIL}`}>
                <Mail className="size-4" />
                Contact {TEAMS_EMAIL}
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
