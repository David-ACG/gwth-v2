import type { Metadata } from "next"
import { WhyGwthFde } from "@/components/marketing/why-gwth-fde/why-gwth-fde"

export const metadata: Metadata = {
  title: "Why GWTH | Beyond the Government AI Skills Boost",
  description:
    "The UK government's AI Skills Boost covers the basics. GWTH.ai goes further with structured applied AI lessons, practical projects, vendor-neutral training, and enterprise transformation.",
}

/**
 * Why GWTH comparison page.
 * Provides a factual, evidence-based comparison between the UK government's
 * AI Skills Boost programme and GWTH.ai, using real press quotes and
 * statistics. Presentation lives in the FDE journal-register component.
 */
export default function WhyGwthPage() {
  return (
    <>
      {/* JSON-LD structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: "Why GWTH | Beyond the Government AI Skills Boost",
            description:
              "The UK government's AI Skills Boost covers the basics. GWTH.ai goes further with structured applied AI lessons, practical projects, vendor-neutral training, and enterprise transformation.",
            url: "https://gwth.ai/why-gwth",
            provider: {
              "@type": "Organization",
              name: "GWTH.ai",
              url: "https://gwth.ai",
            },
          }),
        }}
      />
      <WhyGwthFde />
    </>
  )
}
