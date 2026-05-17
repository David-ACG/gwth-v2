import Link from "next/link"
import styles from "./gwth-redesign.module.css"

const principles = [
  {
    n: "01",
    title: "Plain English first.",
    body:
      "If you can describe what you want, you can start shaping it with AI. Technical depth arrives when it helps, not as a gate at the entrance.",
  },
  {
    n: "02",
    title: "Build, do not just watch.",
    body:
      "Every serious learning step should create something: an analysis, a workflow, a small tool, a better decision, a portfolio artefact.",
  },
  {
    n: "03",
    title: "Proof should be verifiable.",
    body:
      "The GWTH Score exists because screenshots and static PDFs are too easy to fake and too poor at showing current ability.",
  },
  {
    n: "04",
    title: "Independence matters.",
    body:
      "No sponsors, no ads, no vendor partnership disguised as curriculum. GWTH can recommend the tool that actually fits the job.",
  },
]

const process = [
  ["01", "Pick a practical skill", "Start with something a learner can use in work or life."],
  ["02", "Write the lesson", "Explain the why before the tool, with enough context to make judgement possible."],
  ["03", "Build the artefact", "Turn the lesson into a project, example, workflow, or assessment."],
  ["04", "Keep it current", "Refresh lessons when the field moves enough that the old advice is no longer enough."],
]

const stats = [
  ["64", "core lessons"],
  ["30", "go-deeper lessons"],
  ["3", "months to completion"],
  ["3", "capstone projects"],
  ["UK", "based and built"],
]

export function GwthRedesignAboutPage() {
  return (
    <div className={styles.shell}>
      <section className={styles.aboutHero}>
        <div className={styles.narrowPage}>
          <p className={styles.kicker}>
            <span className={styles.dot} aria-hidden="true" />
            About GWTH
          </p>
          <h1 className={styles.pageTitle}>
            A practical AI course that is{" "}
            <span className={styles.italicAccent}>honest with you.</span>
          </h1>
        </div>
      </section>

      <section className={styles.section}>
        <div className={`${styles.page} ${styles.splitGrid}`}>
          <div className={styles.aboutProse}>
            <p>
              GWTH is built for people who can see AI changing work but do not
              want another breathless tutorial, vendor demo, or certificate that
              looks impressive until someone asks what it proves.
            </p>
            <p>
              The course is UK-focused and practical. It teaches research,
              writing, analysis, automation, app building, and AI-assisted
              coding from the position most adults actually start from: plain
              English, limited time, and a real reason to learn.
            </p>
            <p>
              The current site already had the stronger promise: stop watching
              AI change the world, start building with it. This redesign keeps
              that promise and gives it a calmer editorial home.
            </p>
          </div>
          <aside className={styles.founderNote}>
            <p className={styles.monoLabel}>Founder note</p>
            <p>
              GWTH was started by a UK-based solution architect with 25 years
              of enterprise software experience, not by a marketing team chasing
              a trend. The course is written from the habit of building real
              systems and explaining hard things plainly.
            </p>
          </aside>
        </div>
      </section>

      <section className={`${styles.section} ${styles.sectionAlt}`}>
        <div className={styles.page}>
          <div className={styles.sectionHeader}>
            <p className={styles.sectionEyebrow}>Principles</p>
            <h2 className={styles.sectionTitle}>What the course refuses to fake.</h2>
          </div>
          <div className={styles.aboutGrid}>
            {principles.map((principle) => (
              <article className={styles.aboutCard} key={principle.n}>
                <p className={styles.monoLabel}>{principle.n}</p>
                <h3>{principle.title}</h3>
                <p>{principle.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={`${styles.page} ${styles.splitGrid}`}>
          <div className={styles.sectionHeader}>
            <p className={styles.sectionEyebrow}>How a lesson is made</p>
            <h2 className={styles.sectionTitle}>
              Editorial care, practical output, then refresh.
            </h2>
            <p className={styles.sectionLead}>
              The lesson production tools from the handoff bundle become
              internal surfaces later. The public promise is simpler: each
              lesson should help someone do something useful.
            </p>
          </div>
          <div className={styles.principleList}>
            {process.map(([n, title, body]) => (
              <article className={styles.principleItem} key={n}>
                <p className={styles.monoLabel}>{n}</p>
                <div>
                  <h3>{title}</h3>
                  <p>{body}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={`${styles.section} ${styles.sectionDeep}`}>
        <div className={styles.page}>
          <div className={styles.sectionHeader}>
            <p className={styles.sectionEyebrow}>Numbers</p>
            <h2 className={styles.sectionTitle}>A small course with a serious arc.</h2>
          </div>
          <div className={styles.numbersGrid}>
            {stats.map(([value, label]) => (
              <div className={styles.numberCell} key={value}>
                <strong>{value}</strong>
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.ctaSection}>
        <div className={styles.page}>
          <h2>Ready when you are.</h2>
          <p>
            Start with the free labs, then decide whether you want the full
            course and a credential that can actually be checked.
          </p>
          <div className={styles.heroActions}>
            <Link href="/labs" className={styles.buttonPrimary}>
              Try a free lab
            </Link>
            <Link href="/pricing" className={styles.buttonSecondary}>
              See pricing
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
