import type { Metadata } from "next"
import { headers } from "next/headers"
import { SignupClosedNotice } from "@/components/auth/signup-closed-notice"
import { getEnabledOAuthProviders } from "@/lib/oauth-providers"
import { isPrivateContentMode } from "@/lib/content-mode"
import { ENABLE_BILLING } from "@/lib/config"
import { isSalesOpen } from "@/lib/billing/passes"
import { safeNextPath } from "@/lib/safe-next"
import { PostBetaSignupForm, SignupForm } from "@/components/auth/signup-form"

/**
 * Sign-up opens to everyone once sales open (decision 6, 2026-10-19: the
 * £29-a-month sign-up and the gift sale both open on 1 December). Until then
 * it stays the invite-only beta form.
 */
function isPublicSignup(now = new Date()): boolean {
  return ENABLE_BILLING && isSalesOpen(now)
}

/**
 * Metadata branches on the same flag as the body. A static export would leave
 * the tab title reading "Invite-only Beta" and the description inviting the
 * reader to "sign up with an approved email" on a page that has no form and an
 * API that answers 400 (W25).
 */
export async function generateMetadata(): Promise<Metadata> {
  if (isPrivateContentMode()) {
    return {
      title: "Registration closed",
      description:
        "New accounts are paused while the course is finished. Join the waitlist and we will write to you when places open.",
    }
  }
  if (isPublicSignup()) {
    return {
      title: "Create your account",
      description: "Create a GWTH account to join the course or open a gift.",
    }
  }
  return {
    title: "Create your account",
    description: "Sign-up opens to everyone on 1 December 2026. Join the waitlist to hear when it does.",
  }
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

export default async function SignupPage({
  searchParams,
}: {
  searchParams?: Promise<{ next?: string | string[] }>
}) {
  // Belt to the force-dynamic braces: a dynamic API read makes prerendering
  // structurally impossible, not merely configured away.
  await headers()

  // While the site is private there is nothing to register for, and the API
  // would reject the attempt anyway (better-auth disableSignUp, set from the
  // same flag). Show honest copy instead of a form that cannot succeed.
  if (isPrivateContentMode()) return <SignupClosedNotice />

  const raw = (await searchParams)?.next
  const next = safeNextPath(Array.isArray(raw) ? raw[0] : raw)

  if (isPublicSignup()) {
    return <PostBetaSignupForm oauthProviders={getEnabledOAuthProviders()} next={next} />
  }

  // Invited testers register here with the email GWTH approved; the create
  // hook applies the grant. OAuth buttons appear only for providers with a
  // registered app (W15 guard), same as /login.
  return <SignupForm oauthProviders={getEnabledOAuthProviders()} next={next} />
}
