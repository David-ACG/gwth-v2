import Link from "next/link"
import type { ReactNode } from "react"
import {
  COURSE_MONTHLY_PRICE,
  MONTH_CONFIGS,
  ONGOING_MONTHLY_PRICE,
  TOTAL_MANDATORY_LESSONS,
} from "@/lib/config"
import { LATER_MONTHS_OPEN, UK_STAT_IDS } from "@/components/marketing/data"
import {
  formatPence,
  formatUkDate,
  getSaleWindow,
  PASS_PRICES_PENCE,
} from "@/lib/billing/passes"
import {
  ukFigure,
  ukFigureCitation,
  ukFigureSource,
} from "@/lib/data/uk-ai-context"
import styles from "./for-teams-fde.module.css"

/**
 * Per-month lesson counts, read from config rather than retyped, so this page
 * cannot drift from the course page (W26 defect 4).
 *
 * The CORE figure is printed. The per-month OPTIONAL figure never is: David's
 * rule, a-20260914-201426-ae7f0e (see the table on SYLLABUS_BULLETS). "Core"
 * rather than "mandatory" since the launch readiness review (2026-10-21), so
 * this page uses the course page's and the facts sheet's word.
 */
function lessonCount(month: 1 | 2 | 3): string {
  const config = MONTH_CONFIGS[month - 1]!
  return config.optionalLessons > 0
    ? `${config.mandatoryLessons} core lessons, plus optional`
    : `${config.mandatoryLessons} core lessons`
}

/**
 * Differentiator entries for the numbered journal list.
 *
 * ## Wording rules this block is under (David's /for-teams annotations,
 * 2026-09-14)
 *
 * - **"Walkthrough" is NOT used here as a noun.** On the home page a
 *   walkthrough is David's own hour with an institution, offered to nobody
 *   else on purpose (`home-fde.tsx`, the audience split). The support
 *   described in item 02 is LESSON CONTENT: the worked solution the lesson
 *   gives you after you have tried the project. Calling it a walkthrough on a
 *   marketing page would quietly re-blur the split he had just corrected, so
 *   this page says "works through it" and "worked solution" instead.
 * - **No optional-lesson total.** See the comment on SYLLABUS_BULLETS.
 */
const WHY_GWTH = [
  {
    // Untouched on purpose: annotation a-20260914-200143-635cd6 lands on this
    // paragraph with the canned action "Keep this, I like it" and no added
    // free text. The paragraph is therefore preserved unchanged.
    title: "Zero wasted time",
    description:
      "No repetition. No filler. No outdated material. Every lesson teaches the newest, most relevant applied AI skills. Your team's time is more valuable than the course, and we treat it that way.",
  },
  {
    // a-20260914-200315-d7c25e: "we should make more of the fact that new
    // students won't get lost because we carefully walk through each project
    // after the student has tried themselves. Obviously, if the student knows
    // a lot about applied AI already, then they won't need to go through the
    // walkthrough as carefully as beginners".
    title: "Try it yourself first, then we work through it",
    description:
      "Every lesson builds towards a piece of work your team can relate to their own jobs, and nobody is left staring at a blank screen: people attempt the project themselves, then the lesson works through it step by step. Anyone who already works with AI can build it their own way and dip into the worked solution only where they want it.",
  },
  {
    // a-20260914-200357-6dddb2: "This is good, but again, I don't want people
    // to think that they're going to get lost towards the end of the course".
    title: "Beginner-friendly, and it stays that way",
    description:
      "Month 1 starts in plain English. Later lessons introduce writing code and building tools with help from AI, and they are taught exactly like the first ones: shown, attempted, then worked through. As the work gets more advanced, the support does not thin out.",
  },
  {
    // Was "You choose the syllabus", with team admins assigning optional
    // lessons to each role. The standard course has no picker and no team
    // admin screen: every month opens with all its core and optional lessons
    // and each learner chooses which optional ones to take (the course page
    // says the same). Choosing the lessons for a whole group is what an
    // edition does, which is the /for-institutions page (launch readiness
    // review, 2026-10-21).
    title: "The same core for everyone, optional lessons by role",
    description: `Everyone takes the same ${TOTAL_MANDATORY_LESSONS} core lessons. Each month also includes optional lessons for particular industries, for building more complex AI tools and for leading AI work. Each person chooses which of those to take, so you can point people to the ones that fit their job.`,
  },
  {
    // a-20260914-200722-f1a859: "we should say that we cover all of the top
    // models plus other better value models, unlike the LLMs. Several of the
    // large AI companies like Anthropic and OpenAI are starting to do their own
    // courses, but these are all very specific to their own LLMs and tools".
    //
    // Written as a contrast with SINGLE-PROVIDER courses rather than by naming
    // companies and asserting what they publish: a named claim about somebody
    // else's product is exactly the kind of thing that ages badly on a page
    // nobody re-checks, and the bible bans fabricated proof. The model coverage
    // claimed here is grounded in the canonical syllabus register: "Frontier
    // Labs Tooling: OpenAI, Anthropic, Google" and "Your AI Garage: test free
    // and low-cost models" in Month 1, "Cheaper and open models" and
    // "Self-hosting LLMs" in Month 2, "Open-source models at enterprise scale"
    // in Month 3.
    //
    // Corrected 2026-09-14 after review: the first pass said "Every leading
    // model" and "can only teach that company's own models and tools". The
    // register proves work across leading providers plus cheaper, open and
    // self-hosted alternatives; it does not prove EVERY leading model, and
    // nothing here can prove another publisher is INCAPABLE of teaching
    // outside its own products. Both absolutes are gone; the contrast David
    // asked for is now made as a tendency, which is defensible and does not
    // need re-checking every time a model ships.
    title: "Leading AI models, plus cheaper alternatives",
    description:
      "We do not sell tools and we are not owned by an AI company. Your team works with AI models from the leading AI companies and with lower-cost alternatives, including ones you can run on your own computers, and learns to choose between them on cost, privacy and fit. Provider-authored training naturally centres that provider's own models and tools.",
  },
  {
    // Was "Built for the enterprise conversation", ending "The strategic layer
    // that boards and compliance teams need to hear." Both reviewers read it as
    // sales language, and Sol asked for "ROI measurement" and "multi-agent
    // systems" to be explained (launch readiness review, 2026-10-21). The
    // topics are the config's own Month 3 description.
    title: "Month 3 covers leading AI at work",
    description:
      "The last month is about using AI across an organisation: the rules and checks it needs before it relies on AI, weighing what AI work costs against what it saves, helping people through the change, and setting up several AI assistants to share one job.",
  },
]

/**
 * The score item, shown only while the GWTH Score is switched on
 * (ENABLE_GWTH_SCORE, off at launch). Same rule as the home page's score
 * section (launch readiness, 2026-10-20).
 *
 * a-20260914-200925-203041, David: "We haven't mentioned the dynamic scoring
 * that makes it easy to reward and assess achievement". This replaced the
 * older "Plain progress reporting" item, which promised reporting on
 * "currentness": score decay is a config constant (SCORE_DECAY_DAYS) with no
 * implementation behind it, so that word stays banned, as does "score decays"
 * (for-teams.test.tsx).
 *
 * Rewritten 2026-10-21 (launch readiness review). The old text opened "No
 * score is switched on while the course is in beta. After it, ..." and ended
 * "Both are being built": beta wording and a promise of unbuilt work, which
 * the launch brief rules out. It also said admins see who passed each lesson
 * against a pass mark they set, which is the /org screen of an EDITION, not
 * something a team on the standard course gets. What is left is what
 * calculateGwthScore() in lib/progress/gwth-score.ts does: completed lessons x
 * POINTS_PER_LESSON, weighted by the quiz average.
 */
const SCORE_ITEM = {
  title: "Achievement you can assess and reward",
  description:
    "Each learner has a dynamic GWTH Score rather than a one-time certificate. It is worked out from the lessons they have finished and how they did on the check questions, so it moves as they work.",
}

/**
 * Syllabus month summaries. The month names come from MONTH_CONFIGS, so this
 * page uses the same names as the course page (launch readiness review,
 * 2026-10-21); before that it had a third set of its own.
 *
 * Every claim below is checked against the canonical syllabus register
 * (`/home/david/gwth-dashboard/gwth_pipeline.db`, modules month1 / month2 /
 * month3) rather than written from the month titles, because these three
 * sentences are the only description of the course most team buyers read.
 *
 * - **Month 1** (a-20260914-201048-8373b2, "This doesn't sound practical
 *   enough. Can we make it more hands-on"): named outputs, not topics. The
 *   register's Month 1 runs the six superpower lessons, then CV / job search /
 *   presentations / dashboards / transcription, then the four FamilyBot
 *   lessons.
 * - **Month 2** (a-20260914-201147-7a211a, "it also talks about small business
 *   use cases ... there may be some enterprises looking at this, and I don't
 *   want them thinking that this is just for small businesses"): "business use
 *   cases", never "small-business", and a longer sentence as he asked. Grounded
 *   in AskMyCo (RAG with citations), the security and testing lessons,
 *   browser/computer-use agents, FractionalBuddy, and the sector lessons for
 *   healthcare, legal and finance.
 * - **Month 3** (a-20260914-201312-2b5bdf, "you can choose your own path and
 *   you can either concentrate on enterprise transformation or building more
 *   advanced and robust things with AI"): the register really does fork after
 *   the shared core, which is lessons 0 to 19; the transformation path is the
 *   board, procurement, sector and responsible-AI lessons, and the building
 *   path is multi-agent orchestration, self-hosted infrastructure,
 *   open-source models at scale and red teaming.
 */
const MONTHS = [
  {
    month: 1,
    title: MONTH_CONFIGS[0]!.title,
    lessons: lessonCount(1),
    // "Six practical superpowers" went on 2026-10-21: the reviewer read it as
    // hype, and config had already retired "the six primitives" as jargon.
    description:
      "Hands-on from the first lesson. Your team practises using AI to finish real pieces of work: a research brief with sources they have checked, a first working dashboard, an automation that removes a weekly chore, and an assistant that turns a voice note into tasks. Each lesson has a project to complete.",
  },
  {
    month: 2,
    title: MONTH_CONFIGS[1]!.title,
    lessons: lessonCount(2),
    description:
      "Build apps, an AI assistant that answers from your own documents and cites them, and agents: AI assistants that carry out routine admin tasks. You learn the security, testing and data skills that keep this work safe, and the business use cases run from one-person practices to a large organisation. You also learn how to offer this work as a consulting service.",
  },
  {
    month: 3,
    title: MONTH_CONFIGS[2]!.title,
    lessons: lessonCount(3),
    // The two directions David asked for stay; the jargon Sol flagged ("AI
    // maturity", "multi-agent orchestration", "red teaming") is explained
    // where it is used (launch readiness review, 2026-10-21).
    description:
      "One shared core, then each person picks a direction. Everyone learns to assess how an organisation uses AI today, cost the work and lead the change. You then choose between leading AI across an organisation and building more complex tools. The leadership lessons cover setting the rules for using AI, reporting to the board and helping staff take it up. The building lessons cover several AI assistants working together on one job, AI models run on your own hardware, and red teaming, which means testing a system for weaknesses before anyone relies on it.",
  },
]

/** The whole-course price and its window, from lib/billing/passes. */
function coursePrices() {
  const window = getSaleWindow()
  return {
    sale: formatPence(PASS_PRICES_PENCE.courseSale),
    full: formatPence(PASS_PRICES_PENCE.courseFull),
    month1: formatPence(PASS_PRICES_PENCE.month1),
    opensOn: formatUkDate(window.salesOpenAt),
    // The window ends at midnight; the last day it covers is the day before.
    endsOn: formatUkDate(new Date(window.saleEndsAt.getTime() - 1)),
  }
}

type Faq = { question: string; answer: ReactNode }

/**
 * Frequently asked questions, rendered as native disclosure elements.
 *
 * Launch readiness review, 2026-10-21: every answer that promised a team admin
 * dashboard, per-role lesson assignment, or that "many companies" do
 * something was rewritten to what the standard course actually is. The admin
 * screens (src/app/org) belong to an edition, which is /for-institutions.
 */
function faqs(): Faq[] {
  const price = coursePrices()
  return [
    {
      question: "Can we choose which lessons our team completes?",
      answer: `Everyone takes the same ${TOTAL_MANDATORY_LESSONS} core lessons. Each month also opens optional lessons on particular industries, advanced topics and specialisations, and each person chooses which of those to take, so you can tell people which ones matter for their role. If you need to set the lessons for a whole group yourself, that is an edition of the course, which is explained on the institutions page.`,
    },
    {
      // REWRITTEN 2026-09-17 (bead gwth-launch-88z.32.36, marketing copy gate).
      // The old answer began "No.", which promises an outcome GWTH does not
      // control, and supported it with "retain 34% more staff", a figure with
      // no source on the page and no source in the archive that is safe to
      // publish. What the course can honestly say is what it teaches and who
      // decides.
      question: "Will this displace our employees?",
      answer:
        "That is not something a course decides. GWTH teaches the people you already have to use AI in the work they already do, so the skill sits with your team rather than only with the tools. Decisions about roles and staffing stay with your organisation.",
    },
    {
      question: "What does the course teach about company data?",
      answer:
        "It teaches your team to use AI responsibly with company information, including when to use a model that runs on your own computers rather than a service on the internet. Month 3 covers the rules and checks an organisation needs before it relies on AI. People learn the security risks before they start building.",
    },
    {
      // Was "What is the ROI?" with "Starter pricing" and no word of the
      // one-off price (launch readiness review, 2026-10-21). The outcome
      // sentences are the ones the 2026-09-17 copy gate settled.
      question: "What does it cost, and what will people have made?",
      answer: `${price.sale} a person for the whole course if you buy between ${price.opensOn} and ${price.endsOn}, then ${price.full}. Or £${COURSE_MONTHLY_PRICE} a month for each of the three months, and each person can cancel at any time. Staying current afterwards is optional, at £${ONGOING_MONTHLY_PRICE.toFixed(2)} a month. In Month 1 each person designs an automation for a routine job they do now. By Month 3 they have built an internal tool and worked through how an organisation-wide AI change is planned and costed.`,
    },
    {
      question: "Our team is not technical. Is this appropriate?",
      // a-20260914-200357-6dddb2 again: "I don't want people to think that
      // they're going to get lost towards the end of the course". The old
      // answer ended "for people ready to go deeper", which reads as a filter
      // rather than a promise.
      // Bible audience-by-purpose (David, 2026-10-20): say the range by role,
      // never by age, and claim no customers we do not have yet.
      answer:
        "Yes, it's designed for people across your workforce, from apprentices to senior leaders. People need a computer, an internet connection and the ability to type. That is the complete list of technical requirements. Month 1 uses plain English and practical examples. Later lessons introduce writing code with help from AI and building more complex tools, and they are taught the same way as the first ones: you see it, you attempt it, then the lesson works through it. The subject gets deeper, the hand-holding does not stop.",
    },
    {
      question: "How is this different from training published by an AI company?",
      // a-20260914-200722-f1a859. Same point as the differentiator list, made
      // at the length a buyer comparing offers will actually want, and made as
      // a tendency ("naturally centres", "little reason"), never an absolute
      // about what another publisher is able to teach.
      answer:
        "Provider-authored training naturally centres that provider's own models and tools. A course built around one platform can also go out of date when that platform changes its pricing, its capabilities or its terms. GWTH is not owned by a provider and sells no tools. Your team works with AI models from the leading AI companies and with lower-cost alternatives, including ones you can run on your own computers, and learns to judge which to reach for on cost, privacy and fit. That judgement is the part that still works after the next release.",
    },
    {
      question: "How does this compare to the government's AI Skills Boost?",
      answer:
        "AI Skills Boost offers free training in practical AI skills for work. GWTH is a three-month course with lessons and projects on using AI, building tools with it and leading AI work in an organisation. A team can take both.",
    },
    {
      // "Many companies do exactly this, and it is the most effective
      // approach", "start returning value from week one" and "admins can
      // prioritise lessons" were unsupported or untrue (2026-10-21).
      question: "Can employees complete this during working hours?",
      answer:
        "Yes. It takes about five hours a week for three months. Each lesson is built around a project that people can relate to the work they already do, so time spent on it during working hours is practice on familiar tasks.",
    },
    {
      question: "Can we start with a small group first?",
      answer:
        "Yes. There is no minimum number of places. You can buy places for two or three people, see how they get on, and buy more later.",
    },
    {
      question: "Can you write lessons for our company?",
      answer: (
        <>
          Yes, for a company or team of 100 or more learners, as part of an
          edition of the course. The lessons are written for your work and
          approved by your own experts before anyone sees them. That is on
          the <Link href="/for-institutions">institutions page</Link>.
        </>
      ),
    },
  ]
}

/**
 * Logistics mini-stats. "Self-paced, fits any schedule" and "Daily updates,
 * always current" went on 2026-10-21: neither is backed up, and the months
 * open on dates, which the note under the month cards now says.
 */
const HOW_IT_WORKS = [
  { label: "3 months", detail: "one month of lessons at a time" },
  { label: "About 5 hours a week", detail: "for each person" },
  { label: "Fully online", detail: "no travel required" },
  { label: "Individual accounts", detail: "each person signs in and tracks their own progress" },
]

/**
 * What a team buyer needs to know beside the two prices. "Same price for
 * teams: no bulk discount because it is already the lowest possible price"
 * was untrue while the one-off price is cheaper, and the admin dashboard and
 * per-role lesson lines described an edition, not the standard course (launch
 * readiness review, 2026-10-21). Gift facts from the gift sale plan.
 */
const TEAM_PRICE_FEATURES = [
  "To pay for someone else, buy them a place on the gift page. We email them a code. They have one year from purchase to use it, and their time starts when they do",
  "The person you buy for is never asked for their card, and there are no automatic renewal payments",
  "No minimum number of places",
  "GWTH is not VAT registered, so there is no VAT on these prices",
]

/**
 * How lesson choice works, shown in the ruled control box.
 *
 * ## Why there is no optional-lesson TOTAL here (a-20260914-201426-ae7f0e)
 *
 * David: *"I think we're definitely going to have more than 30 optional
 * lessons. So I'm not sure if we should put 50 here or should we make it a
 * round total of 120 lessons by putting 54 lessons here"*. That is a question,
 * not a number, so the number was derived instead. Every register that could
 * answer it gives a different answer, checked 2026-09-14:
 *
 * | Source | Mandatory | Optional |
 * |---|---|---|
 * | Canonical syllabus DB, `metadata.mandatory` over modules 1/3/4 | 60 | 44 |
 * | This site's `MONTH_CONFIGS` | 66 | 30 |
 * | Production, Month 1 only | 26 published | 0 declared |
 *
 * The canonical register also flags 10 Month-1 lessons optional where the site
 * config declares none, and its `is_optional` COLUMN is 0 on all 104 rows, so
 * even inside that one database the split lives in a metadata blob rather than
 * in the schema. There is no stable optional total to print, and 50 or 54 would
 * be an invented one. So the page keeps the mandatory figure, which comes from
 * config, and describes the optional set without counting it.
 *
 * 2026-10-20: MONTH_CONFIGS was re-counted to the syllabus database (22, 20
 * and 21 core; 63 in all), so the core figure on this page is now the
 * syllabus's. The optional figure is still never printed: David's rule stands
 * whatever the count (src/__tests__/marketing/optional-lessons-and-scoring).
 *
 * 2026-10-21 (launch readiness review): the bullets that promised a team admin
 * dashboard, per-role assignment and per-department completion rates are gone.
 * The standard course has no picker and no team admin screen; the /org
 * screens belong to an edition, which /for-institutions sells.
 */
const SYLLABUS_BULLETS = [
  `${TOTAL_MANDATORY_LESSONS} core lessons cover the AI skills everyone needs, and they are the same for every learner`,
  "A further set of optional lessons covers industry-specific and advanced topics, and it grows as new lessons are published",
  "Each month's optional lessons open with it, and each person chooses which to take",
  "Each person has their own account and their own progress page",
]

/**
 * What the optional lessons are actually FOR, written for somebody choosing on
 * behalf of other people.
 *
 * David, 2026-09-17 (a-20260917-145147-bfd191): *"people will want to do
 * specific lessons and not others ... We want to show that you can go deep into
 * one area, or you can do optional lessons by industry. This should attract
 * both individuals and institutions and big companies or teams"*.
 *
 * This page already had the control ("Complete control over what your team
 * learns") and the no-count rule. What it did not have was any sense of WHAT
 * the optional set contains, which is the half a buyer needs to picture their
 * own people in it. So this is a consolidation, added under the existing
 * syllabus control box rather than as a competing section.
 *
 * Every subject named is an authored lesson on disk, not a title from a plan:
 * `m2_l34` UK healthcare, `m2_l35` UK legal, `m2_l36` UK finance, `m2_l38`
 * creative industries, `m3_l23` public sector procurement, `m3_l24` financial
 * services, `m3_l26` professional services for consulting, legal and
 * accountancy firms, `m3_l27` manufacturing and supply chain; the building
 * lessons are `m2_l27` to `m2_l32` and `m3_l28` to `m3_l32`; the leadership
 * lessons are `m3_l21`, `m3_l22` and `m3_l35`.
 *
 * NOT named, deliberately: HR. When this was written there was no HR lesson;
 * the 2026-10-20 re-count lists HR, marketing and sales lessons in Month 2,
 * but the shared test still bans HR on this page until David says otherwise.
 * /for-institutions is where commissioning a subject is explained, and the
 * pointer at the end of this block sends a company that needs one there.
 *
 * Still no count, per a-20260914-201426-ae7f0e. See SYLLABUS_BULLETS.
 */
const ROLE_PATHS = [
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

/**
 * For teams page, in the PAPER-FIRST register: a two-column quiet masthead with
 * the emphasis carried by a jade italic, unruled UK stat columns, time-cost
 * comparison cards, a numbered differentiator list, rounded syllabus month
 * cards, logistics mini-stats, a featured investment card, a native-details FAQ
 * and a closing band. David called this his least favourite page on
 * 2026-09-13; batch 1 rebuilt its hierarchy out of spacing and type rather than
 * rules, and changed none of its words.
 *
 * ## The 2026-09-14 annotation pass (bead gwth-launch-88z.32.19)
 *
 * Batch 1 moved the furniture; this pass answers the ten written annotations
 * David left ON the page at https://hlab.taila51191.ts.net:9483/for-teams, so
 * unlike batch 1 it DOES change the words. Each change carries the annotation
 * id and his verbatim note at the place it applies:
 *
 * - `a-20260914-195842-52169b` source notes, see `.statSource` in the module
 * - `a-20260914-200101-e34e36` the comparison panel, see the comment above it
 * - `a-20260914-200315-d7c25e` / `-200357-6dddb2` support that does not thin
 *   out, in WHY_GWTH
 * - `a-20260914-200722-f1a859` vendor neutrality, in WHY_GWTH and the FAQ
 * - `a-20260914-200925-203041` the dynamic score, in WHY_GWTH
 * - `a-20260914-201048-8373b2` / `-201147-7a211a` / `-201312-2b5bdf` the three
 *   month summaries, in MONTHS
 * - `a-20260914-201426-ae7f0e` the optional-lesson count, in SYLLABUS_BULLETS
 *
 * `a-20260914-200143-635cd6` uses the canned action "Keep this, I like it"
 * without added free text. That action is feedback in its own right, so the
 * first differentiator is deliberately preserved unchanged.
 *
 * Factual claims here were checked against the canonical syllabus register and
 * the shipped scoring code, not against the old copy. Nothing in this pass
 * changes a price, a term or what the product is.
 *
 * ## The 2026-09-14 copy recovery (bead gwth-launch-88z.32.26)
 *
 * A separate pass, after the annotations above and careful not to disturb
 * them. David: "take any wording that is still relevant to the new GWTH
 * offering and ethos ... it seems a waste not to reuse as we spent hours
 * refining it". Four lines came back from `docs/marketing/`, each marked at
 * the place it applies, none carrying a figure:
 *
 * - **C09** the masthead standfirst
 * - **C10** the stats note
 * - **C11** one sentence into the provider-training FAQ. It is a statement
 *   about a COURSE built on one platform, not about what another publisher is
 *   able to teach, so it stays inside the boundary a-20260914-200722-f1a859
 *   drew.
 * - **C12** the opening of the non-technical FAQ. Added in FRONT of the answer
 *   a-20260914-200357-6dddb2 settled; that answer is untouched.
 *
 * One live claim on this page was checked and NOT changed: the FAQ "Will this
 * displace our employees?" ends with "Companies investing in AI training
 * retain 34% more staff". The archive attributes that to the Anthropic
 * Economic Index, which reports the distribution of tasks people bring to
 * Claude, not staff retention. It is recorded as ledger C32 and belongs with
 * bead gwth-launch-88z.32.25, which is putting these pages on one sourced set
 * of facts. Removing a live claim is not copy recovery, so this pass flagged
 * it rather than acting on it. Ledger:
 * `GWTH-launch-plan/completion/evergreen-copy-recovery/`.
 */
/** The published documents behind the three UK stat tiles, deduplicated. */
const STAT_SOURCES = Array.from(
  new Map(UK_STAT_IDS.map((id) => [ukFigureSource(id).id, ukFigureSource(id)])).values()
)

export type ForTeamsFdeProps = {
  /**
   * True once GWTH is on sale (isSelling(), read per request in page.tsx).
   * Only the buttons branch on it: buy from 1 December, the waitlist before.
   * The words are written to be true on both sides.
   */
  selling?: boolean
  /** True while the GWTH Score is switched on (ENABLE_GWTH_SCORE). */
  showScore?: boolean
}

export function ForTeamsFde({
  selling = false,
  showScore = false,
}: ForTeamsFdeProps = {}) {
  const price = coursePrices()
  const why = showScore
    ? [...WHY_GWTH.slice(0, 5), SCORE_ITEM, ...WHY_GWTH.slice(5)]
    : WHY_GWTH
  const primaryAction = selling ? (
    <Link href="/gift" className={styles.buttonSolid}>
      Buy places for your team
    </Link>
  ) : (
    <Link href="/waitlist" className={styles.buttonSolid}>
      Join the waitlist
    </Link>
  )

  return (
    <div className={styles.shell}>
      <section className={styles.masthead} data-section="masthead">
        <div className={styles.page}>
          <h1 className={styles.mastheadTitle}>
            AI training for <em>your team</em>
          </h1>
          {/* Recovered (ledger C09) from docs/marketing/for-employers-and-teams.md.
              Its opening sentence, "UK businesses are falling behind on AI
              skills", went on 2026-10-21: both launch readiness reviewers read
              it as the scare language the public voice rules out. The point
              it carried, capability over tool spend, stays. */}
          <p className={styles.standfirst}>
            Buying AI tools is only the start. They are useful at work when the
            people using them know how. GWTH is a practical AI course for work
            and everyday life in the UK. You can buy places for your team
            from {price.opensOn}.
          </p>
          <div className={styles.mastheadActions}>
            {primaryAction}
            <Link href="/contact" className={styles.buttonOutline}>
              Get in touch
            </Link>
          </div>
          {/* The split with /for-institutions, said once near the top so the
              two pages do not read as the same offer (launch readiness review,
              2026-10-21). */}
          <p className={styles.mastheadAside} data-testid="for-teams-split">
            Your team takes the same course as everyone else. A professional
            body, or an organisation that wants its own edition of the course,
            should read the{" "}
            <Link href="/for-institutions">institutions page</Link> instead.
          </p>
          <div className={styles.mastheadFoot}>
            <p>3 months · about 5 hours a week</p>
            <p>Fully online</p>
            <p>
              £{COURSE_MONTHLY_PRICE} a month for 3 months, then £
              {ONGOING_MONTHLY_PRICE.toFixed(2)} a month if you want to stay
              current
            </p>
          </div>
        </div>
      </section>

      <section className={styles.section} data-section="stats">
        <div className={styles.page}>
          <div className={styles.sectionHead}>
            {/* Was "The numbers are clear.", which both reviewers read as
                hype (2026-10-21). The heading now says what the figures are. */}
            <h2 className={styles.sectionTitle}>
              AI skills at work <em>in the UK.</em>
            </h2>
          </div>
          <div className={styles.statsRow}>
            {UK_STAT_IDS.map((id) => (
              <div key={id} className={styles.stat} data-testid="for-teams-stat">
                <strong data-uk-figure={id}>{ukFigure(id).value}</strong>
                <p>{ukFigure(id).label}</p>
                {/* Per-stat, because one blanket "DSIT" line over a list of six
                    organisations told the reader nothing about which number
                    came from where. The figure, its wording and its citation
                    all come from src/lib/data/uk-ai-context.ts. */}
                <p className={styles.statSource}>
                  Source: {ukFigureCitation(id)}
                </p>
              </div>
            ))}
          </div>
          {/* The documents themselves, linked once for the section rather than
              once per tile. Resolved from src/lib/data/uk-ai-context.ts so a
              link can never point at a document the figure did not come from. */}
          <p className={styles.statSource} data-testid="for-teams-stat-sources">
            Read them:{" "}
            {STAT_SOURCES.map((source, i) => (
              <span key={source.id}>
                {i > 0 ? (i === STAT_SOURCES.length - 1 ? " and " : ", ") : ""}
                <a href={source.url} target="_blank" rel="noopener noreferrer">
                  {source.title}
                </a>{" "}
                ({source.releasedLabel})
              </span>
            ))}
            .
          </p>
          {/* Recovered (ledger C10) from the "real risk is inaction" section of
              docs/marketing/for-employers-and-teams.md. "Most organisations"
              became "Many organisations" on 2026-10-21: the page has no
              figure for most. */}
          <p className={styles.statsNote}>
            Many organisations get stuck in one of two places: a few
            enthusiasts experimenting with no path from experiment to
            organisational capability, or enterprise AI tools bought and barely
            used because nobody was ever taught how to think with AI, only how
            to click the buttons in one product. GWTH gives each person three months of guided
            practice using AI on the work they already do.
          </p>
        </div>
      </section>

      <section
        className={`${styles.section} ${styles.sectionAlt}`}
        data-section="time-cost"
      >
        <div className={styles.page}>
          <div className={styles.sectionHead}>
            <h2 className={styles.sectionTitle}>
              The real cost is not the course.{" "}
              <em>It is your team&apos;s time.</em>
            </h2>
          </div>
          {/* "That is deliberately priced below even a short consultant call"
              went on 2026-10-21: an unsupported comparison. The one-off price
              is now beside the monthly one. */}
          <p className={styles.sectionLead}>
            The course costs £{COURSE_MONTHLY_PRICE} per person each month for
            three months, or {price.sale} per person paid once if you buy
            between {price.opensOn} and {price.endsOn}. On the monthly plan,
            after the three months the plan carries on at £
            {ONGOING_MONTHLY_PRICE.toFixed(2)} a month to keep lessons up to
            date, unless the person cancels.
          </p>
          {/*
            The comparison, rebuilt after a-20260914-200101-e34e36 ("it looks
            like it's a square shading box at the top inside a curved box which
            looks unprofessional and messy ... the font is really small and it's
            meant to be a kind of title, so it should be much bigger"). Same
            panel recipe on both sides, the name at heading size, the claim
            carried by the figure underneath it, the difference told by the
            WORDS rather than by a fill. The one piece of colour is the Bitter
            italic jade on the GWTH figure (paper-first-components, italic
            accent).

            2026-10-21: the GWTH figure was "Zero filler", which the reviewer
            read as hype. It now names what the buyer counts, in parallel with
            the left-hand panel.
          */}
          <div className={styles.compareRow}>
            <article className={styles.compareCard}>
              <h3 className={styles.compareWho}>Elsewhere</h3>
              <p className={styles.compareWhat}>When you compare courses</p>
              <p className={styles.compareFigure}>Count the hours</p>
              <p className={styles.compareBody}>
                Ask how many of the hours are spent practising on the work your
                team actually does, when the material was last rewritten, and
                how much of it repeats what came before.
              </p>
            </article>
            {/* Same panel as the card beside it, deliberately: the difference is
                told by the words and the figure, never by a fill. */}
            <article className={styles.compareCard}>
              <h3 className={styles.compareWho}>GWTH</h3>
              <p className={styles.compareWhat}>This course</p>
              <p className={`${styles.compareFigure} ${styles.compareFigureOurs}`}>
                Count what they make
              </p>
              <p className={styles.compareBody}>
                Each lesson is built around a project, such as a tool, a
                document or a plan, that people can relate to the work they
                already do.
              </p>
            </article>
          </div>
          <p className={styles.compareNote}>
            If people take lessons during working hours, you are paying for
            their time as well as for the course. That is why each lesson is
            built around a piece of work rather than around a video to sit
            through.
          </p>
        </div>
      </section>

      <section className={styles.section} data-section="why-gwth">
        <div className={styles.page}>
          <div className={styles.whyGrid}>
            <div>
              <h2 className={styles.sectionTitle}>
                Why GWTH <em>for teams.</em>
              </h2>
            </div>
            <ol className={styles.whyList}>
              {why.map((item, i) => (
                <li key={item.title} className={styles.whyItem}>
                  <p className={styles.whyIndex}>
                    {String(i + 1).padStart(2, "0")}
                  </p>
                  <div>
                    <h3>{item.title}</h3>
                    <p>{item.description}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section
        className={`${styles.section} ${styles.sectionAlt}`}
        data-section="syllabus"
      >
        <div className={styles.page}>
          <div className={styles.sectionHead}>
            {/* Was "Complete control over what your team learns", over a lead
                that promised a team admin dashboard. Neither is true of the
                standard course (launch readiness review, 2026-10-21). */}
            <h2 className={styles.sectionTitle}>What your team learns</h2>
          </div>
          <p className={styles.sectionLead}>
            Not every role needs every lesson. Everyone takes the same core
            lessons, and each month also opens a set of optional lessons, so
            people can spend their time on the ones that fit their work. Every
            idea is introduced with a clear explanation of why it matters, not
            just what it is, so people understand the practical benefit before
            they learn the skill.
          </p>
          <div className={styles.monthsRow}>
            {MONTHS.map((month) => (
              <article key={month.month} className={styles.monthCard}>
                <div className={styles.monthBody}>
                  <p className={styles.cardMeta}>
                    Month {month.month} · {month.lessons}
                  </p>
                  <h3>{month.title}</h3>
                  <p>{month.description}</p>
                </div>
              </article>
            ))}
          </div>
          {/* When each month opens, true on both sides of 1 December (facts
              sheet, launch readiness 2026-10-20). Dates from
              LATER_MONTHS_OPEN, so this page agrees with / and /pricing. */}
          <p className={styles.monthsNote} data-testid="months-availability">
            Month 1 is open from {price.opensOn}. Month 2 opens around{" "}
            {LATER_MONTHS_OPEN.month2} and Month 3 around{" "}
            {LATER_MONTHS_OPEN.month3}. If someone reaches a month before it
            opens, their time on the course is paused until it does.
          </p>
          <div className={styles.controlBox}>
            <h3>How lesson choice works</h3>
            <ul className={styles.ruledList}>
              {SYLLABUS_BULLETS.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          {/* What the optional set contains, so a buyer can picture their own
              people in it (a-20260917-145147-bfd191). See ROLE_PATHS above for
              which lessons each line is drawn from, and why HR is not here. */}
          <div className={styles.rolePaths} data-testid="role-paths">
            <h3>What your team can choose from</h3>
            <dl>
              {ROLE_PATHS.map((path) => (
                <div key={path.label}>
                  <dt>{path.label}</dt>
                  <dd>{path.detail}</dd>
                </div>
              ))}
            </dl>
            <p className={styles.rolePathsNote}>
              Nobody has to take all of it. If the subject your people need is
              not there, a professional body, or a company or team of 100 or
              more learners, can have lessons written for it and approved by its
              own experts before anyone sees them. That is on the{" "}
              <Link href="/for-institutions">institutions page</Link>.
            </p>
          </div>
        </div>
      </section>

      <section className={styles.section} data-section="how-it-works">
        <div className={styles.page}>
          <div className={styles.sectionHead}>
            <h2 className={styles.sectionTitle}>How it works</h2>
          </div>
          <div className={styles.miniStats}>
            {HOW_IT_WORKS.map((item) => (
              <div key={item.label} className={styles.miniStat}>
                <strong>{item.label}</strong>
                <p>{item.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        className={`${styles.section} ${styles.sectionAlt}`}
        data-section="investment"
      >
        <div className={styles.page}>
          <div className={styles.sectionHead}>
            <h2 className={styles.sectionTitle}>
              The same price per person, <em>whatever the size of the team.</em>
            </h2>
          </div>
          <article className={styles.investCard}>
            <div className={styles.investBody}>
              <div className={styles.priceRows}>
                <div className={styles.priceRow}>
                  <p className={styles.cardMeta}>Paid monthly</p>
                  <p className={styles.investPrice}>
                    <strong>£{COURSE_MONTHLY_PRICE}</strong>
                    <span>a month for each person</span>
                  </p>
                  <p>
                    For each of the three months. Each person signs up with
                    their own account and can cancel at any time. After the
                    three months, the plan carries on at £
                    {ONGOING_MONTHLY_PRICE.toFixed(2)} a month unless they
                    cancel.
                  </p>
                </div>
                <div className={styles.priceRow}>
                  <p className={styles.cardMeta}>Paid once</p>
                  <p className={styles.investPrice}>
                    <strong>{price.sale}</strong>
                    <span>for the whole course, for each person</span>
                  </p>
                  <p>
                    If you buy between {price.opensOn} and {price.endsOn}.
                    After that, the whole course is {price.full}. The first
                    month on its own is {price.month1}.
                  </p>
                </div>
              </div>
              <ul className={styles.ruledList}>
                {TEAM_PRICE_FEATURES.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
            </div>
          </article>
          {/* "International pricing coming soon" went on 2026-10-21: a promise
              the launch brief rules out. */}
          <p className={styles.investFoot}>
            All prices are in pounds. Every option is on the{" "}
            <Link href="/pricing">pricing page</Link>.
          </p>
        </div>
      </section>

      <section className={styles.section} data-section="faq">
        <div className={styles.page}>
          <div className={styles.sectionHead}>
            <h2 className={styles.sectionTitle}>
              Frequently asked <em>questions.</em>
            </h2>
          </div>
          <div className={styles.faqList}>
            {faqs().map((faq) => (
              <details key={faq.question} className={styles.faqItem}>
                <summary>{faq.question}</summary>
                <p>{faq.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* The second button was "Try a free lab" under a sentence about what
          the course covers (reviewer, 2026-10-21). It now goes to the course,
          and the first button says how a team actually pays. */}
      <section className={styles.closing} data-section="closing">
        <div className={styles.page}>
          <h2>
            Buying places <em>for your team?</em>
          </h2>
          <p>
            Places are on sale from {price.opensOn}. Buy one for each person
            on the gift page, or get in touch if you have a question first.
          </p>
          <div className={styles.closingActions}>
            {primaryAction}
            <Link href="/contact" className={styles.buttonOutline}>
              Get in touch
            </Link>
            <Link href="/lessons" className={styles.buttonOutline}>
              See the course
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
