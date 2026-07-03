import type { Metadata } from "next"
import { VariantSwitcher } from "@/components/marketing/redesign/variant-switcher"

/**
 * Redesign sandbox layout. Lives outside `(public)` so each variant can
 * own its own visual chrome without inheriting the production nav/footer.
 * Mounts a fixed-bottom variant switcher so reviewers can hop between
 * variants and toggle light/dark without leaving the page.
 *
 * The layout is a passthrough — variant pages render their full-page
 * compositions inline (data-variant scope set at the page root).
 */
export const metadata: Metadata = {
  title: "Redesign · GWTH.ai",
  description:
    "Homepage redesign exploration. Four style variants for review on the redesign/impeccable-homepage branch.",
  robots: { index: false, follow: false },
}

export default function RedesignLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      {children}
      <VariantSwitcher />
    </>
  )
}
