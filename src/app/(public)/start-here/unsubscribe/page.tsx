import type { Metadata } from "next"
import Link from "next/link"
import { verifyToken } from "@/lib/start-here/consent"
import p from "@/components/marketing/paper/paper.module.css"
import styles from "@/components/marketing/start-here/start-here.module.css"

export const metadata: Metadata = {
  title: "Stop GWTH course news",
  robots: { index: false, follow: false },
}

type PageProps = { searchParams: Promise<{ t?: string; done?: string; failed?: string }> }

/**
 * The opt-out link in every Start Here email (bead gwth-launch-xw6s). The line
 * under the sign-up form promises "You can opt out in any email", so this is
 * one press, no sign-in. It asks first rather than acting on the link alone,
 * because inbox link checkers open links without a person clicking.
 */
export default async function StartHereUnsubscribePage({ searchParams }: PageProps) {
  const sp = await searchParams
  const valid = verifyToken("unsubscribe", sp.t) !== null

  let body: React.ReactNode
  if (sp.done === "1") {
    body = (
      <>
        <h1 className={styles.insideTitle}>You won&apos;t get GWTH course news</h1>
        <p>We&apos;ve taken this email address off the course news list. You can still read Start Here.</p>
        <Link href="/start-here" className={p.buttonOutline}>
          Back to Start Here
        </Link>
      </>
    )
  } else if (sp.failed === "1" || !valid) {
    body = (
      <>
        <h1 className={styles.insideTitle}>This link doesn&apos;t work</h1>
        <p>
          Reply to any GWTH email and ask us to stop course news, and we&apos;ll take your address off the list.
        </p>
      </>
    )
  } else {
    body = (
      <>
        <h1 className={styles.insideTitle}>Stop GWTH course news?</h1>
        <p>We&apos;ll stop sending course news to this email address. You can still read Start Here.</p>
        <form method="post" action={`/api/start-here/unsubscribe?t=${encodeURIComponent(sp.t ?? "")}`}>
          <button type="submit" className={p.buttonSolid} data-testid="start-here-unsubscribe">
            Stop course news
          </button>
        </form>
      </>
    )
  }

  return (
    <div className={p.shell}>
      <section className={styles.bottomSection}>
        <div className={p.page}>
          <div className={styles.panel}>{body}</div>
        </div>
      </section>
    </div>
  )
}
