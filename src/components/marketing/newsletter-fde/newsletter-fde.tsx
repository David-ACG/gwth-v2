import Link from "next/link"
import styles from "./newsletter-fde.module.css"
import { canPromoteLabs } from "@/lib/labs-cta"

const INCLUDES = [
  // Recovered (ledger C15) from docs/marketing/free-labs-and-newsletter.md.
  // "A practical AI tip you can use that day" names a category; the archive's
  // fuller line names the promise, which is the part a reader decides on.
  "A practical tip you can try in the next ten minutes, not theory and not hype",
  "Useful tool notes when something materially changes",
  "Course updates and new content previews",
]

const NOT_INCLUDES = [
  "No spam",
  "No sales pressure",
  "No vendor partnerships",
]

/**
 * Newsletter signup page, PAPER-FIRST register: a two-column quiet
 * masthead, a rounded paper-panel signup form (stubbed, as before), and unruled
 * feature lists for what the GWTH Weekly does and does not include.
 */
export function NewsletterFde() {
  return (
    <div className={styles.shell}>
      <section className={styles.masthead} data-section="masthead">
        <div className={styles.page}>
          <h1 className={styles.mastheadTitle}>
            The GWTH <em>Weekly</em>
          </h1>
          <p className={styles.standfirst}>
            One email per week. No spam. No sales pressure.
          </p>
        </div>
      </section>

      <section className={styles.section} data-section="signup">
        <div className={`${styles.page} ${styles.splitGrid}`}>
          <div className={styles.panel}>
            <form action="#" method="POST" className={styles.form}>
              <div className={styles.field}>
                <label htmlFor="email" className={styles.label}>
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  className={styles.input}
                  placeholder="you@example.com"
                  required
                  autoComplete="email"
                />
              </div>
              <button
                type="submit"
                className={`${styles.buttonSolid} ${styles.buttonFull}`}
              >
                Subscribe
              </button>
            </form>
            <p className={styles.panelFoot}>
              Unsubscribe any time, one click, no guilt trip.
            </p>
          </div>

          <div>
            <div className={styles.listBlock}>
              <div className={styles.listHead}>
                <h2 className={styles.listTitle}>What you get every week</h2>
              </div>
              <ul className={styles.hairlineList}>
                {INCLUDES.map((item) => (
                  <li key={item} className={styles.hairlineItem}>
                    <span className={styles.hairlineGlyph} aria-hidden="true">
                      +
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className={styles.listBlock}>
              <div className={styles.listHead}>
                <h2 className={styles.listTitle}>What we don&apos;t do</h2>
              </div>
              <ul className={styles.hairlineList}>
                {NOT_INCLUDES.map((item) => (
                  <li key={item} className={styles.hairlineItem}>
                    <span className={styles.hairlineGlyph} aria-hidden="true">
                      &times;
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <p className={styles.listNote}>
                We write about what works. If a tool is good, we say so. If it
                is not, we say that too. Nobody pays us to recommend anything.
              </p>
            </div>

            <div className={styles.ctaRow}>
              {canPromoteLabs() ? (
                <Link href="/labs" className={styles.buttonOutline}>
                  Try a free lab
                </Link>
              ) : (
                <Link href="/lessons" className={styles.buttonOutline}>
                  See the curriculum
                </Link>
              )}
              <Link href="/pricing" className={styles.buttonOutline}>
                See pricing
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
