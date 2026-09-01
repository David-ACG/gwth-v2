import { redirect } from "next/navigation"
import {
  canEditEdition,
  getRatificationQueue,
  requireOrgStaffOrRedirect,
  splitRatificationQueue,
  type EditionSyllabusEntry,
} from "@/lib/data/org-admin"
import { RatificationControls } from "@/components/org/ratification-controls"
import { AdminEmptyState, formatDate, safe } from "../../admin/admin-shared"
import { LessonMeta, PreviewBanner, StateLabel, TierLabel } from "../org-shared"
import adminStyles from "../../admin/admin-fde.module.css"
import styles from "../org-fde.module.css"

/**
 * /org/ratification — the institution's sign-off queue (design 05 Q4).
 *
 * Two lists, not one (QA round-2 defect 4): lessons waiting on the
 * INSTITUTION, and lessons the institution has already sent back, which are
 * waiting on GWTH. Presenting the second group as "awaiting you" made the
 * screen nag about work the admin had already done, and made the overview
 * count it as outstanding.
 *
 * Each card carries the lesson's synopsis (QA round-2 defect 6) so a decision
 * is never made on a title alone. Reading the full draft is a known v1 gap:
 * a draft is invisible in the learner viewer by design (N6's
 * `isLessonInEdition` admits ratified rows only), and a staff preview route is
 * beyond N7 — see the known limitations in the completion packet.
 */
export default async function OrgRatificationPage() {
  const context = await requireOrgStaffOrRedirect()
  if (!canEditEdition(context.role)) redirect("/org")
  if (!context.edition) redirect("/org")

  const edition = context.edition
  const queue = await safe(() => getRatificationQueue(context))
  const split = queue ? splitRatificationQueue(queue) : null

  return (
    <section className={adminStyles.section} data-section="org-ratification">
      {context.isPreview ? <PreviewBanner /> : null}

      <div className={adminStyles.sectionHead}>
        <h1 className={adminStyles.sectionTitle}>Ratification.</h1>
        <p className={adminStyles.mono}>
          {split
            ? `${split.awaitingYou.length} awaiting you`
            : "Database unavailable"}
        </p>
      </div>
      <p className={adminStyles.sectionLead}>
        Lessons written for your edition, waiting on your sign-off. Nobody on
        your edition can see them until you ratify them. Send one back and it
        stays hidden while GWTH makes the changes you ask for.
      </p>

      {split === null ? (
        <AdminEmptyState
          kicker="Database unavailable"
          title="The ratification queue cannot be read right now"
          body="Nothing has been changed. It returns as soon as the database is reachable."
        />
      ) : split.awaitingYou.length === 0 && split.withGwth.length === 0 ? (
        <AdminEmptyState
          kicker="Nothing waiting"
          title="Everything in your edition is ratified"
          body="New lessons written for your edition appear here for sign-off. Until you ratify one, your learners do not see it."
        />
      ) : (
        <>
          {split.awaitingYou.length > 0 ? (
            <div data-section="awaiting-you">
              <div className={styles.tierHead}>
                <h2 className={styles.tierTitle}>Waiting on you</h2>
                <p className={adminStyles.mono}>
                  {split.awaitingYou.length} to decide
                </p>
              </div>
              {split.awaitingYou.map((entry) => (
                <QueueCard
                  key={entry.lessonId}
                  entry={entry}
                  editionId={edition.id}
                />
              ))}
            </div>
          ) : null}

          {split.withGwth.length > 0 ? (
            <div data-section="with-gwth">
              <div className={styles.tierHead}>
                <h2 className={styles.tierTitle}>Back with GWTH</h2>
                <p className={adminStyles.mono}>
                  {split.withGwth.length} you sent back
                </p>
              </div>
              <p className={styles.tierLead}>
                You have asked for changes on these, so they are with GWTH, not
                with you. They stay hidden from your learners meanwhile. You can
                still ratify one as it stands if you change your mind.
              </p>
              {split.withGwth.map((entry) => (
                <QueueCard
                  key={entry.lessonId}
                  entry={entry}
                  editionId={edition.id}
                />
              ))}
            </div>
          ) : null}
        </>
      )}
    </section>
  )
}

/** One lesson awaiting a decision: what it is, its history, and the controls. */
function QueueCard({
  entry,
  editionId,
}: {
  entry: EditionSyllabusEntry
  editionId: string
}) {
  return (
    <article className={styles.queueItem} data-section="ratification-item">
      <div className={styles.queueHead}>
        <h3 className={styles.queueTitle} id={`queue-title-${entry.lessonId}`}>
          {entry.title}
        </h3>
        <LessonMeta>Month {entry.month}</LessonMeta>
      </div>
      <div className={styles.lessonMeta}>
        <TierLabel tier={entry.tier} />
        <StateLabel
          state={entry.state}
          hasReviewNote={Boolean(entry.reviewNote)}
        />
        {entry.decidedAt ? (
          <LessonMeta>Last decision {formatDate(entry.decidedAt)}</LessonMeta>
        ) : null}
      </div>
      {entry.description ? (
        <p className={styles.querySynopsis}>{entry.description}</p>
      ) : null}
      {entry.reviewNote ? (
        <p className={styles.reviewNote}>
          You sent this back: {entry.reviewNote}
        </p>
      ) : null}
      <RatificationControls editionId={editionId} lessonId={entry.lessonId} />
    </article>
  )
}
