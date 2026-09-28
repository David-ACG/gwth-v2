import type { Metadata } from "next"
import { WhyGwthFde } from "@/components/marketing/why-gwth-fde/why-gwth-fde"

const TITLE = "Why GWTH"

export const metadata: Metadata = {
  title: TITLE,
  description:
    "Why UK adults learn AI with GWTH: plain English, independent advice, a course that is always up to date, hands-on projects, optional lessons for your field, and how it compares with the government's AI Skills Boost.",
}

/**
 * The one Why GWTH page. /about and /why-gwth were merged here on 2026-09-28
 * (David: "merge them into one Why GWTH page"), and /about permanently
 * redirects to this route from `next.config.ts`. Presentation lives in the
 * paper-first component.
 *
 * The description stays a literal in `metadata` because
 * `uk-thread.test.tsx` reads it from source.
 */
export default function WhyGwthPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: TITLE,
            description: metadata.description,
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
