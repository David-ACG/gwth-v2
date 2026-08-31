import Link from "next/link"
import {
  canEditEdition,
  getOrgRoster,
  getRatificationQueue,
  requireOrgStaffOrRedirect,
  summariseRoster,
} from "@/lib/data/org-admin"
import { AdminEmptyState, safe } from "../admin/admin-shared"
import { PreviewBanner } from "./org-shared"
import adminStyles from "../admin/admin-fde.module.css"

/**
 * /org — the institution's overview.
 *
 * Four numbers (design 05 Q3, derived from the roster rather than a second
 * SQL pass) plus the two things that need a decision: how many lessons are
 * waiting for ratification, and what the pass mark currently is.
 *
 * The gate runs FIRST, before any read: App Router renders this page in
 * parallel with the layout, so a layout-only redirect would still stream this
 * organisation's numbers to an anonymous request.
 */
export default async function OrgOverviewPage() {
  const context = await requireOrgStaffOrRedirect()
  const canEdit = canEditEdition(context.role)

  const roster = await safe(() => getOrgRoster(context))
  const queue = await safe(() => getRatificationQueue(context))
  const summary =
    roster === null ? null : summariseRoster(roster, queue?.length ?? 0)

  return (
    <section className={adminStyles.section} data-section="org-overview">
      {context.isPreview ? <PreviewBanner /> : null}

      <div className={adminStyles.sectionHead}>
        <h1 className={adminStyles.sectionTitle}>{context.organisationName}.</h1>
        <p className={adminStyles.mono}>
          {context.editionName} · {context.editionStatus}
        </p>
      </div>
      <p className={adminStyles.sectionLead}>
        Your edition of {context.courseTitle}. One core body of content,
        curated for your people: you choose the optional lessons, sign off the
        lessons written for you, and set the pass mark your learners are
        measured against.
      </p>

      {summary === null ? (
        <AdminEmptyState
          kicker="Database unavailable"
          title="Your organisation's numbers cannot be read right now"
          body="They return as soon as the database is reachable. Nothing has been lost."
        />
      ) : (
        <div className={adminStyles.metricsRow}>
          <Metric
            value={summary.learners}
            caption="Learners on your edition"
            href="/org/learners"
          />
          <Metric
            value={summary.baselineMet}
            caption="Have met your baseline"
            href="/org/learners"
          />
          <Metric
            value={summary.active7d}
            caption="Active in the last 7 days"
            href="/org/learners"
          />
          {canEdit ? (
            <Metric
              value={summary.pendingRatification}
              caption="Lessons awaiting your ratification"
              href="/org/ratification"
              alert={summary.pendingRatification > 0}
            />
          ) : (
            <Metric
              value={summary.started}
              caption="Have started the course"
              href="/org/learners"
            />
          )}
        </div>
      )}

      {canEdit ? (
        <div className={adminStyles.panel} style={{ marginTop: "2rem" }}>
          <div className={adminStyles.panelHead}>
            <h2 className={adminStyles.panelTitle}>Pass mark: {context.passMark}%</h2>
            <p className={adminStyles.mono}>One per edition</p>
          </div>
          <p className={adminStyles.panelLead}>
            The score a learner must reach on a lesson quiz for it to count
            toward your baseline. Change it on the syllabus screen.
          </p>
          <Link href="/org/syllabus#pass-mark" className={adminStyles.buttonOutline}>
            Change the pass mark
          </Link>
        </div>
      ) : (
        <p className={adminStyles.sectionLead} style={{ marginTop: "2rem" }}>
          You have tutor access: you can see how your learners are getting on,
          and the edition itself is curated by your organisation&rsquo;s admin.
          The pass mark is currently {context.passMark}%.
        </p>
      )}
    </section>
  )
}

/** One overview number, linking to the screen that explains it. */
function Metric({
  value,
  caption,
  href,
  alert = false,
}: {
  value: number
  caption: string
  href: string
  alert?: boolean
}) {
  return (
    <Link
      href={href}
      className={`${adminStyles.metricCard} ${alert ? adminStyles.metricAlert : ""}`}
    >
      <span className={adminStyles.metricValue}>{value}</span>
      <span className={adminStyles.metricCaption}>{caption}</span>
    </Link>
  )
}
