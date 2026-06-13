import type { Metadata } from "next"
import { AboutFde } from "@/components/marketing/about-fde/about-fde"

export const metadata: Metadata = {
  title: "About",
  description:
    "GWTH.ai is an independent UK-focused applied AI course built by practitioners, with practical projects and progress evidence that reflects current skill.",
}

/**
 * Public about page in the FDE journal register.
 * Course philosophy, principles, lesson process, and headline numbers.
 */
export default function AboutPage() {
  return <AboutFde />
}
