import { describe, expect, it } from "vitest"
import { builtInGuide, capstoneForMonth, MAX_HAND_INS } from "./guides"
import {
  bestAttempt,
  countedPoints,
  handInBlockReason,
  matchChecklist,
  missingItems,
  nextAttemptNo,
  type AttemptLike,
} from "./rules"

let n = 0
function attempt(over: Partial<AttemptLike>): AttemptLike {
  n += 1
  return { id: `a${n}`, attemptNo: n, status: "final", total: null, band: null, confirmedAt: "2026-12-20T10:00:00Z", ...over }
}

describe("hand-in limit", () => {
  it("allows three hand-ins, numbered 1 to 3, and refuses a fourth", () => {
    expect(MAX_HAND_INS).toBe(3)
    expect(nextAttemptNo([])).toBe(1)
    const one = attempt({ attemptNo: 1, status: "final", total: 30, band: "not_yet" })
    const two = attempt({ attemptNo: 2, status: "final", total: 45, band: "pass" })
    expect(nextAttemptNo([one])).toBe(2)
    expect(handInBlockReason([one, two])).toBeNull()
    const three = attempt({ attemptNo: 3, status: "provisional", total: 70, band: "good" })
    expect(nextAttemptNo([one, two, three])).toBeNull()
    expect(handInBlockReason([one, two, three])).toMatch(/3 times/)
  })

  it("does not count a draft as a hand-in", () => {
    const draft = attempt({ attemptNo: null, status: "draft", confirmedAt: null })
    expect(nextAttemptNo([draft])).toBe(1)
    expect(handInBlockReason([draft])).toBeNull()
  })

  it("waits while the last hand-in is still being marked or checked", () => {
    expect(handInBlockReason([attempt({ attemptNo: 1, status: "marking" })])).toMatch(/still being marked/)
    expect(handInBlockReason([attempt({ attemptNo: 1, status: "with_david" })])).toMatch(/still being marked/)
  })
})

describe("best mark counts", () => {
  it("takes the highest total across hand-ins", () => {
    const a = attempt({ attemptNo: 1, total: 62, band: "good" })
    const b = attempt({ attemptNo: 2, total: 81, band: "excellent" })
    const c = attempt({ attemptNo: 3, total: 55, band: "pass" })
    expect(bestAttempt([a, b, c])?.id).toBe(b.id)
  })

  it("counts a Not yet as 0 whatever its points", () => {
    const notYet = attempt({ attemptNo: 1, total: 72, band: "not_yet" })
    const pass = attempt({ attemptNo: 2, total: 41, band: "pass" })
    expect(countedPoints(notYet)).toBe(0)
    expect(bestAttempt([notYet, pass])?.id).toBe(pass.id)
  })

  it("counts a provisional mark at once, but ignores hand-ins without a mark", () => {
    const provisional = attempt({ attemptNo: 1, status: "provisional", total: 64, band: "good" })
    const marking = attempt({ attemptNo: 2, status: "marking" })
    const withDavid = attempt({ attemptNo: 3, status: "with_david", total: 90, band: "excellent" })
    expect(bestAttempt([provisional, marking, withDavid])?.id).toBe(provisional.id)
  })

  it("on a tie prefers the final mark, then the later hand-in", () => {
    const provisional = attempt({ attemptNo: 2, status: "provisional", total: 60, band: "good" })
    const final = attempt({ attemptNo: 1, status: "final", total: 60, band: "good" })
    expect(bestAttempt([provisional, final])?.id).toBe(final.id)
    const later = attempt({ attemptNo: 3, status: "final", total: 60, band: "good" })
    expect(bestAttempt([final, later])?.id).toBe(later.id)
  })

  it("returns null when nothing has a mark", () => {
    expect(bestAttempt([attempt({ status: "marking" })])).toBeNull()
  })
})

describe("expected files checklist", () => {
  it("finds the Month 1 files by name and shows what is missing", () => {
    const guide = builtInGuide("familybot")
    const list = matchChecklist(
      [
        "m1_l21_familybot_blueprint_us_v1.md",
        "familybot/briefs/weekly_brief_2026-05-11.md",
        "m1l24_familybot_shares/m1l24_whatsapp_summary.txt",
        "m1l24_familybot_shares/m1l24_weekly_digest.txt",
        "m1l24_familybot_shares/m1l24_task_and_event_screenshot.png",
      ],
      guide.expectedFiles,
    )
    expect(list.find((c) => c.id === "weekly-brief")?.found).toEqual(["familybot/briefs/weekly_brief_2026-05-11.md"])
    expect(list.find((c) => c.id === "digest")?.found).toEqual(["m1l24_familybot_shares/m1l24_weekly_digest.txt"])
    expect(missingItems(list).map((c) => c.id)).toEqual(["transcript"])
    // The .ics file is optional, so it is never reported missing.
    expect(list.find((c) => c.id === "ics")?.found).toEqual([])
  })

  it("needs a picture for the screenshot line", () => {
    const list = matchChecklist(["screenshot_notes.txt"], builtInGuide("familybot").expectedFiles)
    expect(list.find((c) => c.id === "screenshot")?.found).toEqual([])
  })

  it("maps each month to its capstone", () => {
    expect([1, 2, 3, 4].map(capstoneForMonth)).toEqual(["familybot", "askmyco", "askeveryone", null])
  })
})
