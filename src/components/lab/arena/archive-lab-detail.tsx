import Link from "next/link"
import type { Lab } from "@/lib/types"
import { MarkdownRenderer } from "@/components/shared/markdown-renderer"
import { formatDate, formatDuration } from "@/lib/utils"
import styles from "./arena-detail.module.css"

/**
 * Props for {@link ArchiveLabDetail}.
 */
interface ArchiveLabDetailProps {
  /** The retired tiered-format lab to present read-only. */
  lab: Lab
}

/**
 * Read-only archive view for a retired tiered-format lab, in the FDE journal
 * register. The tiered lab format was retired in favour of the Model Arena
 * format (David, 2026-07-22), but no lab is ever deleted: old labs are kept as
 * a dated archive. This renders the lab's original content unchanged (its
 * outcomes and instructions) behind a clear archived banner, with the
 * interactive step tracker removed because there is nothing to progress.
 */
export function ArchiveLabDetail({ lab }: ArchiveLabDetailProps) {
  const totalSteps = lab.instructions.length

  return (
    <div className={styles.shell} data-section="archive-lab-detail">
      <header className={styles.matchup}>
        <div className={styles.page}>
          <p className={styles.matchupKicker}>
            Archive{lab.category ? ` · ${lab.category}` : ""} · Retired format
          </p>
          <h1 className={styles.matchupTitle}>{lab.title}</h1>
          <div className={styles.matchupFoot}>
            <p>Archived {formatDate(lab.updatedAt)}</p>
            <p>{formatDuration(lab.duration)} · Kept for reference</p>
          </div>
        </div>
      </header>

      <div className={styles.page}>
        <div className={styles.archivedBanner} data-testid="archived-banner">
          <span className={styles.badge}>Archived</span>
          <p>
            This is an older lab from the retired step-by-step format, kept for
            reference. The current labs are head-to-head Model Arena tests. Its
            content below is unchanged.
          </p>
        </div>

        <section className={styles.section} data-section="about">
          <div className={styles.sectionHead}>
            <h2 className={styles.sectionTitle}>About this lab</h2>
            <p className={styles.mono}>Overview</p>
          </div>
          <p className={styles.archiveLead}>{lab.description}</p>
          {lab.technologies.length > 0 ? (
            <p className={styles.metaRow}>{lab.technologies.join(" · ")}</p>
          ) : null}
        </section>

        {lab.learningOutcomes.length > 0 ? (
          <section className={styles.section} data-section="outcomes">
            <div className={styles.sectionHead}>
              <h2 className={styles.sectionTitle}>What it covered</h2>
              <p className={styles.mono}>Outcomes</p>
            </div>
            <ul className={styles.outcomeList}>
              {lab.learningOutcomes.map((outcome) => (
                <li key={outcome} className={styles.outcomeRow}>
                  <span className={styles.outcomeGlyph} aria-hidden="true">
                    ✓
                  </span>
                  {outcome}
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {totalSteps > 0 ? (
          <section className={styles.section} data-section="instructions">
            <div className={styles.sectionHead}>
              <h2 className={styles.sectionTitle}>Instructions</h2>
              <p className={styles.mono}>{totalSteps} steps</p>
            </div>
            {lab.instructions.map((step) => (
              <div key={step.step} className={styles.stepRow}>
                <p className={styles.stepKicker}>
                  Step {String(step.step).padStart(2, "0")} of {totalSteps}
                </p>
                <h3 className={styles.stepTitle}>{step.title}</h3>
                <div className={styles.reading}>
                  <MarkdownRenderer content={step.content} />
                </div>
              </div>
            ))}
          </section>
        ) : null}

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
