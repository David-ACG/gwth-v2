import type { Metadata } from "next"
import { AboutFde } from "@/components/marketing/about-fde/about-fde"

export const metadata: Metadata = {
  title: "About",
  description:
    "GWTH.ai is an independent applied AI course written for the UK, built by a solution architect with 25 years of experience, with practical projects and progress evidence that reflects current skill.",
}

/**
 * Public about page in the paper-first register: what the course is, who
 * writes it, the principles it holds to, where the UK actually stands in AI,
 * and the headline numbers.
 */
export default function AboutPage() {
  return <AboutFde />
}
