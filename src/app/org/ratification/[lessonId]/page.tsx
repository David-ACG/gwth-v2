import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import {
  canEditEdition,
  getEditionLessonPreview,
  requireOrgStaffOrRedirect,
} from "@/lib/data/org-admin"
import { RatificationControls } from "@/components/org/ratification-controls"
import { LessonMeta, PreviewBanner, StateLabel, TierLabel } from "../../org-shared"
import adminStyles from "../../../admin/admin-fde.module.css"
import styles from "../../org-fde.module.css"

/**
 * /org/ratification/[lessonId] — read the draft in full, then decide.
 *
 * QA round-3 defect 10: the queue showed a title and a synopsis, so an
 * institution was being asked to sign off content it could not inspect. A
 * synopsis can be fine while the body is not.
 *
 * This does NOT relax N6's learner rule. `isLessonInEdition` still admits
 * ratified rows only, so a draft stays invisible in the learner viewer;
 * `getEditionLessonPreview` is a separate read joined to the CALLER'S OWN
 * edition, so the only body it can return is one their edition carries.
 * Another institution's exclusive lesson 404s here.
 */
export default async function OrgLessonPreviewPage({
  params,
}: {
  params: Promise<{ lessonId: string }>
}) {
  const context = await requireOrgStaffOrRedirect()
  if (!canEditEdition(context.role)) redirect("/org")
  if (!context.edition) redirect("/org")

  const edition = context.edition
  const { lessonId } = await params
  const lesson = await getEditionLessonPreview(context, lessonId)
  if (!lesson) notFound()

  return (
    <section className={adminStyles.section} data-section="org-lesson-preview">
      {context.isPreview ? <PreviewBanner /> : null}

      <p className={adminStyles.mono}>
        <Link href="/org/ratification" className={adminStyles.sortLink}>
          Back to ratification
        </Link>
      </p>

      <div className={adminStyles.sectionHead}>
        <h1 className={adminStyles.sectionTitle}>{lesson.title}</h1>
        <LessonMeta>
          Month {lesson.month} · {lesson.duration} min
        </LessonMeta>
      </div>
      <div className={styles.lessonMeta}>
        <TierLabel tier={lesson.tier as "core" | "optional" | "exclusive"} />
        <StateLabel
          state={lesson.state as "draft" | "ratified"}
          hasReviewNote={Boolean(lesson.reviewNote)}
        />
      </div>

      <p className={adminStyles.sectionLead}>{lesson.description}</p>

      {lesson.reviewNote ? (
        <p className={styles.reviewNote}>
          You sent this back: {lesson.reviewNote}
        </p>
      ) : null}

      <div className={styles.draftBody} data-section="draft-body">
        {lesson.learnContent ? (
          lesson.learnContent
            .split(/\n{2,}/)
            .map((block, index) => <p key={index}>{block}</p>)
        ) : (
          <p>
            GWTH has not written the body of this lesson yet. Send it back and
            say what you need, or wait until it is written before deciding.
          </p>
        )}
      </div>

      {lesson.state === "draft" && !lesson.learnContent ? (
        // No body, no decision (QA round-4 defect 8): offering Ratify beside
        // "GWTH has not written this yet" invites publishing an empty lesson
        // to the whole cohort. Send-back is still available from the queue.
        <p className={adminStyles.sectionLead}>
          There is nothing to sign off yet. When GWTH has written the lesson it
          will appear here and you can decide it.
        </p>
      ) : lesson.state === "draft" ? (
        <div className={styles.queueItem} data-section="ratification-item">
          <p className={adminStyles.panelLead}>
            Decide it here, having read it. Ratifying makes it visible to every
            learner on your edition.
          </p>
          <RatificationControls
            editionId={edition.id}
            lessonId={lessonId}
            sawReviewNote={Boolean(lesson.reviewNote)}
          />
        </div>
      ) : (
        <p className={adminStyles.sectionLead}>
          This lesson is ratified, so your learners can already see it. There is
          nothing to decide.
        </p>
      )}
    </section>
  )
}
