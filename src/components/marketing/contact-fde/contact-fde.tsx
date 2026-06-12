import { ContactForm } from "@/components/contact/contact-form"
import styles from "./contact-fde.module.css"

/**
 * Contact page in the FDE journal register: drenched teal masthead, then
 * the contact form as a paper panel (ink border, square hairline inputs)
 * on the sage ground. Form behaviour lives in ContactForm unchanged.
 */
export function ContactFde() {
  return (
    <div className={styles.shell}>
      <section className={styles.masthead} data-section="masthead">
        <div className={styles.page}>
          <p className={styles.mastheadKicker}>Contact</p>
          <h1 className={styles.mastheadTitle}>Get in Touch</h1>
          <p className={styles.standfirst}>
            Have a question about the course, team pricing, or anything else?
            Send us a message and we will get back to you. GWTH is based in
            the United Kingdom.
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
