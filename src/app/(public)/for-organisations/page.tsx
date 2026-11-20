import type { Metadata } from "next"
import { ForOrganisationsNext } from "@/components/marketing/for-organisations-next/for-organisations-next"
import type { Audience } from "@/components/marketing/for-organisations-next/data"
import { ENABLE_GWTH_SCORE } from "@/lib/config"
import { isSelling } from "@/lib/launch"
import { COURSE_OPENS_ON } from "@/lib/launch-date"

export const metadata: Metadata = {
  title: "For organisations",
  description:
    `GWTH is a practical AI course for work and everyday life in the UK. Professional bodies, colleges and training providers can run their own edition before their specialist courses, with their own lessons and pass mark. Employers can buy places for a team from ${COURSE_OPENS_ON}.`,
  alternates: {
    canonical: "/for-organisations",
  },
}

/** `?for=team` opens the page on the team choice; anything else, institutions. */
function audienceFrom(value: string | string[] | undefined): Audience {
  const first = Array.isArray(value) ? value[0] : value
  return first === "team" || first === "teams" ? "team" : "institution"
}

/**
 * /for-organisations: one page for the two kinds of organisation that buy
 * GWTH for other people. It replaced /for-teams and /for-institutions on
 * 19 Nov 2026 (David: "I think we can consolidate the For teams and For
 * institutions into one page"); the reasoning is on the component.
 *
 * `isSelling()` is read here, per request (the (public) layout is
 * force-dynamic), so only the buttons change on 14 December.
 *
 * The score and project marking are described as on the home page, in the
 * present tense (David, 19 Nov 2026: the public pages show the course as it
 * will be at launch). The PUBLIC score page is a separate claim and stays
 * behind ENABLE_GWTH_SCORE, as it did on /for-institutions.
 */
export default async function ForOrganisationsPage({
  searchParams,
}: {
  searchParams?: Promise<{ for?: string | string[] }>
}) {
  const params = searchParams ? await searchParams : {}
  return (
    <ForOrganisationsNext
      selling={isSelling()}
      showScore
      markingLive
      publicScore={ENABLE_GWTH_SCORE}
      audience={audienceFrom(params.for)}
    />
  )
}
