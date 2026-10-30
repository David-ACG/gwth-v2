/**
 * Prepare a capstone hand-in for the learner's preview (beads
 * gwth-launch-9289.2 and 9289.3).
 *
 *   POST /api/hand-in/familybot/prepare   (multipart form)
 *
 * Collects the files (uploads, a zip or a public GitHub repo), hides private
 * details, stores ONLY the redacted copies as the learner's draft under a
 * random hand-in id, and returns exactly what a marker would read. Nothing is
 * sent to any model here or before the learner confirms.
 */
import { NextResponse } from "next/server"
import { checkHandInAccess } from "@/lib/capstones/access"
import { fromGitHub, fromUploads, fromZip, HandInInputError, type BundleFile } from "@/lib/capstones/bundle"
import { readPrepareForm } from "@/lib/capstones/form"
import { loadMarkingGuide } from "@/lib/capstones/guide-loader"
import { prepareHandIn } from "@/lib/capstones/preview"
import { matchChecklist } from "@/lib/capstones/rules"
import { HandInsClosedError, saveDraft } from "@/lib/data/capstone-hand-ins"

/** Redacted text sent back inline per file; longer files open through /file. */
const INLINE_TEXT_CHARS = 200_000

export const dynamic = "force-dynamic"

export async function POST(request: Request, { params }: { params: Promise<{ capstone: string }> }) {
  const access = await checkHandInAccess((await params).capstone)
  if (!access.ok) return NextResponse.json({ error: access.message }, { status: access.status })

  let form: FormData
  try {
    form = await request.formData()
  } catch {
    return NextResponse.json({ error: "We could not read your upload. Please try again." }, { status: 400 })
  }
  const guide = await loadMarkingGuide(access.capstoneId)
  const fields = readPrepareForm(form, guide)
  if ("error" in fields) return NextResponse.json({ error: fields.error }, { status: 400 })

  try {
    let bundle: BundleFile[]
    if (fields.source === "repo") {
      bundle = await fromGitHub(fields.repoUrl!)
    } else if (fields.source === "zip") {
      const zip = form.get("zip")
      if (!(zip instanceof File) || zip.size === 0) throw new HandInInputError("Choose your zip file.")
      bundle = fromZip(new Uint8Array(await zip.arrayBuffer()))
    } else {
      const files = form.getAll("files").filter((f): f is File => f instanceof File && f.size > 0)
      if (files.length === 0) throw new HandInInputError("Choose the files or the folder to hand in.")
      bundle = await fromUploads(files)
    }

    const prepared = await prepareHandIn(bundle, fields.answers, fields.names)
    if (prepared.files.length === 0) {
      throw new HandInInputError("Hand in text copies of your files instead. We couldn\u2019t read any text in the files you added.")
    }
    // A converted PDF or Word file still counts as the document the guide asks for.
    const checklist = matchChecklist(prepared.files.map((f) => f.convertedFrom ?? f.path), guide.expectedFiles)
    const draft = await saveDraft({
      userId: access.userId,
      capstoneId: access.capstoneId,
      sourceKind: fields.source,
      repoUrl: fields.repoUrl,
      dataChoice: fields.dataChoice,
      checklist,
      prepared,
    })
    const decoder = new TextDecoder()
    return NextResponse.json({
      handInId: draft.handInId,
      hash: prepared.hash,
      dataChoice: fields.dataChoice,
      checklist,
      labels: prepared.labels,
      unusedNameLabels: prepared.unusedNameLabels,
      leftOut: prepared.leftOut,
      answers: prepared.answers,
      files: prepared.files.map((f) => ({
        path: f.path,
        kind: f.kind,
        convertedFrom: f.convertedFrom ?? null,
        size: f.size,
        replaced: f.replaced,
        text: f.kind === "text" && f.size <= INLINE_TEXT_CHARS ? decoder.decode(f.bytes) : null,
      })),
    })
  } catch (error) {
    if (error instanceof HandInInputError) return NextResponse.json({ error: error.message }, { status: 400 })
    if (error instanceof HandInsClosedError) {
      return NextResponse.json({ error: "Hand-ins are not open yet. Please try again later." }, { status: 503 })
    }
    console.error("[hand-in] prepare failed", error)
    return NextResponse.json({ error: "Something went wrong preparing your hand-in. Please try again." }, { status: 500 })
  }
}
