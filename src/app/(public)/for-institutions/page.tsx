import type { Metadata } from "next"
import { ForInstitutionsFde } from "@/components/marketing/for-institutions-fde/for-institutions-fde"

export const metadata: Metadata = {
  title: "The AI baseline before your specialist courses",
  description:
    "Learners arrive at UK professional courses with very different applied AI understanding, so tutors level the room before the subject starts. GWTH is the three-month foundation that runs first: you choose the lessons and the pass mark, your tutors see verified evidence that a learner met it, and records arrive shaped for continuing professional development (CPD).",
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
 * documented on the component.
 */
export default function ForInstitutionsPage() {
  return <ForInstitutionsFde />
}
