import { notFound } from "next/navigation"
import { AccessForm } from "./access-form"

/**
 * Force runtime evaluation: `SITE_PASSWORD` is a runtime-only variable, so a
 * prerendered /access would freeze whichever value the BUILD machine had. Same
 * reasoning as `src/app/robots.ts` and the W25 content gate.
 */
export const dynamic = "force-dynamic"
export const revalidate = 0

/**
 * Site-password gate page.
 *
 * The gate itself lives in `src/proxy.ts` and only engages when `SITE_PASSWORD`
 * is set. That variable was deliberately removed from the production env on
 * 2026-07-05 (docs/runbook-go-live.md §2), which left this page answering 200
 * anonymously on gwth.ai with a password form that could never succeed. It now
 * 404s whenever the gate is off, so the route exists exactly as long as the
 * feature does (W25).
 */
export default async function AccessPage() {
  if (!process.env.SITE_PASSWORD) notFound()
  return <AccessForm />
}
