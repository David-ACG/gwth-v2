import Link from "next/link"
import { COURSE_MONTHLY_PRICE, ONGOING_MONTHLY_PRICE } from "@/lib/config"
import styles from "./why-gwth-fde.module.css"
import { canPromoteLabs } from "@/lib/labs-cta"
import {
  ukFigure,
  ukFigureCitation,
  ukFigureSource,
} from "@/lib/data/uk-ai-context"

/**
 * Press quotes with source attribution, all sourced from research files.
 * The FE Week quote is promoted to the full pull-quote band; the rest
 * render as bordered paper panels with mono attribution.
 */
const pressQuotes = [
  {
    quote:
      "The hub is simply a bookmark or affiliate list of online courses that are already available.",
    source: "Computer Weekly",
    detail: "Digital sovereignty analysis",
  },
  {
    quote:
      "All 14 benchmarked courses come from US big tech companies… the opposite of positioning the UK as an AI maker, not an AI taker.",
    source: "Computer Weekly",
    detail: "On vendor dependency",
  },
  {
    quote:
      "The UK’s AI training landscape is extensive but fragmented, lacking coordination and progression pathways.",
    source: "LSE Impact Blog",
    detail: "Independent review, February 2026",
  },
  {
    quote:
      "The AI Skills Hub seems mostly to consist of rehashed sales propaganda written by big tech and low-quality slide decks meant for other countries.",
    source: "Ed Newton-Rex",
    detail: "AI researcher and Fairly Trained founder",
  },
  {
    quote:
      "£4.1 million for a link list: how the UK’s AI Skills Hub became a portal to American tech power.",
    source: "Medium",
    detail: "Independent analysis of programme costs",
  },
  {
    quote:
      "The website feels messy. I am an everyday person. I do not want to be a programmer. I just want to understand how to use AI.",
    source: "User feedback",
    detail: "AI Skills Hub user testing",
  },
]

/**
 * 3-column comparison: Government AI Skills Boost (14 free badged courses),
 * Government AI Skills Marketplace (600+ broader courses), and GWTH.ai.
 */
const comparisonRows = [
  {
    dimension: "Price",
    boost: "Free",
    marketplace: "Free to £1,000+",
    gwth: `£${COURSE_MONTHLY_PRICE.toFixed(2)}/month for 3 months`,
    gwthAdvantage: false,
  },
  {
    dimension: "Number of courses",
    boost: "14 benchmarked courses",
    marketplace: "600+ courses from mixed providers",
    gwth: "1 structured applied AI course",
    gwthAdvantage: true,
  },
  {
    dimension: "Depth",
    boost: "Foundation (20 min to 9 hrs each)",
    marketplace: "Mixed: some foundation, some advanced",
    gwth: "Comprehensive (120+ hrs over 3 months)",
    gwthAdvantage: true,
  },
  {
    dimension: "Quality control",
    boost: "Benchmarked by Skills England",
    marketplace:
      "No oversight: courses with outdated content, US legal frameworks, and misleading ‘free’ labels that redirect to paid subscriptions",
    gwth: "Lessons reviewed when tools or techniques materially change",
    gwthAdvantage: true,
  },
  {
    dimension: "Scope",
    boost: "Basic AI awareness and prompting",
    marketplace: "Varies wildly: basics to vendor certifications",
    gwth: "Use, Implement, Build, Transform",
    gwthAdvantage: true,
  },
  {
    dimension: "Hands-on projects",
    boost: "None",
    marketplace: "Occasional exercises",
    gwth: "Practical projects and walkthroughs",
    gwthAdvantage: true,
  },
  {
    dimension: "Tool bias",
    boost: "Vendor-specific (Google, Microsoft, Amazon)",
    marketplace:
      "Vendor-specific: each course promotes its provider’s tools",
    gwth: "Independent, vendor-neutral",
    gwthAdvantage: true,
  },
  {
    dimension: "Content freshness",
    boost: "Static, some courses from 2023 to 2024",
    marketplace: "Some courses 10+ years old",
    gwth: "Updated when practical skill or currentness changes",
    gwthAdvantage: true,
  },
  {
    dimension: "Enterprise content",
    boost: "None",
    marketplace: "None structured",
    gwth: "Month 3: governance, ROI, change management",
    gwthAdvantage: true,
  },
  {
    dimension: "Progression pathway",
    boost: "None beyond foundation",
    marketplace: "No structured pathway: self-directed browsing",
    gwth: "3-month structured pathway",
    gwthAdvantage: true,
  },
  {
    dimension: "Assessment",
    boost: "Badge on completion",
    marketplace: "Varies: some offer certificates, some do not",
    gwth: "Plain progress and portfolio evidence",
    gwthAdvantage: true,
  },
  {
    dimension: "Community",
    boost: "None",
    marketplace: "None",
    gwth: "Peer support, forums, office hours",
    gwthAdvantage: true,
  },
  {
    dimension: "UK focus",
    boost: "Courses from US companies",
    marketplace: "Mix of US and international providers",
    gwth: "Built in the UK, UK-focused content",
    gwthAdvantage: true,
  },
]

/**
 * Key UK statistics for the stat list, with a mono source column.
 *
 * Reconciled on 2026-09-19 (bead gwth-launch-88z.32.25). Every figure now
 * comes from `src/lib/data/uk-ai-context.ts`, and three of them changed:
 *
 * - "1 in 6 UK businesses were using AI as of mid-2025" was a year and a
 *   half out of date and attributed to the wrong publisher. The ONS measured
 *   35% of businesses with ten or more staff in June 2026.
 * - The £400 billion figure was labelled "DSIT, Jan 2026". It is the
 *   government's own estimate in the AI Opportunities Action Plan, published
 *   13 January 2025, and it is a projection, so the label now says so.
 * - The worker-confidence figure was right but uncited. It is the Ipsos
 *   survey for DSIT published 28 January 2026, and it measures adults rather
 *   than workers, so the wording follows the source.
 *
 * The lesson count is GWTH's own data and stays here, outside the shared
 * module, which only carries published UK research.
 */
const RESEARCH_STAT_IDS = [
  "worker-confidence",
  "business-adoption",
  "economy-2030",
] as const

const stats = [
  ...RESEARCH_STAT_IDS.map((id) => {
    const figure = ukFigure(id)
    return {
      id,
      value: figure.value,
      label: figure.label,
      source: ukFigureCitation(id),
    }
  }),
  {
    id: "gwth-lessons",
    value: "94",
    label: "core and go-deeper lessons in the current structure",
    source: "GWTH.ai",
  },
]

/** The published documents behind the three research figures above. */
const RESEARCH_SOURCE_LIST = Array.from(
  new Map(
    RESEARCH_STAT_IDS.map((id) => {
      const source = ukFigureSource(id)
      return [source.id, source]
    })
  ).values()
)

/**
 * Why GWTH comparison page, in the PAPER-FIRST register: a two-column quiet
 * masthead, unruled section heads, one pull-quote band plus bordered quote
 * panels, a hairline editorial comparison table, stat-list rows, and a closing
 * band. The evidence-based copy is unchanged, and batch 1 changed no wording
 * here: it moved the headings of the long prose sections into a left column so
 * the reading measure stops leaving half the screen empty.
 *
 * ## Recovered copy, 2026-09-14 (bead gwth-launch-88z.32.26)
 *
 * Two additions, both from the pre-paper-first archive, neither carrying a
 * figure:
 *
 * - **C07**, the self-teaching paragraph in "GWTH Fills the Gap", from
 *   `docs/marketing/why-ai-skills-matter-now.md`. It answers the question a
 *   reader of this page asks next: why pay for a course when the free badge
 *   plus a chatbot is right there. The archive's "skip in five minutes" was
 *   dropped as an invented figure.
 * - **C08**, the first line of the closing band, from
 *   `docs/marketing/email-nurture-sequence.md`. An argument, not a statistic,
 *   so it needs no source and cannot go stale.
 *
 * The same edit aligned the closing band with David's annotation
 * a-20260914-204053-7fd060 ("I'm not sure we should say the course has
 * finished because it never really finishes because it's always up to date").
 * That annotation was applied to /pricing on 2026-09-14; this page still said
 * the price drops "once you have finished", and now says "after the first
 * three months", the same wording /pricing uses.
 *
 * NOT recovered, and recorded so it is not proposed again: the archive's four
 * business-case figures (5% BCG, 70%, 34% retention, 1.5x revenue), which
 * carry house-name attributions and no link, publication or date, where every
 * figure on this page carries a named source. Ledger C32, C33. The ledger also
 * records one claim already on THIS page that nothing implements: "Peer
 * support, forums, office hours" in the comparison table (C50). It is left
 * untouched, because removing a live product claim is David's call, not an
 * agent's. Full ledger:
 * `GWTH-launch-plan/completion/evergreen-copy-recovery/`.
 */
export function WhyGwthFde() {
  return (
    <div className={styles.shell}>
      <section className={styles.masthead} data-section="masthead">
        <div className={styles.page}>
          <h1 className={styles.mastheadTitle}>
            Completed the AI Skills Boost?{" "}
            <em>Here is what comes next.</em>
          </h1>
          <p className={styles.standfirst}>
            The UK government has the right idea: upskilling the nation on AI
            is essential. But there is a gap between a 20-minute foundation
            course and the skills that actually transform careers and
            businesses.
          </p>
          <p className={styles.mastheadClaim}>
            Only{" "}
            <span data-uk-figure="worker-confidence">
              {ukFigure("worker-confidence").value}
            </span>{" "}
            of UK adults say they feel confident using AI at work.
          </p>
          <div className={styles.mastheadFoot}>
            <p>
              Source:{" "}
              <a
                href={ukFigureSource("worker-confidence").url}
                target="_blank"
                rel="noopener noreferrer"
              >
                {ukFigureSource("worker-confidence").title}
              </a>
              , {ukFigureSource("worker-confidence").releasedLabel}
            </p>
            <p>Vendor-neutral · Built in the UK</p>
          </div>
        </div>
      </section>

      <section
        className={`${styles.section} ${styles.sectionSplit}`}
        data-section="programme"
      >
        <div className={styles.page}>
          <div className={styles.sectionHead}>
            <h2 className={styles.sectionTitle}>
              What the Government Programme Covers
            </h2>
          </div>
          <div className={styles.prose}>
            <p>
              The AI Skills Boost is a government-backed programme targeting
              10 million UK workers by 2030. It offers 14 free, benchmarked
              foundation courses from eight technology providers, including
              Google, Microsoft, Amazon, IBM, and Salesforce, covering basic
              AI awareness, prompting, and responsible use.
            </p>
            <p>
              Courses range from 20 minutes to 9 hours. Completers receive a
              government-backed virtual AI Foundations Badge, benchmarked
              against Skills England&apos;s AI Foundation Skills for Work
              Framework. The programme is delivered by PwC under a
              &pound;4.1&nbsp;million contract.
            </p>
            <p>
              Beyond the 14 free courses, the AI Skills Hub lists over 660
              courses in a broader marketplace. Around 60% of those require
              payment, with costs ranging from a few pounds to over
              &pound;7,000. Independent researchers found courses with
              outdated content, US legal frameworks presented as UK-relevant,
              and &ldquo;free&rdquo; courses that redirect to paid
              subscriptions.
            </p>
            <p className={styles.proseStrong}>
              This is a good starting point. The government calls it
              &ldquo;the biggest targeted training programme since the Open
              University.&rdquo; We agree with the ambition. The question is
              whether 20 minutes of vendor-produced content is enough to
              transform how people actually work.
            </p>
          </div>
        </div>
      </section>

      <section className={styles.pullQuote} data-section="pull-quote">
        <div className={styles.page}>
          <blockquote>
            &ldquo;A copy and paste of <em>past failure.</em>&rdquo;
          </blockquote>
          <p className={styles.pullQuoteSource}>
            FE Week · Comparison to pandemic-era skills toolkits
          </p>
        </div>
      </section>

      <section className={styles.section} data-section="press">
        <div className={styles.page}>
          <div className={styles.sectionHead}>
            <h2 className={styles.sectionTitle}>What the Press Says</h2>
          </div>
          <p className={styles.sectionLead}>
            The AI Skills Hub has received significant scrutiny since launch.
            These are real quotes from published sources.
          </p>
          <div className={styles.quoteGrid}>
            {pressQuotes.map((item) => (
              <article key={item.quote} className={styles.quotePanel}>
                <blockquote>&ldquo;{item.quote}&rdquo;</blockquote>
                <p className={styles.quotePanelSource}>
                  {item.source} · {item.detail}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.section} data-section="comparison">
        <div className={styles.page}>
          <div className={styles.sectionHead}>
            <h2 className={styles.sectionTitle}>Side-by-Side Comparison</h2>
          </div>
          <p className={styles.sectionLead}>
            The government offers two things: 14 free badged foundation
            courses (the AI Skills Boost) and a broader marketplace of 600+
            courses from mixed providers. Here is how they compare to GWTH.
          </p>

          <div className={styles.tableWrap}>
            <table className={styles.compTable}>
              <thead>
                <tr>
                  <th scope="col">Dimension</th>
                  <th scope="col">
                    AI Skills Boost
                    <span>14 free badged courses</span>
                  </th>
                  <th scope="col">
                    AI Skills Marketplace
                    <span>600+ broader courses</span>
                  </th>
                  <th scope="col">GWTH.ai</th>
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((row) => (
                  <tr key={row.dimension}>
                    <td>{row.dimension}</td>
                    <td>
                      <span className={styles.glyphNo} aria-hidden="true">
                        &ndash;
                      </span>
                      {row.boost}
                    </td>
                    <td>
                      <span className={styles.glyphNo} aria-hidden="true">
                        &ndash;
                      </span>
                      {row.marketplace}
                    </td>
                    <td className={styles.cellGwth}>
                      <span
                        className={
                          row.gwthAdvantage ? styles.glyphYes : styles.glyphNo
                        }
                        aria-hidden="true"
                      >
                        {row.gwthAdvantage ? "✓" : "–"}
                      </span>
                      {row.gwth}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className={styles.compStack}>
              {comparisonRows.map((row) => (
                <div key={row.dimension} className={styles.compStackRow}>
                  <h3>{row.dimension}</h3>
                  <div className={styles.compStackEntry}>
                    <p className={styles.mono}>AI Skills Boost</p>
                    <p>{row.boost}</p>
                  </div>
                  <div className={styles.compStackEntry}>
                    <p className={styles.mono}>AI Skills Marketplace</p>
                    <p>{row.marketplace}</p>
                  </div>
                  <div className={styles.compStackEntry}>
                    <p className={styles.mono}>GWTH.ai</p>
                    <p className={styles.cellGwth}>
                      <span
                        className={
                          row.gwthAdvantage ? styles.glyphYes : styles.glyphNo
                        }
                        aria-hidden="true"
                      >
                        {row.gwthAdvantage ? "✓" : "–"}
                      </span>
                      {row.gwth}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className={styles.section} data-section="numbers">
        <div className={styles.page}>
          <div className={styles.sectionHead}>
            <h2 className={styles.sectionTitle}>The Numbers</h2>
          </div>
          <div className={styles.statList}>
            {stats.map((stat) => (
              <div key={stat.id} className={styles.statListRow}>
                <strong
                  className={styles.statListValue}
                  data-uk-figure={stat.id === "gwth-lessons" ? undefined : stat.id}
                >
                  {stat.value}
                </strong>
                <p>{stat.label}</p>
                <p className={styles.statListSource}>{stat.source}</p>
              </div>
            ))}
          </div>
          <p className={styles.statsFoot} data-testid="why-gwth-sources">
            Research figures from{" "}
            {RESEARCH_SOURCE_LIST.map((source, i) => (
              <span key={source.id}>
                {i > 0
                  ? i === RESEARCH_SOURCE_LIST.length - 1
                    ? " and "
                    : ", "
                  : ""}
                <a href={source.url} target="_blank" rel="noopener noreferrer">
                  {source.title}
                </a>{" "}
                ({source.releasedLabel})
              </span>
            ))}
            . The lesson count is GWTH.ai course data.
          </p>
        </div>
      </section>

      <section
        className={`${styles.section} ${styles.sectionSplit}`}
        data-section="gap"
      >
        <div className={styles.page}>
          <div className={styles.sectionHead}>
            <h2 className={styles.sectionTitle}>
              GWTH Fills <em>the Gap</em>
            </h2>
          </div>
          <div className={styles.prose}>
            <p>
              The government programme is not a competitor; it is a starting
              point. We welcome every worker who earns their AI Foundations
              Badge. The goal is the same: get the UK workforce confident and
              capable with AI.
            </p>
            <p>
              GWTH covers the foundations, then moves further through Month
              1, Month 2, and Month 3: from advanced prompting and
              vendor-neutral tool evaluation to building real applications,
              automating workflows, and analysing data with AI.
            </p>
            <p>
              The other option is to carry on alone, with AI as your teacher.
              That works less well than it sounds, for two reasons. You do not
              know what you do not know, so you will not think to ask about the
              techniques you have never heard of. And when you ask a model to
              teach you about AI, it answers from training data drawn largely
              from courses and articles written before the tools changed. You
              end up learning yesterday&rsquo;s AI from yesterday&rsquo;s
              curriculum.
            </p>
            <p>
              Months 2 and 3 have zero government equivalent. Enterprise-scale
              AI transformation, multi-agent systems, governance frameworks,
              ROI measurement, and change management: none of this exists in
              the government programme. The government&apos;s own Action Plan
              estimates that AI adoption could add up to{" "}
              <span data-uk-figure="economy-2030">
                {ukFigure("economy-2030").value}
              </span>{" "}
              to the UK economy by 2030.
            </p>
            <p className={styles.proseStrong}>
              GWTH is the natural next step after the government badge. Not a
              replacement, a continuation.
            </p>
          </div>
        </div>
      </section>

      <section className={styles.closing} data-section="closing">
        <div className={styles.page}>
          <h2>
            Start Where the Government <em>Stops</em>
          </h2>
          <p>
            AI literacy is heading the same direction as computer literacy,
            from competitive advantage to baseline expectation. The government
            foundation is free. The rest starts at
            &pound;{COURSE_MONTHLY_PRICE.toFixed(2)}/month and drops to
            &pound;{ONGOING_MONTHLY_PRICE.toFixed(2)}/month after the first
            three months. Structured lessons, a practical project in every
            lesson, vendor-neutral, built for the UK.
          </p>
          <div className={styles.closingActions}>
            <Link href="/waitlist" className={styles.buttonSolid}>
              Join the waitlist
            </Link>
            <Link href="/pricing" className={styles.buttonOutline}>
              See our pricing
            </Link>
            {canPromoteLabs() && (
              <Link href="/labs" className={styles.buttonOutline}>
                Try a free lab
              </Link>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
