// @vitest-environment node
// Server modules: Node's own Uint8Array, not jsdom's (fflate checks instanceof).
import { describe, expect, it, vi } from "vitest"
import { strToU8, zipSync } from "fflate"
import { cleanPath, finishBundle, fromGitHub, fromZip, HandInInputError, parseGitHubUrl } from "./bundle"

const bytes = (s: string) => strToU8(s)

describe("paths", () => {
  it("cleans browser and zip paths and refuses escapes", () => {
    expect(cleanPath("familybot\\briefs\\brief.md")).toBe("familybot/briefs/brief.md")
    expect(cleanPath("/./a/b.md")).toBe("a/b.md")
    expect(cleanPath("../etc/passwd")).toBeNull()
  })
})

describe("zip hand-ins", () => {
  it("unpacks, drops clutter, strips one wrapping folder and sorts", () => {
    const zip = zipSync({
      "project-main/README.md": bytes("# Hi"),
      "project-main/src/app.ts": bytes("export {}"),
      "project-main/node_modules/x/index.js": bytes("junk"),
      "project-main/.DS_Store": bytes("junk"),
      "__MACOSX/project-main/._README.md": bytes("junk"),
    })
    expect(fromZip(zip).map((f) => f.path)).toEqual(["README.md", "src/app.ts"])
  })

  it("refuses an empty or broken zip with a message to act on", () => {
    expect(() => fromZip(zipSync({ "node_modules/a.js": bytes("x") }))).toThrow(HandInInputError)
    expect(() => fromZip(bytes("not a zip"))).toThrow(/could not open that zip/)
  })

  it("refuses too many files", () => {
    const many = Array.from({ length: 301 }, (_, i) => ({ path: `f${i}.txt`, bytes: bytes("x") }))
    expect(() => finishBundle(many)).toThrow(/300 or fewer/)
  })
})

describe("GitHub links", () => {
  it("accepts github.com repository links only", () => {
    expect(parseGitHubUrl("https://github.com/sam/familybot")).toEqual({ owner: "sam", repo: "familybot" })
    expect(parseGitHubUrl("https://github.com/sam/familybot.git")).toEqual({ owner: "sam", repo: "familybot" })
    expect(parseGitHubUrl("https://github.com/sam/familybot/tree/main/src")).toEqual({ owner: "sam", repo: "familybot" })
    expect(parseGitHubUrl("http://github.com/sam/familybot")).toBeNull()
    expect(parseGitHubUrl("https://evil.example/sam/familybot")).toBeNull()
    expect(parseGitHubUrl("https://github.com/sam")).toBeNull()
  })

  it("downloads the repo zip from GitHub only", async () => {
    const zip = zipSync({ "familybot-main/blueprint.md": bytes("Blueprint") })
    const fetchMock = vi.fn(async () => new Response(new Blob([new Uint8Array(zip)])))
    const files = await fromGitHub("https://github.com/sam/familybot", fetchMock as unknown as typeof fetch)
    expect(fetchMock).toHaveBeenCalledWith("https://codeload.github.com/sam/familybot/zip/HEAD", expect.anything())
    expect(files.map((f) => f.path)).toEqual(["blueprint.md"])
  })

  it("says what to do when the repo cannot be downloaded", async () => {
    const fetchMock = vi.fn(async () => new Response("no", { status: 404 }))
    await expect(fromGitHub("https://github.com/sam/private", fetchMock as unknown as typeof fetch)).rejects.toThrow(/public/)
  })
})
