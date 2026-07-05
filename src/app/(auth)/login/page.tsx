import type { Metadata } from "next"
import { LoginForm } from "@/components/auth/login-form"
import { getEnabledOAuthProviders } from "@/lib/oauth-providers"

export const metadata: Metadata = {
  title: "Log In",
  description: "Sign in to your GWTH.ai account.",
}

export default function LoginPage() {
  // Only providers with a registered app (client id + secret in the env) get
  // a social button; the rest used to render anyway and 500 on click (W15).
  return <LoginForm oauthProviders={getEnabledOAuthProviders()} />
}
