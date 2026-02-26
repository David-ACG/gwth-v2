import type { Metadata } from "next"
import { SignupForm } from "@/components/auth/signup-form"

export const metadata: Metadata = {
  title: "Join the Waitlist",
  description: "Create a free account and be first to access the course when it launches.",
}

export default function SignupPage() {
  return <SignupForm />
}
