import type { Metadata } from "next"
import {
  getTechRadarTools,
  getTechRadarCategories,
  getTechRadarToolCount,
  getTechRadarLastUpdated,
} from "@/lib/data/tech-radar"
import { TechRadarFde } from "@/components/marketing/tech-radar-fde/tech-radar-fde"

export const metadata: Metadata = {
  title: "Tech Radar",
  description:
    "Track 60+ AI tools daily with the GWTH Tech Radar. Independent reviews, no vendor partnerships. See what is GA, Beta, Alpha, and trending right now.",
  robots: { index: false, follow: false },
}

/**
 * Public Tech Radar page.
 * Server component that fetches tool data and passes it to the client-side
 * TechRadarFde for interactive filtering in the FDE journal register.
 */
export default function TechRadarPage() {
  const tools = getTechRadarTools()
  const categories = getTechRadarCategories()
  const toolCount = getTechRadarToolCount()
  const lastUpdated = getTechRadarLastUpdated()

  const formattedDate = new Date(lastUpdated).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })

  return (
    <>
      {/* JSON-LD structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: "GWTH Tech Radar",
            description:
              "Track 60+ AI tools daily. Independent reviews with no vendor partnerships.",
            provider: {
              "@type": "Organization",
              name: "GWTH.ai",
              url: "https://gwth.ai",
            },
          }),
        }}
      />
      <TechRadarFde
        tools={tools}
        categories={categories}
        toolCount={toolCount}
        formattedDate={formattedDate}
      />
    </>
  )
}
