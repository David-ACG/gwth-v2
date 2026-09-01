/**
 * Institution admin policy and shapes (N7) — the pure half of
 * `src/lib/data/org-admin.ts`.
 *
 * Split out for the same reason `src/lib/org-roles.ts` was: the data layer is
 * `server-only` (it reaches Postgres and the auth cookies), so the rules that
 * decide WHO may do WHAT would otherwise be untestable without a database and
 * unimportable from anything but a Server Component. Everything here is a
 * pure function or a type; nothing touches IO.
 *
 * Roles (013 CHECK twins / src/lib/org-roles.ts):
 *   owner  — GWTH, on the institution orgs we provision. Full staff access.
 *   admin  — the institution admin. Reads everything, WRITES the edition.
 *   tutor  — read-only roster visibility (Steve's "send that to your tutor"
 *            flow, digest section 7). No writes.
 *   learner— not staff. /org bounces them, and Better Auth's roster endpoints
 *            refuse them (src/lib/org-roster-privacy.ts).
 */

/** Staff roles that may open /org at all. */
export const ORG_STAFF_ROLES = ["owner", "admin", "tutor"] as const

/**
 * Staff roles that may WRITE the edition (picker, ratification, pass mark).
 * Module-private: `canEditEdition()` is the only way to ask, so the list
 * cannot drift out of step with the check.
 */
const ORG_EDITOR_ROLES = ["owner", "admin"] as const

/** True when this org role may edit the edition. */
export function canEditEdition(role: string | null | undefined): boolean {
  return (ORG_EDITOR_ROLES as readonly string[]).includes(role ?? "")
}

/** True when this org role may open /org (staff, read at minimum). */
export function isOrgStaffRole(role: string | null | undefined): boolean {
  return (ORG_STAFF_ROLES as readonly string[]).includes(role ?? "")
}

/** Who the caller is, which org they staff, and which edition they curate. */
export type OrgStaffContext = {
  /** The signed-in staff member's user id (`preview-admin` in fixture mode). */
  userId: string
  /** Their name, for the header. */
  userName: string
  /** Their org role. */
  role: (typeof ORG_STAFF_ROLES)[number]
  /** The organisation they staff. */
  organisationId: string
  organisationName: string
  /** 'institution' (CIPD-shaped) or 'company' (Teams-shaped). */
  organisationType: string
  /**
   * The org's default edition for this course — what /org curates — or NULL
   * when GWTH has provisioned the organisation but not yet created its
   * edition (QA round-1 defect 11). Staff still reach /org in that state and
   * every screen says the edition is missing, rather than being bounced to
   * the learner dashboard as if they had no admin access at all.
   */
  edition: OrgEdition | null
  /** The course this edition wraps. */
  courseId: string
  courseTitle: string
  /** True when the screens are rendering fixtures, not this org's real rows. */
  isPreview: boolean
}

/** The edition an institution curates, once GWTH has created it. */
export type OrgEdition = {
  id: string
  name: string
  status: "draft" | "live" | "archived"
  /** Co-brand label rendered in the /org masthead and the learner viewer. */
  coBrandLabel: string | null
  /** The pass mark quizzes are graded against (decision 4: one per edition). */
  passMark: number
}

/** One lesson as the institution's picker sees it. */
export type EditionSyllabusEntry = {
  lessonId: string
  title: string
  slug: string
  /** The lesson synopsis, so an admin can see what they are ratifying. */
  description: string
  month: number
  /** Absent from the edition entirely (an optional lesson switched off). */
  included: boolean
  tier: "core" | "optional" | "exclusive"
  state: "draft" | "ratified"
  isMandatory: boolean
  sortOrder: number
  /** Why it was last sent back for changes, when it was. */
  reviewNote: string | null
  decidedAt: string | null
  /**
   * True when the lesson itself has been edited since the institution's last
   * ratification decision, i.e. GWTH has answered a send-back. `review_note`
   * is never cleared by an edit, so without this a revised draft would sit in
   * "back with GWTH" forever while both sides waited for the other.
   */
  revisedSinceDecision: boolean
  /**
   * Core lessons are the GWTH course itself and cannot be switched off
   * (D-N7-3) — the picker renders them locked with the reason on screen.
   */
  locked: boolean
}

/** One learner row of the roster (design 05 Q1). */
export type OrgRosterRow = {
  userId: string
  name: string
  email: string
  mandatoryTotal: number
  mandatoryDone: number
  avgBestQuiz: number | null
  lastActive: string | null
  baselineMet: boolean
}

/** One lesson row of the cohort completion table (design 05 Q2). */
export type OrgLessonCompletionRow = {
  lessonId: string
  title: string
  tier: string
  isMandatory: boolean
  started: number
  completed: number
  quizPassed: number
  avgBestQuiz: number | null
}

/** The one-card org summary (design 05 Q3). */
export type OrgSummary = {
  learners: number
  started: number
  baselineMet: number
  active7d: number
  pendingRatification: number
}

/**
 * The overview card (design 05 Q3). Derived from the roster result set rather
 * than a second SQL pass, exactly as the design specifies ("app-side this
 * reuses Q1's result set rather than re-running SQL").
 *
 * @param roster The Q1 rows for this organisation.
 * @param pendingRatification How many lessons are waiting on sign-off.
 * @param now Injectable clock, so the 7-day window is testable.
 */
export function summariseRoster(
  roster: OrgRosterRow[],
  pendingRatification: number,
  now: Date = new Date()
): OrgSummary {
  const weekAgo = now.getTime() - 7 * 86_400_000
  return {
    learners: roster.length,
    started: roster.filter((row) => row.mandatoryDone > 0).length,
    baselineMet: roster.filter((row) => row.baselineMet).length,
    active7d: roster.filter(
      (row) => row.lastActive && new Date(row.lastActive).getTime() > weekAgo
    ).length,
    pendingRatification,
  }
}
