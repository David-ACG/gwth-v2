import { NextResponse } from "next/server"
import { getCommentRole } from "@/lib/comments/role"
import { newPageCommentSchema } from "@/lib/comments/validation"
import { createPageComment, getPageCommentsForPath } from "@/lib/data/page-comments"
import { getSiteKind } from "@/lib/site"

/**
 * Comments on the real student view (contract: src/lib/comments/types.ts).
 * Only the admin and ticked beta testers may use these routes: 401 without a
 * real session, 403 for anyone else signed in.
 */

async function requireCommenter() {
  const result = await getCommentRole()
  if (!result.identity) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  if (!result.role) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }
  return { role: result.role, identity: result.identity }
}

/** POST /api/comments: save one comment. The server stamps who and where. */
export async function POST(request: Request) {
  const gate = await requireCommenter()
  if (gate instanceof NextResponse) return gate

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const parsed = newPageCommentSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid request" },
      { status: 400 }
    )
  }

  try {
    const comment = await createPageComment({
      ...parsed.data,
      userId: gate.identity.id,
      authorEmail: gate.identity.email,
      authorRole: gate.role,
      site: getSiteKind(),
      userAgent: request.headers.get("user-agent"),
    })
    return NextResponse.json({ comment }, { status: 201 })
  } catch (err) {
    console.error("[comments] could not save a comment", err)
    return NextResponse.json({ error: "Unable to save comment" }, { status: 500 })
  }
}

/**
 * GET /api/comments?path=/some/page: the caller's own comments on that page
 * (the admin sees everyone's), newest first, withdrawn ones left out.
 */
export async function GET(request: Request) {
  const gate = await requireCommenter()
  if (gate instanceof NextResponse) return gate

  const path = new URL(request.url).searchParams.get("path")
  if (!path || !path.startsWith("/")) {
    return NextResponse.json(
      { error: "path is required and must start with /" },
      { status: 400 }
    )
  }

  try {
    const comments = await getPageCommentsForPath(
      path,
      gate.role === "admin" ? {} : { userId: gate.identity.id }
    )
    return NextResponse.json({ comments })
  } catch (err) {
    console.error("[comments] could not load comments", err)
    return NextResponse.json({ error: "Unable to load comments" }, { status: 500 })
  }
}
