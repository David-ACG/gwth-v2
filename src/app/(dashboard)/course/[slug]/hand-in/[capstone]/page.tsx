import type { Metadata } from "next"
import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { HandInForm } from "@/components/course/hand-in/hand-in-form"
import { MarkCard } from "@/components/course/hand-in/mark-card"
import styles from "@/components/course/hand-in/hand-in.module.css"
import { checkHandInAccess } from "@/lib/capstones/access"
import { requireSessionOrRedirect } from "@/lib/content-access"
import { loadMarkingGuide } from "@/lib/capstones/guide-loader"
import { HAND_IN_QUESTIONS, MAX_HAND_INS } from "@/lib/capstones/guides"
import { BAND_LABELS, STATUS_LABELS } from "@/lib/capstones/rules"
import { handInStore } from "@/lib/capstones/storage"
import { getHandInState } from "@/lib/data/capstone-hand-ins"
import { getMarkCards } from "@/lib/data/capstone-marks"

type PageProps = {
  params: Promise<{ slug: string; capstone: string }>
}

export const metadata: Metadata = {
  title: "Hand in your project",
  description: "Hand in your monthly project to be marked.",
}

/** Per request: the flag, the session and the learner's hand-ins are live. */
export const dynamic = "force-dynamic"
export const revalidate = 0

/**
 * The hand-in page for one capstone (beads gwth-launch-9289.2 and 9289.3).
 * Behind ENABLE_CAPSTONE_HAND_IN: with the flag off the route is a 404.
 */
export default async function HandInPage({ params }: PageProps) {
  // Server-validated session first (a forged cookie bounces here), then the
  // flag, course access and the month in checkHandInAccess.
  await requireSessionOrRedirect()
  const { slug, capstone } = await params
  const access = await checkHandInAccess(capstone)
  if (!access.ok) {
    if (access.status === 404) notFound()
    if (access.status === 401) redirect(`/login?next=${encodeURIComponent(`/course/${slug}/hand-in/${capstone}`)}`)
    return (
      <div className={styles.shell}>
        <h1 className={styles.title}>Hand in your project</h1>
        <p className={styles.lead}>{access.message}</p>
      </div>
    )
  }

  const [guide, state, marks] = await Promise.all([
    loadMarkingGuide(access.capstoneId),
    getHandInState(access.userId, access.capstoneId),
    getMarkCards(access.userId, access.capstoneId),
  ])
  // The newest marked hand-in gets the full card; the list shows them all.
  const latest = marks.cards[0] ?? null
  const open = handInStore() !== null
  const used = state.attempts.length

  return (
    <div className={styles.shell} data-section="hand-in">
      <p className={styles.back}>
        <Link href={`/course/${slug}`}>Back to the course</Link>
      </p>
      <header className={styles.head}>
        <h1 className={styles.title}>Hand in your {guide.title} project</h1>
        <p className={styles.lead}>
          Hand in your project folder and answer four short questions. We mark it against the marking guide for
          Month {guide.month}. You can hand it in up to {MAX_HAND_INS} times, and your best mark counts.
        </p>
      </header>

      {state.attempts.length > 0 && (
        <section className={styles.section} aria-labelledby="your-hand-ins">
          <h2 id="your-hand-ins" className={styles.h2}>
            Your hand-ins
          </h2>
          <ul className={styles.attempts}>
            {state.attempts.map((a) => (
              <li key={a.id} className={styles.attempt}>
                <span className={styles.attemptNo}>Hand-in {a.attemptNo}</span>
                <span>
                  {STATUS_LABELS[a.status]}
                  {a.band && (a.status === "provisional" || a.status === "final")
                    ? `: ${BAND_LABELS[a.band]}${a.total !== null ? `, ${a.total} out of 100` : ""}`
                    : ""}
                  {state.best?.id === a.id && state.attempts.length > 1 ? " (this one counts)" : ""}
                </span>
                <span className={styles.muted}>
                  {a.confirmedAt
                    ? new Date(a.confirmedAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })
                    : ""}
                </span>
              </li>
            ))}
          </ul>
          <p className={styles.note}>
            Your mark is provisional until David, the course founder, checks it within 7 days. This means it may change.
          </p>
        </section>
      )}

      {latest && <MarkCard capstoneId={guide.id} card={latest} query={marks.query} />}

      {!open ? (
        <p className={styles.notice} role="status">
          Hand-ins are not open yet. Please come back later.
        </p>
      ) : state.blockReason ? (
        <p className={styles.notice} role="status">
          {state.blockReason}
        </p>
      ) : (
        <HandInForm
          capstoneId={guide.id}
          attemptNo={used + 1}
          maxHandIns={MAX_HAND_INS}
          summary={guide.summary}
          ownLabel={guide.ownLabel}
          exampleLabel={guide.exampleLabel}
          nameKinds={guide.nameKinds.map((k) => k.label)}
          expectedFiles={guide.expectedFiles.map((f) => ({ id: f.id, label: f.label, required: f.required }))}
          questions={HAND_IN_QUESTIONS.map((q) => ({ id: q.id, question: q.question, help: q.help }))}
        />
      )}
    </div>
  )
}
