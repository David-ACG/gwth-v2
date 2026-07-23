import Link from "next/link"
import type { Lab, ModelArenaLab } from "@/lib/types"
import { formatTestedOn } from "@/lib/data/model-arena"
import { formatDate } from "@/lib/utils"
import styles from "./labs-fde.module.css"

/**
 * Props for {@link LabsFde}.
 */
interface LabsFdeProps {
  /** The ~6 labs currently in rotation, newest test first. */
  liveLabs: ModelArenaLab[]
  /** Archived arena labs (superseded matchups kept for comparison). */
  archivedArenaLabs: ModelArenaLab[]
  /** Retired tiered-format labs, kept read-only as part of the archive. */
  legacyArchive: Lab[]
}

/** A single reason the Model Arena format exists, shown in the explainer row. */
const HOW_IT_WORKS: ReadonlyArray<{ title: string; body: string }> = [
  {
    title: "One task, two tools.",
    body: "A real job you would actually give an AI, handed to two models with the exact same prompt.",
  },
  {
    title: "You judge, we date it.",
    body: "Outputs sit side by side with a rubric a beginner can follow, and a verdict stamped with the models and the date.",
  },
  {
    title: "Fresh now, kept forever.",
    body: "Only a handful run at once, because models change. Old ones move to the archive so you can watch the tools improve.",
  },
]

/**
 * A short archive row describing one superseded lab.
 */
interface ArchiveRow {
  /** Stable key. */
  key: string
  /** Destination detail route. */
  href: string
  /** Lab title. */
  title: string
  /** Mono meta line (matchup or category). */
  meta: string
  /** Human date the lab was current. */
  date: string
}

/**
 * Free labs landing in the Model Arena format (FDE journal register).
 *
 * A lab is a head-to-head test: two AI tools run the same realistic task, their
 * outputs shown verbatim side by side, with a beginner rubric and a dated
 * verdict. Labs complement lessons rather than overlap them: lessons teach you
 * HOW, labs show you WHICH TOOL WHEN. Only a handful are live at once because
 * models keep changing, and superseded ones move to a dated archive.
 *
 * Structure: drenched teal masthead, a "how it works" explainer, a LIVE NOW
 * card row, a dated ARCHIVE list (arena first, then retired tiered labs), and a
 * closing band pointing at the course. Everything is free and needs no account.
 */
export function LabsFde({
  liveLabs,
  archivedArenaLabs,
  legacyArchive,
}: LabsFdeProps) {
  const archiveRows: ArchiveRow[] = [
    ...archivedArenaLabs.map((lab) => ({
      key: lab.id,
      href: `/labs/${lab.slug}`,
      title: lab.title,
      meta: `${lab.matchup[0].name} vs ${lab.matchup[1].name}${
        lab.category ? ` · ${lab.category}` : ""
      }`,
      date: formatTestedOn(lab.testedOn),
    })),
    ...legacyArchive.map((lab) => ({
      key: lab.id,
      href: `/labs/${lab.slug}`,
      title: lab.title,
      meta: `${lab.category || "Lab"} · Retired format`,
      date: formatDate(lab.updatedAt),
    })),
  ]

  return (
    <div className={styles.shell}>
      <section className={styles.masthead} data-section="masthead">
        <div className={styles.page}>
          <p className={styles.mastheadKicker}>The Model Arena · Free, no account</p>
          <h1 className={styles.mastheadTitle}>
            Two tools, one task. <em>You judge.</em>
          </h1>
          <p className={styles.standfirst}>
            Each lab runs two AI tools head to head on a real job, with the same
            prompt, and shows you both answers side by side. A short rubric helps
            you call the winner. Lessons teach you how; labs show you which tool
            when.
          </p>
          <div className={styles.mastheadActions}>
            {liveLabs[0] ? (
              <Link
                href={`/labs/${liveLabs[0].slug}`}
                className={styles.buttonSolid}
              >
                Open the live lab
              </Link>
            ) : null}
            <Link href="/pricing" className={styles.buttonOutline}>
              See the course
            </Link>
          </div>
          <div className={styles.mastheadFoot}>
            <p>Read free · No account needed</p>
            <p>New matchups as the models change</p>
          </div>
        </div>
      </section>

      <section className={styles.explainer} data-section="how-it-works">
        <div className={styles.page}>
          <div className={styles.explainerRow}>
            {HOW_IT_WORKS.map((item) => (
              <div key={item.title} className={styles.explainerItem}>
                <h2 className={styles.explainerTitle}>{item.title}</h2>
                <p>{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.section} data-section="live-labs">
        <div className={styles.page}>
          <div className={styles.sectionHead}>
            <h2 className={styles.sectionTitle}>Live now.</h2>
            <p className={styles.mono}>
              {liveLabs.length} in the arena
            </p>
          </div>

          {liveLabs.length === 0 ? (
            <div className={styles.empty}>
              <h3>No live labs right now.</h3>
              <p>
                The next matchups are being prepared. In the meantime, the
                archive below shows how the tools compared last time.
              </p>
            </div>
          ) : (
            <div className={styles.cardsRow}>
              {liveLabs.map((lab) => (
                <Link
                  href={`/labs/${lab.slug}`}
                  className={styles.card}
                  data-testid="arena-lab-card"
                  key={lab.id}
                >
                  <div className={`${styles.cardTop} ${styles.flvTeal}`}>
                    <span>{lab.category || "Lab"}</span>
                    <span>Live</span>
                  </div>
                  <div className={styles.cardBody}>
                    <p className={styles.cardMatchup}>
                      {lab.matchup[0].name} vs {lab.matchup[1].name}
                    </p>
                    <h3>{lab.title}</h3>
                    <p className={styles.cardBrief}>{lab.brief}</p>
                    <p className={styles.cardStatLine}>
                      <strong>Tested</strong>
                      {formatTestedOn(lab.testedOn)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className={styles.section} data-section="archive">
        <div className={styles.page}>
          <div className={styles.sectionHead}>
            <h2 className={styles.sectionTitle}>The archive.</h2>
            <p className={styles.mono}>
              {archiveRows.length} older {archiveRows.length === 1 ? "lab" : "labs"}
            </p>
          </div>
          <p className={styles.sectionLead}>
            Nothing is deleted when a lab goes out of date. Kept here, the
            archive shows how the tools compared at a point in time, which only
            gets more useful as newer models arrive.
          </p>

          {archiveRows.length === 0 ? (
            <div className={styles.empty}>
              <h3>The archive is empty.</h3>
              <p>Once a live lab is superseded it will appear here, dated.</p>
            </div>
          ) : (
            <ul className={styles.archiveList}>
              {archiveRows.map((row) => (
                <li key={row.key} className={styles.archiveItem}>
                  <Link
                    href={row.href}
                    className={styles.archiveLink}
                    data-testid="archive-lab-row"
                  >
                    <span className={styles.archiveMain}>
                      <span className={styles.archiveTitle}>{row.title}</span>
                      <span className={styles.archiveMeta}>{row.meta}</span>
                    </span>
                    <span className={styles.archiveTail}>
                      <span className={styles.archiveBadge}>Archived</span>
                      <span className={styles.archiveDate}>{row.date}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section className={styles.closing} data-section="closing">
        <div className={styles.page}>
          <h2>
            Labs show you which tool. <em>The course shows you how.</em>
          </h2>
          <p>
            The labs are the free taster. The course is three months of building
            with AI: plain English, real projects, and progress you can see.
          </p>
          <div className={styles.closingActions}>
            <Link href="/pricing" className={styles.buttonSolid}>
              See the course
            </Link>
            <Link href="/about" className={styles.buttonOutline}>
              About GWTH
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
