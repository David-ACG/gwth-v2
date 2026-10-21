import { NextResponse } from "next/server"
import { getRowAnswerMarkdown } from "@/lib/data/model-lab"
import { renderAnswerMarkdown } from "@/lib/model-lab-markdown"
import { canViewPrivateContent } from "@/lib/content-access"

/** Per-request, like the lab pages: the content gate reads the session. */
export const dynamic = "force-dynamic"

type Context = { params: Promise<{ slug: string; setup: string }> }

/**
 * One table row's markdown answer to a lab's main task, rendered on the
 * server with the same pipeline as lesson text (`lib/model-lab-markdown.ts`).
 *
 * The lab page opens a row ("Answer") by fetching this, so the 30-odd written
 * answers a lab carries are not all sent with the page. Only set-ups that are
 * in that lab's table answer; anything else is a 404. While private content
 * mode is on, the same gate as the page applies (404 rather than a redirect,
 * since the caller is a fetch).
 *
 * Returns `{ parts: [{ name, html }] }`, one per markdown file.
 */
export async function GET(_request: Request, { params }: Context) {
  if (!(await canViewPrivateContent())) {
    return NextResponse.json({ error: "not found" }, { status: 404 })
  }
  const { slug, setup } = await params
  const files = getRowAnswerMarkdown(slug, setup)
  if (!files) {
    return NextResponse.json({ error: "not found" }, { status: 404 })
  }
  return NextResponse.json({
    parts: files.map((f) => ({ name: f.name, html: renderAnswerMarkdown(f.text) })),
  })
}
