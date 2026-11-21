import type { ReactNode } from "react"
import Link from "next/link"
import {
  COURSE_MONTHLY_PRICE,
  ENABLE_CAPSTONE_HAND_IN,
  ENABLE_GWTH_SCORE,
  ONGOING_MONTHLY_PRICE,
} from "@/lib/config"
import {
  formatPence,
  formatUkDate,
  getSaleWindow,
  PASS_PRICES_PENCE,
} from "@/lib/billing/passes"
import { Plate } from "@/components/marketing/paper/plate"
import {
  CAREER_CARDS,
  HOME_CARDS,
  PRIMITIVES_URL,
  SIX_BLOCKS,
  WORK_CARDS,
} from "@/components/marketing/home-fde/home-fde"
import { HomeFilm } from "@/components/marketing/home-fde/home-film"
import { ScoreStory } from "@/components/marketing/score-badge/score-story"
import p from "@/components/marketing/paper/paper.module.css"
import { HomeMotion } from "./home-motion"
import styles from "./home-next.module.css"

/**
 * A new version of the home page, kept beside the real one for David to judge
 * (18 Nov 2026). His words: *"I think we need a really powerful model like
 * Fable 5.2 on high to go through the page and make changes to it and then
 * display the new version so that I can comment on the new ideas that are
 * meant to replace the weakest parts of the current homepage. Don't overwrite
 * the old home page. Just take a copy of it and then start making changes ...
 * Don't change the main video ... Keep the style very similar to what we've
 * got now ... What I really want to change is the layout, the text, the
 * titles, the images."*
 *
 * It is served at `/home-new`, a draft page (`lib/public-routes.ts`), so it is
 * a real 404 on gwth.ai. `home-fde/` is untouched and still renders `/`.
 *
 * ## What changed, and which of his comments each change answers
 *
 * 1. **Hero.** A new headline that names the six AI superpowers, which is
 *    also the film's title card, and a shorter standfirst. The film and the
 *    free-lesson panel beside it are `HomeFilm`, exactly as on `/`: the film
 *    itself says "The link is beside this film", so the panel stays there.
 * 2. **Six AI superpowers come second, and open in place.** a-20261118-220107:
 *    *"This is our core message on the homepage around six AI superpowers as
 *    it hit so well with other beginners ... it's kind of wasted because when
 *    you click the button it's very confusing what you're looking at."* Each
 *    superpower now has a picture and shows, where it sits, how it grows from
 *    Month 1 to Month 3 (a-20260915-211445: *"explain how the student
 *    progresses from month one to two to three"*). No button leaves the page.
 * 3. **The months** keep the picture he chose and gain what you make in each
 *    month, as a rising row of three.
 * 4. **"What would you like to do with AI?"** a-20261118-215935: *"I like the
 *    idea of this section but it's not very well executed. We don't have
 *    enough reasons under each option to make it compelling at all."* Each
 *    choice now has a picture and its reasons set out month by month, so it
 *    reads as a route through the course. Buying for someone else is one line
 *    under the box, not a fourth choice.
 * 5. **A score and a portfolio.** a-20261118-220253: *"It doesn't show at a
 *    glance that you can get a score that shows how good you are and also
 *    create a portfolio for your employer or a future employer."* And
 *    a-20260915-211845: *"It needs to show the score and the trajectory that
 *    the student is on whether they're improving their score or it's
 *    flatlining or it's not being kept up to date."* One picture says both at
 *    a glance; the three example score cards show the three directions.
 * 6. **How a lesson works** is a row of three steps (the blank half of the
 *    old "How the course works" section is gone), and the **UK** section has
 *    its picture.
 * 7. **The price closes the page.** The offer keeps the same sentences as
 *    on `/`, word for word: they are legal wording.
 *
 * ## What is reused, so the facts cannot drift
 *
 * `SIX_BLOCKS`, `SCORE_STATES`, the three purpose card sets and
 * `PRIMITIVES_URL` are imported from `home-fde`, where each line is traced to
 * the authored lesson it comes from. The score rules are in the
 * `SCORE_STATES` comment there: read it before changing the score copy.
 * Prices and dates come from the billing module, never typed.
 *
 * Pictures: paper cutouts in the style David picked on 13 Nov 2026, drawn by
 * the latest Astra with GPT Image. Briefs and prompts:
 * GWTH-launch-plan `completion/home-fable/pictures/`.
 */

type SuperpowerId =
  | "research"
  | "content"
  | "thinking"
  | "building"
  | "data"
  | "automation"

/** One id per block, in `SIX_BLOCKS` order. The id names the picture file. */
const SUPERPOWER_IDS: readonly SuperpowerId[] = [
  "research",
  "content",
  "thinking",
  "building",
  "data",
  "automation",
]

const SUPERPOWER_ALT: Record<SuperpowerId, string> = {
  research:
    "A paper cutout scene: a person compares two holiday cottages side by side, holding a magnifying glass over one of them.",
  content:
    "A paper cutout scene: a person at a desk with a finished page of writing and a small framed picture they made to go with it.",
  thinking:
    "A paper cutout scene: a person stands at a wall plan with three paths and places a marker on the one they have chosen.",
  building:
    "A paper cutout scene: a person makes a meal planner on a laptop, with vegetables, eggs and milk laid out beside it.",
  data: "A paper cutout scene: a person turns a messy pile of receipts and statements into a clean bar chart.",
  automation:
    "A paper cutout scene: a person designs a routine job on a large sheet of paper as a row of boxes and arrows, with a checkpoint where a person must approve.",
}

/** Line icons for the six choices. Drawn in the current ink, so they follow the theme. */
function SuperpowerIcon({ id }: { id: SuperpowerId }) {
  const common = {
    width: 26,
    height: 26,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.6,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
    focusable: "false" as const,
    className: styles.optionIcon,
  }
  const paths: Record<SuperpowerId, ReactNode> = {
    research: (
      <>
        <circle cx="10.5" cy="10.5" r="6" />
        <path d="M15 15l5.5 5.5" />
      </>
    ),
    content: (
      <>
        <path d="M6 3.5h8l4 4V20a.5.5 0 0 1-.5.5h-11A.5.5 0 0 1 6 20V3.5z" />
        <path d="M9 11h6M9 14.5h6M9 18h3.5" />
      </>
    ),
    thinking: (
      <>
        <circle cx="5" cy="12" r="1.8" />
        <path d="M6.8 12H11m0 0l5-6h3m-8 6h8m-8 0l5 6h3" />
      </>
    ),
    building: (
      <>
        <rect x="3.5" y="12.5" width="8" height="8" rx="1" />
        <rect x="12.5" y="12.5" width="8" height="8" rx="1" />
        <rect x="8" y="3.5" width="8" height="8" rx="1" />
      </>
    ),
    data: (
      <>
        <path d="M3.5 20.5h17" />
        <path d="M6.5 20.5v-6M12 20.5v-11M17.5 20.5v-15" />
      </>
    ),
    automation: (
      <>
        <path d="M19.5 12a7.5 7.5 0 0 1-13 5.1M4.5 12a7.5 7.5 0 0 1 13-5.1" />
        <path d="M17.5 3.5v3.6h-3.6M6.5 20.5v-3.6h3.6" />
      </>
    ),
  }
  return <svg {...common}>{paths[id]}</svg>
}

/**
 * The three months. Each month says who the work is for and names what you
 * make. Every item is traced to an authored lesson in the `home-fde` header
 * ("What the examples are taken from") and in `SIX_BLOCKS`.
 */
export const MONTH_STEPS = [
  {
    kicker: "Month 1",
    title: "Build your foundation",
    body: "You start with projects for yourself. They are useful to you and good fun to make.",
    makes: [
      "FamilyBot, which turns a family meeting recording into a list of jobs, a meal plan and a shopping list",
      "Spending Detective, which shows where your money goes",
      "A one-page plan for a real decision in your life",
    ],
  },
  {
    kicker: "Month 2",
    title: "Support a small business",
    body: "You learn to protect other people's data, and you start building real software.",
    makes: [
      "AskMyCo, a support chatbot that answers from a company's own documents",
      "A database with real logins",
      "A dashboard, and tests that check each part works",
    ],
  },
  {
    kicker: "Month 3",
    title: "Help a whole organisation",
    body: "You bring your skills together in your own AI consultant.",
    makes: [
      "It interviews people across an organisation by voice",
      "It scores how ready an organisation is to use AI and names the answers behind each score",
      "It writes the report and the slide deck for the people in charge",
    ],
  },
] as const

type PurposeCard = { title: string; body: string; lessons: readonly string[] }

/**
 * The three purposes. Each one reuses the card set already on `/`, grouped by
 * the month its lessons are in, so a choice reads as a route through the
 * course instead of a list. The lesson references stay editorial evidence:
 * nothing here links into a lesson (David, 1 Nov 2026).
 */
export const PURPOSES: readonly {
  id: "home" | "work" | "career"
  label: string
  lead: string
  picture: string
  alt: string
  cards: readonly PurposeCard[]
}[] = [
  {
    id: "home",
    label: "Use AI at home",
    lead: "These projects are all in Month 1.",
    picture: "next/home",
    alt: "A paper cutout picture in three panels: one person sorts their spending into a simple chart, plans meals and shopping, and checks a phone message with a magnifying glass. The labels read Sort your spending, Plan meals and shopping, Spot a fake.",
    cards: HOME_CARDS,
  },
  {
    id: "work",
    label: "Use AI in your job",
    lead: "You begin with your own tasks. From Month 2 you build tools that a team can use.",
    picture: "next/job",
    alt: "A paper cutout picture in three panels: one person compares two options at a desk, turns meeting notes into a tidy page, and shows a colleague a simple dashboard. The labels read Research a decision, Write up the meeting, Build a team dashboard.",
    cards: WORK_CARDS,
  },
  {
    id: "career",
    label: "Change role or work for yourself",
    lead: "From Month 1 you make things that help with a new role or a business of your own.",
    picture: "next/career",
    alt: "A paper cutout picture in three panels: one person revises their CV, lays out a portfolio of work, and practises an interview at a laptop. The labels read Revise your CV, Build a portfolio, Practise interviews.",
    cards: CAREER_CARDS,
  },
]

/** "M2 L13" -> 2. */
function monthOf(lesson: string): number {
  return Number(lesson.slice(1, 2))
}

/** Cards grouped by month; a card whose lessons span months goes last. */
export function groupByMonth(
  cards: readonly PurposeCard[]
): { heading: string; cards: PurposeCard[] }[] {
  const groups = new Map<string, PurposeCard[]>()
  for (const card of cards) {
    const months = new Set(card.lessons.map(monthOf))
    const heading = months.size > 1 ? "In every month" : `Month ${[...months][0]}`
    groups.set(heading, [...(groups.get(heading) ?? []), card])
  }
  const order = ["Month 1", "Month 2", "Month 3", "In every month"]
  return order
    .filter((heading) => groups.has(heading))
    .map((heading) => ({ heading, cards: groups.get(heading)! }))
}

const LESSON_STEPS = [
  ["Watch a short film", "Get an introduction to the subject."],
  ["Read the lesson, then answer questions", "Work through the lesson over several pages. The questions on the lesson are a quiz with a pass mark. Your answers are marked automatically, so you can see what to go back over."],
  ["Do the project", "Put what you have learnt into practice."],
] as const

/** The UK thread, the same three claims as on `/` (see `UK_THREAD` there). */
const UK_POINTS = [
  {
    title: "The documents you actually get",
    body: "Practise with NHS letters, council and benefits forms, Self Assessment returns, workplace pension statements and household spreadsheets.",
  },
  {
    title: "The rules you are actually held to",
    body: "Practise with UK examples of tax, pensions, employment and data protection, and learn to check which rules apply to your situation.",
  },
  {
    title: "Check where the answer comes from",
    body: "AI can give you an answer based on another country's rules. Ask where the information comes from. Before you act, check a trusted UK source, such as GOV.UK for government information.",
  },
] as const

/** The launch offer, from the billing module (see `launchOffer` on `/`). */
function launchOffer() {
  const window = getSaleWindow()
  return {
    sale: formatPence(PASS_PRICES_PENCE.courseSale),
    opensOn: formatUkDate(window.announcedOpenAt),
    endsOn: formatUkDate(new Date(window.saleEndsAt.getTime() - 1)),
  }
}

function sentenceCase(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1)
}

export type HomeNextProps = {
  /** True once GWTH is on sale (`isSelling()`). Only the buttons change. */
  selling?: boolean
  /** Describes the score as live. Defaults to the `ENABLE_GWTH_SCORE` flag. */
  showScore?: boolean
  /**
   * Describes project marking in the present tense. Defaults to the
   * `ENABLE_CAPSTONE_HAND_IN` flag, so the page never says projects "are
   * marked" before hand-ins open (Style Bible score rule; David, 19 Nov 2026:
   * the public pages show the December course with the score, while marking
   * is still being built).
   */
  markingLive?: boolean
}

export function HomeNext({
  selling = false,
  showScore = ENABLE_GWTH_SCORE,
  markingLive = ENABLE_CAPSTONE_HAND_IN,
}: HomeNextProps = {}) {
  const offer = launchOffer()
  const joinCta = selling
    ? { href: "/pricing", label: "Join the course" }
    : { href: "/waitlist", label: "Join the waitlist" }

  return (
    <div className={`${p.shell} ${styles.motionRoot}`} data-home-motion>
      {/* Motion only: it renders nothing, and the page is whole without it
          (see `home-motion.tsx`). */}
      <HomeMotion />
      {/* 1. Hero. The film and the free-lesson panel beside it are the real
          home page's, untouched: the film ends "Why not try the free lesson
          to see how it works? The link is beside this film." */}
      <section className={styles.hero} data-section="hero">
        <div className={p.page}>
          <div className={styles.heroGrid}>
            <h1 className={styles.heroTitle}>
              <span>Learn six AI </span>
              <span>superpowers by </span>
              <span>
                <em>making things</em>.
              </span>
            </h1>
            <div className={styles.heroCopy}>
              <p className={p.standfirst}>
                GWTH is a practical AI course for work and everyday life in the
                UK. You don&apos;t need coding experience. You start with small
                projects for yourself, and by Month 3 you build your own AI
                consultant, which interviews people across an organisation and
                writes a plan for what to change first.
              </p>
              <div className={p.actions}>
                <Link href={joinCta.href} className={`${p.buttonSolid} ${styles.press}`}>
                  {joinCta.label}
                </Link>
                <a href="#superpowers" className={`${p.buttonOutline} ${styles.press}`}>
                  See the six superpowers
                </a>
              </div>
            </div>
          </div>
          <HomeFilm />
        </div>
      </section>

      {/* 2. The six AI superpowers: the page's core message, opened in place. */}
      <section
        className={p.section}
        data-section="superpowers"
        id="superpowers"
      >
        <div className={p.page}>
          <div className={p.sectionHead} data-motion="head">
            <h2 className={p.sectionTitle}>
              Six AI <em>superpowers</em>
            </h2>
          </div>
          <p className={styles.lead} data-motion="rise">
            The course teaches six skills, which we call the six AI
            superpowers. You practise all six every month, and the projects
            get bigger each time. Choose one to see how it grows.
          </p>
          <div className={styles.chooser} data-chooser="superpower">
            <fieldset className={`${styles.options} ${styles.optionsSix}`}>
              <legend className={styles.srOnly}>Choose a superpower</legend>
              {SIX_BLOCKS.map((block, index) => {
                const id = SUPERPOWER_IDS[index]!
                return (
                  <label className={styles.option} key={id} data-motion="deal">
                    <input
                      type="radio"
                      name="superpower"
                      value={id}
                      defaultChecked={index === 0}
                      aria-controls={`superpower-${id}`}
                    />
                    <span className={styles.optionFace}>
                      <SuperpowerIcon id={id} />
                      <span className={styles.optionName}>{block.name}</span>
                      <span className={styles.optionGloss}>
                        {sentenceCase(block.clause)}
                      </span>
                    </span>
                  </label>
                )
              })}
            </fieldset>
            {SIX_BLOCKS.map((block, index) => {
              const id = SUPERPOWER_IDS[index]!
              return (
                <article
                  className={`${styles.panel} ${styles.powerPanel}`}
                  data-panel={id}
                  id={`superpower-${id}`}
                  key={id}
                  data-testid="superpower-panel"
                  data-motion="panel"
                >
                  <figure
                    className={`${p.plate} ${styles.powerPicture}`}
                    data-motion="assemble"
                  >
                    <Plate
                      name={`next/${id}`}
                      ext="jpg"
                      width={1536}
                      height={1024}
                      alt={SUPERPOWER_ALT[id]}
                      sizes="(max-width: 1023px) 100vw, 520px"
                    />
                  </figure>
                  <div>
                    <h3 className={styles.panelTitle}>
                      {block.name}: {block.clause}
                    </h3>
                    <ol
                      className={styles.growth}
                      aria-label={`How ${block.name} grows over three months`}
                    >
                      {block.months.map((line, month) => (
                        <li key={line} data-step={month + 1}>
                          <span className={styles.growthMonth}>
                            Month {month + 1}
                          </span>
                          <p>{line}</p>
                        </li>
                      ))}
                    </ol>
                  </div>
                </article>
              )
            })}
          </div>
          <p className={p.attribution} data-motion="rise">
            OpenAI found{" "}
            <a href={PRIMITIVES_URL} rel="noopener noreferrer" target="_blank">
              six common ways its customers use AI at work
            </a>.
          </p>
        </div>
      </section>

      {/* 3. The three months, with what you make in each. */}
      <section className={p.section} data-section="months" id="months">
        <div className={p.page}>
          <div className={p.sectionHead} data-motion="head">
            <h2 className={p.sectionTitle}>Each month builds on the last</h2>
          </div>
          <figure
            className={`${p.plate} ${styles.monthsPlate}`}
            data-motion="assemble"
            data-motion-pieces="months"
          >
            <Plate
              name="what-you-make-cutout"
              width={1536}
              height={1024}
              alt="A paper cutout model in green card with three stepped layers. On the lowest layer one person works at a laptop, labelled Month 1, a tool that works. On the layer above, a team of four builds software together, labelled Month 2, real software. On the top and largest layer, a whole office of people works together, labelled Month 3, your AI consultant."
              sizes="(max-width: 1180px) 100vw, 1140px"
            />
          </figure>
          <ol className={styles.monthSteps}>
            {MONTH_STEPS.map((month) => (
              <li
                className={styles.monthStep}
                key={month.kicker}
                data-testid="month-step"
                data-motion="card"
              >
                <p className={styles.monthKicker}>{month.kicker}</p>
                <h3 className={p.cardTitle}>{month.title}</h3>
                <p className={p.cardBody}>{month.body}</p>
                <ul className={styles.makes}>
                  {month.makes.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
          <p className={styles.note} data-testid="months-optional-note" data-motion="rise">
            After the core lessons in Months 2 and 3, explore AI for UK
            healthcare or legal work. Go deep into one area without taking
            every optional lesson. For work tasks, use the AI tool your
            organisation has approved.
          </p>
        </div>
      </section>

      {/* 4. What would you like to do with AI? A route for each purpose. */}
      <section className={p.section} data-section="purpose" id="career">
        <div className={p.page}>
          <div className={p.sectionHead} data-motion="head">
            <h2 className={p.sectionTitle}>What would you like to do with AI?</h2>
          </div>
          <div className={styles.chooser} data-chooser="purpose">
            <fieldset className={`${styles.options} ${styles.optionsThree}`}>
              <legend className={styles.srOnly}>Choose what matters to you</legend>
              {PURPOSES.map((purpose, index) => (
                <label className={styles.option} key={purpose.id} data-motion="deal">
                  <input
                    type="radio"
                    name="purpose"
                    value={purpose.id}
                    defaultChecked={index === 0}
                    aria-controls={`purpose-${purpose.id}`}
                  />
                  <span className={`${styles.optionFace} ${styles.optionFaceRow}`}>
                    <span className={styles.optionName}>{purpose.label}</span>
                  </span>
                </label>
              ))}
            </fieldset>
            {PURPOSES.map((purpose) => (
              <article
                className={`${styles.panel} ${styles.purposePanel}`}
                data-panel={purpose.id}
                id={`purpose-${purpose.id}`}
                key={purpose.id}
                data-testid="purpose-panel"
                data-motion="panel"
              >
                <figure
                  className={`${p.plate} ${styles.purposePicture}`}
                  data-motion="assemble"
                  data-motion-pieces="triptych"
                >
                  <Plate
                    name={purpose.picture}
                    ext="jpg"
                    width={1536}
                    height={1024}
                    alt={purpose.alt}
                    sizes="(max-width: 1023px) 100vw, 480px"
                  />
                </figure>
                <div>
                  <h3 className={styles.panelTitle}>{purpose.label}</h3>
                  <p className={styles.panelLead}>{purpose.lead}</p>
                  {groupByMonth(purpose.cards).map((group) => (
                    <div className={styles.route} key={group.heading}>
                      <h4 className={styles.routeMonth}>{group.heading}</h4>
                      <ul className={styles.routeList}>
                        {group.cards.map((card) => (
                          <li key={card.title}>
                            <h5>{card.title}</h5>
                            <p>{card.body}</p>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
          <p className={styles.others} data-testid="organisations-signpost" data-motion="rise">
            Buying for someone else? Give the course as a gift, or buy team
            places at the same price per person. Professional bodies and large
            companies can choose optional lessons and set a quiz pass mark for
            their own edition.{" "}
            {selling && (
              <>
                <Link href="/gift">Give it as a gift</Link>
                {" or see "}
              </>
            )}
            <Link href="/for-organisations">
              {selling ? "the page for institutions and large companies" : "See the page for institutions and large companies"}
            </Link>
            .
          </p>
        </div>
      </section>

      {/* 5. What you leave with: a score and a portfolio, at a glance. */}
      <section className={p.section} data-section="proof" id="proof">
        <div className={p.page}>
          <div className={styles.proofBox}>
            <h2 className={p.sectionTitle} data-motion="rise">
              {showScore ? (
                <>
                  Finish with a <em>score</em> and a <em>portfolio</em>
                </>
              ) : (
                <>
                  Finish with a <em>portfolio</em> of your work
                </>
              )}
            </h2>
            <div className={styles.proofTop}>
              <figure
                className={`${p.plate} ${styles.proofPicture}`}
                data-motion="assemble"
                data-motion-pieces="proof"
              >
                <Plate
                  name="next/show-your-work"
                  ext="jpg"
                  width={1536}
                  height={1024}
                  alt="A paper cutout scene: a learner shows their work to an employer at a table. On the left an easel with a rising line is labelled Your score. On the right a web page, a chat and a report are labelled Your portfolio."
                  sizes="(max-width: 1023px) 100vw, 560px"
                />
              </figure>
              <dl className={styles.proofPoints}>
                <div data-testid="proof-score" data-motion="rise">
                  <dt>Your GWTH score</dt>
                  <dd>
                    {showScore
                      ? "A number out of 100. It combines the core lessons you've passed, your quiz results and your best marks for the three monthly projects."
                      : "A number out of 100 is planned. It will combine the core lessons you've passed, your quiz results and your best marks for the three monthly projects. The course does not show it yet."}
                  </dd>
                </div>
                <div data-testid="proof-portfolio" data-motion="rise">
                  <dt>Your portfolio</dt>
                  <dd>
                    The projects you made in all three months, from FamilyBot
                    to your AI consultant. Link to it in an
                    application or talk it through at an interview. Get
                    permission before sharing anyone else&apos;s information.
                  </dd>
                </div>
              </dl>
            </div>

            <div className={styles.scoreBlock} data-testid="proof-marking" data-motion="rise">
              <h3 className={styles.panelTitle}>
                {markingLive
                  ? "Your monthly projects are marked, with feedback on your work"
                  : "Your monthly projects will be marked, with feedback on your work"}
              </h3>
              <div className={styles.scoreCopy}>
                <div>
                  <p>
                    {markingLive
                      ? "You build and hand in a major project at the end of each month. All three projects are marked against GWTH's published marking guides."
                      : "You'll build and hand in a major project at the end of each month. All three projects will be marked against GWTH's published marking guides."}
                  </p>
                  <p>
                    {markingLive
                      ? "Your feedback quotes your own work to show what you've done well and how to reach the next level in each part of the marking guide. You get one clear next step."
                      : "Your feedback will quote your own work to show what you've done well and how to reach the next level in each part of the marking guide. You'll get one clear next step."}
                  </p>
                </div>
                <div>
                  <p>
                    {markingLive
                      ? "There are four levels: Not yet, Pass, Good and Excellent."
                      : "There will be four levels: Not yet, Pass, Good and Excellent."}
                  </p>
                  <p>
                    {markingLive
                      ? "You see a provisional mark at once. It becomes final once checked, within 7 days. Not yet tells you exactly what to fix before handing in again. You can hand in each project up to three times; your best mark counts."
                      : "You'll see a provisional mark at once. It will become final once checked, within 7 days. Not yet will tell you exactly what to fix before handing in again. You'll be able to hand in each project up to three times; your best mark will count."}
                  </p>
                </div>
              </div>
            </div>

            {showScore && (
              <div className={styles.scoreBlock} data-section="score" id="score">
                <h3 className={styles.panelTitle} data-motion="rise">
                  How your score changes
                </h3>
                <div className={styles.scoreCopy} data-motion="rise">
                  <p data-testid="score-lead">
                    Core lessons and quiz results count for half of your score.
                    The marks for your monthly projects count for the other
                    half.
                  </p>
                  <p data-testid="score-honesty">
                    After 28 days without passing a core lesson, you start
                    losing 5% of your earned points for each full week. Passing
                    another core lesson removes that reduction, so your score
                    stays up to date.
                  </p>
                </div>
                {/* The score story (David, 21 Nov 2026, bead gwth-launch-phjb):
                    one badge earned, added to LinkedIn and checked. It replaces
                    the three line cards. The statistic is from the primary
                    source, checked 21 Nov: PwC, 2026 Global AI Jobs Barometer. */}
                <ScoreStory />
                <p className={styles.scoreWhy} data-testid="score-why">
                  Skills needed for the most AI-exposed jobs are changing more
                  than twice as fast as for the least AI-exposed jobs (
                  <a href="https://www.pwc.com/gx/en/1/services/ai/ai-jobs-barometer.html">
                    PwC, 2026 Global AI Jobs Barometer
                  </a>
                  ).
                </p>
                <p className={styles.smallNote}>
                  The card is an example and doesn&apos;t show a real
                  learner&apos;s score. We don&apos;t yet store a history of
                  your score. Compare scores only for people taking the same
                  set of lessons.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 6. How a lesson works, and where it is set. */}
      <section className={p.section} data-section="lesson">
        <div className={p.page}>
          <div className={p.sectionHead} data-motion="head">
            <h2 className={p.sectionTitle}>How a lesson works</h2>
          </div>
          <p className={styles.lead} data-motion="rise">
            The course has three monthly parts, with about five hours of work
            a week.
          </p>
          <ol className={styles.lessonSteps} aria-label="How a lesson works">
            {LESSON_STEPS.map(([title, body], index) => (
              <li key={title} data-motion="step">
                <span className={styles.stepNumber} aria-hidden="true">
                  {index + 1}
                </span>
                <h3>{title}</h3>
                <p>{body}</p>
              </li>
            ))}
          </ol>
          <div className={p.actions} data-motion="rise">
            <Link href="/start-here" className={`${p.buttonOutline} ${styles.press}`}>
              Try the free lesson
            </Link>
          </div>
        </div>
      </section>

      <section className={p.section} data-section="uk">
        <div className={p.page}>
          <div className={p.sectionHead} data-motion="head">
            <h2 className={p.sectionTitle}>
              Written for work and life <em>in the United Kingdom</em>
            </h2>
          </div>
          <div className={styles.ukGrid}>
            <figure
              className={`${p.plate} ${styles.ukPicture}`}
              data-motion="assemble"
              data-motion-pieces="uk"
            >
              <Plate
                name="next/uk-paperwork"
                ext="jpg"
                width={1536}
                height={1024}
                alt="A paper cutout scene: two people at a table read a letter together, among forms, statements and a laptop showing a spreadsheet, with a magnifying glass to hand. The labels read Everyday paperwork and Check the source."
                sizes="(max-width: 1023px) 100vw, 520px"
              />
            </figure>
            <div>
              <p className={styles.lead} data-testid="uk-lead" data-motion="rise">
                The course uses UK examples, because forms, rules and money
                work differently from country to country.
              </p>
              <ul className={styles.ukList}>
                {UK_POINTS.map((item) => (
                  <li key={item.title} data-testid="uk-card" data-motion="rise">
                    <h3>{item.title}</h3>
                    <p>{item.body}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 7. The price closes the page. The offer and the month-opening rule
          are the sentences on `/`, word for word (bead gwth-launch-735c). */}
      <section className={p.closing} data-section="price" id="price">
        <div className={p.page}>
          <div className={styles.priceBox}>
            <h2 className={p.sectionTitle} data-motion="rise">
              What it costs
            </h2>
            <div className={styles.priceGrid}>
              <div className={styles.pricePrice} data-testid="home-offer" data-motion="rise">
                <p className={styles.priceHeadline}>
                  From {offer.opensOn} to {offer.endsOn}, a three-month pass
                  costs {offer.sale}.
                </p>
                <ul className={styles.priceList}>
                  <li>
                    <strong>Pay {offer.sale} once.</strong> It never renews, and
                    gift recipients give no card details.
                  </li>
                  <li>
                    <strong>Or pay £{COURSE_MONTHLY_PRICE} a month</strong> for
                    the first three months, and cancel at any time in your
                    account settings.
                  </li>
                  <li>
                    <strong>After three months</strong>, your monthly plan
                    continues at £{ONGOING_MONTHLY_PRICE.toFixed(2)} a month for
                    access to the updated lessons unless you cancel. If you paid
                    once for a pass, your access to the course lessons stops. You
                    only pay again if you choose to subscribe.
                  </li>
                </ul>
              </div>
            </div>
            <div className={p.actions} data-motion="rise">
              {selling ? (
                <>
                  <Link href="/pricing" className={`${p.buttonSolid} ${styles.press}`}>
                    Buy it for yourself
                  </Link>
                  <Link href="/gift" className={`${p.buttonOutline} ${styles.press}`}>
                    Give it as a gift
                  </Link>
                </>
              ) : (
                <Link href="/waitlist" className={`${p.buttonSolid} ${styles.press}`}>
                  Join the waitlist
                </Link>
              )}
              {selling ? null : (
                <Link href="/start-here" className={`${p.buttonOutline} ${styles.press}`}>
                  Try the free lesson
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
