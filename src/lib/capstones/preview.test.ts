// @vitest-environment node
// Server modules: Node's own Uint8Array, not jsdom's (fflate checks instanceof).
import { describe, expect, it } from "vitest"
import { strToU8 } from "fflate"
import { builtInGuide } from "./guides"
import { readPrepareForm } from "./form"
import { asText, manifestHash, prepareHandIn, toManifest } from "./preview"

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
  { path: "report.pdf", bytes: strToU8("%PDF-1.4 Amelia") },
]

describe("prepared hand-in (what the preview shows is what is stored)", () => {
  const prepared = prepareHandIn(bundle, answers, names)
  const byPath = Object.fromEntries(prepared.files.map((f) => [f.path, f]))
  const text = (path: string) => new TextDecoder().decode(byPath[path]!.bytes)

  it("hides names and details with the same labels across files and answers", () => {
    expect(text("weekly_brief.md")).toBe("[Child 2]: dentist. Call [Phone 1].")
    expect(text("digest.txt")).toBe("[Child 1] swims. Dentist [Phone 1] for [Child 2].")
    expect(prepared.answers.built).toBe("A FamilyBot for [Child 1] and [Child 2] that plans our week.")
    expect(prepared.answers.checked).toContain("[Phone 1]")
  })

  it("keeps pictures and documents byte for byte and says so", () => {
    expect(byPath["shot.png"]!.kind).toBe("image")
    expect(byPath["report.pdf"]!.kind).toBe("other")
    expect(byPath["report.pdf"]!.bytes).toEqual(bundle[3]!.bytes)
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
    expect(text("weekly_brief.md") + text("digest.txt")).not.toMatch(/Amelia|Oscar|07700/)
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
