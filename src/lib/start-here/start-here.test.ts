import { describe, expect, it } from "vitest"
import { CONSENT_BUTTON, CONSENT_LINE, signToken, verifyToken } from "./consent"
import { START_HERE_LESSON_MD, START_HERE_PROJECT_MD, START_HERE_SOURCE } from "./content.generated"
import { startHereEmail } from "./emails"
import { START_HERE_IMAGES } from "./media"
import { renderStartHere, splitBoxes } from "./render"

const env = { BETTER_AUTH_SECRET: "test-secret-for-start-here", BETTER_AUTH_URL: "https://hlab.example.net:9458" }
const ID = "3f2b9c1e-7d4a-4c2b-9e1f-0a1b2c3d4e5f"

describe("Start Here consent wording (David, 2026-10-09, option A)", () => {
  it("is his wording: the button says the deal and the line is his sentence", () => {
    expect(CONSENT_BUTTON).toBe("Send me the lesson and GWTH course news")
    expect(CONSENT_LINE).toBe(
      "By adding your email address, you agree to receive news about the GWTH course when it's available. You can opt out in any email."
    )
  })
})

describe("Start Here tokens", () => {
  it("round-trips for the purpose it was made for", () => {
    const t = signToken("confirm", ID, env)
    expect(verifyToken("confirm", t, env)).toBe(ID)
  })

  it("never verifies for another purpose", () => {
    const t = signToken("confirm", ID, env)
    expect(verifyToken("access", t, env)).toBeNull()
    expect(verifyToken("unsubscribe", t, env)).toBeNull()
  })

  it("rejects a tampered id, a tampered signature and another secret", () => {
    const t = signToken("access", ID, env)
    const [v, , iat, sig] = t.split(".")
    expect(verifyToken("access", `${v}.4f2b9c1e-7d4a-4c2b-9e1f-0a1b2c3d4e5f.${iat}.${sig}`, env)).toBeNull()
    expect(verifyToken("access", `${t.slice(0, -2)}xx`, env)).toBeNull()
    expect(verifyToken("access", t, { BETTER_AUTH_SECRET: "another-secret" })).toBeNull()
    expect(verifyToken("access", "", env)).toBeNull()
    expect(verifyToken("access", "nonsense", env)).toBeNull()
  })

  it("expires the access cookie after a year", () => {
    const then = new Date("2026-01-01T00:00:00Z")
    const t = signToken("access", ID, env, then)
    expect(verifyToken("access", t, env, new Date("2026-12-01T00:00:00Z"))).toBe(ID)
    expect(verifyToken("access", t, env, new Date("2027-01-02T00:00:00Z"))).toBeNull()
  })

  it("fails closed with no secret", () => {
    expect(() => signToken("access", ID, {})).toThrow()
    expect(verifyToken("access", signToken("access", ID, env), {})).toBeNull()
  })
})

describe("Start Here content snapshot", () => {
  it("is the approved lesson.md and the current project, never a candidate lesson", () => {
    expect(START_HERE_SOURCE.lessonFile).toBe("content/lesson.md")
    expect(START_HERE_LESSON_MD).toMatch(/^## Who this lesson is for/)
    expect(START_HERE_PROJECT_MD).toMatch(/^# Student Project: /)
  })

  it("has a picture for headings the lesson really has", () => {
    const headings = START_HERE_LESSON_MD.split("\n").filter((l) => l.startsWith("## "))
    for (const heading of Object.keys(START_HERE_IMAGES)) {
      expect(headings).toContain(`## ${heading}`)
    }
  })

  it("has no em dash, en dash or section sign (paper-first-banned-patterns)", () => {
    expect(START_HERE_LESSON_MD + START_HERE_PROJECT_MD).not.toMatch(/[–—§]/)
  })
})

describe("renderStartHere", () => {
  it("turns :::tip and :::note into labelled boxes", () => {
    expect(splitBoxes("a\n\n:::tip\nhello\n:::\n\nb").map((s) => s.kind)).toEqual(["md", "box", "md"])
    const { html } = renderStartHere("Intro\n\n:::note\nA **note**.\n:::\n")
    expect(html).toContain('class="sh-box"')
    expect(html).toContain('data-kind="note"')
    expect(html).toContain('<p class="sh-box-label">Note</p>')
    expect(html).toContain("<strong>note</strong>")
  })

  it("puts each picture straight after its heading, in both themes", () => {
    const { html } = renderStartHere(START_HERE_LESSON_MD, { images: START_HERE_IMAGES })
    const at = html.indexOf('id="tip-1-speak-to-ai-and-listen-when-it-helps"')
    const fig = html.indexOf('<figure class="sh-figure">', at)
    expect(at).toBeGreaterThan(-1)
    expect(html.slice(at, fig)).not.toContain("<p>")
    expect(html).toContain("start-here-02-light.webp")
    expect(html).toContain("start-here-02-dark.webp")
    expect((html.match(/<figure class="sh-figure">/g) ?? []).length).toBe(7)
  })

  it("wraps tables so they scroll on their own, and drops raw HTML", () => {
    const { html } = renderStartHere("| a | b |\n|---|---|\n| 1 | 2 |\n\n<script>alert(1)</script>")
    expect(html).toContain('<div class="sh-table" tabindex="0" role="region" aria-label="Table"><table>')
    expect(html).not.toContain("<script>")
  })

  it("lists the lesson's sections and demotes the project's headings", () => {
    const lesson = renderStartHere(START_HERE_LESSON_MD)
    expect(lesson.headings.map((h) => h.text)).toContain("Tip 7: Look at the labs before you choose")
    const project = renderStartHere(START_HERE_PROJECT_MD, { demote: 1 })
    expect(project.html).toMatch(/^<h2 id="student-project-/)
    expect(project.html).not.toContain("<h1")
  })

  it("opens outside links in a new tab", () => {
    const { html } = renderStartHere("[Handy](https://handy.computer)")
    expect(html).toContain('target="_blank"')
    expect(html).toContain('rel="noopener noreferrer"')
  })
})

describe("startHereEmail", () => {
  it("opens the lesson from its button and repeats the deal with an opt-out", () => {
    const { html, text } = startHereEmail("CONFIRM", "UNSUB", env)
    expect(html).toContain("https://hlab.example.net:9458/api/start-here/confirm?t=CONFIRM")
    expect(html).toContain("https://hlab.example.net:9458/start-here/unsubscribe?t=UNSUB")
    expect(text).toMatch(/agreed to receive news about the GWTH course/)
    expect(text).toMatch(/opt out in any email, including this one/i)
    expect(text).toContain("Open the lesson: https://hlab.example.net:9458/api/start-here/confirm?t=CONFIRM")
  })
})
