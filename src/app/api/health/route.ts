import { readFileSync } from "fs"
import { join } from "path"

let cachedVersion: string | null = null

function getVersion(): string {
  if (cachedVersion) return cachedVersion
  try {
    const pkg = JSON.parse(readFileSync(join(process.cwd(), "package.json"), "utf-8"))
    cachedVersion = pkg.version ?? "unknown"
  } catch {
    cachedVersion = "unknown"
  }
  return cachedVersion
}

/**
 * Health check endpoint for Coolify and Uptime Kuma monitoring.
 * Returns 200 with JSON status when the app is running.
 * Will be extended in Phase 2 to check database connectivity.
 */
export async function GET() {
  return Response.json(
    {
      status: "healthy",
      timestamp: new Date().toISOString(),
      version: getVersion(),
    },
    { status: 200 }
  )
}
