import type { ReactNode } from "react"
import Link from "next/link"
import { COURSE_MONTHLY_PRICE, ONGOING_MONTHLY_PRICE } from "@/lib/config"
import { isPrivateContentMode } from "@/lib/content-mode"
import {
  ukFigure,
  ukFigureCitation,
  ukFigureSource,
} from "@/lib/data/uk-ai-context"
import styles from "./why-gwth-fde.module.css"

/**
 * A price as a visitor reads it: "£29" for whole pounds, "£7.50" otherwise.
 * Read from config so the page can never disagree with /pricing.
 */
function gbp(amount: number): string {
  return `£${Number.isInteger(amount) ? amount.toFixed(0) : amount.toFixed(2)}`
}

/** One reason to learn with GWTH: a heading and the paragraphs beneath it. */
interface Reason {
  /** Stable id, used as the row's `data-reason` hook in tests. */
  id: string
  /** Sentence-case heading, readable on its own. */
  title: string
  /** Paragraphs, in reading order. */
  body: readonly ReactNode[]
}

/**
 * The reasons, in the order the video narration David chose gives them
 * (why-gwth-video-r3, variant A, Opus 5.5 high, his "Best" on 2026-09-28),
 * adapted for reading rather than transcribed. Two of his comments across the
 * writing rounds shape every row: say WHY each feature matters to a learner,
 * and say nothing twice.
 */
const REASONS: readonly Reason[] = [
  {
    id: "plain-english",
    title: "Plain English, and only what you need",
    body: [
      "The AI industry is often bad at explaining things simply. We explain each term in plain English the first time you need it, and we only teach what will improve your skills. We say each thing once, so you understand ideas quickly and spend your time practising. Your time is worth more than the price of any course, so we work hard not to waste it.",
    ],
  },
  {
    id: "clear-route",
    title: "A clear route, without the hype",
    body: [
      "A lot of AI videos are made to win views, so they lean on dramatic claims about every new release, and many repeat each other. You're left to work out what's reliable and what to watch next. In GWTH, each lesson builds on the last, and we tell you plainly what a tool does well and where it falls short.",
    ],
  },
  {
    id: "independent",
    title: "Independent, so our advice is honest",
    body: [
      "We have no sponsors and no deals with AI companies. Nobody pays us to recommend a tool, so we can point you to the one that suits the job, whoever makes it.",
      "Free courses from AI companies can be useful, but they're usually short introductions to that company's own products. GWTH teaches you to choose between tools and use them well.",
    ],
  },
  {
    id: "up-to-date",
    title: "Always up to date",
    body: [
      "AI changes quickly. A course written two or three years ago can recommend tools and methods that people have since stopped using. We update the lessons as the tools change and rewrite any instruction that no longer works, so you're learning what works now.",
      // Recovered idea C07 (evergreen copy recovery, 2026-09-14): why a course
      // beats teaching yourself with a chatbot. The earlier wording said a
      // chatbot answers from out-of-date training data; the GPT-6 Sol pass on
      // 2026-09-28 rightly noted that depends on the chatbot, so the page now
      // makes only the half that is always true.
      "Teaching yourself with a chatbot can work, but when you're new to AI you may not yet know what to ask. GWTH shows you what to ask about, and teaches you how to check whether a source is reliable and how to test a new tool for yourself.",
    ],
  },
  {
    id: "hands-on",
    title: "Hands-on, and good fun",
    body: [
      // "A fun tracker", never a reason to sign up: David, why-gwth-video B s6.
      "Most of the course is hands-on, because you learn to use AI by using it. The projects are meant to be fun and interesting, and many of them build tools you might otherwise pay a monthly fee for. There's even a fun tracker that shows how much you've saved.",
    ],
  },
  {
    id: "what-you-build",
    title: "What you'll build",
    body: [
      "In your first month, you'll build small apps. By month three, you'll build more advanced apps that, once tested, you could use at work or offer to customers. AI writes the code, and you learn how to direct it and check the result.",
    ],
  },
  {
    id: "optional-lessons",
    title: "Optional lessons for your field",
    body: [
      // Every field is named: David, why-gwth round 1, D s3, "Add all the
      // fields as people will be looking for their own."
      "Everyone wants something different from AI, so alongside the core course there are lots of optional lessons, especially in months two and three. You can focus on AI in your own field: finance, medicine, law or logistics today, with lessons for HR, marketing and sales being written now. You can go further with local AI, which runs on your own computer, with advanced AI-assisted coding, or with hardware that uses AI. Or you can take the lessons for AI transformation experts, who help a business, your own or someone else's, choose AI tools and start using them well.",
      "Shaping a course around one person is usually what people pay for with bespoke training. With GWTH, you do that yourself by choosing the optional lessons that match your work.",
    ],
  },
  {
    id: "proof",
    title: "Proof of what you can do",
    body: [
      // Recovered idea C06 (from the old /about): the REASON a record has to
      // stay current, not just the mechanic.
      "Every lesson leaves you with real work you can show people. A certificate from six months ago tells you what somebody once passed, not what they can do today. So your GWTH credential is built from the lessons you've finished and your answers to the questions in each one. An employer or client will be able to check that it's genuine. It will also show if a lesson you passed has since been rewritten and needs completing again, so it reflects what you can do now. Credentials are switched on after the beta.",
    ],
  },
  {
    id: "price",
    title: "The price",
    body: [
      "We've built GWTH mainly for individuals paying for themselves, so we've set a price one person can afford.",
      // The price is stated once, simply, with no sums or totals (David,
      // why-gwth round 1, D s5 and E s7). The course never really ends
      // because it is always updated (E s3).
      `Course access is ${gbp(COURSE_MONTHLY_PRICE)} a month, paid monthly, and you can stop at any time. After your first three months the course doesn't end, because we keep updating it, and you can stay current for ${gbp(ONGOING_MONTHLY_PRICE)} a month.`,
    ],
  },
]

/**
 * The comparison with the government's offer. Carried over from the old
 * /why-gwth page, trimmed to the rows a learner decides on. Removed from the
 * old table, and why:
 *
 * - Price: the page states the price once, in "The price" above.
 * - Community ("Peer support, forums, office hours"): nothing in the product
 *   implements it (evergreen ledger C50), so it is not carried forward.
 * - Depth ("120+ hrs over 3 months"): contradicted by "about five hours a week
 *   for three months", which is what the home page and the course say.
 * - Scope, quality control, enterprise content, UK focus: restated by rows
 *   below or by other sections of this page.
 */
const COMPARISON_ROWS = [
  {
    dimension: "How long",
    boost: "20 minutes to 9 hours per course",
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
    boost: "US technology companies, mostly about their own tools",
    hub: "A mix of providers, each usually teaching its own tools",
    gwth: "Independent, with no sponsors or deals with AI companies",
  },
  {
    dimension: "How current",
    boost: "Some courses date from 2023 and 2024",
    hub: "Some courses are more than 10 years old",
    gwth: "Updated as the tools change",
  },
  {
    dimension: "A route through",
    boost: "Nothing beyond the foundation courses",
    hub: "You browse and choose for yourself",
    gwth: "Three months in which each lesson builds on the last",
  },
  {
    dimension: "At the end",
    boost: "A digital badge",
    hub: "Some offer certificates, some do not",
    gwth: "Real work to show, and a credential others can check",
  },
] as const

/** Published press quotes about the AI Skills Hub, kept verbatim. */
const PRESS_QUOTES = [
  {
    quote:
      "All 14 benchmarked courses come from US big tech companies… the opposite of positioning the UK as an AI maker, not an AI taker.",
    source: "Computer Weekly",
    detail: "on dependence on the big technology companies",
  },
  {
    quote:
      "The UK’s AI training landscape is extensive but fragmented, lacking coordination and progression pathways.",
    source: "LSE Impact Blog",
    detail: "February 2026",
  },
] as const

/**
 * The UK figures this page prints. ONE sourced set, read from
 * `src/lib/data/uk-ai-context.ts`, so it cannot contradict /, /lessons or any
 * other page (the old /about and /why-gwth once printed different numbers
 * about the same country; see that module's header).
 */
const UK_STATS = [
  {
    id: "worker-confidence",
    label: (
      <>
        of UK adults say they feel confident using AI at work, in a survey
        carried out in 2024
      </>
    ),
  },
  {
    id: "business-adoption",
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
    label: (
      <>
        AI technologies used, on average, by a UK business that has started
        using AI. The ONS calls this adoption relatively shallow.
      </>
    ),
  },
] as const

/** The published documents behind the figures, each linked once. */
const UK_SOURCES = Array.from(
  new Map(
    UK_STATS.map(({ id }) => {
      const source = ukFigureSource(id)
      return [source.id, source]
    })
  ).values()
)

/**
 * The everyday British material the worked examples use. Carried over from the
 * old /about page (David's annotation a-20260914-210609-f7fdc8 asked for the UK
 * thread to be carried in several ways, not one passing clause).
 */
const UK_WORKED_EXAMPLES =
  "NHS letters and appointments, council and benefits forms, workplace pensions, a Self Assessment tax return, school admissions and UK employment rules"

/**
 * The one Why GWTH page, at /why-gwth. /about and /why-gwth were merged on
 * 2026-09-28 at David's request ("merge them into one Why GWTH page"); /about
 * now 308s here (next.config.ts). The component keeps its `-fde` file name so
 * imports stay put; the register is paper-first.
 *
 * Top to bottom:
 * 1. Heading and short intro.
 * 2. Where the Why GWTH video will go (not rendered yet, see below).
 * 3. The reasons, from the narration David chose for the video.
 * 4. The government AI Skills Boost comparison, as ONE section, with its
 *    sources (from the old /why-gwth).
 * 5. What the old /about said that nothing above says: the UK worked examples
 *    and the founder note. Its principles (plain English, build, verifiable
 *    proof, independence) are all reasons above now, so they are not repeated.
 * 6. Sign up, on this page (David: "The call to action should be to sign up on
 *    the Why GWTH page. We don't want to send them back to the lab to
 *    procrastinate further").
 *
 * Dropped from the old pages, and why: the old /about course-stat row (64 core
 * and 30 go-deeper lessons) and the old /why-gwth "94 lessons" stat, because
 * the lesson split disagrees between config, the syllabus register and those
 * pages (evergreen ledger C30); the old /about company-count and SME figures,
 * which argue about the UK AI industry rather than about learning; the FE Week
 * pull quote and four of the six press quotes, which were sharp rather than
 * informative; and the £400 billion projection, which says nothing to a
 * learner deciding on a course.
 *
 * Changed by the marketing copy gate (GPT-6 Sol, high, rounds 1 and 2 on
 * 2026-09-28, evidence in GWTH-launch-plan/completion/marketing-copy-gate/
 * why-gwth-merge-r*): the suit analogy became a direct sentence, the
 * computer-literacy prediction (C08) and the "better choice for most people"
 * claim went, the credential is described as it will work (and as switched
 * on after the beta, matching the home page), and the close says what happens
 * next instead of ending on the old /about promise line. "AI transformation
 * expert" is kept by name because David asked for every optional field to be
 * named.
 */
export function WhyGwthFde() {
  const cta = isPrivateContentMode()
    ? { href: "/waitlist", label: "Join the waitlist" }
    : { href: "/signup", label: "Sign up" }

  return (
    <div className={styles.shell}>
      <section className={styles.masthead} data-section="masthead">
        <div className={styles.page}>
          <h1 className={styles.mastheadTitle}>
            Why learn AI <em>with GWTH</em>
          </h1>
          <div className={styles.standfirst}>
            <p>
              There are lots of ways to learn AI. You can watch YouTube videos,
              take a free course from an AI company, or pay for expensive
              training made just for you. Here&apos;s why we think GWTH is a
              better choice.
            </p>
            <p>
              GWTH is a practical AI course for adults in the UK. Over three
              months, at about five hours a week, you&apos;ll learn to use AI
              on real tasks. You never need to know how to code. When you
              build apps, AI writes the code, and we show you how to direct it
              and check it.
            </p>
          </div>
        </div>
      </section>

      {/*
        WHY GWTH VIDEO GOES HERE, at the top of the page under the intro.
        The video is made later (its narration is why-gwth-video-r3 variant A,
        David's "Best", 2026-09-28). Until it exists, render NOTHING here: no
        placeholder, no poster, no "coming soon" box.
      */}

      <section className={styles.section} data-section="reasons">
        <div className={styles.page}>
          {REASONS.map((reason) => (
            <div
              key={reason.id}
              className={styles.reason}
              data-reason={reason.id}
            >
              <h2 className={styles.reasonTitle}>{reason.title}</h2>
              <div className={styles.prose}>
                {reason.body.map((paragraph, i) => (
                  <p key={i}>{paragraph}</p>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section
        className={`${styles.section} ${styles.sectionAlt}`}
        data-section="government"
      >
        <div className={styles.page}>
          <div className={styles.split}>
            <h2 className={styles.sectionTitle}>
              How GWTH compares with the government&apos;s AI Skills Boost
            </h2>
            <div className={styles.prose}>
              <p>
                The government&apos;s free AI Skills Boost aims to train 10 million UK workers by 2030. It offers 14 free
                foundation courses, from 20 minutes to 9 hours long, made by
                technology companies including Google, Microsoft, Amazon, IBM
                and Salesforce. They cover what AI is, how to write prompts and
                how to use AI responsibly, and you get a digital badge when you
                finish. The government&apos;s AI Skills Hub also lists more than
                600 other courses from a mix of providers.
              </p>
              <p>
                We agree with the aim, and a short foundation course is a good
                start. GWTH is a natural next step: three months of teaching and
                practice so you can use AI in your own work.
              </p>
            </div>
          </div>

          <h3 className={styles.subTitle}>Where the UK is now</h3>
          <div className={styles.statList}>
            {UK_STATS.map((stat) => (
              <div key={stat.id} className={styles.statListRow}>
                <strong
                  className={styles.statListValue}
                  data-uk-figure={stat.id}
                >
                  {ukFigure(stat.id).value}
                </strong>
                <p>{stat.label}</p>
                <p className={styles.statListSource}>
                  {ukFigureCitation(stat.id)}
                </p>
              </div>
            ))}
          </div>
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
                    <span className={styles.visuallyHidden}>Compared on</span>
                  </th>
                  <th scope="col">
                    AI Skills Boost
                    <span>14 free courses</span>
                  </th>
                  <th scope="col">
                    AI Skills Hub
                    <span>600+ other courses</span>
                  </th>
                  <th scope="col">GWTH</th>
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

            <div className={styles.compStack}>
              {COMPARISON_ROWS.map((row) => (
                <div key={row.dimension} className={styles.compStackRow}>
                  <h4>{row.dimension}</h4>
                  <dl>
                    <div className={styles.compStackEntry}>
                      <dt>AI Skills Boost</dt>
                      <dd>{row.boost}</dd>
                    </div>
                    <div className={styles.compStackEntry}>
                      <dt>AI Skills Hub</dt>
                      <dd>{row.hub}</dd>
                    </div>
                    <div className={styles.compStackEntry}>
                      <dt>GWTH</dt>
                      <dd className={styles.cellGwth}>{row.gwth}</dd>
                    </div>
                  </dl>
                </div>
              ))}
            </div>
          </div>

          <h3 className={styles.subTitle}>What independent reviewers said</h3>
          <div className={styles.quoteGrid}>
            {PRESS_QUOTES.map((item) => (
              <figure key={item.source} className={styles.quotePanel}>
                <blockquote>&ldquo;{item.quote}&rdquo;</blockquote>
                <figcaption className={styles.quotePanelSource}>
                  {item.source}, {item.detail}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.section} data-section="uk">
        <div className={`${styles.page} ${styles.split}`}>
          <h2 className={styles.sectionTitle}>Written for the UK</h2>
          <div className={styles.prose}>
            <p>
              The skills work anywhere, but the rules and forms don&apos;t.
              You&apos;ll practise with examples from life here:{" "}
              {UK_WORKED_EXAMPLES}. An answer that&apos;s right in another
              country can be wrong here, so you&apos;ll also learn to check
              what AI tells you against the rules that apply to you.
            </p>
          </div>
        </div>
      </section>

      <section
        className={`${styles.section} ${styles.sectionAlt}`}
        data-section="founder"
      >
        <div className={`${styles.page} ${styles.split}`}>
          <h2 className={styles.sectionTitle}>Who writes the course</h2>
          {/*
            David's own biography (annotation a-20260914-210202-2fba31 on the
            old /about), tidied by the GPT-6 Sol pass on 2026-09-28. Grounded
            only in what he supplied: no employer, client or product is named.
          */}
          <div className={styles.founderNote} data-testid="founder-note">
            <p className={styles.noteLabel}>A note from the founder</p>
            <p>
              I&apos;ve spent 25 years in consulting and solution architecture,
              designing systems for organisations that then had to live with
              the result. I write GWTH in the same way: work out what something
              is really for, then build it so it works when people rely on it.
            </p>
            <p>
              I&apos;ve worked with this technology since the machine learning
              years, long before it could hold a conversation, and I&apos;ve
              used generative tools since the first public chat models arrived.
              I&apos;ve worked inside one of the largest AI providers in the
              world. I try new coding tools as they&apos;re released and run AI
              models on my own computers, so what I tell you comes from using
              them myself.
            </p>
            <p>
              The other half of the job is people. I&apos;ve helped my
              children, friends and grandparents get started, including people
              who were sure this was not for them. I&apos;ve also sat with chief
              technology officers and chief executives of large companies
              working out what to do about AI. Those conversations shaped a
              course that begins with everyday tasks and builds towards
              deciding how an organisation should use AI.
            </p>
          </div>
        </div>
      </section>

      <section className={styles.closing} data-section="closing">
        <div className={styles.page}>
          {/* The old /about closed on David's promise line ("stop watching
              AI change the world and start building with it",
              a-20260914-205610-1de94a). Both GPT-6 Sol passes on 2026-09-28
              read it as a slogan at the point the page should be most
              concrete, so the close now says what happens next. */}
          <h2>
            Start building <em>with AI.</em>
          </h2>
          <p>
            If you&apos;re buying
            places for colleagues, the{" "}
            <Link href="/for-teams" className={styles.inlineLink}>
              For teams page
            </Link>{" "}
            explains how that works.
          </p>
          <div className={styles.closingActions}>
            <Link href={cta.href} className={styles.buttonSolid}>
              {cta.label}
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
