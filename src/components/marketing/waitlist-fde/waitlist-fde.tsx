import Link from "next/link"
import { WaitlistFdeForm } from "./waitlist-fde-form"
import styles from "@/components/marketing/contact-fde/contact-fde.module.css"

/**
 * Waitlist page, PAPER-FIRST register: a two-column quiet masthead, then
 * the email-capture form as a paper panel. Every "Join waitlist" CTA lands
 * here so un-invited visitors can actually leave their email (previously
 * those CTAs dead-ended on the invite-only /signup page). Reuses the
 * contact-fde stylesheet: the masthead + paper-panel anatomy is identical,
 * duplicating it would just fork the register.
 */
export function WaitlistFde() {
  return (
    <div className={styles.shell}>
      <section className={styles.masthead} data-section="masthead">
        <div className={styles.page}>
          <h1 className={styles.mastheadTitle}>
            Join the <em>Waitlist</em>
          </h1>
          <p className={styles.standfirst}>
            Access is invite-only while we work closely with a small group
            of testers. This is the UK beta, and the course is written for
            the United Kingdom, so the projects you will be asked to do use
            the forms, the rules and the money you already deal with here.
            Leave your name and email and we will contact you
            when more places open. Already invited?{" "}
            <Link href="/signup" className={styles.standfirstLink}>
              Create your account
            </Link>
            .
          </p>
        </div>
      </section>

      <section className={styles.section} data-section="form">
        <div className={styles.page}>
          <div className={styles.panelColumn}>
            <WaitlistFdeForm />
          </div>
        </div>
      </section>
    </div>
  )
}
