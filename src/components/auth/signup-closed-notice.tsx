import Link from "next/link"
import styles from "@/components/auth/auth-fde.module.css"

/**
 * Registration-closed panel, shown on /signup while `PRIVATE_CONTENT_MODE` is
 * on (W25).
 *
 * Cosmetic only. The real block is `emailAndPassword.disableSignUp` (and the
 * per-provider equivalent) in `src/lib/better-auth.ts`, which makes
 * POST /api/auth/sign-up/email answer 400: hiding a form is not security. This
 * panel exists so a visitor who follows an old signup link gets an honest
 * explanation and somewhere to go, rather than a form that would fail.
 *
 * Same FDE journal anatomy as the other auth surfaces (mono kicker above a
 * serif headline, paper panel, hairline rules, square corners) so it does not
 * read as an error state.
 */
export function SignupClosedNotice() {
  return (
    <div className={styles.panel}>
      <div className={styles.panelHead}>
        <p className={styles.panelKicker}>Registration closed</p>
        <h1 className={styles.title}>Accounts are not open yet.</h1>
        <p className={styles.subtitle}>
          GWTH is in a private build. New accounts are paused while the course
          is finished, so there is nothing to sign up for today.
        </p>
      </div>

      <p className={styles.notice}>
        Join the waitlist and we will write to you when places open. If you have
        already been given an account, sign in as usual.
      </p>

      <div className={styles.actions}>
        <Link href="/waitlist" className={styles.buttonSolid}>
          Join the waitlist
        </Link>
        <Link href="/login" className={styles.buttonOutline}>
          Sign in
        </Link>
      </div>

      <p className={styles.altPrompt}>
        Want to know what is being built?{" "}
        <Link href="/lessons" className={styles.link}>
          Read the curriculum
        </Link>
        .
      </p>
    </div>
  )
}
