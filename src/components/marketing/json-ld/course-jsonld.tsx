/**
 * Schema.org Course JSON-LD for the GWTH.ai homepage.
 *
 * Payload preserved verbatim from the previous (public)/page.tsx:113-128
 * implementation so search engines see no schema regression during the
 * Phase 1b homepage rebuild. Snapshot test in
 * `course-jsonld.test.tsx` pins the JSON to catch any accidental drift.
 *
 * `dangerouslySetInnerHTML` is permitted only in this component (and
 * future JsonLd siblings) — see src/components/marketing/README.md.
 */

const COURSE_JSON_LD_PAYLOAD = {
  "@context": "https://schema.org",
  "@type": "Course",
  name: "GWTH — Applied AI Skills",
  description:
    "Learn to build apps, automate workflows, and solve real problems using AI. 94 hands-on projects across 3 months. No coding required.",
  provider: {
    "@type": "Organization",
    name: "GWTH.ai",
    url: "https://gwth.ai",
  },
} as const

export function CourseJsonLd() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(COURSE_JSON_LD_PAYLOAD),
      }}
    />
  )
}
