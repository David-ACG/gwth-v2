// @vitest-environment node
import { afterAll, beforeAll, describe, expect, it } from "vitest"
import { mkdtempSync, readFileSync, rmSync } from "node:fs"
import { tmpdir } from "node:os"
import { join, resolve } from "node:path"
import postgres from "postgres"
import { strToU8 } from "fflate"
import type { MarkingGuide } from "@/lib/capstones/guide-loader"
import type { Judge, JudgeName } from "@/lib/capstones/judge/providers"
import type { Level } from "@/lib/capstones/judge/verdict"

const DATABASE_URL = process.env.DATABASE_URL
const describeDb = DATABASE_URL ? describe : describe.skip
const PREFIX = "capstone-marks-test-"

const guide: MarkingGuide = {
  capstone: "familybot",
  title: "Month 1: FamilyBot",
  studentTitle: "FamilyBot",
  handInText: "",
  answersNote: "",
  expectedFiles: [],
  criteria: [
    { id: "brief", name: "Brief", points: 60, descriptors: { pass: "p", good: "g", excellent: "e" } },
    { id: "digest", name: "Digest", points: 40, descriptors: { pass: "p", good: "g", excellent: "e" } },
  ],
  basics: [{ id: "consent", name: "Consent", text: "t" }],
}

const full = (levels: [Level, Level]) =>
  JSON.stringify({
    criteria: [
      { id: "brief", level: levels[0], quote: "dentist", feedback: "f", next_level: "n" },
      { id: "digest", level: levels[1], quote: "", feedback: "f", next_level: "n" },
    ],
    basics: [{ id: "consent", met: true, doubt: false, reason: "r" }],
    next_step: "Add the school calendar.",
  })
const one = (level: Level) => JSON.stringify({ id: "digest", level, quote: "", feedback: "f", next_level: "n" })
const judge = (name: JudgeName, text: string): Judge =>
  (async () => ({ judge: name, modelId: `fake-${name}`, text, inputTokens: 1, outputTokens: 1, costUsd: 0 })) as unknown as Judge

describeDb("capstone marks: queries and David's checks (live DB)", () => {
  let sql: ReturnType<typeof postgres>
  let dir: string
  let store: import("@/lib/capstones/storage").HandInStore
  let data: typeof import("@/lib/data/capstone-hand-ins")
  let marks: typeof import("@/lib/data/capstone-marks")
  let runner: typeof import("@/lib/capstones/judge/runner")
  let query: typeof import("@/lib/capstones/judge/query")
  let preview: typeof import("@/lib/capstones/preview")
  let n = 0

  /** A learner with one hand-in marked Good/Good (75), flagged for David's first-20 check. */
  async function markedLearner(): Promise<{ userId: string; handInId: string }> {
    n += 1
    const userId = `${PREFIX}${n}`
    await sql`INSERT INTO "user" (id, name, email) VALUES (${userId}, 'Marks Test', ${`${userId}@example.com`})`
    const prepared = await preview.prepareHandIn(
      [{ path: "weekly_brief.md", bytes: strToU8("Tasks: dentist Thursday") }],
      { built: "A FamilyBot for us.", checked: "I checked it.", fixed: "Dates.", next: "School." },
      [],
    )
    const draft = await data.saveDraft({ userId, capstoneId: "familybot", sourceKind: "files", repoUrl: null, dataChoice: "example", checklist: [], prepared }, store)
    await data.confirmDraft({ userId, capstoneId: "familybot", handInId: draft.handInId, previewHash: prepared.hash, confirmed: true }, store)
    await runner.markHandIn(draft.handInId, { guide, store, judges: { luna: judge("luna", full(["good", "good"])), haiku: judge("haiku", full(["good", "good"])) } })
    return { userId, handInId: draft.handInId }
  }

  beforeAll(async () => {
    sql = postgres(DATABASE_URL!)
    for (const m of ["028_capstone_hand_ins.sql", "029_capstone_judge_runs.sql", "030_capstone_hand_in_retention.sql", "031_capstone_checks_and_queries.sql"]) {
      await sql.unsafe(readFileSync(resolve(process.cwd(), "supabase/migrations", m), "utf8"))
    }
    await sql`DELETE FROM "user" WHERE id LIKE ${PREFIX + "%"}`
    dir = mkdtempSync(join(tmpdir(), "capstone-marks-"))
    process.env.HANDIN_LOCAL_DIR = dir
    store = (await import("@/lib/capstones/storage")).handInStore()!
    data = await import("@/lib/data/capstone-hand-ins")
    marks = await import("@/lib/data/capstone-marks")
    runner = await import("@/lib/capstones/judge/runner")
    query = await import("@/lib/capstones/judge/query")
    preview = await import("@/lib/capstones/preview")
  })

  afterAll(async () => {
    await sql`DELETE FROM "user" WHERE id LIKE ${PREFIX + "%"}`
    await sql.end()
    rmSync(dir, { recursive: true, force: true })
    delete process.env.HANDIN_LOCAL_DIR
  })

  it("shows a provisional mark card, and puts it in David's first-20 queue", async () => {
    const { userId, handInId } = await markedLearner()
    const { cards, query: q } = await marks.getMarkCards(userId, "familybot")
    expect(cards[0]).toMatchObject({ handInId, status: "provisional", total: 75, band: "good", checked: false, nextStep: "Add the school calendar." })
    expect(q).toBeNull()
    const item = (await marks.davidQueue()).find((i) => i.handInId === handInId)
    expect(item?.reasons).toEqual(["One of the first 20 for this capstone"])
    expect(item?.judges.map((j) => j.verdict?.criteria[0]?.level)).toEqual(["good", "good"])
  })

  it("lets David agree, which makes the mark final, records the answer key and leaves the queue", async () => {
    const { userId, handInId } = await markedLearner()
    await marks.recordDavidCheck(handInId, { levels: {}, basics: {} })
    const [row] = await sql`SELECT status, checked_at, david_levels, change_note, total FROM capstone_attempts WHERE hand_in_id = ${handInId}`
    expect(row).toMatchObject({ status: "final", change_note: null, total: 75 })
    expect(row!.checked_at).not.toBeNull()
    expect(row!.david_levels).toEqual({ criteria: [{ id: "brief", level: "good" }, { id: "digest", level: "good" }], basics: [{ id: "consent", met: true }] })
    expect((await marks.davidQueue()).some((i) => i.handInId === handInId)).toBe(false)
    expect((await marks.getMarkCards(userId, "familybot")).cards[0]?.status).toBe("final")
  })

  it("lets David change a level: the learner sees the new mark, the old one and why", async () => {
    const { userId, handInId } = await markedLearner()
    await marks.recordDavidCheck(handInId, { levels: { digest: "excellent" }, basics: {}, note: "Your digest leads with what matters." })
    const card = (await marks.getMarkCards(userId, "familybot")).cards[0]!
    expect(card).toMatchObject({ status: "final", total: 85, band: "excellent", previousTotal: 75, previousBand: "good", changeNote: "Your digest leads with what matters." })
    const [sub] = await sql`SELECT best_total, best_band FROM capstone_submissions WHERE user_id = ${userId}`
    expect(sub).toMatchObject({ best_total: 85, best_band: "excellent" })
  })

  it("runs a query: one per capstone, both judges re-mark it, an agreed change shows with its reason", async () => {
    const { userId, handInId } = await markedLearner()
    const id = await marks.openQuery(userId, "familybot", handInId, "digest", "My digest leads with the dentist, see weekly_digest.txt")
    await expect(marks.openQuery(userId, "familybot", handInId, "brief", "again")).rejects.toThrow(/already queried/)
    const status = await query.remarkQuery(id, { guide, store, judges: { luna: judge("luna", one("excellent")), haiku: judge("haiku", one("excellent")) } })
    expect(status).toBe("answered")
    const { cards, query: q } = await marks.getMarkCards(userId, "familybot")
    expect(q).toMatchObject({ status: "answered", levelBefore: "good", levelAfter: "excellent" })
    expect(cards[0]).toMatchObject({ total: 85, previousTotal: 75, changeNote: expect.stringContaining("after your query") })
  })

  it("sends a query to David when the judges disagree, or when the learner still disagrees", async () => {
    const a = await markedLearner()
    const idA = await marks.openQuery(a.userId, "familybot", a.handInId, "digest", "It is better than Good.")
    expect(await query.remarkQuery(idA, { guide, store, judges: { luna: judge("luna", one("excellent")), haiku: judge("haiku", one("good")) } })).toBe("with_david")

    const b = await markedLearner()
    const idB = await marks.openQuery(b.userId, "familybot", b.handInId, "digest", "It is better than Good.")
    await query.remarkQuery(idB, { guide, store, judges: { luna: judge("luna", one("good")), haiku: judge("haiku", one("good")) } })
    await marks.stillDisagree(b.userId, "familybot")
    await expect(marks.stillDisagree(b.userId, "familybot")).rejects.toThrow(/need to answer your query/)

    const queue = await marks.davidQueue()
    expect(queue.find((i) => i.handInId === a.handInId)?.reasons[0]).toBe("The judges disagreed on a query")
    expect(queue.find((i) => i.handInId === b.handInId)?.reasons[0]).toBe("The learner still disagrees after a re-mark")

    await marks.recordDavidCheck(b.handInId, { levels: { digest: "good" }, basics: {}, note: "Good is right: lead with this week's events." })
    expect((await marks.getMarkCards(b.userId, "familybot")).query).toMatchObject({ status: "resolved", levelAfter: "good", davidNote: "Good is right: lead with this week's events." })
  })

  it("refuses a query on an unmarked hand-in, an unknown criterion or a long reason", async () => {
    const { userId, handInId } = await markedLearner()
    await expect(marks.openQuery(userId, "familybot", handInId, "nope", "why")).rejects.toThrow(/Choose one part/)
    await expect(marks.openQuery(userId, "familybot", handInId, "digest", "x".repeat(501))).rejects.toThrow(/500 characters/)
    await expect(marks.openQuery("someone-else", "familybot", handInId, "digest", "why")).rejects.toThrow(/when it's ready/)
  })
})

describe("queue reasons", () => {
  it("says why each hand-in is waiting, in plain words", async () => {
    const { queueReasons } = await import("@/lib/data/capstone-marks")
    expect(queueReasons("with_david", ["judges_disagree", "near_band_line", "basics:consent"], null)).toEqual([
      "The judges gave different bands",
      "Within 3 points of a band line",
      "Basics line in doubt: consent",
    ])
    expect(queueReasons("provisional", ["david_check:spot"], null)).toEqual(["Random 1 in 20 spot check"])
    expect(queueReasons("with_david", ["basics:nothing_invented"], null, { nothing_invented: "Nothing invented" })).toEqual(["Basics line in doubt: Nothing invented"])
  })
})
