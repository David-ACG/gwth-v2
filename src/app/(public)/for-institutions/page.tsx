import type { Metadata } from "next"
import { ForInstitutionsFde } from "@/components/marketing/for-institutions-fde/for-institutions-fde"

export const metadata: Metadata = {
  title: "AI foundations for professional institutions",
  description:
    "A professional body runs GWTH as its own edition: curated lessons in core, optional and exclusive tiers, a pass mark it sets, a tutor baseline view, CPD-ready verified records, and independent vendor-neutral content.",
}

/**
 * /for-institutions: the institution-first proposition (N12, 2026-09-03),
 * in the paper-first register. Public route; the private-content gate does
 * not apply to marketing pages.
 */
export default function ForInstitutionsPage() {
  return <ForInstitutionsFde />
}
