import Link from "next/link"
import styles from "./about-fde.module.css"
import { canPromoteLabs } from "@/lib/labs-cta"
import { ukFigure, ukSource } from "@/lib/data/uk-ai-context"

/** Course principles for the numbered journal list. */
const PRINCIPLES = [
  {
    n: "01",
    title: "Plain English first.",
    body: "If you can describe what you want, you can start shaping it with AI. Technical depth arrives when it helps, not as a gate at the entrance.",
  },
  {
    n: "02",
    title: "Build, do not just watch.",
    body: "Every serious learning step should create something: an analysis, a workflow, a small tool, a better decision, a portfolio artefact.",
  },
  {
    n: "03",
    title: "Proof should be verifiable.",
    // Recovered (ledger C06) from David's own dictated home copy before the
    // N12 rebuild (c6e610d). The current pages all state the mechanic, that a
    // record decays if a learner stops; none of them gave the reason, and the
    // reason is the half that persuades. His second sentence, about learners
    // working through a revised lesson, is left out here: that is a product
    // behaviour this page does not otherwise describe.
    body: "A certificate from six months ago tells you what somebody once passed. It does not tell you what they can do today. So the evidence here is the work: completed lessons, the practical project attached to every lesson, and current refresh work.",
  },
  {
    n: "04",
    title: "Independence matters.",
    body: "No sponsors, no ads, no vendor partnership disguised as curriculum. GWTH can recommend the tool that actually fits the job.",
  },
  {
    n: "05",
    title: "Right for the country you are in.",
    body: "An answer that is wrong in the United Kingdom is worse than no answer at all. Tax, pensions, employment and data protection all work differently here, so the course teaches you to check what AI tells you against the rules that actually apply to you.",
  },
]

/**
 * The everyday British material the worked examples are drawn from. These are
 * UK contexts and UK rules, not things that exist nowhere else: the point is
 * that the paperwork, the vocabulary and the regulations differ, so practising
 * on the real thing is faster than translating an American example.
 */
const UK_EXAMPLES = [
  {
    label: "Public services",
    body: "NHS letters and appointments, council and benefits forms, and the particular language they are written in.",
  },
  {
    label: "Money",
    body: "Workplace pensions, a Self Assessment return, household and council tax bills, and the spreadsheets behind them.",
  },
  {
    label: "School and work",
    body: "School admissions and reports, UK employment rules, and the data protection duties your employer already has.",
  },
]

/**
 * Where the UK actually stands. Every number comes from
 * `src/lib/data/uk-ai-context.ts`, which carries the publisher, the release
 * date and the URL for each one; this page supplies only the argument around
 * them. Before 2026-09-19 the figures lived in this file and the sources in
 * this folder's README, which is how /why-gwth came to print a different and
 * older set of numbers about the same country.
 *
 * What the sources do NOT support, and what no page may therefore say: that
 * the UK has no large AI companies, that it has no model providers, or that
 * education is the cheapest way for the country to catch up. The first two
 * are contradicted by the Action Plan itself; the third is a superlative
 * nobody has measured. `UNSUPPORTED_UK_CLAIMS` in the shared module holds
 * that list and the site-wide test enforces it.
 */
const UK_CONTEXT = [
  {
    id: "ai-companies",
    title: "A large market, still building its own frontier.",
    body: (
      <>
        The government&apos;s AI Opportunities Action Plan calls Britain the
        third largest AI market in the world, with DeepMind, Arm and Wayve
        among the companies based here. The 2024 sector study counted{" "}
        <strong data-uk-figure="ai-companies">
          {ukFigure("ai-companies").value}
        </strong>{" "}
        AI companies in the country. The same plan warns that Britain risks
        falling behind the United States and China, and sets out to grow
        national champions at the frontier.
      </>
    ),
  },
  {
    id: "ai-company-sme-share",
    title: "Most of those companies are small.",
    body: (
      <>
        <strong data-uk-figure="ai-company-sme-share">
          {ukFigure("ai-company-sme-share").value}
        </strong>{" "}
        of them are small or medium sized. Most of the AI built here comes
        from firms about the size of the one you work in, not from a
        laboratory you have heard of, and the people doing that work learned
        it recently.
      </>
    ),
  },
  {
    id: "adoption-depth",
    title: "Adoption is spreading, but it is thin.",
    body: (
      <>
        <strong data-uk-figure="business-adoption">
          {ukFigure("business-adoption").value}
        </strong>{" "}
        of UK businesses with ten or more staff reported using AI in June
        2026, against around{" "}
        <strong data-uk-figure="business-adoption-2023">
          {ukFigure("business-adoption-2023").value}
        </strong>{" "}
        in late 2023. The typical adopter still uses only about{" "}
        <strong data-uk-figure="adoption-depth">
          {ukFigure("adoption-depth").value}
        </strong>{" "}
        AI technologies. Breadth arrived first, and depth is the part that is
        missing.
      </>
    ),
  },
]

/**
 * The sources behind the figures above, resolved from the shared module so a
 * page can never cite a document it did not take a number from.
 */
const ABOUT_SOURCES = ["dsit-action-plan", "dsit-sector-study-2024", "ons-ai-in-business"].map(
  (id) => ukSource(id)
)

/** Headline numbers for the ruled stat columns. */
const STATS = [
  { value: "64", label: "core lessons" },
  { value: "30", label: "go-deeper lessons" },
  { value: "3", label: "months to completion" },
  { value: "3", label: "capstone projects" },
  { value: "UK", label: "based and built" },
]

/**
 * About page, in the PAPER-FIRST register: quiet masthead, prose intro with a
 * panel of British worked-example material, a founder note given its own
 * section, numbered principle lists separated by dividers rather than
 * boundaries, the UK context section, stat columns, and a closing band.
 *
 * One line was recovered on 2026-09-14 for bead gwth-launch-88z.32.26, David's
 * evergreen copy pass: principle 03 now opens with his own argument for why a
 * record has to decay (ledger C06). Nothing the .24 pass settled is touched.
 * The ledger is at
 * `GWTH-launch-plan/completion/evergreen-copy-recovery/`.
 *
 * Rebuilt 2026-09-14 for bead gwth-launch-88z.32.24, from David's three /about
 * annotations: the promise sentence in his own words (a-20260914-205610-1de94a),
 * a founder note that says what he has actually done (a-20260914-210202-2fba31),
 * and UK relevance carried in several different ways rather than one passing
 * clause (a-20260914-210609-f7fdc8). The founder note is grounded only in the
 * biography he supplied: no employer, client or product is named, and no
 * universal claim ("every model") is made, because none of those are supported
 * by a canonical source.
 */
export function AboutFde() {
  return (
    <div className={styles.shell}>
      <section className={styles.masthead} data-section="masthead">
        <div className={styles.page}>
          <h1 className={styles.mastheadTitle}>
            A practical AI course that is <em>honest with you.</em>
          </h1>
        </div>
      </section>

      <section className={styles.section} data-section="intro">
        <div className={`${styles.page} ${styles.splitGrid}`}>
          <div className={styles.prose}>
            <p>
              GWTH is built for people who can see AI changing work but do
              not want another breathless tutorial, vendor demo, or
              certificate that looks impressive until someone asks what it
              proves.
            </p>
            <p>
              It is written for the United Kingdom. The skills themselves
              travel anywhere, but the rules, the forms and the vocabulary do
              not, so the worked examples are the ones you actually have to
              deal with here.
            </p>
            <p>
              The course teaches research, writing, analysis, automation, app
              building, and AI-assisted coding from the position most adults
              actually start from: plain English, limited time, and a real
              reason to learn.
            </p>
            <p className={styles.promise} data-testid="about-promise">
              The promise is simple. We help you stop watching AI change the
              world and start building with it.
            </p>
          </div>
          <aside className={styles.ukPanel} data-testid="uk-examples">
            <p className={styles.mono}>Where the examples come from</p>
            <dl className={styles.ukList}>
              {UK_EXAMPLES.map((example) => (
                <div
                  key={example.label}
                  className={styles.ukItem}
                  data-testid="uk-example"
                >
                  <dt>{example.label}</dt>
                  <dd>{example.body}</dd>
                </div>
              ))}
            </dl>
          </aside>
        </div>
      </section>

      <section className={styles.section} data-section="founder">
        <div className={styles.page}>
          <div className={styles.listGrid}>
            <div>
              <h2 className={styles.sectionTitle}>
                Who writes <em>this course.</em>
              </h2>
            </div>
            <div className={styles.founderNote} data-testid="founder-note">
              <p className={styles.mono}>Founder note</p>
              <p>
                I have spent 25 years in consulting and solution architecture,
                designing systems for organisations that then had to live with
                the result. GWTH is written out of that habit: work out what
                the thing is really for, then build it so it holds up when
                somebody leans on it.
              </p>
              <p>
                I have worked with this technology since the machine learning
                years, long before it could hold a conversation, and I have
                used the generative tools since the first public chat models
                arrived. I have worked inside one of the largest AI providers
                in the world. I try the coding tools as they are released, and
                I run open-source models on my own hardware, so what I tell you
                about them comes from use rather than from a launch post.
              </p>
              <p>
                The other half of the job is people. I have helped my own
                children get started, and friends, and grandparents who were
                sure this was not for them. I have also sat with chief
                technology officers and chief executives of large companies
                working out what to do about AI. The questions turn out to be
                far more alike than anyone expects, and this course is the
                answer I would give in person, written down and kept current.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section
        className={`${styles.section} ${styles.sectionAlt}`}
        data-section="principles"
      >
        <div className={styles.page}>
          <div className={styles.listGrid}>
            <div>
              <h2 className={styles.sectionTitle}>
                What the course <em>refuses to fake.</em>
              </h2>
            </div>
            <ol className={styles.numberedList}>
              {PRINCIPLES.map((principle) => (
                <li key={principle.n} className={styles.numberedItem}>
                  <p className={styles.numberedIndex}>{principle.n}</p>
                  <div>
                    <h3>{principle.title}</h3>
                    <p>{principle.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section className={styles.section} data-section="uk-context">
        <div className={styles.page}>
          <div className={styles.sectionHead}>
            <h2 className={styles.sectionTitle}>
              Why this matters <em>more here.</em>
            </h2>
          </div>
          <p className={styles.sectionLead}>
            Britain is not short of AI. It is short of people and organisations
            who use it well, and that is the part of the gap a country can
            close quickly.
          </p>
          <div className={styles.ukGrid}>
            {UK_CONTEXT.map((note) => (
              <div key={note.id} className={styles.ukNote} data-testid="uk-note">
                <h3>{note.title}</h3>
                <p>{note.body}</p>
              </div>
            ))}
          </div>
          <p className={styles.ukClosing}>
            Practical skill is the most immediately actionable part of that
            gap. The tools are already bought and already installed in most
            workplaces; what decides whether they are worth anything is whether
            people can use them properly, check what comes back, and know when
            to stop.
          </p>
          <p className={styles.sourceNote} data-testid="uk-sources">
            Figures from{" "}
            {ABOUT_SOURCES.map((source, i) => (
              <span key={source.id}>
                {i > 0 ? (i === ABOUT_SOURCES.length - 1 ? " and " : ", ") : ""}
                <a href={source.url} target="_blank" rel="noopener noreferrer">
                  {source.title}
                </a>{" "}
                ({source.publisher.startsWith("Office") ? "ONS" : "DSIT"},{" "}
                {source.releasedLabel})
              </span>
            ))}
            .
          </p>
        </div>
      </section>

      <section
        className={`${styles.section} ${styles.sectionAlt}`}
        data-section="numbers"
      >
        <div className={styles.page}>
          <div className={styles.sectionHead}>
            <h2 className={styles.sectionTitle}>
              A small course with <em>a serious arc.</em>
            </h2>
          </div>
          <div className={styles.statsRow}>
            {STATS.map((stat) => (
              <div key={stat.label} className={styles.stat}>
                <strong>{stat.value}</strong>
                <span>{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.closing} data-section="closing">
        <div className={styles.page}>
          <h2>
            Ready when <em>you are.</em>
          </h2>
          <p>
            Take a look at what the course covers, then decide whether you want
            the full thing and progress evidence that can actually be checked.
          </p>
          <div className={styles.closingActions}>
            {canPromoteLabs() ? (
              <Link href="/labs" className={styles.buttonSolid}>
                Try a free lab
              </Link>
            ) : (
              <Link href="/waitlist" className={styles.buttonSolid}>
                Join the waitlist
              </Link>
            )}
            <Link href="/pricing" className={styles.buttonOutline}>
              See pricing
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
