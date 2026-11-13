import { requireAdminOrRedirect } from "@/lib/admin"
import audit from "@/data/lesson-audit.json"
import { formatDate } from "../admin-shared"
import styles from "../admin-fde.module.css"
import la from "./lesson-audit.module.css"

/**
 * /admin/lesson-audit: the one page David reads about keeping the lessons current
 * (David, 13 Nov 2026: "a summary page is the best thing for me to look at"). Decisions
 * first, then what changed, then every lesson. The data is written by
 * GWTH-launch-plan/scripts/lesson_audit.py into src/data/lesson-audit.json; the detail
 * behind it (change log, research, register) lives in that repo for Claude.
 */

type Suggestion = {
  id: string
  type: string
  title: string
  lessons?: string[]
  why: string
  recommendation: string
  effort?: string
  raised?: string[]
  status?: string
}

type LessonRow = {
  slug: string
  code: string
  month: number
  title: string
  facts_checked: string | null
  fact_changes: number | null
  clarity_rewritten: string | null
  qa: { lesson?: string | null; project?: string | null }
  words_check: string
}

type NeedsYou = { slug: string; code: string; title: string; part: string; why: string; words_check: string }

type Round = {
  kind: string
  label: string
  from: string
  to: string
  lessons: number
  fact_changes: number | null
  facts_restored_by_checker: number | null
}

/** The shape lesson_audit.py writes. Typed here so an empty list in the JSON still type-checks. */
type AuditData = {
  generated: string
  last_work: string | null
  next_due: string | null
  cadence_days: number
  rounds: Round[]
  suggestions: Suggestion[]
  needs_you: NeedsYou[]
  lessons: LessonRow[]
  totals: {
    lessons: number
    rewritten: number
    facts_checked: number
    never_facts_checked: number
    qa_passed: number
    needs_you: number
    qa_rechecking: number
  }
  detail: Record<string, string>
}

const data = audit as unknown as AuditData

const TYPE_LABEL: Record<string, string> = {
  add: "Add",
  remove: "Remove",
  merge: "Merge",
  split: "Split",
  move: "Move",
  widen: "Widen",
}

const MONTHS: Record<number, string> = { 1: "Month 1: using AI", 2: "Month 2: building with AI", 3: "Month 3: leading AI at work" }

function day(iso: string | null | undefined): string {
  return iso ? formatDate(`${iso}T12:00:00Z`) : "Never"
}

function qaText(qa: LessonRow["qa"]): string {
  const parts = [qa.lesson, qa.project]
  if (parts.every((p) => p === "passed")) return "Passed"
  if (parts.some((p) => p === "running")) return "Checking"
  if (parts.some((p) => p === "stuck")) return "Re-checking"
  return "Not checked"
}

export default async function AdminLessonAuditPage() {
  await requireAdminOrRedirect()
  const t = data.totals
  const suggestions = data.suggestions.filter((s) => (s.status ?? "proposed") === "proposed")
  const decide = suggestions.filter((s) => s.recommendation !== "not now")
  const later = suggestions.filter((s) => s.recommendation === "not now")
  const neverChecked = data.lessons.filter((l) => !l.facts_checked)

  return (
    <section className={styles.section} data-section="lesson-audit">
      <div className={styles.sectionHead}>
        <h1 className={styles.sectionTitle}>Lesson Audit.</h1>
      </div>
      <p className={styles.sectionLead}>
        Last work on the lessons: {day(data.last_work)}. {t.rewritten} of {t.lessons} lessons were rewritten to be clearer
        for beginners, and {t.facts_checked} have had their facts checked against the web. Next audit due{" "}
        {day(data.next_due)} (every {data.cadence_days} days).
      </p>

      <div className={styles.metricsRow}>
        <a href="#decide" className={`${styles.metricCard} ${decide.length ? styles.metricAlert : ""}`}>
          <span className={styles.mono}>Decisions</span>
          <span className={styles.metricValue}>{decide.length}</span>
          <span className={styles.metricCaption}>lessons to add, remove or change shape</span>
        </a>
        <a href="#needs-you" className={`${styles.metricCard} ${data.needs_you.length ? styles.metricAlert : ""}`}>
          <span className={styles.mono}>Needs you</span>
          <span className={styles.metricValue}>{data.needs_you.length}</span>
          <span className={styles.metricCaption}>things only a person can supply</span>
        </a>
        <a href="#changed" className={styles.metricCard}>
          <span className={styles.mono}>Never fact-checked</span>
          <span className={styles.metricValue}>{t.never_facts_checked}</span>
          <span className={styles.metricCaption}>lessons with no web check yet</span>
        </a>
        <a href="#lessons" className={styles.metricCard}>
          <span className={styles.mono}>Automated QA</span>
          <span className={styles.metricValue}>
            {t.qa_passed}/{t.lessons}
          </span>
          <span className={styles.metricCaption}>{t.qa_rechecking ? `${t.qa_rechecking} re-checking by themselves` : "lessons passed"}</span>
        </a>
      </div>

      <div className={styles.panel} id="decide">
        <div className={styles.panelHead}>
          <h2 className={styles.panelTitle}>Decisions for you</h2>
        </div>
        <p className={styles.panelLead}>
          Changes to the shape of the course that research and rewriting have raised. Reply in chat with the ones you want.
        </p>
        {decide.length === 0 ? (
          <p className={`${styles.cellMuted} ${la.wrap}`}>Nothing to decide.</p>
        ) : (
          <ul className={la.decisions}>
            {decide.map((s) => (
              <li key={s.id} className={la.decision}>
                <div className={la.decisionHead}>
                  <span className={la.decisionTitle}>
                    {TYPE_LABEL[s.type] ?? s.type}: {s.title.replace(/^(Add|Remove|Merge|Split|Move|Widen)\b:?\s*/i, "")}
                  </span>
                  <span className={styles.status}>{s.recommendation === "do" ? "We recommend: do it" : "We recommend: consider"}</span>
                </div>
                <span className={la.why}>{s.why}</span>
                <span className={la.meta}>
                  {s.effort ? `${s.effort.charAt(0).toUpperCase()}${s.effort.slice(1)} job` : ""}
                  {s.raised?.length ? `, raised ${s.raised.length} time${s.raised.length > 1 ? "s" : ""}` : ""}
                </span>
              </li>
            ))}
          </ul>
        )}
        {later.length > 0 && (
          <details>
            <summary className={styles.cellMuted}>{later.length} more raised but not recommended now</summary>
            <ul>
              {later.map((s) => (
                <li key={s.id} className={`${styles.cellMuted} ${la.wrap}`}>
                  {TYPE_LABEL[s.type] ?? s.type}: {s.title}
                </li>
              ))}
            </ul>
          </details>
        )}
      </div>

      <div className={styles.panel} id="needs-you">
        <div className={styles.panelHead}>
          <h2 className={styles.panelTitle}>Needs you</h2>
        </div>
        {data.needs_you.length === 0 ? (
          <p className={`${styles.cellMuted} ${la.wrap}`}>Nothing. Checks that failed for other reasons re-run by themselves every hour.</p>
        ) : (
          <ul>
            {data.needs_you.map((n) => (
              <li key={`${n.slug}-${n.part}`}>
                <a className={styles.cellName} href={n.words_check}>
                  {n.code} {n.part}: {n.title}
                </a>
                <span className={`${styles.cellEmail} ${la.wrap}`}>{n.why}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className={styles.panel} id="changed">
        <div className={styles.panelHead}>
          <h2 className={styles.panelTitle}>What changed</h2>
        </div>
        <ul>
          {data.rounds.map((r) => (
            <li key={r.kind}>
              <span className={styles.cellName}>{r.label}</span>{" "}
              <span className={`${styles.cellMuted} ${la.wrap}`}>
                {day(r.from)}
                {r.to !== r.from ? ` to ${day(r.to)}` : ""}: {r.lessons} lessons
                {r.fact_changes ? `, ${r.fact_changes} facts updated with a source` : ""}
                {r.facts_restored_by_checker ? `, ${r.facts_restored_by_checker} facts the writer dropped and the checker put back` : ""}
              </span>
            </li>
          ))}
        </ul>
        {neverChecked.length > 0 && (
          <p className={styles.panelLead}>
            Never fact-checked: {neverChecked.length} lessons (
            {[1, 2, 3]
              .map((m) => [m, neverChecked.filter((l) => l.month === m).length] as const)
              .filter(([, n]) => n)
              .map(([m, n]) => `${n} in Month ${m}`)
              .join(", ")}
            ).
          </p>
        )}
      </div>

      <div className={styles.panel} id="lessons">
        <div className={styles.panelHead}>
          <h2 className={styles.panelTitle}>Every lesson</h2>
        </div>
        <p className={styles.panelLead}>Open a lesson to read or listen to it in the Words check.</p>
        {[1, 2, 3].map((m) => {
          const rows = data.lessons.filter((l) => l.month === m)
          return (
            <details key={m} className={la.month}>
              <summary className={styles.cellName}>
                {MONTHS[m]} ({rows.length})
              </summary>
              <div className={`${styles.tableWrap} ${la.scroll}`}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th scope="col">Lesson</th>
                      <th scope="col">Facts checked</th>
                      <th scope="col" className={la.wideOnly}>Rewritten for clarity</th>
                      <th scope="col">QA</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((l) => (
                      <tr key={l.slug}>
                        <td>
                          <a className={`${styles.cellName} ${la.wrap}`} href={l.words_check}>
                            {l.code} {l.title}
                          </a>
                        </td>
                        <td className={`${styles.cellMuted} ${la.wrap}`}>
                          {day(l.facts_checked)}
                          {l.fact_changes ? ` (${l.fact_changes} changes)` : ""}
                        </td>
                        <td className={`${styles.cellMuted} ${la.wideOnly}`}>{day(l.clarity_rewritten)}</td>
                        <td className={styles.cellMuted}>{qaText(l.qa)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </details>
          )
        })}
      </div>

      <p className={`${styles.cellMuted} ${la.wrap}`}>
        Updated {formatDate(data.generated)}. The detail behind this page (every change, its reason and sources, the
        research and the old drafts) is in {data.detail.log} and {data.detail.process}.
      </p>
    </section>
  )
}
