import Link from "next/link"
import styles from "./about-fde.module.css"
import { canPromoteLabs } from "@/lib/labs-cta"

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
    body: "During beta, progress evidence matters more than screenshots or static PDFs: completed lessons, reviewed projects, and current refresh work.",
  },
  {
    n: "04",
    title: "Independence matters.",
    body: "No sponsors, no ads, no vendor partnership disguised as curriculum. GWTH can recommend the tool that actually fits the job.",
  },
]

/** How a lesson is produced, start to refresh. */
const PROCESS = [
  {
    n: "01",
    title: "Pick a practical skill",
    body: "Start with something a learner can use in work or life.",
  },
  {
    n: "02",
    title: "Write the lesson",
    body: "Explain the why before the tool, with enough context to make judgement possible.",
  },
  {
    n: "03",
    title: "Build the artefact",
    body: "Turn the lesson into a project, example, workflow, or assessment.",
  },
  {
    n: "04",
    title: "Keep it current",
    body: "Refresh lessons when the field moves enough that the old advice is no longer enough.",
  },
]

/** Headline numbers for the ruled stat columns. */
const STATS = [
  { value: "64", label: "core lessons" },
  { value: "30", label: "go-deeper lessons" },
  { value: "3", label: "months to completion" },
  { value: "3", label: "capstone projects" },
  { value: "UK", label: "based and built" },
]

/**
 * About page in the FDE journal register, matching the chosen homepage
 * direction (home-fde/): drenched teal masthead, prose-plus-founder-note
 * split, numbered principle and process lists with journal rules, ruled
 * stat columns, and a closing band.
 */
export function AboutFde() {
  return (
    <div className={styles.shell}>
      <section className={styles.masthead} data-section="masthead">
        <div className={styles.page}>
          <p className={styles.mastheadKicker}>About GWTH</p>
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
              The course is UK-focused and practical. It teaches research,
              writing, analysis, automation, app building, and AI-assisted
              coding from the position most adults actually start from:
              plain English, limited time, and a real reason to learn.
            </p>
            <p>
              The promise is simple: stop watching AI change the world,
              start building with it.
            </p>
          </div>
          <aside className={styles.founderNote}>
            <p className={styles.mono}>Founder note</p>
            <p>
              GWTH was started by a UK-based solution architect with 25
              years of enterprise software experience, not by a marketing
              team chasing a trend. The course is written from the habit of
              building real systems and explaining hard things plainly.
            </p>
          </aside>
        </div>
      </section>

      <section
        className={`${styles.section} ${styles.sectionAlt}`}
        data-section="principles"
      >
        <div className={styles.page}>
          <div className={styles.listGrid}>
            <div>
              <p className={styles.mono}>Principles</p>
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

      <section className={styles.section} data-section="process">
        <div className={styles.page}>
          <div className={styles.listGrid}>
            <div>
              <p className={styles.mono}>How a lesson is made</p>
              <h2 className={styles.sectionTitle}>
                Editorial care, practical output, <em>then refresh.</em>
              </h2>
              <p className={styles.sectionLead}>
                The public promise is simple: each lesson should help
                someone do something useful.
              </p>
            </div>
            <ol className={styles.numberedList}>
              {PROCESS.map((step) => (
                <li key={step.n} className={styles.numberedItem}>
                  <p className={styles.numberedIndex}>{step.n}</p>
                  <div>
                    <h3>{step.title}</h3>
                    <p>{step.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
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
            <p className={styles.mono}>Numbers</p>
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
