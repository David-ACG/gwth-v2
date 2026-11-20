import type { Metadata } from "next"
import { WaitlistNext } from "@/components/marketing/waitlist-next/waitlist-next"
import { COURSE_OPENS_ON } from "@/lib/launch-date"

export const metadata: Metadata = {
  title: "Join the Waitlist",
  description:
    `The GWTH UK beta is invite-only. Leave your email and we'll email you when the course launches on ${COURSE_OPENS_ON}.`,
}

/**
 * Waitlist signup page, in the family look of the home page (waitlist-next/;
 * waitlist-fde/ is the page it replaced, kept as the backup). The destination
 * for every "Join the waitlist" button; invited testers are pointed on to
 * /signup, and from the day sales open the proxy sends this route there too.
 */
export default function WaitlistPage() {
  return <WaitlistNext />
}
