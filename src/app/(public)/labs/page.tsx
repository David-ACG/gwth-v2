import type { Metadata } from "next"
import { getLabs } from "@/lib/data/labs"
import {
  getLiveArenaLabs,
  getArchivedArenaLabs,
} from "@/lib/data/model-arena"
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
  title: "Labs: the Model Arena",
  description:
    "Head-to-head AI labs: two tools run the same real task, outputs side by side, a rubric, and a dated verdict. Included free with your GWTH beta place.",
}

/**
 * Public labs landing in the Model Arena format (FDE journal register).
 *
 * Shows the labs currently in rotation (LIVE) and the dated ARCHIVE of
 * superseded matchups plus the retired tiered-format labs, which are kept
 * read-only. No progress data: labs are the free taster once the site is
 * public.
 *
 * While `PRIVATE_CONTENT_MODE` is on the gate below restricts the page to the
 * content allowlist. It is the FIRST await, before any lab is fetched: App
 * Router renders a page in parallel with its layout, so a gate placed after a
 * data read still streams the lab bodies out in the RSC payload.
 */
export default async function PublicLabsPage() {
  await requireContentAccessOrRedirect()

  const [liveLabs, archivedArenaLabs, legacyArchive] = await Promise.all([
    getLiveArenaLabs(),
    getArchivedArenaLabs(),
    getLabs(),
  ])

  return (
    <LabsFde
      liveLabs={liveLabs}
      archivedArenaLabs={archivedArenaLabs}
      legacyArchive={legacyArchive}
    />
  )
}
