/**
 * Hand in a prepared capstone (beads gwth-launch-9289.2 and 9289.3).
 *
 *   POST /api/hand-in/familybot/confirm   (multipart form)
 *     hand_in_id   the draft the learner previewed
 *     preview_hash the hash returned with that preview
 *     confirm      "yes" only when the learner ticked the box
 *     recording    optional screen recording, up to 2 minutes; kept for
 *                  spot-checks and queries, never sent to an AI
 *
 * Without the tick, or when the stored draft is not the one previewed,
 * nothing changes.
 */
import { after, NextResponse } from "next/server"
import { checkHandInAccess } from "@/lib/capstones/access"
import { HandInInputError, LIMITS } from "@/lib/capstones/bundle"
import { markHandIn } from "@/lib/capstones/judge/runner"
import { confirmDraft, HandInsClosedError } from "@/lib/data/capstone-hand-ins"

export const dynamic = "force-dynamic"

const RECORDING_TYPES: Record<string, string> = {
  "video/mp4": "mp4",
  "video/webm": "webm",
  "video/quicktime": "mov",
  "audio/mpeg": "mp3",
  "audio/mp4": "m4a",
  "audio/webm": "webm",
}

export async function POST(request: Request, { params }: { params: Promise<{ capstone: string }> }) {
  const access = await checkHandInAccess((await params).capstone)
  if (!access.ok) return NextResponse.json({ error: access.message }, { status: access.status })

  let form: FormData
  try {
    form = await request.formData()
  } catch {
    return NextResponse.json({ error: "We could not read your upload. Please try again." }, { status: 400 })
  }
  const handInId = form.get("hand_in_id")
  const previewHash = form.get("preview_hash")
  if (typeof handInId !== "string" || !/^h_[A-Za-z0-9_-]{22}$/.test(handInId) || typeof previewHash !== "string") {
    return NextResponse.json({ error: "We could not find your preview. Choose Change something, then Check and preview to try again." }, { status: 400 })
  }

  let recording: { bytes: Uint8Array; extension: string; contentType: string } | null = null
  const file = form.get("recording")
  if (file instanceof File && file.size > 0) {
    const extension = RECORDING_TYPES[file.type]
    if (!extension) return NextResponse.json({ error: "The recording should be an MP4, WebM, MOV, MP3 or M4A file." }, { status: 400 })
    if (file.size > LIMITS.maxRecordingBytes) {
      return NextResponse.json({ error: "The recording is over 40 MB. Please make the file smaller or leave it out. Keep recordings to 2 minutes or less." }, { status: 400 })
    }
    recording = { bytes: new Uint8Array(await file.arrayBuffer()), extension, contentType: file.type }
  }

  try {
    const attempt = await confirmDraft({
      userId: access.userId,
      capstoneId: access.capstoneId,
      handInId,
      previewHash,
      confirmed: form.get("confirm") === "yes",
      recording,
    })
    // Mark straight away, after the reply is sent; the cron route catches any that wait.
    after(async () => {
      await markHandIn(attempt.handInId).catch((error) => console.error("[hand-in] marking failed", error))
    })
    return NextResponse.json({ attemptNo: attempt.attemptNo, status: attempt.status })
  } catch (error) {
    if (error instanceof HandInInputError) return NextResponse.json({ error: error.message }, { status: 400 })
    if (error instanceof HandInsClosedError) {
      return NextResponse.json({ error: "Hand-ins are not open yet. Please try again later." }, { status: 503 })
    }
    console.error("[hand-in] confirm failed", error)
    return NextResponse.json({ error: "Something went wrong handing in. Please try again." }, { status: 500 })
  }
}
