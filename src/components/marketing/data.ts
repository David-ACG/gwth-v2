/**
 * Typed marketing-page data. Ported from
 * `kanban/design-artefacts/2026-04-24/concepts/homepage/variant-1-garrow/components/data.js`.
 *
 * Pricing values reference `src/lib/config.ts` (no inline literal numbers)
 * so the marketing copy cannot drift from the canonical pricing constants.
 *
 * No fabricated proof: research bodies are cited as sources, not partners
 * or sponsors. Score sub-categories are illustrative until the scoring
 * scheme is finalised.
 */

import {
  COURSE_MONTHLY_PRICE,
  ONGOING_MONTHLY_PRICE,
  MONTH_CONFIGS,
  TOTAL_COURSE_COST,
} from "@/lib/config"

// ─── Types ────────────────────────────────────────────────────────────────────

export type JourneyAccent = "mint" | "aqua"

export type JourneyStat = {
  /** Headline figure, e.g. "21%" */
  value: string
  /** One-line context, e.g. "of UK workers feel confident using AI" */
  label: string
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
  /** Tailwind accent token — drives tag pill colour */
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
      "Five hours a week for three months. Every project you build goes in your portfolio. Every score is verifiable. UK employers are hiring for exactly these skills — and only 21% of UK workers feel confident using AI. That gap is your opportunity.",
    accent: "aqua",
    stat: { value: "21%", label: "of UK workers feel confident using AI" },
    cta: "See pricing",
    href: "/pricing",
  },
  {
    n: "03",
    tag: "Small business",
    title: "You run a small business",
    body:
      "UK micro businesses are 45% less likely to adopt AI than large companies. That is about to change. Five hours a week for three months, and you will not need to hire a developer or pay a consultant — you will be able to do it all yourself.",
    accent: "mint",
    stat: { value: "45%", label: "less likely to adopt AI than large companies" },
    cta: "See pricing",
    href: "/pricing",
  },
  {
    n: "04",
    tag: "Parent",
    title: "You are a parent thinking about the future",
    body:
      "AI fluency will not be a nice-to-have — it will be table stakes. No coding required. If your teenager can describe what they want, they can build with AI.",
    accent: "aqua",
    cta: "Try a free lab",
    href: "/labs",
  },
  {
    n: "05",
    tag: "Upgrading",
    title: "You already use AI but know there is more",
    body:
      "ChatGPT for emails. Claude for first drafts. You suspect you're scratching the surface — and you are. The gap between casual user and capable practitioner is bigger than it looks. Five hours a week for three months, and you will not just use AI — you will design with it, automate with it, ship with it.",
    accent: "mint",
    cta: "See pricing",
    href: "/pricing",
  },
  {
    n: "06",
    tag: "Income",
    title: "You know AI fluency is now worth more",
    body:
      "AI is one of the highest-premium skill sets in the UK job market right now. Three months, every project in your portfolio, every score on your verifiable Dynamic Score. Show up to your next salary conversation — or your next interview — with proof.",
    accent: "aqua",
    cta: "See pricing",
    href: "/pricing",
  },
  {
    n: "07",
    tag: "Proof",
    title: "You want proof that you are fluent in Applied AI",
    body:
      "Every lesson and project you complete lifts your verifiable Dynamic Score. Share it on LinkedIn, link it on your CV — UK employers can verify it on the spot. No PDFs, no faked completion dates, no one-shot certificate that goes stale a month after issue.",
    accent: "aqua",
    cta: "See pricing",
    href: "/pricing",
  },
  {
    n: "08",
    tag: "Keeping up",
    title: "You spend too much time keeping up with AI",
    body:
      "Even Andrej Karpathy admits keeping up is exhausting. Three months gets you up to date. After that, £7.50/month keeps you there — weekly summaries of what changed, and which lessons to revisit.",
    accent: "mint",
    stat: { value: "£7.50/mo", label: "Stay Current after the first three months" },
    cta: "See pricing",
    href: "/pricing",
  },
  {
    n: "09",
    tag: "Team lead",
    title: "You lead a team and your competitors are moving faster",
    body:
      "The bottleneck is not the tools — it is whether your team can actually use them well. The course works for individual employees and for whole teams ready to upskill together. Visit For Teams for syllabus control, admin dashboards, and bespoke modules for 100+.",
    accent: "mint",
    cta: "For Teams",
    href: "/for-teams",
  },
]

// ─── Product Pillars (3 alternating rows in PROMPT-B) ────────────────────────

export const PRODUCT_PILLARS: readonly ProductPillar[] = [
  {
    n: "01",
    label: "94 hands-on projects",
    title: "Three months. Three modules. 94 things you actually build.",
    body:
      "Five hours a week. Async-first, so it works around the day job. Every lesson ends with a step-by-step video walkthrough where the instructor builds the project alongside you.",
  },
  {
    n: "02",
    label: "Dynamic Score",
    title: "A verifiable credential that updates as you build.",
    body:
      "Your Dynamic Score updates as you complete projects, and decays if you stop. Share it on LinkedIn. Employers can verify it on the spot — no PDFs, no faked completion dates.",
  },
  {
    n: "03",
    label: "No coding required",
    title: "If you can describe what you want, you can build it.",
    body:
      "Plain English in, working AI tools out. We assume zero Python. Tools you already pay for — Claude, ChatGPT, n8n, Zapier — used the way professionals actually use them.",
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

// ─── UK research stats (DSIT, AI Skills Boost programme, Jan 2026) ─────────

export const UK_STATS: readonly UkStat[] = [
  { value: "21%", label: "of UK workers feel confident using AI at work" },
  { value: "1 in 6", label: "UK businesses were using AI as of mid-2025" },
  { value: "45%", label: "less likely for micro businesses to adopt AI vs large firms" },
]

// ─── Curriculum (sourced from MONTH_CONFIGS in src/lib/config.ts) ───────────

const monthAt = (idx: number) => {
  const m = MONTH_CONFIGS[idx]
  if (!m) {
    throw new Error(`MONTH_CONFIGS[${idx}] is undefined — config and marketing data out of sync`)
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
    t: "Professional & Industry",
    d: `${monthAt(1).mandatoryLessons} mandatory + ${monthAt(1).optionalLessons} optional · industry tracks`,
    capstone: monthAt(1).capstoneName,
    capstoneSub: "Production-grade · trained on real business data",
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
    per: "forever — no card required",
    features: [
      "Access to all free labs",
      "Build real projects with AI",
      "No credit card required",
      "No time limit — free forever",
    ],
    cta: { label: "Try a Free Lab", href: "/labs", style: "ghost" },
  },
  {
    id: "course",
    badge: "The Course",
    flag: "Most Popular",
    price: `£${COURSE_MONTHLY_PRICE}`,
    pricePence: COURSE_MONTHLY_PRICE * 100,
    per: `/mo for 3 months · £${TOTAL_COURSE_COST} total`,
    features: [
      "94 hands-on projects with video walkthroughs",
      "3 portfolio-ready capstone projects",
      "Industry-specific modules for your field",
      "Dynamic scores employers can verify",
      "Content updated every day — never stale",
      "Tech Radar — 60+ tools tracked daily",
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
      "Keep your Dynamic Score current — scores decay if you stop",
      "~5 hours of new content every month",
      "Work through the optional lessons you skipped",
      "New tools added to Tech Radar as they launch",
      "Score history and progression analytics",
      "Cancel anytime — no lock-in",
    ],
    cta: { label: "Included after course", href: "#", style: "disabled" },
  },
]

// ─── Score categories (illustrative — see score-vis/example-data.ts) ────────

export const SCORE_CATEGORIES: readonly ScoreCategory[] = [
  { l: "Personal AI", v: 92 },
  { l: "Professional", v: 78 },
  { l: "Enterprise", v: 64 },
  { l: "Tech Radar", v: 71 },
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
      { label: "Tech Radar", href: "/tech-radar" },
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
