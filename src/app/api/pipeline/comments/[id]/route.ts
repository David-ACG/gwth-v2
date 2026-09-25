import { NextResponse } from "next/server"
import { checkPipelineKey } from "@/lib/comments/pipeline-key"
import { pipelineCommentPatchSchema } from "@/lib/comments/validation"
import { updatePageComment } from "@/lib/data/page-comments"

/**
 * PATCH /api/pipeline/comments/[id]: body {status, triage?}.
 *
 * The triage script records its verdict here. Auth: x-api-key =
 * PIPELINE_API_KEY (or `apiKey` in the body). updated_at is stamped by the
 * data layer. Omitting `triage` leaves the stored triage as it was.
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    body = undefined
  }
  const bodyKey =
    body && typeof body === "object" && typeof (body as { apiKey?: unknown }).apiKey === "string"
      ? (body as { apiKey: string }).apiKey
      : null
  const denied = checkPipelineKey(request, bodyKey)
  if (denied) return denied

  if (body === undefined) {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }
  const parsed = pipelineCommentPatchSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid request" },
      { status: 400 }
    )
  }

  const { id } = await params
  try {
    const comment = await updatePageComment(id, {
      status: parsed.data.status,
      ...(parsed.data.triage !== undefined ? { triage: parsed.data.triage } : {}),
    })
    if (!comment) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }
    return NextResponse.json({ comment })
  } catch (err) {
    console.error("[pipeline/comments] could not update a comment", err)
    return NextResponse.json({ error: "Unable to update comment" }, { status: 500 })
  }
}
