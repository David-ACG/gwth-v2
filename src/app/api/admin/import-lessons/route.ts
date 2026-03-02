/**
 * Admin API for importing lessons from the GWTH Pipeline.
 * Accepts structured lesson JSON matching the shared schema and upserts
 * into Supabase. Authenticated via API key (service-to-service).
 *
 * POST /api/admin/import-lessons
 * Body: { lessons: PipelineLessonPayload[], apiKey: string }
 */

import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/server"
import type {
  PipelineLessonPayload,
  PipelineImportResponse,
  PipelineImportResult,
} from "@/lib/types/pipeline"

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
 * Imports a single lesson into Supabase using the upsert function.
 * Falls back to individual table operations if the RPC function isn't available.
 */
async function importLesson(
  supabase: ReturnType<typeof createAdminClient>,
  lesson: PipelineLessonPayload
): Promise<PipelineImportResult> {
  try {
    // Try the RPC function first (created in migration 003)
    const { data, error } = await supabase.rpc("upsert_lesson_from_pipeline", {
      p_lesson: lesson as unknown as Record<string, unknown>,
      p_questions: lesson.questions as unknown as Record<string, unknown>[],
      p_resources: lesson.resources as unknown as Record<string, unknown>[],
    })

    if (error) {
      // Fall back to manual upsert if RPC not available
      return await importLessonManual(supabase, lesson)
    }

    return {
      lessonId: lesson.id,
      success: true,
      questionsCount: lesson.questions.length,
      resourcesCount: lesson.resources.length,
    }
  } catch {
    return await importLessonManual(supabase, lesson)
  }
}

/**
 * Manual fallback: upserts lesson data using individual table operations.
 * Used when the RPC function isn't available (e.g. migration not yet run).
 */
async function importLessonManual(
  supabase: ReturnType<typeof createAdminClient>,
  lesson: PipelineLessonPayload
): Promise<PipelineImportResult> {
  try {
    // 1. Upsert section
    const { error: sectionError } = await supabase
      .from("sections")
      .upsert({
        id: lesson.sectionId,
        course_id: lesson.courseId || "course_gwth",
        title: lesson.sectionTitle || `Week ${lesson.month}`,
        order: lesson.sectionOrder || 0,
        month: lesson.month,
        is_optional: lesson.isOptional || false,
        optional_track: lesson.optionalTrack || null,
      }, { onConflict: "id" })

    if (sectionError) {
      return {
        lessonId: lesson.id,
        success: false,
        error: `Section upsert failed: ${sectionError.message}`,
        questionsCount: 0,
        resourcesCount: 0,
      }
    }

    // 2. Upsert lesson
    const { error: lessonError } = await supabase
      .from("lessons")
      .upsert({
        id: lesson.id,
        slug: lesson.slug,
        title: lesson.title,
        description: lesson.description || "",
        order: lesson.order,
        duration: lesson.duration,
        difficulty: lesson.difficulty,
        category: lesson.category || "",
        section_id: lesson.sectionId,
        course_id: lesson.courseId || "course_gwth",
        course_slug: lesson.courseSlug || "applied-ai-skills",
        month: lesson.month,
        is_optional: lesson.isOptional || false,
        optional_track: lesson.optionalTrack || null,
        intro_video_url: lesson.introVideoUrl,
        learn_content: lesson.learnContent,
        audio_file_url: lesson.audioFileUrl,
        audio_duration: lesson.audioDuration,
        build_video_url: lesson.buildVideoUrl,
        build_instructions: lesson.buildInstructions,
        status: lesson.status || "available",
        objectives: lesson.objectives || [],
        tags: lesson.tags || [],
        prerequisites: lesson.prerequisites || [],
        pipeline_id: lesson.pipelineId || null,
        pipeline_status: lesson.pipelineStatus || null,
        exported_at: lesson.exportedAt || null,
      }, { onConflict: "id" })

    if (lessonError) {
      return {
        lessonId: lesson.id,
        success: false,
        error: `Lesson upsert failed: ${lessonError.message}`,
        questionsCount: 0,
        resourcesCount: 0,
      }
    }

    // 3. Replace quiz questions
    await supabase
      .from("quiz_questions")
      .delete()
      .eq("lesson_id", lesson.id)

    if (lesson.questions.length > 0) {
      const { error: qError } = await supabase
        .from("quiz_questions")
        .insert(
          lesson.questions.map((q, i) => ({
            id: q.id,
            lesson_id: lesson.id,
            question: q.question,
            options: q.options,
            correct_option_index: q.correctOptionIndex,
            explanation: q.explanation,
            order: i,
          }))
        )

      if (qError) {
        return {
          lessonId: lesson.id,
          success: false,
          error: `Quiz insert failed: ${qError.message}`,
          questionsCount: 0,
          resourcesCount: lesson.resources.length,
        }
      }
    }

    // 4. Replace resources
    await supabase
      .from("lesson_resources")
      .delete()
      .eq("lesson_id", lesson.id)

    if (lesson.resources.length > 0) {
      const { error: rError } = await supabase
        .from("lesson_resources")
        .insert(
          lesson.resources.map((r, i) => ({
            lesson_id: lesson.id,
            title: r.title,
            url: r.url,
            type: r.type,
            order: i,
          }))
        )

      if (rError) {
        return {
          lessonId: lesson.id,
          success: false,
          error: `Resources insert failed: ${rError.message}`,
          questionsCount: lesson.questions.length,
          resourcesCount: 0,
        }
      }
    }

    return {
      lessonId: lesson.id,
      success: true,
      questionsCount: lesson.questions.length,
      resourcesCount: lesson.resources.length,
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
 * Imports one or more lessons from the pipeline into Supabase.
 * Requires the PIPELINE_API_KEY environment variable for authentication.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { lessons, apiKey } = body

    // Validate API key
    const expectedKey = process.env.PIPELINE_API_KEY
    if (!expectedKey) {
      return NextResponse.json(
        { error: "PIPELINE_API_KEY not configured on server" },
        { status: 500 }
      )
    }
    if (apiKey !== expectedKey) {
      return NextResponse.json(
        { error: "Invalid API key" },
        { status: 401 }
      )
    }

    // Validate payload
    if (!Array.isArray(lessons) || lessons.length === 0) {
      return NextResponse.json(
        { error: "Request body must include a non-empty 'lessons' array" },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()
    const results: PipelineImportResult[] = []
    let successful = 0
    let failed = 0

    for (const lesson of lessons as PipelineLessonPayload[]) {
      // Validate each lesson
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

      const result = await importLesson(supabase, lesson)
      results.push(result)
      if (result.success) {
        successful++
      } else {
        failed++
      }
    }

    const response: PipelineImportResponse = {
      total: lessons.length,
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
 * Returns the count of lessons currently in Supabase.
 * Useful for health checks and verifying imports.
 */
export async function GET(request: NextRequest) {
  const apiKey = request.nextUrl.searchParams.get("apiKey")
  const expectedKey = process.env.PIPELINE_API_KEY
  if (!expectedKey || apiKey !== expectedKey) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const supabase = createAdminClient()
    const { count, error } = await supabase
      .from("lessons")
      .select("*", { count: "exact", head: true })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ lessonCount: count })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    )
  }
}
