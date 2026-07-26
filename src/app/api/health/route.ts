import { readFileSync } from "fs"
import { join } from "path"

let cachedVersion: string | null = null
let cachedCommit: string | null = null

function getVersion(): string {
  if (cachedVersion) return cachedVersion
  try {
    const pkg = JSON.parse(readFileSync(join(process.cwd(), "package.json"), "utf-8"))
    cachedVersion = pkg.version ?? "unknown"
  } catch {
    cachedVersion = "unknown"
  }
  return cachedVersion!
}

/**
 * The git commit this running copy was built from.
 *
 * Added 2026-07-26 so "is my change actually live?" is a fact anybody can check
 * in one call instead of a claim in a summary. Before this, production reported
 * only package.json's version ("0.1.0"), which never changes, so four commits
 * of finished work sat unpublished with nothing anywhere saying so.
 *
 * Coolify already puts SOURCE_COMMIT in the container environment, so this
 * costs nothing at build time. It is deliberately NOT a Docker build ARG:
 * Docker treats build args as part of every layer's cache key, so a
 * per-commit value would invalidate the entire build cache on every deploy.
 *
 * Locally there is no SOURCE_COMMIT, so fall back to reading .git directly —
 * that keeps the hlab review copy honest too.
 */
function getCommit(): string {
  if (cachedCommit) return cachedCommit
  const fromEnv = process.env.SOURCE_COMMIT || process.env.GIT_COMMIT
  if (fromEnv?.trim()) {
    cachedCommit = fromEnv.trim()
    return cachedCommit
  }
  try {
    const gitDir = join(process.cwd(), ".git")
    const head = readFileSync(join(gitDir, "HEAD"), "utf-8").trim()
    cachedCommit = head.startsWith("ref:")
      ? readFileSync(join(gitDir, head.slice(4).trim()), "utf-8").trim()
      : head
  } catch {
    cachedCommit = "unknown"
  }
  return cachedCommit!
}

/**
 * Health check endpoint for Coolify and Uptime Kuma monitoring.
 * Returns 200 with JSON status when the app is running.
 *
 * `commit` and `site` are also read by scripts/ship.py in GWTH-launch-plan,
 * which refuses to record a change as live unless the commit it is shipping is
 * the commit answering here.
 */
export async function GET() {
  return Response.json(
    {
      status: "healthy",
      timestamp: new Date().toISOString(),
      version: getVersion(),
      commit: getCommit(),
      site: process.env.NEXT_PUBLIC_SITE_URL ?? null,
    },
    { status: 200 }
  )
}
