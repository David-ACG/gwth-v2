import { describe, it, expect } from "vitest"
import { renderAnswerMarkdown } from "./model-lab-markdown"

/** Model-written markdown is not first-party: nothing executable may survive. */
describe("renderAnswerMarkdown", () => {
  it("renders ordinary markdown, tables included", () => {
    const html = renderAnswerMarkdown("# Plan\n\n**Bold** text.\n\n| A | B |\n|---|---|\n| 1 | 2 |\n")
    expect(html).toContain("<h1>Plan</h1>")
    expect(html).toContain("<strong>Bold</strong>")
    expect(html).toContain("<table>")
  })

  it("drops raw HTML, scripts included", () => {
    const html = renderAnswerMarkdown(
      'Hi <script>alert(1)</script> <img src=x onerror="alert(2)"> <iframe src="https://evil.example"></iframe>',
    )
    expect(html).not.toMatch(/<script|onerror|<iframe|<img/i)
  })

  it("keeps only http, https and mailto links, opened safely", () => {
    const html = renderAnswerMarkdown(
      "[ok](https://www.gov.uk/x) [mail](mailto:a@b.uk) [bad](javascript:alert(1)) [data](data:text/html,hi) [here](/admin)",
    )
    expect(html).toContain('href="https://www.gov.uk/x"')
    expect(html).toContain('rel="nofollow noopener noreferrer"')
    expect(html).toContain('href="mailto:a@b.uk"')
    expect(html).not.toMatch(/javascript:|data:text|href="\/admin"/)
    expect(html).toContain(">bad</a>")
  })

  it("turns images into their alt text, so nothing is fetched from elsewhere", () => {
    const html = renderAnswerMarkdown("![A chart of pay](https://tracker.example/p.png) ![](https://x.example/y.png)")
    expect(html).not.toContain("<img")
    expect(html).toContain("[A chart of pay]")
    expect(html).toContain("[picture]")
  })

  it("turns task-list boxes into glyphs and lets code blocks take focus", () => {
    const html = renderAnswerMarkdown("- [x] done\n- [ ] todo\n\n```\ncode\n```\n")
    expect(html).not.toContain("<input")
    expect(html).toContain("☑")
    expect(html).toContain('<pre tabindex="0">')
  })
})
