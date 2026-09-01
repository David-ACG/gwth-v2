/**
 * Preview fixtures for the institution admin screens (N7).
 *
 * These rows are served ONLY to a sessionless request in a mock environment
 * (`isSessionlessMockRequest()` — no DATABASE_URL, or the staging review env
 * with ENABLE_DEV_MOCK_USER and NO session cookie presented). That is the
 * same audited seam the rest of the app uses (src/lib/data/mode.ts, W14: "the
 * hard rule — fixture numbers must NEVER reach a real logged-in session"), so
 * a real institution admin never sees a number from this file, and every /org
 * screen rendering them says "Preview" on its face.
 *
 * They exist so the screens can be reviewed, screenshotted and Playwright-
 * tested without provisioning an institution, and they are shaped like the
 * CIPD edition the design describes: months 1-3, a core spine that cannot be
 * switched off, optional lessons the institution curates, and CIPD-exclusive
 * lessons in months 2-3 (digest section 7: "Month 1 mandatory for all; months
 * 2-3 are where curation lives"), two of them awaiting ratification.
 */
import type {
  EditionSyllabusEntry,
  OrgLessonCompletionRow,
  OrgRosterRow,
  OrgStaffContext,
} from "@/lib/org-admin-policy"

/** The preview institution: a co-branded edition of the GWTH course. */
export const MOCK_ORG_ADMIN_CONTEXT: OrgStaffContext = {
  userId: "preview-admin",
  userName: "Preview admin",
  role: "admin",
  organisationId: "org-preview",
  organisationName: "CIPD",
  organisationType: "institution",
  edition: {
    id: "edition-preview",
    name: "CIPD edition 2026",
    status: "live",
    coBrandLabel: "Curated by CIPD",
    passMark: 75,
  },
  courseId: "course_gwth",
  courseTitle: "Applied AI Skills",
  isPreview: true,
}

/** [title, month, tier, included, state, mandatory, reviewNote] */
const FIXTURE_LESSONS: Array<
  [string, number, EditionSyllabusEntry["tier"], boolean, EditionSyllabusEntry["state"], boolean, string | null]
> = [
  ["Welcome to GWTH: what AI can actually do for you", 1, "core", true, "ratified", true, null],
  ["Talking to AI: prompts that get real answers", 1, "core", true, "ratified", true, null],
  ["Checking the answer: how to spot a confident mistake", 1, "core", true, "ratified", true, null],
  ["Your first automation: one job you never do again", 1, "core", true, "ratified", true, null],
  ["Build your first app: the moment everything changes", 1, "core", true, "ratified", true, null],
  ["Working with documents: summarise, extract, compare", 2, "core", true, "ratified", true, null],
  ["Research that holds up: sourcing and citation", 2, "core", true, "ratified", true, null],
  ["Data without a spreadsheet headache", 2, "optional", true, "ratified", true, null],
  ["Meeting notes and follow-ups, handled", 2, "optional", true, "ratified", false, null],
  ["Images and slides: making the visual bit fast", 2, "optional", false, "ratified", false, null],
  ["AI and the employment relationship: a CIPD view", 2, "exclusive", true, "ratified", true, null],
  ["Recruitment screening: what the law expects of you", 2, "exclusive", true, "draft", true, null],
  ["Agents that do the work, not just the writing", 3, "core", true, "ratified", true, null],
  ["Connecting your own data: RAG explained", 3, "core", true, "ratified", true, null],
  ["Putting it together: your capstone", 3, "core", true, "ratified", true, null],
  ["Automating a hiring pipeline end to end", 3, "optional", true, "ratified", false, null],
  ["Voice, video and the things you can now make", 3, "optional", false, "ratified", false, null],
  [
    "People analytics without crossing the line",
    3,
    "exclusive",
    true,
    "draft",
    true,
    "Please add the 2026 DSIT guidance and a UK-only worked example before we sign this off.",
  ],
]

/** The preview syllabus, in edition order. */
export function mockEditionSyllabus(): EditionSyllabusEntry[] {
  return FIXTURE_LESSONS.map(
    ([title, month, tier, included, state, isMandatory, reviewNote], index) => ({
      lessonId: `preview-l${String(index + 1).padStart(2, "0")}`,
      title,
      slug: `preview-lesson-${index + 1}`,
      description: `An illustrative synopsis for "${title}", so the ratification screen has something to show. A real lesson carries the synopsis GWTH wrote for it.`,
      month,
      included,
      tier,
      state,
      isMandatory,
      sortOrder: month * 1000 + index,
      reviewNote,
      decidedAt: reviewNote ? "2026-08-24T09:12:00.000Z" : null,
      locked: tier === "core",
    })
  )
}

/** [name, email, done, avgBestQuiz, daysSinceActive, baselineMet] */
const FIXTURE_LEARNERS: Array<[string, string, number, number | null, number | null, boolean]> = [
  ["Amara Osei", "a.osei@example.org", 12, 88, 0, true],
  ["Tom Blackwood", "t.blackwood@example.org", 12, 81, 2, true],
  ["Priya Raman", "p.raman@example.org", 9, 79, 1, false],
  ["Joanne Kerr", "j.kerr@example.org", 7, 74, 5, false],
  ["Michael Nwosu", "m.nwosu@example.org", 4, 68, 11, false],
  ["Ellie Vance", "e.vance@example.org", 1, null, 3, false],
  ["Rohan Desai", "r.desai@example.org", 0, null, null, false],
]

/** The preview roster, already in the screen's sort order. */
export function mockOrgRoster(): OrgRosterRow[] {
  const total = 12
  // Fixed clock offsets, resolved at call time so "3d ago" stays plausible
  // without the fixtures pretending to be live data.
  const now = Date.now()
  return FIXTURE_LEARNERS.map(
    ([name, email, done, avgBestQuiz, daysAgo, baselineMet], index) => ({
      userId: `preview-u${index + 1}`,
      name,
      email,
      mandatoryTotal: total,
      mandatoryDone: done,
      avgBestQuiz,
      lastActive:
        daysAgo === null
          ? null
          : new Date(now - daysAgo * 86_400_000).toISOString(),
      baselineMet,
    })
  )
}

/**
 * Per-lesson completion for the preview cohort, in edition order.
 *
 * Derived from the SAME roster fixture as `mockOrgRoster()` rather than from
 * an independent decay curve (QA round-2 style note 9): the two preview
 * screens were telling different stories, with the roster showing learners who
 * had finished every mandatory lesson while this table reported nobody past
 * lesson six.
 */
export function mockOrgLessonCompletion(): OrgLessonCompletionRow[] {
  const mandatory = mockEditionSyllabus().filter(
    (entry) => entry.included && entry.state === "ratified" && entry.isMandatory
  )
  return mockEditionSyllabus()
    .filter((entry) => entry.included && entry.state === "ratified")
    .map((entry) => {
      // Position of this lesson within the mandatory run; a learner who has
      // done N mandatory lessons has reached the first N of them.
      const rank = mandatory.findIndex((m) => m.lessonId === entry.lessonId)
      const reached = FIXTURE_LEARNERS.filter(([, , done]) =>
        rank === -1 ? done > 0 : done > rank
      )
      const completed = reached.length
      const started = Math.min(
        FIXTURE_LEARNERS.length,
        completed + (completed < FIXTURE_LEARNERS.length ? 1 : 0)
      )
      const scores = reached
        .map(([, , , score]) => score)
        .filter((score): score is number => score !== null)
      return {
        lessonId: entry.lessonId,
        title: entry.title,
        tier: entry.tier,
        isMandatory: entry.isMandatory,
        started,
        completed,
        quizPassed: completed,
        avgBestQuiz: scores.length
          ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
          : null,
      }
    })
}
