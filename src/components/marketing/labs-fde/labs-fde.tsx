import Link from "next/link"
import Image from "next/image"
import type { Lab } from "@/lib/types"
import { formatDuration } from "@/lib/utils"
import { LabsFdeFilter } from "./labs-fde-filter"
import styles from "./labs-fde.module.css"

/**
 * Colour-block card headers keyed by difficulty so the colour itself reads
 * as a difficulty signal: teal for beginner, moss for intermediate, rust
 * for advanced.
 */
const DIFFICULTY_FLAVOURS: Record<Lab["difficulty"], string> = {
  beginner: styles.flvTeal ?? "",
  intermediate: styles.flvMoss ?? "",
  advanced: styles.flvRust ?? "",
}

/**
 * Props for {@link LabsFde}.
 */
interface LabsFdeProps {
  /** Labs to display, already filtered by the page's search params. */
  labs: Lab[]
  /** Available lab categories for the filter bar. */
  categories: string[]
  /** Available technologies for the filter bar. */
  technologies: string[]
}

/**
 * Free Labs page in the FDE journal register, matching the chosen homepage
 * direction (home-fde/): drenched teal masthead with a serif headline,
 * journal-style lab cards with colour-block tops and the lab illustrations,
 * a flat filter bar synced to URL params, and a closing band that points at
 * the course. Scoped palette variables give full light/dark parity.
 */
export function LabsFde({ labs, categories, technologies }: LabsFdeProps) {
  return (
    <div className={styles.shell}>
      <section className={styles.masthead} data-section="masthead">
        <div className={styles.page}>
          <p className={styles.mastheadKicker}>
            Free labs · No account required
          </p>
          <h1 className={styles.mastheadTitle}>
            Build something real <em>this afternoon.</em>
          </h1>
          <p className={styles.standfirst}>
            Hands-on labs in the same format as the course: plain English,
            step-by-step instructions, and a finished project at the end.
            Read them free, no account needed.
          </p>
          <div className={styles.mastheadActions}>
            <Link href="/waitlist" className={styles.buttonSolid}>
              Join waitlist
            </Link>
          </div>
          <div className={styles.mastheadFoot}>
            <p>Free forever · Same format as the course</p>
            <p>30 to 90 minutes each</p>
          </div>
        </div>
      </section>

      <section className={styles.section} data-section="labs-grid">
        <div className={styles.page}>
          <div className={styles.sectionHead}>
            <h2 className={styles.sectionTitle}>Pick a project.</h2>
            <p className={styles.mono}>
              {labs.length} {labs.length === 1 ? "lab" : "labs"}
            </p>
          </div>
          <LabsFdeFilter categories={categories} technologies={technologies} />

          {labs.length === 0 ? (
            <div className={styles.empty}>
              <h3>No labs match those filters.</h3>
              <p>
                Try a different combination, or clear everything and browse
                the full list.
              </p>
              <Link href="/labs" className={styles.buttonOutline}>
                Clear filters
              </Link>
            </div>
          ) : (
            <div className={styles.cardsRow}>
              {labs.map((lab) => (
                <Link
                  href={`/labs/${lab.slug}`}
                  className={styles.card}
                  data-testid="lab-card"
                  key={lab.id}
                >
                  <div
                    className={`${styles.cardTop} ${
                      DIFFICULTY_FLAVOURS[lab.difficulty]
                    }`}
                  >
                    <span>{lab.category}</span>
                    <span>{lab.isPremium ? "Pro" : "Free"}</span>
                  </div>
                  {lab.image ? (
                    <div className={styles.cardImage}>
                      <Image
                        src={lab.image}
                        alt={lab.title}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    </div>
                  ) : null}
                  <div className={styles.cardBody}>
                    <h3>{lab.title}</h3>
                    <p>{lab.description}</p>
                    <p className={styles.cardTech}>
                      {lab.technologies.join(" · ")}
                    </p>
                    <p className={styles.cardStatLine}>
                      <strong>{formatDuration(lab.duration)}</strong>
                      {lab.difficulty}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className={styles.closing} data-section="closing">
        <div className={styles.page}>
          <h2>
            Finished one? <em>The course is three months of this.</em>
          </h2>
          <p>
            Every course month works the same way: build, automate, research,
            and ship, with plain progress tracking as you go.
          </p>
          <div className={styles.closingActions}>
            <Link href="/waitlist" className={styles.buttonSolid}>
              Join waitlist
            </Link>
            <Link href="/pricing" className={styles.buttonOutline}>
              See pricing
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
