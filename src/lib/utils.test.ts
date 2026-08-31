import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import {
  clamp,
  cn,
  formatDate,
  formatDuration,
  formatProgress,
  formatRelativeDate,
  getGradeColor,
  getGradeFromScore,
  getStatusColor,
  slugify,
} from "./utils"

describe("cn", () => {
  it("joins class names", () => {
    expect(cn("a", "b")).toBe("a b")
  })

  it("resolves conflicting tailwind classes (last wins)", () => {
    expect(cn("p-2", "p-4")).toBe("p-4")
  })

  it("drops falsy/conditional values", () => {
    expect(cn("a", false, undefined, null, "b")).toBe("a b")
  })
})

describe("formatDuration", () => {
  it("formats sub-hour durations as minutes", () => {
    expect(formatDuration(45)).toBe("45m")
  })

  it("formats whole hours without trailing minutes", () => {
    expect(formatDuration(120)).toBe("2h")
  })

  it("formats hours and minutes", () => {
    expect(formatDuration(90)).toBe("1h 30m")
  })
})

describe("formatDate", () => {
  it("formats a date as 'Mon D, YYYY'", () => {
    // Construct from local components to avoid timezone day-shift.
    expect(formatDate(new Date(2026, 1, 15))).toBe("Feb 15, 2026")
  })
})

describe("formatRelativeDate", () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 1, 15, 12, 0, 0))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it("returns 'just now' for very recent times", () => {
    expect(formatRelativeDate(new Date(2026, 1, 15, 11, 59, 30))).toBe("just now")
  })

  it("returns minutes ago", () => {
    expect(formatRelativeDate(new Date(2026, 1, 15, 11, 30, 0))).toBe("30m ago")
  })

  it("returns hours ago", () => {
    expect(formatRelativeDate(new Date(2026, 1, 15, 9, 0, 0))).toBe("3h ago")
  })

  it("returns days ago within a week", () => {
    expect(formatRelativeDate(new Date(2026, 1, 13, 12, 0, 0))).toBe("2d ago")
  })

  it("falls back to an absolute date beyond a week", () => {
    expect(formatRelativeDate(new Date(2026, 1, 1, 12, 0, 0))).toBe("Feb 1, 2026")
  })
})

describe("slugify", () => {
  it("lowercases, trims and hyphenates", () => {
    expect(slugify("AI Fundamentals 101")).toBe("ai-fundamentals-101")
  })

  it("strips punctuation and collapses separators", () => {
    expect(slugify("  Hello, World!!  ")).toBe("hello-world")
    expect(slugify("a__b  c")).toBe("a-b-c")
  })
})

describe("getGradeFromScore", () => {
  it.each([
    [95, "A"],
    [90, "A"],
    [85, "B"],
    [72, "C"],
    [60, "D"],
    [42, "F"],
  ] as const)("maps %i → %s", (score, grade) => {
    expect(getGradeFromScore(score)).toBe(grade)
  })
})

describe("getGradeColor", () => {
  it("returns the grade CSS variable", () => {
    expect(getGradeColor("A")).toBe("var(--grade-a)")
    expect(getGradeColor("F")).toBe("var(--grade-f)")
  })
})

describe("getStatusColor", () => {
  it("returns the status CSS variable", () => {
    expect(getStatusColor("in-progress")).toBe("var(--status-in-progress)")
    expect(getStatusColor("locked")).toBe("var(--status-locked)")
  })
})

describe("clamp", () => {
  it("clamps below, within and above the range", () => {
    expect(clamp(-5, 0, 10)).toBe(0)
    expect(clamp(5, 0, 10)).toBe(5)
    expect(clamp(15, 0, 10)).toBe(10)
  })
})

describe("formatProgress", () => {
  it("rounds a 0-1 progress value to a percentage", () => {
    expect(formatProgress(0.756)).toBe("76%")
  })

  it("clamps out-of-range values", () => {
    expect(formatProgress(-0.5)).toBe("0%")
    expect(formatProgress(1.5)).toBe("100%")
  })
})
