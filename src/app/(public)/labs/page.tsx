import type { Metadata } from "next"
import { getModelLabIndex } from "@/lib/data/model-lab"
import { LabsFde } from "@/components/marketing/labs-fde/labs-fde"
import { requireContentAccessOrRedirect } from "@/lib/content-access"

/**
 * The content gate must be evaluated per request, never baked at build time.
 * Without this pair /labs is statically prerendered (it was listed in
 * `.next/prerender-manifest.json` before W25) and whichever verdict the BUILD
 * machine reached is frozen into the image: `PRIVATE_CONTENT_MODE=off` could
 * not reopen it at launch, and a build that happened to see an open value
 * would keep serving the full lab bodies whatever the runtime env said.
 * `requireContentAccessOrRedirect()` also awaits `headers()` unconditionally,
 * so the route cannot be prerendered even if these exports were removed.
 */
export const dynamic = "force-dynamic"
export const revalidate = 0

export const metadata: Metadata = {
  title: "Free AI labs",
  description:
    "Every new AI model on the same real UK work tasks, in six labs: research, writing, thinking, building, data and automation. Marked by computer checks and AI judges, with the best pick, the best value and the cost of each. Free, no card required.",
}

/**
 * The Model Lab index (David, 2026-10-21, option A): the six labs, how we
 * test, and the cost and score of every set-up. It replaced the Model Arena
 * listing. No progress data: labs are the free taster once the site is
 * public.
 *
 * While `PRIVATE_CONTENT_MODE` is on the gate below restricts the page to the
 * content allowlist. It is the FIRST await, before any lab is read: App
 * Router renders a page in parallel with its layout, so a gate placed after a
 * data read still streams the lab data out in the RSC payload.
 */
export default async function PublicLabsPage() {
  await requireContentAccessOrRedirect()

  return <LabsFde index={getModelLabIndex()} />
}
