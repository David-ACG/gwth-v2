/**
 * Admin API for importing lessons from the GWTH Pipeline.
 * Accepts structured lesson JSON matching the shared schema and upserts
 * into self-hosted PostgreSQL via Drizzle ORM (D1 — ratified 2026-06-15).
 * Authenticated via API key (service-to-service).
 *
 * Supabase has been CANCELLED as a data backend; this endpoint writes
 * exclusively through `getDb()` (postgres.js + drizzle-orm). Never
 * re-introduce a Supabase client here.
 *
 * POST /api/admin/import-lessons
 * Body: { lessons: PipelineLessonPayload[], apiKey: string }
 */

import { NextRequest, NextResponse } from "next/server"
import { getDb } from "@/db"
import {
  courses,
  sections,
  lessons,
  quizQuestions,
  lessonResources,
  syllabusEdition,
  editionLessons,
} from "@/db/schema"
import { eq } from "drizzle-orm"
import type {
  PipelineLessonPayload,
  PipelineImportResponse,
  PipelineImportResult,
} from "@/lib/types/pipeline"

/** The set of resource types accepted by the `lesson_resources_type_check`. */
const VALID_RESOURCE_TYPES = new Set(["link", "download", "video", "article"])

/**
 * Validates a single lesson payload has the minimum required fields.
 * Returns an error message if invalid, null if valid.
 */
function validateLesson(lesson: PipelineLessonPayload): string | null {
  if (!lesson.id) return "Missing required field: id"
  if (!lesson.slug) return "Missing required field: slug"
  if (!lesson.title) return "Missing required field: title"
  if (!lesson.learnContent) return "Missing required field: learnContent"
  if (!lesson.sectionId) return "Missing required field: sectionId"
  if (!lesson.month || ![1, 2, 3].includes(lesson.month)) {
    return "Invalid month: must be 1, 2, or 3"
  }
  if (!["beginner", "intermediate", "advanced"].includes(lesson.difficulty)) {
    return "Invalid difficulty: must be beginner, intermediate, or advanced"
  }
  return null
}

/**
 * Imports a single lesson into Postgres via Drizzle. The whole lesson
 * (course → section → lesson → quiz → resources) is written inside one
 * transaction so a partial failure rolls back cleanly and never leaves the
 * content tables half-populated. Mirrors the previous Supabase behaviour:
 * the parent course and section are upserted first to satisfy the FKs, the
 * lesson is upserted on its primary key, and quiz/resources are fully
 * replaced (delete-then-insert) so re-imports stay idempotent.
 */
async function importLesson(
  db: ReturnType<typeof getDb>,
  lesson: PipelineLessonPayload
): Promise<PipelineImportResult> {
  try {
    await db.transaction(async (tx) => {
      // 1. Ensure the parent course exists (FK target for sections/lessons).
      // We never clobber an existing course row — only fill it in if missing.
      await tx
        .insert(courses)
        .values({
          id: lesson.courseId || "course_gwth",
          slug: lesson.courseSlug || "applied-ai-skills",
          title: "Applied AI Skills",
        })
        .onConflictDoNothing()

      // 2. Upsert the section (FK target for the lesson).
      await tx
        .insert(sections)
        .values({
          id: lesson.sectionId,
          courseId: lesson.courseId || "course_gwth",
          title: lesson.sectionTitle || `Week ${lesson.month}`,
          order: lesson.sectionOrder ?? 0,
          month: lesson.month,
          isOptional: lesson.isOptional ?? false,
          optionalTrack: lesson.optionalTrack ?? null,
        })
        .onConflictDoUpdate({
          target: sections.id,
          set: {
            courseId: lesson.courseId || "course_gwth",
            title: lesson.sectionTitle || `Week ${lesson.month}`,
            order: lesson.sectionOrder ?? 0,
            month: lesson.month,
            isOptional: lesson.isOptional ?? false,
            optionalTrack: lesson.optionalTrack ?? null,
            updatedAt: new Date().toISOString(),
          },
        })

      // 3. Upsert the lesson on its primary key.
      const lessonValues = {
        id: lesson.id,
        slug: lesson.slug,
        title: lesson.title,
        description: lesson.description || "",
        order: lesson.order ?? 0,
        duration: lesson.duration ?? 45,
        difficulty: lesson.difficulty,
        category: lesson.category || "",
        sectionId: lesson.sectionId,
        courseId: lesson.courseId || "course_gwth",
        courseSlug: lesson.courseSlug || "applied-ai-skills",
        month: lesson.month,
        isOptional: lesson.isOptional ?? false,
        optionalTrack: lesson.optionalTrack ?? null,
        introVideoUrl: lesson.introVideoUrl ?? null,
        learnContent: lesson.learnContent,
        audioFileUrl: lesson.audioFileUrl ?? null,
        audioDuration: lesson.audioDuration ?? null,
        buildVideoUrl: lesson.buildVideoUrl ?? null,
        buildInstructions: lesson.buildInstructions ?? null,
        status: lesson.status || "available",
        objectives: lesson.objectives ?? [],
        tags: lesson.tags ?? [],
        prerequisites: lesson.prerequisites ?? [],
        pipelineId: lesson.pipelineId ?? null,
        pipelineStatus: lesson.pipelineStatus ?? null,
        exportedAt: lesson.exportedAt ?? null,
        updatedAt: new Date().toISOString(),
      }

      await tx
        .insert(lessons)
        .values(lessonValues)
        .onConflictDoUpdate({ target: lessons.id, set: lessonValues })

      // 3b. Keep the GWTH default edition in sync (N5, design 05 §2.2.4): the
      // pipeline stays the single writer of the default syllabus, and
      // lessons.is_optional keeps meaning "optional in the GWTH default
      // edition". Runs in a nested transaction (savepoint) so a database
      // where migration 014 has not run yet still imports cleanly (only the
      // undefined-table error is swallowed; anything else propagates).
      try {
        await tx.transaction(async (etx) => {
          const lessonCourseId = lesson.courseId || "course_gwth"

          // Fresh-DB bootstrap: 014's backfill inserts nothing when the
          // applied-ai-skills course does not exist yet at migration time, so
          // the FIRST import of that course creates the gwth-default edition
          // (idempotent; mirrors the 014 backfill row exactly).
          if ((lesson.courseSlug || "applied-ai-skills") === "applied-ai-skills") {
            await etx
              .insert(syllabusEdition)
              .values({
                id: "gwth-default",
                organisationId: null,
                courseId: lessonCourseId,
                name: "GWTH standard syllabus",
                slug: "gwth-default",
                isDefault: true,
                status: "live",
              })
              .onConflictDoNothing()
          }

          // Course scoping: only lessons of the edition's OWN course belong
          // in gwth-default — a second course's lessons must never leak into
          // the applied-ai-skills default syllabus.
          const defaultEdition = await etx
            .select({
              id: syllabusEdition.id,
              courseId: syllabusEdition.courseId,
            })
            .from(syllabusEdition)
            .where(eq(syllabusEdition.id, "gwth-default"))
            .limit(1)
          if (
            defaultEdition.length > 0 &&
            defaultEdition[0]!.courseId === lessonCourseId
          ) {
            const editionRow = {
              editionId: "gwth-default",
              lessonId: lesson.id,
              tier: lesson.isOptional ? "optional" : "core",
              state: "ratified",
              isMandatory: !(lesson.isOptional ?? false),
              sortOrder: lesson.month * 1000 + (lesson.order ?? 0),
            }
            await etx
              .insert(editionLessons)
              .values(editionRow)
              .onConflictDoUpdate({
                target: [editionLessons.editionId, editionLessons.lessonId],
                set: {
                  tier: editionRow.tier,
                  // state included so the single writer can restore a
                  // drifted row to ratified (gwth-default is always ratified)
                  state: editionRow.state,
                  isMandatory: editionRow.isMandatory,
                  sortOrder: editionRow.sortOrder,
                },
              })
          }
        })
      } catch (editionError) {
        // 42P01 undefined_table = migration 014 not applied yet: the lesson
        // import itself must still succeed. Everything else is a real error.
        if (
          (editionError as { code?: string } | null)?.code !== "42P01"
        ) {
          throw editionError
        }
      }

      // 4. Replace quiz questions (delete-then-insert keeps re-imports clean).
      await tx.delete(quizQuestions).where(eq(quizQuestions.lessonId, lesson.id))
      if (lesson.questions.length > 0) {
        await tx.insert(quizQuestions).values(
          lesson.questions.map((q, i) => ({
            id: q.id || `${lesson.id}_q${i + 1}`,
            lessonId: lesson.id,
            question: q.question,
            options: q.options,
            correctOptionIndex: q.correctOptionIndex,
            explanation: q.explanation || "",
            order: i,
          }))
        )
      }

      // 5. Replace resources (skip any with an unsupported type to respect the
      // `lesson_resources_type_check` constraint).
      await tx
        .delete(lessonResources)
        .where(eq(lessonResources.lessonId, lesson.id))
      const validResources = lesson.resources.filter((r) =>
        VALID_RESOURCE_TYPES.has(r.type)
      )
      if (validResources.length > 0) {
        await tx.insert(lessonResources).values(
          validResources.map((r, i) => ({
            lessonId: lesson.id,
            title: r.title,
            url: r.url,
            type: r.type,
            order: i,
          }))
        )
      }
    })

    return {
      lessonId: lesson.id,
      success: true,
      questionsCount: lesson.questions.length,
      resourcesCount: lesson.resources.filter((r) =>
        VALID_RESOURCE_TYPES.has(r.type)
      ).length,
    }
  } catch (err) {
    return {
      lessonId: lesson.id,
      success: false,
      error: err instanceof Error ? err.message : "Unknown error",
      questionsCount: 0,
      resourcesCount: 0,
    }
  }
}

/**
 * POST /api/admin/import-lessons
 *
 * Imports one or more lessons from the pipeline into Postgres (Drizzle).
 * Requires the PIPELINE_API_KEY environment variable for authentication and
 * DATABASE_URL to be configured.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { lessons: lessonPayloads, apiKey } = body

    // Validate API key (service-to-service auth — unchanged contract).
    const expectedKey = process.env.PIPELINE_API_KEY
    if (!expectedKey) {
      return NextResponse.json(
        { error: "PIPELINE_API_KEY not configured on server" },
        { status: 500 }
      )
    }
    if (apiKey !== expectedKey) {
      return NextResponse.json({ error: "Invalid API key" }, { status: 401 })
    }

    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        { error: "DATABASE_URL not configured on server" },
        { status: 500 }
      )
    }

    // Validate payload
    if (!Array.isArray(lessonPayloads) || lessonPayloads.length === 0) {
      return NextResponse.json(
        { error: "Request body must include a non-empty 'lessons' array" },
        { status: 400 }
      )
    }

    const db = getDb()
    const results: PipelineImportResult[] = []
    let successful = 0
    let failed = 0

    for (const lesson of lessonPayloads as PipelineLessonPayload[]) {
      const validationError = validateLesson(lesson)
      if (validationError) {
        results.push({
          lessonId: lesson.id || "unknown",
          success: false,
          error: validationError,
          questionsCount: 0,
          resourcesCount: 0,
        })
        failed++
        continue
      }

      const result = await importLesson(db, lesson)
      results.push(result)
      if (result.success) {
        successful++
      } else {
        failed++
      }
    }

    const response: PipelineImportResponse = {
      total: lessonPayloads.length,
      successful,
      failed,
      results,
    }

    return NextResponse.json(response, {
      status: failed > 0 && successful === 0 ? 422 : 200,
    })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    )
  }
}

/**
 * GET /api/admin/import-lessons
 *
 * Returns the count of lessons currently in Postgres.
 * Useful for health checks and verifying imports.
 */
export async function GET(request: NextRequest) {
  const apiKey = request.nextUrl.searchParams.get("apiKey")
  const expectedKey = process.env.PIPELINE_API_KEY
  if (!expectedKey || apiKey !== expectedKey) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (!process.env.DATABASE_URL) {
    return NextResponse.json(
      { error: "DATABASE_URL not configured on server" },
      { status: 500 }
    )
  }

  try {
    const db = getDb()
    const rows = await db.select({ id: lessons.id }).from(lessons)
    return NextResponse.json({ lessonCount: rows.length })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    )
  }
}
