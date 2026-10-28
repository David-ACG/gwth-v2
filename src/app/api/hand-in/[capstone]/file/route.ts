/**
 * One stored file of the learner's OWN draft or hand-in, so the preview can
 * show pictures and long files exactly as they are stored (bead
 * gwth-launch-9289.3).
 *
 *   GET /api/hand-in/familybot/file?id=h_...&path=briefs/weekly_brief.md
 *
 * Served as an attachment or an image only, never as HTML, so a handed-in
 * page cannot run in the site's origin.
 */
import { NextResponse } from "next/server"
import { checkHandInAccess } from "@/lib/capstones/access"
import { readOwnFile } from "@/lib/data/capstone-hand-ins"

export const dynamic = "force-dynamic"

const IMAGE_TYPES: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  webp: "image/webp",
  gif: "image/gif",
}

export async function GET(request: Request, { params }: { params: Promise<{ capstone: string }> }) {
  const access = await checkHandInAccess((await params).capstone)
  if (!access.ok) return NextResponse.json({ error: access.message }, { status: access.status })
  const url = new URL(request.url)
  const id = url.searchParams.get("id") ?? ""
  const path = url.searchParams.get("path") ?? ""
  if (!/^h_[A-Za-z0-9_-]{22}$/.test(id) || !path) return NextResponse.json({ error: "not found" }, { status: 404 })

  const found = await readOwnFile(access.userId, access.capstoneId, id, path).catch(() => null)
  if (!found) return NextResponse.json({ error: "not found" }, { status: 404 })
  const ext = path.split(".").pop()?.toLowerCase() ?? ""
  const image = IMAGE_TYPES[ext]
  const name = (path.split("/").pop() ?? "file").replace(/[^A-Za-z0-9._-]/g, "_")
  const headers: Record<string, string> = {
    "cache-control": "private, no-store",
    "x-content-type-options": "nosniff",
    "content-security-policy": "default-src 'none'; img-src 'self'; style-src 'unsafe-inline'; sandbox",
  }
  if (image) {
    headers["content-type"] = image
  } else {
    headers["content-type"] = found.entry.kind === "text" ? "text/plain; charset=utf-8" : "application/octet-stream"
    headers["content-disposition"] = `${found.entry.kind === "text" ? "inline" : "attachment"}; filename="${name}"`
  }
  return new NextResponse(Buffer.from(found.bytes), { headers })
}
