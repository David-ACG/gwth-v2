import Link from "next/link"
import {
  COURSE_MONTHLY_PRICE,
  MONTH_CONFIGS,
  ONGOING_MONTHLY_PRICE,
  TOTAL_MANDATORY_LESSONS,
} from "@/lib/config"
import { UK_STATS } from "@/components/marketing/data"
import styles from "./for-teams-fde.module.css"
import { canPromoteLabs } from "@/lib/labs-cta"

/**
 * Per-month lesson counts, read from config rather than retyped, so this page
 * cannot drift from the course page and the dashboard (W26 defect 4).
 *
 * The MANDATORY figure is printed, because that is the number the admin
 * dashboard enforces against a learner's edition. The per-month OPTIONAL figure
 * is not, for the same reason the page no longer prints an optional total: the
 * canonical syllabus register and this config disagree about the split. See the
 * table on SYLLABUS_BULLETS (a-20260914-201426-ae7f0e).
 */
function lessonCount(month: 1 | 2 | 3): string {
  const config = MONTH_CONFIGS[month - 1]!
  return config.optionalLessons > 0
    ? `${config.mandatoryLessons} mandatory, plus optional`
    : `${config.mandatoryLessons} mandatory`
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
      "Not slides. Not theory. Every lesson builds towards a real output your team can use at work, and nobody is left staring at a blank screen: people attempt the project themselves, then the lesson works through it step by step. Anyone who already works with AI can build it their own way and dip into the worked solution only where they want it.",
  },
  {
    // a-20260914-200357-6dddb2: "This is good, but again, I don't want people
    // to think that they're going to get lost towards the end of the course".
    title: "Beginner-friendly, and it stays that way",
    description:
      "Month 1 starts in plain English. Later lessons introduce AI-assisted coding and building patterns, and they are taught exactly like the first ones: shown, attempted, then worked through. The depth goes up; the support does not thin out.",
  },
  {
    title: "You choose the syllabus",
    description: `${TOTAL_MANDATORY_LESSONS} essential lessons are mandatory. Beyond those, a further set of optional lessons covers industry-specific and advanced topics, and it grows as new lessons are published. Team admins assign the right optional lessons to each role, so no one wastes time on irrelevant content.`,
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
    title: "Leading models, plus better-value alternatives",
    description:
      "We do not sell tools and we are not owned by a model provider. Your team works across leading models and the strong better-value alternatives beside them, including open and self-hosted ones, and learns to choose between them on cost, privacy and fit. Provider-authored training naturally centres that provider's own models and tools.",
  },
  {
    // a-20260914-200925-203041: "We haven't mentioned the dynamic scoring that
    // makes it easy to reward and assess achievement". This replaces the older
    // "Plain progress reporting" item, which promised reporting on
    // "currentness": score decay is a config constant (SCORE_DECAY_DAYS) with
    // no implementation behind it, so that word is gone rather than restated.
    // What IS implemented: calculateGwthScore() in lib/progress/gwth-score.ts
    // (completed lessons x POINTS_PER_LESSON, weighted by quiz average, against
    // the learner's own edition), and the org learner table, which shows who
    // has reached and passed each lesson at the edition's pass mark.
    //
    // 2026-09-17 (bead gwth-launch-88z.32.36): the two gaps are now NAMED on
    // the page rather than only kept out of it. There is no stored score
    // history anywhere in the product, so movement over time cannot be shown,
    // and nothing re-opens a lesson that has been rewritten. Saying so in the
    // item is what lets the item claim the rest in the present tense. The two
    // banned words stay banned: "currentness" and "score decays" are enforced
    // by for-teams.test.tsx.
    title: "Achievement you can assess and reward",
    description:
      "No score is switched on while the course is in beta. After it, each learner will have a dynamic GWTH Score rather than a one-time certificate: calculated from the lessons they have finished on the syllabus you assigned them and how they did on the check questions, so it moves as they work. Admins will see who has reached and passed each lesson against the pass mark they set, which is enough to recognise real progress without running a survey. Two things it will not do at first: show which way a learner is going over time, and fall when a lesson they passed has been rewritten. Both are being built.",
  },
  {
    title: "Built for the enterprise conversation",
    description:
      "Month 3 covers governance, ROI measurement, change management, and multi-agent systems. The strategic layer that boards and compliance teams need to hear.",
  },
]

/**
 * Syllabus month summaries.
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
    title: "Foundations",
    lessons: lessonCount(1),
    description:
      "Hands-on from the first lesson. Your team stops using ChatGPT like a search box and starts finishing things: a research brief that checks its own sources, a first working dashboard, an automation that removes a weekly chore, and an assistant that turns a voice note into tasks. Six practical superpowers, each with a project to complete.",
  },
  {
    month: 2,
    title: "Apps, Workflows & Consulting",
    lessons: lessonCount(2),
    description:
      "Build the things other people come to rely on: real apps, a knowledge engine that answers from your own documents and cites them, and agents that take the admin off your team. The security, testing and data foundations sit underneath, and the business use cases run from a one-person practice to a large organisation, with the consulting toolkit to package the work.",
  },
  {
    month: 3,
    title: "Transformation or advanced building",
    lessons: lessonCount(3),
    description:
      "One shared core, then your team picks a direction. Everyone learns to assess an organisation, score its AI maturity, cost the work and lead the change. After that it forks: enterprise transformation, with governance, board reporting and adoption that sticks, or deeper building, with multi-agent orchestration, self-hosted models and red teaming for systems that have to hold up.",
  },
]

/** Frequently asked questions, rendered as native disclosure elements. */
const FAQS = [
  {
    question: "Can we choose which lessons our team completes?",
    answer: `Yes. The ${TOTAL_MANDATORY_LESSONS} mandatory lessons cover essential AI skills that everyone needs. Beyond that, optional lessons cover industry-specific applications, advanced topics and specialisations, and more are added as they are published. Team admins can assign relevant optional lessons per role: your marketing team does not need the same modules as your engineering team. Individual learners can also pick their own path from the optional lessons.`,
  },
  {
    // REWRITTEN 2026-09-17 (bead gwth-launch-88z.32.36, marketing copy gate).
    // The old answer began "No.", which promises an outcome GWTH does not
    // control, and supported it with "retain 34% more staff", a figure with no
    // source on the page and no source in the archive that is safe to publish.
    // What the course can honestly say is what it teaches and who decides.
    question: "Will this displace our employees?",
    answer:
      "That is not something a course decides. GWTH teaches the people you already have to use AI in the work they already do, so the skill sits with your team rather than only with the tools. Decisions about roles and staffing stay with your organisation.",
  },
  {
    question: "Is our data safe?",
    answer:
      "The course teaches your team how to use AI responsibly, including when to use private/local models versus cloud APIs. Month 3 includes governance frameworks specifically designed for enterprise data handling. Your team will understand the security implications before they start building.",
  },
  {
    question: "What is the ROI?",
    // REWRITTEN 2026-09-17 (bead gwth-launch-88z.32.36, marketing copy gate).
    // "By Month 1, your team should be automating tasks that currently take
    // hours" turned a lesson into a guaranteed result at work, and Month 3 did
    // the same with an organisation-wide initiative. The answer now states the
    // price and what the months actually ask a learner to do.
    answer: `Starter pricing is £${COURSE_MONTHLY_PRICE}/mo for each person, with monthly access rather than an annual lock-in, and £${ONGOING_MONTHLY_PRICE.toFixed(2)}/mo per person after the course to stay current. In Month 1 each person designs an automation for a routine job they do now. By Month 3 they have built an internal tool and worked through how an organisation-wide AI change is planned and costed.`,
  },
  {
    question: "Our team is not technical. Is this appropriate?",
    // a-20260914-200357-6dddb2 again: "I don't want people to think that
    // they're going to get lost towards the end of the course". The old answer
    // ended "for people ready to go deeper", which reads as a filter rather
    // than a promise, and it was the sentence a non-technical buyer would
    // reach for to talk themselves out of it.
    answer:
      "People need a computer, an internet connection and the ability to type. That is the complete list of technical requirements. Month 1 uses plain English and practical AI patterns. Later lessons do introduce AI-assisted coding and stronger building techniques, and they are taught the same way as the first ones: you see it, you attempt it, then the lesson works through it. The subject gets deeper, the hand-holding does not stop.",
  },
  {
    question: "How is this different from training published by an AI company?",
    // a-20260914-200722-f1a859. Same point as the differentiator list, made at
    // the length a buyer comparing offers will actually want, and corrected
    // the same way: a tendency ("naturally centres", "little reason"), never
    // an absolute about what another publisher is able to teach.
    answer:
      "Provider-authored training naturally centres that provider's own models and tools, and has little reason to point you at a cheaper option elsewhere. A course built around one platform also goes out of date the moment that platform changes its pricing, its capabilities or its terms. GWTH is not owned by a provider and sells no tools. Your team works across leading models and the strong better-value alternatives beside them, including open and self-hosted ones, and learns to judge which to reach for on cost, privacy and fit. That judgement is the part that still works after the next release.",
  },
  {
    question: "How does this compare to the government's AI Skills Boost?",
    answer:
      "The government programme covers AI awareness basics in 20 minutes to 9 hours. GWTH goes further with structured lessons, practical projects, AI-assisted building, and enterprise transformation. Many teams complete the free government badge first, then use GWTH for the skills their people actually need.",
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
      "Yes. For teams of 100+, we can create bespoke lessons tailored specifically to your company's workflows, tools, and industry challenges. This means your team learns AI skills in the context of the work they actually do every day, not generic examples they have to mentally translate. Get in touch to discuss your requirements.",
  },
]

/** Logistics mini-stats. */
const HOW_IT_WORKS = [
  { label: "3 months", detail: "structured curriculum" },
  { label: "5 hours/week", detail: "per team member" },
  { label: "Fully online", detail: "no travel required" },
  { label: "Self-paced", detail: "fits any schedule" },
  { label: "Daily updates", detail: "always current" },
]

/** What the per-person price includes for teams. */
const TEAM_PRICE_FEATURES = [
  "Same price for teams: no bulk discount because it is already the lowest possible price",
  "No minimum contract, no lock-in",
  "Teams of 5+ get an admin dashboard with progress tracking and completion rates",
  "Admin chooses which optional lessons each role completes",
  "Cancel anytime, per seat",
]

/**
 * How syllabus control works, shown in the ruled control box.
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
 * config and is what the admin dashboard actually enforces, and describes the
 * optional set without counting it. Print a number here again only when one
 * register owns the split and the others read from it.
 */
const SYLLABUS_BULLETS = [
  `${TOTAL_MANDATORY_LESSONS} mandatory lessons cover the essential AI skills everyone needs, no choices required`,
  "A further set of optional lessons covers industry-specific and advanced topics, and it grows as new lessons are published",
  "Team admins assign relevant optional lessons per role via the dashboard",
  "Individual learners (non-team) pick their own path from optional lessons",
  "Progress tracking shows completion rates per person and per department",
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
 * NOT named, deliberately: HR. There is no HR lesson in the course; the only
 * one in the syllabus register sits in the retired `old_backlog` module.
 * /for-institutions is where commissioning a subject is explained, and the
 * pointer at the end of this block sends a company that needs one there.
 *
 * Still no count, per a-20260914-201426-ae7f0e. See SYLLABUS_BULLETS.
 */
const ROLE_PATHS = [
  {
    label: "Client-facing and regulated work",
    detail:
      "Lessons on UK legal practice, finance, healthcare, manufacturing and supply chain, buying AI in the public sector, and professional services for consulting, legal and accountancy firms. Each works to the rules that field is held to, so nobody has to translate a general course into their own job.",
  },
  {
    label: "The people who build",
    detail:
      "Retrieval that answers from your own documents and shows where each answer came from, testing and evaluating what has been built, security, running models on your own hardware, and several AI assistants working together on one job.",
  },
  {
    label: "The people who lead it",
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
export function ForTeamsFde() {
  return (
    <div className={styles.shell}>
      <section className={styles.masthead} data-section="masthead">
        <div className={styles.page}>
          <h1 className={styles.mastheadTitle}>
            AI Training for <em>Your Team</em>
          </h1>
          {/* Recovered (ledger C09) from docs/marketing/for-employers-and-teams.md.
              It replaces "The gap is not tools, it is training", which said the
              same thing more weakly and in the same shape as the home page
              headline ("The gap is not access. It is depth."), so the two pages
              read as one sentence repeated. */}
          <p className={styles.standfirst}>
            UK businesses are falling behind on AI skills. The companies that
            will lead in three years are not the ones buying the most AI tools
            today. They are the ones whose people know how to use them.
          </p>
          <div className={styles.mastheadActions}>
            <Link href="/contact" className={styles.buttonSolid}>
              Get in touch
            </Link>
            {canPromoteLabs() ? (
              <Link href="/labs" className={styles.buttonOutline}>
                Try a free lab
              </Link>
            ) : (
              <Link href="/lessons" className={styles.buttonOutline}>
                See the curriculum
              </Link>
            )}
          </div>
          <div className={styles.mastheadFoot}>
            <p>3 months · 5 hours a week</p>
            <p>Fully online</p>
            <p>
              £{COURSE_MONTHLY_PRICE}/mo, then £
              {ONGOING_MONTHLY_PRICE.toFixed(2)}/mo
            </p>
          </div>
        </div>
      </section>

      <section className={styles.section} data-section="stats">
        <div className={styles.page}>
          <div className={styles.sectionHead}>
            <h2 className={styles.sectionTitle}>
              The numbers <em>are clear.</em>
            </h2>
          </div>
          <div className={styles.statsRow}>
            {UK_STATS.map((stat) => (
              <div key={stat.value} className={styles.stat} data-testid="for-teams-stat">
                <strong>{stat.value}</strong>
                <p>{stat.label}</p>
                {/* Per-stat, because one blanket "DSIT" line over a list of six
                    organisations told the reader nothing about which number
                    came from where. */}
                <p className={styles.statSource}>Source: {stat.source}</p>
              </div>
            ))}
          </div>
          {/* Recovered (ledger C10) from the "real risk is inaction" section of
              docs/marketing/for-employers-and-teams.md. It replaces "Most AI
              training fails because it teaches tools, not skills", which is
              true and abstract; this is the same point as something a buyer
              recognises about their own organisation. The archive's label for
              it, "pilot purgatory", is not recovered: the picture is the useful
              part and the jargon is not.

              The sentence after it went with the swap: it said "the UK
              government's own research shows only 21% of workers feel confident
              using AI", which is the stat tile immediately above it, with its
              own citation. One substitution had made the paragraph six lines
              with the same figure twice in it; removing the repeat puts it back
              to five and gives "will not change" a better antecedent, which is
              the two-places diagnosis rather than a number already on screen. */}
          <p className={styles.statsNote}>
            Most organisations are stuck in one of two places: a few
            enthusiasts experimenting with no path from experiment to
            organisational capability, or enterprise AI tools bought and barely
            used because nobody was ever taught how to think with AI, only how
            to click the buttons in one product. A 20-minute vendor course will
            not change either of them. Three months of hands-on, vendor-neutral
            training, at five hours a week, will.
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
          <p className={styles.sectionLead}>
            At £{COURSE_MONTHLY_PRICE}/mo for 3 months, the entire course
            costs £{COURSE_MONTHLY_PRICE}/mo per person, dropping to £
            {ONGOING_MONTHLY_PRICE.toFixed(2)}/mo once the teaching is done.
            That is deliberately priced below even a short consultant call.
          </p>
          {/*
            The comparison, rebuilt after a-20260914-200101-e34e36. It used to
            be two cards each wearing a full-width coloured band: "it looks like
            it's a square shading box at the top inside a curved box which looks
            unprofessional and messy ... the dark colour where it says elsewhere
            is too dark with the dark text on top of it, so it's difficult to
            read, and the light just fades into the background ... the font is
            really small and it's meant to be a kind of title, so it should be
            much bigger".

            All four faults had one cause: a retired component. Coloured card
            tops went out with FDE (bible paper-first-components, "No coloured
            card tops"), and the two that were left had been repainted in
            --v-muted and --v-quiet, which are a METADATA INK and a QUIET FILL.
            --v-muted behind --v-ink is 1.85:1, hence unreadable; --v-quiet on
            the white band is 1.17:1, hence invisible; and the band was a square
            child of a 10px-radius parent with no overflow clip, hence the
            square-inside-curve.

            It is now an ordinary comparison: same panel recipe on both sides
            (--v-bg on the white band, one measured --v-line boundary, 10px
            radius), the name at heading size so the title IS the title, the
            claim carried by the figure underneath it, and the difference told
            by the WORDS rather than by a fill. The one piece of colour is the
            Bitter italic jade on the GWTH figure, which is the register's own
            emphasis device (paper-first-components, italic accent).
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
                Zero filler
              </p>
              <p className={styles.compareBody}>
                Every lesson ends with something your team has made: a tool, a
                document or a plan they can take straight into the work they
                were already doing.
              </p>
            </article>
          </div>
          <p className={styles.compareNote}>
            When your employees complete lessons during working hours, as many
            companies encourage, every hour is paid for twice. That is why each
            lesson is built around a piece of work rather than around a video
            to sit through.
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
              {WHY_GWTH.map((item, i) => (
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
            <h2 className={styles.sectionTitle}>
              Complete control over what your team learns
            </h2>
          </div>
          <p className={styles.sectionLead}>
            Not every role needs every lesson. The team admin dashboard lets
            you build the right syllabus for each department. Every concept
            is introduced with a clear explanation of why it matters, not
            just what it is, so your team stays engaged because they
            understand the practical benefit before learning the skill.
          </p>
          <div className={styles.monthsRow}>
            {MONTHS.map((month) => (
              <article key={month.month} className={styles.monthCard}>
                <div className={styles.cardTop}>
                  <span>Month {String(month.month).padStart(2, "0")}</span>
                  <span>{month.lessons}</span>
                </div>
                <div className={styles.monthBody}>
                  <h3>{month.title}</h3>
                  <p>{month.description}</p>
                </div>
              </article>
            ))}
          </div>
          <div className={styles.controlBox}>
            <h3>How syllabus control works</h3>
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
              Same per-person price <em>for any team size.</em>
            </h2>
          </div>
          <article className={styles.investCard}>
            <div className={styles.cardTop}>
              <span>Per person</span>
              <span>GBP · monthly</span>
            </div>
            <div className={styles.investBody}>
              <p className={styles.investPrice}>
                <strong>£{COURSE_MONTHLY_PRICE}</strong>
                <span>/mo per person</span>
              </p>
              <p>
                per course month, then £{ONGOING_MONTHLY_PRICE.toFixed(2)}/mo
                optional Stay Current access after course access ends.
              </p>
              <ul className={styles.ruledList}>
                {TEAM_PRICE_FEATURES.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
            </div>
          </article>
          <p className={styles.investFoot}>
            All prices in GBP. International pricing coming soon. See the
            full pricing breakdown on the{" "}
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
            {FAQS.map((faq) => (
              <details key={faq.question} className={styles.faqItem}>
                <summary>{faq.question}</summary>
                <p>{faq.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.closing} data-section="closing">
        <div className={styles.page}>
          <h2>
            Ready to upskill <em>your UK team?</em>
          </h2>
          <p>
            Get in touch to discuss your team&apos;s needs, or take a look at
            what the course covers.
          </p>
          <div className={styles.closingActions}>
            <Link href="/contact" className={styles.buttonSolid}>
              Get in touch
            </Link>
            {canPromoteLabs() ? (
              <Link href="/labs" className={styles.buttonOutline}>
                Try a free lab
              </Link>
            ) : (
              <Link href="/lessons" className={styles.buttonOutline}>
                See the curriculum
              </Link>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
