/**
 * gwth-launch-4fg: typing "spread" on the real catalogue put six unrelated
 * lessons above "The Spreadsheet Trust Test", because cmdk's default scorer
 * matches a subsequence - s...p...r...e...a...d scattered across four words of
 * "Agents Superpower AI That Can Do Things for You".
 */
import { describe, it, expect } from "vitest"
import { scoreSearchEntry } from "./search-score"

const REAL_HIT = "The Spreadsheet Trust Test: Same CSV, Three Tools"
const SUBSEQUENCE_NOISE = [
  "Agents Superpower AI That Can Do Things for You",
  "Research Superpower Find Compare and Verify Anything",
  "Content Superpower Write Design and Communicate in Your Voice",
  "Thinking Superpower Plan Decide and Learn Faster",
  "Building Superpower Make Your First Useful Thing Without Coding",
  "Frontier Labs Tooling OpenAI Anthropic Google and What to Use When",
]

describe("scoreSearchEntry", () => {
  it("drops the scattered-letter matches that used to outrank the real hit", () => {
    expect(scoreSearchEntry(REAL_HIT, "spread")).toBeGreaterThan(0)
    for (const title of SUBSEQUENCE_NOISE) {
      expect(scoreSearchEntry(title, "spread"), title).toBe(0)
    }
  })

  it("shows everything when nothing has been typed", () => {
    expect(scoreSearchEntry(REAL_HIT, "")).toBe(1)
    expect(scoreSearchEntry(REAL_HIT, "   ")).toBe(1)
  })

  it("ranks a whole word above the start of a word above a buried one", () => {
    const whole = scoreSearchEntry("Trust Test", "test")
    const prefix = scoreSearchEntry("Testing Things", "test")
    const buried = scoreSearchEntry("The Latest Thing", "test")
    expect(whole).toBeGreaterThan(prefix)
    expect(prefix).toBeGreaterThan(buried)
    expect(buried).toBeGreaterThan(0)
  })

  it("requires every typed word to be present, not just one of them", () => {
    expect(scoreSearchEntry("The Spreadsheet Trust Test", "spreadsheet trust")).toBeGreaterThan(0)
    expect(scoreSearchEntry("The Spreadsheet Trust Test", "spreadsheet pelican")).toBe(0)
  })

  it("ignores punctuation and case on both sides", () => {
    expect(scoreSearchEntry("Three Chatbots, One Difficult Email", "CHATBOTS")).toBeGreaterThan(0)
    expect(scoreSearchEntry("Claude vs ChatGPT", "chatgpt")).toBeGreaterThan(0)
    expect(scoreSearchEntry("Build Your Prompt Cheat-Sheet", "cheat sheet")).toBeGreaterThan(0)
  })

  it("puts the title that opens with the query first", () => {
    const opens = scoreSearchEntry("Prompt Ladder Explained", "prompt")
    const later = scoreSearchEntry("Build Your Prompt Cheat Sheet", "prompt")
    expect(opens).toBeGreaterThan(later)
  })

  it("finds the singular when a plural was typed", () => {
    // Measured against the real catalogue on the preview: "prompts" returned
    // nothing at all while three lessons and two labs about prompts sat in
    // the index, and so did "emails", "spreadsheets" and "hallucinations".
    expect(scoreSearchEntry("The Prompt Ladder: Vague vs Five-Element", "prompts")).toBeGreaterThan(0)
    expect(scoreSearchEntry("Three Chatbots, One Difficult Email", "emails")).toBeGreaterThan(0)
    expect(scoreSearchEntry("The Spreadsheet Trust Test", "spreadsheets")).toBeGreaterThan(0)
    expect(scoreSearchEntry("Catch the Hallucination: Fact-Check Face-Off", "hallucinations")).toBeGreaterThan(0)
    expect(scoreSearchEntry("Minutes in Minutes: Meeting Transcript", "meetings")).toBeGreaterThan(0)
  })

  it("ranks the literal match above the inflected one", () => {
    const literal = scoreSearchEntry("Prompts for Everyone", "prompts")
    const inflected = scoreSearchEntry("Prompt for Everyone", "prompts")
    expect(literal).toBeGreaterThan(inflected)
    expect(inflected).toBeGreaterThan(0)
  })

  it("does not let a long word latch onto a short one it merely begins with", () => {
    // "prompts" starts with "pro", but three letters of overlap and four of
    // difference is not a match a learner would accept.
    expect(scoreSearchEntry("Pro Tips for Everyone", "prompts")).toBe(0)
    expect(scoreSearchEntry("A B C", "abcdef")).toBe(0)
    // Still nothing for a word that simply is not there in any form.
    expect(scoreSearchEntry("The Spreadsheet Trust Test", "kangaroos")).toBe(0)
  })

  it("never returns more than 1 or a negative score", () => {
    for (const q of ["", "a", "prompt ladder", "zzzz"]) {
      const s = scoreSearchEntry("The Prompt Ladder: Vague vs Five-Element", q)
      expect(s).toBeGreaterThanOrEqual(0)
      expect(s).toBeLessThanOrEqual(1)
    }
  })
})
