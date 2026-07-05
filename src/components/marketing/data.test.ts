import { describe, it, expect } from "vitest"
import {
  JOURNEYS,
  PRICING,
  RESEARCH_SOURCES,
  FOOTER_COLS,
  NAV_LINKS,
  PRODUCT_PILLARS,
  CURRICULUM,
  UK_STATS,
  SCORE_CATEGORIES,
} from "./data"
import { COURSE_MONTHLY_PRICE, ONGOING_MONTHLY_PRICE } from "@/lib/config"

describe("marketing/data — JOURNEYS", () => {
  it("contains exactly 9 journeys", () => {
    expect(JOURNEYS.length).toBe(9)
  })

  it("every journey has the required string fields populated", () => {
    for (const j of JOURNEYS) {
      expect(j.n).toMatch(/\S/)
      expect(j.tag).toMatch(/\S/)
      expect(j.title).toMatch(/\S/)
      expect(j.body).toMatch(/\S/)
      expect(j.href).toMatch(/\S/)
      expect(j.cta).toMatch(/\S/)
    }
  })

  it("every href is a relative path or absolute https URL", () => {
    for (const j of JOURNEYS) {
      const ok = j.href.startsWith("/") || j.href.startsWith("https://")
      expect(ok, `journey ${j.n} href "${j.href}" must start with / or https://`).toBe(true)
    }
  })

  it("every accent is one of the supported tokens", () => {
    for (const j of JOURNEYS) {
      expect(["mint", "aqua"]).toContain(j.accent)
    }
  })
})

describe("marketing/data — PRICING (drift sentinel vs lib/config)", () => {
  it("course tier price matches COURSE_MONTHLY_PRICE", () => {
    const tier = PRICING[1]
    expect(tier).toBeDefined()
    expect(tier!.pricePence).toBe(COURSE_MONTHLY_PRICE * 100)
  })

  it("stay tier price matches ONGOING_MONTHLY_PRICE", () => {
    const tier = PRICING[2]
    expect(tier).toBeDefined()
    expect(tier!.pricePence).toBe(Math.round(ONGOING_MONTHLY_PRICE * 100))
  })

  it("free tier is £0", () => {
    const tier = PRICING[0]
    expect(tier).toBeDefined()
    expect(tier!.pricePence).toBe(0)
    expect(tier!.price).toBe("£0")
  })

  it("every tier has a valid CTA href", () => {
    for (const tier of PRICING) {
      expect(tier.cta.href.length).toBeGreaterThan(0)
      expect(tier.cta.label.length).toBeGreaterThan(0)
    }
  })
})

describe("marketing/data — RESEARCH_SOURCES", () => {
  it("contains exactly 6 UK research bodies", () => {
    expect(RESEARCH_SOURCES.length).toBe(6)
    expect(RESEARCH_SOURCES).toEqual([
      "DSIT",
      "ONS",
      "CIPD",
      "BCS",
      "Tech UK",
      "Innovate UK",
    ])
  })
})

describe("marketing/data — FOOTER_COLS", () => {
  it("has 3 columns, each with non-empty link list", () => {
    expect(FOOTER_COLS.length).toBe(3)
    for (const col of FOOTER_COLS) {
      expect(col.title).toMatch(/\S/)
      expect(col.links.length).toBeGreaterThan(0)
      for (const link of col.links) {
        expect(link.label).toMatch(/\S/)
        expect(link.href).toMatch(/\S/)
      }
    }
  })
})

describe("marketing/data — supporting collections", () => {
  it("NAV_LINKS contains 5 entries", () => {
    expect(NAV_LINKS.length).toBe(5)
  })

  it("PRODUCT_PILLARS contains 3 entries with required fields", () => {
    expect(PRODUCT_PILLARS.length).toBe(3)
    for (const p of PRODUCT_PILLARS) {
      expect(p.title).toMatch(/\S/)
      expect(p.body).toMatch(/\S/)
    }
  })

  it("CURRICULUM contains 3 modules", () => {
    expect(CURRICULUM.length).toBe(3)
    for (const m of CURRICULUM) {
      expect(m.capstone).toMatch(/\S/)
    }
  })

  it("UK_STATS contains 3 entries", () => {
    expect(UK_STATS.length).toBe(3)
  })

  it("SCORE_CATEGORIES contains 4 illustrative sub-scores", () => {
    expect(SCORE_CATEGORIES.length).toBe(4)
    for (const c of SCORE_CATEGORIES) {
      expect(c.v).toBeGreaterThanOrEqual(0)
      expect(c.v).toBeLessThanOrEqual(100)
    }
  })
})

describe("marketing/data: em-dash sweep sentinel (W15)", () => {
  it("no exported copy contains an em dash (U+2014)", () => {
    // The 2026-07-04 pre-launch sweep removed all em dashes from the locked
    // homepage copy; this pins the sweep so new copy cannot reintroduce them.
    const allCopy = JSON.stringify({
      JOURNEYS,
      PRODUCT_PILLARS,
      RESEARCH_SOURCES,
      UK_STATS,
      CURRICULUM,
      PRICING,
      SCORE_CATEGORIES,
      NAV_LINKS,
      FOOTER_COLS,
    })
    expect(allCopy).not.toContain("—")
  })
})
