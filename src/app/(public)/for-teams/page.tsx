import type { Metadata } from "next"
import { ForTeamsFde } from "@/components/marketing/for-teams-fde/for-teams-fde"
import { ENABLE_GWTH_SCORE } from "@/lib/config"
import { isSelling } from "@/lib/launch"

export const metadata: Metadata = {
  title: "AI training for teams",
  // Launch readiness review, 2026-10-21: the old description promised
  // "progress reporting" and "starter pricing". This one says who the page is
  // for and what it costs, with no feature a team does not get.
  description:
    "GWTH is a practical AI course for work and everyday life in the UK. From 1 December 2026, each person can subscribe monthly, or you can buy them a place with one payment.",
}

/**
 * /for-teams: for a manager or company buying places on the standard course
 * for a team. /for-institutions is the other buyer: a professional body or
 * large organisation commissioning an edition of its own.
 *
 * `isSelling()` is read here, per request (the (public) layout is
 * force-dynamic), and passed down, so only the buttons change on 1 December.
 */
export default function ForTeamsPage() {
  return <ForTeamsFde selling={isSelling()} showScore={ENABLE_GWTH_SCORE} />
}
