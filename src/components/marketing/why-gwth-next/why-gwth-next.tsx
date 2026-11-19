import type { CSSProperties, ReactNode } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  COURSE_MONTHLY_PRICE,
  ENABLE_GWTH_SCORE,
  ONGOING_MONTHLY_PRICE,
} from "@/lib/config"
import { LATER_MONTHS_OPEN } from "@/components/marketing/data"
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
import p from "@/components/marketing/paper/paper.module.css"
import { InView } from "./in-view"
import styles from "./why-gwth-next.module.css"

/**
 * The Why GWTH page, rebuilt in the family of the new home page (19 Nov 2026).
 * David on the page it replaces: *"It's okay, but I think we can lay this out
 * in a much more interesting way."* The content was roughly right and the
 * telling was flat: nine similar heading-and-paragraph rows, then a table.
 *
 * `why-gwth-fde/` is untouched and is the backup. Every fact here is carried
 * from it, from the home page (`home-next`) or from the code constants; the
 * comments in `why-gwth-fde.tsx` say where each sentence came from and which
 * of David's comments shaped it. Read them before changing the words.
 *
 * ## The story, top to bottom
 *
 * The page is an argument that builds, and each step has its own shape so it
 * never reads as a stack of similar sections:
 *
 * 1. **masthead**: the question (there are lots of ways to learn AI).
 * 2. **name**: the answer in four words. GWTH stands for Growth With Tech and
 *    Humans, set large beside a picture of a person directing and checking
 *    what AI makes. Technology and people together is the heart of the page.
 * 3. **reasons**: how we teach. One statement in display type, then three
 *    picture rows: what happens elsewhere, then what GWTH does about it.
 * 4. **build**: what you do. Three rising months, then a certificate set
 *    against the work itself, then the optional lessons as lists a visitor
 *    can scan for their own field.
 * 5. **uk**: where it is set.
 * 6. **government**: the outside evidence, as ONE section: the UK figures
 *    drawn as pictures, the side-by-side table, two independent views.
 * 7. **founder**: who writes it, as a letter. His own closing lesson, "it's
 *    people who make the difference, not the technology", is set in display
 *    type where it falls in the letter, never repeated as a pull quote.
 * 8. **price**, then **closing**.
 *
 * ## Kept exactly
 *
 * The founder's note is word for word (bead gwth-launch-l7ch; no employer,
 * client or product is named, on purpose). The press views are attributed
 * summaries, never quotations. The UK figures come from
 * `lib/data/uk-ai-context.ts` and carry `data-uk-figure`. Prices and dates
 * come from config and the billing module. The six `data-section` names the
 * browser spec looks for (masthead, reasons, government, uk, founder,
 * closing) are all still here, once each.
 *
 * ## Added from the home page
 *
 * - "Try the free lesson" beside the join button (the menu now leads with it).
 * - One sentence on the GWTH score, in the home page's words, shown only when
 *   the score flag is on.
 * - What happens when a pay-once pass ends, in the home page's words.
 *
 * WHY GWTH VIDEO GOES HERE, between the masthead and the name, when it exists
 * (narration why-gwth-video-r3 variant A). Until then render nothing there.
 *
 * Pictures: paper cutouts drawn by the latest Astra. Brief and prompts:
 * GWTH-launch-plan `completion/public-pages-fable/pictures/why-gwth/`.
 */

/** "£29" for whole pounds, "£7.50" otherwise. Read from config. */
function gbp(amount: number): string {
  return `£${Number.isInteger(amount) ? amount.toFixed(0) : amount.toFixed(2)}`
}

/** The pay-once launch offer, from the billing module, never typed. */
function launchOffer() {
  const window = getSaleWindow()
  return {
    sale: formatPence(PASS_PRICES_PENCE.courseSale),
    opensOn: formatUkDate(window.announcedOpenAt),
    endsOn: formatUkDate(new Date(window.saleEndsAt.getTime() - 1)),
  }
}

/**
 * A paper cutout picture and its dusk twin, swapped by theme with the shared
 * plate classes (the home page's `Plate` reads from `/home/paper/`; these live
 * in `/why-gwth/`). The hidden one is lazy unless the picture is `priority`.
 */
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
        src={`/why-gwth/${name}.jpg`}
        alt={alt}
        width={1536}
        height={1024}
        sizes={sizes}
        priority={priority}
        className={p.plateLight}
      />
      <Image
        src={`/why-gwth/${name}-dark.jpg`}
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

/** One picture row in "How we teach". */
interface Reason {
  /** Stable id: the row's `data-reason` hook and its anchor. */
  id: string
  title: string
  picture: string
  alt: string
  /** Shown first, in the quieter ink: usually what happens elsewhere. */
  opening: readonly string[]
  /** Shown second, in the full ink with a tick: what GWTH does about it. */
  points: readonly string[]
}

/**
 * Three reasons, each with a picture. The sentences are the old page's
 * (`REASONS` in `why-gwth-fde.tsx`), re-ordered so the first and third rows
 * read "elsewhere, then here"; the second opens on GWTH's own independence.
 */
const REASONS: readonly Reason[] = [
  {
    id: "clear-route",
    title: "A clear route, without the hype",
    picture: "one-clear-route",
    alt: "A paper cutout picture in two halves. On the left a person stands puzzled in front of a pinboard crowded with overlapping cards, labelled What next? On the right the same person walks up a short flight of steps, one lesson card after another, labelled One clear route.",
    opening: [
      "A lot of AI videos are made to win views, so they lean on dramatic claims about every new release, and many repeat each other. You're left to work out what's reliable and what to watch next.",
      "Teaching yourself with a chatbot can work, but when you're new to AI you may not yet know what to ask.",
    ],
    points: [
      "In GWTH, each lesson builds on the last, and we tell you plainly what a tool does well and where it falls short.",
      "GWTH shows you what to ask about, and teaches you how to check whether a source is reliable and how to test a new tool for yourself.",
    ],
  },
  {
    id: "independent",
    title: "Nobody pays us to recommend a tool",
    picture: "independent",
    alt: "A paper cutout scene: a person sits at a table with three different devices side by side and has slid one forward as the right one for the task in front of them. The labels read No sponsors and The tool that suits the job.",
    opening: [
      "We have no sponsors and no deals with AI companies, so we can point you to the tool that suits the job, whoever makes it.",
    ],
    points: [
      "Free courses from AI companies can be useful. GWTH teaches you to choose between tools and use them well.",
    ],
  },
  {
    id: "up-to-date",
    title: "Lessons updated as tools change",
    picture: "lessons-updated",
    alt: "A paper cutout picture in two halves. On the left a teacher studies a tangled diagram beside a computer, labelled Tools change. On the right she redraws it as a simple row of steps while a learner works beside her, labelled Lessons rewritten.",
    opening: [
      "AI changes quickly. A course written two or three years ago can recommend tools and methods that people have since stopped using.",
    ],
    points: [
      "When the tools change, or the best way to use them changes, we rewrite the lessons and add new ones, so you're learning what works now.",
    ],
  },
]

/**
 * What you build each month. Month 3 is the old page's sentence; the Month 2
 * detail is the home page's (`MONTH_STEPS` in `home-next.tsx`). Month 1 is
 * FamilyBot since 19 Nov 2026 (David: "FamilyBot, made core"; no lesson
 * builds the portfolio website the old page promised), described as its
 * `capstoneDescription` in config.
 */
const MONTHS = [
  {
    kicker: "Month 1",
    title: "FamilyBot",
    body: "It turns a family meeting recording into a list of jobs, a meal plan and a shopping list.",
  },
  {
    kicker: "Month 2",
    title: "A customer support chatbot",
    body: "It answers from a company's own documents.",
  },
  {
    kicker: "Month 3",
    title: "An AI consultant",
    body: "It interviews people and writes a plan for an organisation.",
  },
] as const

/**
 * Every optional field is named, as a list a visitor can scan for their own
 * (David, why-gwth round 1: "Add all the fields as people will be looking for
 * their own."). HR, marketing and sales are optional Month 2 lessons.
 */
const OPTIONAL_GROUPS = [
  {
    title: "AI in your own field",
    items: [
      "Finance",
      "Medicine",
      "Law",
      "Logistics",
      "Human resources (HR)",
      "Marketing",
      "Sales",
    ],
  },
  {
    title: "Going further",
    items: [
      "Local AI, which runs on your own computer",
      "Advanced AI-assisted coding",
      "Hardware that uses AI",
    ],
  },
  {
    title: "Helping a business",
    items: [
      "Lessons for AI transformation experts, who help a business, your own or someone else's, choose AI tools and start using them well",
    ],
  },
] as const

/** The everyday British material the worked examples use (old /about). */
const UK_EXAMPLES = [
  "NHS letters and appointments",
  "Council and benefits forms",
  "Workplace pensions",
  "A Self Assessment tax return",
  "School admissions",
  "UK employment rules",
] as const

/**
 * The comparison with the government's offer, row for row from the old page.
 * Its header comment there records why each cell says what it says.
 */
const COMPARISON_ROWS = [
  {
    dimension: "How long",
    boost: "Varies by course",
    hub: "Varies by course",
    gwth: "About five hours a week for three months, plus optional lessons",
  },
  {
    dimension: "Practical work",
    boost: "Varies by course",
    hub: "Varies by course",
    gwth: "A practical project in every lesson",
  },
  {
    dimension: "Who makes it",
    boost:
      "Technology companies including Google, Microsoft, Amazon, IBM and Salesforce",
    hub: "A mix of course providers",
    gwth: "Independent, with no sponsors or deals with AI companies",
  },
  {
    dimension: "How current",
    boost: "Check each course's latest update date",
    hub: "Check each course's latest update date",
    gwth: "Updated as the tools change",
  },
  {
    dimension: "A route through",
    boost: "Courses and a guide to getting started with AI in a business",
    hub: "Browse courses or follow a tailored learning journey",
    gwth: "Three months in which each lesson builds on the last",
  },
  {
    dimension: "At the end",
    boost: "A digital badge on some courses",
    hub: "Some offer certificates, some do not",
    gwth: "Real work you made yourself, to show people",
  },
] as const

/**
 * Two independent views, as attributed summaries with a link to each article.
 * Neither is a direct quotation (Sol copy check, 2026-10-20), so nothing here
 * is set in quotation marks or a blockquote.
 */
const PRESS_VIEWS = [
  {
    summary:
      "An opinion article argued that all 14 courses the government benchmarked come from US big technology companies, which makes the UK more dependent on them.",
    source: "Computer Weekly",
    url: "https://www.computerweekly.com/opinion/The-UK-governments-AI-skills-programme-betrays-UK-workers-and-our-digital-sovereignty",
  },
  {
    summary:
      "Jon Cardoso-Silva and Jeni Brown argued that the UK's AI training is a long list of courses with no clear route through them.",
    source: "LSE Impact Blog, February 2026",
    url: "https://blogs.lse.ac.uk/impactofsocialsciences/2026/02/17/the-uks-ai-training-ambition-deserves-better-than-a-course-directory/",
  },
] as const

/** The figures this page prints, by id in `lib/data/uk-ai-context.ts`. */
const UK_STAT_IDS = [
  "worker-confidence",
  "business-adoption",
  "adoption-depth",
] as const

/** The published documents behind the figures, each linked once. */
const UK_SOURCES = Array.from(
  new Map(
    UK_STAT_IDS.map((id) => {
      const source = ukFigureSource(id)
      return [source.id, source]
    })
  ).values()
)

/** "35%" -> 35, "1.6" -> 1.6. The drawings are sized from the module's value. */
function figureNumber(id: string): number {
  return Number.parseFloat(ukFigure(id).value)
}

/** One hundred dots with the first `filled` of them solid: "21 in 100". */
function HundredDots({ filled }: { filled: number }) {
  return (
    <div className={styles.dots} aria-hidden="true">
      {Array.from({ length: 100 }, (_, i) => (
        <span
          key={i}
          data-on={i < filled ? "" : undefined}
          style={{ "--i": i } as CSSProperties}
        />
      ))}
    </div>
  )
}

/** Two bars on one scale of 0 to 100, to show a change between two dates. */
function TwoBars({
  rows,
}: {
  rows: readonly { label: string; percent: number }[]
}) {
  return (
    <div className={styles.bars} aria-hidden="true">
      {rows.map((row) => (
        <div className={styles.barRow} key={row.label}>
          <span className={styles.barLabel}>{row.label}</span>
          <span className={styles.barTrack}>
            <span
              className={styles.barFill}
              style={{ width: `${row.percent}%` }}
            />
          </span>
        </div>
      ))}
    </div>
  )
}

/** Whole and part tiles: 1.6 is one full tile and six tenths of the next. */
function Tiles({ value }: { value: number }) {
  const whole = Math.floor(value)
  const part = Math.round((value - whole) * 100)
  return (
    <div className={styles.tiles} aria-hidden="true">
      {Array.from({ length: whole }, (_, i) => (
        <span className={styles.tile} key={i}>
          <span style={{ width: "100%" }} />
        </span>
      ))}
      {part > 0 && (
        <span className={styles.tile}>
          <span style={{ width: `${part}%` }} />
        </span>
      )}
    </div>
  )
}

/** Line icons for the two cards in "Proof of what you can do". */
function VersusIcon({ kind }: { kind: "certificate" | "work" }) {
  return (
    <svg
      width={30}
      height={30}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={styles.versusIcon}
    >
      {kind === "certificate" ? (
        <>
          <rect x="3" y="4" width="18" height="12.5" rx="1.2" />
          <path d="M6.5 8h7M6.5 11h4.5" />
          <circle cx="16.5" cy="12" r="2.2" />
          <path d="M15.2 14v6l1.3-1 1.3 1v-6" />
        </>
      ) : (
        <>
          <rect x="3" y="7.5" width="12" height="13" rx="1.2" />
          <path d="M8 7.5V4.7a1.2 1.2 0 0 1 1.2-1.2h10.6A1.2 1.2 0 0 1 21 4.7v10.6a1.2 1.2 0 0 1-1.2 1.2H15" />
          <path d="M6 17.5v-2.5M9 17.5v-5M12 17.5v-3.5" />
        </>
      )}
    </svg>
  )
}

export type WhyGwthNextProps = {
  /** True once GWTH is on sale (`isSelling()`). Only the buttons change. */
  selling?: boolean
  /**
   * Mentions the GWTH score, in the home page's words. Defaults to the
   * `ENABLE_GWTH_SCORE` flag, so the page never describes a score the course
   * does not show.
   */
  showScore?: boolean
}

export function WhyGwthNext({
  selling = false,
  showScore = ENABLE_GWTH_SCORE,
}: WhyGwthNextProps = {}) {
  const offer = launchOffer()
  // From 14 December joining starts on /pricing, as the header's "Join the
  // course" does; before it, the waitlist. Never a lab (David: "We don't want
  // to send them back to the lab to procrastinate further").
  const joinCta = selling
    ? { href: "/pricing", label: "Join the course" }
    : { href: "/waitlist", label: "Join the waitlist" }

  const stats: readonly {
    id: (typeof UK_STAT_IDS)[number]
    drawing: ReactNode
    label: ReactNode
  }[] = [
    {
      id: "worker-confidence",
      drawing: <HundredDots filled={Math.round(figureNumber("worker-confidence"))} />,
      label: (
        <>
          of UK adults in work say they feel confident using AI at work, in a
          survey carried out in 2024
        </>
      ),
    },
    {
      id: "business-adoption",
      drawing: (
        <TwoBars
          rows={[
            {
              label: "Late 2023",
              percent: figureNumber("business-adoption-2023"),
            },
            { label: "June 2026", percent: figureNumber("business-adoption") },
          ]}
        />
      ),
      label: (
        <>
          of UK businesses with ten or more staff used at least one AI
          technology in June 2026, up from around{" "}
          <span data-uk-figure="business-adoption-2023">
            {ukFigure("business-adoption-2023").value}
          </span>{" "}
          in late 2023
        </>
      ),
    },
    {
      id: "adoption-depth",
      drawing: <Tiles value={figureNumber("adoption-depth")} />,
      label: (
        <>
          AI technologies used, on average, by a UK business with ten or more
          staff that has started using AI. The ONS calls this adoption
          relatively shallow.
        </>
      ),
    },
  ]

  return (
    <div className={p.shell}>
      {/* 1. The question. */}
      <section className={styles.hero} data-section="masthead">
        <div className={p.page}>
          <div className={styles.heroGrid}>
            <h1 className={styles.heroTitle}>
              <span>Why learn AI </span>
              <span>
                <em>with GWTH</em>
              </span>
            </h1>
            <div className={styles.heroCopy}>
              <p className={p.standfirst}>
                There are lots of ways to learn AI. You can watch YouTube
                videos, take a free course from an AI company, or pay for
                expensive training made just for you. Here&apos;s why we think
                GWTH is a better choice.
              </p>
              <div className={p.actions}>
                <Link href={joinCta.href} className={p.buttonSolid}>
                  {joinCta.label}
                </Link>
                <Link href="/start-here" className={p.buttonOutline}>
                  Try the free lesson
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. The answer in four words: the name, beside a person directing and
          checking what AI makes. */}
      <section className={styles.name} data-section="name">
        <div className={p.page}>
          <div className={styles.nameGrid}>
            <figure className={`${p.plate} ${styles.namePicture}`}>
              <Picture
                name="tech-and-humans"
                priority
                alt="A paper cutout scene: a person at a desk checks a small model of a web page against a checklist, beside the laptop that made it. The labels read AI writes the code and You direct and check."
                sizes="(max-width: 1023px) 100vw, 640px"
              />
            </figure>
            <div className={styles.nameCopy}>
              <h2 className={styles.nameTitle}>
                <span className={styles.nameLead}>GWTH stands for </span>
                <span className={styles.acrostic}>
                  <span>Growth </span>
                  <span>With </span>
                  <span>
                    Tech <em>and</em>{" "}
                  </span>
                  <span>Humans</span>
                </span>
              </h2>
              <p>
                GWTH is a practical AI course for work and everyday life in the
                UK, taught over three months at about five hours a week.
                You&apos;ll learn to use AI on real tasks.
              </p>
              <p>
                You never need to know how to code.
                When you build apps, AI writes the code, and we show you how to
                direct it and check it.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. How we teach: one statement, then three contrasts with pictures. */}
      <section className={p.section} data-section="reasons" id="reasons">
        <div className={p.page}>
          <div className={p.sectionHead}>
            <h2 className={p.sectionTitle}>How we teach</h2>
          </div>

          <div
            className={styles.statement}
            id="plain-english"
            data-reason="plain-english"
          >
            <div>
              <h3 className={styles.rowTitle}>
                Plain English, and only what you need
              </h3>
              <p className={styles.body}>
                The AI industry is often bad at explaining things simply. We
                explain each term in plain English the first time you need it,
                and we only teach what will improve your skills.
              </p>
            </div>
            <p className={styles.statementLine}>
              Your time is worth more than the price of any course, so we work
              hard <em>not to waste it</em>.
            </p>
          </div>

          {REASONS.map((reason, index) => (
            <InView
              key={reason.id}
              id={reason.id}
              className={`${styles.row} ${styles.rise}`}
              data-reason={reason.id}
              data-flip={index % 2 === 1 ? "" : undefined}
            >
              <figure className={`${p.plate} ${styles.rowPicture}`}>
                <Picture
                  name={reason.picture}
                  alt={reason.alt}
                  sizes="(max-width: 1023px) 100vw, 600px"
                />
              </figure>
              <div className={styles.rowCopy}>
                <h3 className={styles.rowTitle}>{reason.title}</h3>
                {reason.opening.map((line) => (
                  <p className={styles.body} key={line}>
                    {line}
                  </p>
                ))}
                <ul className={styles.gwthList}>
                  {reason.points.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              </div>
            </InView>
          ))}
        </div>
      </section>

      {/* 4. What you do: build, and leave with the work. */}
      <section className={p.section} data-section="build" id="build">
        <div className={p.page}>
          <div className={p.sectionHead}>
            <h2 className={p.sectionTitle}>
              You learn by <em>making things</em>
            </h2>
          </div>
          <div className={styles.make}>
            <figure className={`${p.plate} ${styles.rowPicture}`}>
              <Picture
                name="hands-on"
                alt="A paper cutout scene: a person at a desk, enjoying herself, drops a small card into a tray beside the laptop she has built a tool on. The labels read Build your own tools and Fees you no longer pay."
                sizes="(max-width: 1023px) 100vw, 600px"
              />
            </figure>
            <div>
              <p className={styles.makeLead} id="hands-on" data-reason="hands-on">
                Most of the course is hands-on, because you learn to use AI by
                using it. The projects are meant to be interesting, and many
                of them build tools you might otherwise pay a monthly fee for.
                There&apos;s even a fun tracker that adds up the monthly fees
                you no longer pay.
              </p>
              <ol
                className={styles.months}
                id="what-you-build"
                data-reason="what-you-build"
                aria-label="What you build each month"
              >
                {MONTHS.map((month, index) => (
                  <li key={month.kicker} data-step={index + 1}>
                    <p className={styles.monthKicker}>{month.kicker}</p>
                    <h3 className={styles.monthTitle}>{month.title}</h3>
                    <p className={styles.monthBody}>{month.body}</p>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          <InView
            className={`${styles.proof} ${styles.rise}`}
            id="proof"
            data-reason="proof"
          >
            <div>
              <h3 className={styles.rowTitle}>Proof of what you can do</h3>
              <p className={styles.body}>
                Every lesson leaves you with real work you can show people. So
                the proof GWTH gives you is the work itself.
              </p>
              {showScore && (
                <p className={styles.body} data-testid="why-score">
                  You also have a GWTH score, a number out of 100. It combines
                  the core lessons you&apos;ve passed, your quiz results and
                  your best marks for the three monthly projects.
                </p>
              )}
            </div>
            <div className={styles.versus}>
              <div className={`${styles.versusCard} ${styles.versusThen}`}>
                <VersusIcon kind="certificate" />
                <h4>A certificate from six months ago</h4>
                <p>
                  It tells you what somebody once passed, not what they can do
                  today.
                </p>
              </div>
              <div className={`${styles.versusCard} ${styles.versusNow}`}>
                <VersusIcon kind="work" />
                <h4>The work you made</h4>
                <p>
                  Your documents and tools, which you can show to anyone who
                  wants to see what you can do.
                </p>
              </div>
            </div>
          </InView>

          <div
            className={styles.optional}
            id="optional-lessons"
            data-reason="optional-lessons"
          >
            <div>
              <h3 className={styles.rowTitle}>
                Optional lessons for your field
              </h3>
              <p className={styles.body}>
                You decide which optional lessons to take, so the course fits
                the work you do.
              </p>
              <p className={styles.body}>
                Most optional lessons open with Month 2 around{" "}
                {LATER_MONTHS_OPEN.month2} and Month 3 around{" "}
                {LATER_MONTHS_OPEN.month3}.
              </p>
            </div>
            <div className={styles.optionalGroups}>
              {OPTIONAL_GROUPS.map((group) => (
                <div key={group.title}>
                  <h4 className={styles.groupTitle}>{group.title}</h4>
                  <ul className={styles.tickList}>
                    {group.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 5. Where it is set. */}
      <section className={p.section} data-section="uk" id="uk">
        <div className={p.page}>
          <div className={styles.uk}>
            <div>
              <h2 className={p.sectionTitle}>
                Written for <em>the UK</em>
              </h2>
              <p className={styles.body}>
                The skills work anywhere, but the rules and forms don&apos;t.
                You&apos;ll practise with examples from life here.
              </p>
              <p className={styles.body}>
                An answer that&apos;s right in another country can be wrong
                here, so you&apos;ll also learn to check what AI tells you
                against the rules that apply to you.
              </p>
            </div>
            <ul className={styles.slips} aria-label="Examples you practise with">
              {UK_EXAMPLES.map((example) => (
                <li key={example}>{example}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* 6. The outside evidence, as ONE section (David, 2026-09-28: "The
          government comparison becomes one section"). */}
      <section className={styles.evidence} data-section="government" id="government">
        <div className={p.page}>
          <div className={styles.evidenceHead}>
            <h2 className={p.sectionTitle}>
              How GWTH compares with the government&apos;s AI Skills Boost
            </h2>
            <div>
              <p className={styles.body}>
                The government&apos;s free AI Skills Boost aims to train 10
                million UK workers by 2030. It offers free AI courses of
                different lengths and levels, made by technology companies
                including Google, Microsoft, Amazon, IBM and Salesforce. They
                cover what AI is, how to write instructions for it and how to
                use it responsibly, and some courses give you a digital badge
                when you finish. The government&apos;s AI Skills Hub also lists
                more than 600 other courses from a mix of providers.
              </p>
              <p className={styles.body}>
                We agree with the aim, and a short foundation course is a good
                start. GWTH is a natural next step: three months of teaching
                and practice so you can use AI in your own work.
              </p>
            </div>
          </div>

          <h3 className={styles.subTitle}>Where the UK is now</h3>
          <InView className={styles.stats}>
            {stats.map((stat) => (
              <div className={styles.stat} key={stat.id}>
                <strong className={styles.statValue} data-uk-figure={stat.id}>
                  {ukFigure(stat.id).value}
                </strong>
                <div className={styles.drawing}>{stat.drawing}</div>
                <p className={styles.statLabel}>{stat.label}</p>
                <p className={styles.statSource}>{ukFigureCitation(stat.id)}</p>
              </div>
            ))}
          </InView>
          <p className={styles.sourcesLine} data-testid="why-gwth-sources">
            Figures from{" "}
            {UK_SOURCES.map((source, i) => (
              <span key={source.id}>
                {i > 0 ? " and " : ""}
                <a href={source.url} target="_blank" rel="noopener noreferrer">
                  {source.title}
                </a>{" "}
                ({source.releasedLabel})
              </span>
            ))}
            .
          </p>

          <h3 className={styles.subTitle}>Side by side</h3>
          <div className={styles.tableWrap}>
            <table className={styles.compTable}>
              <thead>
                <tr>
                  <th scope="col">
                    <span className={styles.srOnly}>Compared on</span>
                  </th>
                  <th scope="col">
                    AI Skills Boost
                    <span>Free AI courses</span>
                  </th>
                  <th scope="col">
                    AI Skills Hub
                    <span>600+ other courses</span>
                  </th>
                  <th scope="col" className={styles.cellGwth}>
                    GWTH
                  </th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON_ROWS.map((row) => (
                  <tr key={row.dimension}>
                    <th scope="row">{row.dimension}</th>
                    <td>{row.boost}</td>
                    <td>{row.hub}</td>
                    <td className={styles.cellGwth}>{row.gwth}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* The phone layout of the table above (CSS shows one or the
                other). data-copy-duplicate tells the copy gate it has already
                read these words. */}
            <div
              className={styles.compStack}
              data-copy-duplicate="phone layout of the Side by side table"
            >
              {COMPARISON_ROWS.map((row) => (
                <div key={row.dimension} className={styles.compStackRow}>
                  <h4>{row.dimension}</h4>
                  <dl>
                    {row.boost === row.hub ? (
                      <div>
                        <dt>AI Skills Boost and AI Skills Hub</dt>
                        <dd>{row.boost}</dd>
                      </div>
                    ) : (
                      <>
                        <div>
                          <dt>AI Skills Boost</dt>
                          <dd>{row.boost}</dd>
                        </div>
                        <div>
                          <dt>AI Skills Hub</dt>
                          <dd>{row.hub}</dd>
                        </div>
                      </>
                    )}
                    <div className={styles.stackGwth}>
                      <dt>GWTH</dt>
                      <dd>{row.gwth}</dd>
                    </div>
                  </dl>
                </div>
              ))}
            </div>
          </div>

          <h3 className={styles.subTitle}>
            Independent views on the government&apos;s AI training
          </h3>
          <div className={styles.views}>
            {PRESS_VIEWS.map((item) => (
              <figure key={item.source} className={styles.view}>
                <p>{item.summary}</p>
                <figcaption>
                  <a href={item.url} target="_blank" rel="noopener noreferrer">
                    {item.source}
                  </a>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* 7. Who writes it. David's own words, exactly as on the old page
          (rewritten 2026-09-30, bead gwth-launch-l7ch). No employer, client or
          product is named, on purpose. Do not edit the note for layout. */}
      <section className={p.section} data-section="founder" id="founder">
        <div className={p.page}>
          <div className={styles.founder}>
            <div className={styles.founderSide}>
              <h2 className={p.sectionTitle}>Who writes the course</h2>
              <figure className={`${p.plate} ${styles.founderPicture}`}>
                <Picture
                  name="getting-started"
                  alt="A paper cutout scene at a kitchen table: one person sits beside an older person who is using a laptop for themselves, and both look pleased."
                  sizes="(max-width: 1023px) 100vw, 440px"
                />
              </figure>
            </div>
            <div className={styles.letter} data-testid="founder-note">
              <p className={styles.letterLabel}>A note from the founder</p>
              <p>
                I&apos;ve spent 25 years as a consultant and solution
                architect. The title means very little to most people, so in
                plain terms: I helped companies work out how their computer
                systems should fit together, then build them. I was lucky
                enough to work with some of the world&apos;s largest
                companies, start-ups, and UK brands you&apos;ll know, including
                most of the supermarkets.
              </p>
              <p>
                I&apos;ve worked with AI since long before you could chat with
                it. I&apos;ve helped factories use it to run and check
                production, and helped companies sell to businesses and the
                public online. More and more, people ask an AI assistant to
                find a product and buy it for them, so I&apos;ve helped
                companies make sure those assistants can find what they sell
                and place the order. I&apos;ve used AI in marketing and
                advertising, and to speed up everyday office work. I&apos;ve
                set up very large systems that let AI answer questions from a
                company&apos;s own documents, and AI agents that carry out
                tasks on their own. I still try new tools as they come out, so
                what I teach comes from using them myself, mistakes included.
              </p>
              <p>
                What I enjoy most, though, is teaching, and getting people
                excited about what AI can do for them. I&apos;ve helped my
                children, friends and grandparents get started, including some
                who were quite sure this wasn&apos;t for them. I&apos;ve also
                sat with the heads of large companies working out their plans
                for AI. Both groups taught me the same thing:{" "}
                <span className={styles.letterLine}>
                  it&apos;s people who make the difference, not the technology.
                </span>
              </p>
              <p>
                So GWTH starts with what people actually use AI for. I work out
                the best way to use AI for each task, and keep updating the
                course as new tools, models and ways of working arrive. AI has
                made me far more productive, and if even a small share of
                people in the UK learn to use it well, I think we&apos;ll all
                be better off. I&apos;d like to help you be one of them.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 8. The price: each price stated once, simply, with no sums or totals
          (David, why-gwth round 1). */}
      <section className={p.section} data-section="price" id="price">
        <div className={p.page}>
          <div className={p.sectionHead}>
            <h2 className={p.sectionTitle}>The price</h2>
          </div>
          <p className={styles.lead}>
            We&apos;ve built GWTH mainly for people paying for themselves.
          </p>
          <div className={styles.prices} data-reason="price">
            <div className={styles.priceCard} data-testid="price-monthly">
              <p>
                <strong className={styles.priceFigure}>
                  {gbp(COURSE_MONTHLY_PRICE)} a month
                </strong>{" "}
                for course access, from {offer.opensOn}. You can stop at any
                time.
              </p>
              <p>
                After your first three months the course doesn&apos;t end,
                because we keep updating it: your subscription continues at{" "}
                {gbp(ONGOING_MONTHLY_PRICE)} a month unless you cancel.
              </p>
            </div>
            <div className={styles.priceCard} data-testid="price-once">
              <p>
                <strong className={styles.priceFigure}>
                  {offer.sale} once
                </strong>{" "}
                for the whole three-month course, for yourself or as a gift, if
                you buy between {offer.opensOn} and {offer.endsOn}.
              </p>
              <p>
                It never renews. After three months, your access to the course
                lessons stops, and you only pay again if you choose to
                subscribe.
              </p>
            </div>
          </div>
          <p className={styles.priceMore}>
            The <Link href="/pricing">pricing page</Link> has the details.
          </p>
        </div>
      </section>

      {/* 9. Join, on this page. */}
      <section className={styles.closing} data-section="closing">
        <div className={p.page}>
          <div className={styles.closingBox}>
            <h2 className={styles.closingTitle}>
              <span>Start building </span>
              <span>
                <em>with AI.</em>
              </span>
            </h2>
            <div>
              <p className={styles.closingBody}>
                From {offer.opensOn}, you can join the course, for yourself or
                as a gift.
              </p>
              <div className={p.actions}>
                <Link href={joinCta.href} className={p.buttonSolid}>
                  {joinCta.label}
                </Link>
                {selling ? (
                  <Link href="/gift" className={p.buttonOutline}>
                    Give it as a gift
                  </Link>
                ) : (
                  <Link href="/start-here" className={p.buttonOutline}>
                    Try the free lesson
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
