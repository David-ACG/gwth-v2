import type { Metadata } from "next"
import { ForTeamsFde } from "@/components/marketing/for-teams-fde/for-teams-fde"

export const metadata: Metadata = {
  title: "AI Training for UK Teams",
  description:
    "A light UK teams path for applied AI training. Beginner-to-advanced lessons, practical projects, progress reporting, and £29/month starter pricing in GBP.",
}

/**
 * /for-teams — B2B landing page in the FDE journal register.
 * Stats, time-cost framing, differentiators, syllabus control, investment,
 * FAQ, and CTA.
 */
export default function ForTeamsPage() {
  return <ForTeamsFde />
}
