import type { ReactNode } from "react"
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
    a: "Yes. The beta emphasis is completed lessons, capstones, and portfolio evidence.",
  },
  {
    q: "How much time does the course take?",
    a: "The main course is designed around roughly five hours a week for three months. Free labs let you try the format before joining.",
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
  "02": "Five hours a week and a portfolio of real projects. Only 21% of UK workers feel confident with AI: that gap is your opening.",
  "03": "No developer, no consultant. Learn to build the automations and tools your business needs yourself.",
  "04": "AI fluency will be table stakes for your children's working lives. Learn it properly first, in plain English.",
  "05": "You use AI daily but suspect there is more. There is: design with it, automate with it, and save more than the course costs on your AI subscriptions.",
  "06": "AI fluency is one of the highest-premium skills in the UK market. Show up to your next salary conversation with proof.",
  "07": "Every lesson, capstone, and refresh leaves a practical progress trail: no PDFs, no stale certificates.",
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
              <div className={styles.heroActions}>
                <Link href="/signup" className={styles.buttonSolid}>
                  Join waitlist
                </Link>
                <Link href="/labs" className={styles.buttonOutline}>
                  Try a free lab
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

      <section className={styles.section} data-section="journey">
        <div className={styles.page}>
          <div className={styles.sectionHead}>
            <h2 className={styles.sectionTitle}>Nine journeys. One proof.</h2>
            <p className={styles.mono}>Why people join</p>
          </div>
          <p className={styles.sectionLead}>
            Whether you are reskilling, running a small business, or trying to
            keep your team ahead, the end point is the same: practical work
            and portfolio evidence someone else can inspect.
          </p>
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
            The course reads like a careful journal, delivered monthly: AI
            basics first, then building and workflows, then enterprise-scale
            applied work. Each month closes with a capstone you can show.
          </p>
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
              Beta progress does not pretend a certificate from six months ago
              is the same thing as current ability. When lessons are revised,
              learners refresh the updated material and the course shows
              that work clearly.
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
          </div>
          <Link
            href="/signup"
            className={styles.credentialPanel}
          >
            <p className={styles.mono}>Beta progress preview</p>
            <h3>Sarah Mensah</h3>
            <p>
              Has completed AI Literacy Foundations: practical AI for
              non-technical adults, refreshed against the live curriculum.
            </p>
            <div className={styles.credentialRow}>
              <div className={styles.credentialNumber}>64/94</div>
              <div className={styles.credentialFacts}>
                <div>
                  <span>Issued</span>
                  <strong>12 Feb 2026</strong>
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
          <h2>
            Start free, <em>decide later.</em>
          </h2>
          <p>
            Try the labs, read a lesson, and see whether the calm practical
            route fits. Join the waitlist when you want the full course and
            beta progress tracking.
          </p>
          <div className={styles.closingActions}>
            <Link href="/signup" className={styles.buttonSolid}>
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
