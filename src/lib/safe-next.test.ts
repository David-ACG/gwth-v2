import { describe, expect, it } from "vitest"
import { safeNextPath } from "./safe-next"

describe("safeNextPath", () => {
  it("keeps a same-site path with its query", () => {
    const lesson = "/course/applied-ai-skills/lesson/welcome?page=5&surface=prose"
    expect(safeNextPath(lesson)).toBe(lesson)
  })

  it.each([
    "//evil.example/x",
    "/\\evil.example",
    "https://evil.example",
    "javascript:alert(1)",
    "course/relative",
    "/ok\nLocation: x",
    "",
  ])("refuses %j", (value) => {
    expect(safeNextPath(value)).toBeNull()
  })

  it("refuses the auth pages so sign-in cannot loop", () => {
    expect(safeNextPath("/login")).toBeNull()
    expect(safeNextPath("/login?next=/x")).toBeNull()
    expect(safeNextPath("/signup")).toBeNull()
  })

  it("refuses anything that is not a string", () => {
    expect(safeNextPath(undefined)).toBeNull()
    expect(safeNextPath(["/a", "/b"])).toBeNull()
  })
})
