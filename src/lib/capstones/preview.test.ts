// @vitest-environment node
// Server modules: Node's own Uint8Array, not jsdom's (fflate checks instanceof).
import { beforeAll, describe, expect, it } from "vitest"
import { strToU8 } from "fflate"
import { builtInGuide } from "./guides"
import { readPrepareForm } from "./form"
import { asText, manifestHash, prepareHandIn, toManifest, type PreparedHandIn } from "./preview"
import { makeDocx, makePdf } from "./test-fixtures/documents"

const answers = {
  built: "A FamilyBot for Amelia and Oscar that plans our week.",
  checked: "I compared the brief with the transcript; call 07700 900123 was in both.",
  fixed: "Friday became a real date after I fixed the prompt.",
  next: "I would add the school calendar for Oscar.",
}
const names = [
  { kindLabel: "Child", names: ["Amelia"] },
  { kindLabel: "Child", names: ["Oscar"] },
]
const bundle = [
  { path: "weekly_brief.md", bytes: strToU8("Oscar: dentist. Call 07700 900123.") },
  { path: "digest.txt", bytes: strToU8("Amelia swims. Dentist 07700900123 for Oscar.") },
  { path: "shot.png", bytes: new Uint8Array([137, 80, 78, 71, 0, 1, 2]) },
  { path: "report.pdf", bytes: makePdf(["Report for Amelia and Oscar", "Phone 07700 900123 about the plan for Oscar"]) },
  { path: "blueprint.docx", bytes: makeDocx(["Blueprint for Amelia", "Email sam@example.com"]) },
  { path: "scan.pdf", bytes: makePdf([""]) },
  { path: "slides.pptx", bytes: strToU8("PK not converted") },
]

describe("prepared hand-in (what the preview shows is what is stored)", () => {
  let prepared: PreparedHandIn
  let byPath: Record<string, PreparedHandIn["files"][number]>
  const text = (path: string) => new TextDecoder().decode(byPath[path]!.bytes)
  beforeAll(async () => {
    prepared = await prepareHandIn(bundle, answers, names)
    byPath = Object.fromEntries(prepared.files.map((f) => [f.path, f]))
  })

  it("hides names and details with the same labels across files and answers", () => {
    expect(text("weekly_brief.md")).toBe("[Child 2]: dentist. Call [Phone 1].")
    expect(text("digest.txt")).toBe("[Child 1] swims. Dentist [Phone 1] for [Child 2].")
    expect(prepared.answers.built).toBe("A FamilyBot for [Child 1] and [Child 2] that plans our week.")
    expect(prepared.answers.checked).toContain("[Phone 1]")
  })

  it("keeps pictures and other files byte for byte and says so", () => {
    expect(byPath["shot.png"]!.kind).toBe("image")
    expect(byPath["slides.pptx"]!.kind).toBe("other")
    expect(byPath["slides.pptx"]!.bytes).toEqual(bundle[6]!.bytes)
  })

  it("sends a PDF or Word file as its redacted text, never the document itself", () => {
    // David, 2026-10-30, option A.
    expect(byPath["report.pdf"]).toBeUndefined()
    expect(byPath["blueprint.docx"]).toBeUndefined()
    expect(byPath["report.pdf.txt"]).toMatchObject({ kind: "text", convertedFrom: "report.pdf" })
    expect(text("report.pdf.txt")).toContain("Report for [Child 1] and [Child 2]")
    expect(text("report.pdf.txt")).toContain("Phone [Phone 1] about the plan for [Child 2]")
    expect(text("blueprint.docx.txt")).toBe("Blueprint for [Child 1]\nEmail [Email 1]")
    for (const f of prepared.files) expect(new TextDecoder().decode(f.bytes)).not.toMatch(/%PDF|word\/document/)
  })

  it("leaves out a document with no readable text, such as a scan", () => {
    expect(prepared.leftOut).toEqual([{ path: "scan.pdf", reason: "unreadable" }])
    expect(prepared.files.map((f) => f.path)).not.toContain("scan.pdf")
  })

  it("fingerprints exactly the stored bytes and answers", () => {
    const manifest = toManifest(prepared.files)
    expect(manifestHash(manifest, prepared.answers)).toBe(prepared.hash)
    expect(manifestHash(manifest, { ...prepared.answers, next: "changed" })).not.toBe(prepared.hash)
    const tampered = manifest.map((f) => (f.path === "digest.txt" ? { ...f, sha256: "0".repeat(64) } : f))
    expect(manifestHash(tampered, prepared.answers)).not.toBe(prepared.hash)
  })

  it("does not keep the original names anywhere in what is stored", () => {
    const stored = JSON.stringify({ manifest: toManifest(prepared.files), answers: prepared.answers, labels: prepared.labels })
    expect(stored).not.toMatch(/Amelia|Oscar|07700/)
    for (const f of prepared.files.filter((f) => f.kind === "text")) {
      expect(new TextDecoder().decode(f.bytes)).not.toMatch(/Amelia|Oscar|07700|sam@/)
    }
  })

  it("only reads real text as text", () => {
    expect(asText("a.md", strToU8("hello"))).toBe("hello")
    expect(asText("a.bin", new Uint8Array([0, 1, 2]))).toBeNull()
    expect(asText("a.docx", strToU8("PK looks like text"))).toBeNull()
  })
})

describe("the hand-in form", () => {
  const guide = builtInGuide("familybot")
  const form = (over: Record<string, string> = {}) => {
    const fd = new FormData()
    const fields = {
      source: "files",
      data_choice: "own",
      names: "Child: Amelia Jones, Millie\nSchool: Hillside Primary",
      answer_built: answers.built,
      answer_checked: answers.checked,
      answer_fixed: answers.fixed,
      answer_next: answers.next,
      ...over,
    }
    for (const [k, v] of Object.entries(fields)) fd.append(k, v)
    return fd
  }

  it("reads the names only for the learner's own details", () => {
    const own = readPrepareForm(form(), guide)
    expect("error" in own ? own.error : own.names).toEqual([
      { kindLabel: "Child", names: ["Amelia Jones", "Millie"] },
      { kindLabel: "School", names: ["Hillside Primary"] },
    ])
    const example = readPrepareForm(form({ data_choice: "example" }), guide)
    expect("error" in example ? example.error : example.names).toEqual([])
  })

  it("asks for each answer and a repo link when one is chosen", () => {
    expect(readPrepareForm(form({ answer_fixed: "ok" }), guide)).toEqual({
      error: 'Please answer "What went wrong, and how did you fix it?" using at least 20 characters.',
    })
    expect(readPrepareForm(form({ source: "repo" }), guide)).toEqual({ error: "Paste the link to your public project on GitHub." })
    expect(readPrepareForm(form({ source: "ftp" }), guide)).toHaveProperty("error")
  })
})
