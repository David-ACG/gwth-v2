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
const PREFIX = "judge-runner-test-"

const guide: MarkingGuide = {
  capstone: "familybot",
  title: "Month 1: FamilyBot",
  studentTitle: "FamilyBot",
  handInText: "",
  answersNote: "",
  expectedFiles: [{ id: "brief", label: "Weekly brief", nameHints: ["brief"], extensions: [], required: true }],
  criteria: [
    { id: "brief", name: "Brief", points: 60, descriptors: { pass: "p", good: "g", excellent: "e" } },
    { id: "digest", name: "Digest", points: 40, descriptors: { pass: "p", good: "g", excellent: "e" } },
  ],
  basics: [{ id: "consent", name: "Consent", text: "t" }],
}

function reply(levels: [Level, Level], text?: string) {
  return JSON.stringify({
    criteria: [
      { id: "brief", level: levels[0], quote: "dentist Thursday", feedback: "f", next_level: "n" },
      { id: "digest", level: levels[1], quote: "", feedback: "f", next_level: "n" },
    ],
    basics: [{ id: "consent", met: true, doubt: false, reason: "r" }],
    next_step: text ?? "Add the school calendar.",
  })
}

function fakeJudge(name: JudgeName, replies: (string | Error)[]): Judge & { calls: number } {
  const fn = (async () => {
    const next = replies[Math.min(fn.calls, replies.length - 1)]!
    fn.calls += 1
    if (next instanceof Error) throw next
    return { judge: name, modelId: `fake-${name}`, text: next, inputTokens: 100, outputTokens: 50, costUsd: 0.001 }
  }) as unknown as Judge & { calls: number }
  fn.calls = 0
  return fn
}

describeDb("capstone judge runner (live DB)", () => {
  let sql: ReturnType<typeof postgres>
  let dir: string
  let data: typeof import("@/lib/data/capstone-hand-ins")
  let runner: typeof import("@/lib/capstones/judge/runner")
  let preview: typeof import("@/lib/capstones/preview")
  let store: import("@/lib/capstones/storage").HandInStore
  let n = 0

  async function handIn(): Promise<string> {
    n += 1
    const userId = `${PREFIX}${n}`
    await sql`INSERT INTO "user" (id, name, email) VALUES (${userId}, 'Runner Test', ${`${userId}@example.com`})`
    const prepared = await preview.prepareHandIn(
      [{ path: "weekly_brief.md", bytes: strToU8("Tasks: dentist Thursday for Oscar") }],
      { built: "A FamilyBot for us all.", checked: "I checked the brief.", fixed: "Dates were wrong.", next: "Add the school." },
      [{ kindLabel: "Child", names: ["Oscar"] }],
    )
    const draft = await data.saveDraft(
      { userId, capstoneId: "familybot", sourceKind: "files", repoUrl: null, dataChoice: "own", checklist: [], prepared },
      store,
    )
    await data.confirmDraft({ userId, capstoneId: "familybot", handInId: draft.handInId, previewHash: prepared.hash, confirmed: true }, store)
    return draft.handInId
  }

  const runs = (id: string) => sql`SELECT judge, status, model_id, cost_usd FROM capstone_judge_runs WHERE hand_in_id = ${id} ORDER BY created_at`
  const attempt = (id: string) => sql`SELECT status, total, band, flags, criteria FROM capstone_attempts WHERE hand_in_id = ${id}`.then((r) => r[0]!)

  beforeAll(async () => {
    sql = postgres(DATABASE_URL!)
    for (const m of ["028_capstone_hand_ins.sql", "029_capstone_judge_runs.sql"]) {
      await sql.unsafe(readFileSync(resolve(process.cwd(), "supabase/migrations", m), "utf8"))
    }
    await sql`DELETE FROM "user" WHERE id LIKE ${PREFIX + "%"}`
    dir = mkdtempSync(join(tmpdir(), "judge-runner-"))
    process.env.HANDIN_LOCAL_DIR = dir
    store = (await import("@/lib/capstones/storage")).handInStore()!
    data = await import("@/lib/data/capstone-hand-ins")
    runner = await import("@/lib/capstones/judge/runner")
    preview = await import("@/lib/capstones/preview")
  })

  afterAll(async () => {
    await sql`DELETE FROM "user" WHERE id LIKE ${PREFIX + "%"}`
    await sql.end()
    rmSync(dir, { recursive: true, force: true })
    delete process.env.HANDIN_LOCAL_DIR
    delete process.env.CAPSTONE_JUDGES_TRUSTED_FOR
  })

  it("marks an agreed hand-in provisional, flagged for David while the capstone is not trusted", async () => {
    const id = await handIn()
    const out = await runner.markHandIn(id, {
      guide,
      store,
      judges: { luna: fakeJudge("luna", [reply(["good", "good"])]), haiku: fakeJudge("haiku", [reply(["good", "good"])]) },
    })
    expect(out).toMatchObject({ outcome: "marked", status: "provisional" })
    expect(await attempt(id)).toMatchObject({ status: "provisional", total: 75, band: "good", flags: ["david_check:first_20"] })
    expect((await runs(id)).map((r) => [r.judge, r.status, r.model_id])).toEqual([
      ["luna", "ok", "fake-luna"],
      ["haiku", "ok", "fake-haiku"],
    ].sort((a, b) => (a[0] === "luna" ? -1 : 1) - (b[0] === "luna" ? -1 : 1)))
    const [sub] = await sql`SELECT best_total, best_band FROM capstone_submissions s JOIN capstone_attempts a ON a.submission_id = s.id WHERE a.hand_in_id = ${id}`
    expect(sub).toMatchObject({ best_total: 75, best_band: "good" })
  })

  it("asks again after an invalid reply, and sends a judge that fails twice to David", async () => {
    const id = await handIn()
    const luna = fakeJudge("luna", ["not json", reply(["good", "good"])])
    const haiku = fakeJudge("haiku", [new Error("overloaded")])
    const out = await runner.markHandIn(id, { guide, store, judges: { luna, haiku } })
    expect(luna.calls).toBe(2)
    expect(haiku.calls).toBe(2)
    expect(out).toMatchObject({ outcome: "to_david", reason: "judge_failed:haiku" })
    expect(await attempt(id)).toMatchObject({ status: "with_david", total: null, flags: ["judge_failed:haiku"] })
    expect((await runs(id)).map((r) => `${r.judge}:${r.status}`).sort()).toEqual(["haiku:error", "haiku:error", "luna:invalid", "luna:ok"])
  })

  it("sends a disagreement to David", async () => {
    const id = await handIn()
    await runner.markHandIn(id, {
      guide,
      store,
      judges: { luna: fakeJudge("luna", [reply(["pass", "pass"])]), haiku: fakeJudge("haiku", [reply(["excellent", "excellent"])]) },
    })
    const row = await attempt(id)
    expect(row.status).toBe("with_david")
    expect(row.flags).toContain("judges_disagree")
  })

  it("lets agreed marks stand once the capstone is trusted, except a 1 in 20 spot check", async () => {
    process.env.CAPSTONE_JUDGES_TRUSTED_FOR = "familybot"
    const judges = () => ({ luna: fakeJudge("luna", [reply(["good", "good"])]), haiku: fakeJudge("haiku", [reply(["good", "good"])]) })
    const a = await handIn()
    await runner.markHandIn(a, { guide, store, judges: judges(), random: () => 0.5 })
    expect(await attempt(a)).toMatchObject({ status: "final", flags: [] })
    const b = await handIn()
    await runner.markHandIn(b, { guide, store, judges: judges(), random: () => 0.01 })
    expect(await attempt(b)).toMatchObject({ status: "provisional", flags: ["david_check:spot"] })
    delete process.env.CAPSTONE_JUDGES_TRUSTED_FOR
  })

  it("waits, leaving the hand-in being marked, when there are no API keys", async () => {
    const id = await handIn()
    delete process.env.OPENAI_API_KEY
    expect(await runner.markHandIn(id, { guide, store })).toEqual({ outcome: "waiting", reason: "the judges' API keys are not set" })
    expect((await attempt(id)).status).toBe("marking")
    expect(await data.handInsAwaitingMarking(100)).toContain(id)
  })

  it("never marks a draft", async () => {
    n += 1
    const userId = `${PREFIX}${n}`
    await sql`INSERT INTO "user" (id, name, email) VALUES (${userId}, 'Runner Test', ${`${userId}@example.com`})`
    const prepared = await preview.prepareHandIn([{ path: "a.md", bytes: strToU8("x") }], { built: "b", checked: "c", fixed: "f", next: "n" }, [])
    const draft = await data.saveDraft({ userId, capstoneId: "familybot", sourceKind: "files", repoUrl: null, dataChoice: "example", checklist: [], prepared }, store)
    await expect(runner.markHandIn(draft.handInId, { guide, store, judges: { luna: fakeJudge("luna", []), haiku: fakeJudge("haiku", []) } })).rejects.toThrow(/not been confirmed/)
  })
})
