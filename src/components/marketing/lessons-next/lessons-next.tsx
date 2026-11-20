import Image from "next/image"
import Link from "next/link"
import {
  ENABLE_CAPSTONE_HAND_IN,
  ENABLE_GWTH_SCORE,
  MONTH_CONFIGS,
  ONGOING_MONTHLY_PRICE,
  TOTAL_MANDATORY_LESSONS,
  TOTAL_OPTIONAL_LESSONS,
} from "@/lib/config"
import { MONTH_STEPS } from "@/components/marketing/home-next/home-next"
import { HAND_IN_QUESTIONS } from "@/lib/capstones/guides"
import { BAND_LABELS, type Band } from "@/lib/capstones/rules"
import { canPromoteLabs } from "@/lib/labs-cta"
import p from "@/components/marketing/paper/paper.module.css"
import styles from "./lessons-next.module.css"

/**
 * "The course" (`/lessons`), rebuilt on 19 Nov 2026 as the month-by-month
 * detail the home page only summarises. David: *"The course, we've mostly
 * covered this on the home page, and it needs a complete revamp if we're going
 * to keep it."* Decided with him: it stays in the menu and shows the shape of
 * the course, for someone who liked the home page and wants to see what they
 * will learn and make. CIPD reads it to judge the course's substance. Later
 * the same day it stopped listing lessons (see "No lesson titles" below).
 *
 * ## The page, in order
 *
 * 1. `hero`: what the page is, with the course in four figures.
 * 2. `months`: the shape of the course. Choose a month to see what it is for,
 *    three example projects you make in it and its major project. Radio
 *    buttons drawn as cards, as on the home page, so it works with no script.
 * 3. `lesson`: how one lesson works, in the real order (film, reading,
 *    questions on the lesson, project).
 * 4. `marking`: how the monthly projects are marked, the four levels, the
 *    score and the portfolio.
 * 5. `optional`: the three directions the optional lessons run in, the UK
 *    rules the specialist lessons work to, and the route for an organisation.
 * 6. `current`: how the course stays up to date.
 * 7. `closing`: the one next step.
 *
 * ## Where the facts come from
 *
 * - No lesson titles, on purpose. David, 19 Nov 2026: *"we give an awful lot
 *   away as to what's in the course, and I'm worried that people will be able
 *   to reverse engineer the whole course from the syllabus"*. He chose "Shape,
 *   not the list": each month shows three example projects instead of its
 *   lessons (`EXAMPLE_PROJECTS` below), and the optional lessons appear as one
 *   total, once ("One total, once"). The lesson list that was here
 *   (`syllabus.ts`) was deleted; it is in git history. Do not bring titles,
 *   per-lesson marks or per-month hand-in lists back onto this page.
 * - Counts: `MONTH_CONFIGS` (`TOTAL_MANDATORY_LESSONS`,
 *   `TOTAL_OPTIONAL_LESSONS`, `mandatoryLessons`), never typed.
 * - Month names and what each month is for: `MONTH_STEPS` on the home page,
 *   so the two pages cannot disagree.
 * - The monthly projects: `capstoneName` and `capstoneDescription` in
 *   `MONTH_CONFIGS`; the four hand-in questions come from the marking guides
 *   in `lib/capstones/guides.ts`; the level names from
 *   `lib/capstones/rules.ts`.
 * - Marking, the score and the portfolio: the sentences on the home page
 *   (`home-next`), reordered. The score rules are in the `SCORE_STATES`
 *   comment in `home-fde`: read it before changing the score copy.
 * - How a lesson works, the optional directions, the UK rules, the
 *   organisation route: the previous page (`lessons-fde`), whose comments
 *   trace each sentence.
 *
 * Public pages describe the course as it is at launch, in the present tense
 * (David, 19 Nov 2026), so the route passes `showScore` and `markingLive`. The
 * props default to the product flags, as on the home page.
 *
 * No link opens a lesson (David, 1 Nov 2026). The one lesson a visitor can
 * take is the free lesson at `/start-here`.
 *
 * Pictures: paper cutouts in the style David picked on 13 Nov 2026. Briefs:
 * GWTH-launch-plan `completion/public-pages-fable/pictures/lessons/`.
 */

/** The four levels of a project mark, lowest first, named by the product. */
const BANDS: readonly Band[] = ["not_yet", "pass", "good", "excellent"]

const MONTH_PICTURE_ALT: Record<number, string> = {
  1: "A paper cutout scene: a man at his kitchen table with a laptop showing a simple web page, a small bar chart he has made from his receipts, and a mug of tea.",
  2: "A paper cutout scene: at the counter of a small plant shop, a young woman shows the owner a chat tool on her laptop, beside a row of the shop's document folders.",
  3: "A paper cutout scene: a woman stands in a meeting room and presents a chart and a printed report to three colleagues around a table.",
}

/**
 * How one lesson works, in the real order. The sentences are the home page's
 * and the previous page's, set as four steps instead of three.
 */
const LESSON_STEPS = [
  {
    title: "Watch a short film",
    body: "Every lesson opens with a film about what you'll do.",
  },
  {
    title: "Read the lesson",
    body: "The written lesson takes you through it step by step, over several pages.",
  },
  {
    title: "Answer the questions",
    body: "The questions on the lesson are a quiz with a pass mark. Your answers are marked automatically, so you can see what to go back over.",
  },
  {
    title: "Do the project",
    body: "Put what you have learnt into practice. You build useful things that you can use and show to other people.",
  },
] as const

/**
 * The three directions the optional lessons run in. The wording is the
 * previous page's (`PATHS` in `lessons-fde`), where every subject is traced to
 * an authored lesson.
 */
const PATHS = [
  {
    title: "Go deeper in your own field",
    body: "Apply AI within the rules of UK legal practice, finance, healthcare, manufacturing, supply chains, public-sector purchasing, and professional services for consulting, legal and accountancy firms.",
  },
  {
    title: "Go further into building",
    body: "Build tools that answer from your documents and show their sources. Test and protect them, run AI on your computer and get several AI assistants working together.",
  },
  {
    title: "Learn to lead the change",
    body: "Learn what boards need to know, how to check public-sector AI suppliers, how to run an AI consulting practice and what organisations owe people when work changes.",
  },
] as const

type ExampleProject = {
  /** What you make, in one sentence-case line. */
  text: string
  /** The project comes from an optional lesson, so the page says so. */
  optional?: true
}

/**
 * Three example projects a month, shown instead of the lesson list (David,
 * 19 Nov 2026: *"we should just put the examples of projects that you do in
 * each month, say 3 examples from each month. This may be more of a hook than
 * having the lesson list"*). Each line comes from a real lesson's project
 * file in `~/gwth-dashboard/generated_lessons/<folder>/content/`, named in the
 * comment beside it. Keep the meaning; never add a lesson title.
 */
export const EXAMPLE_PROJECTS: Record<number, readonly ExampleProject[]> = {
  1: [
    // m1_l09_building_superpower_make_your_first_useful_thing_without_coding
    // (project.candidate.md)
    {
      text: "An assistant for a weekly chore, like a meal planner that starts from what's in your fridge",
    },
    // m1_l15_job_search_and_interview_confidence_with_ai
    {
      text: "A mock job interview, with AI playing the panel and coaching your answers",
    },
    // m1_l14_cv_and_linkedin_upgrade_tell_your_story_better_with_ai
    {
      text: "Your CV and LinkedIn profile, checked honestly against a real UK job advert",
    },
  ],
  2: [
    // m2_l17_advanced_content_superpower_brand_proposals_decks_and_sites
    {
      text: "A brand guide for a small business, then a proposal, presentation or website made with it",
    },
    // m2_l16_geo_and_agent_shopping_the_new_seo_for_uk_businesses
    {
      text: "A check of whether AI assistants can find and understand a local business online",
    },
    // m2_l40_ai_for_uk_hr_and_people_teams (an optional lesson)
    {
      text: "An HR assistant that drafts job adverts and new-starter checklists for you to check for fairness",
      optional: true,
    },
  ],
  3: [
    // m3_l13_your_company_s_ai_workspace_what_a_rollout_really_takes
    {
      text: "A recommendation on which AI tools an organisation should use and what they would cost",
    },
    // m3_l19_ai_champion_playbook_board_briefing_and_90_day_plan
    { text: "A board briefing and a 90-day AI plan for a UK firm" },
    // m3_l11_enterprise_economics_roi_cost_and_the_ai_p_l
    {
      text: "A one-page business case estimating an AI project's costs and potential savings",
    },
  ],
}

/** One picture in both editions, swapped by theme like the home page's plates. */
function Picture({
  name,
  alt,
  sizes,
  priority = false,
}: {
  name: string
  alt: string
  sizes: string
  priority?: boolean
}) {
  return (
    <>
      <Image
        src={`/lessons/${name}.jpg`}
        alt={alt}
        width={1536}
        height={1024}
        sizes={sizes}
        priority={priority}
        className={p.plateLight}
      />
      <Image
        src={`/lessons/${name}-dark.jpg`}
        alt={alt}
        width={1536}
        height={1024}
        sizes={sizes}
        priority={priority}
        loading={priority ? undefined : "lazy"}
        className={p.plateDark}
      />
    </>
  )
}

export type LessonsNextProps = {
  /** True once GWTH is on sale (`isSelling()`). Only the buttons change. */
  selling?: boolean
  /** Describes the score as live. Defaults to the `ENABLE_GWTH_SCORE` flag. */
  showScore?: boolean
  /**
   * Describes project marking in the present tense. Defaults to the
   * `ENABLE_CAPSTONE_HAND_IN` flag, as on the home page.
   */
  markingLive?: boolean
  /**
   * Whether the page may point at the free labs. Defaults to
   * `canPromoteLabs()`, the same rule the previous page followed.
   */
  labsOpen?: boolean
}

export function LessonsNext({
  selling = false,
  showScore = ENABLE_GWTH_SCORE,
  markingLive = ENABLE_CAPSTONE_HAND_IN,
  labsOpen = canPromoteLabs(),
}: LessonsNextProps = {}) {
  // The one self-service step, the same rule as the header button: the prices
  // once sales are open, the waitlist before.
  const primary = selling
    ? { href: "/pricing", label: "Join the course" }
    : { href: "/waitlist", label: "Join the waitlist" }

  const months = MONTH_CONFIGS.map((config, index) => ({
    config,
    step: MONTH_STEPS[index]!,
    examples: EXAMPLE_PROJECTS[config.month] ?? [],
  }))

  return (
    <div className={p.shell}>
      {/* 1. Hero: what this page is, and the course in four figures. */}
      <section className={styles.hero} data-section="hero">
        <div className={p.page}>
          <div className={styles.heroGrid}>
            <div>
              <h1 className={styles.heroTitle}>
                <span>The whole course, </span>
                <span>
                  <em>month by month</em>.
                </span>
              </h1>
              <p className={`${p.standfirst} ${styles.heroStandfirst}`}>
                The course has {TOTAL_MANDATORY_LESSONS} core lessons in three
                monthly parts, with optional lessons for going deeper and a
                major project each month. You learn to use AI through practical
                projects for work and everyday life. This page shows what you make in
                each month and explains how your projects are marked.
              </p>
              <div className={p.actions}>
                <Link
                  href={primary.href}
                  className={p.buttonSolid}
                  data-testid="lessons-primary-cta"
                >
                  {primary.label}
                </Link>
                <Link href="/start-here" className={p.buttonOutline}>
                  Try the free lesson
                </Link>
              </div>
            </div>
            <figure className={`${p.plate} ${styles.heroPicture}`}>
              <Picture
                name="syllabus"
                priority
                alt="A paper cutout scene: a woman pins a card to a wall planner with three columns of lesson cards, each taller than the last. The labels read Month 1, Month 2 and Month 3."
                sizes="(max-width: 1023px) 100vw, 540px"
              />
            </figure>
          </div>
          <dl className={styles.facts} data-testid="course-facts">
            <div>
              <dt>3</dt>
              <dd>monthly parts, each building on the last</dd>
            </div>
            <div>
              <dt>{TOTAL_MANDATORY_LESSONS}</dt>
              <dd>core lessons, the same for everyone</dd>
            </div>
            <div data-testid="course-facts-optional">
              <dt>{TOTAL_OPTIONAL_LESSONS}</dt>
              <dd>optional lessons for going deeper into your own field</dd>
            </div>
            <div>
              <dt>About 5 hours</dt>
              <dd>of work a week around the day job, about an hour a lesson</dd>
            </div>
          </dl>
        </div>
      </section>

      {/* 2. The shape of the course, a month at a time: what each month is
          for and what you make in it. No lesson titles (see the top). */}
      <section className={p.section} data-section="months" id="months">
        <div className={p.page}>
          <div className={p.sectionHead}>
            <h2 className={p.sectionTitle}>
              Three months, <em>example projects</em>
            </h2>
          </div>
          <p className={styles.lead}>
            Choose a month to see what you&apos;ll learn and make.
          </p>
          <div className={styles.chooser} data-chooser="month">
            <fieldset className={styles.options}>
              <legend className={styles.srOnly}>Choose a month</legend>
              {months.map(({ config, step }, index) => (
                <label className={styles.option} key={config.month}>
                  <input
                    type="radio"
                    name="course-month"
                    value={`m${config.month}`}
                    defaultChecked={index === 0}
                    aria-controls={`month-${config.month}`}
                  />
                  <span className={styles.optionFace}>
                    <span className={styles.optionMonth}>
                      Month {config.month}
                    </span>{" "}
                    <span className={styles.optionName}>{step.title}</span>{" "}
                    <span className={styles.optionCount}>
                      {config.mandatoryLessons} core lessons
                    </span>
                  </span>
                </label>
              ))}
            </fieldset>

            {months.map(({ config, step, examples }) => (
              <article
                className={styles.panel}
                data-panel={`m${config.month}`}
                id={`month-${config.month}`}
                key={config.month}
                data-testid="month-panel"
              >
                <div className={styles.monthTop}>
                  <figure className={`${p.plate} ${styles.monthPicture}`}>
                    <Picture
                      name={`month-${config.month}`}
                      alt={MONTH_PICTURE_ALT[config.month] ?? ""}
                      sizes="(max-width: 1023px) 100vw, 480px"
                    />
                  </figure>
                  <div>
                    <h3 className={styles.panelTitle}>
                      Month {config.month}: {step.title}
                    </h3>
                    <p className={styles.panelLead}>{step.body}</p>
                    <h4 className={styles.makesTitle}>Some examples of what you&apos;ll make</h4>
                    <ul className={styles.makes} data-testid="example-projects">
                      {examples.map((item) => (
                        <li key={item.text} data-testid="example-project">
                          {item.text}
                          {item.optional && (
                            <>
                              {" "}
                              <span className={styles.tag}>Optional lesson</span>
                            </>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className={styles.project}>
                  <p className={styles.projectLine} data-testid="month-project">
                    <span className={styles.projectKicker}>
                      {config.capstoneOptional
                        ? "An optional project"
                        : "The month's main project"}
                    </span>{" "}
                    <span className={styles.projectName}>
                      {config.capstoneName}.
                    </span>{" "}
                    <span className={styles.projectBody}>
                      {config.capstoneDescription}
                    </span>
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* 3. How one lesson works, in the real order. */}
      <section className={p.section} data-section="lesson" id="lesson">
        <div className={p.page}>
          <div className={p.sectionHead}>
            <h2 className={p.sectionTitle}>
              How a lesson <em>works</em>
            </h2>
          </div>
          <p className={styles.lead}>
            Every lesson has the same four steps.
          </p>
          <figure className={`${p.plate} ${styles.lessonStrip}`}>
            <Picture
              name="lesson-desk-v2"
              alt="A paper cutout scene along a desk, left to right: a small screen showing a film, the printed lesson, a card of ticked questions, then a learner making the project."
              sizes="(max-width: 1180px) 100vw, 1140px"
            />
          </figure>
          <ol className={styles.lessonSteps} aria-label="How a lesson works">
            {LESSON_STEPS.map((step, index) => (
              <li key={step.title} data-testid="lesson-step">
                <span className={styles.stepNumber} aria-hidden="true">
                  {index + 1}
                </span>
                <h3>{step.title}</h3>
                <p>{step.body}</p>
              </li>
            ))}
          </ol>
          <div className={styles.duo}>
            <div className={styles.duoItem}>
              <h3 className={styles.panelTitle}>Progress you can see</h3>
              <p className={styles.bodyText}>
                You can track completed lessons, projects and your results on
                the questions.
              </p>
            </div>
            <div className={styles.duoItem}>
              <h3 className={styles.panelTitle}>Try one before you decide</h3>
              <p className={styles.bodyText}>
                Enter your email address and we&apos;ll send you the link to
                the free lesson.
              </p>
              <div className={p.actions}>
                <Link href="/start-here" className={p.buttonOutline}>
                  Try the free lesson
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. The monthly projects: how they are marked, the score, the portfolio. */}
      <section className={p.section} data-section="marking" id="marking">
        <div className={p.page}>
          <div className={styles.box}>
            <h2 className={p.sectionTitle}>
              {markingLive ? (
                <>
                  How your projects are <em>marked</em>
                </>
              ) : (
                <>
                  How your projects will be <em>marked</em>
                </>
              )}
            </h2>
            <p className={`${styles.lead} ${styles.boxLead}`} data-testid="marking-lead">
              {markingLive
                ? "You build and hand in a major project at the end of each month. All three projects are marked against GWTH's published marking guides."
                : "You'll build and hand in a major project at the end of each month. All three projects will be marked against GWTH's published marking guides."}
            </p>

            <div className={styles.markGrid}>
              <ol className={styles.markSteps} data-testid="marking-steps">
                <li>
                  <h3>Hand in your project</h3>
                  <p>
                    {markingLive
                      ? "You hand in your files and answer four short questions about your work."
                      : "You'll hand in your files and answer four short questions about your work."}
                  </p>
                  <ul className={styles.questions} data-testid="hand-in-questions">
                    {HAND_IN_QUESTIONS.map((item) => (
                      <li key={item.id}>{item.question}</li>
                    ))}
                  </ul>
                </li>
                <li>
                  <h3>See your mark</h3>
                  <p>
                    {markingLive
                      ? "You see a provisional mark at once. It becomes final once checked, within 7 days."
                      : "You'll see a provisional mark at once. It will become final once checked, within 7 days."}
                  </p>
                </li>
                <li>
                  <h3>Read your feedback</h3>
                  <p>
                    {markingLive
                      ? "Your feedback quotes your own work to show what you've done well and how to reach the next level in each part of the marking guide. You get one clear next step."
                      : "Your feedback will quote your own work to show what you've done well and how to reach the next level in each part of the marking guide. You'll get one clear next step."}
                  </p>
                </li>
              </ol>

              <div>
                <h3 className={styles.panelTitle}>
                  {markingLive ? "The four levels" : "The four levels planned"}
                </h3>
                <ol
                  className={styles.levels}
                  aria-label="The four levels of a project mark, lowest first"
                  data-testid="levels"
                >
                  {BANDS.map((band, index) => (
                    <li key={band} data-level={index + 1}>
                      <span>{BAND_LABELS[band]}</span>
                    </li>
                  ))}
                </ol>
                <p className={styles.levelsNote} data-testid="levels-note">
                  {markingLive
                    ? "Not yet tells you exactly what to fix before handing in again. You can hand in each project up to three times; your best mark counts."
                    : "Not yet will tell you exactly what to fix before handing in again. You'll be able to hand in each project up to three times; your best mark will count."}
                </p>
                <p className={styles.levelsNote} data-testid="example-data-note">
                  These projects use example data we provide. Afterwards, an
                  unmarked step lets you make them your own.
                </p>
                <div className={styles.portfolio} data-testid="portfolio-block">
                  <h3 className={styles.panelTitle}>Your portfolio</h3>
                  <p className={styles.bodyText}>
                    The projects you made in all three months, from FamilyBot
                    to your AI consultant. Link to it in an application
                    or talk it through at an interview. Get permission before
                    sharing anyone else&apos;s information.
                  </p>
                </div>
              </div>
            </div>

            <div className={styles.split} data-section="score">
              <div data-testid="score-block">
                <h3 className={styles.panelTitle}>Your GWTH score</h3>
                {showScore ? (
                  <>
                    <p className={styles.panelLead} data-testid="score-what">
                      A number out of 100. It combines the core lessons
                      you&apos;ve passed, your quiz results and your best marks
                      for the three monthly projects.
                    </p>
                    <div
                      className={styles.halves}
                      role="img"
                      aria-label="Your score in two halves: core lessons and quiz results, and your three monthly projects."
                    >
                      <span>
                        <strong>Half</strong> Core lessons and quiz results
                      </span>
                      <span>
                        <strong>Half</strong> Your three monthly projects
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    <p className={styles.panelLead} data-testid="score-beta-note">
                      The course does not show a GWTH score yet.
                    </p>
                    <p className={styles.bodyText} data-testid="score-what">
                      A number out of 100 is planned. It will combine the core
                      lessons you&apos;ve passed, your quiz results and your
                      best marks for the three monthly projects.
                    </p>
                  </>
                )}
              </div>
              <div className={styles.scoreRules}>
                {showScore && (
                  <>
                    <p className={styles.bodyText} data-testid="score-lead">
                      Core lessons and quiz results count for half of your
                      score. The marks for your monthly projects count for the
                      other half.
                    </p>
                    <p className={styles.bodyText} data-testid="score-honesty">
                      After 28 days without passing a core lesson, you start
                      losing 5% of your earned points for each full week.
                      Passing another core lesson removes that reduction, so
                      your score stays up to date.
                    </p>
                  </>
                )}
                <p className={styles.bodyText} data-testid="score-denominator">
                  Nothing else counts: not time spent, not lessons opened, and
                  nothing you say about yourself. Compare scores only for
                  people taking the same set of lessons. An institution
                  chooses which optional lessons members must pass and sets
                  the quiz pass mark.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. The optional lessons, the UK rules and the route for an organisation. */}
      <section className={p.section} data-section="optional" id="optional">
        <div className={p.page}>
          <div className={p.sectionHead}>
            <h2 className={p.sectionTitle}>
              Core lessons first, then <em>your own direction</em>
            </h2>
          </div>
          <p className={styles.lead} data-testid="optional-lead">
            On the standard course, all optional lessons are your choice. Choose
            lessons for your profession, for building more advanced AI tools, or
            for leading AI work in an organisation.
          </p>
          <div className={`${p.cards3} ${styles.paths}`}>
            {PATHS.map((path) => (
              <article className={p.card} key={path.title} data-testid="path-card">
                <h3 className={p.cardTitle}>{path.title}</h3>
                <p className={p.cardBody}>{path.body}</p>
              </article>
            ))}
          </div>
          <p className={styles.note} data-testid="optional-note">
            Each month includes its core and optional lessons when that month
            opens. You can skip any or all of the optional lessons. For work
            tasks, use the AI tool your organisation has approved.
          </p>

          <div className={styles.duo}>
            <div className={styles.duoItem}>
              <h3 className={styles.panelTitle}>
                UK professional rules covered in optional lessons
              </h3>
              <p className={styles.bodyText} data-testid="lessons-uk-note">
                 The legal practice lesson covers the Solicitors Regulation
                Authority code and the Ayinde judgment on citing cases invented
                by AI. The accountancy
                lesson follows the codes of the UK accountancy bodies ICAEW,
                ACCA and CIMA. It also follows ISA (UK) 700, the rule for signing
                off an audit. Lessons that handle personal information follow
                UK data protection law.
              </p>
            </div>
            <div className={styles.duoItem} data-testid="optional-buyers">
              <h3 className={styles.panelTitle}>Buying for an organisation?</h3>
              <p className={styles.bodyText}>
                Everyone on the standard course completes the same{" "}
                {TOTAL_MANDATORY_LESSONS} core lessons. A professional body, or
                a company or team of 100 or more learners, can commission an
                edition of its own. Every edition keeps the same core lessons.
                The institution chooses which optional lessons are open to its
                members and which they must complete, and it can have lessons
                written on subjects the standard course does not cover yet.
              </p>
              <div className={p.actions}>
                <Link href="/for-organisations" className={p.buttonOutline}>
                  See the page for organisations
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. How the course stays up to date. */}
      <section className={p.section} data-section="current" id="current">
        <div className={p.page}>
          <div className={p.sectionHead}>
            <h2 className={p.sectionTitle}>
              How the course <em>stays up to date</em>
            </h2>
          </div>
          <div className={styles.currentGrid}>
            <figure className={`${p.plate} ${styles.currentPicture}`}>
              <Picture
                name="updated"
                alt="A paper cutout picture in two parts. On the left a woman studies a tangled diagram, labelled Tools change. On the right she redraws it as three clear steps beside a colleague, labelled Lessons rewritten."
                sizes="(max-width: 1023px) 100vw, 520px"
              />
            </figure>
            <ul className={styles.currentList}>
              <li data-testid="current-skills">
                <h3>Skills that are not tied to one AI company</h3>
                <p>
                  The lessons teach skills that work across AI tools, not
                  tricks for one product. You learn to choose the right mix of
                  AI services for your work and your budget, so you can avoid
                  paying for tools you don&apos;t need.
                </p>
              </li>
              <li data-testid="current-rewrite">
                <h3>Lessons are rewritten when the tools change</h3>
                <p>
                  When the tools change, or the best way to use them changes,
                  we rewrite the lessons.
                </p>
              </li>
              <li data-testid="current-after">
                <h3>After your three months</h3>
                <p>
                  After three months, your monthly plan continues at £
                  {ONGOING_MONTHLY_PRICE.toFixed(2)} a month for access to the
                  updated lessons unless you cancel. If you paid once for a
                  pass, your access to the course lessons stops. You only pay
                  again if you choose to subscribe.
                </p>
              </li>
              {labsOpen && (
                <li data-testid="current-labs">
                  <h3>New AI models, tested in the free labs</h3>
                  <p>
                    The free labs test new AI models on the same real work
                    tasks, and test again when new models come out.{" "}
                    <Link href="/labs">See the free labs</Link>.
                  </p>
                </li>
              )}
            </ul>
          </div>
        </div>
      </section>

      {/* 7. The one next step. */}
      <section className={p.closing} data-section="closing">
        <div className={p.page}>
          <div className={`${styles.box} ${styles.closingBox}`}>
            <h2 className={p.sectionTitle}>
              Start <em>building with AI</em>
            </h2>
            <p className={`${styles.lead} ${styles.boxLead}`}>
              Lesson by lesson, you build useful tools for your work and
              everyday life.
            </p>
            <div className={p.actions}>
              <Link
                href={primary.href}
                className={p.buttonSolid}
                data-testid="lessons-closing-cta"
              >
                {primary.label}
              </Link>
              <Link href="/start-here" className={p.buttonOutline}>
                Try the free lesson
              </Link>
              {selling ? null : (
                <Link href="/pricing" className={p.buttonOutline}>
                  See pricing
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
