/**
 * Typed marketing-page data. Ported from
 * `kanban/design-artefacts/2026-04-24/concepts/homepage/variant-1-garrow/components/data.js`.
 *
 * Pricing values reference `src/lib/config.ts` (no inline literal numbers)
 * so the marketing copy cannot drift from the canonical pricing constants.
 *
 * No fabricated proof: research bodies are cited as sources, not partners
 * or sponsors. Progress sub-categories are illustrative until the reporting
 * scheme is finalised.
 */

import {
  COURSE_MONTHLY_PRICE,
  ONGOING_MONTHLY_PRICE,
  MONTH_CONFIGS,
  TOTAL_MANDATORY_LESSONS,
  TOTAL_OPTIONAL_LESSONS,
} from "@/lib/config"

// ─── Types ────────────────────────────────────────────────────────────────────

export type JourneyAccent = "mint" | "aqua"

export type JourneyStat = {
  /** Headline figure, e.g. "21%" */
  value: string
  /** One-line context, e.g. "of UK workers feel confident using AI" */
  label: string
  /**
   * Named UK source for the figure (DESIGN_FDE.md §7 Citation Rule), e.g.
   * "ONS, 2026". Where the publication year and the fieldwork year differ,
   * the label must say so, e.g. "DSIT, published 2026 (fieldwork 2024)".
   * Omitted for non-stat figures such as prices.
   */
  source?: string
}

export type Journey = {
  /** Display ordinal, e.g. "01" */
  n: string
  /** Short tag pill, e.g. "Worried" */
  tag: string
  /** Card title */
  title: string
  /** Card body paragraph */
  body: string
  /** Tailwind accent token; drives tag pill colour */
  accent: JourneyAccent
  /** Optional research stat shown in the card footer */
  stat?: JourneyStat
  /** Call-to-action label */
  cta: string
  /** Internal route or external URL the CTA links to */
  href: string
}

export type ProductPillar = {
  n: string
  label: string
  title: string
  body: string
}

export type UkStat = {
  value: string
  label: string
}

export type CurriculumModule = {
  m: string
  t: string
  d: string
  capstone: string
  capstoneSub: string
}

export type PricingCtaStyle = "ghost" | "accent2" | "disabled"

export type PricingCta = {
  label: string
  href: string
  style: PricingCtaStyle
}

export type PricingTier = {
  id: "free" | "course" | "stay"
  badge: string
  flag?: string
  /** Display price string, e.g. "£29" */
  price: string
  /** Pence value used for cross-checking against `src/lib/config.ts` */
  pricePence: number
  per: string
  features: readonly string[]
  cta: PricingCta
}

export type ScoreCategory = {
  l: string
  v: number
}

export type NavLink = {
  label: string
  href: string
}

export type FooterCol = {
  title: string
  links: readonly NavLink[]
}

// ─── Journeys (7 cards, 3+3+1 grid) ──────────────────────────────────────────

export const JOURNEYS: readonly Journey[] = [
  {
    n: "01",
    tag: "Worried",
    title: "You are worried AI will take your job",
    body:
      "Someone who knows how to use AI will be more productive than you. This course makes you that person. In three months, you will be the one your team asks for help.",
    accent: "mint",
    cta: "See pricing",
    href: "/pricing",
  },
  {
    n: "02",
    tag: "Reskilling",
    title: "You have been made redundant and need to reskill",
    body:
      "Five hours a week for three months. Every project you build goes in your portfolio. Your course progress stays visible and practical. UK employers are hiring for exactly these skills, and only 21% of UK workers feel confident using AI. That gap is your opportunity.",
    accent: "aqua",
    stat: {
      value: "21%",
      label: "of UK workers feel confident using AI",
      // Ipsos for DSIT, "AI Skills for Life and Work: General public survey
      // findings", published 28 January 2026 from fieldwork 29 February to
      // 7 March 2024. Labelled with both dates because neither alone is
      // honest. No like-for-like 2026 survey of worker AI confidence exists.
      source: "DSIT, published 2026 (fieldwork 2024)",
    },
    cta: "See pricing",
    href: "/pricing",
  },
  {
    n: "03",
    tag: "Small business",
    title: "You run a small business",
    body:
      "Only 28% of the smallest UK businesses use AI, against 49% of large firms. That is about to change. Five hours a week for three months, and you will not need to hire a developer or pay a consultant. You will be able to do it all yourself.",
    accent: "mint",
    // Raw ONS pair rather than a derived ratio: a ratio invites "how did you
    // calculate that", and the 2026 data computes to 43%, not the 45% this
    // card used to carry. ONS, "Artificial intelligence in UK businesses:
    // 2023 to 2026", published 20 July 2026, fieldwork 15 to 28 June 2026.
    stat: {
      value: "28% vs 49%",
      label: "of the smallest UK businesses use AI, against half of large firms",
      source: "ONS, 2026",
    },
    cta: "See pricing",
    href: "/pricing",
  },
  {
    n: "04",
    tag: "Parent",
    title: "You are a parent thinking about the future",
    body:
      "AI will be part of your children's working lives whatever they end up doing. You start with no jargon and nothing to install, then learn the practical building and AI-assisted coding patterns that make ideas real.",
    accent: "aqua",
    // Points at pricing rather than /labs while Labs is gated for the CIPD
    // demo (W25). Restore "Try a free lab" / "/labs" when Labs comes back,
    // alongside the hero button (bead gwth-launch-ynk).
    cta: "See pricing",
    href: "/pricing",
  },
  {
    n: "05",
    tag: "Upgrading",
    title: "You already use AI but know there is more",
    body:
      "ChatGPT for emails. Claude for first drafts. And subscription bills that keep climbing. If you are spending £100 or £200 a month on AI tools, the cost guidance alone can save you more than GWTH costs: which subscriptions earn their keep, where a cheaper model does the same job, and how practitioners get more from less. You will not just use AI, you will design with it, automate with it, ship with it.",
    accent: "mint",
    cta: "See pricing",
    href: "/pricing",
  },
  {
    n: "06",
    tag: "Income",
    title: "You know AI fluency is now worth more",
    body:
      "AI is one of the highest-premium skill sets in the UK job market right now. Three months, real artefacts in your portfolio, and a clear record of completed work. Show up to your next salary conversation (or your next interview) with proof.",
    accent: "aqua",
    cta: "See pricing",
    href: "/pricing",
  },
  {
    n: "07",
    tag: "Proof",
    title: "You want proof that you are fluent in Applied AI",
    body:
      "Every completed lesson, Q&A pass, Capstone project, and current update leaves a practical progress trail. Use the portfolio pieces on LinkedIn or your CV: the emphasis for beta is real work, not a one-shot certificate that goes stale a month after issue.",
    accent: "aqua",
    cta: "See pricing",
    href: "/pricing",
  },
  {
    n: "08",
    tag: "Keeping up",
    title: "You spend too much time keeping up with AI",
    body:
      "Even Andrej Karpathy admits keeping up is exhausting. Three months gets you up to date. After that, £7.50/month keeps you there: weekly summaries of what changed, and which lessons to revisit.",
    accent: "mint",
    // No stat here on purpose. The £7.50/mo Stay Current price is our own
    // pricing, not research, and the card stat slot sits beside sourced UK
    // figures (DSIT, ONS), so a price rendered there reads as an unsourced
    // statistic. The price is stated in the body copy instead, and it is on
    // /pricing (bead gwth-launch-jws).
    cta: "See pricing",
    href: "/pricing",
  },
  {
    n: "09",
    tag: "Team lead",
    title: "You lead a team and your competitors are moving faster",
    body:
      "The bottleneck is not the tools. It is whether your team can actually use them well. The beta is individual-first, with a light For Teams path for managers who want to talk about future group access.",
    accent: "mint",
    // CIPD's own research, which is why it sits on the card that argues the
    // bottleneck is capability rather than tooling. YouGov for CIPD,
    // "Futureproofing your skills", published 29 April 2026, fieldwork
    // 14 January to 3 February 2026, n=1,342.
    stat: {
      value: "45%",
      label: "of organisations say their AI use is still ad hoc or experimental",
      source: "CIPD, 2026",
    },
    cta: "For Teams",
    href: "/for-teams",
  },
]

// ─── Product Pillars (3 alternating rows in PROMPT-B) ────────────────────────

export const PRODUCT_PILLARS: readonly ProductPillar[] = [
  {
    n: "01",
    // Derived, not typed out: the same number was hardcoded in four places and
    // went stale the moment Month 1 grew from 24 lessons to 26 (W26).
    label: `${TOTAL_MANDATORY_LESSONS} core lessons. ${TOTAL_OPTIONAL_LESSONS} go-deeper lessons.`,
    title: "Three months. Three levels of applied AI capability.",
    body:
      "Five hours a week. Async-first, so it works around the day job. Month 1 moves you beyond ChatGPT-as-Google. Month 2 turns that into apps and consulting skill. Month 3 moves into enterprise transformation.",
  },
  {
    n: "02",
    label: "Course progress",
    title: "Visible progress that keeps the course grounded in real work.",
    body:
      "Your progress reflects completion, applied skill, and currentness. During beta, GWTH shows plain progress and portfolio evidence while the verifiable score stays reserved for post-beta.",
  },
  {
    n: "03",
    label: "Coding with AI",
    title: "Start in plain English. Build your way into code.",
    body:
      "The course assumes you start as a beginner, then teaches AI-assisted building and coding through tools people actually use: Claude, ChatGPT, Codex, automation tools, and practical project workflows.",
  },
]

// ─── Research sources ────────────────────────────────────────────────────────

export const RESEARCH_SOURCES: readonly string[] = [
  "DSIT",
  "ONS",
  "CIPD",
  "BCS",
  "Tech UK",
  "Innovate UK",
]

// ─── UK research stats (DSIT and ONS; see STAT_SOURCES for the per-stat
// citation, which is index-matched to this array in home-fde.tsx) ──────────
//
// [0] Ipsos for DSIT, "AI Skills for Life and Work", published 28 January
//     2026, fieldwork 29 February to 7 March 2024.
// [1] ONS, "Business insights and impact on the UK economy", published
//     2 July 2026, BICS wave 159, fieldwork 15 to 28 June 2026.
// [2] ONS, "Artificial intelligence in UK businesses: 2023 to 2026",
//     published 20 July 2026, same June 2026 fieldwork.

export const UK_STATS: readonly UkStat[] = [
  { value: "21%", label: "of UK workers feel confident using AI at work" },
  { value: "29%", label: "of UK businesses were using at least one AI technology in June 2026" },
  { value: "28% vs 49%", label: "of the smallest UK businesses use AI, against half of large firms" },
]

// ─── Curriculum (sourced from MONTH_CONFIGS in src/lib/config.ts) ───────────

const monthAt = (idx: number) => {
  const m = MONTH_CONFIGS[idx]
  if (!m) {
    throw new Error(`MONTH_CONFIGS[${idx}] is undefined: config and marketing data out of sync`)
  }
  return m
}

const totalLessonsForMonth = (idx: number): number => {
  const m = monthAt(idx)
  return m.mandatoryLessons + m.optionalLessons
}

export const CURRICULUM: readonly CurriculumModule[] = [
  {
    m: "Month 1",
    t: "Personal AI Mastery",
    d: `${totalLessonsForMonth(0)} lessons · ${totalLessonsForMonth(0)} projects`,
    capstone: monthAt(0).capstoneName,
    capstoneSub: "Transcription · task extraction · meal planning · shopping lists",
  },
  {
    m: "Month 2",
    t: "Apps, Workflows & Consulting",
    d: `${monthAt(1).mandatoryLessons} mandatory + ${monthAt(1).optionalLessons} optional · industry tracks`,
    capstone: `${monthAt(1).capstoneName} + FractionalBuddy`,
    capstoneSub: "Customer support · consulting toolkit · real business data",
  },
  {
    m: "Month 3",
    t: "Enterprise Transformation",
    d: `${monthAt(2).mandatoryLessons} mandatory + ${monthAt(2).optionalLessons} optional · multi-agent + governance`,
    capstone: monthAt(2).capstoneName,
    capstoneSub: "Maturity evaluation · roadmap generation",
  },
]

// ─── Pricing tiers ──────────────────────────────────────────────────────────

export const PRICING: readonly PricingTier[] = [
  {
    id: "free",
    badge: "Free Labs",
    price: "£0",
    pricePence: 0,
    per: "forever, no card required",
    features: [
      "Access to all free labs",
      "Build real projects with AI",
      "No credit card required",
      "No time limit, free forever",
    ],
    cta: { label: "Try a Free Lab", href: "/labs", style: "ghost" },
  },
  {
    id: "course",
    badge: "The Course",
    flag: "Starter pricing",
    price: `£${COURSE_MONTHLY_PRICE}`,
    pricePence: COURSE_MONTHLY_PRICE * 100,
    per: "/mo · unlock one month at a time",
    features: [
      "Full Month 1 at beta launch; Months 2 and 3 follow",
      `${TOTAL_MANDATORY_LESSONS} core lessons plus ${TOTAL_OPTIONAL_LESSONS} go-deeper optional lessons`,
      "Capstones for AskMyCo, FractionalBuddy, and AskEveryone",
      "Industry-specific modules for your field",
      "Plain course progress tracking",
      "Starter price may rise after beta",
      "No ads, no upsells, no hidden tier",
    ],
    cta: { label: "Join the Waitlist", href: "/signup", style: "accent2" },
  },
  {
    id: "stay",
    badge: "Stay Current",
    price: `£${ONGOING_MONTHLY_PRICE.toFixed(2)}`,
    pricePence: Math.round(ONGOING_MONTHLY_PRICE * 100),
    per: "/mo after the course",
    features: [
      "Keep your lesson knowledge current when content changes",
      "~5 hours of new content every month",
      "Work through the optional lessons you skipped",
      "Progress history and review analytics",
      "Cancel anytime, no lock-in",
    ],
    cta: { label: "Included after course", href: "#", style: "disabled" },
  },
]

// ─── Progress categories (post-beta score data, see score-vis/example-data.ts) ────────

export const SCORE_CATEGORIES: readonly ScoreCategory[] = [
  { l: "Foundations", v: 92 },
  { l: "Building", v: 78 },
  { l: "Capstones", v: 64 },
  { l: "Currentness", v: 71 },
]

// ─── Navigation links ───────────────────────────────────────────────────────

export const NAV_LINKS: readonly NavLink[] = [
  { label: "Free Labs", href: "/labs" },
  { label: "Lessons", href: "/lessons" },
  { label: "Pricing", href: "/pricing" },
  { label: "For Teams", href: "/for-teams" },
  { label: "About", href: "/about" },
]

// ─── Footer columns ─────────────────────────────────────────────────────────

export const FOOTER_COLS: readonly FooterCol[] = [
  {
    title: "Course",
    links: [
      { label: "Lessons", href: "/lessons" },
      { label: "Free Labs", href: "/labs" },
      { label: "Pricing", href: "/pricing" },
      { label: "For Teams", href: "/for-teams" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About GWTH", href: "/about" },
      { label: "Why GWTH", href: "/why-gwth" },
      { label: "Newsletter", href: "/newsletter" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
    ],
  },
]
