import type { ReactNode } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  CURRICULUM,
  JOURNEYS,
  RESEARCH_SOURCES,
  UK_STATS,
} from "@/components/marketing/data"
import styles from "./home-fde.module.css"

/**
 * Anchor points where an optional explainer block (W12) may be injected on the
 * home layout. Used by the embed-demo review route and, once David picks, by
 * the live wiring. `replace-quote` swaps the centred pull quote for the video.
 */
export type ExplainerPlacement =
  | "after-hero"
  | "after-curriculum"
  | "before-pricing"
  | "replace-quote"

/** Props for {@link HomeFde}. All optional so the live `/` renders unchanged. */
export interface HomeFdeProps {
  /**
   * Optional explainer block injected at {@link HomeFdeProps.explainerAt}.
   * Omit entirely for the live homepage (the default, byte-for-byte unchanged).
   */
  explainer?: ReactNode
  /** Where `explainer` is inserted. Ignored when `explainer` is omitted. */
  explainerAt?: ExplainerPlacement
}

/** FAQ entries shown on the FDE-register homepage variant. */
const faqs = [
  {
    q: "Do I need to know how to code?",
    a: "No. GWTH starts in plain English. You learn how to use AI well first, then build your way into more capable workflows and AI-assisted coding when it becomes useful.",
  },
  {
    q: "How does progress tracking work during beta?",
    a: "Beta shows plain lesson, project, and refresh progress for invited learners.",
  },
  {
    q: "Is there still proof of work?",
    a: "Yes. The beta emphasis is completed lessons, Capstone projects, and portfolio evidence.",
  },
  {
    q: "How much time does the course take?",
    // No "try a free lab first" while /labs is gated for the CIPD demo (W25).
    // The hero CTA was removed for that reason in W27; an FAQ answer telling
    // the reader to do something they cannot do is the same defect in prose.
    // The pricing band's £0 line stays: it describes the pricing model rather
    // than offering a link.
    a: "The main course is designed around roughly five hours a week for three months.",
  },
]

/** Colour-block flavours cycled across the journey card headers, FDE style. */
const CARD_FLAVOURS = [styles.flvTeal, styles.flvMoss, styles.flvRust]

/**
 * Short, punchy journey blurbs for this variant, keyed by journey number.
 * The shared JOURNEYS data keeps the long-form copy for the live homepage;
 * this page trades detail for pace so nine cards stay scannable.
 */
const JOURNEY_BLURBS: Record<string, string> = {
  "01": "The defence is fluency. Build real AI skill in three months and walk in with proof, not promises.",
  "02": "Five hours a week and a portfolio of real projects. Most UK workers still lack confidence with AI: that gap is your opening. Month 1 is your own CV, your own interviews, your own week.",
  "03": "No developer, no consultant. Build the automations and tools your business needs yourself, and the ones that quietly run your household while you are at it.",
  "04": "AI will be part of your children's working lives whatever they end up doing. Learn it properly first, with no jargon and nothing to install, then sit down and show them.",
  "05": "You use AI daily but suspect there is more. There is: design with it, automate with it, and save more than the course costs on your AI subscriptions.",
  "06": "AI fluency is one of the highest-premium skills in the UK market. Show up to your next salary conversation with proof.",
  "07": "Every lesson, Capstone project and refresh leaves a practical progress trail: no PDFs, no stale certificates.",
  "08": "Three months gets you current. After that, £7.50 a month keeps you there with weekly summaries and refreshed lessons.",
  "09": "Your competitors are already moving. Five hours a week makes you the one who knows what to build next.",
}

/** UK sources cited beside the stats list, index-matched to UK_STATS. */
const STAT_SOURCES = ["DSIT, 2025", "ONS, 2025", "ONS, 2025"]

/**
 * Variant B of the homepage redesign comparison: the GWTH homepage rebuilt
 * in the visual register of the FDE.build journal mockup. Drenched dark-teal
 * hero with a stacked serif headline and ochre accents, paper-cream
 * surfaces, colour-block card tops, mono metadata lines, a centred pull
 * quote, curriculum presented as journal issues, and a teal dispatch band
 * for pricing. Serif body throughout (Source Serif 4), JetBrains Mono for
 * labels. Full light/dark parity via scoped palette variables.
 */
export function HomeFde({ explainer, explainerAt }: HomeFdeProps = {}) {
  return (
    <div className={styles.shell}>
      <section className={styles.hero} data-section="hero">
        <div className={styles.page}>
          <div className={styles.heroInner}>
            <h1 className={styles.heroTitle}>
              <span>Stop watching</span>
              <span>AI change</span>
              <span>
                the world. <em>Build.</em>
              </span>
            </h1>
            <div className={styles.heroRight}>
              <p className={styles.heroStandfirst}>
                A three-month applied AI course for UK adults: build apps,
                automate workflows, research faster, and analyse data in plain
                English. Every lesson and project leaves practical progress
                and portfolio evidence.
              </p>
              <p className={styles.heroByline}>
                UK applied AI · 5 hours a week · 3 months
              </p>
              {/* "Try a free lab" is deliberately absent while /labs is gated
                  to David's account for the CIPD demo (W25). Advertising a
                  call to action a visitor cannot reach is worse than one
                  button. To bring it back, restore the buttonOutline Link to
                  /labs below "Join waitlist" (bead gwth-launch-ynk). */}
              <div className={styles.heroActions}>
                <Link href="/waitlist" className={styles.buttonSolid}>
                  Join waitlist
                </Link>
              </div>
            </div>
          </div>
          <div className={styles.heroFoot}>
            <p>Independent. No sponsors. No vendor partnerships.</p>
            <p>Built around {RESEARCH_SOURCES.slice(0, 3).join(" · ")}</p>
          </div>
        </div>
      </section>

      {explainer && explainerAt === "after-hero" ? explainer : null}

      {/* Cutout-register cover plate (2026-07-06 imagery, David's picks): full-width
          landscape under the tour video, introduced by a line of copy so two
          media blocks are not stacked without connective text (W23). */}
      <div className={styles.coverBand} data-section="cover-image">
        <div className={styles.page}>
          <div className={styles.coverLead}>
            <p className={styles.mono}>What building looks like</p>
            <p className={styles.coverLeadText}>
              Everything here ends up as something you can open, run and hand
              to somebody else. It stays yours after the lesson finishes, and
              most of it keeps working without you.
            </p>
          </div>
          {/*
            Every home figure carries `sizes` mirroring the width its column
            actually renders at. Without it next/image assumes 100vw and picks
            a candidate from the viewport alone, so a 390px phone was pulling
            the w=3840 variant of the issues image (209 KB) into a 348px slot
            when the w=640 variant (24 KB) would do. About 250 KB of wasted
            payload on a mobile home-page load (W26).
          */}
          <figure className={`${styles.figure} ${styles.figureCover}`}>
            <Image
              src="/home/home-build-desk-c.png"
              alt="A person photographed from above working at a pastel-blue paper laptop, surrounded by sticker doodles of gears, a lightbulb, a database, and an app chart"
              width={1376}
              height={768}
              sizes="(max-width: 768px) 100vw, 1100px"
            />
          </figure>
        </div>
      </div>

      <section className={styles.section} data-section="journey">
        <div className={styles.page}>
          <div className={styles.sectionHead}>
            <h2 className={styles.sectionTitle}>Nine journeys. One proof.</h2>
            <p className={styles.mono}>Why people join</p>
          </div>
          <p className={styles.sectionLead}>
            Whether you are reskilling, running a small business, or trying to
            keep your team ahead, the end point is the same: practical work
            and portfolio evidence someone else can inspect. Month 1 starts
            with personal projects on purpose. They matter to everybody and
            they are good fun, which is what carries people through the first
            few weeks. After that you choose the lessons that fit your own
            skills and where you want to get to.
          </p>
          <figure className={`${styles.figure} ${styles.figureInset}`}>
            <Image
              src="/home/home-nine-journeys-c.png"
              alt="A person holding a cream credential card with a gold star seal, joined by dashed ink lines to nine sticker cards with doodle motifs"
              width={1264}
              height={848}
              sizes="(max-width: 768px) 100vw, 840px"
            />
            <figcaption className={styles.figCaption}>
              Nine ways in, one proof at the end.
            </figcaption>
          </figure>
          <div className={styles.cardsRow}>
            {JOURNEYS.slice(0, 9).map((journey, index) => (
              <Link
                href={journey.href}
                className={styles.card}
                data-testid="journey-card"
                key={journey.n}
              >
                <div
                  className={`${styles.cardTop} ${
                    CARD_FLAVOURS[index % CARD_FLAVOURS.length]
                  }`}
                >
                  <span>{journey.tag}</span>
                  <span>No. {journey.n}</span>
                </div>
                <div className={styles.cardBody}>
                  <h3>{journey.title}</h3>
                  <p>{JOURNEY_BLURBS[journey.n] ?? journey.body}</p>
                  {journey.stat ? (
                    <p className={styles.cardStatLine}>
                      <strong>{journey.stat.value}</strong> {journey.stat.label}
                      {journey.stat.source ? (
                        <span className={styles.cardStatSource}>
                          {journey.stat.source}
                        </span>
                      ) : null}
                    </p>
                  ) : null}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {explainer && explainerAt === "replace-quote" ? (
        explainer
      ) : (
        <section className={styles.pullQuote} data-section="pull-quote">
          <div className={styles.page}>
            <blockquote>
              If you can describe what you want,{" "}
              <em>you can begin to build it.</em>
            </blockquote>
            <p className={styles.pullQuoteSource}>
              Lesson M1 L01 · Welcome to GWTH
            </p>
          </div>
        </section>
      )}

      <section className={styles.section} data-section="curriculum">
        <div className={styles.page}>
          <div className={styles.sectionHead}>
            <h2 className={styles.sectionTitle}>Three monthly issues.</h2>
            <p className={styles.mono}>Curriculum</p>
          </div>
          <p className={styles.sectionLead}>
            Month 1 stays close to your own life. You rewrite your CV and your
            LinkedIn profile, get ready for interviews, turn a messy
            spreadsheet into a dashboard, then build the Family AI Bot, which
            is the Month 1 Capstone project. Month 2 moves the same skills
            into business work, and Month 3 takes them to organisation scale.
            Every month ends with a Capstone project you can show somebody.
          </p>
          <figure className={`${styles.figure} ${styles.figureRight}`}>
            <Image
              src="/home/home-three-issues-c.png"
              alt="Three pinned paper journal booklets labelled Month 1, Month 2, and Month 3, with a chat bubble, gears, and a rocket doodle sticker"
              width={2400}
              height={1792}
              sizes="(max-width: 768px) 100vw, 640px"
            />
          </figure>
          <div className={styles.issueList}>
            {CURRICULUM.map((module, index) => (
              <article className={styles.issue} key={module.m}>
                <div className={styles.issueDashes} aria-hidden="true">
                  {Array.from({ length: 12 }, (_, dash) => (
                    <span
                      key={dash}
                      data-active={dash <= index * 4 ? "true" : undefined}
                    />
                  ))}
                </div>
                <p className={styles.mono}>Issue {module.m}</p>
                <h3>{module.t}</h3>
                <p>{module.d}</p>
                <p className={styles.issueCapstone}>
                  <strong>{module.capstone}</strong>
                  {module.capstoneSub}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {explainer && explainerAt === "after-curriculum" ? explainer : null}

      <section className={styles.section} data-section="progress-vis">
        <div className={`${styles.page} ${styles.credentialSplit}`}>
          <div className={styles.credentialProse}>
            <p className={styles.mono}>Course progress</p>
            <h2 className={styles.sectionTitle}>
              A progress trail that changes as your skill changes.
            </h2>
            <p>
              A certificate from six months ago tells you what somebody once
              passed. It does not tell you what they can do today. So when a
              lesson is revised, learners work through the new version, and
              their record shows that they have.
            </p>
            <div className={styles.statList}>
              {UK_STATS.map((stat, index) => (
                <div className={styles.statListRow} key={stat.value}>
                  <span className={styles.statListValue}>{stat.value}</span>
                  <p>{stat.label}</p>
                  <span className={styles.mono}>
                    {STAT_SOURCES[index] ?? "UK research"}
                  </span>
                </div>
              ))}
            </div>
            <figure className={`${styles.figure} ${styles.figurePortrait}`}>
              <Image
                src="/home/home-progress-trail-c.png"
                alt="A hand placing a coral paper flag on a winding trail of ink dashes leading up to a cream credential card with a gold star seal"
                width={928}
                height={1152}
                sizes="(max-width: 768px) 100vw, 320px"
              />
            </figure>
          </div>
          <Link
            href="/signup"
            className={styles.credentialPanel}
          >
            <p className={styles.mono}>What your record looks like</p>
            <h3>Applied AI Skills</h3>
            <p>
              Practical AI for non-technical adults, kept in step with the
              live curriculum as lessons change. The figures below are an
              example, not a real learner.
            </p>
            <div className={styles.credentialRow}>
              <div className={styles.credentialNumber}>64/94</div>
              <div className={styles.credentialFacts}>
                <div>
                  <span>Format</span>
                  <strong>Live record</strong>
                </div>
                <div>
                  <span>Progress</span>
                  <strong>Visible</strong>
                </div>
                <div>
                  <span>Status</span>
                  <strong>Current</strong>
                </div>
              </div>
            </div>
          </Link>
        </div>
      </section>

      {explainer && explainerAt === "before-pricing" ? explainer : null}

      <section className={styles.dispatch} data-section="pricing">
        <div className={styles.page}>
          <p className={styles.mono}>Pricing</p>
          <h2 className={styles.dispatchTitle}>
            Start free. <em>Join when the work is worth it.</em>
          </h2>
          <div className={styles.dispatchRow}>
            <div className={styles.dispatchPrice}>
              <strong>£0</strong>
              <p>Free labs and sample lessons, no card required</p>
            </div>
            <div className={styles.dispatchPrice}>
              <strong>£29/mo</strong>
              <p>Course access, billed per course month, stop any time</p>
            </div>
            <div className={styles.dispatchPrice}>
              <strong>£7.50/mo</strong>
              <p>Optional Stay Current access after the course ends</p>
            </div>
            <Link href="/pricing" className={styles.buttonSolid}>
              See pricing
            </Link>
          </div>
        </div>
      </section>

      <section className={styles.section} data-section="faq">
        <div className={styles.page}>
          <div className={styles.sectionHead}>
            <h2 className={styles.sectionTitle}>Worth asking first.</h2>
            <p className={styles.mono}>Common questions</p>
          </div>
          <div className={styles.faqList}>
            {faqs.map((item, index) => (
              <details
                className={styles.faqItem}
                key={item.q}
                open={index === 0}
              >
                <summary>{item.q}</summary>
                <p>{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.closing} data-section="final-cta">
        <div className={styles.page}>
          <figure className={`${styles.figure} ${styles.figureBanner}`}>
            <Image
              src="/home/home-shipped-row-c.png"
              alt="Two hands arranging a calm row of five paper artefacts: a web page, a bar chart, an automation flow, a friendly robot, and a portfolio folder with a gold star"
              width={1584}
              height={672}
              sizes="(max-width: 768px) 100vw, 900px"
            />
          </figure>
          <h2>
            Start free, <em>decide later.</em>
          </h2>
          <p>
            Try the labs, read a lesson, and see whether the calm practical
            route fits. Join the waitlist when you want the full course and
            beta progress tracking.
          </p>
          <div className={styles.closingActions}>
            <Link href="/waitlist" className={styles.buttonSolid}>
              Join waitlist
            </Link>
            <Link href="/pricing" className={styles.buttonOutline}>
              See pricing
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
