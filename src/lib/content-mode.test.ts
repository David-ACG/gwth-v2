import { describe, expect, it } from "vitest"
import {
  assertContentGateConfigured,
  getContentAllowlist,
  isContentAllowedEmail,
  isPrivateContentMode,
} from "./content-mode"

/**
 * The whole point of this module is that no MISTAKE opens the site, so most of
 * these tests are about wrong input rather than right input. Every function
 * takes an injectable `env`, so nothing here mutates `process.env`.
 */
describe("private content mode (W25)", () => {
  describe("isPrivateContentMode — fail closed", () => {
    it("is LOCKED when PRIVATE_CONTENT_MODE is unset", () => {
      expect(isPrivateContentMode({})).toBe(true)
    })

    it("is LOCKED for empty, whitespace and typo values", () => {
      for (const value of [
        "",
        "   ",
        "on",
        "ON",
        "yes",
        "true",
        "1",
        "of",
        "offf",
        "private",
        "Publi",
        '"off"',
        "'off'",
        "off,public",
      ]) {
        expect(
          isPrivateContentMode({ PRIVATE_CONTENT_MODE: value }),
          `${JSON.stringify(value)} must stay LOCKED`
        ).toBe(true)
      }
    })

    it("stays LOCKED for falsy-looking values, unlike the other flags here", () => {
      // ALLOW_INDEXING === "1" and ENABLE_DEV_MOCK_USER === "true" both read
      // truthy-means-more, so a template default of the shape
      // ${PRIVATE_CONTENT_MODE:-0} is a plausible accident. It must not open
      // the site.
      for (const value of ["0", "false", "FALSE", "no"]) {
        expect(
          isPrivateContentMode({ PRIVATE_CONTENT_MODE: value }),
          `${value} must stay LOCKED`
        ).toBe(true)
      }
    })

    it("opens only for an explicit off/public, in any case, with any padding", () => {
      for (const value of ["off", "OFF", " off ", "Off", "public", "PUBLIC "]) {
        expect(
          isPrivateContentMode({ PRIVATE_CONTENT_MODE: value }),
          `${JSON.stringify(value)} must OPEN`
        ).toBe(false)
      }
    })
  })

  describe("getContentAllowlist", () => {
    it("admits nobody when both variables are unset", () => {
      expect(getContentAllowlist({}).size).toBe(0)
      expect(isContentAllowedEmail("david@agilecommercegroup.com", {})).toBe(
        false
      )
    })

    it("admits nobody when both variables are empty or separators only", () => {
      const env = { CONTENT_ALLOWED_EMAILS: " , ,, ", ADMIN_EMAILS: "" }
      expect(getContentAllowlist(env).size).toBe(0)
      expect(isContentAllowedEmail("david@agilecommercegroup.com", env)).toBe(
        false
      )
    })

    it("parses a comma-separated list with whitespace, mixed case and a trailing comma", () => {
      const env = {
        CONTENT_ALLOWED_EMAILS:
          " David@AgileCommerceGroup.com , familyuccelli@Gmail.com ,",
      }
      expect(getContentAllowlist(env)).toEqual(
        new Set(["david@agilecommercegroup.com", "familyuccelli@gmail.com"])
      )
    })

    it("admits BOTH demo accounts, not just the first", () => {
      // The demo on 27 July is walked as the student, not the owner, so a
      // single-value implementation would lock the demo out of its own path.
      const env = {
        CONTENT_ALLOWED_EMAILS:
          "david@agilecommercegroup.com,familyuccelli@gmail.com",
      }
      expect(isContentAllowedEmail("david@agilecommercegroup.com", env)).toBe(
        true
      )
      expect(isContentAllowedEmail("familyuccelli@gmail.com", env)).toBe(true)
      expect(isContentAllowedEmail("someone@else.com", env)).toBe(false)
    })

    it("matches case- and whitespace-insensitively", () => {
      const env = { CONTENT_ALLOWED_EMAILS: "david@gwth.ai" }
      expect(isContentAllowedEmail("  DAVID@GWTH.AI  ", env)).toBe(true)
    })

    it("falls back to ADMIN_EMAILS when CONTENT_ALLOWED_EMAILS is unset or empty", () => {
      for (const value of [undefined, "", "  ,  "]) {
        const env = {
          CONTENT_ALLOWED_EMAILS: value,
          ADMIN_EMAILS: "david@gwth.ai",
        }
        expect(getContentAllowlist(env)).toEqual(new Set(["david@gwth.ai"]))
      }
    })

    it("prefers CONTENT_ALLOWED_EMAILS over ADMIN_EMAILS when both are set", () => {
      const env = {
        CONTENT_ALLOWED_EMAILS: "student@example.com",
        ADMIN_EMAILS: "david@gwth.ai",
      }
      expect(getContentAllowlist(env)).toEqual(new Set(["student@example.com"]))
      expect(isContentAllowedEmail("david@gwth.ai", env)).toBe(false)
    })

    it("never treats null, undefined or empty as an allowed email", () => {
      const env = { CONTENT_ALLOWED_EMAILS: "david@gwth.ai" }
      expect(isContentAllowedEmail(null, env)).toBe(false)
      expect(isContentAllowedEmail(undefined, env)).toBe(false)
      expect(isContentAllowedEmail("", env)).toBe(false)
      expect(isContentAllowedEmail("   ", env)).toBe(false)
    })
  })

  describe("assertContentGateConfigured", () => {
    it("throws when private mode is on and the allowlist is empty", () => {
      expect(() =>
        assertContentGateConfigured({ BETTER_AUTH_URL: "https://gwth.ai" })
      ).toThrow(/CONTENT_ALLOWED_EMAILS/)
    })

    it("throws on the dangerous typo: the variable NAME is misspelt", () => {
      // A misspelt name silently falls back to ADMIN_EMAILS, which is unset in
      // production — the operator believes they configured an allowlist and
      // locked everyone out instead.
      expect(() =>
        assertContentGateConfigured({
          BETTER_AUTH_URL: "https://gwth.ai",
          PRIVATE_CONTENT_MODE: "on",
          CONTENT_ALLOWED_EMAIL: "david@agilecommercegroup.com",
        })
      ).toThrow(/spelling of the variable NAME/)
    })

    it("does not throw when private mode is on and an allowlist is configured", () => {
      expect(() =>
        assertContentGateConfigured({
          BETTER_AUTH_URL: "https://gwth.ai",
          PRIVATE_CONTENT_MODE: "on",
          CONTENT_ALLOWED_EMAILS: "david@agilecommercegroup.com",
        })
      ).not.toThrow()
    })

    it("does not throw when private mode is off, allowlist or not", () => {
      expect(() =>
        assertContentGateConfigured({
          BETTER_AUTH_URL: "https://gwth.ai",
          PRIVATE_CONTENT_MODE: "off",
        })
      ).not.toThrow()
    })

    it("is inert without BETTER_AUTH_URL, so `next build` cannot be broken by it", () => {
      // The Dockerfile passes exactly one build arg, so BETTER_AUTH_URL is
      // absent during `next build` and present on every real deployment.
      expect(() => assertContentGateConfigured({})).not.toThrow()
      expect(() =>
        assertContentGateConfigured({ PRIVATE_CONTENT_MODE: "on" })
      ).not.toThrow()
    })
  })
})
