import type { Metadata } from "next"
import { PaletteExplorer } from "@/components/marketing/redesign/palette-explorer"
import { requireSessionOrRedirect } from "@/lib/content-access"

export const metadata: Metadata = {
  title: "Redesign v2 · E2-E Palette Explorer · GWTH.ai",
  description:
    "Live colour explorer for the E2-E homepage variant. Cycle through twelve options each for the light postscript panel, dark postscript panel, and red CTA.",
  robots: { index: false, follow: false },
}

/**
 * Redesign v2 — single-variant palette explorer for E2-E.
 * The legacy /redesign exploration is archived; this page replaces it
 * for the colour-tuning phase.
 */
export default async function RedesignV2Page() {
  // Dev/review mock: the proxy bounce for this route is presence-only, so
  // the real gate is this server-validated session check (gwth-launch-dgc).
  await requireSessionOrRedirect()
  return <PaletteExplorer />
}
