/**
 * OAuth provider availability (W15 beta polish).
 *
 * No provider app has been registered yet (the David-only residual from
 * COMPLETION_W11), so clicking any social button hits Better Auth with no
 * credentials and fails. The auth pages therefore only offer a provider whose
 * client id AND secret are present in the env: register the app, set the two
 * env vars, and the button reappears with no code change.
 */

/** Social providers the auth surfaces can offer. */
export type OAuthProviderId = "google" | "github" | "linkedin"

/** All supported providers, in display order. */
export const ALL_OAUTH_PROVIDERS: readonly OAuthProviderId[] = [
  "google",
  "github",
  "linkedin",
]

/** Env-var prefix per provider (`<PREFIX>_CLIENT_ID` / `<PREFIX>_CLIENT_SECRET`). */
const PROVIDER_ENV_PREFIX: Record<OAuthProviderId, string> = {
  google: "GOOGLE",
  github: "GITHUB",
  linkedin: "LINKEDIN",
}

/**
 * Returns the providers whose client id and secret are both configured.
 *
 * Server-only: reads non-public env vars, so call it from Server Components
 * (e.g. the login page) and pass the result down as a prop. The `env`
 * parameter exists for tests.
 */
export function getEnabledOAuthProviders(
  env: Record<string, string | undefined> = process.env
): OAuthProviderId[] {
  return ALL_OAUTH_PROVIDERS.filter((id) => {
    const prefix = PROVIDER_ENV_PREFIX[id]
    return Boolean(env[`${prefix}_CLIENT_ID`]) && Boolean(env[`${prefix}_CLIENT_SECRET`])
  })
}
