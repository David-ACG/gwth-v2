import { render } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { MarkdownRenderer } from "./markdown-renderer"

describe("MarkdownRenderer blockquotes (gwth-launch-5vh)", () => {
  it("renders `>` blockquotes as <blockquote>, not raw markdown", () => {
    const { container } = render(
      <MarkdownRenderer content={"> **AI suggests. Humans decide.**"} />
    )
    const quote = container.querySelector("blockquote")
    expect(quote).not.toBeNull()
    expect(quote?.textContent).toContain("AI suggests. Humans decide.")
    // The literal "> " marker must not survive into the rendered text.
    expect(container.textContent).not.toContain("> ")
    // Bold inside the quote renders as <strong>.
    expect(container.querySelector("blockquote strong")).not.toBeNull()
  })

  it("keeps blockquotes working when the body carries HTML comments", () => {
    // The original defect: any `<` in the source (every lesson has
    // `<!-- VERIFY -->` authoring comments) made the pre-parse sanitiser
    // escape `>` to `&gt;`, killing blockquotes. rehype-raw drops the
    // comment at the hast layer, so it must never reach the DOM.
    const { container } = render(
      <MarkdownRenderer
        content={"<!-- VERIFY: source -->\n\n> If you would not email it to a stranger, do not paste it."}
      />
    )
    expect(container.querySelector("blockquote")).not.toBeNull()
    expect(container.textContent).not.toContain("&gt;")
    expect(container.textContent).not.toContain("VERIFY")
    expect(container.innerHTML).not.toContain("<!--")
  })
})
