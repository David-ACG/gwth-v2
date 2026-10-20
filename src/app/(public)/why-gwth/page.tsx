import type { Metadata } from "next"
import { WhyGwthFde } from "@/components/marketing/why-gwth-fde/why-gwth-fde"
import { isSelling } from "@/lib/launch"

const TITLE = "Why GWTH"

export const metadata: Metadata = {
  title: TITLE,
  description:
    "Why learn AI with GWTH: a UK-first course for work and everyday life, with plain English, independent advice and up-to-date lessons, hands-on projects, optional lessons for your field, and how it compares with the government's AI Skills Boost.",
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
      {/* Read at request time (the (public) layout is force-dynamic), so
          the buttons switch to buying on 1 December by themselves. */}
      <WhyGwthFde selling={isSelling()} />
    </>
  )
}
