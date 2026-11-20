import Link from "next/link"
import { COURSE_OPENS_ON } from "@/lib/launch-date"
import { WaitlistFdeForm } from "@/components/marketing/waitlist-fde/waitlist-fde-form"
import p from "@/components/marketing/paper/paper.module.css"
import { Reveal } from "@/components/marketing/start-here-next/reveal"
import styles from "@/components/marketing/contact-next/form-page.module.css"

/**
 * `/waitlist` in the family look (19 Nov 2026, the Fable public pages round):
 * the words on the left, the form on the right, then what happens next and
 * something to do while you wait.
 *
 * Every "Join the waitlist" button lands here until the course goes on sale;
 * from that day the proxy sends `/waitlist` to sign-up (`src/proxy.ts`), so
 * this page is only ever seen before `COURSE_OPENS_ON`.
 *
 * The form is `WaitlistFdeForm`, imported untouched: same two fields, same
 * validation, same call to `/api/waitlist`, same "You are on the waitlist"
 * state. The facts are the ones on the page this replaces (invite-only while
 * a small group of testers use it, the UK beta, written for the United
 * Kingdom), plus the opening date from `lib/launch-date`, which `/pricing`
 * prints too.
 */

const NEXT_STEPS = [
  "Leave your name and email address.",
  "We'll send you an email to confirm you're on the list.",
  "We'll email you again when more places open.",
] as const

export function WaitlistNext() {
  return (
    <div className={p.shell}>
      <section className={styles.hero} data-section="masthead">
        <div className={p.page}>
          <div className={styles.grid}>
            <div className={styles.head}>
              <h1 className={styles.title}>
                Join the <em>waitlist</em>
              </h1>
              <p className={styles.lead}>
                Access is invite-only while we work closely with a small group
                of testers. Leave your name and email address and we&apos;ll
                contact you when more places open.
              </p>
              <p className={styles.opens} data-testid="waitlist-opens">
                The course opens on {COURSE_OPENS_ON}.
              </p>
              <p className={styles.small}>
                Already invited?{" "}
                <Link href="/signup">Create your account</Link>.
              </p>
            </div>

            <div className={styles.form} data-section="form">
              <WaitlistFdeForm />
            </div>

            <Reveal className={styles.more} data-section="next">
              <h2 className={styles.moreTitle}>What happens next</h2>
              <ol className={styles.steps}>
                {NEXT_STEPS.map((line, index) => (
                  <li key={line}>
                    <span className={styles.stepNumber} aria-hidden="true">
                      {index + 1}
                    </span>
                    <span>{line}</span>
                  </li>
                ))}
              </ol>
              <p className={styles.small}>
                This is the UK beta. The course is written for the United
                Kingdom, so its projects use the forms, the rules and the
                money you already deal with here.
              </p>
              <p className={styles.small}>
                You don&apos;t have to wait to begin.{" "}
                <Link href="/start-here">Try the free lesson</Link> today.
              </p>
            </Reveal>
          </div>
        </div>
      </section>
    </div>
  )
}
