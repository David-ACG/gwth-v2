/**
 * Unit tests for the POST /api/comments body schema: the hybrid front end
 * (canned actions, marks with a shape, in-place text edits, drawn areas).
 */
import { describe, expect, it } from "vitest"

import { CANNED_ACTIONS } from "./types"
import { newPageCommentSchema, resolveCannedAction } from "./validation"

const BASE = { pagePath: "/course/x", targetType: "text", comment: "Odd wording" }

function parse(patch: Record<string, unknown>) {
  return newPageCommentSchema.safeParse({ ...BASE, ...patch })
}

describe("canned actions", () => {
  it("fills the label from CANNED_ACTIONS and ignores the browser's label", () => {
    const result = parse({
      comment: "",
      action: { category: "content", key: "simplify", label: "Delete the site" },
    })
    expect(result.success).toBe(true)
    expect(result.data?.action).toEqual({
      category: "content",
      key: "simplify",
      label: CANNED_ACTIONS.content.actions.simplify,
    })
    expect(result.data?.comment).toBe("")
  })

  it.each([
    ["an unknown category", { category: "vibes", key: "rewrite" }],
    ["a key from another category", { category: "keep", key: "rewrite" }],
    ["a prototype key", { category: "content", key: "toString" }],
    ["a prototype category", { category: "__proto__", key: "rewrite" }],
    ["a missing key", { category: "content" }],
  ])("rejects %s", (_label, action) => {
    expect(parse({ action }).success).toBe(false)
  })

  it("resolveCannedAction covers every listed action", () => {
    for (const [category, group] of Object.entries(CANNED_ACTIONS)) {
      for (const [key, label] of Object.entries(group.actions)) {
        expect(resolveCannedAction(category, key)).toEqual({ category, key, label })
      }
    }
  })
})

describe("empty comments", () => {
  it("is allowed with an action or a text edit", () => {
    expect(parse({ comment: "  ", action: { category: "keep", key: "keep" } }).success).toBe(true)
    expect(parse({ comment: "", textEdit: { original: "the UK", replacement: "Britain" } }).success).toBe(true)
    expect(parse({ comment: undefined, action: { category: "design", key: "spacing" } }).success).toBe(true)
  })

  it("is refused without either, with the usual message", () => {
    const result = parse({ comment: "   " })
    expect(result.success).toBe(false)
    expect(result.error?.issues[0]?.message).toBe("Please write a comment")
    expect(parse({ comment: null, shape: { kind: "point", rel: { x: 0, y: 0, w: 0, h: 0 } } }).success).toBe(false)
  })

  it("trims the words and still caps them at 4000", () => {
    expect(parse({ comment: "  hi  " }).data?.comment).toBe("hi")
    expect(parse({ comment: "x".repeat(4001), action: { category: "keep", key: "keep" } }).success).toBe(false)
  })
})

describe("text edits", () => {
  it("accepts a real change, trimmed", () => {
    const result = parse({ textEdit: { original: " the UK ", replacement: "Britain " } })
    expect(result.data?.textEdit).toEqual({ original: "the UK", replacement: "Britain" })
  })

  it("accepts deleting the words (empty replacement)", () => {
    expect(parse({ textEdit: { original: "really", replacement: "" } }).success).toBe(true)
  })

  it.each([
    ["identical strings", { original: "the UK", replacement: "the UK" }],
    ["strings identical after trimming", { original: "the UK", replacement: " the UK " }],
    ["an empty original", { original: "  ", replacement: "x" }],
    ["an over-long original", { original: "x".repeat(2001), replacement: "y" }],
    ["an over-long replacement", { original: "x", replacement: "y".repeat(2001) }],
  ])("rejects %s", (_label, textEdit) => {
    expect(parse({ textEdit }).success).toBe(false)
  })
})

describe("shapes and targets", () => {
  it("accepts a drawn box on an area target", () => {
    const shape = { kind: "box", rel: { x: 0.1, y: -0.2, w: 1.5, h: 2 } }
    const result = parse({ targetType: "area", shape })
    expect(result.success).toBe(true)
    expect(result.data?.targetType).toBe("area")
    expect(result.data?.shape).toEqual(shape)
  })

  it.each([
    ["an unknown kind", { kind: "circle", rel: { x: 0, y: 0, w: 0, h: 0 } }],
    ["a number below -1", { kind: "point", rel: { x: -1.5, y: 0, w: 0, h: 0 } }],
    ["a number above 2", { kind: "box", rel: { x: 0, y: 0, w: 2.1, h: 0 } }],
    ["a missing coordinate", { kind: "box", rel: { x: 0, y: 0, w: 1 } }],
    ["a string coordinate", { kind: "box", rel: { x: "0", y: 0, w: 1, h: 1 } }],
  ])("rejects %s", (_label, shape) => {
    expect(parse({ shape }).success).toBe(false)
  })

  it("null action, shape and textEdit read as absent", () => {
    const result = parse({ action: null, shape: null, textEdit: null })
    expect(result.success).toBe(true)
    expect(result.data?.action).toBeUndefined()
    expect(result.data?.shape).toBeUndefined()
    expect(result.data?.textEdit).toBeUndefined()
  })
})
