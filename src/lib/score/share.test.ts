import { describe, expect, it } from "vitest"
import {
  formatBadgeDate,
  isShareCode,
  linkedInAddUrl,
  scorePageUrl,
  shareView,
} from "./share"

describe("score share links (bead gwth-launch-phjb)", () => {
  it("builds LinkedIn's pre-filled Add licence or certification form", () => {
    const url = new URL(linkedInAddUrl("abcde23456", new Date("2026-12-14T10:00:00Z"), "https://gwth.ai"))
    expect(url.origin + url.pathname).toBe("https://www.linkedin.com/profile/add")
    expect(Object.fromEntries(url.searchParams)).toEqual({
      startTask: "CERTIFICATION_NAME",
      name: "GWTH.ai score",
      organizationName: "GWTH.ai",
      issueYear: "2026",
      issueMonth: "12",
      certUrl: "https://gwth.ai/verify/abcde23456",
      certId: "abcde23456",
    })
    // Spaces are %20, as in LinkedIn's own examples, never "+".
    expect(url.search).toContain("name=GWTH.ai%20score")
    expect(url.search).not.toContain("+")
  })

  it("months run 1 to 12", () => {
    const url = new URL(linkedInAddUrl("abcde23456", new Date("2027-01-03T00:00:00Z")))
    expect(url.searchParams.get("issueMonth")).toBe("1")
    expect(url.searchParams.get("issueYear")).toBe("2027")
  })

  it("accepts only the code shape it mints", () => {
    expect(isShareCode("abcde23456")).toBe(true)
    expect(isShareCode("ABCDE23456")).toBe(false)
    expect(isShareCode("abcde2345")).toBe(false)
    expect(isShareCode("abcde23450")).toBe(false) // 0 is not in the alphabet
    expect(isShareCode("../etc/pwd")).toBe(false)
  })

  it("points Show credential at the score page", () => {
    expect(scorePageUrl("abcde23456", "https://hlab.example")).toBe("https://hlab.example/verify/abcde23456")
    const view = shareView({ code: "abcde23456", isPublic: true, createdAt: new Date("2026-12-14") })
    expect(view.pageUrl).toMatch(/\/verify\/abcde23456$/)
    expect(view.linkedInUrl).toContain("certId=abcde23456")
  })

  it("writes dates the way the badge does, in UK time", () => {
    expect(formatBadgeDate(new Date("2027-03-09T12:00:00Z"))).toBe("9 March 2027")
    // 23:30 UTC on 31 March is 00:30 on 1 April in London (BST).
    expect(formatBadgeDate(new Date("2027-03-31T23:30:00Z"))).toBe("1 April 2027")
  })
})
