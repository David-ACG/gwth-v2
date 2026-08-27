import type { Metadata } from "next"
import { LogoExplorer } from "@/components/marketing/redesign/logo-explorer"
import { requireSessionOrRedirect } from "@/lib/content-access"

export const metadata: Metadata = {
  title: "Logo Picker · Vector Mark Explorer · GWTH.ai",
  description:
    "Live colour explorer for the new GWTH.ai vector logo. Tune wordmark and accent colours independently for light and dark modes against a representative E2-E homepage.",
  robots: { index: false, follow: false },
}

/**
 * Logo picker — sticky swatch bar with light/dark wordmark + accent
 * options, live-rendered against a dummy E2-E homepage so the mark
 * can be judged in masthead, footer, and at multiple sizes in context.
 */
export default async function LogoPickerPage() {
  // Dev/review mock: the proxy bounce for this route is presence-only, so
  // the real gate is this server-validated session check (gwth-launch-dgc).
  await requireSessionOrRedirect()
  return <LogoExplorer />
}
