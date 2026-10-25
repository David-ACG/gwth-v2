import { readdirSync, readFileSync, statSync } from "node:fs"
import { join } from "node:path"
import { describe, expect, it } from "vitest"
import { COURSE_OPENS_ON, DEFAULT_SALES_OPEN_AT } from "@/lib/launch-date"

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name)
    if (statSync(path).isDirectory()) return sourceFiles(path)
    return /\.(ts|tsx)$/.test(name) && !/\.test\.tsx?$/.test(name) ? [path] : []
  })
}

describe("the opening date lives in one place", () => {
  it("prints 1 December 2026 from the one constant", () => {
    expect(DEFAULT_SALES_OPEN_AT).toBe("2026-12-01T00:00:00Z")
    expect(COURSE_OPENS_ON).toBe("1 December 2026")
  })

  it("is never typed into page words, so moving the launch is a one-line change", () => {
    // Comments may mention the date; the legal pages' "updated" stamp is not the opening date.
    const allowed = ["src/app/(public)/terms/page.tsx", "src/app/(public)/privacy/page.tsx"]
    const offenders = sourceFiles("src")
      .filter((f) => !allowed.includes(f) && f !== "src/lib/launch-date.ts")
      .flatMap((f) =>
        readFileSync(f, "utf8")
          .split("\n")
          .map((line, i) => ({ f, i: i + 1, line }))
          .filter(({ line }) => /1 December 2026/.test(line) && !/^\s*(\/\/|\*|\/\*|\{\/\*)/.test(line))
      )
      .map(({ f, i }) => `${f}:${i}`)
    expect(offenders).toEqual([])
  })
})
