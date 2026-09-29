/**
 * First-party lesson events (bead gwth-launch-hqyp).
 *
 * The lessons-in-parts viewer posts small batches here: part opened,
 * Continue, Listen and pause, read-along toggled, confused taps, ratings, and
 * "left at part N" through navigator.sendBeacon when the page is hidden. Rows
 * go to lesson_events in GWTH's own database. No third party, no cookies
 * beyond the sign-in session (the privacy notice says so).
 *
 * Check answers are NOT accepted here: the server logs those when it grades
 * them (src/lib/actions/lesson-parts.ts).
 */
import { NextResponse } from "next/server"
import { recordLessonEvents } from "@/lib/data/lesson-parts"
import { checkLessonAccess } from "@/lib/lessons/lesson-access"
import { isValidSessionId, MAX_EVENTS_PER_BATCH, type LessonEventInput } from "@/lib/lessons/lesson-events"

const MAX_BODY_BYTES = 64 * 1024

export async function POST(request: Request) {
  const text = await request.text()
  if (text.length > MAX_BODY_BYTES) return NextResponse.json({ error: "too large" }, { status: 413 })
  let body: { lessonId?: unknown; sessionId?: unknown; events?: unknown }
  try {
    body = JSON.parse(text)
  } catch {
    return NextResponse.json({ error: "bad json" }, { status: 400 })
  }
  const lessonId = typeof body.lessonId === "string" ? body.lessonId : ""
  if (!/^m\d+_l\d{2}$/.test(lessonId) || !isValidSessionId(body.sessionId) || !Array.isArray(body.events)) {
    return NextResponse.json({ error: "bad request" }, { status: 400 })
  }
  const access = await checkLessonAccess(lessonId)
  if (!access.ok) return NextResponse.json({ error: access.message }, { status: access.status })
  try {
    const stored = await recordLessonEvents(
      access.userId,
      lessonId,
      body.sessionId,
      (body.events as LessonEventInput[]).slice(0, MAX_EVENTS_PER_BATCH)
    )
    return NextResponse.json({ stored })
  } catch (error) {
    console.error("[lesson-events] cannot store", error)
    return NextResponse.json({ error: "not stored" }, { status: 500 })
  }
}
