import type { ReactNode } from "react"
import styles from "./legal-fde.module.css"

/**
 * Shared shell for the legal pages (/privacy, /terms) in the FDE journal
 * register: drenched teal masthead with a mono "Legal · Updated ..." kicker,
 * then the legal prose in a 62ch serif measure with hairline rules between
 * sections. The legal copy itself is passed verbatim as children.
 */
export function LegalFde({
  title,
  updated,
  children,
}: {
  title: string
  updated: string
  children: ReactNode
}) {
  return (
    <div className={styles.shell}>
      <section className={styles.masthead} data-section="masthead">
        <div className={styles.page}>
          <p className={styles.mastheadKicker}>Legal · Updated {updated}</p>
          <h1 className={styles.mastheadTitle}>{title}</h1>
        </div>
      </section>

      <section className={styles.body} data-section="legal-body">
        <div className={styles.page}>
          <div className={styles.prose}>{children}</div>
        </div>
      </section>
    </div>
  )
}
