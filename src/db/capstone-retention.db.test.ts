// @vitest-environment node
/**
 * 030 hand-in retention against a real database (bead gwth-launch-9289.11).
 * SKIPPED unless DATABASE_URL is set. Run:
 *   DATABASE_URL=postgresql://gwth:devpass@127.0.0.1:5443/gwth_v2 \
 *     npx vitest run src/db/capstone-retention.db.test.ts
 * Files go to a temporary HANDIN_LOCAL_DIR. The test's own rows are dated in
 * 2000-2001 and the job runs "as of" 2001-06-01, so no other row qualifies.
 */
import { afterAll, beforeAll, describe, expect, it } from "vitest"
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs"
import { tmpdir } from "node:os"
import { join, resolve } from "node:path"
import postgres from "postgres"
import { strToU8 } from "fflate"
import { builtInGuide, type CapstoneId } from "@/lib/capstones/guides"
import { prepareHandIn } from "@/lib/capstones/preview"
import { matchChecklist } from "@/lib/capstones/rules"
import type { HandInStore } from "@/lib/capstones/storage"

const DATABASE_URL = process.env.DATABASE_URL
const describeDb = DATABASE_URL ? describe : describe.skip
const USER_A = "capstone-retention-test-a"
const USER_B = "capstone-retention-test-b"
const NOW = new Date("2001-06-01T12:00:00Z")

const answers = {
  built: "A FamilyBot for Amelia that plans the week for our house.",
  checked: "I checked the brief against the transcript line by line.",
  fixed: "The dates were wrong until I gave it today's date.",
  next: "I would add the school calendar to the sources.",
}

describeDb("030 capstone hand-in retention (live DB)", () => {
  let sql: ReturnType<typeof postgres>
  let dir: string
  let store: HandInStore
  let data: typeof import("@/lib/data/capstone-hand-ins")
  let retention: typeof import("@/lib/data/capstone-retention")

  async function cleanup() {
    for (const id of [USER_A, USER_B]) {
      await sql`DELETE FROM capstone_submissions WHERE user_id = ${id}`
      await sql`DELETE FROM "user" WHERE id = ${id}`
    }
  }

  async function draft(userId: string, capstoneId: CapstoneId) {
    const prepared = await prepareHandIn(
      [{ path: "blueprint.md", bytes: strToU8("Blueprint for Amelia, call 07700 900123") }],
      answers,
      [{ kindLabel: "Child", names: ["Amelia"] }],
    )
    const saved = await data.saveDraft(
      {
        userId,
        capstoneId,
        sourceKind: "files",
        repoUrl: null,
        dataChoice: "own",
        checklist: matchChecklist(prepared.files.map((f) => f.path), builtInGuide(capstoneId).expectedFiles),
        prepared,
      },
      store,
    )
    return { handInId: saved.handInId, hash: prepared.hash }
  }

  async function handIn(userId: string, capstoneId: CapstoneId, withRecording = false) {
    const d = await draft(userId, capstoneId)
    await data.confirmDraft(
      {
        userId,
        capstoneId,
        handInId: d.handInId,
        previewHash: d.hash,
        confirmed: true,
        ...(withRecording ? { recording: { bytes: new Uint8Array([1, 2, 3]), extension: "mp4", contentType: "video/mp4" } } : {}),
      },
      store,
    )
    return d.handInId
  }

  async function finalise(handInId: string, at: string, total = 64) {
    await data.applyMark(handInId, { status: "final", total, band: "good", feedback: { summary: "Clear brief." } })
    await sql`UPDATE capstone_attempts SET finalised_at = ${at}::timestamptz WHERE hand_in_id = ${handInId}`
  }

  const stored = (handInId: string) => existsSync(join(dir, "hand-ins", handInId))
  const row = async (handInId: string) =>
    (await sql`SELECT * FROM capstone_attempts WHERE hand_in_id = ${handInId}`)[0]

  beforeAll(async () => {
    sql = postgres(DATABASE_URL!)
    for (const name of ["028_capstone_hand_ins.sql", "030_capstone_hand_in_retention.sql"]) {
      const migration = readFileSync(resolve(process.cwd(), "supabase/migrations", name), "utf8")
      await sql.unsafe(migration)
      await sql.unsafe(migration)
    }
    await cleanup()
    await sql`INSERT INTO "user" (id, name, email) VALUES (${USER_A}, 'Retention A', 'retention-a@example.com')`
    await sql`INSERT INTO "user" (id, name, email) VALUES (${USER_B}, 'Retention B', 'retention-b@example.com')`
    dir = mkdtempSync(join(tmpdir(), "handins-retention-"))
    process.env.HANDIN_LOCAL_DIR = dir
    store = (await import("@/lib/capstones/storage")).handInStore()!
    data = await import("@/lib/data/capstone-hand-ins")
    retention = await import("@/lib/data/capstone-retention")
  })

  afterAll(async () => {
    await cleanup()
    await sql.end()
    rmSync(dir, { recursive: true, force: true })
    delete process.env.HANDIN_LOCAL_DIR
  })

  it("the migration adds the two columns", async () => {
    const cols = await sql`SELECT column_name FROM information_schema.columns WHERE table_name = 'capstone_attempts' AND column_name LIKE 'files_deleted%' ORDER BY 1`
    expect(cols.map((c) => c.column_name)).toEqual(["files_deleted_at", "files_deleted_reason"])
  })

  it("deletes files 12 months after the mark is final, keeps the mark, and leaves younger ones", async () => {
    const old = await handIn(USER_A, "familybot", true)
    await finalise(old, "2000-06-01T12:00:00Z") // exactly 12 months before NOW
    const recent = await handIn(USER_A, "familybot")
    await finalise(recent, "2000-12-01T00:00:00Z", 70)
    expect(stored(old)).toBe(true)
    expect(readFileSync(join(dir, "hand-ins", old, "recording", "recording.mp4"))).toHaveLength(3)

    const result = await retention.deleteExpiredHandInFiles(NOW, store)
    expect(result.deleted).toEqual([old])
    expect(result.failed).toEqual([])

    expect(stored(old)).toBe(false)
    expect(stored(recent)).toBe(true)
    const gone = await row(old)
    expect(gone).toMatchObject({
      status: "final",
      total: 64,
      band: "good",
      feedback: { summary: "Clear brief." },
      files: [],
      checklist: [],
      answers: {},
      recording_key: null,
      files_deleted_reason: "retention",
    })
    expect(new Date(gone!.files_deleted_at).toISOString()).toBe(NOW.toISOString())
    expect((await row(recent))?.files_deleted_at).toBeNull()
    // The database refuses a reason without a date, or an unknown reason.
    await expect(sql`UPDATE capstone_attempts SET files_deleted_reason = 'retention' WHERE hand_in_id = ${recent}`).rejects.toThrow()
    await expect(sql`UPDATE capstone_attempts SET files_deleted_at = NOW(), files_deleted_reason = 'tidy' WHERE hand_in_id = ${recent}`).rejects.toThrow()

    const [sub] = await sql`SELECT best_total, best_band FROM capstone_submissions WHERE user_id = ${USER_A} AND capstone_id = 'familybot'`
    expect(sub).toMatchObject({ best_total: 70, best_band: "good" })
  })

  it("never sends a hand-in whose files were deleted to a marker", async () => {
    const [found] = await sql`SELECT hand_in_id FROM capstone_attempts WHERE files_deleted_reason = 'retention' AND submission_id IN (SELECT id FROM capstone_submissions WHERE user_id = ${USER_A})`
    await expect(data.getHandInForMarking(found!.hand_in_id, store)).rejects.toThrow(/files were deleted/)
  })

  it("removes drafts never handed in after 30 days and keeps newer drafts", async () => {
    const stale = await draft(USER_A, "askmyco")
    const fresh = await draft(USER_A, "askeveryone")
    await sql`UPDATE capstone_attempts SET created_at = '2001-05-01T12:00:00Z' WHERE hand_in_id = ${stale.handInId}`
    await sql`UPDATE capstone_attempts SET created_at = '2001-05-20T12:00:00Z' WHERE hand_in_id = ${fresh.handInId}`

    const result = await retention.deleteExpiredHandInFiles(NOW, store)
    expect(result.draftsRemoved).toEqual([stale.handInId])
    expect(result.deleted).toEqual([])
    expect(await row(stale.handInId)).toBeUndefined()
    expect(stored(stale.handInId)).toBe(false)
    expect(stored(fresh.handInId)).toBe(true)
  })

  it("is idempotent: a second run deletes nothing more", async () => {
    expect(await retention.deleteExpiredHandInFiles(NOW, store)).toEqual({ deleted: [], draftsRemoved: [], failed: [] })
  })

  it("deletes a learner's files on request, holding back marks that are not final unless told", async () => {
    const finalOne = await handIn(USER_B, "familybot")
    await data.applyMark(finalOne, { status: "final", total: 80, band: "excellent" })
    const marking = await handIn(USER_B, "askmyco")
    const pendingDraft = await draft(USER_B, "askeveryone")

    const first = await retention.deleteLearnerHandInFiles(USER_B, {}, store, NOW)
    expect(first.deleted).toEqual([finalOne])
    expect(first.draftsRemoved).toEqual([pendingDraft.handInId])
    expect(first.keptNotFinal).toEqual([marking])
    expect(stored(finalOne)).toBe(false)
    expect(stored(marking)).toBe(true)
    expect(await row(finalOne)).toMatchObject({ total: 80, band: "excellent", files: [], files_deleted_reason: "learner_request" })

    const second = await retention.deleteLearnerHandInFiles(USER_B, { evenIfNotFinal: true }, store, NOW)
    expect(second).toEqual({ deleted: [marking], draftsRemoved: [], failed: [], keptNotFinal: [] })
    expect(stored(marking)).toBe(false)
    await expect(data.getHandInForMarking(marking, store)).rejects.toThrow(/files were deleted/)

    // User A's younger hand-in and draft were not touched by B's request.
    const aStill = await sql`SELECT count(*)::int AS n FROM capstone_attempts a JOIN capstone_submissions s ON s.id = a.submission_id WHERE s.user_id = ${USER_A} AND a.files_deleted_at IS NULL`
    expect(aStill[0]?.n).toBe(2)
  })

  it("can be limited to one capstone", async () => {
    const result = await retention.deleteLearnerHandInFiles(USER_A, { capstoneId: "askeveryone" }, store, NOW)
    expect(result.draftsRemoved).toHaveLength(1)
    expect(result.deleted).toEqual([])
    const left = await sql`SELECT count(*)::int AS n FROM capstone_attempts a JOIN capstone_submissions s ON s.id = a.submission_id WHERE s.user_id = ${USER_A} AND a.files_deleted_at IS NULL`
    expect(left[0]?.n).toBe(1)
  })
})
