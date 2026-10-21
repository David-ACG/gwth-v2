import type { Metadata } from "next"
import { ForInstitutionsFde } from "@/components/marketing/for-institutions-fde/for-institutions-fde"

export const metadata: Metadata = {
  title: "Practical AI before your specialist courses",
  description:
    "A three-month practical AI course for UK professional bodies and large employers to put before their own courses. Choose which optional lessons are required, set the quiz pass mark, and see who has completed the required lessons and passed their quizzes.",
}

/**
 * /for-institutions: the institution-first proposition (N12, 2026-09-03), in
 * the paper-first register. Public route; the private-content gate does not
 * apply to marketing pages.
 *
 * The page leads on the prerequisite proposition (David's annotation
 * a-20260914-202954-1ef966): an institution buys GWTH so its specialist
 * courses can start at their intended level. The reasoning, the meeting
 * evidence behind it and the claims it deliberately does not make are
 * documented on the component, with the launch readiness rewrite of
 * 2026-10-21 (bead gwth-launch-ajqs.2).
 */
export default function ForInstitutionsPage() {
  return <ForInstitutionsFde />
}
