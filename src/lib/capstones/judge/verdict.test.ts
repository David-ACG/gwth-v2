import { describe, expect, it } from "vitest"
import type { MarkingGuide } from "../guide-loader"
import type { ScriptChecks } from "../checks"
import {
  bandOf,
  combineVerdicts,
  extractJson,
  nearBandLine,
  parseVerdict,
  totalOf,
  verdictJsonSchema,
  type Level,
  type Verdict,
} from "./verdict"

const guide: MarkingGuide = {
  capstone: "familybot",
  title: "Month 1: FamilyBot",
  studentTitle: "FamilyBot",
  handInText: "",
  answersNote: "",
  expectedFiles: [],
  criteria: [
    { id: "blueprint", name: "The Blueprint", points: 20, descriptors: { pass: "p", good: "g", excellent: "e" } },
    { id: "transcript", name: "Transcript", points: 10, descriptors: { pass: "p", good: "g", excellent: "e" } },
    { id: "weekly_brief", name: "Weekly brief", points: 30, descriptors: { pass: "p", good: "g", excellent: "e" } },
    { id: "digest", name: "Digest", points: 25, descriptors: { pass: "p", good: "g", excellent: "e" } },
    { id: "in_apps", name: "In apps", points: 15, descriptors: { pass: "p", good: "g", excellent: "e" } },
  ],
  basics: [
    { id: "consent", name: "Consent", text: "t" },
    { id: "private", name: "Private", text: "t" },
  ],
}
const noChecks: ScriptChecks = { capstone: "familybot", passed: 0, total: 0, results: [] }

function verdict(levels: Level[], basics: Partial<Record<string, { met?: boolean; doubt?: boolean }>> = {}, quote = "swim Tue"): Verdict {
  return {
    criteria: guide.criteria.map((c, i) => ({ id: c.id, level: levels[i]!, quote, feedback: `fb ${c.id}`, next_level: `next ${c.id}` })),
    basics: guide.basics.map((b) => ({ id: b.id, met: basics[b.id]?.met ?? true, doubt: basics[b.id]?.doubt ?? false, reason: `r ${b.id}` })),
    next_step: "Add the school calendar.",
  }
}
const all = (l: Level): Level[] => [l, l, l, l, l]

describe("points and bands", () => {
  it("scores levels as fractions of each criterion and bands at 40, 60, 80", () => {
    expect(totalOf(verdict(all("pass")), guide)).toBe(50)
    expect(totalOf(verdict(all("good")), guide)).toBe(75)
    expect(totalOf(verdict(all("excellent")), guide)).toBe(100)
    expect([39, 40, 59.5, 60, 79, 80].map((t) => bandOf(t, true))).toEqual(["not_yet", "pass", "pass", "good", "good", "excellent"])
    expect(bandOf(95, false)).toBe("not_yet")
  })

  it("treats within 3 points of a band line as near", () => {
    expect([37, 43, 44, 57, 63.5, 83].map(nearBandLine)).toEqual([true, true, false, true, false, true])
  })
})

describe("validating a verdict", () => {
  it("accepts every criterion and basics line once, and refuses gaps or extras", () => {
    expect(parseVerdict(verdict(all("good")), guide).criteria).toHaveLength(5)
    const missing = { ...verdict(all("good")), criteria: verdict(all("good")).criteria.slice(1) }
    expect(() => parseVerdict(missing, guide)).toThrow(/missing blueprint/)
    expect(() => parseVerdict({ ...verdict(all("good")), next_step: 3 }, guide)).toThrow()
  })

  it("reads JSON inside a code fence", () => {
    expect(extractJson('Here:\n```json\n{"a":1}\n```')).toEqual({ a: 1 })
  })

  it("offers a strict schema listing the guide's ids", () => {
    const schema = JSON.stringify(verdictJsonSchema(guide))
    expect(schema).toContain('"weekly_brief"')
    expect(schema).toContain('"additionalProperties":false')
  })
})

describe("two judges become one mark", () => {
  const sources = "We had swim Tue and the dentist."

  it("lets an agreed mark stand, averaging the totals", () => {
    // 75 and 72.5: both Good, neither near a line.
    const c = combineVerdicts(verdict(all("good")), verdict(["good", "pass", "good", "good", "good"]), guide, noChecks, sources)
    expect(c.status).toBe("provisional")
    expect(c.band).toBe("good")
    expect(c.total).toBe(74) // (75 + 72.5) / 2, rounded
    expect(c.flags).toEqual(["criterion_disagree:transcript"])
    // The card shows the lower level where the judges differ.
    expect(c.criteria.find((x) => x.id === "transcript")).toMatchObject({ level: "pass", points: 5 })
  })

  it("sends a band disagreement to David", () => {
    const c = combineVerdicts(verdict(all("pass")), verdict(all("good")), guide, noChecks, sources)
    expect(c.status).toBe("with_david")
    expect(c.flags).toContain("judges_disagree")
  })

  it("sends a mark within 3 points of a band line to David", () => {
    // 10 + 5 + 15 + 18.75 + 11.25 = 60 for both: Good, but on the line.
    const levels: Level[] = ["pass", "pass", "pass", "good", "good"]
    const c = combineVerdicts(verdict(levels), verdict(levels), guide, noChecks, sources)
    expect(c.flags).toContain("near_band_line")
    expect(c.status).toBe("with_david")
  })

  it("sends a basics line missed or in doubt, or failed by a script check, to David", () => {
    expect(combineVerdicts(verdict(all("good")), verdict(all("good"), { consent: { doubt: true } }), guide, noChecks, sources)).toMatchObject({
      status: "with_david",
      flags: ["basics:consent"],
    })
    const missed = combineVerdicts(verdict(all("good"), { private: { met: false } }), verdict(all("good")), guide, noChecks, sources)
    expect(missed.band).toBe("not_yet")
    const checks: ScriptChecks = { ...noChecks, results: [{ id: "x", label: "x", passed: false, detail: "", basic: "private" }] }
    expect(combineVerdicts(verdict(all("good")), verdict(all("good")), guide, checks, sources).flags).toContain("basics:private")
  })

  it("flags a quote that is not in the learner's work", () => {
    const c = combineVerdicts(verdict(all("good"), {}, "a sentence nobody wrote"), verdict(all("good")), guide, noChecks, sources)
    expect(c.flags.filter((f) => f.startsWith("quote_not_found"))).toHaveLength(5)
  })
})
