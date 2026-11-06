/**
 * The button in the Start Here email (bead gwth-launch-xw6s): confirms the
 * address, adds it to the waitlist, opens the lesson in this browser and
 * returns the reader to the page.
 *
 * Locations are relative so the redirect stays on whichever host the reader
 * came in on (the hlab preview sits behind a proxy on another port).
 */
import { NextResponse } from "next/server"
import { ACCESS_COOKIE, ACCESS_MAX_AGE_SECONDS, signToken, verifyToken } from "@/lib/start-here/consent"
import { confirmConsent } from "@/lib/start-here/store"

function redirect(location: string): NextResponse {
  return new NextResponse(null, { status: 303, headers: { Location: location, "Cache-Control": "no-store" } })
}

export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("t")
  const id = verifyToken("confirm", token)
  if (!id) return redirect("/start-here?link=invalid")

  let email: string | null
  try {
    email = await confirmConsent(id)
  } catch (err) {
    console.error("[start-here] confirm failed:", err)
    return redirect("/start-here?link=error")
  }
  if (!email) return redirect("/start-here?link=invalid")

  const response = redirect("/start-here?welcome=1")
  response.cookies.set(ACCESS_COOKIE, signToken("access", id), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: ACCESS_MAX_AGE_SECONDS,
  })
  return response
}
