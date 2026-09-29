/** A part's Markdown as HTML, split after the first block (bead gwth-launch-hqyp). */
import { describe, expect, it } from "vitest"
import { renderPartHtml } from "./parts-html"

describe("renderPartHtml", () => {
  it("puts the first block in lead and the remainder in rest", () => {
    const out = renderPartHtml("First **bold** paragraph.\n\nSecond paragraph.\n\n- one\n- two")
    expect(out.lead).toBe("<p>First <strong>bold</strong> paragraph.</p>")
    expect(out.rest).toContain("<p>Second paragraph.</p>")
    expect(out.rest).toContain("<li>one</li>")
    expect(out.rest).not.toContain("First")
  })

  it("a single block leaves rest empty of content", () => {
    const out = renderPartHtml("Only paragraph.")
    expect(out.lead).toBe("<p>Only paragraph.</p>")
    expect(out.rest.trim()).toBe("")
  })

  it("renders a GFM table", () => {
    const out = renderPartHtml("Intro.\n\n| A | B |\n| - | - |\n| 1 | 2 |\n")
    expect(out.rest).toContain("<table>")
    expect(out.rest).toContain("<th>A</th>")
    expect(out.rest).toContain("<td>2</td>")
  })

  it("drops raw HTML from the source", () => {
    const out = renderPartHtml(
      'Hello.\n\n<script>alert("x")</script>\n\nText with <img src=x onerror="alert(1)"> inline.\n\n<div class="evil">block</div>'
    )
    const html = out.lead + out.rest
    expect(html).not.toContain("<script")
    expect(html).not.toContain("alert")
    expect(html).not.toContain("onerror")
    expect(html).not.toContain("evil")
    expect(html).toContain("Text with")
  })

  it("does not throw on empty-ish markdown", () => {
    for (const md of ["", "   ", "\n\n\n"]) {
      expect(() => renderPartHtml(md)).not.toThrow()
      const out = renderPartHtml(md)
      expect(out.lead).toBe("")
      expect(out.rest.trim()).toBe("")
    }
  })

  it("turns task-list checkboxes into glyphs and makes code blocks keyboard-scrollable", () => {
    const { lead, rest } = renderPartHtml("Intro.\n\n- [ ] one\n- [x] two\n\n```\nlong code\n```")
    const html = lead + rest
    expect(html).not.toContain("<input")
    expect(html).toContain("☐")
    expect(html).toContain("☑")
    expect(html).toMatch(/<pre tabindex="0">/)
  })
})
