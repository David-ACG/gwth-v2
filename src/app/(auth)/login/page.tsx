import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { LoginForm } from "@/components/auth/login-form"
import { getSessionEmail } from "@/lib/auth"
import { getEnabledOAuthProviders } from "@/lib/oauth-providers"
import { safeNextPath } from "@/lib/safe-next"

export const metadata: Metadata = {
  title: "Log In",
  description: "Sign in to your GWTH.ai account.",
}

/** Props for {@link LoginPage}. */
interface LoginPageProps {
  /** `next`: the same-site page to open after signing in (review links). */
  searchParams: Promise<{ next?: string | string[] }>
}

/**
 * Log-in page. With `?next=/some/page` it returns there after sign-in, and a
 * visitor who is already signed in goes straight there, so one link works
 * for a reviewer whether or not they are signed in on that device.
 */
export default async function LoginPage({ searchParams }: LoginPageProps) {
  const next = safeNextPath((await searchParams).next)
  if (next && (await getSessionEmail())) redirect(next)

  // Only providers with a registered app (client id + secret in the env) get
  // a social button; the rest used to render anyway and 500 on click (W15).
  return <LoginForm oauthProviders={getEnabledOAuthProviders()} next={next ?? undefined} />
}
