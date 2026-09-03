import Link from "next/link"
import { COURSE_MONTHLY_PRICE, ONGOING_MONTHLY_PRICE } from "@/lib/config"
import { Plate } from "@/components/marketing/paper/plate"
import p from "@/components/marketing/paper/paper.module.css"
import styles from "./home-fde.module.css"

/**
 * The home page in the paper-first register (N12, 2026-09-03), built to the
 * artboard David approved in the N9 design round (annex 15: HN2L light /
 * HN3D dark, "The gap is not access. It is depth."). Institution-first
 * proposition on OpenAI's Enterprise Signals evidence and CIPD's own 2026
 * survey; every figure carries its source. The six-blocks plate is the I2
 * "stripped" image with the X6 key rendered by the PAGE (image-text-rules).
 *
 * Copy rules: British English, sentence case, no em or en dashes, GBP only.
 */

/** Evidence cards. `source` is shown; `href` links it. */
export const ARGUMENT = [
  {
    kicker: "Figure 01",
    value: "Two thirds and one third",
    body: "More than two thirds of HR professionals put AI skills at the top of their development priorities. Only one third of organisations have given their staff AI training.",
    source: "CIPD Ireland with the University of Limerick, HR Practices survey of 330 HR professionals, May 2026",
    href: "https://www.rte.ie/news/business/2026/0520/1574248-cipd-survey-on-ai/",
  },
  {
    kicker: "Figure 02",
    value: "3.5 times",
    body: "The firms using AI most deeply, the ones OpenAI calls frontier firms, use three and a half times as much AI per worker as typical firms, up from twice as much a year earlier. Only 36% of that gap is volume. The rest is deeper, more capable use.",
    source: "OpenAI, How frontier firms are pulling ahead (B2B Signals), May 2026",
    href: "https://openai.com/index/introducing-b2b-signals/",
  },
  {
    kicker: "Figure 03",
    value: "The missing floor",
    body: "Short targeted courses assume a baseline that is not there, and the trainer spends the day building it instead.",
    source: "Our argument, in one line",
    href: "/why-gwth",
  },
] as const

/**
 * The six building blocks, in the order the tiles sit in the photograph
 * (three across, two down). GWTH's names for OpenAI's six use case
 * primitives: research, content creation, ideation and strategy, coding,
 * data analysis, automation. The key under the plate uses `name` only.
 */
export const SIX_BLOCKS = [
  { n: "01", name: "Research", body: "Find, compare and verify anything, with the citation habit built in." },
  { n: "02", name: "Content", body: "Write, design and communicate in your own voice, not the machine's." },
  { n: "03", name: "Thinking", body: "Plan, decide and learn faster without handing over the judgement." },
  { n: "04", name: "Building", body: "Make your first genuinely useful thing without writing code." },
  { n: "05", name: "Data", body: "Ask questions of a spreadsheet and know when the answer is wrong." },
  { n: "06", name: "Automation", body: "Take the repetitive half of the week off your own desk." },
] as const

const INSTITUTION = [
  {
    title: "A curated edition",
    body: "You choose which lessons your people take, and add your own.",
  },
  {
    title: "A pass mark you set",
    body: "The floor is yours, not ours, and it is graded on our server.",
  },
  {
    title: "Tutor visibility",
    body: "Your tutors see who has met the baseline before the room starts.",
  },
  {
    title: "A verified record",
    body: "Each learner gets a record they can show, and it decays if they stop.",
  },
] as const

export const PRIMITIVES_URL =
  "https://openai.com/business/guides-and-resources/identifying-and-scaling-ai-use-cases/"

export function HomeFde() {
  return (
    <div className={p.shell}>
      <section className={styles.hero} data-section="hero">
        <div className={p.page}>
          <div className={styles.heroGrid}>
            <h1 className={styles.heroTitle}>
              <span>The gap is not </span>
              <span>
                access. It is <em>depth</em>.
              </span>
            </h1>
            <div>
              <p className={p.standfirst}>
                Your members have already used AI. Very few have the
                foundation to use it well, and the gap between the people who
                do and the rest is widening, not closing. GWTH is the three
                month applied foundation your people complete before your own
                training lands.
              </p>
              <div className={p.actions}>
                <Link href="/contact" className={p.buttonSolid}>
                  Book a walkthrough
                </Link>
                <a href="#six-building-blocks" className={p.buttonOutline}>
                  See the six building blocks
                </a>
              </div>
            </div>
          </div>

          {/* The one saturated thing on the page. No frame, no tint, 8px. */}
          <figure className={`${p.plate} ${styles.heroPlate}`} id="six-building-blocks">
            <Plate
              name="six-blocks"
              alt="Six square paper tiles in two rows of three, each carrying one cut-paper symbol: a magnifying glass, a fountain pen nib, a lightbulb, a stack of bricks, a bar chart and a cog. A hand is placing the sixth tile."
              priority
              sizes="(max-width: 1180px) 100vw, 1140px"
            />
            {/* X6: the page labels the tiles in the picture's own pattern,
                three across at every width. Never collapse this grid. */}
            <figcaption className={styles.plateKey} data-testid="six-blocks-key">
              {SIX_BLOCKS.map((block) => (
                <span key={block.n}>{block.name}</span>
              ))}
            </figcaption>
          </figure>
          <div className={p.plateMeta}>
            <p>Three months · Five hours a week · Assessed throughout</p>
            <p>Independent. No sponsors. No vendor partnerships.</p>
          </div>
        </div>
      </section>

      <section className={p.section} data-section="argument">
        <div className={p.page}>
          <div className={p.sectionHead}>
            <h2 className={p.sectionTitle}>Why a foundation, and why now</h2>
            <p className={p.sectionMeta}>The argument</p>
          </div>
          <div className={p.cards3}>
            {ARGUMENT.map((item) => (
              <article className={p.card} key={item.kicker} data-testid="argument-card">
                <p className={p.cardKicker}>{item.kicker}</p>
                <h3 className={p.cardValue}>{item.value}</h3>
                <p className={p.cardBody}>{item.body}</p>
                <p className={p.cardSource}>
                  {item.href.startsWith("http") ? (
                    <a href={item.href} rel="noopener noreferrer" target="_blank">
                      {item.source}
                    </a>
                  ) : (
                    <Link href={item.href}>{item.source}</Link>
                  )}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={p.section} data-section="blocks">
        <div className={p.page}>
          <div className={p.sectionHead}>
            <h2 className={p.sectionTitle}>Six building blocks</h2>
            <p className={p.sectionMeta}>All three months</p>
          </div>
          <div className={p.cards3}>
            {SIX_BLOCKS.map((block) => (
              <article className={p.card} key={block.n} data-testid="block-card">
                <p className={p.cardKicker}>{block.n} · Block</p>
                <h3 className={p.cardTitle}>{block.name}</h3>
                <p className={p.cardBody}>{block.body}</p>
              </article>
            ))}
          </div>
          <p className={p.attribution}>
            The six blocks follow the{" "}
            <a href={PRIMITIVES_URL} rel="noopener noreferrer" target="_blank">
              six common ways of using AI at work
            </a>{" "}
            that OpenAI found across its customers: research, content
            creation, ideation and strategy, coding, data analysis and
            automation. The names above are ours.
          </p>
        </div>
      </section>

      <section className={p.band} data-section="institution">
        <div className={`${p.page} ${styles.institutionGrid}`}>
          <figure className={p.plate}>
            <Plate
              name="the-gap"
              alt="Two torn sheets of paper side by side, one mint green and one cream, with a hand placing a small jade bookmark on the cream sheet."
              sizes="(max-width: 64rem) 100vw, 420px"
            />
          </figure>
          <div>
            <h2 className={p.sectionTitle}>What an institution gets</h2>
            <div className={p.featureGrid}>
              {INSTITUTION.map((item) => (
                <div className={p.feature} key={item.title}>
                  <h3>{item.title}</h3>
                  <p>{item.body}</p>
                </div>
              ))}
            </div>
            <div className={p.actions}>
              <Link href="/contact" className={p.buttonSolid}>
                Book a walkthrough
              </Link>
              <Link href="/for-institutions" className={p.buttonOutline}>
                How an institution edition works
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className={p.closing} data-section="individuals">
        <div className={p.page}>
          <h2 className={p.sectionTitle}>Learning on your own?</h2>
          <p className={p.standfirst}>
            The same three months, five hours a week. £{COURSE_MONTHLY_PRICE} a
            month while the teaching runs, then £{ONGOING_MONTHLY_PRICE.toFixed(2)}{" "}
            a month to stay current, and you can stop either at any time. Join
            the waitlist and we will tell you when the next intake opens.
          </p>
          <div className={p.actions}>
            <Link href="/waitlist" className={p.buttonSolid}>
              Join the waitlist
            </Link>
            <Link href="/pricing" className={p.buttonOutline}>
              See pricing
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
