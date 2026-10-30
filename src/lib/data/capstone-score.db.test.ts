/**
 * Live-DB tests for the capstone half of the GWTH score (bead
 * gwth-launch-9289.10): `getCapstoneBestTotals` reads
 * `capstone_submissions.best_total` for ONE learner, and `getDynamicScore`
 * adds it to the score. SKIPPED unless DATABASE_URL is set:
 *
 *   DATABASE_URL=postgresql://gwth:devpass@127.0.0.1:5443/gwth_v2 \
 *     npx vitest run src/lib/data/capstone-score.db.test.ts
 */
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest"
import postgres from "postgres"

const DATABASE_URL = process.env.DATABASE_URL
const describeDb = DATABASE_URL ? describe : describe.skip

const currentUser = vi.hoisted(() => ({ id: null as string | null }))
vi.mock("@/lib/auth", () => ({
  getCurrentUser: async () => (currentUser.id ? { id: currentUser.id } : null),
}))

const USER_S = "00000000-0000-0000-0000-0000000928a1"
const USER_T = "00000000-0000-0000-0000-0000000928a2"

describeDb("capstone points in the GWTH score (live DB)", () => {
  let sql: ReturnType<typeof postgres>
  let capstones: typeof import("./capstone-score")
  let progress: typeof import("./progress")

  beforeAll(async () => {
    sql = postgres(DATABASE_URL!)
    capstones = await import("./capstone-score")
    progress = await import("./progress")
    await sql`delete from "user" where id in (${USER_S}, ${USER_T})`
    await sql`insert into "user" (id, name, email) values
      (${USER_S}, '9289.10 Score S', 'score-9289-10-s@example.com'),
      (${USER_T}, '9289.10 Score T', 'score-9289-10-t@example.com')`
    // S: FamilyBot 60 (counts 10), AskMyCo a Not yet (stored 0), AskEveryone
    // handed in but not marked yet (null). T: AskMyCo 90, to prove scoping.
    await sql`insert into capstone_submissions (user_id, capstone_id, best_total, best_band) values
      (${USER_S}, 'familybot', 60, 'pass'),
      (${USER_S}, 'askmyco', 0, 'not_yet'),
      (${USER_S}, 'askeveryone', null, null),
      (${USER_T}, 'askmyco', 90, 'excellent')`
  })

  afterAll(async () => {
    // Deleting the users cascades their submission rows away.
    await sql`delete from "user" where id in (${USER_S}, ${USER_T})`
    await sql.end({ timeout: 5 })
  })

  it("reads only this learner's best_total, leaving null out", async () => {
    expect(await capstones.getCapstoneBestTotals(USER_S)).toEqual({ familybot: 60, askmyco: 0 })
    expect(await capstones.getCapstoneBestTotals(USER_T)).toEqual({ askmyco: 90 })
    expect(await capstones.getCapstoneBestTotals("00000000-0000-0000-0000-0000000928ff")).toEqual({})
  })

  it("adds the capstone half to the learner's GWTH score", async () => {
    currentUser.id = USER_S
    const s = await progress.getDynamicScore()
    expect(s.overallScore).toBe(10) // 60/100 of 16.7, no lessons yet
    expect(s.maxPossibleScore).toBe(100)

    currentUser.id = USER_T
    expect((await progress.getDynamicScore()).overallScore).toBe(15) // 90/100 of 16.7
    currentUser.id = null
  })
})
