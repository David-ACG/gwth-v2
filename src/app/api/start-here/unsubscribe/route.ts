/**
 * Opt out of GWTH course news (bead gwth-launch-xw6s).
 *
 * Two callers: the button on /start-here/unsubscribe (a form post, answered
 * with a redirect back to that page), and an inbox's one-click unsubscribe
 * (RFC 8058: a POST whose body is `List-Unsubscribe=One-Click`, answered 200).
 * The token is in the query string either way. Opting out keeps the lesson
 * open; it only stops the news.
 */
import { NextResponse } from "next/server"
import { verifyToken } from "@/lib/start-here/consent"
import { withdrawConsent } from "@/lib/start-here/store"

export async function POST(request: Request) {
  const url = new URL(request.url)
  let token = url.searchParams.get("t")
  let oneClick = false
  const type = request.headers.get("content-type") ?? ""
  if (type.includes("application/x-www-form-urlencoded") || type.includes("multipart/form-data")) {
    const form = await request.formData()
    oneClick = form.get("List-Unsubscribe") === "One-Click"
    token = token ?? (form.get("t") as string | null)
  }

  const id = verifyToken("unsubscribe", token)
  let done = false
  if (id) {
    try {
      done = (await withdrawConsent(id)) !== null
    } catch (err) {
      console.error("[start-here] opt-out failed:", err)
    }
  }

  if (oneClick) return new NextResponse(null, { status: done ? 200 : 400 })
  const back = done ? "/start-here/unsubscribe?done=1" : "/start-here/unsubscribe?failed=1"
  return new NextResponse(null, { status: 303, headers: { Location: back, "Cache-Control": "no-store" } })
}
