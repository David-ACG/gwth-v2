import type { Metadata } from "next"
import { NewsletterFde } from "@/components/marketing/newsletter-fde/newsletter-fde"

export const metadata: Metadata = {
  title: "Newsletter",
  description:
    "The GWTH Weekly: one email per week with a practical AI tip, useful tool notes, and course previews. No spam. No sales pressure.",
}

/**
 * Newsletter signup page in the FDE journal register.
 * Presents the GWTH Weekly value proposition and a stubbed email signup form.
 */
export default function NewsletterPage() {
  return <NewsletterFde />
}
