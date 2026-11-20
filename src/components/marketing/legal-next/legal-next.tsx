import type { ReactNode } from "react"
import p from "@/components/marketing/paper/paper.module.css"
import { LegalSpy } from "./legal-spy"
import styles from "./legal-next.module.css"

/**
 * The shell for the legal pages (`/terms`, `/privacy`) in the family look
 * (19 Nov 2026, the Fable public pages round). LAYOUT AND READABILITY ONLY:
 * the legal text is passed in as children and not one word, number, heading
 * or section order is touched here.
 *
 * What the shell does:
 * - Sets the text in a comfortable measure with the contents list beside it
 *   on a wide screen, where it stays in view and marks the section being
 *   read (`LegalSpy`).
 * - `/terms` carries its own "Table of contents" inside the text. It is left
 *   exactly where it is in the document, and only PLACED in the side column
 *   by the stylesheet, so the page reads in the same order as before to a
 *   screen reader, a search engine and a copy and paste. On a phone it sits
 *   in the text, after the opening paragraph, as it always did.
 * - `/privacy` has no contents list of its own, so the route passes
 *   `contents`: the same section headings, in order. That list is the only
 *   thing on the page that was not there before.
 * - Prints cleanly: black on white, no menu or footer, no heading stranded
 *   at the foot of a sheet.
 */

export type LegalContentsItem = { id: string; label: string }

export function LegalNext({
  title,
  updated,
  contents,
  children,
}: {
  title: string
  updated: string
  /**
   * Section headings to list beside the text, for a page whose text has no
   * contents list of its own. Leave it out when the text already has one.
   */
  contents?: readonly LegalContentsItem[]
  children: ReactNode
}) {
  return (
    <div className={`${p.shell} ${styles.shell}`} data-legal>
      <LegalSpy />
      <section className={styles.masthead} data-section="masthead">
        <div className={p.page}>
          <h1 className={styles.title}>{title}</h1>
          <p className={styles.meta}>Updated {updated}</p>
        </div>
      </section>

      <section className={styles.body} data-section="legal-body">
        <div className={p.page}>
          {contents ? (
            <div className={styles.layout}>
              <nav className={styles.contents} aria-label="Table of contents" data-legal-contents>
                <h2>Table of contents</h2>
                <ol>
                  {contents.map((item) => (
                    <li key={item.id}>
                      <a href={`#${item.id}`}>{item.label}</a>
                    </li>
                  ))}
                </ol>
              </nav>
              <div className={styles.prose} data-legal-text>
                {children}
              </div>
            </div>
          ) : (
            <div className={`${styles.prose} ${styles.proseWithContents}`} data-legal-text>
              {children}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
