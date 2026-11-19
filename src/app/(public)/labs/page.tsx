import type { Metadata } from "next"
import { getModelLab, getModelLabIndex } from "@/lib/data/model-lab"
import { LabsNext } from "@/components/marketing/labs-next/labs-next"
import type { ModelLabSlug } from "@/lib/types"
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
    "New AI models tested on the same real UK work tasks, in six labs: research, writing, thinking, building, data and automation. Marked by computer checks and AI judges, with the best pick, the best value and the cost of each. Free, no card required.",
}

/**
 * The Model Lab index (David, 2026-10-21, option A): the six labs, how we
 * test, and the cost and score of every set-up. It replaced the Model Arena
 * listing. No progress data: labs are the free taster once the site is
 * public. Since 19 Nov 2026 it renders `labs-next/` (the page in the family
 * of the new home page); `labs-fde/` is kept beside it as the backup.
 *
 * While `PRIVATE_CONTENT_MODE` is on the gate below restricts the page to the
 * content allowlist. It is the FIRST await, before any lab is read: App
 * Router renders a page in parallel with its layout, so a gate placed after a
 * data read still streams the lab data out in the RSC payload.
 */
export default async function PublicLabsPage() {
  await requireContentAccessOrRedirect()

  const index = getModelLabIndex()
  // Each lab's main task in plain English, from the lab's own export, so the
  // six cards can say what the task is (19 Nov 2026). Read after the gate.
  const plain: Partial<Record<ModelLabSlug, string>> = {}
  for (const lab of index.labs) {
    const task = getModelLab(lab.sp)?.sig_plain
    if (task) plain[lab.sp] = task
  }

  return <LabsNext index={index} plain={plain} />
}
