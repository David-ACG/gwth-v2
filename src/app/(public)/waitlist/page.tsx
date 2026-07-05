import type { Metadata } from "next"
import { WaitlistFde } from "@/components/marketing/waitlist-fde/waitlist-fde"

export const metadata: Metadata = {
  title: "Join the Waitlist",
  description:
    "The GWTH beta is invite-only. Leave your email and we will contact you when more beta places open.",
}

/**
 * Waitlist signup page in the FDE journal register. The destination for
 * every "Join waitlist" CTA; invited testers are pointed on to /signup.
 */
export default function WaitlistPage() {
  return <WaitlistFde />
}
