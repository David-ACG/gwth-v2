/**
 * Unit tests for the effective-syllabus resolution layer (N6).
 *
 * The pure filtering helpers are tested directly; the resolution rungs that
 * need a database (member override -> org default -> global default) are
 * covered end-to-end in src/db/edition-resolution.db.test.ts. Here we prove
 * the two properties that must hold WITHOUT a database:
 *   - mock mode always resolves to the raw fallback (no filtering, historic
 *     pass mark), so the pre-edition mock catalogue is byte-identical;
 *   - the filter helpers preserve the input untouched on the fallback and
 *     apply edition membership + ratified-state + sort_order otherwise.
 */
import { beforeEach, describe, expect, it, vi } from "vitest"

const modeLayer = vi.hoisted(() => ({
  resolveDataMode: vi.fn(),
}))

vi.mock("./mode", () => ({
  resolveDataMode: modeLayer.resolveDataMode,
}))

import {
  filterLessonsByEdition,
  getEffectiveEdition,
  getMandatoryLessonIds,
  isLessonInEdition,
  type EffectiveEdition,
} from "./editions"
import { QUIZ_PASS_SCORE } from "@/lib/progress/completion"
import { mockLessons } from "./mock-data"

beforeEach(() => {
  vi.clearAllMocks()
  modeLayer.resolveDataMode.mockResolvedValue({ kind: "mock" })
})

/** An edition curating three of four lessons, one of them still draft. */
function curatedEdition(): EffectiveEdition {
  return {
    editionId: "test-edition",
    organisationId: "org_1",
    passMark: 80,
    coBrandLabel: "Curated by TEST",
    source: "org-default",
    lessons: new Map([
      // Deliberately out of input order: sort_order must govern.
      ["l2", { tier: "core", state: "ratified", isMandatory: true, sortOrder: 10 }],
      ["l1", { tier: "optional", state: "ratified", isMandatory: false, sortOrder: 20 }],
      ["l4", { tier: "exclusive", state: "draft", isMandatory: true, sortOrder: 30 }],
    ]),
  }
}

const ROWS = [
  { id: "l1", title: "One" },
  { id: "l2", title: "Two" },
  { id: "l3", title: "Three" },
  { id: "l4", title: "Four" },
]

describe("mock-mode resolution (the no-DB golden path)", () => {
  it("resolves to the raw fallback: no filtering, historic pass mark", async () => {
    const edition = await getEffectiveEdition()
    expect(edition.source).toBe("fallback")
    expect(edition.editionId).toBeNull()
    expect(edition.lessons).toBeNull()
    expect(edition.passMark).toBe(QUIZ_PASS_SCORE)
  })

  it("derives the mandatory set from the mock catalogue's non-optional lessons", async () => {
    const ids = await getMandatoryLessonIds()
    const expected = mockLessons.filter(
      (l) => l.courseSlug === "applied-ai-skills" && !l.isOptional
    )
    expect(ids.size).toBe(expected.length)
    for (const lesson of expected) expect(ids.has(lesson.id)).toBe(true)
  })
})

describe("filterLessonsByEdition / isLessonInEdition", () => {
  it("passes rows through untouched on the fallback edition", async () => {
    const fallback = await getEffectiveEdition()
    expect(filterLessonsByEdition(ROWS, fallback)).toEqual(ROWS)
    expect(isLessonInEdition(fallback, "anything")).toBe(true)
  })

  it("keeps only ratified edition members, ordered by sort_order", () => {
    const filtered = filterLessonsByEdition(ROWS, curatedEdition())
    // l3 absent from the edition; l4 present but draft (invisible to
    // learners, decision recorded in editions.ts); l2 before l1 by sort.
    expect(filtered.map((r) => r.id)).toEqual(["l2", "l1"])
  })

  it("answers deep-link visibility the same way (getLesson's gate)", () => {
    const edition = curatedEdition()
    expect(isLessonInEdition(edition, "l2")).toBe(true)
    expect(isLessonInEdition(edition, "l3")).toBe(false)
    expect(isLessonInEdition(edition, "l4")).toBe(false) // draft
  })
})
