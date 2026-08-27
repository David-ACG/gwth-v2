/**
 * Regression: the quiz answer key must never enter client props
 * (gwth-launch-va6, N2 security). `toPublicQuizQuestions` is the only shape
 * the lesson page hands to the client viewer; if it ever grows the key or
 * the explanation back, this fails.
 */
import { describe, expect, it } from "vitest"
import { toPublicQuizQuestions } from "./lessons"

describe("toPublicQuizQuestions", () => {
  it("strips correctOptionIndex and explanation from every question", () => {
    const publicQuestions = toPublicQuizQuestions([
      {
        id: "q1",
        question: "Which one?",
        options: ["a", "b"],
        correctOptionIndex: 1,
        explanation: "Because b.",
      },
    ])

    expect(publicQuestions).toEqual([
      { id: "q1", question: "Which one?", options: ["a", "b"] },
    ])
    // Belt and braces: assert the keys are ABSENT, not just falsy.
    for (const q of publicQuestions) {
      expect(Object.keys(q).sort()).toEqual(["id", "options", "question"])
    }
  })
})
