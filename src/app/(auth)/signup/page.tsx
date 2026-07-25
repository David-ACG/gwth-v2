import type { Metadata } from "next"
import { headers } from "next/headers"
import { SignupForm } from "@/components/auth/signup-form"
import { SignupClosedNotice } from "@/components/auth/signup-closed-notice"
import { getEnabledOAuthProviders } from "@/lib/oauth-providers"
import { isPrivateContentMode } from "@/lib/content-mode"

export const metadata: Metadata = {
  title: "Invite-only Beta",
  description: "The beta is invite-only. Join the waitlist or sign up with an approved email.",
}

/**
 * Which panel renders depends on a RUNTIME env value, so this route must not
 * be prerendered. /signup was in `.next/prerender-manifest.json` before W25,
 * which would have frozen whichever branch the build machine saw — leaving the
 * closed notice on the page permanently after `PRIVATE_CONTENT_MODE=off`, with
 * the API happily accepting signups behind it.
 */
export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function SignupPage() {
  // Belt to the force-dynamic braces: a dynamic API read makes prerendering
  // structurally impossible, not merely configured away.
  await headers()

  // While the site is private there is nothing to register for, and the API
  // would reject the attempt anyway (better-auth disableSignUp, set from the
  // same flag). Show honest copy instead of a form that cannot succeed.
  if (isPrivateContentMode()) return <SignupClosedNotice />

  // Invited testers register here with the email GWTH approved; the create
  // hook applies the grant. OAuth buttons appear only for providers with a
  // registered app (W15 guard), same as /login.
  return <SignupForm oauthProviders={getEnabledOAuthProviders()} />
}
