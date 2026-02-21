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
      version: process.env.npm_package_version ?? "unknown",
    },
    { status: 200 }
  )
}
