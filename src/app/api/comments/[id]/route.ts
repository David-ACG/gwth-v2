import { NextResponse } from "next/server"
import { getCommentRole } from "@/lib/comments/role"
import { pageCommentPatchSchema } from "@/lib/comments/validation"
import { getPageComment, updatePageComment } from "@/lib/data/page-comments"

/**
 * PATCH /api/comments/[id]: body {status?, comment?}.
 *
 * The author may withdraw or edit their own comment while it is still open.
 * The admin may set any status on any comment and edit any comment text.
 * Someone else's comment reads as 404 to a beta tester, so ids are not
 * confirmed to people who cannot see them.
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { role, identity } = await getCommentRole()
  if (!identity) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  if (!role) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }
  const parsed = pageCommentPatchSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid request" },
      { status: 400 }
    )
  }

  const { id } = await params
  try {
    const existing = await getPageComment(id)
    const isAdmin = role === "admin"
    if (!existing || (!isAdmin && existing.userId !== identity.id)) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    if (!isAdmin) {
      if (parsed.data.status !== undefined && parsed.data.status !== "withdrawn") {
        return NextResponse.json(
          { error: "You can only withdraw your own comment" },
          { status: 403 }
        )
      }
      if (existing.status !== "open") {
        return NextResponse.json(
          { error: "This comment has already been picked up, so it can no longer be changed" },
          { status: 409 }
        )
      }
    }

    const comment = await updatePageComment(id, parsed.data)
    if (!comment) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }
    return NextResponse.json({ comment })
  } catch (err) {
    console.error("[comments] could not update a comment", err)
    return NextResponse.json({ error: "Unable to update comment" }, { status: 500 })
  }
}
