import Link from "next/link"
import type { ModelArenaLab } from "@/lib/types"
import { formatTestedOn } from "@/lib/data/model-arena"
import styles from "./arena-detail.module.css"

/**
 * Props for {@link ArenaLabDetail}.
 */
interface ArenaLabDetailProps {
  /** The Model Arena lab to render head to head. */
  lab: ModelArenaLab
}

/**
 * Head-to-head lab detail in the FDE journal register.
 *
 * Renders one Model Arena lab: a teal matchup header (both tools with exact
 * model ids and how they were run, plus the tested-on date), the task brief,
 * the shared prompt, the two outputs verbatim side by side (stacked on mobile,
 * never a horizontal scroll), a beginner rubric, the dated verdict with its
 * freshness note, and try-it-yourself steps. Archived labs carry a clear
 * archived banner but are otherwise identical (their content is not rewritten).
 *
 * Outputs are shown exactly as generated, including each tool's own markdown
 * markers and punctuation, because judging that raw text is part of the lab.
 */
export function ArenaLabDetail({ lab }: ArenaLabDetailProps) {
  const isArchived = lab.status === "archived"
  const [first, second] = lab.matchup

  return (
    <div className={styles.shell} data-section="arena-lab-detail">
      <header className={styles.matchup}>
        <div className={styles.page}>
          <p className={styles.matchupKicker}>
            Model Arena{lab.category ? ` · ${lab.category}` : ""} ·{" "}
            {isArchived ? "Archived" : "Live"}
          </p>
          <h1 className={styles.matchupTitle}>{lab.title}</h1>

          <div className={styles.contestants}>
            <div className={styles.contestant}>
              <p className={styles.contestantName}>{first.name}</p>
              <p className={styles.contestantModel}>
                {first.modelLabel ?? first.modelId}
              </p>
              <p className={styles.contestantRun}>{first.howRun}</p>
            </div>
            <p className={styles.versus} aria-hidden="true">
              versus
            </p>
            <div className={styles.contestant}>
              <p className={styles.contestantName}>{second.name}</p>
              <p className={styles.contestantModel}>
                {second.modelLabel ?? second.modelId}
              </p>
              <p className={styles.contestantRun}>{second.howRun}</p>
            </div>
          </div>

          <div className={styles.matchupFoot}>
            <p>Tested on {formatTestedOn(lab.testedOn)}</p>
            <p>Same prompt to both · Free to read</p>
          </div>
        </div>
      </header>

      <div className={styles.page}>
        {isArchived ? (
          <div className={styles.archivedBanner} data-testid="archived-banner">
            <span className={styles.badge}>Archived</span>
            <p>
              This matchup has been superseded by a newer test. It is kept as a
              record of how the tools compared on {formatTestedOn(lab.testedOn)},
              which is useful once newer models arrive.
            </p>
          </div>
        ) : null}

        <section className={styles.section} data-section="brief">
          <div className={styles.sectionHead}>
            <h2 className={styles.sectionTitle}>The task</h2>
            <p className={styles.mono}>The brief</p>
          </div>
          <p className={styles.brief}>{lab.brief}</p>
        </section>

        <section className={styles.section} data-section="prompt">
          <div className={styles.sectionHead}>
            <h2 className={styles.sectionTitle}>The shared prompt</h2>
            <p className={styles.mono}>Identical to both</p>
          </div>
          <pre className={styles.promptBlock}>{lab.prompt}</pre>
        </section>

        <section className={styles.section} data-section="outputs">
          <div className={styles.sectionHead}>
            <h2 className={styles.sectionTitle}>The answers</h2>
            <p className={styles.mono}>Verbatim · Side by side</p>
          </div>
          {/*
            The outputs are printed exactly as returned, so ChatGPT's markdown
            headings and bold markers show as raw characters beside Claude's
            plain prose. Said out loud that reads as a difference between the
            tools; left unsaid it reads as a broken page.
          */}
          <p className={styles.sectionNote}>
            Each answer is printed exactly as the tool returned it, formatting
            marks and all, so you are judging the real output rather than a
            tidied-up version of it.
          </p>
          <div className={styles.outputsGrid}>
            {lab.outputs.map((output) => {
              const contestant = lab.matchup.find((m) => m.name === output.by)
              return (
                <article
                  className={styles.outputCol}
                  data-testid="arena-output"
                  key={output.by}
                >
                  <header className={styles.outputHead}>
                    <span className={styles.outputName}>{output.by}</span>
                    <span className={styles.outputModel}>
                      {contestant?.modelLabel ?? contestant?.modelId}
                    </span>
                  </header>
                  <div className={styles.outputBody}>{output.verbatim}</div>
                </article>
              )
            })}
          </div>
        </section>

        <section className={styles.section} data-section="rubric">
          <div className={styles.sectionHead}>
            <h2 className={styles.sectionTitle}>Score it yourself</h2>
            <p className={styles.mono}>The rubric</p>
          </div>
          <ol className={styles.rubricList}>
            {lab.rubric.map((item) => (
              <li className={styles.rubricItem} key={item.criterion}>
                <p className={styles.rubricQ}>{item.criterion}</p>
                <p className={styles.rubricGood}>
                  <span>Good looks like</span>
                  {item.goodLooksLike}
                </p>
              </li>
            ))}
          </ol>
        </section>

        <section className={styles.section} data-section="verdict">
          <div className={styles.sectionHead}>
            <h2 className={styles.sectionTitle}>The verdict</h2>
            <p className={styles.mono}>Dated · Honest</p>
          </div>
          <div className={styles.verdictPanel}>
            {lab.verdict.winner ? (
              <p className={styles.verdictWinner}>{lab.verdict.winner}</p>
            ) : null}
            <p className={styles.verdictCall}>{lab.verdict.callText}</p>
            <p className={styles.freshness}>
              <span>Freshness</span>
              {lab.verdict.freshnessNote}
            </p>
          </div>
        </section>

        <section className={styles.section} data-section="try-it">
          <div className={styles.sectionHead}>
            <h2 className={styles.sectionTitle}>Try it yourself</h2>
            <p className={styles.mono}>Free · 15 minutes</p>
          </div>
          <ol className={styles.tryList}>
            {lab.tryItYourself.map((step, index) => (
              <li className={styles.tryItem} key={index}>
                {step}
              </li>
            ))}
          </ol>
        </section>

        <div className={styles.footRow}>
          <Link href="/labs" className={styles.buttonOutline}>
            Back to all labs
          </Link>
          <Link href="/pricing" className={styles.buttonSolid}>
            See the course
          </Link>
        </div>
      </div>
    </div>
  )
}
