import { NextResponse } from "next/server"
import { checkPipelineKey } from "@/lib/comments/pipeline-key"
import { parseSiteKind, parseStatusList } from "@/lib/comments/validation"
import { listPageComments } from "@/lib/data/page-comments"

/**
 * GET /api/pipeline/comments?lesson=m1_l01&status=open[,asked][&site=preview]
 *
 * The triage script's read (GWTH-launch-plan/scripts/comment_triage.py).
 * Auth: x-api-key = PIPELINE_API_KEY (or ?apiKey=). Without `lesson`, every
 * comment matching the other filters; without `status`, every status.
 */
export async function GET(request: Request) {
  const params = new URL(request.url).searchParams
  const denied = checkPipelineKey(request, params.get("apiKey"))
  if (denied) return denied

  const statuses = parseStatusList(params.get("status"))
  if (statuses === null) {
    return NextResponse.json({ error: "Unknown status" }, { status: 400 })
  }
  const site = parseSiteKind(params.get("site"))
  if (site === null) {
    return NextResponse.json({ error: "Unknown site" }, { status: 400 })
  }
  const lessonId = params.get("lesson")?.trim() || undefined

  try {
    const comments = await listPageComments({ lessonId, statuses, site })
    return NextResponse.json({ comments })
  } catch (err) {
    console.error("[pipeline/comments] could not list comments", err)
    return NextResponse.json({ error: "Unable to load comments" }, { status: 500 })
  }
}
