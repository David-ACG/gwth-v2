import type { ReactNode } from "react"
import Link from "next/link"
import {
  COURSE_MONTHLY_PRICE,
  ENABLE_CAPSTONE_HAND_IN,
  ENABLE_GWTH_SCORE,
  ONGOING_MONTHLY_PRICE,
  TOTAL_MANDATORY_LESSONS,
} from "@/lib/config"
import { UK_STAT_IDS } from "@/components/marketing/data"
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
import { SCORE_STATES } from "@/components/marketing/home-fde/home-fde"
import { ScoreCard } from "@/components/marketing/home-fde/score-card"
import p from "@/components/marketing/paper/paper.module.css"
import { AudienceSync } from "./audience-sync"
import {
  AT_A_GLANCE,
  audienceHref,
  BASELINE,
  DASHBOARD_EXAMPLE,
  DEPTH,
  EDITION_GROUPS,
  EVIDENCE,
  INSTITUTION_FAQS,
  LAW,
  LESSON_STEPS,
  MARK_LEVELS,
  MONTHS,
  PATTERN,
  ROLE_PATHS,
  STEPS,
  TEAM_PRICE_FEATURES,
  WHY_TEAMS,
  type Audience,
} from "./data"
import { OrgPlate } from "./org-plate"
import styles from "./for-organisations-next.module.css"

/**
 * /for-organisations: one page for the two kinds of organisation that buy
 * GWTH for other people (David, 19 Nov 2026: "I think we can consolidate the
 * For teams and For institutions into one page"). It replaces `/for-teams`
 * and `/for-institutions`, whose components are kept beside this one.
 *
 * ## The idea
 *
 * The two readers want different things, so the page asks who is reading
 * before it says anything else, in the spirit of the home page's "What would
 * you like to do with AI?":
 *
 * - **An institution** (a professional body, college, training provider or a
 *   large employer that runs its own courses) wants its OWN EDITION: its
 *   lessons, its pass mark, a dashboard for its tutors, taken before its
 *   specialist courses. CIPD reads this path, so it is the first choice and
 *   the one open by default.
 * - **A team** wants PLACES on the standard course, at the public price.
 *
 * Everything written for one reader is hidden from the other. What both need
 * to see (what the course is, how work is marked, how progress is shown, that
 * GWTH is independent) is said once, in the middle of the page, and one table
 * near the end sets the two offers side by side for whoever is deciding
 * between them.
 *
 * ## How the choice works
 *
 * Two radio buttons and CSS `:has()`, as on the home page: no script is
 * needed to choose, and a browser without `:has()` shows both paths. Every
 * section written for one reader carries `data-for`. The route reads
 * `?for=team` or `?for=institution` and passes it as `audience`, so a link
 * can open the page on either choice; `AudienceSync` keeps the address in
 * step with the choice so a forwarded link opens the same way.
 *
 * ## What may be said (read before changing any words)
 *
 * - The score and project marking are described as on the home page, in the
 *   present tense when `showScore` / `markingLive` are set (David, 19 Nov:
 *   the public pages show the course as it will be on 14 December).
 * - The PUBLIC score page (a page anyone can check, shared on LinkedIn) is a
 *   separate claim. The old institutions page made it only behind
 *   `ENABLE_GWTH_SCORE`, and so does this one, through `publicScore`.
 * - No price, pricing basis, unit or range for an edition (David,
 *   a-20260915-085041-eaa513). CIPD is named only where a published fact is
 *   cited, never as a customer or endorser. No guarantee is offered.
 * - "Walkthrough" is the forty minutes offered to an institution. The team
 *   side says "Get in touch". Both go to /contact.
 * - A team on the standard course has no admin screen and no dashboard; those
 *   belong to an edition. The team side never promises them.
 * - No optional-lesson count is printed (a-20260914-201426-ae7f0e).
 *
 * The words themselves are in `./data.ts`, with their sources.
 */

/** The published documents behind the three UK figures, deduplicated. */
const STAT_SOURCES = Array.from(
  new Map(
    UK_STAT_IDS.map((id) => [ukFigureSource(id).id, ukFigureSource(id)])
  ).values()
)

/** The whole-course prices and the sale window, from the billing module. */
function coursePrices() {
  const window = getSaleWindow()
  return {
    sale: formatPence(PASS_PRICES_PENCE.courseSale),
    full: formatPence(PASS_PRICES_PENCE.courseFull),
    month1: formatPence(PASS_PRICES_PENCE.month1),
    opensOn: formatUkDate(window.announcedOpenAt),
    // The window ends at midnight; the last day it covers is the day before.
    endsOn: formatUkDate(new Date(window.saleEndsAt.getTime() - 1)),
  }
}

type Prices = ReturnType<typeof coursePrices>

/**
 * The team questions, from the old team page. Two answers pointed at "the
 * institutions page"; they now point at the other choice on this page. The
 * question about training published by an AI company is answered once, in
 * the shared independence section, with the same sentences.
 */
function teamFaqs(price: Prices): { q: string; a: ReactNode }[] {
  return [
    {
      q: "Can we choose which lessons our team completes?",
      a: (
        <>
          Everyone takes the same {TOTAL_MANDATORY_LESSONS} core lessons. Each
          month also opens optional lessons on particular industries, advanced
          topics and specialisations, and each person chooses which of those
          to take, so you can tell people which ones matter for their role. If
          you need to set the lessons for a whole group yourself, that is an
          edition of the course. See{" "}
          <Link href={audienceHref("institution")} data-audience="institution">
            the choice for institutions
          </Link>{" "}
          on this page.
        </>
      ),
    },
    {
      q: "Will this displace our employees?",
      a: "That is not something a course decides. GWTH teaches the people you already have to use AI in the work they already do, so the skill sits with your team rather than only with the tools. Decisions about roles and staffing stay with your organisation.",
    },
    {
      q: "What does the course teach about company data?",
      a: "It teaches your team to use AI responsibly with company information, including when to use a model that runs on your own computers rather than a service on the internet. Month 3 covers the rules and checks an organisation needs before it relies on AI. People learn the security risks before they start building.",
    },
    {
      q: "What does it cost, and what will people have made?",
      a: `${price.sale} a person for the whole course if you buy between ${price.opensOn} and ${price.endsOn}, then ${price.full}. Or £${COURSE_MONTHLY_PRICE} a month for each of the three months, and each person can cancel at any time. Staying current afterwards is optional, at £${ONGOING_MONTHLY_PRICE.toFixed(2)} a month. In Month 1 each person designs an automation for a routine job they do now. By Month 3 they have built an internal tool and worked through how an organisation-wide AI change is planned and costed.`,
    },
    {
      q: "Our team is not technical. Is this appropriate?",
      a: "Yes, it's designed for people across your workforce, from apprentices to senior leaders. People need a computer, an internet connection and the ability to type. That is the complete list of technical requirements. Month 1 uses plain English and practical examples. Later lessons introduce writing code with help from AI and building more complex tools. They follow the same order as the first ones: you watch a short film, read the lesson, answer the questions, then do the project. The subject gets deeper, the hand-holding does not stop.",
    },
    {
      q: "How does this compare to the government's AI Skills Boost?",
      a: "AI Skills Boost offers free training in practical AI skills for work. GWTH is a three-month course with lessons and projects on using AI, building tools with it and leading AI work in an organisation. A team can take both.",
    },
    {
      q: "Can employees complete this during working hours?",
      a: "Yes. It takes about five hours a week for three months. Each lesson is built around a project that people can relate to the work they already do, so time spent on it during working hours is practice on familiar tasks.",
    },
    {
      q: "Can we start with a small group first?",
      a: "Yes. There is no minimum number of places. You can buy places for two or three people, see how they get on, and buy more later.",
    },
    {
      q: "Can you write lessons for our company?",
      a: (
        <>
          Yes, for a company or team of 100 or more learners, as part of an
          edition of the course. The lessons are written for your work and
          approved by your own experts before anyone sees them. See{" "}
          <Link href={audienceHref("institution")} data-audience="institution">
            the choice for institutions
          </Link>{" "}
          on this page.
        </>
      ),
    },
  ]
}

/**
 * How projects are marked, in the home page's sentences, turned from "you"
 * to "they" for a reader who is buying for other people. Future tense until
 * hand-ins open (`markingLive`), as on the home page.
 */
function markingCopy(live: boolean) {
  return live
    ? {
        title: "Monthly projects are marked, with feedback on the work",
        paragraphs: [
          "Each learner builds and hands in a major project at the end of each month.",
          "All three projects are marked against GWTH's published marking guides.",
          "The feedback quotes the learner's own work to show what they've done well and how to reach the next level in each part of the marking guide. They get one clear next step.",
          "They see a provisional mark at once. It becomes final once checked, within 7 days. Not yet tells them exactly what to fix before handing in again. They can hand in each project up to three times, and their best mark counts.",
        ],
        levels: "There are four levels:",
      }
    : {
        title: "Monthly projects will be marked, with feedback on the work",
        paragraphs: [
          "Each learner will build and hand in a major project at the end of each month.",
          "All three projects will be marked against GWTH's published marking guides.",
          "The feedback will quote the learner's own work to show what they've done well and how to reach the next level in each part of the marking guide. They'll get one clear next step.",
          "They'll see a provisional mark at once. It will become final once checked, within 7 days. Not yet will tell them exactly what to fix before handing in again. They'll be able to hand in each project up to three times, and their best mark will count.",
        ],
        levels: "There will be four levels:",
      }
}

/** A drawn tick or dot, so a state never rests on colour alone. */
function StateMark({ met }: { met: boolean }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {met ? <path d="M2.5 7.5l3 3 6-7" /> : <circle cx="7" cy="7" r="4.2" />}
    </svg>
  )
}

export type ForOrganisationsNextProps = {
  /** True once GWTH is on sale (`isSelling()`). Only buttons and links change. */
  selling?: boolean
  /** Describes the score as live. Defaults to the `ENABLE_GWTH_SCORE` flag. */
  showScore?: boolean
  /**
   * Describes project marking in the present tense. Defaults to the
   * `ENABLE_CAPSTONE_HAND_IN` flag.
   */
  markingLive?: boolean
  /**
   * Describes the public score page (a page anyone can check and share).
   * Defaults to `ENABLE_GWTH_SCORE`, the flag the old institutions page held
   * this claim behind. Keep it on that flag.
   */
  publicScore?: boolean
  /** The choice that is open when the page loads (`?for=`). */
  audience?: Audience
}

export function ForOrganisationsNext({
  selling = false,
  showScore = ENABLE_GWTH_SCORE,
  markingLive = ENABLE_CAPSTONE_HAND_IN,
  publicScore = ENABLE_GWTH_SCORE,
  audience = "institution",
}: ForOrganisationsNextProps = {}) {
  const price = coursePrices()
  const marking = markingCopy(markingLive)
  const example = DASHBOARD_EXAMPLE

  const teamPrimary = selling ? (
    <Link href="/gift" className={p.buttonSolid}>
      Buy places for your team
    </Link>
  ) : (
    <Link href="/waitlist" className={p.buttonSolid}>
      Join the waitlist
    </Link>
  )

  return (
    <div className={p.shell}>
      <AudienceSync />
      <div className={styles.scope} data-chooser="audience">
        {/* 1. Hero: one sentence for both readers. */}
        <section className={styles.hero} data-section="hero">
          <div className={p.page}>
            <div className={styles.heroGrid}>
              <h1 className={styles.heroTitle}>
                <span>A practical AI course </span>
                <span>
                  for <em>your members</em>{" "}
                </span>
                <span>
                  or <em>your team</em>.
                </span>
              </h1>
              <div className={styles.heroCopy}>
                <p className={p.standfirst}>
                  GWTH is a practical AI course for work and everyday life in
                  the UK. It has three monthly parts at about five hours a
                  week, with a project in every lesson. A professional body,
                  college or training provider can run its own edition before
                  its specialist courses. An employer can buy places for a
                  team.
                </p>
                <p className={styles.heroNote}>
                  Independent, with no sponsors or partnerships with AI
                  companies.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 2. The choice. Everything below follows it. */}
        <section className={styles.choose} data-section="choose" id="choose">
          <div className={p.page}>
            <h2 className={styles.chooseTitle}>Which describes you?</h2>
            <fieldset className={styles.options} key={audience}>
              <legend className={styles.srOnly}>
                Choose who you are buying for
              </legend>
              <label className={styles.option}>
                <input
                  type="radio"
                  name="audience"
                  value="institution"
                  defaultChecked={audience === "institution"}
                />
                <span className={styles.optionFace}>
                  <span className={`${p.plate} ${styles.optionPicture}`}>
                    <OrgPlate
                      name="class"
                      priority
                      alt="A paper cutout scene: a tutor stands at the front of a seminar room and welcomes five learners, who sit at two rows of desks with the same folder in front of each of them."
                      sizes="(max-width: 639px) 120px, (max-width: 1180px) 50vw, 560px"
                    />
                  </span>
                  <span className={styles.optionText}>
                    <span className={styles.optionName}>
                      <span className={styles.optionDot} aria-hidden="true" />
                      I represent an institution or professional body
                    </span>
                    <span className={styles.optionGloss}>
                      Your own edition before your specialist courses. You
                      choose the lessons, set the pass mark and see who has
                      met it.
                    </span>
                  </span>
                </span>
              </label>
              <label className={styles.option}>
                <input
                  type="radio"
                  name="audience"
                  value="team"
                  defaultChecked={audience === "team"}
                />
                <span className={styles.optionFace}>
                  <span className={`${p.plate} ${styles.optionPicture}`}>
                    <OrgPlate
                      name="team"
                      priority
                      alt="A paper cutout scene: four colleagues of different ages sit at one table with two laptops. One holds up a small bar chart she has made and the others look pleased with it."
                      sizes="(max-width: 639px) 120px, (max-width: 1180px) 50vw, 560px"
                    />
                  </span>
                  <span className={styles.optionText}>
                    <span className={styles.optionName}>
                      <span className={styles.optionDot} aria-hidden="true" />
                      I run a team
                    </span>
                    <span className={styles.optionGloss}>
                      Places on the standard course for the people you choose,
                      at the same price per person whatever the size of the
                      team.
                    </span>
                  </span>
                </span>
              </label>
            </fieldset>
          </div>
        </section>

        {/* ── 3. The proposition, one per reader ─────────────────────────── */}

        <section
          className={styles.intro}
          data-section="institution-intro"
          data-for="institution"
          id="for-institutions"
        >
          <div className={p.page}>
            <div className={styles.introPanel}>
              <div>
                {/* David, 2026-10-23, option A: the old page's headline. */}
                <h2 className={styles.introTitle}>
                  Start your specialist courses{" "}
                  <em>with the whole class on the same footing</em>.
                </h2>
                <p className={styles.introLead}>
                  Learners often arrive at a professional course with very
                  different levels of experience using AI, and tutors can
                  spend the first sessions bringing the whole class up to the
                  same level. GWTH is a three-month applied AI course your
                  learners take before your course begins. You choose which
                  optional lessons are required and set the pass mark for
                  their quizzes, and your tutors can see who has met it.
                </p>
                <p className={styles.introLead}>
                  It is for professional bodies, colleges, training providers
                  and large employers that run their own courses.
                </p>
                <div className={p.actions}>
                  <Link href="/contact" className={p.buttonSolid}>
                    Book a walkthrough
                  </Link>
                  <Link href="/lessons" className={p.buttonOutline}>
                    See the course
                  </Link>
                </div>
              </div>
              <ol
                className={styles.beforeAfter}
                aria-label="Before and after a shared starting point"
              >
                {BASELINE.map((item) => (
                  <li key={item.title} data-testid="baseline-card">
                    <p className={styles.kicker}>{item.kicker}</p>
                    <h3>{item.title}</h3>
                    <p>{item.body}</p>
                  </li>
                ))}
              </ol>
            </div>
            <p className={styles.afterPanel} data-testid="institution-record-note">
              GWTH does not teach your profession. It teaches people how to
              use AI in their work, so your own course can focus on the
              specialist subject. Your tutors see which lessons each member
              completed and their quiz marks against the pass mark you chose.
              It is a record of what each member has done, not a promise about
              how ready they are.
            </p>
          </div>
        </section>

        <section
          className={styles.intro}
          data-section="team-intro"
          data-for="team"
          id="for-teams"
        >
          <div className={p.page}>
            <div className={styles.introPanel}>
              <div>
                <h2 className={styles.introTitle}>
                  AI training for <em>your team</em>
                </h2>
                <p className={styles.introLead}>
                  Buying AI tools is only the start. They are useful at work
                  when the people using them know how. Your team takes the
                  same course as everyone else, and you can buy places from{" "}
                  {price.opensOn}.
                </p>
                <p className={styles.introLead} data-testid="team-stuck-note">
                  Many organisations get stuck in one of two places: a few
                  enthusiasts experimenting with no path from experiment to
                  organisational capability, or enterprise AI tools bought and
                  barely used because nobody was ever taught how to think with
                  AI, only how to click the buttons in one product. GWTH gives
                  each person three months of guided practice using AI on the
                  work they already do.
                </p>
                <div className={p.actions}>
                  {teamPrimary}
                  <Link href="/contact" className={p.buttonOutline}>
                    Get in touch
                  </Link>
                </div>
                <p className={styles.introAside} data-testid="team-split">
                  A professional body, or an organisation that wants its own
                  edition of the course, should read{" "}
                  <Link href={audienceHref("institution")} data-audience="institution">
                    the choice for institutions
                  </Link>{" "}
                  instead.
                </p>
              </div>
              <div>
                <h3 className={styles.statsTitle}>
                  AI skills at work in the UK
                </h3>
                <ul className={styles.stats}>
                  {UK_STAT_IDS.map((id) => (
                    <li key={id} data-testid="team-stat">
                      <strong data-uk-figure={id}>{ukFigure(id).value}</strong>
                      <p>{ukFigure(id).label}</p>
                      <p className={styles.source}>
                        Source: {ukFigureCitation(id)}
                      </p>
                    </li>
                  ))}
                </ul>
                <p className={styles.sourceLinks} data-testid="team-stat-sources">
                  Read them:{" "}
                  {STAT_SOURCES.map((source, i) => (
                    <span key={source.id}>
                      {i > 0
                        ? i === STAT_SOURCES.length - 1
                          ? " and "
                          : ", "
                        : ""}
                      <a
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {source.title}
                      </a>{" "}
                      ({source.releasedLabel})
                    </span>
                  ))}
                  .
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── 4. How it works for this reader ────────────────────────────── */}

        <section
          className={p.section}
          data-section="edition"
          data-for="institution"
        >
          <div className={p.page}>
            <div className={p.sectionHead}>
              <h2 className={p.sectionTitle}>
                Your <em>own edition</em> of the course
              </h2>
            </div>
            <figure className={`${p.plate} ${styles.widePlate}`}>
              <OrgPlate
                name="institution"
                alt="A paper cutout picture in three panels. A woman sorts lesson cards into a tray, labelled Choose the lessons. A man moves a marker along a slider, labelled Set your pass mark. A tutor holds a list of five members with a tick beside three of them, labelled See who passes."
                sizes="(max-width: 1180px) 100vw, 1140px"
              />
            </figure>
            <div className={styles.editionGroups}>
              {EDITION_GROUPS.map((group) => (
                <div key={group.label} data-testid="edition-group">
                  <h3 className={styles.groupLabel}>{group.label}</h3>
                  {group.features
                    .filter((item) => publicScore || !item.needsPublicScore)
                    .map((item) => (
                      <div
                        className={styles.groupFeature}
                        key={item.title}
                        data-testid="edition-feature"
                      >
                        <h4>{item.title}</h4>
                        <p>{item.body}</p>
                      </div>
                    ))}
                </div>
              ))}
            </div>

            {/* What a tutor sees, as /org/learners shows it. */}
            <div className={styles.tutor} data-testid="tutor-view">
              <div>
                <h3 className={styles.subTitle}>What your tutors see</h3>
                <p className={styles.bodyText} data-testid="institution-tutor-lead">
                  Your tutors sign in to a learners dashboard for your
                  edition. A member meets your baseline by completing every
                  required lesson with a quiz mark at or above your pass mark.
                </p>
                <p className={styles.bodyText}>
                  Tutors see whether each member has met the baseline, not
                  their individual wrong answers. When we update a lesson, a
                  member who passed the earlier version still counts as having
                  passed it.
                </p>
              </div>
              <figure className={styles.dashboard}>
                <table>
                  <caption>
                    <span className={styles.exampleTag}>Example</span>
                    The learners dashboard
                  </caption>
                  <thead>
                    <tr>
                      <th scope="col">Member</th>
                      <th scope="col">Baseline</th>
                      <th scope="col">Required lessons</th>
                      <th scope="col">Average quiz</th>
                      <th scope="col">Last active</th>
                    </tr>
                  </thead>
                  <tbody>
                    {example.rows.map((row) => (
                      <tr key={row.name}>
                        <th scope="row">{row.name}</th>
                        <td data-label="Baseline">
                          <span
                            className={
                              row.met ? styles.stateMet : styles.statePending
                            }
                          >
                            <StateMark met={row.met} />
                            {row.met ? "Baseline met" : "In progress"}
                          </span>
                        </td>
                        <td data-label="Required lessons">
                          <span className={styles.bar} aria-hidden="true">
                            <span
                              style={{
                                width: `${Math.round((row.done / example.required) * 100)}%`,
                              }}
                            />
                          </span>
                          {row.done} of {example.required}
                        </td>
                        <td data-label="Average quiz">{row.quiz}%</td>
                        <td data-label="Last active">{row.active}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <figcaption>
                  The members here are made up. In this example the edition
                  requires the {TOTAL_MANDATORY_LESSONS} core lessons and{" "}
                  {example.requiredOptional} optional ones, and the pass mark
                  is {example.passMark}%.
                </figcaption>
              </figure>
            </div>
          </div>
        </section>

        <section className={p.section} data-section="team-why" data-for="team">
          <div className={p.page}>
            <div className={p.sectionHead}>
              <h2 className={p.sectionTitle}>
                Why GWTH <em>for teams</em>
              </h2>
            </div>
            <ol className={styles.whyList}>
              {WHY_TEAMS.map((item, index) => (
                <li key={item.title} data-testid="team-why-item">
                  <span className={styles.whyNumber} aria-hidden="true">
                    {index + 1}
                  </span>
                  <div>
                    <h3>{item.title}</h3>
                    <p>{item.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ── 5. The course, said once for both readers ──────────────────── */}

        <section className={p.band} data-section="course" id="course">
          <div className={p.page}>
            <div className={p.sectionHead}>
              <h2 className={p.sectionTitle}>What the course covers</h2>
            </div>
            <p className={p.lead}>
              Month 1 starts with AI for a person&apos;s own life and work.
              Months 2 and 3 move on to building apps for a business and
              leading AI work across an organisation. Everyone takes the same{" "}
              {TOTAL_MANDATORY_LESSONS} core lessons, and each month also has
              optional lessons for particular kinds of work.
            </p>
            <ul className={styles.glance} aria-label="The course at a glance">
              {AT_A_GLANCE.map((item) => (
                <li key={item.label}>
                  <strong>{item.label}</strong>
                  <span>{item.detail}</span>
                </li>
              ))}
            </ul>
            <ol className={styles.months}>
              {MONTHS.map((month) => (
                <li key={month.month} data-testid="month-card">
                  <div>
                    <p className={styles.monthKicker}>Month {month.month}</p>
                    <h3>{month.title}</h3>
                    <p className={styles.monthMeta}>{month.lessons}</p>
                    <p className={styles.monthMeta}>{month.opens}</p>
                  </div>
                  <p className={styles.monthBody}>{month.description}</p>
                </li>
              ))}
            </ol>

            <h3 className={styles.subTitle}>How a lesson works</h3>
            <ol className={styles.lessonSteps} aria-label="How a lesson works">
              {LESSON_STEPS.map(([title, body], index) => (
                <li key={title}>
                  <span className={styles.stepNumber} aria-hidden="true">
                    {index + 1}
                  </span>
                  <h4>{title}</h4>
                  <p>{body}</p>
                </li>
              ))}
            </ol>
            <div className={p.actions}>
              <Link href="/lessons" className={p.buttonOutline}>
                See every lesson
              </Link>
              {/* The free lesson is the one lesson visitors may open (the
                  home page offers it the same way); restored after the words
                  check removed it. */}
              <Link href="/start-here" className={p.buttonOutline}>
                Try the free lesson
              </Link>
            </div>
          </div>
        </section>

        {/* ── 6. How work is marked and how progress is shown ────────────── */}

        <section className={p.section} data-section="proof" id="proof">
          <div className={p.page}>
            <div className={p.sectionHead}>
              <h2 className={p.sectionTitle}>
                How work is <em>marked</em>, and how progress is shown
              </h2>
            </div>
            <div className={styles.proofTop}>
              <figure className={`${p.plate} ${styles.proofPicture}`}>
                <OrgPlate
                  name="marking"
                  alt="A paper cutout scene: four green steps rise from left to right, labelled Not yet, Pass, Good and Excellent. A learner holding a feedback sheet places a picture of her project on the step labelled Good."
                  sizes="(max-width: 1023px) 100vw, 540px"
                />
              </figure>
              <div data-testid="proof-marking">
                <h3 className={styles.subTitleFlush}>{marking.title}</h3>
                <p className={styles.bodyText}>{marking.paragraphs[0]}</p>
                <p className={styles.levelsLead}>{marking.levels}</p>
                <ol className={styles.levels}>
                  {MARK_LEVELS.map((level) => (
                    <li key={level}>{level}</li>
                  ))}
                </ol>
                <p className={styles.bodyText}>{marking.paragraphs[1]}</p>
              </div>
            </div>
            <div className={styles.proofGrid}>
              <div data-testid="proof-feedback">
                <h3 className={styles.proofHead}>Feedback, then another go</h3>
                <p>{marking.paragraphs[2]}</p>
                <p>{marking.paragraphs[3]}</p>
              </div>
              <div data-testid="proof-quizzes">
                <h3 className={styles.proofHead}>A quiz in every lesson</h3>
                <p>
                  Each lesson has questions in a quiz with a pass mark.
                  Quizzes are marked automatically, and learners cannot see
                  the answers before they submit.
                </p>
              </div>
              <div data-testid="proof-progress">
                <h3 className={styles.proofHead}>
                  A progress page for each person
                </h3>
                <p>
                  Each person has their own account and their own progress
                  page. It lists the lessons they have completed and their
                  best mark on each quiz.
                </p>
                <p>
                  They finish with a portfolio too: the projects they made in
                  all three months, from FamilyBot to their AI
                  consultant.
                </p>
              </div>
            </div>

            {showScore && (
              <div className={styles.scoreBlock} data-section="score">
                <h3 className={styles.subTitleFlush}>
                  One number that stays up to date: the GWTH score
                </h3>
                <div className={styles.scoreCopy}>
                  <p data-testid="score-lead">
                    Each learner has a GWTH score, a number out of 100. It
                    combines the core lessons they&apos;ve passed, their quiz
                    results and their best marks for the three monthly
                    projects. Core lessons and quiz results count for half of
                    the score. The marks for the monthly projects count for
                    the other half.
                  </p>
                  <p data-testid="score-honesty">
                    After 28 days without passing a core lesson, a learner
                    starts losing 5% of their earned points for each full
                    week. Passing another core lesson removes that reduction,
                    so the score stays up to date.
                  </p>
                </div>
                <div className={p.cards3} data-testid="score-cards">
                  {SCORE_STATES.map((state) => (
                    <ScoreCard
                      key={state.id}
                      state={state}
                      cardClassName={p.card}
                    />
                  ))}
                </div>
                <p className={styles.smallNote}>
                  These cards show examples of what a learner sees, rather
                  than real learners. We don&apos;t yet store a history of a
                  learner&apos;s score. Compare scores only for people taking
                  the same set of lessons.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* ── 7. Independent, and written in the UK ──────────────────────── */}

        <section className={p.section} data-section="independence">
          <div className={p.page}>
            <div className={p.sectionHead}>
              <h2 className={p.sectionTitle}>
                Independent, and <em>written in the UK</em>
              </h2>
            </div>
            <div className={`${p.featureGrid} ${styles.featureGrid3}`}>
              <div className={p.feature}>
                <h3>No sponsors and no tools to sell</h3>
                <p>
                  GWTH is independent: no sponsors, no partnerships with AI
                  companies, and lessons compare tools rather than sell one.
                  We are not owned by an AI company.
                </p>
              </div>
              <div className={p.feature} data-testid="independence-models">
                <h3>Leading AI models, plus cheaper alternatives</h3>
                <p>
                  Learners work with AI models from the leading AI companies
                  and with lower-cost alternatives, including ones you can run
                  on your own computers, and learn to choose between them on
                  cost, privacy and fit. Provider-authored training naturally
                  centres that provider&apos;s own models and tools. A course
                  built around one platform can also go out of date when that
                  platform changes its pricing, its capabilities or its terms.
                </p>
              </div>
              <div className={p.feature} data-testid="uk-note">
                <h3>For people working to UK rules</h3>
                <p>
                  The course is written in the United Kingdom, for people
                  working to UK rules. Where a lesson covers regulated work,
                  it names the UK regulator for that work, and where it covers
                  personal data, it follows UK data protection law.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── 8. The detail for each reader ──────────────────────────────── */}

        <section
          className={p.section}
          data-section="depth"
          data-for="institution"
        >
          <div className={p.page}>
            <div className={p.sectionHead}>
              <h2 className={p.sectionTitle}>
                Lessons that fit <em>your members&apos; work</em>
              </h2>
            </div>
            <p className={p.lead}>
              Everyone on the standard course completes the same{" "}
              {TOTAL_MANDATORY_LESSONS} core lessons, and so does everyone in
              your edition. On top of those, you choose the optional lessons
              your members see and can have lessons written for your edition
              alone.
            </p>
            <div className={`${p.cards2} ${styles.gapTop}`}>
              {DEPTH.map((item) => (
                <article className={p.card} key={item.title} data-testid="depth-card">
                  <h3 className={p.cardTitle}>{item.title}</h3>
                  <p className={p.cardBody}>{item.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section
          className={p.section}
          data-section="steps"
          data-for="institution"
        >
          <div className={p.page}>
            <div className={p.sectionHead}>
              <h2 className={p.sectionTitle}>How it starts</h2>
            </div>
            <ol className={styles.lessonSteps} aria-label="How an edition starts">
              {STEPS.map((step, index) => (
                <li key={step.title} data-testid="start-step">
                  <span className={styles.stepNumber} aria-hidden="true">
                    {index + 1}
                  </span>
                  <h3>{step.title}</h3>
                  <p>{step.body}</p>
                </li>
              ))}
            </ol>
            <p className={styles.note}>
              You do not set up an edition on your own. We set it up with you,
              and from {price.opensOn} a pilot group can use the standard
              course while we do.
            </p>
          </div>
        </section>

        <section
          className={p.section}
          data-section="evidence"
          data-for="institution"
        >
          <div className={p.page}>
            <div className={p.sectionHead}>
              <h2 className={p.sectionTitle}>
                How well people use AI at work varies widely
              </h2>
            </div>
            <div className={p.cards4}>
              {EVIDENCE.map((item) => (
                <article className={p.card} key={item.value} data-testid="evidence-card">
                  <h3 className={p.cardValue}>{item.value}</h3>
                  <p className={p.cardBody}>{item.body}</p>
                  <p className={p.cardSource}>
                    <a href={item.href} rel="noopener noreferrer" target="_blank">
                      {item.source}
                    </a>
                  </p>
                </article>
              ))}
            </div>
            <p className={`${p.lead} ${styles.gapTop}`} data-testid="institution-changed-way">
              GWTH teaches people to work the way Microsoft&apos;s advanced
              users do, using AI for complex, multi-step work, and we rewrite
              the lessons when the tools, or the best way to use them, change.
            </p>
            {/* Scoped on the marketing copy gate (2026-10-21): the EU duty
                applies only to organisations the Act covers. */}
            <p className={`${p.lead} ${styles.gapTop}`}>
              If your organisation provides or uses AI systems covered by the
              EU AI Act,{" "}
              <a href={LAW.euAiAct} rel="noopener noreferrer" target="_blank">
                Article 4 of the Act
              </a>{" "}
              has required it since February 2025 to help its staff understand
              those systems. In the UK, the{" "}
              <a href={LAW.ukSkills} rel="noopener noreferrer" target="_blank">
                government&apos;s skills partnership, announced in January
                2026,
              </a>{" "}
              aims to give ten million workers AI skills by 2030.
            </p>

            {/* Behind a click, as long pages do since D25 (7 Nov 2026): the
                three examples stay, and the line that sums them up shows. */}
            <details className={`${p.reveal} ${styles.gapTop}`} data-testid="pattern">
              <summary>
                Professional bodies already deliver learning through partners
              </summary>
              <div className={`${p.featureGrid} ${styles.featureGrid3} ${p.revealBody}`}>
                {PATTERN.map((item) => (
                  <div className={p.feature} key={item.title} data-testid="pattern-item">
                    <h3 className={styles.featureTitle}>{item.title}</h3>
                    <p>{item.body}</p>
                    <p className={p.cardSource}>
                      <a href={item.href} rel="noopener noreferrer" target="_blank">
                        Source
                      </a>
                    </p>
                  </div>
                ))}
              </div>
            </details>
          </div>
        </section>

        <section
          className={p.section}
          data-section="team-lessons"
          data-for="team"
        >
          <div className={p.page}>
            <div className={p.sectionHead}>
              <h2 className={p.sectionTitle}>
                What your team can <em>choose from</em>
              </h2>
            </div>
            <p className={p.lead}>
              Not every role needs every lesson. Everyone takes the same core
              lessons, and each month also opens a set of optional lessons, so
              people can spend their time on the ones that fit their work. The
              optional set grows as new lessons are published.
            </p>
            <dl className={styles.rolePaths} data-testid="role-paths">
              {ROLE_PATHS.map((path) => (
                <div key={path.label}>
                  <dt>{path.label}</dt>
                  <dd>{path.detail}</dd>
                </div>
              ))}
            </dl>
            <p className={styles.note}>
              Nobody has to take all of it. If the subject your people need is
              not there, a professional body, or a company or team of 100 or
              more learners, can have lessons written for it and approved by
              its own experts before anyone sees them. See{" "}
              <Link href={audienceHref("institution")} data-audience="institution">
                the choice for institutions
              </Link>
              .
            </p>
          </div>
        </section>

        {/* ── 9. What it costs ───────────────────────────────────────────── */}

        {/* No pricing basis, unit, figure or range for an edition (David,
            a-20260915-085041-eaa513). */}
        <section
          className={`${p.section} ${styles.anchor}`}
          data-section="commercials"
          data-for="institution"
          id="commercials"
        >
          <div className={p.page}>
            <div className={styles.callout}>
              <h2 className={p.sectionTitle}>
                One agreement covers the edition
              </h2>
              <p className={styles.calloutLead} data-testid="institution-commercials-lead">
                One agreement covers your edition, the admin screen and the
                learners dashboard your tutors use. There is no published
                price for an institution edition, because it depends on the
                lessons you choose, any lessons we write for you, and how you
                want to start. Tell us what you need and we will send you a
                proposal.
              </p>
              <div className={p.actions}>
                <Link href="/contact" className={p.buttonSolid}>
                  Book a walkthrough
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section
          className={`${p.section} ${styles.anchor}`}
          data-section="team-price"
          data-for="team"
          id="price"
        >
          <div className={p.page}>
            <div className={p.sectionHead}>
              <h2 className={p.sectionTitle}>
                The same price per person,{" "}
                <em>whatever the size of the team</em>
              </h2>
            </div>
            <div className={styles.priceBox}>
              <div className={styles.priceRows}>
                <div data-testid="team-price-monthly">
                  <p className={styles.priceKind}>Paid monthly</p>
                  <p className={styles.priceFigure}>
                    <strong>£{COURSE_MONTHLY_PRICE}</strong>
                    <span>a month for each person</span>
                  </p>
                  <p className={styles.priceText}>
                    For each of the three months. Each person signs up with
                    their own account and can cancel at any time. After the
                    three months, the plan carries on at £
                    {ONGOING_MONTHLY_PRICE.toFixed(2)} a month to keep lessons
                    up to date, unless they cancel.
                  </p>
                </div>
                <div data-testid="team-price-once">
                  <p className={styles.priceKind}>Paid once</p>
                  <p className={styles.priceFigure}>
                    <strong>{price.sale}</strong>
                    <span>for the whole course, for each person</span>
                  </p>
                  <p className={styles.priceText}>
                    If you buy between {price.opensOn} and {price.endsOn}.
                    After that, the whole course is {price.full}. The first
                    month on its own is {price.month1}.
                  </p>
                </div>
              </div>
              <ul className={styles.ticks}>
                {TEAM_PRICE_FEATURES.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
            </div>
            <p className={styles.note}>
              All prices are in pounds. Every option is on the{" "}
              <Link href="/pricing">pricing page</Link>.
            </p>

            {/* The comparison David's note a-20260914-200101-e34e36 shaped:
                the same panel on both sides, told apart by words. */}
            <h3 className={styles.subTitle}>
              The real cost is not the course.{" "}
              <em>It is your team&apos;s time.</em>
            </h3>
            <div className={`${p.cards2} ${styles.gapTop}`}>
              <article className={p.card} data-testid="compare-card">
                <h4 className={styles.compareWho}>Elsewhere</h4>
                <p className={p.cardKicker}>When you compare courses</p>
                <p className={styles.compareFigure}>Count the hours</p>
                <p className={p.cardBody}>
                  Ask how many of the hours are spent practising on the work
                  your team actually does, when the material was last
                  rewritten, and how much of it repeats what came before.
                </p>
              </article>
              <article className={p.card} data-testid="compare-card">
                <h4 className={styles.compareWho}>GWTH</h4>
                <p className={p.cardKicker}>This course</p>
                <p className={`${styles.compareFigure} ${styles.compareFigureOurs}`}>
                  Count what they make
                </p>
                <p className={p.cardBody}>
                  Each lesson is built around a project, such as a tool, a
                  document or a plan, that people can relate to the work they
                  already do.
                </p>
              </article>
            </div>
          </div>
        </section>

        {/* ── 10. The two offers, side by side ───────────────────────────── */}

        <section className={p.section} data-section="compare" id="compare">
          <div className={p.page}>
            <div className={p.sectionHead}>
              <h2 className={p.sectionTitle}>
                The two ways to use GWTH, <em>side by side</em>
              </h2>
            </div>
            <table className={styles.sideBySide}>
              <caption className={styles.srOnly}>
                Places on the standard course compared with your own edition
              </caption>
              <thead>
                <tr>
                  <td />
                  <th scope="col">Places on the standard course</th>
                  <th scope="col">Your own edition</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row">Who it is for</th>
                  <td data-label="Places on the standard course">
                    A team of any size. There is no minimum number of places.
                  </td>
                  <td data-label="Your own edition">
                    Professional bodies, colleges, training providers and
                    large employers that run their own courses.
                  </td>
                </tr>
                <tr>
                  <th scope="row">The lessons</th>
                  <td data-label="Places on the standard course">
                    The same {TOTAL_MANDATORY_LESSONS} core lessons for
                    everyone. Each person chooses which optional lessons to
                    take.
                  </td>
                  <td data-label="Your own edition">
                    The core lessons are always required. You choose which
                    optional lessons your members see and which they must
                    pass. We can also write lessons only for your members.
                  </td>
                </tr>
                <tr>
                  <th scope="row">The pass mark</th>
                  <td data-label="Places on the standard course">
                    Each quiz has a pass mark.
                  </td>
                  <td data-label="Your own edition">
                    You set one pass mark for your edition.
                  </td>
                </tr>
                <tr>
                  <th scope="row">Who sees progress</th>
                  <td data-label="Places on the standard course">
                    Each person, on their own progress page.
                  </td>
                  <td data-label="Your own edition">
                    Each member, on their own progress page, and your tutors,
                    on a learners dashboard.
                  </td>
                </tr>
                <tr>
                  <th scope="row">The price</th>
                  <td data-label="Places on the standard course">
                    £{COURSE_MONTHLY_PRICE} a month for each of the three
                    months, then £{ONGOING_MONTHLY_PRICE.toFixed(2)} a month
                    to keep lessons up to date unless they cancel. Or{" "}
                    {price.sale} paid once if you buy between {price.opensOn}{" "}
                    and {price.endsOn}, then {price.full}. A pass never renews.
                  </td>
                  <td data-label="Your own edition">
                    No published price. Tell us what you need and we will send
                    you a proposal.
                  </td>
                </tr>
                <tr>
                  <th scope="row">How to start</th>
                  <td data-label="Places on the standard course">
                    From {price.opensOn}, buy a place for each person on{" "}
                    {selling ? <Link href="/gift">the gift page</Link> : "the gift page"}
                    .{" "}
                    <Link href={audienceHref("team")} data-audience="team">
                      Read the choice for teams
                    </Link>
                    .
                  </td>
                  <td data-label="Your own edition">
                    Book a walkthrough. A pilot group can start on the
                    standard course from {price.opensOn}.{" "}
                    <Link href={audienceHref("institution")} data-audience="institution">
                      Read the choice for institutions
                    </Link>
                    .
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* ── 11. Questions ──────────────────────────────────────────────── */}

        <section
          className={p.section}
          data-section="faq-institution"
          data-for="institution"
        >
          <div className={p.page}>
            <div className={p.sectionHead}>
              <h2 className={p.sectionTitle}>Questions institutions ask</h2>
            </div>
            <div className={p.faqList}>
              {INSTITUTION_FAQS.map((item, index) => (
                <details className={p.faqItem} key={item.q} open={index === 0}>
                  <summary>{item.q}</summary>
                  <p>
                    {publicScore && item.publicScoreA
                      ? item.publicScoreA
                      : item.a}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className={p.section} data-section="faq-team" data-for="team">
          <div className={p.page}>
            <div className={p.sectionHead}>
              <h2 className={p.sectionTitle}>Questions managers ask</h2>
            </div>
            <div className={`${p.faqList} ${styles.faqLinks}`}>
              {teamFaqs(price).map((item, index) => (
                <details className={p.faqItem} key={item.q} open={index === 0}>
                  <summary>{item.q}</summary>
                  <p>{item.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* ── 12. The next step ──────────────────────────────────────────── */}

        <section
          className={p.closing}
          data-section="closing-institution"
          data-for="institution"
        >
          <div className={p.page}>
            <div className={styles.closingGrid}>
              <div>
                <h2 className={p.sectionTitle}>
                  See how it would work <em>for your courses</em>.
                </h2>
                <p className={p.standfirst}>
                  A walkthrough takes about forty minutes. We show you what a
                  member sees, the admin screen where you choose lessons and
                  set the pass mark, and the learners dashboard your tutors
                  use. Tell us which of your courses you want members to
                  arrive ready for.
                </p>
                <div className={p.actions}>
                  <Link href="/contact" className={p.buttonSolid}>
                    Book a walkthrough
                  </Link>
                  <Link href={audienceHref("team")} data-audience="team" className={p.buttonOutline}>
                    See options for company teams
                  </Link>
                </div>
              </div>
              <figure className={`${p.plate} ${styles.closingPicture}`}>
                <OrgPlate
                  name="walkthrough"
                  alt="A paper cutout scene: two people sit side by side at a table with cups of tea and look at a laptop together, while one of them points at the screen and explains."
                  sizes="(max-width: 1023px) 100vw, 480px"
                />
              </figure>
            </div>
          </div>
        </section>

        <section
          className={p.closing}
          data-section="closing-team"
          data-for="team"
        >
          <div className={p.page}>
            <div className={styles.closingGrid}>
              <div>
                <h2 className={p.sectionTitle}>
                  Buying places <em>for your team?</em>
                </h2>
                <p className={p.standfirst}>
                  Places are on sale from {price.opensOn}. Buy one for each
                  person on the gift page, or get in touch if you have a
                  question first.
                </p>
                <div className={p.actions}>
                  {teamPrimary}
                  <Link href="/contact" className={p.buttonOutline}>
                    Get in touch
                  </Link>
                  <Link href="/lessons" className={p.buttonOutline}>
                    See the course
                  </Link>
                </div>
              </div>
              <figure className={`${p.plate} ${styles.closingPicture}`}>
                <OrgPlate
                  name="walkthrough"
                  alt="A paper cutout scene: two people sit side by side at a table with cups of tea and look at a laptop together, while one of them points at the screen and explains."
                  sizes="(max-width: 1023px) 100vw, 480px"
                />
              </figure>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
