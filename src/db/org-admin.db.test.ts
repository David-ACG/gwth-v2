/**
 * N7 — institution admin against a live Postgres.
 *
 * Three things only a real database can prove:
 *  1. migration 019 landed the ratification audit trail and is idempotent;
 *  2. the /org read queries (design 05 Q1/Q2/Q4 + the tiered picker) return
 *     what the screens claim, scoped to ONE organisation;
 *  3. the tenancy property that matters: a second organisation's learners,
 *     progress and lessons never appear in the first organisation's numbers.
 *
 * SKIPPED unless DATABASE_URL is set (progress.db.test.ts convention). Run:
 *   DATABASE_URL=postgresql://gwth:devpass@127.0.0.1:5443/gwth_v2 \
 *     npx vitest run src/db/org-admin.db.test.ts
 */
import { afterAll, beforeAll, describe, expect, it } from "vitest"
import postgres from "postgres"
import { readFileSync } from "node:fs"
import { join } from "node:path"

const DATABASE_URL = process.env.DATABASE_URL
const describeDb = DATABASE_URL ? describe : describe.skip

// Distinct from the sibling privacy suite's "n7priv" prefix (QA round-1
// defect 14): a LIKE 'n7%' cleanup would otherwise delete that suite's users
// mid-sign-in when both run in one vitest invocation.
const P = "n7adm"
const COURSE_ID = `${P}_course`
const SECTION_ID = `${P}_section`
const ORG_A = `${P}_org_a`
const ORG_B = `${P}_org_b`
const EDITION_A = `${P}_edition_a`
const EDITION_B = `${P}_edition_b`

/** The staff context the read functions take — org A's admin. */
const CONTEXT_A = {
  userId: `${P}_admin_a`,
  userName: "Org A admin",
  role: "admin" as const,
  organisationId: ORG_A,
  organisationName: "Org A",
  organisationType: "institution",
  edition: {
    id: EDITION_A,
    name: "Org A edition",
    status: "live" as const,
    coBrandLabel: "Curated by Org A",
    passMark: 80,
  },
  courseId: COURSE_ID,
  courseTitle: "N7 course",
  isPreview: false,
}

describeDb("N7 institution admin (live DB)", () => {
  let sql: ReturnType<typeof postgres>
  let orgAdmin: typeof import("@/lib/data/org-admin")

  async function cleanup() {
    await sql`DELETE FROM lesson_progress WHERE user_id LIKE ${P + "%"}`
    await sql`DELETE FROM edition_lessons WHERE edition_id IN (${EDITION_A}, ${EDITION_B})`
    await sql`DELETE FROM syllabus_edition WHERE id IN (${EDITION_A}, ${EDITION_B})`
    await sql`DELETE FROM org_membership WHERE organisation_id IN (${ORG_A}, ${ORG_B})`
    await sql`DELETE FROM organisation WHERE id IN (${ORG_A}, ${ORG_B})`
    await sql`DELETE FROM lessons WHERE course_id = ${COURSE_ID}`
    await sql`DELETE FROM sections WHERE id = ${SECTION_ID}`
    await sql`DELETE FROM courses WHERE id = ${COURSE_ID}`
    await sql`DELETE FROM "user" WHERE id LIKE ${P + "%"}`
  }

  /** Adds a lesson to the shared N7 course. */
  async function seedLesson(
    id: string,
    order: number,
    isOptional: boolean,
    month = 1
  ) {
    await sql`
      INSERT INTO lessons (id, slug, title, "order", section_id, course_id, course_slug, month, is_optional)
      VALUES (${id}, ${id}, ${`Lesson ${id}`}, ${order}, ${SECTION_ID}, ${COURSE_ID},
              ${`${P}-course`}, ${month}, ${isOptional})
    `
  }

  /** Attaches a lesson to an edition with the given tier/state/mandatory. */
  async function attach(
    editionId: string,
    lessonId: string,
    tier: string,
    state: string,
    isMandatory: boolean,
    sortOrder: number
  ) {
    await sql`
      INSERT INTO edition_lessons (edition_id, lesson_id, tier, state, is_mandatory, sort_order)
      VALUES (${editionId}, ${lessonId}, ${tier}, ${state}, ${isMandatory}, ${sortOrder})
    `
  }

  /** Creates a user and their membership row. */
  async function seedMember(id: string, orgId: string, role: string) {
    await sql`
      INSERT INTO "user" (id, name, email, email_verified)
      VALUES (${id}, ${`User ${id}`}, ${`${id}@example.test`}, TRUE)
    `
    await sql`
      INSERT INTO org_membership (id, organisation_id, user_id, role)
      VALUES (${`mem_${id}`}, ${orgId}, ${id}, ${role})
    `
  }

  beforeAll(async () => {
    sql = postgres(DATABASE_URL!)

    // Migration 019 runs FIRST, before cleanup touches edition_lessons, so a
    // database that has never seen 019 is covered too (N5 QA style note 5 /
    // N7 QA style note 6: a suite that only ever re-runs a migration never
    // tests its initial application).
    const migration = readFileSync(
      join(process.cwd(), "supabase/migrations/019_edition_ratification.sql"),
      "utf8"
    )
    await sql.unsafe(migration)
    await cleanup()

    await sql`
      INSERT INTO courses (id, slug, title, description)
      VALUES (${COURSE_ID}, ${`${P}-course`}, 'N7 course', 'fixture')
    `
    await sql`
      INSERT INTO sections (id, title, "order", course_id, month)
      VALUES (${SECTION_ID}, 'N7 section', 1, ${COURSE_ID}, 1)
    `
    for (const [orgId, name] of [
      [ORG_A, "Org A"],
      [ORG_B, "Org B"],
    ] as const) {
      await sql`
        INSERT INTO organisation (id, name, slug, type)
        VALUES (${orgId}, ${name}, ${`${orgId}-slug`}, 'institution')
      `
    }
    for (const [editionId, orgId] of [
      [EDITION_A, ORG_A],
      [EDITION_B, ORG_B],
    ] as const) {
      await sql`
        INSERT INTO syllabus_edition
          (id, organisation_id, course_id, name, slug, is_org_default, pass_mark, status, co_brand_label)
        VALUES (${editionId}, ${orgId}, ${COURSE_ID}, ${`${editionId} edition`},
                ${`${editionId}-slug`}, TRUE, 80, 'live', ${`Curated by ${orgId}`})
      `
    }

    // Course lessons: 2 core, 1 optional (switched OFF in edition A), 1
    // exclusive draft awaiting ratification.
    await seedLesson(`${P}_l1`, 1, false)
    await seedLesson(`${P}_l2`, 2, false)
    await seedLesson(`${P}_l3`, 3, true)
    await seedLesson(`${P}_l4`, 4, true, 2)
    // A CORE lesson published after edition A was provisioned: it is missing
    // from A, which is the repair case (round-3 defect 7).
    await seedLesson(`${P}_l5`, 5, false, 2)

    await attach(EDITION_A, `${P}_l1`, "core", "ratified", true, 1001)
    await attach(EDITION_A, `${P}_l2`, "core", "ratified", true, 1002)
    // l3 deliberately NOT attached to A — the "switched off" case.
    await attach(EDITION_A, `${P}_l4`, "exclusive", "draft", true, 2004)
    // Org B curates a different edition of the SAME course.
    await attach(EDITION_B, `${P}_l1`, "core", "ratified", true, 1001)
    await attach(EDITION_B, `${P}_l3`, "optional", "ratified", true, 1003)

    // Org A: one learner who has met the baseline, one who has not, plus a
    // tutor (staff must never be counted as a learner).
    await seedMember(`${P}_learner_done`, ORG_A, "learner")
    await seedMember(`${P}_learner_part`, ORG_A, "learner")
    await seedMember(`${P}_tutor_a`, ORG_A, "tutor")
    // Org B: a learner whose progress must never appear in org A's numbers.
    await seedMember(`${P}_learner_b`, ORG_B, "learner")

    for (const lessonId of [`${P}_l1`, `${P}_l2`]) {
      await sql`
        INSERT INTO lesson_progress
          (user_id, lesson_id, is_completed, quiz_passed, best_quiz_score, last_accessed_at)
        VALUES (${`${P}_learner_done`}, ${lessonId}, TRUE, TRUE, 90, NOW())
      `
    }
    await sql`
      INSERT INTO lesson_progress
        (user_id, lesson_id, is_completed, quiz_passed, best_quiz_score, last_accessed_at)
      VALUES (${`${P}_learner_part`}, ${`${P}_l1`}, TRUE, TRUE, 70, NOW() - INTERVAL '30 days')
    `
    await sql`
      INSERT INTO lesson_progress
        (user_id, lesson_id, is_completed, quiz_passed, best_quiz_score, last_accessed_at)
      VALUES (${`${P}_learner_b`}, ${`${P}_l1`}, TRUE, TRUE, 100, NOW())
    `

    orgAdmin = await import("@/lib/data/org-admin")
  })

  afterAll(async () => {
    await cleanup()
    await sql.end()
  })

  describe("migration 019", () => {
    it("added the ratification audit trail with a NOT NULL updated_at", async () => {
      const cols = await sql<{ column_name: string; is_nullable: string }[]>`
        SELECT column_name, is_nullable FROM information_schema.columns
        WHERE table_name = 'edition_lessons'
          AND column_name IN ('updated_at', 'decided_at', 'decided_by', 'review_note')
      `
      expect(cols.map((c) => c.column_name).sort()).toEqual([
        "decided_at",
        "decided_by",
        "review_note",
        "updated_at",
      ])
      expect(
        cols.find((c) => c.column_name === "updated_at")?.is_nullable
      ).toBe("NO")
    })

    it("kept the two-state CHECK (D-N7-2: send-back is draft + a note)", async () => {
      await expect(
        sql`
          UPDATE edition_lessons SET state = 'changes_requested'
          WHERE edition_id = ${EDITION_A} AND lesson_id = ${`${P}_l4`}
        `
      ).rejects.toMatchObject({ code: "23514" })
    })

    it("re-runs as a no-op (idempotent)", async () => {
      const migration = readFileSync(
        join(process.cwd(), "supabase/migrations/019_edition_ratification.sql"),
        "utf8"
      )
      await expect(sql.unsafe(migration)).resolves.toBeDefined()
    })

    it("nulls decided_by rather than losing the row when the decider leaves", async () => {
      await sql`
        UPDATE edition_lessons SET decided_by = ${`${P}_tutor_a`}
        WHERE edition_id = ${EDITION_A} AND lesson_id = ${`${P}_l4`}
      `
      await sql`DELETE FROM org_membership WHERE user_id = ${`${P}_tutor_a`}`
      await sql`DELETE FROM "user" WHERE id = ${`${P}_tutor_a`}`
      const rows = await sql<{ decided_by: string | null }[]>`
        SELECT decided_by FROM edition_lessons
        WHERE edition_id = ${EDITION_A} AND lesson_id = ${`${P}_l4`}
      `
      expect(rows).toHaveLength(1)
      expect(rows[0]!.decided_by).toBeNull()
      // Put the tutor back for the remaining assertions.
      await seedMember(`${P}_tutor_a`, ORG_A, "tutor")
    })
  })

  describe("the tiered picker", () => {
    it("shows every course lesson, marking the ones outside the edition", async () => {
      const syllabus = await orgAdmin.getEditionSyllabus(CONTEXT_A)
      const byId = new Map(syllabus.map((entry) => [entry.lessonId, entry]))
      expect(syllabus).toHaveLength(5)
      expect(byId.get(`${P}_l1`)).toMatchObject({
        included: true,
        tier: "core",
        locked: true,
      })
      // Switched off: present in the picker, absent from the edition, and
      // offered at the tier the catalogue implies.
      expect(byId.get(`${P}_l3`)).toMatchObject({
        included: false,
        tier: "optional",
        locked: false,
      })
      expect(byId.get(`${P}_l4`)).toMatchObject({
        included: true,
        tier: "exclusive",
        state: "draft",
      })
    })

    it("orders by the edition's sort_order", async () => {
      const orders = (await orgAdmin.getEditionSyllabus(CONTEXT_A)).map(
        (entry) => entry.sortOrder
      )
      expect([...orders].sort((a, b) => a - b)).toEqual(orders)
    })

    it("does not leak the other organisation's edition rows", async () => {
      // l3 is ratified+optional in edition B; in A's picker it must read as
      // switched off, not as B's row.
      const syllabus = await orgAdmin.getEditionSyllabus(CONTEXT_A)
      expect(
        syllabus.find((entry) => entry.lessonId === `${P}_l3`)?.included
      ).toBe(false)
    })

    it("hides another institution's EXCLUSIVE lesson entirely (round-3 defect 6)", async () => {
      // Org B commissions an exclusive lesson. Org A must not see its title
      // or synopsis at all, let alone be able to switch it on: it would have
      // rendered as an ordinary off optional and published to A's learners.
      await sql`
        INSERT INTO edition_lessons (edition_id, lesson_id, tier, state, is_mandatory, sort_order)
        VALUES (${EDITION_B}, ${`${P}_l5`}, 'exclusive', 'draft', TRUE, 3005)
      `
      const syllabus = await orgAdmin.getEditionSyllabus(CONTEXT_A)
      expect(syllabus.map((entry) => entry.lessonId)).not.toContain(`${P}_l5`)
      // Org B's own picker still shows it.
      const bSyllabus = await orgAdmin.getEditionSyllabus({
        ...CONTEXT_A,
        organisationId: ORG_B,
        edition: { ...CONTEXT_A.edition, id: EDITION_B },
      })
      expect(bSyllabus.map((entry) => entry.lessonId)).toContain(`${P}_l5`)
      await sql`DELETE FROM edition_lessons WHERE edition_id = ${EDITION_B} AND lesson_id = ${`${P}_l5`}`
    })

    it("still shows a lesson THIS edition carries, whatever another edition says (round-4 defect 7)", async () => {
      // The first version of the exclusivity filter hid a lesson whenever ANY
      // other edition marked it exclusive, so an org's own draft could vanish
      // from its own picker and become unratifiable.
      await sql`
        INSERT INTO edition_lessons (edition_id, lesson_id, tier, state, is_mandatory, sort_order)
        VALUES (${EDITION_B}, ${`${P}_l4`}, 'exclusive', 'ratified', TRUE, 3004)
      `
      const syllabus = await orgAdmin.getEditionSyllabus(CONTEXT_A)
      // l4 is edition A's OWN exclusive draft; B claiming it must not hide it.
      expect(syllabus.map((entry) => entry.lessonId)).toContain(`${P}_l4`)
      const queue = await orgAdmin.getRatificationQueue(CONTEXT_A)
      expect(queue.map((entry) => entry.lessonId)).toContain(`${P}_l4`)
      await sql`DELETE FROM edition_lessons WHERE edition_id = ${EDITION_B} AND lesson_id = ${`${P}_l4`}`
    })

    it("leaves a MISSING core lesson unlocked so it can be added (round-3 defect 7)", async () => {
      const syllabus = await orgAdmin.getEditionSyllabus(CONTEXT_A)
      const missingCore = syllabus.find((entry) => entry.lessonId === `${P}_l5`)!
      expect(missingCore).toMatchObject({
        tier: "core",
        included: false,
        locked: false,
      })
      // A core lesson the edition DOES carry stays locked.
      expect(
        syllabus.find((entry) => entry.lessonId === `${P}_l1`)
      ).toMatchObject({ tier: "core", included: true, locked: true })
    })
  })

  describe("the ratification queue (Q4)", () => {
    it("lists only this edition's draft lessons", async () => {
      const queue = await orgAdmin.getRatificationQueue(CONTEXT_A)
      expect(queue.map((entry) => entry.lessonId)).toEqual([`${P}_l4`])
    })
  })

  describe("the roster (Q1)", () => {
    it("counts learners only — staff are not on the roster", async () => {
      const roster = await orgAdmin.getOrgRoster(CONTEXT_A)
      expect(roster.map((row) => row.userId).sort()).toEqual([
        `${P}_learner_done`,
        `${P}_learner_part`,
      ])
    })

    it("measures the baseline against the edition's mandatory RATIFIED lessons", async () => {
      const roster = await orgAdmin.getOrgRoster(CONTEXT_A)
      const done = roster.find((row) => row.userId === `${P}_learner_done`)!
      const part = roster.find((row) => row.userId === `${P}_learner_part`)!
      // l4 is mandatory but DRAFT, so it is not part of the baseline yet.
      expect(done.mandatoryTotal).toBe(2)
      expect(done.mandatoryDone).toBe(2)
      expect(done.baselineMet).toBe(true)
      expect(done.avgBestQuiz).toBe(90)
      expect(part.mandatoryDone).toBe(1)
      expect(part.baselineMet).toBe(false)
    })

    it("sorts baseline-met learners first", async () => {
      const roster = await orgAdmin.getOrgRoster(CONTEXT_A)
      expect(roster[0]!.userId).toBe(`${P}_learner_done`)
    })

    it("summarises honestly, including the 7-day activity window", async () => {
      const roster = await orgAdmin.getOrgRoster(CONTEXT_A)
      const summary = orgAdmin.summariseRoster(roster, 1)
      expect(summary).toMatchObject({
        learners: 2,
        started: 2,
        baselineMet: 1,
        active7d: 1,
        pendingRatification: 1,
      })
    })
  })

  describe("the ratification queue's ball-ownership", () => {
    it("returns a REVISED draft to 'waiting on you' (round-4 defect 12)", async () => {
      // review_note records why it was LAST sent back and is never cleared by
      // GWTH editing the lesson, so note-presence alone stranded a revised
      // draft in "with GWTH" forever.
      // The institution sends it back NOW, i.e. after the lesson's current
      // updated_at. (lessons carries a BEFORE UPDATE trigger that stamps
      // updated_at = NOW(), which is exactly what makes this signal reliable:
      // any real edit to the lesson bumps it.)
      await sql`
        UPDATE edition_lessons
        SET review_note = 'needs a UK example', decided_at = NOW()
        WHERE edition_id = ${EDITION_A} AND lesson_id = ${`${P}_l4`}
      `
      let split = orgAdmin.splitRatificationQueue(
        await orgAdmin.getRatificationQueue(CONTEXT_A)
      )
      expect(split.withGwth.map((e) => e.lessonId)).toContain(`${P}_l4`)

      // GWTH then edits the lesson: the trigger bumps updated_at past
      // decided_at, and the ball comes back to the institution.
      await sql`UPDATE lessons SET title = 'Lesson n7adm_l4 (revised)' WHERE id = ${`${P}_l4`}`
      split = orgAdmin.splitRatificationQueue(
        await orgAdmin.getRatificationQueue(CONTEXT_A)
      )
      expect(split.awaitingYou.map((e) => e.lessonId)).toContain(`${P}_l4`)

      await sql`
        UPDATE edition_lessons SET review_note = NULL, decided_at = NULL
        WHERE edition_id = ${EDITION_A} AND lesson_id = ${`${P}_l4`}
      `
    })
  })

  describe("QA round-1 regressions", () => {
    it("reports last activity from ALL lessons, not just mandatory ones", async () => {
      // The partial learner's only MANDATORY progress is 30 days old; give
      // them fresh activity on the lesson that is outside the edition.
      await sql`
        INSERT INTO lesson_progress (user_id, lesson_id, last_accessed_at)
        VALUES (${`${P}_learner_part`}, ${`${P}_l3`}, NOW())
      `
      const roster = await orgAdmin.getOrgRoster(CONTEXT_A)
      const part = roster.find((row) => row.userId === `${P}_learner_part`)!
      expect(
        Date.now() - new Date(part.lastActive!).getTime()
      ).toBeLessThan(86_400_000)
      await sql`
        DELETE FROM lesson_progress
        WHERE user_id = ${`${P}_learner_part`} AND lesson_id = ${`${P}_l3`}
      `
    })

    it("counts a recorded quiz score even when the lesson is not completed", async () => {
      await sql`
        INSERT INTO lesson_progress
          (user_id, lesson_id, is_completed, quiz_passed, best_quiz_score)
        VALUES (${`${P}_learner_part`}, ${`${P}_l2`}, FALSE, TRUE, 100)
      `
      const roster = await orgAdmin.getOrgRoster(CONTEXT_A)
      const part = roster.find((row) => row.userId === `${P}_learner_part`)!
      // 70 (completed) and 100 (not completed) both count toward the average…
      expect(part.avgBestQuiz).toBe(85)
      // …but the baseline still needs the lesson COMPLETED (design 05 Q1).
      expect(part.baselineMet).toBe(false)
      await sql`
        DELETE FROM lesson_progress
        WHERE user_id = ${`${P}_learner_part`} AND lesson_id = ${`${P}_l2`}
      `
    })

    it("serves staff whose organisation has no edition yet", async () => {
      // resolveOrgStaffContext returns edition: null rather than null, so the
      // admin reaches /org and is told why it is empty.
      const noEdition = { ...CONTEXT_A, edition: null }
      await expect(orgAdmin.getEditionSyllabus(noEdition)).resolves.toEqual([])
      await expect(orgAdmin.getOrgRoster(noEdition)).resolves.toEqual([])
      await expect(
        orgAdmin.getOrgLessonCompletion(noEdition)
      ).resolves.toEqual([])
    })
  })

  describe("per-lesson completion (Q2)", () => {
    it("covers the edition's ratified lessons only", async () => {
      const rows = await orgAdmin.getOrgLessonCompletion(CONTEXT_A)
      expect(rows.map((row) => row.lessonId)).toEqual([`${P}_l1`, `${P}_l2`])
    })

    it("counts this organisation's learners only", async () => {
      const rows = await orgAdmin.getOrgLessonCompletion(CONTEXT_A)
      const l1 = rows.find((row) => row.lessonId === `${P}_l1`)!
      // Org B's learner also completed l1 with 100; org A must not see them.
      expect(l1.started).toBe(2)
      expect(l1.completed).toBe(2)
      expect(l1.avgBestQuiz).toBe(80)
    })
  })
})
