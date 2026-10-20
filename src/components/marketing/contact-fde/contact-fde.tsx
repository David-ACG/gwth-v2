import { ContactForm } from "@/components/contact/contact-form"
import styles from "./contact-fde.module.css"

/**
 * Contact page, in the PAPER-FIRST register: a two-column quiet masthead, then
 * the contact form as a rounded paper panel (measured boundary, rounded fields)
 * on the sage ground. Form behaviour lives in ContactForm unchanged.
 */
export function ContactFde() {
  return (
    <div className={styles.shell}>
      <section className={styles.masthead} data-section="masthead">
        <div className={styles.page}>
          <h1 className={styles.mastheadTitle}>
            Get in <em>touch</em>
          </h1>
          {/* No reply time: none is promised anywhere we can check, so the
              page only says how we reply (launch readiness review,
              2026-10-20). The walkthrough line is for visitors who arrive
              from "Book a walkthrough" on /for-institutions. */}
          <p className={styles.standfirst}>
            Have a question about the course, a gift, team pricing or anything
            else? Send us a message and we&apos;ll reply by email. If
            you&apos;d like us to show your organisation how the course works,
            ask in your message. GWTH is based in the United Kingdom.
          </p>
        </div>
      </section>

      <section className={styles.section} data-section="form">
        <div className={styles.page}>
          <div className={styles.panelColumn}>
            <ContactForm />
          </div>
        </div>
      </section>
    </div>
  )
}
