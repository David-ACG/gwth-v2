import {
  getOrgLessonCompletion,
  getOrgRoster,
  requireOrgStaffOrRedirect,
} from "@/lib/data/org-admin"
import {
  AdminEmptyState,
  DashProgress,
  formatAgo,
  safe,
} from "../../admin/admin-shared"
import { BaselineLabel, MandatoryLabel, PreviewBanner } from "../org-shared"
import adminStyles from "../../admin/admin-fde.module.css"

/**
 * /org/learners — the tutor's screen (design 05 Q1 + Q2).
 *
 * Steve's flow from the 27 Jul call: a member does the foundation course, and
 * their tutor can see they have met the baseline before the advanced course
 * starts. "Baseline met" means every mandatory, ratified lesson of the
 * edition completed WITH a passing quiz — not just watched.
 *
 * Deliberately absent in v1 (design 05 section 4): per-learner drill-down of
 * individual quiz answers. A tutor sees whether the baseline is met and how
 * the cohort is doing, not a transcript of someone's wrong answers.
 *
 * Tutors reach this screen; so do admins and owners. Learners never do — the
 * gate bounces them, and Better Auth's roster endpoints refuse them too
 * (src/lib/org-roster-privacy.ts).
 */
export default async function OrgLearnersPage() {
  const context = await requireOrgStaffOrRedirect()

  const [roster, lessonRows] = await Promise.all([
    safe(() => getOrgRoster(context)),
    safe(() => getOrgLessonCompletion(context)),
  ])

  return (
    <section className={adminStyles.section} data-section="org-learners">
      {context.isPreview ? <PreviewBanner /> : null}

      <div className={adminStyles.sectionHead}>
        <h1 className={adminStyles.sectionTitle}>Learners.</h1>
        <p className={adminStyles.mono}>
          {roster ? `${roster.length} on your edition` : "Database unavailable"}
        </p>
      </div>
      <p className={adminStyles.sectionLead}>
        Where each of your people is against your baseline: every mandatory
        lesson of your edition completed, with a quiz at or above your
        {context.edition ? ` ${context.edition.passMark}% ` : " "}pass mark.
      </p>

      {context.edition === null ? (
        <AdminEmptyState
          kicker="Edition not set up"
          title="GWTH has not created your edition yet"
          body="There is no syllabus for your people to be measured against yet, so there is nothing to report. Ask your GWTH contact; this screen fills in as soon as the edition exists."
        />
      ) : roster === null ? (
        <AdminEmptyState
          kicker="Database unavailable"
          title="Your roster cannot be read right now"
          body="It returns as soon as the database is reachable. Nothing has been lost."
        />
      ) : roster.length === 0 ? (
        <AdminEmptyState
          kicker="Nobody yet"
          title="No learners have joined your edition"
          body="People appear here as they accept their invitation and start the course."
        />
      ) : (
        <div className={adminStyles.tableWrap}>
          <table className={adminStyles.table}>
            <caption className="sr-only">
              Your learners and their progress against your baseline
            </caption>
            <thead>
              <tr>
                <th scope="col">Learner</th>
                <th scope="col">Baseline</th>
                <th scope="col">Mandatory lessons</th>
                <th scope="col">Average quiz</th>
                <th scope="col">Last active</th>
              </tr>
            </thead>
            <tbody>
              {roster.map((row) => (
                <tr key={row.userId}>
                  <td>
                    <span className={adminStyles.cellName}>{row.name}</span>
                    <span className={adminStyles.cellEmail}>{row.email}</span>
                  </td>
                  <td>
                    <BaselineLabel met={row.baselineMet} />
                  </td>
                  <td>
                    <DashProgress
                      dashes={Array.from(
                        { length: row.mandatoryTotal },
                        (_, index) => index < row.mandatoryDone
                      )}
                      completed={row.mandatoryDone}
                      total={row.mandatoryTotal}
                    />
                  </td>
                  <td className={adminStyles.cellMuted}>
                    {row.avgBestQuiz === null ? "n/a" : `${row.avgBestQuiz}%`}
                  </td>
                  <td className={adminStyles.cellMuted}>
                    {formatAgo(row.lastActive)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {context.edition === null ? null : (
        <>
      <div className={adminStyles.sectionHead} style={{ marginTop: "3rem" }}>
        <h2 className={adminStyles.sectionTitle}>Where the cohort sticks.</h2>
        <p className={adminStyles.mono}>
          {lessonRows ? `${lessonRows.length} lessons` : "Unavailable"}
        </p>
      </div>

      {lessonRows === null ? (
        <AdminEmptyState
          kicker="Database unavailable"
          title="Per-lesson completion cannot be read right now"
          body="It returns as soon as the database is reachable."
        />
      ) : lessonRows.length === 0 ? (
        <AdminEmptyState
          kicker="No ratified lessons"
          title="Your edition has no ratified lessons yet"
          body="Once lessons are in your edition and ratified, this table shows how many of your learners have reached and passed each one."
        />
      ) : (
        <div className={adminStyles.tableWrap}>
          <table className={adminStyles.table}>
            <caption className="sr-only">
              How many of your learners have reached and passed each lesson
            </caption>
            <thead>
              <tr>
                <th scope="col">Lesson</th>
                <th scope="col">Counts</th>
                <th scope="col">Started</th>
                <th scope="col">Completed</th>
                <th scope="col">Quiz passed</th>
                <th scope="col">Average quiz</th>
              </tr>
            </thead>
            <tbody>
              {lessonRows.map((row) => (
                <tr key={row.lessonId}>
                  <td className={adminStyles.cellTitle}>{row.title}</td>
                  <td>
                    <MandatoryLabel isMandatory={row.isMandatory} />
                  </td>
                  <td className={adminStyles.cellMuted}>{row.started}</td>
                  <td className={adminStyles.cellMuted}>{row.completed}</td>
                  <td className={adminStyles.cellMuted}>{row.quizPassed}</td>
                  <td className={adminStyles.cellMuted}>
                    {row.avgBestQuiz === null ? "n/a" : `${row.avgBestQuiz}%`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
        </>
      )}
    </section>
  )
}
