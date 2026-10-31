/**
 * GET /api/admin/capstones/<hand_in_id>/file?path=...: one stored file of a
 * confirmed hand-in, for David's check (bead gwth-launch-9289.7). Serves the
 * redacted copy the judges read, never as HTML. Admin only.
 */
import { NextResponse } from "next/server"
import { requireAdminForApi } from "@/lib/admin"
import { fileKey, handInStore } from "@/lib/capstones/storage"

export const dynamic = "force-dynamic"

const IMAGE_TYPES: Record<string, string> = { png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg", webp: "image/webp", gif: "image/gif" }

export async function GET(request: Request, { params }: { params: Promise<{ handInId: string }> }) {
  const gate = await requireAdminForApi()
  if (gate instanceof NextResponse) return gate
  const { handInId } = await params
  const path = new URL(request.url).searchParams.get("path") ?? ""
  if (!/^h_[A-Za-z0-9_-]{22}$/.test(handInId) || !path || path.split("/").includes("..")) {
    return NextResponse.json({ error: "not found" }, { status: 404 })
  }
  const bytes = await handInStore()?.get(fileKey(handInId, path)).catch(() => null)
  if (!bytes) return NextResponse.json({ error: "not found" }, { status: 404 })
  const image = IMAGE_TYPES[path.split(".").pop()?.toLowerCase() ?? ""]
  const headers: Record<string, string> = {
    "cache-control": "private, no-store",
    "x-content-type-options": "nosniff",
    "content-security-policy": "default-src 'none'; img-src 'self'; sandbox",
    "content-type": image ?? "text/plain; charset=utf-8",
  }
  return new NextResponse(Buffer.from(bytes), { headers })
}
