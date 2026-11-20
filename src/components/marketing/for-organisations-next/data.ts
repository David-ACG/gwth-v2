import { MONTH_CONFIGS, TOTAL_MANDATORY_LESSONS } from "@/lib/config"
import { LATER_MONTHS_OPEN } from "@/components/marketing/data"
import { COURSE_OPENS_ON } from "@/lib/launch-date"

/**
 * The words of /for-organisations, the page that replaced /for-teams and
 * /for-institutions on 19 Nov 2026 (David: "I think we can consolidate the
 * For teams and For institutions into one page").
 *
 * Every block below is carried over from one of the two old pages, whose
 * components are kept as the backup and as the record of why each line reads
 * as it does:
 *
 * - `marketing/for-institutions-fde/for-institutions-fde.tsx` (the edition:
 *   what `/org` implements, the wording rules on CIPD, pricing and CPD)
 * - `marketing/for-teams-fde/for-teams-fde.tsx` (places on the standard
 *   course: David's 14 Sept annotations, the launch readiness rewrite)
 *
 * Copied, not imported, so the old folders can be removed later without
 * touching this page. Where a line was changed, the comment beside it says
 * how. Numbers and dates come from config, never typed.
 */

export type Audience = "institution" | "team"

/** The address that opens the page on one choice. Used by links on the page. */
export function audienceHref(audience: Audience): string {
  return `/for-organisations?for=${audience}#choose`
}

/* ── For institutions ────────────────────────────────────────────────────── */

/** The before and after, word for word from the old page. */
export const BASELINE = [
  {
    kicker: "Without a shared starting point",
    title: "Your tutors spend the first sessions filling gaps",
    body: "People often arrive on a specialist course with very different experience of using AI. Tutors can then spend the first sessions bringing the whole class up to the same level before the course moves on.",
  },
  {
    kicker: "With GWTH first",
    title: "Your tutors can see who has met your pass mark",
    body: "Before your specialist course, your learners complete the core lessons and any optional ones you require. Each quiz is marked against the pass mark you set, and your tutors can see who has met it before teaching begins.",
  },
] as const

export type EditionFeature = {
  title: string
  body: string
  /** Shown only while the public score is switched on (ENABLE_GWTH_SCORE). */
  needsPublicScore?: true
}

/**
 * What an edition gives an institution, as the `/org` screens implement it.
 * The seven features are the old page's, word for word. They are grouped
 * under the three labels printed in the picture above them, so the picture
 * and the words say the same three things.
 */
export const EDITION_GROUPS: readonly {
  label: string
  features: readonly EditionFeature[]
}[] = [
  {
    label: "Choose the lessons",
    features: [
      {
        title: "Core, optional and exclusive lessons",
        body: "Core lessons are in every edition and are always required. You choose which optional lessons your members see and whether they must complete each one and pass its quiz. Lessons written for your edition are shown only to your members.",
      },
      {
        title: "Exclusive lessons you approve",
        body: "Each lesson we write for your edition waits on your admin screen until your admin approves it, or sends it back with a note. Your members cannot see it until it is approved.",
      },
    ],
  },
  {
    label: "Set your pass mark",
    features: [
      {
        title: "A pass mark you set",
        body: "You set one pass mark for your edition. Every quiz is marked automatically against it, and learners cannot see the answers before they submit.",
      },
      {
        title: "Separate admin and tutor access",
        body: "Your admins choose the lessons, approve the ones we write for you and set the pass mark. Your tutors can see how members are getting on, but they cannot change the edition.",
      },
    ],
  },
  {
    label: "See who passes",
    features: [
      {
        title: "A learners dashboard for your tutors",
        body: "Your tutors see each member's progress on the required lessons, the average of their best mark on each quiz, when they were last active and whether they have met your pass mark.",
      },
      {
        title: "Progress your members can log",
        body: "Each member's progress page lists the lessons they have completed and their best mark on each quiz. They can copy it into the continuing professional development (CPD) record their professional body asks them to keep.",
      },
      {
        // David, 2026-10-25, and the old page's rule: the public score page
        // is described only once GWTH_SCORE_ENABLED is on.
        needsPublicScore: true,
        title: "A score anyone can check",
        body: "Every member gets a GWTH score, a public page that anyone, employers included, can check is genuine. Members can share it on LinkedIn. It goes up as they pass more lessons and falls back if they stop.",
      },
    ],
  },
]

/**
 * An example of the learners dashboard, in the columns `/org/learners` shows
 * (learner, baseline, required lessons, average quiz, last active). The
 * people are made up and the page says so.
 */
/** Optional lessons the example edition requires on top of the core. */
const EXAMPLE_REQUIRED_OPTIONAL = 3
const EXAMPLE_REQUIRED = TOTAL_MANDATORY_LESSONS + EXAMPLE_REQUIRED_OPTIONAL

export const DASHBOARD_EXAMPLE = {
  passMark: 70,
  requiredOptional: EXAMPLE_REQUIRED_OPTIONAL,
  required: EXAMPLE_REQUIRED,
  rows: [
    { name: "Member A", met: true, done: EXAMPLE_REQUIRED, quiz: 86, active: "2 days ago" },
    { name: "Member B", met: true, done: EXAMPLE_REQUIRED, quiz: 78, active: "Yesterday" },
    { name: "Member C", met: false, done: EXAMPLE_REQUIRED - 8, quiz: 74, active: "Today" },
    { name: "Member D", met: false, done: 31, quiz: 81, active: "3 weeks ago" },
  ],
} as const

const [, MONTH_2, MONTH_3] = MONTH_CONFIGS

/** The subject depth an institution chooses. Word for word from the old page. */
export const DEPTH = [
  {
    title: "Optional lessons already in the course",
    body: `After its core lessons, each month has optional lessons on particular kinds of work. Month 2 has ${MONTH_2!.mandatoryLessons} core lessons and Month 3 has ${MONTH_3!.mandatoryLessons}. The optional lessons include HR, marketing and sales, UK legal practice, finance, healthcare, manufacturing and supply chain, buying AI in the public sector, and professional services for consulting, legal and accountancy firms. Each one shows how to use AI within the rules and standards of that work. Month 2 opens around ${LATER_MONTHS_OPEN.month2} and Month 3 around ${LATER_MONTHS_OPEN.month3}.`,
  },
  {
    title: "Lessons written only for your members",
    body: "If the course does not cover a subject your members need, you name the titles and we write them. Each draft waits on your admin screen until your admin has read it and approved it. It is shown only to members of your edition and does not join the standard course.",
  },
] as const

export const STEPS = [
  {
    title: "Pilot with your own staff",
    body: `From ${COURSE_OPENS_ON}, a small group of your staff can try the standard course. Their feedback helps you choose the lessons for your edition.`,
  },
  {
    title: "Set up your edition with us",
    body: "Choose the optional lessons, tell us the titles of any lessons you want written for you, and set your pass mark. We create the edition for you.",
  },
  {
    title: "Members take it before your courses",
    body: "Your members take your edition before your own courses, and your tutors check who has met your pass mark on the learners dashboard.",
  },
] as const

/**
 * Four published figures, each saying what its source measured and nothing
 * more (marketing copy gate, 2026-09-21 and 2026-10-21). Word for word.
 */
export const EVIDENCE = [
  {
    value: "59 in 100",
    body: "Employers expect 59 in every 100 workers to need new training by 2030, and 11 of those 59 to be unlikely to get it.",
    source: "World Economic Forum, Future of Jobs Report 2025",
    href: "https://www.weforum.org/publications/the-future-of-jobs-report-2025/",
  },
  {
    value: "16%",
    body: "Microsoft surveyed 20,000 people who use AI at work. It classed 16% as advanced users: people who said they use AI for complex, multi-step work, have changed how they work to make use of it, and use it together with their team.",
    source: "Microsoft Work Trend Index, 2026",
    href: "https://www.microsoft.com/en-us/worklab/work-trend-index/agents-human-agency-and-the-opportunity-for-every-organization",
  },
  {
    value: "3.5 times",
    body: "Among businesses using OpenAI, the firms that used AI most heavily produced 3.5 times as much AI output per worker as typical firms, up from twice as much a year earlier. OpenAI treats this as a measure of how deeply AI is used, not of business results.",
    source: "OpenAI, How frontier firms are pulling ahead (B2B Signals), May 2026",
    href: "https://openai.com/index/introducing-b2b-signals/",
  },
  {
    value: "67% and 33%",
    body: "In a survey of human resources (HR) professionals in Ireland, 67% named AI for HR as their top development priority, and 33% said their organisation offers AI training.",
    source: "CIPD Ireland with the University of Limerick, HR Practices in Ireland 2025 to 2026",
    href: "https://www.cipd.org/ie/knowledge/reports/hr-practices-ireland-survey/",
  },
] as const

export const LAW = {
  euAiAct: "https://artificialintelligenceact.eu/article/4/",
  ukSkills:
    "https://www.gov.uk/government/news/free-ai-training-for-all-as-government-and-industry-programme-expands-to-provide-10-million-workers-with-key-ai-skills-by-2030",
}

/**
 * CIPD is named in the third entry as a cited fact about how a professional
 * body has its own qualifications delivered, beside CMI and ACCA. It is not an
 * endorsement and must never be written as one: CIPD has not bought, approved
 * or selected GWTH.
 */
export const PATTERN = [
  {
    title: "CMI with TechSkills",
    body: "The Chartered Management Institute built its Leadership for AI qualifications with a skills partner rather than alone.",
    href: "https://www.managers.org.uk/education-and-learning/qualifications/leadership-for-ai-qualifications/",
  },
  {
    title: "ACCA-X on edX",
    body: "ACCA runs its own online courses on a platform it does not own. ACCA keeps its brand and its syllabus, and the platform delivers the courses.",
    href: "https://www.acca-x.com/global/en.html",
  },
  {
    title: "Approved study centres",
    body: "CIPD's own qualifications are delivered through a network of approved study centres, not by CIPD itself.",
    href: "https://findacentre.cipd.org/",
  },
] as const

/**
 * The institution questions, word for word, less "Does it favour one AI
 * company's tools?", whose answer is now the page's shared independence
 * block. `publicScoreA` replaces `a` only while the public score is on.
 */
export const INSTITUTION_FAQS: readonly {
  q: string
  a: string
  publicScoreA?: string
}[] = [
  {
    q: "Can we require it before our own courses?",
    a: "Yes. Your members complete the core lessons and any optional lessons you require, and you set the pass mark. Before your course begins, your tutors can see on the learners dashboard who has met it.",
  },
  {
    q: "Does it teach our profession?",
    a: "No, and it is not meant to. The subject lessons teach people how to use AI within the rules their work already follows. Your own courses keep the professional depth, and you can see who has passed your required AI lessons before they begin.",
  },
  {
    q: "Can our members skip the parts that are not for them?",
    a: "Members can skip optional lessons you have not made compulsory. Everyone must complete the core lessons and any optional lessons you require.",
  },
  {
    q: "Who marks the quizzes?",
    a: "Quizzes are marked automatically against the pass mark you set for your edition. Learners cannot see the answers before they submit.",
  },
  {
    q: "What can a member show for it?",
    a: "Their progress page lists the lessons they have completed and their best mark on each quiz.",
    publicScoreA:
      "A GWTH score, like every GWTH learner. It is a public page that anyone, employers included, can check is genuine, and members can share it on LinkedIn. It goes up as they pass more lessons and falls back if they stop. Their progress page also lists the lessons they have completed and their best mark on each quiz.",
  },
  {
    q: "Who sees the lessons written for us?",
    a: "Only members of your edition, once your admin has approved each one. They do not join the standard course. The agreement for your edition sets out what you may do with them.",
  },
  {
    q: "How quickly can we start?",
    a: `A pilot group can start on the standard course once it opens on ${COURSE_OPENS_ON}. We agree the date your edition opens with you, because it depends on the lessons you choose and on any lessons we write for you and your admin approves.`,
  },
]

/* ── For teams ───────────────────────────────────────────────────────────── */

/**
 * Why GWTH for a team. David's 14 Sept annotations stand behind every line
 * (see the old component). Five of the old six: "Leading AI models, plus
 * cheaper alternatives" is now the shared independence block, where both
 * readers see it. "Walkthrough" is never used on the team side as a noun.
 */
export const WHY_TEAMS = [
  {
    title: "Zero wasted time",
    body: "We keep lessons focused and cut repetition. When the tools change, or the way experts use them changes, we rewrite the lesson. Your team learns what works now, with those changes included. Your team's time is more valuable than the course, and we treat it that way.",
  },
  {
    title: "Learn, answer the questions, then do the project",
    body: "Every lesson builds towards a piece of work your team can relate to their own jobs. People watch a short film, read the lesson, answer the questions on the lesson, then do the project. A worked solution is there if they want help, so nobody is left stuck. Anyone who already works with AI can build it their own way.",
  },
  {
    title: "Beginner-friendly, and it stays that way",
    body: "Month 1 starts in plain English. Later lessons introduce writing code and building more complex tools with help from AI. Worked solutions remain available for those projects too. As the work gets more advanced, the support does not thin out.",
  },
  {
    title: "The same core for everyone, optional lessons by role",
    body: `Everyone takes the same ${TOTAL_MANDATORY_LESSONS} core lessons. Each month also includes optional lessons for particular industries, for building more complex AI tools and for leading AI work. Each person chooses which of those to take, so you can point people to the ones that fit their job.`,
  },
  {
    title: "Month 3 covers leading AI at work",
    body: "The last month is about using AI across an organisation: the rules and checks it needs before it relies on AI, weighing what AI work costs against what it saves, helping people through the change, and setting up several AI assistants to share one job.",
  },
] as const

/** What the optional lessons are for, by kind of role. Word for word. */
export const ROLE_PATHS = [
  {
    label: "Client-facing and regulated work",
    detail:
      "Lessons on UK legal practice, finance, healthcare, manufacturing and supply chain, buying AI in the public sector, and professional services for consulting, legal and accountancy firms. Each is written around the rules and examples of that field, so people can see how the skills apply to their own job.",
  },
  {
    label: "The people who build",
    detail:
      "AI assistants that answer from your own documents and show where each answer came from, testing and evaluating what has been built, security, running models on your own hardware, and several AI assistants working together on one job.",
  },
  {
    label: "The people who lead AI work",
    detail:
      "What a board needs to be told and how often, how AI suppliers are checked, and how to run the change itself rather than only the tools.",
  },
] as const

/** What a team buyer needs to know beside the two prices. Word for word. */
export const TEAM_PRICE_FEATURES = [
  "To pay for someone else, buy them a place on the gift page. We email them a code. They have one year from purchase to use it, and their time starts when they do",
  "The person you buy for is never asked for their card, and there are no automatic renewal payments",
  "No minimum number of places",
  "GWTH is not VAT registered, so there is no VAT on these prices",
] as const

/* ── The course, for both readers ────────────────────────────────────────── */

function lessonCount(month: 1 | 2 | 3): string {
  const config = MONTH_CONFIGS[month - 1]!
  return config.optionalLessons > 0
    ? `${config.mandatoryLessons} core lessons, plus optional`
    : `${config.mandatoryLessons} core lessons`
}

/**
 * The three months, for both readers. Names and core counts come from
 * MONTH_CONFIGS; no optional count is ever printed (David,
 * a-20260914-201426-ae7f0e). The descriptions are the old team page's, each
 * checked against the syllabus register there. One change: Month 1 said
 * "Your team practises", which is "People practise" here so an institution
 * can read it too.
 */
export const MONTHS = [
  {
    month: 1,
    title: MONTH_CONFIGS[0]!.title,
    lessons: lessonCount(1),
    opens: `Opens on ${COURSE_OPENS_ON}`,
    description:
      "Hands-on from the first lesson. People practise using AI to finish real pieces of work: a research brief with sources they have checked, a first working dashboard, a plan for an automation that removes a weekly chore, and an assistant that turns a voice note into tasks. Each lesson has a project to complete.",
  },
  {
    month: 2,
    title: MONTH_CONFIGS[1]!.title,
    lessons: lessonCount(2),
    opens: `Opens around ${LATER_MONTHS_OPEN.month2}`,
    description:
      "Build apps, an AI assistant that answers from your own documents and cites them, and agents: AI assistants that carry out routine admin tasks. You learn the security, testing and data skills that keep this work safe, and the business use cases run from one-person practices to a large organisation. You also learn how to offer this work as a consulting service.",
  },
  {
    month: 3,
    title: MONTH_CONFIGS[2]!.title,
    lessons: lessonCount(3),
    opens: `Opens around ${LATER_MONTHS_OPEN.month3}`,
    description:
      "One shared core, then each person picks a direction. Everyone learns to assess how an organisation uses AI today, cost the work and lead the change. Then each person can take optional lessons on leading AI across an organisation, on building more complex tools, or both. The leadership lessons cover setting the rules for using AI, reporting to the board and helping staff take it up. The building lessons cover several AI assistants working together on one job, AI models run on your own hardware, and red teaming, which means testing a system for weaknesses before anyone relies on it.",
  },
] as const

/** The old team page's "How it works" row. */
export const AT_A_GLANCE = [
  { label: "3 months", detail: "one month of lessons at a time" },
  { label: "About 5 hours a week", detail: "for each person" },
  { label: "Fully online", detail: "no travel required" },
  {
    label: "Individual accounts",
    detail: "each person signs in and tracks their own progress",
  },
] as const

/** How a lesson works: the home page's three steps, word for word. */
export const LESSON_STEPS = [
  ["Watch a short film", "Get an introduction to the subject."],
  ["Read the lesson, then answer questions", "Work through the lesson over several pages. The questions on the lesson are a quiz with a pass mark. Your answers are marked automatically, so you can see what to go back over."],
  ["Do the project", "Put what you have learnt into practice."],
] as const

/** The four project marks, as the home page names them. */
export const MARK_LEVELS = ["Not yet", "Pass", "Good", "Excellent"] as const
