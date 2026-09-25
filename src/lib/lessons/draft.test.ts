// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import path from "node:path"
import {
  getLessonDraft,
  resolveLessonFolder,
  rewriteDraftAssetUrls,
  stripFrontmatter,
} from "./draft"

const FOLDER = "m1_l01_welcome_to_gwth"

let root: string

function writeLesson(folder: string, files: Record<string, string>) {
  const dir = path.join(root, folder, "content")
  mkdirSync(dir, { recursive: true })
  for (const [name, text] of Object.entries(files)) {
    writeFileSync(path.join(dir, name), text)
  }
}

beforeEach(() => {
  root = mkdtempSync(path.join(tmpdir(), "lesson-drafts-"))
  vi.stubEnv("LESSON_DRAFTS_DIR", root)
  vi.stubEnv("LESSON_DRAFT_MEDIA_BASE", "https://media.test")
  vi.spyOn(console, "error").mockImplementation(() => {})
})

afterEach(() => {
  vi.unstubAllEnvs()
  vi.restoreAllMocks()
  rmSync(root, { recursive: true, force: true })
})

describe("resolveLessonFolder", () => {
  it("finds the folder whose name starts with the lesson id", async () => {
    mkdirSync(path.join(root, "m1_l10_other"), { recursive: true })
    mkdirSync(path.join(root, FOLDER), { recursive: true })
    expect(await resolveLessonFolder("m1_l01")).toBe(FOLDER)
    expect(await resolveLessonFolder("m1_l10")).toBe("m1_l10_other")
  })

  it("returns null for no match, a malformed id, or drafts switched off", async () => {
    mkdirSync(path.join(root, FOLDER), { recursive: true })
    expect(await resolveLessonFolder("m1_l02")).toBeNull()
    expect(await resolveLessonFolder("../etc")).toBeNull()
    vi.stubEnv("LESSON_DRAFTS_DIR", "")
    expect(await resolveLessonFolder("m1_l01")).toBeNull()
  })
})

describe("getLessonDraft", () => {
  it("is null when LESSON_DRAFTS_DIR is unset", async () => {
    vi.stubEnv("LESSON_DRAFTS_DIR", "")
    expect(await getLessonDraft("m1_l01")).toBeNull()
  })

  it("is unavailable when there is no folder", async () => {
    expect(await getLessonDraft("m1_l01")).toEqual({ available: false })
  })

  it("is unavailable when the candidate is missing", async () => {
    writeLesson(FOLDER, { "lesson.md": "# Live" })
    expect(await getLessonDraft("m1_l01")).toEqual({ available: false })
  })

  it("is unavailable when the candidate matches the live lesson", async () => {
    writeLesson(FOLDER, { "lesson.md": "# Same\n", "lesson.candidate.md": "# Same\n" })
    expect(await getLessonDraft("m1_l01")).toEqual({ available: false })
  })

  it("returns the candidate with frontmatter stripped and images rewritten", async () => {
    writeLesson(FOLDER, {
      "lesson.md": "# Live\n",
      "lesson.candidate.md": [
        "---",
        "title: Draft",
        "---",
        "",
        "## Intro",
        "![A map](assets/generated/map.png)",
        "![Two](./assets/review/two.png)",
        '<img src="assets/x.png" alt="x">',
        "![Remote](https://example.com/assets/keep.png)",
      ].join("\n"),
    })
    const draft = await getLessonDraft("m1_l01")
    expect(draft?.available).toBe(true)
    if (!draft?.available) return
    expect(draft.folder).toBe(FOLDER)
    const base = `https://media.test/media/${FOLDER}/content/assets/`
    expect(draft.learnContent.startsWith("## Intro")).toBe(true)
    expect(draft.learnContent).not.toContain("title: Draft")
    expect(draft.learnContent).toContain(`![A map](${base}generated/map.png)`)
    expect(draft.learnContent).toContain(`![Two](${base}review/two.png)`)
    expect(draft.learnContent).toContain(`<img src="${base}x.png" alt="x">`)
    expect(draft.learnContent).toContain("https://example.com/assets/keep.png")
  })

  it("treats a candidate with no live lesson as a draft", async () => {
    writeLesson(FOLDER, { "lesson.candidate.md": "## New\n" })
    expect(await getLessonDraft("m1_l01")).toMatchObject({ available: true })
  })

  it("never throws: an unreadable candidate reports no draft", async () => {
    // A directory where the file should be makes readFile fail with EISDIR.
    writeLesson(FOLDER, { "lesson.md": "# Live" })
    mkdirSync(path.join(root, FOLDER, "content", "lesson.candidate.md"))
    expect(await getLessonDraft("m1_l01")).toEqual({ available: false })
  })

  it("defaults the media base to the hlab preview", async () => {
    vi.stubEnv("LESSON_DRAFT_MEDIA_BASE", "")
    writeLesson(FOLDER, { "lesson.md": "a", "lesson.candidate.md": "![p](assets/p.png)" })
    const draft = await getLessonDraft("m1_l01")
    expect(draft).toMatchObject({
      available: true,
      learnContent: `![p](https://hlab.taila51191.ts.net:9490/media/${FOLDER}/content/assets/p.png)`,
    })
  })
})

describe("helpers", () => {
  it("stripFrontmatter leaves plain markdown alone", () => {
    expect(stripFrontmatter("## A\n---\nb")).toBe("## A\n---\nb")
  })

  it("rewriteDraftAssetUrls trims a trailing slash on the base", () => {
    expect(rewriteDraftAssetUrls("![a](assets/a.png)", "f", "https://m/")).toBe(
      "![a](https://m/media/f/content/assets/a.png)"
    )
  })
})
