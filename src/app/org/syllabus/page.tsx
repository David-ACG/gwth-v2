import Link from "next/link"
import { redirect } from "next/navigation"
import {
  canEditEdition,
  getEditionSyllabus,
  requireOrgStaffOrRedirect,
  type EditionSyllabusEntry,
} from "@/lib/data/org-admin"
import { LessonToggle, MandatoryToggle } from "@/components/org/lesson-toggle"
import { PassMarkForm } from "@/components/org/pass-mark-form"
import { AdminEmptyState, safe } from "../../admin/admin-shared"
import {
  LessonMeta,
  MandatoryLabel,
  PreviewBanner,
  StateLabel,
  TierLabel,
} from "../org-shared"
import adminStyles from "../../admin/admin-fde.module.css"
import styles from "../org-fde.module.css"

/** The three tiers, in the order the institution reads them. */
const TIERS = [
  {
    tier: "core" as const,
    title: "Core",
    lead:
      "The spine of the course. Every edition carries these, so a GWTH credential means the same thing whoever issued it, so they cannot be switched off.",
  },
  {
    tier: "optional" as const,
    title: "Optional",
    lead:
      "Yours to choose. Switch a lesson on to put it in front of your learners, off to leave it out. You also decide whether it counts toward your baseline.",
  },
  {
    tier: "exclusive" as const,
    title: "Exclusive to you",
    lead:
      "Lessons written for your edition. They stay hidden from your learners until you ratify them. They are accepted or sent back on the ratification screen rather than switched off here, so their sign-off history is never lost.",
  },
]

/**
 * /org/syllabus — the lesson picker by tier, plus the edition pass mark.
 *
 * This is the screen Ben's two asks land on: pick the optional lessons, set a
 * pass mark. Tutors are redirected to the overview (read-only role), and the
 * server actions refuse them independently — a hidden nav link is signposting,
 * not a gate.
 */
export default async function OrgSyllabusPage() {
  const context = await requireOrgStaffOrRedirect()
  if (!canEditEdition(context.role)) redirect("/org")
  // Nothing to curate until GWTH creates the edition; /org explains that.
  if (!context.edition) redirect("/org")

  const edition = context.edition
  const syllabus = await safe(() => getEditionSyllabus(context))

  return (
    <section className={adminStyles.section} data-section="org-syllabus">
      {context.isPreview ? <PreviewBanner /> : null}

      <div className={adminStyles.sectionHead}>
        <h1 className={adminStyles.sectionTitle}>Syllabus.</h1>
        <p className={adminStyles.mono}>
          {syllabus
            ? `${syllabus.filter((entry) => entry.included).length} of ${syllabus.length} lessons in your edition`
            : "Database unavailable"}
        </p>
      </div>
      <p className={adminStyles.sectionLead}>
        Your edition of {context.courseTitle}. Changes take effect for your
        learners immediately; nobody loses progress on a lesson you switch off,
        it simply stops appearing in their course.
      </p>

      <PassMarkForm editionId={edition.id} passMark={edition.passMark} />

      {syllabus === null ? (
        <AdminEmptyState
          kicker="Database unavailable"
          title="The syllabus cannot be read right now"
          body="Nothing has been changed. It returns as soon as the database is reachable."
        />
      ) : syllabus.length === 0 ? (
        <AdminEmptyState
          kicker="No lessons yet"
          title="This course has no lessons to curate"
          body="Lessons appear here as GWTH publishes them. Your edition updates automatically as the core course grows."
        />
      ) : (
        TIERS.map((group) => {
          const entries = syllabus.filter((entry) => entry.tier === group.tier)
          if (entries.length === 0) return null
          return (
            <div
              key={group.tier}
              className={styles.tierGroup}
              data-section={`tier-${group.tier}`}
            >
              <div className={styles.tierHead}>
                <h2 className={styles.tierTitle}>{group.title}</h2>
                <p className={adminStyles.mono}>
                  {entries.filter((entry) => entry.included).length} of{" "}
                  {entries.length} on
                </p>
              </div>
              <p className={styles.tierLead}>{group.lead}</p>
              <div className={styles.lessonList}>
                {entries.map((entry) => (
                  <LessonRow
                    key={entry.lessonId}
                    entry={entry}
                    editionId={edition.id}
                  />
                ))}
              </div>
            </div>
          )
        })
      )}
    </section>
  )
}

/** One lesson in the picker: what it is, and the switches that govern it. */
function LessonRow({
  entry,
  editionId,
}: {
  entry: EditionSyllabusEntry
  editionId: string
}) {
  const titleId = `lesson-title-${entry.lessonId}`
  return (
    <div
      className={styles.lessonRow}
      data-included={entry.included ? "true" : "false"}
    >
      <div className={styles.lessonMain}>
        <p className={styles.lessonTitle} id={titleId}>
          {entry.title}
        </p>
        <div className={styles.lessonMeta}>
          <LessonMeta>Month {entry.month}</LessonMeta>
          <TierLabel tier={entry.tier} />
          {entry.tier === "exclusive" ? (
            <StateLabel
              state={entry.state}
              hasReviewNote={Boolean(entry.reviewNote)}
            />
          ) : null}
          {entry.included ? (
            <MandatoryLabel isMandatory={entry.isMandatory} />
          ) : null}
        </div>
      </div>
      <div className={styles.lessonActions}>
        {entry.tier === "core" ? (
          <p className={styles.lockedReason}>
            Core: in every edition of this course.
          </p>
        ) : entry.tier === "exclusive" ? (
          // QA round-1 defects 7 + 8: an exclusive lesson is accepted or sent
          // back on the ratification screen, never switched off here (a
          // removal would delete its tier, its sign-off history and the
          // review note with no way back) — but decision 2 of 2026-08-28 says
          // the institution decides is_mandatory per exclusive lesson, so a
          // RATIFIED one still gets that control (QA round-2 defect 3).
          <>
            {entry.state === "ratified" ? (
              <MandatoryToggle
                key={`mandatory-${entry.lessonId}-${entry.isMandatory}`}
                editionId={editionId}
                lessonId={entry.lessonId}
                lessonTitleId={titleId}
                isMandatory={entry.isMandatory}
              />
            ) : null}
            <p className={styles.lockedReason}>
              Written for you. Accepted or sent back on the{" "}
              <Link href="/org/ratification">ratification screen</Link>.
            </p>
          </>
        ) : (
          <>
            {/*
              key: the checkbox holds local state for its optimistic flip, so
              it must remount when the SERVER value changes (QA round-1
              defect 10) — otherwise a router.refresh() updates the counts
              around it while the box keeps showing the stale value.
            */}
            <LessonToggle
              key={`include-${entry.lessonId}-${entry.included}`}
              editionId={editionId}
              lessonId={entry.lessonId}
              lessonTitleId={titleId}
              included={entry.included}
            />
            {entry.included ? (
              <MandatoryToggle
                key={`mandatory-${entry.lessonId}-${entry.isMandatory}`}
                editionId={editionId}
                lessonId={entry.lessonId}
                lessonTitleId={titleId}
                isMandatory={entry.isMandatory}
              />
            ) : null}
          </>
        )}
      </div>
    </div>
  )
}
