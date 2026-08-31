import { redirect } from "next/navigation"
import {
  canEditEdition,
  getRatificationQueue,
  requireOrgStaffOrRedirect,
} from "@/lib/data/org-admin"
import { RatificationControls } from "@/components/org/ratification-controls"
import { AdminEmptyState, formatDate, safe } from "../../admin/admin-shared"
import { LessonMeta, PreviewBanner, StateLabel, TierLabel } from "../org-shared"
import adminStyles from "../../admin/admin-fde.module.css"
import styles from "../org-fde.module.css"

/**
 * /org/ratification — the institution's sign-off queue (design 05 Q4).
 *
 * Every draft lesson in this edition: GWTH has written it for you, and your
 * learners cannot see it until you say so. Sending it back records why, and
 * the note stays on the card until the lesson is ratified — so the next
 * person to open this screen can see what was asked for.
 */
export default async function OrgRatificationPage() {
  const context = await requireOrgStaffOrRedirect()
  if (!canEditEdition(context.role)) redirect("/org")

  const queue = await safe(() => getRatificationQueue(context))

  return (
    <section className={adminStyles.section} data-section="org-ratification">
      {context.isPreview ? <PreviewBanner /> : null}

      <div className={adminStyles.sectionHead}>
        <h1 className={adminStyles.sectionTitle}>Ratification.</h1>
        <p className={adminStyles.mono}>
          {queue ? `${queue.length} awaiting you` : "Database unavailable"}
        </p>
      </div>
      <p className={adminStyles.sectionLead}>
        Lessons written for your edition, waiting on your sign-off. Nobody on
        your edition can see them until you ratify them. Send one back and it
        stays hidden while GWTH makes the changes you ask for.
      </p>

      {queue === null ? (
        <AdminEmptyState
          kicker="Database unavailable"
          title="The ratification queue cannot be read right now"
          body="Nothing has been changed. It returns as soon as the database is reachable."
        />
      ) : queue.length === 0 ? (
        <AdminEmptyState
          kicker="Nothing waiting"
          title="Everything in your edition is ratified"
          body="New lessons written for your edition appear here for sign-off. Until you ratify one, your learners do not see it."
        />
      ) : (
        queue.map((entry) => (
          <article
            key={entry.lessonId}
            className={styles.queueItem}
            data-section="ratification-item"
          >
            <div className={styles.queueHead}>
              <h2 className={styles.queueTitle}>{entry.title}</h2>
              <LessonMeta>Month {entry.month}</LessonMeta>
            </div>
            <div className={styles.lessonMeta}>
              <TierLabel tier={entry.tier} />
              <StateLabel
                state={entry.state}
                hasReviewNote={Boolean(entry.reviewNote)}
              />
              {entry.decidedAt ? (
                <LessonMeta>
                  Last decision {formatDate(entry.decidedAt)}
                </LessonMeta>
              ) : null}
            </div>
            {entry.reviewNote ? (
              <p className={styles.reviewNote}>
                You sent this back: {entry.reviewNote}
              </p>
            ) : null}
            <RatificationControls
              editionId={context.editionId}
              lessonId={entry.lessonId}
              lessonTitle={entry.title}
            />
          </article>
        ))
      )}
    </section>
  )
}
