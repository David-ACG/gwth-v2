import type { Metadata } from "next"
import { LogoExplorer } from "@/components/marketing/redesign/logo-explorer"

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
export default function LogoPickerPage() {
  return <LogoExplorer />
}
