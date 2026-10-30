import { render, screen, cleanup } from "@testing-library/react"
import { describe, it, expect, afterEach, vi } from "vitest"

// Hand-ins open: the capstone marking section appears (bead gwth-launch-9289.11).
vi.mock("@/lib/config", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/config")>()),
  ENABLE_CAPSTONE_HAND_IN: true,
}))

const { default: PrivacyPage } = await import("./page")

afterEach(cleanup)

describe("PrivacyPage with capstone hand-ins on", () => {
  it("adds section 9 and moves the later sections down, keeping 8 as Age and privacy", () => {
    render(<PrivacyPage />)
    expect(screen.getByText("8. Age and privacy")).toBeInTheDocument()
    expect(screen.getByText("9. Marking your capstone projects")).toBeInTheDocument()
    expect(screen.getByText("10. Third-party links")).toBeInTheDocument()
    expect(screen.getByText("11. Changes to this policy")).toBeInTheDocument()
    expect(screen.getByText("12. Contact us")).toBeInTheDocument()
  })

  it("names both processors and states what is sent, kept and deleted", () => {
    const { container } = render(<PrivacyPage />)
    const text = (container.textContent ?? "").replace(/\s+/g, " ")
    expect(text).toContain("one provided by OpenAI and one by Anthropic")
    expect(text).toContain("act as our data processors")
    expect(text).toContain("not to train their AI models")
    expect(text).toContain("replace private details in your files and four short answers with labels")
    expect(text).toContain("We send only these versions of your files and answers, along with our marking guide.")
    expect(text).toContain("random hand-in ID. We never send your name, email address or GWTH account details.")
    expect(text).toContain("it's never sent to an AI service")
    expect(text).toContain("for 12 months after your mark is final, then delete them. We keep your mark and feedback.")
    expect(text).toContain("Drafts you prepare but never hand in are deleted after 30 days.")
    expect(text).toContain("You can ask for earlier deletion through our contact form.")
    expect(text).toContain("AI marking: OpenAI and Anthropic mark the capstone projects you hand in.")
  })

  it("names no model and uses no dashes or section signs", () => {
    const { container } = render(<PrivacyPage />)
    const text = container.textContent ?? ""
    expect(text).not.toMatch(/Luna|Haiku|GPT|Claude|Sol\b/)
    expect(text).not.toMatch(/[–—§]/)
  })

  it("keeps a space after every bold label", () => {
    const { container } = render(<PrivacyPage />)
    for (const strong of container.querySelectorAll("li > strong")) {
      const next = strong.nextSibling?.textContent ?? ""
      expect(next.startsWith(" "), `${strong.textContent} is followed by "${next.slice(0, 12)}"`).toBe(true)
    }
  })
})
