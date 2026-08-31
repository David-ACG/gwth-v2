/**
 * Institution admin data-layer tests (N7).
 *
 * Covers the role policy, the roster→summary derivation (design 05 Q3 is
 * defined as "Q1 as a subquery or materialised app-side", and this is the
 * app-side half), and the preview fixtures' contract with the screens. The
 * SQL shapes are exercised against Postgres in src/db/org-admin.db.test.ts.
 *
 * The policy lives in `src/lib/org-admin-policy.ts` rather than the data
 * layer precisely so it can be imported here: `src/lib/data/org-admin.ts` is
 * `server-only` and cannot be loaded in a test environment.
 */
import { describe, expect, it } from "vitest"
import {
  canEditEdition,
  isOrgStaffRole,
  summariseRoster,
} from "@/lib/org-admin-policy"
import type { OrgRosterRow } from "@/lib/org-admin-policy"
import {
  MOCK_ORG_ADMIN_CONTEXT,
  mockEditionSyllabus,
  mockOrgLessonCompletion,
  mockOrgRoster,
} from "@/lib/data/org-admin-fixtures"

/** A roster row with sensible defaults, overridden per case. */
function row(overrides: Partial<OrgRosterRow> = {}): OrgRosterRow {
  return {
    userId: "u1",
    name: "A Learner",
    email: "a@example.org",
    mandatoryTotal: 10,
    mandatoryDone: 0,
    avgBestQuiz: null,
    lastActive: null,
    baselineMet: false,
    ...overrides,
  }
}

describe("role policy", () => {
  it("treats owner, admin and tutor as staff", () => {
    expect(isOrgStaffRole("owner")).toBe(true)
    expect(isOrgStaffRole("admin")).toBe(true)
    expect(isOrgStaffRole("tutor")).toBe(true)
  })

  it("does not treat a learner (or an unknown role) as staff", () => {
    expect(isOrgStaffRole("learner")).toBe(false)
    expect(isOrgStaffRole(null)).toBe(false)
    expect(isOrgStaffRole("superuser")).toBe(false)
  })

  it("lets only owner and admin edit the edition — tutors are read-only", () => {
    expect(canEditEdition("owner")).toBe(true)
    expect(canEditEdition("admin")).toBe(true)
    expect(canEditEdition("tutor")).toBe(false)
    expect(canEditEdition("learner")).toBe(false)
  })
})

describe("summariseRoster", () => {
  const now = new Date("2026-08-31T12:00:00.000Z")
  const daysAgo = (days: number) =>
    new Date(now.getTime() - days * 86_400_000).toISOString()

  it("counts learners, starters, baselines and 7-day activity", () => {
    const roster = [
      row({ userId: "u1", mandatoryDone: 10, baselineMet: true, lastActive: daysAgo(1) }),
      row({ userId: "u2", mandatoryDone: 4, lastActive: daysAgo(6) }),
      row({ userId: "u3", mandatoryDone: 1, lastActive: daysAgo(30) }),
      row({ userId: "u4" }),
    ]
    expect(summariseRoster(roster, 2, now)).toEqual({
      learners: 4,
      started: 3,
      baselineMet: 1,
      active7d: 2,
      pendingRatification: 2,
    })
  })

  it("excludes activity exactly older than 7 days", () => {
    const roster = [row({ lastActive: daysAgo(7) })]
    expect(summariseRoster(roster, 0, now).active7d).toBe(0)
  })

  it("is honest about an empty organisation", () => {
    expect(summariseRoster([], 0, now)).toEqual({
      learners: 0,
      started: 0,
      baselineMet: 0,
      active7d: 0,
      pendingRatification: 0,
    })
  })
})

describe("preview fixtures", () => {
  it("are always flagged as a preview so no screen can pass them off as real", () => {
    expect(MOCK_ORG_ADMIN_CONTEXT.isPreview).toBe(true)
  })

  it("carry a co-brand label, since that is what the header renders", () => {
    expect(MOCK_ORG_ADMIN_CONTEXT.coBrandLabel).toBe("Curated by CIPD")
  })

  it("cover all three tiers and both ratification states", () => {
    const syllabus = mockEditionSyllabus()
    expect(new Set(syllabus.map((entry) => entry.tier))).toEqual(
      new Set(["core", "optional", "exclusive"])
    )
    expect(syllabus.some((entry) => entry.state === "draft")).toBe(true)
    expect(syllabus.some((entry) => !entry.included)).toBe(true)
  })

  it("lock exactly the core lessons (D-N7-3)", () => {
    for (const entry of mockEditionSyllabus()) {
      expect(entry.locked, entry.title).toBe(entry.tier === "core")
    }
  })

  it("give the ratification queue something to show, including a sent-back note", () => {
    const drafts = mockEditionSyllabus().filter(
      (entry) => entry.included && entry.state === "draft"
    )
    expect(drafts.length).toBeGreaterThan(0)
    expect(drafts.some((entry) => entry.reviewNote)).toBe(true)
  })

  it("are in edition order", () => {
    const orders = mockEditionSyllabus().map((entry) => entry.sortOrder)
    expect([...orders].sort((a, b) => a - b)).toEqual(orders)
  })

  it("produce a roster whose baseline flags match the counts they show", () => {
    for (const entry of mockOrgRoster()) {
      if (entry.baselineMet) {
        expect(entry.mandatoryDone, entry.name).toBe(entry.mandatoryTotal)
      }
    }
  })

  it("only report per-lesson completion for included, ratified lessons", () => {
    const visible = new Set(
      mockEditionSyllabus()
        .filter((entry) => entry.included && entry.state === "ratified")
        .map((entry) => entry.lessonId)
    )
    const completion = mockOrgLessonCompletion()
    expect(completion.length).toBe(visible.size)
    for (const lesson of completion) {
      expect(visible.has(lesson.lessonId), lesson.title).toBe(true)
      expect(lesson.completed).toBeLessThanOrEqual(lesson.started)
      expect(lesson.quizPassed).toBeLessThanOrEqual(lesson.completed)
    }
  })
})
