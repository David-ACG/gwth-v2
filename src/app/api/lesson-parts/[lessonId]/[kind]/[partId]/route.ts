/**
 * A lesson part's word timings (read-along) or captions (WebVTT), served
 * from the site's own origin (bead gwth-launch-hqyp).
 *
 * Both are READ as data by the browser (fetch for timings, <track> for
 * captions), and the media CDN sends no CORS header, so they live in
 * lesson_parts.content and are served from here. Access follows the lesson.
 *
 *   /api/lesson-parts/m1_l10/words/p1     -> [[start, word], ...]
 *   /api/lesson-parts/m1_l10/captions/p1  -> text/vtt
 *   /api/lesson-parts/m1_l10/captions/intro
 */
import { NextResponse } from "next/server"
import { getLessonPartsContent } from "@/lib/data/lesson-parts"
import { checkLessonAccess } from "@/lib/lessons/lesson-access"

const CACHE = "private, max-age=600"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ lessonId: string; kind: string; partId: string }> }
) {
  const { lessonId, kind, partId } = await params
  if (!/^m\d+_l\d{2}$/.test(lessonId) || (kind !== "words" && kind !== "captions")) {
    return NextResponse.json({ error: "not found" }, { status: 404 })
  }
  const access = await checkLessonAccess(lessonId)
  if (!access.ok) return NextResponse.json({ error: access.message }, { status: access.status })
  const content = await getLessonPartsContent(lessonId)
  if (!content) return NextResponse.json({ error: "not found" }, { status: 404 })

  if (kind === "captions") {
    const vtt = partId === "intro" ? content.intro?.captions : content.parts.find((p) => p.id === partId)?.watch.captions
    if (!vtt) return NextResponse.json({ error: "not found" }, { status: 404 })
    return new NextResponse(vtt, { headers: { "content-type": "text/vtt; charset=utf-8", "cache-control": CACHE } })
  }
  const part = content.parts.find((p) => p.id === partId)
  if (!part) return NextResponse.json({ error: "not found" }, { status: 404 })
  return NextResponse.json(part.read.words, { headers: { "cache-control": CACHE } })
}
