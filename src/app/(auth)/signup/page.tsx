import type { Metadata } from "next"
import { SignupForm } from "@/components/auth/signup-form"
import { getEnabledOAuthProviders } from "@/lib/oauth-providers"

export const metadata: Metadata = {
  title: "Invite-only Beta",
  description: "The beta is invite-only. Join the waitlist or sign up with an approved email.",
}

export default function SignupPage() {
  // Invited testers register here with the email GWTH approved; the create
  // hook applies the grant. OAuth buttons appear only for providers with a
  // registered app (W15 guard), same as /login.
  return <SignupForm oauthProviders={getEnabledOAuthProviders()} />
}
