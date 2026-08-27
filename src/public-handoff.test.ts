/**
 * Regression guard for gwth-launch-sl1 (P0, N2 security).
 *
 * `public/gwth-handoff/` once held the complete Month-1 lesson 1 handoff
 * artefacts (51KB lesson JSON, media manifest, audio/images/video). Files in
 * `public/` are served by Next's static handler, which the proxy matcher and
 * every page-level gate sit BEHIND: nothing server-side can ever protect
 * them. The content was verified publicly downloadable from
 * gwth.ai/gwth-handoff/ on 2026-07-25 and removed; the leftover empty
 * directories were cleared on 2026-08-27.
 *
 * This test keeps the directory gone. If a future handoff needs to move
 * files, put them anywhere except `public/` (they belong outside the repo,
 * or behind a session-gated route handler).
 */
import { describe, expect, it } from "vitest"
import { existsSync } from "node:fs"
import { join } from "node:path"

describe("public/ never serves lesson handoff artefacts (gwth-launch-sl1)", () => {
  it("has no gwth-handoff directory under public/", () => {
    const handoffDir = join(process.cwd(), "public", "gwth-handoff")
    expect(
      existsSync(handoffDir),
      "public/gwth-handoff is served unauthenticated by the static handler; " +
        "it must never exist"
    ).toBe(false)
  })
})
