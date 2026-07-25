import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { getDashboardUser } from "@/lib/auth"
import { ReportProblemPanel } from "@/components/feedback/report-problem-panel"
import styles from "./guide-fde.module.css"
import { requireContentAccessOrRedirect } from "@/lib/content-access"

export const metadata: Metadata = {
  title: "Beta tester guide",
  description:
    "What the GWTH.ai beta includes, what is deliberately switched off, and how to report problems.",
}

/**
 * Always evaluate the Better Auth session per request. Without this the page is
 * statically prerendered at build time (when no DATABASE_URL is present), which
 * would serve the gated guide to anonymous visitors.
 */
export const dynamic = "force-dynamic"

/**
 * Paired with force-dynamic so the W25 content gate is evaluated per request
 * and can never be served from a cached or prerendered render.
 */
export const revalidate = 0

/**
 * Negates the dashboard layout padding so the teal masthead band runs
 * edge-to-edge inside the max-w-[1400px] wrapper, matching the other dashboard
 * FDE surfaces (DASHBOARD_BREAKOUT).
 */
const BREAKOUT = "-mx-4 md:-mx-6 lg:-mx-8 -my-4 md:-my-6 lg:-my-8"

/**
 * /guide — the authenticated beta tester guide (W5).
 *
 * Gated on the Better Auth session via the data-layer accessor (getDashboardUser
 * resolves the real session, or the dev mock learner when ENABLE_DEV_MOCK_USER
 * is set). Anonymous visitors are redirected to /login.
 *
 * Two columns in the FDE journal register: the guide content (what the beta
 * includes, what is deliberately missing, how to report) on the left, and the
 * always-in-view "report a problem" panel on the right. Single column below
 * 60rem (so it is single-column well before 412px).
 */
export default async function GuidePage() {
  await requireContentAccessOrRedirect()

  const user = await getDashboardUser()
  if (!user) redirect("/login")

  return (
    <div className={BREAKOUT}>
      <div className={styles.shell}>
        <header className={styles.masthead}>
          <div className={styles.page}>
            <p className={styles.mastheadKicker}>Beta tester guide</p>
            <h1 className={styles.mastheadTitle}>
              Welcome to the <em>beta.</em>
            </h1>
            <p className={styles.standfirst}>
              Thank you for testing GWTH.ai early. This page explains what is
              ready, what is switched off on purpose, and how to tell us when
              something is wrong. The quickest way to help is the report panel,
              always to hand on the right.
            </p>
          </div>
        </header>

        <div className={styles.body}>
          <div className={styles.page}>
            <div className={styles.layout}>
              <main>
                {/* Block 1 — what the beta includes */}
                <section className={styles.block}>
                  <div className={styles.blockHead}>
                    <h2 className={styles.blockTitle}>What is included</h2>
                    <p className={styles.mono}>Month 1</p>
                  </div>
                  <p className={styles.lead}>
                    The beta opens up the first month of the course in full. You
                    have everything you need to learn and build straight away.
                  </p>
                  <div className={styles.list}>
                    <div className={styles.listItem}>
                      <span aria-hidden="true" className={styles.listMark} />
                      <span>
                        <strong>Month 1 lessons.</strong> Every lesson for the
                        first month to read and work through, with video and
                        narration rolling out lesson by lesson during the beta.
                      </span>
                    </div>
                    <div className={styles.listItem}>
                      <span aria-hidden="true" className={styles.listMark} />
                      <span>
                        <strong>Month 1 labs.</strong> The hands-on builds that
                        go with the lessons, ready to work through.
                      </span>
                    </div>
                    <div className={styles.listItem}>
                      <span aria-hidden="true" className={styles.listMark} />
                      <span>
                        <strong>Your dashboard and progress.</strong> Lesson
                        progress and your place in the course are tracked as you
                        go.
                      </span>
                    </div>
                  </div>
                </section>

                {/* Block 2 — what is deliberately missing */}
                <section className={styles.block}>
                  <div className={styles.blockHead}>
                    <h2 className={styles.blockTitle}>
                      What is <em>deliberately</em> missing
                    </h2>
                    <p className={styles.mono}>Not bugs</p>
                  </div>
                  <p className={styles.lead}>
                    A few things are switched off on purpose for the beta. These
                    are not faults, so please do not report them as bugs. They
                    arrive later.
                  </p>
                  <div className={styles.rows}>
                    <div className={styles.row}>
                      <span className={styles.rowLabel}>Billing</span>
                      <span className={styles.rowBody}>
                        There is <strong>no payment or checkout</strong> during
                        the beta. Your access is granted by hand and is free.
                      </span>
                    </div>
                    <div className={styles.row}>
                      <span className={styles.rowLabel}>GWTH Score</span>
                      <span className={styles.rowBody}>
                        The <strong>GWTH Score</strong> is hidden for now. Any
                        score panels you glimpse are not final.
                      </span>
                    </div>
                    <div className={styles.row}>
                      <span className={styles.rowLabel}>Months 2 to 3</span>
                      <span className={styles.rowBody}>
                        Only <strong>Month 1</strong> is open. Later months are
                        locked and release on a schedule.
                      </span>
                    </div>
                    <div className={styles.row}>
                      <span className={styles.rowLabel}>Tech Radar</span>
                      <span className={styles.rowBody}>
                        The <strong>Tech Radar</strong> is not part of the beta
                        and is left out of the navigation.
                      </span>
                    </div>
                  </div>
                </section>

                {/* Block 3 — how to report problems */}
                <section className={styles.block}>
                  <div className={styles.blockHead}>
                    <h2 className={styles.blockTitle}>How to report problems</h2>
                    <p className={styles.mono}>Feedback</p>
                  </div>
                  <p className={styles.lead}>
                    Use the report panel on the right at any time. From the
                    dashboard or a lesson, the same panel is one tap away on the
                    floating report a problem button, and it remembers which page
                    you were on.
                  </p>
                  <p className={styles.lead}>What helps us most:</p>
                  <div className={styles.list}>
                    <div className={styles.listItem}>
                      <span aria-hidden="true" className={styles.listMark} />
                      <span>
                        <strong>What you did,</strong> step by step, so we can
                        repeat it.
                      </span>
                    </div>
                    <div className={styles.listItem}>
                      <span aria-hidden="true" className={styles.listMark} />
                      <span>
                        <strong>What you expected</strong> to happen, and what
                        happened instead.
                      </span>
                    </div>
                    <div className={styles.listItem}>
                      <span aria-hidden="true" className={styles.listMark} />
                      <span>
                        <strong>Where it happened.</strong> The page is captured
                        for you, so a short note is enough.
                      </span>
                    </div>
                    <div className={styles.listItem}>
                      <span aria-hidden="true" className={styles.listMark} />
                      <span>
                        <strong>Anything confusing,</strong> even if it is not
                        broken. Wording and pacing notes are welcome.
                      </span>
                    </div>
                  </div>
                  <p className={styles.mobileHint}>
                    The report panel is just below.
                  </p>
                </section>
              </main>

              <aside className={styles.rightCol}>
                <ReportProblemPanel sourcePath="/guide" variant="inline" />
              </aside>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
