import type { Metadata } from "next"
import { SignupForm } from "@/components/auth/signup-form"

export const metadata: Metadata = {
  title: "Invite-only Beta",
  description: "The 23 June beta is invite-only. Join the waitlist or log in with an approved email.",
}

export default function SignupPage() {
  return <SignupForm />
}
