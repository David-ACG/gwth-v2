/**
 * POST /api/lesson-draft/verdict (bead gwth-launch-8ksq).
 *
 * David approves or sends back a pipeline draft of a lesson from the comment
 * pane while reading it in the real student viewer on the preview. This route
 * is a thin, admin-only proxy to the pipeline v3 service, which owns the
 * verdict: `${PIPELINE_V3_URL}/api/lesson/<folder>/verdict` with
 * `{stage: "lesson", verdict, note}`. v3's status and body come back as-is.
 *
 * Only live where LESSON_DRAFTS_DIR is set (the hlab preview); everywhere else
 * it answers 404 {error: "drafts-disabled"}.
 */

import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { requireAdminForApi } from "@/lib/admin"
import {
  getLessonDraftsDir,
  LESSON_ID_PATTERN,
  resolveLessonFolder,
} from "@/lib/lessons/draft"
import { COMMENT_MAX_LENGTH } from "@/lib/comments/types"

const DEFAULT_PIPELINE_V3_URL = "http://127.0.0.1:8110"
const PIPELINE_TIMEOUT_MS = 15_000

const verdictSchema = z.object({
  lessonId: z.string().regex(LESSON_ID_PATTERN, "Invalid lesson id"),
  verdict: z.enum(["approved", "sent_back"]),
  note: z.string().max(COMMENT_MAX_LENGTH).optional(),
})

export async function POST(request: NextRequest) {
  const gate = await requireAdminForApi()
  if (gate instanceof NextResponse) return gate

  if (!getLessonDraftsDir()) {
    return NextResponse.json({ error: "drafts-disabled" }, { status: 404 })
  }

  const parsed = verdictSchema.safeParse(
    await request.json().catch(() => null)
  )
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid request" },
      { status: 400 }
    )
  }
  const { lessonId, verdict, note } = parsed.data

  const folder = await resolveLessonFolder(lessonId)
  if (!folder) {
    return NextResponse.json({ error: "lesson-not-found" }, { status: 404 })
  }

  const base = (process.env.PIPELINE_V3_URL?.trim() || DEFAULT_PIPELINE_V3_URL)
    .replace(/\/+$/, "")
  const url = `${base}/api/lesson/${encodeURIComponent(folder)}/verdict`

  let upstream: Response
  try {
    upstream = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stage: "lesson", verdict, note: note ?? "" }),
      signal: AbortSignal.timeout(PIPELINE_TIMEOUT_MS),
      cache: "no-store",
    })
  } catch (error) {
    console.error("[lesson-draft/verdict] pipeline unreachable", error)
    return NextResponse.json({ error: "pipeline-unreachable" }, { status: 502 })
  }

  const text = await upstream.text().catch(() => "")
  return new NextResponse(text, {
    status: upstream.status,
    headers: {
      "Content-Type":
        upstream.headers.get("content-type") ?? "application/json",
    },
  })
}
