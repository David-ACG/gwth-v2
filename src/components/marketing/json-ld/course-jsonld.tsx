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
  name: "GWTH.ai Applied AI Course",
  description:
    "A three-month applied AI foundation for UK professionals and the institutions that serve them: research, content, thinking, building, data and automation, taught in plain English, assessed throughout, with a project in every lesson and a verified record at the end.",
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
