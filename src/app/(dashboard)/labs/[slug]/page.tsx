import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getLab } from "@/lib/data/labs"
import { getLabProgress } from "@/lib/data/progress"
import { MarkdownRenderer } from "@/components/shared/markdown-renderer"
import { formatDuration } from "@/lib/utils"
import styles from "./lab-fde.module.css"

type PageProps = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const lab = await getLab(slug)
  if (!lab) return { title: "Lab Not Found" }

  return {
    title: lab.title,
    description: lab.description,
  }
}

/**
 * Lab viewer page with instructions, resources, and step tracker.
 * FDE journal register: §5.2 section head with mono meta row, serif
 * reading measure for instructions, §4.5 dash-progress + hairline
 * step rows with status glyph and text.
 */
export default async function LabDetailPage({ params }: PageProps) {
  const { slug } = await params
  const [lab, progress] = await Promise.all([
    getLab(slug),
    getLabProgress(slug),
  ])

  if (!lab) notFound()

  const totalSteps = lab.instructions.length
  // No progress row means the lab is honestly not started (W14): step 0,
  // every step "Not started". Real accounts have no lab fixtures.
  const currentStep = progress?.currentStep ?? 0

  /** Status per step: colour + glyph + text, never colour alone. */
  const stepStatus = (step: number) => {
    if (step < currentStep)
      return (
        <span className={`${styles.status} ${styles.statusDone}`}>
          <span className={styles.glyph} aria-hidden="true">
            ✓
          </span>
          Done
        </span>
      )
    if (step === currentStep)
      return (
        <span className={`${styles.status} ${styles.statusActive}`}>
          <span className={styles.glyph} aria-hidden="true">
            ▸
          </span>
          In progress
        </span>
      )
    return (
      <span className={`${styles.status} ${styles.statusPending}`}>
        <span className={styles.glyph} aria-hidden="true">
          ○
        </span>
        Not started
      </span>
    )
  }

  return (
    <div className={styles.shell} data-section="lab-detail">
      {/* Lab header (§5.2 section head + mono meta row, no pills) */}
      <header>
        <div className={styles.head}>
          <h1 className={styles.title}>{lab.title}</h1>
          <p className={styles.mono}>Lab · {lab.category}</p>
        </div>
        <p className={styles.lead}>{lab.description}</p>
        <p className={styles.metaRow}>
          {lab.difficulty} · {formatDuration(lab.duration)}
          {lab.isPremium && " · Pro"}
        </p>
        {lab.technologies.length > 0 && (
          <p className={styles.techRow}>{lab.technologies.join(" · ")}</p>
        )}
      </header>

      {/* Step progress (§4.5 dash-progress, paired with text) */}
      {totalSteps > 0 && (
        <div className={styles.progressWrap}>
          <div className={styles.dashes} aria-hidden="true">
            {Array.from({ length: totalSteps }, (_, dash) => (
              <span
                key={dash}
                data-active={dash < currentStep ? "true" : undefined}
              />
            ))}
          </div>
          <p className={styles.progressText}>
            {currentStep > 0
              ? `Step ${currentStep}/${totalSteps}`
              : `Not started · ${totalSteps} steps`}
          </p>
        </div>
      )}

      {/* Learning outcomes */}
      <section>
        <div className={styles.sectionHead}>
          <h2 className={styles.sectionTitle}>What You&apos;ll Learn</h2>
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

      {/* Instructions */}
      <section>
        <div className={styles.sectionHead}>
          <h2 className={styles.sectionTitle}>Instructions</h2>
          <p className={styles.mono}>
            {totalSteps} steps · {formatDuration(lab.duration)}
          </p>
        </div>
        {lab.instructions.map((step) => (
          <div key={step.step} className={styles.stepRow}>
            <div className={styles.stepHead}>
              <p className={styles.stepKicker}>
                Step {String(step.step).padStart(2, "0")} of {totalSteps}
              </p>
              {stepStatus(step.step)}
            </div>
            <h3 className={styles.stepTitle}>{step.title}</h3>
            <div className={styles.reading}>
              <MarkdownRenderer content={step.content} />
            </div>
          </div>
        ))}
      </section>
    </div>
  )
}
