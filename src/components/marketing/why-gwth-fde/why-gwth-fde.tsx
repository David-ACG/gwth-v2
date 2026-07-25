import Link from "next/link"
import { COURSE_MONTHLY_PRICE } from "@/lib/config"
import styles from "./why-gwth-fde.module.css"
import { canPromoteLabs } from "@/lib/labs-cta"

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
    boost: "Foundation (20 min – 9 hrs each)",
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
    boost: "Static, some courses from 2023–2024",
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

/** Key UK statistics for the stat list, with mono source column. */
const stats = [
  {
    value: "21%",
    label: "of UK workers feel confident using AI",
    source: "DSIT, Jan 2026",
  },
  {
    value: "1 in 6",
    label: "UK businesses were using AI as of mid-2025",
    source: "DSIT, Jan 2026",
  },
  {
    value: "£400bn",
    label: "potential AI contribution to UK economy by 2030",
    source: "DSIT, Jan 2026",
  },
  {
    value: "94",
    label: "core and go-deeper lessons in the current structure",
    source: "GWTH.ai",
  },
]

/**
 * Why GWTH comparison page in the FDE journal register: drenched teal
 * masthead, ruled section heads, one pull-quote band plus bordered quote
 * panels, a hairline editorial comparison table, stat-list rows, and a
 * closing band. Evidence-based copy is unchanged from the previous skin.
 */
export function WhyGwthFde() {
  return (
    <div className={styles.shell}>
      <section className={styles.masthead} data-section="masthead">
        <div className={styles.page}>
          <p className={styles.mastheadKicker}>Why GWTH · UK applied AI</p>
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
            Only 21% of UK workers feel confident using AI at work.
          </p>
          <div className={styles.mastheadFoot}>
            <p>Source: UK Government / DSIT research, January 2026</p>
            <p>Vendor-neutral · Built in the UK</p>
          </div>
        </div>
      </section>

      <section className={styles.section} data-section="programme">
        <div className={styles.page}>
          <div className={styles.sectionHead}>
            <h2 className={styles.sectionTitle}>
              What the Government Programme Covers
            </h2>
            <p className={styles.mono}>The programme</p>
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
            <p className={styles.mono}>Published sources</p>
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
            <p className={styles.mono}>13 dimensions</p>
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
            <p className={styles.mono}>Evidence</p>
          </div>
          <div className={styles.statList}>
            {stats.map((stat) => (
              <div key={stat.label} className={styles.statListRow}>
                <strong className={styles.statListValue}>{stat.value}</strong>
                <p>{stat.label}</p>
                <p className={styles.statListSource}>{stat.source}</p>
              </div>
            ))}
          </div>
          <p className={styles.statsFoot}>
            Statistics from UK Government / DSIT research (January 2026) and
            GWTH.ai course data.
          </p>
        </div>
      </section>

      <section className={styles.section} data-section="gap">
        <div className={styles.page}>
          <div className={styles.sectionHead}>
            <h2 className={styles.sectionTitle}>
              GWTH Fills <em>the Gap</em>
            </h2>
            <p className={styles.mono}>The next step</p>
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
              Months 2 and 3 have zero government equivalent. Enterprise-scale
              AI transformation, multi-agent systems, governance frameworks,
              ROI measurement, and change management: none of this exists in
              the government programme, yet it is precisely what UK businesses
              need to capture the &pound;400&nbsp;billion AI opportunity.
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
            The foundation is free. The transformation starts at
            &pound;{COURSE_MONTHLY_PRICE.toFixed(2)}/month. Structured
            lessons, practical projects, vendor-neutral, built for the UK.
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
