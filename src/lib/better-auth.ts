/**
 * Better Auth instance (W11 — Supabase Auth → Better Auth migration, Phase 1).
 *
 * Self-hosted Better Auth (sessions in Postgres via the Drizzle adapter). The
 * instance is constructed LAZILY — mirroring `getDb()` in `src/db/index.ts` — so
 * importing this module never touches the database. In mock mode (no
 * `DATABASE_URL`) the app can import this file freely; `getAuth()` only resolves
 * the DB when actually called (e.g. from the `/api/auth/[...all]` handler).
 *
 * D-W11-1: lives here (NOT `src/lib/auth.ts`, which is refactored later).
 * D-W11-3: canonical user table is `public."user"` (text ids).
 * D-W11-4: default table names user/session/account/verification (camelCase cols).
 *
 * Proxy-safe config: the app sits behind Cloudflare → Traefik → Next, so node
 * sees plain http while the public origin is https. A STATIC public `baseURL`
 * (`BETTER_AUTH_URL`) keeps URL/cookie generation correct without trusting any
 * forwarded proxy headers.
 *
 * Required env (see .env.local.example):
 * - BETTER_AUTH_SECRET, BETTER_AUTH_URL (public https)
 * - GOOGLE_/GITHUB_/LINKEDIN_ CLIENT_ID + CLIENT_SECRET
 * - PLUNK_API_KEY (transactional email)
 */
import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { getDb, schema } from "@/db"
import { sendPlunkEmail } from "@/lib/email/plunk"

// Construct the instance. Kept as a standalone builder so its concrete return
// type (carrying the exact options shape) drives `Auth` — using the generic
// `ReturnType<typeof betterAuth>` (i.e. Auth<BetterAuthOptions>) would widen and
// fail to assign here.
function buildAuth() {
  return betterAuth({
    baseURL: process.env.BETTER_AUTH_URL,
    secret: process.env.BETTER_AUTH_SECRET,
    database: drizzleAdapter(getDb(), {
      provider: "pg",
      schema,
    }),
    trustedOrigins: [
      "https://gwth.ai",
      "http://192.168.178.50:3001",
      "http://localhost:3000",
    ],
    advanced: {
      useSecureCookies: true,
      defaultCookieAttributes: {
        sameSite: "lax",
        secure: true,
        httpOnly: true,
        path: "/",
      },
    },
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: true,
      revokeSessionsOnPasswordReset: true,
      sendResetPassword: async ({ user, url }) => {
        await sendPlunkEmail({
          to: user.email,
          subject: "Reset your GWTH.ai password",
          body: `<p>Hi ${user.name || "there"},</p>
<p>We received a request to reset your GWTH.ai password. Click the link below to choose a new one:</p>
<p><a href="${url}">Reset your password</a></p>
<p>If you didn't request this, you can safely ignore this email.</p>`,
        })
      },
    },
    emailVerification: {
      sendOnSignUp: true,
      autoSignInAfterVerification: true,
      sendVerificationEmail: async ({ user, url }) => {
        await sendPlunkEmail({
          to: user.email,
          subject: "Verify your GWTH.ai email",
          body: `<p>Hi ${user.name || "there"},</p>
<p>Welcome to GWTH.ai. Please confirm your email address by clicking the link below:</p>
<p><a href="${url}">Verify your email</a></p>
<p>If you didn't create this account, you can safely ignore this email.</p>`,
        })
      },
    },
    socialProviders: {
      google: {
        clientId: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      },
      github: {
        clientId: process.env.GITHUB_CLIENT_ID!,
        clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      },
      linkedin: {
        clientId: process.env.LINKEDIN_CLIENT_ID!,
        clientSecret: process.env.LINKEDIN_CLIENT_SECRET!,
      },
    },
  })
}

type Auth = ReturnType<typeof buildAuth>

// Cache the instance across hot reloads / module re-evaluations, matching the
// getDb() singleton pattern so we don't rebuild the auth context per request.
const globalForAuth = globalThis as unknown as {
  __gwthAuth?: Auth
}

/**
 * Returns the shared Better Auth instance, constructing it on first use.
 * `buildAuth()` calls `getDb()` lazily — so this throws "DATABASE_URL is not
 * configured" only when actually invoked in mock mode, never at import time.
 */
export function getAuth(): Auth {
  if (globalForAuth.__gwthAuth) return globalForAuth.__gwthAuth
  const auth = buildAuth()
  globalForAuth.__gwthAuth = auth
  return auth
}
