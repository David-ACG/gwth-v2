import { describe, it, expect } from "vitest"
import nextConfig from "../../next.config"
import {
  LABS_FILES_CSP,
  LABS_FILES_HEADERS,
  MODEL_ARENA_REDIRECTS,
  isLabsFilePath,
  isUnknownLabPath,
} from "./labs-files"

/**
 * Model-written files (public/labs-files) must run sandboxed with no network,
 * whether framed on a lab page or opened straight from "Try it".
 */
describe("the labs-files sandbox policy", () => {
  it("is a sandbox without allow-same-origin and with no network", () => {
    expect(LABS_FILES_CSP).toBe(
      "sandbox allow-scripts allow-forms allow-modals; default-src 'self' 'unsafe-inline' data: blob:; connect-src 'none'",
    )
    expect(LABS_FILES_CSP).not.toMatch(/allow-same-origin|allow-top-navigation|allow-popups/)
  })

  it("is what next.config sends for every file under /labs-files", async () => {
    const headers = await nextConfig.headers!()
    const entry = headers.find((h) => h.source === "/labs-files/:path*")
    expect(entry).toEqual(LABS_FILES_HEADERS)
    expect(entry!.headers).toContainEqual({ key: "Content-Security-Policy", value: LABS_FILES_CSP })
    expect(entry!.headers).toContainEqual({ key: "X-Content-Type-Options", value: "nosniff" })
  })

  it("covers the files and nothing else", () => {
    expect(isLabsFilePath("/labs-files/opus-5.5_medium/building_02_pronunciation_coach/index.html")).toBe(true)
    expect(isLabsFilePath("/labs/building")).toBe(false)
    expect(isLabsFilePath("/labs-filesx/a")).toBe(false)
  })
})

describe("redirects from the retired Model Arena labs", () => {
  it("sends each old lab, permanently, to the lab that covers its task", async () => {
    const redirects = await nextConfig.redirects!()
    const expected = {
      "/labs/job-advert-claude-vs-chatgpt": "/labs/content",
      "/labs/messy-spreadsheet-claude-vs-chatgpt": "/labs/data",
      "/labs/cite-your-sources-claude-vs-chatgpt": "/labs/research",
      "/labs/automate-a-weekly-chore-claude-vs-chatgpt": "/labs/automation",
    }
    for (const [source, destination] of Object.entries(expected)) {
      expect(redirects).toContainEqual({ source, destination, permanent: true })
    }
    expect(MODEL_ARENA_REDIRECTS).toHaveLength(4)
  })

  it("keeps the /about redirect", async () => {
    const redirects = await nextConfig.redirects!()
    expect(redirects).toContainEqual({ source: "/about", destination: "/why-gwth", permanent: true })
  })
})

describe("unknown lab slugs", () => {
  it("are every /labs/<slug> except the six labs", () => {
    for (const slug of ["research", "content", "thinking", "building", "data", "automation"]) {
      expect(isUnknownLabPath(`/labs/${slug}`)).toBe(false)
      expect(isUnknownLabPath(`/labs/${slug}/`)).toBe(false)
    }
    expect(isUnknownLabPath("/labs/build-mcp-server")).toBe(true)
    expect(isUnknownLabPath("/labs/nope")).toBe(true)
    expect(isUnknownLabPath("/labs")).toBe(false)
    expect(isUnknownLabPath("/labs/thinking/answer/opus-5.5_medium")).toBe(false)
    expect(isUnknownLabPath("/labs-files/a/b/c.md")).toBe(false)
  })
})
