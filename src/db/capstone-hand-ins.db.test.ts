// @vitest-environment node
import { afterAll, beforeAll, describe, expect, it } from "vitest"
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join, resolve } from "node:path"
import postgres from "postgres"
import { strToU8 } from "fflate"
import { builtInGuide } from "@/lib/capstones/guides"
import { prepareHandIn } from "@/lib/capstones/preview"
import { matchChecklist } from "@/lib/capstones/rules"
import type { HandInStore } from "@/lib/capstones/storage"

const DATABASE_URL = process.env.DATABASE_URL
const describeDb = DATABASE_URL ? describe : describe.skip
const USER = "capstone-hand-in-test-user"

const answers = {
  built: "A FamilyBot for Amelia that plans the week for our house.",
  checked: "I checked the brief against the transcript line by line.",
  fixed: "The dates were wrong until I gave it today's date.",
  next: "I would add the school calendar to the sources.",
}

describeDb("028 capstone hand-ins (live DB)", () => {
  let sql: ReturnType<typeof postgres>
  let dir: string
  let store: HandInStore
  let data: typeof import("@/lib/data/capstone-hand-ins")

  async function cleanup() {
    await sql`DELETE FROM capstone_submissions WHERE user_id = ${USER}`
    await sql`DELETE FROM "user" WHERE id = ${USER}`
  }

  async function draftInput() {
    const prepared = await prepareHandIn(
      [
        { path: "blueprint.md", bytes: strToU8("Blueprint for Amelia, call 07700 900123") },
        { path: "shot.png", bytes: new Uint8Array([137, 80, 78, 71, 1]) },
      ],
      answers,
      [{ kindLabel: "Child", names: ["Amelia"] }],
    )
    return {
      userId: USER,
      capstoneId: "familybot" as const,
      sourceKind: "files" as const,
      repoUrl: null,
      dataChoice: "own" as const,
      checklist: matchChecklist(prepared.files.map((f) => f.path), builtInGuide("familybot").expectedFiles),
      prepared,
    }
  }

  beforeAll(async () => {
    sql = postgres(DATABASE_URL!)
    const migration = readFileSync(resolve(process.cwd(), "supabase/migrations/028_capstone_hand_ins.sql"), "utf8")
    await sql.unsafe(migration)
    await sql.unsafe(migration)
    await cleanup()
    await sql`INSERT INTO "user" (id, name, email) VALUES (${USER}, 'Hand-in Test', 'hand-in-test@example.com')`
    dir = mkdtempSync(join(tmpdir(), "handins-"))
    process.env.HANDIN_LOCAL_DIR = dir
    const storage = await import("@/lib/capstones/storage")
    store = storage.handInStore()!
    data = await import("@/lib/data/capstone-hand-ins")
  })

  afterAll(async () => {
    await cleanup()
    await sql.end()
    rmSync(dir, { recursive: true, force: true })
    delete process.env.HANDIN_LOCAL_DIR
  })

  it("stores only redacted files under a random id, and a draft uses no hand-in", async () => {
    const draft = await data.saveDraft(await draftInput(), store)
    expect(draft.handInId).toMatch(/^h_[A-Za-z0-9_-]{22}$/)
    expect(draft.status).toBe("draft")
    const stored = readFileSync(join(dir, "hand-ins", draft.handInId, "files", "blueprint.md"), "utf8")
    expect(stored).toBe("Blueprint for [Child 1], call [Phone 1]")
    const [row] = await sql`SELECT answers, redaction FROM capstone_attempts WHERE hand_in_id = ${draft.handInId}`
    expect(JSON.stringify(row)).not.toMatch(/Amelia|07700|hand-in-test@/)
    const state = await data.getHandInState(USER, "familybot")
    expect(state.attempts).toHaveLength(0)
    expect(state.draft?.handInId).toBe(draft.handInId)
  })

  it("preparing again replaces the draft and its files", async () => {
    const first = (await data.getHandInState(USER, "familybot")).draft!
    const second = await data.saveDraft(await draftInput(), store)
    expect(second.handInId).not.toBe(first.handInId)
    expect(await store.get(`hand-ins/${first.handInId}/files/blueprint.md`)).toBeNull()
    const [counted] = await sql`SELECT count(*)::int AS count FROM capstone_attempts a JOIN capstone_submissions s ON s.id = a.submission_id WHERE s.user_id = ${USER} AND a.status = 'draft'`
    expect(counted?.count).toBe(1)
  })

  it("never hands in, or lets a marker read, a draft without the tick", async () => {
    const draft = (await data.getHandInState(USER, "familybot")).draft!
    const hash = (await draftInput()).prepared.hash
    await expect(
      data.confirmDraft({ userId: USER, capstoneId: "familybot", handInId: draft.handInId, previewHash: hash, confirmed: false }, store),
    ).rejects.toThrow(/Tick the box/)
    await expect(data.getHandInForMarking(draft.handInId, store)).rejects.toThrow(/not been confirmed/)
  })

  it("refuses when the stored draft is not the one previewed", async () => {
    const draft = (await data.getHandInState(USER, "familybot")).draft!
    await expect(
      data.confirmDraft({ userId: USER, capstoneId: "familybot", handInId: draft.handInId, previewHash: "f".repeat(64), confirmed: true }, store),
    ).rejects.toThrow(/changed after you previewed/)
  })

  it("hands in, sends the marker exactly the preview, and never the recording", async () => {
    const draft = (await data.getHandInState(USER, "familybot")).draft!
    const attempt = await data.confirmDraft(
      {
        userId: USER,
        capstoneId: "familybot",
        handInId: draft.handInId,
        previewHash: (await draftInput()).prepared.hash,
        confirmed: true,
        recording: { bytes: new Uint8Array([1, 2, 3]), extension: "mp4", contentType: "video/mp4" },
      },
      store,
    )
    expect(attempt).toMatchObject({ attemptNo: 1, status: "marking", hasRecording: true })
    const forMarking = await data.getHandInForMarking(draft.handInId, store)
    expect(forMarking.files.map((f) => f.path)).toEqual(["blueprint.md", "shot.png"])
    expect(new TextDecoder().decode(forMarking.files[0]!.bytes)).toBe("Blueprint for [Child 1], call [Phone 1]")
    expect(forMarking.answers.built).toBe("A FamilyBot for [Child 1] that plans the week for our house.")
    expect(JSON.stringify(Object.keys(forMarking))).not.toMatch(/recording/)
  })

  it("refuses to send a file that changed after the learner ticked", async () => {
    const state = await data.getHandInState(USER, "familybot")
    const id = state.attempts[0]!.handInId
    const path = join(dir, "hand-ins", id, "files", "blueprint.md")
    const original = readFileSync(path)
    writeFileSync(path, "Blueprint for Amelia")
    await expect(data.getHandInForMarking(id, store)).rejects.toThrow(/does not match/)
    writeFileSync(path, original)
  })

  it("waits for a mark, allows three hand-ins, and the best mark counts", async () => {
    const hand = async () => {
      const d = await data.saveDraft(await draftInput(), store)
      return data.confirmDraft({ userId: USER, capstoneId: "familybot", handInId: d.handInId, previewHash: (await draftInput()).prepared.hash, confirmed: true }, store)
    }
    // Hand-in 1 is still being marked.
    await expect(data.saveDraft(await draftInput(), store)).rejects.toThrow(/still being marked/)
    const first = (await data.getHandInState(USER, "familybot")).attempts[0]!
    await data.applyMark(first.handInId, { status: "provisional", total: 70, band: "not_yet", flags: ["basics"] })

    const second = await hand()
    expect(second.attemptNo).toBe(2)
    await data.applyMark(second.handInId, { status: "final", total: 64, band: "good" })
    const third = await hand()
    expect(third.attemptNo).toBe(3)
    await data.applyMark(third.handInId, { status: "provisional", total: 52, band: "pass" })

    const state = await data.getHandInState(USER, "familybot")
    expect(state.attempts.map((a) => a.attemptNo)).toEqual([1, 2, 3])
    expect(state.best?.handInId).toBe(second.handInId)
    expect(state.blockReason).toMatch(/3 times/)
    await expect(data.saveDraft(await draftInput(), store)).rejects.toThrow(/3 times/)
    const [sub] = await sql`SELECT best_total, best_band, best_attempt_id FROM capstone_submissions WHERE user_id = ${USER}`
    expect(sub).toMatchObject({ best_total: 64, best_band: "good", best_attempt_id: second.id })
  })

  it("the database itself refuses a fourth numbered hand-in and a second draft", async () => {
    const [sub] = await sql`SELECT id FROM capstone_submissions WHERE user_id = ${USER}`
    await expect(
      sql`INSERT INTO capstone_attempts (submission_id, hand_in_id, attempt_no, status, source_kind, data_choice, answers, preview_sha256, confirmed_at)
          VALUES (${sub!.id}, 'h_AAAAAAAAAAAAAAAAAAAAAA', 4, 'marking', 'files', 'own', '{}', 'x', NOW())`,
    ).rejects.toThrow()
    await sql`INSERT INTO capstone_attempts (submission_id, hand_in_id, status, source_kind, data_choice, answers, preview_sha256)
              VALUES (${sub!.id}, 'h_BBBBBBBBBBBBBBBBBBBBBB', 'draft', 'files', 'own', '{}', 'x')`
    await expect(
      sql`INSERT INTO capstone_attempts (submission_id, hand_in_id, status, source_kind, data_choice, answers, preview_sha256)
          VALUES (${sub!.id}, 'h_CCCCCCCCCCCCCCCCCCCCCC', 'draft', 'files', 'own', '{}', 'x')`,
    ).rejects.toThrow()
    await expect(
      sql`UPDATE capstone_attempts SET status = 'marking' WHERE hand_in_id = 'h_BBBBBBBBBBBBBBBBBBBBBB'`,
    ).rejects.toThrow()
  })
})
