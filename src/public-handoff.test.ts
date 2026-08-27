/**
 * Regression guard for gwth-launch-sl1 (P0, N2 security).
 *
 * `public/gwth-handoff/` once held the complete Month-1 lesson 1 handoff
 * artefacts (51KB lesson JSON, media manifest, audio/images/video). Files in
 * `public/` are served by Next's static handler, which the proxy matcher and
 * every page-level gate sit BEHIND: nothing server-side can ever protect
 * them. The content was verified publicly downloadable from
 * gwth.ai/gwth-handoff/ on 2026-07-25 and removed (prod re-probed 404 on
 * 2026-07-27).
 *
 * The test tolerates EMPTY directories but no files: /home/david/projects on
 * hlab is a receive-only Syncthing folder, and the source device still
 * carries the empty audio/images/video dirs, so a local `rmdir` is reverted
 * within minutes. An empty directory serves nothing (the static handler
 * 404s); a FILE under this path is a live leak, and that is what must never
 * come back.
 */
import { describe, expect, it } from "vitest"
import { existsSync, readdirSync, statSync } from "node:fs"
import { join } from "node:path"

/** Recursively lists every file under a directory. */
function listFiles(dir: string): string[] {
  if (!existsSync(dir)) return []
  const out: string[] = []
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) out.push(...listFiles(full))
    else out.push(full)
  }
  return out
}

describe("public/ never serves lesson handoff artefacts (gwth-launch-sl1)", () => {
  it("has no files under public/gwth-handoff", () => {
    const handoffDir = join(process.cwd(), "public", "gwth-handoff")
    const files = listFiles(handoffDir)
    expect(
      files,
      "files under public/gwth-handoff are served unauthenticated by the " +
        "static handler - remove them (and their copy on the Syncthing " +
        "source device)"
    ).toEqual([])
  })
})
