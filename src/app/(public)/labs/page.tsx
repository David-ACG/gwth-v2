import type { Metadata } from "next"
import { getLabs } from "@/lib/data/labs"
import {
  getLiveArenaLabs,
  getArchivedArenaLabs,
} from "@/lib/data/model-arena"
import { LabsFde } from "@/components/marketing/labs-fde/labs-fde"

export const metadata: Metadata = {
  title: "Labs — the Model Arena",
  description:
    "Free head-to-head AI labs: two tools run the same real task, outputs side by side, a rubric, and a dated verdict. Read them free, no account required.",
}

/**
 * Public labs landing in the Model Arena format (FDE journal register).
 *
 * Shows the labs currently in rotation (LIVE) and the dated ARCHIVE of
 * superseded matchups plus the retired tiered-format labs, which are kept
 * read-only. No auth required, no progress data: labs are the free taster.
 */
export default async function PublicLabsPage() {
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
