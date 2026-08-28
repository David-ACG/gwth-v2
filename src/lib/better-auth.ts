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
import { APIError } from "better-auth/api"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { nextCookies } from "better-auth/next-js"
import { organization } from "better-auth/plugins/organization"
import { createAccessControl } from "better-auth/plugins/access"
import {
  defaultStatements,
  adminAc,
  ownerAc,
} from "better-auth/plugins/organization/access"
import { getDb, schema } from "@/db"
import { sendPlunkEmail } from "@/lib/email/plunk"
import { renderFdeEmail } from "@/lib/email/fde-layout"
import { toPublicEmailLink } from "@/lib/email/auth-links"
import {
  applyBetaAccessGrantToUser,
  isEmailGrantedBetaAccess,
} from "@/lib/billing/access"
import { isPrivateContentMode } from "@/lib/content-mode"
import { assertSingleOrgRole, OrgRoleError } from "@/lib/org-roles"

// ── N5: organization plugin roles (design 05 section 9, decisions 2026-08-28)
// owner  = the plugin's creator role. GWTH holds it for the institution orgs
//          we provision (org creation is gated to platform admins below).
// admin  = the institution/Teams admin (can invite, manage members, update
//          the org — Ben's "could we set a pass mark" persona).
// tutor  = read-only roster visibility (Steve's "send that to your tutor"
//          flow). No mutating permissions; the roster queries land in N7.
// learner= everyone else. No org permissions at all.
// The custom access controller replays the plugin's default statements so
// owner/admin keep their stock capabilities while tutor/learner exist as
// first-class (invitable, role-checkable) roles.
const orgAccessControl = createAccessControl(defaultStatements)
const orgRoles = {
  owner: orgAccessControl.newRole(ownerAc.statements),
  admin: orgAccessControl.newRole(adminAc.statements),
  tutor: orgAccessControl.newRole({}),
  learner: orgAccessControl.newRole({}),
}

/**
 * Whether an email is on the platform-admin allowlist (ADMIN_EMAILS).
 * Duplicated from src/lib/admin.ts on purpose: importing it here would create
 * the cycle better-auth.ts -> admin.ts -> auth.ts -> better-auth.ts. Unset or
 * empty allowlist means NOBODY can create organisations (fail closed).
 */
/**
 * Runs the single-role guard and converts its refusal into a clean
 * BAD_REQUEST APIError (N6, N5 QA defect 4). Without this, Better Auth's
 * comma-separated multi-role values ("tutor,admin") reach Postgres, fail the
 * 013 role CHECK, and surface as an unhandled 500 — see src/lib/org-roles.ts
 * for why single roles is the deliberate policy rather than a widened CHECK.
 */
function requireSingleOrgRole(
  role: string | string[] | null | undefined,
  opts: { invitation?: boolean } = {}
): void {
  try {
    assertSingleOrgRole(role, opts)
  } catch (error) {
    if (error instanceof OrgRoleError) {
      throw new APIError("BAD_REQUEST", { message: error.message })
    }
    throw error
  }
}

function isPlatformAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)
    .includes(email.trim().toLowerCase())
}

// Construct the instance. Kept as a standalone builder so its concrete return
// type (carrying the exact options shape) drives `Auth` — using the generic
// `ReturnType<typeof betterAuth>` (i.e. Auth<BetterAuthOptions>) would widen and
// fail to assign here.
function buildAuth() {
  // HIGH #4: without an explicit public baseURL, Better Auth derives the origin
  // from the internal http request (behind Cloudflare → Traefik), breaking OAuth
  // callbacks, email links and secure cookies (the D4 crisis class). Fail fast in
  // production so a missing env can never silently ship the wrong origin.
  const baseURL = process.env.BETTER_AUTH_URL
  if (process.env.NODE_ENV === "production" && !baseURL) {
    throw new Error(
      "BETTER_AUTH_URL must be set in production — without it Better Auth derives the origin from the internal http request behind Cloudflare→Traefik, breaking OAuth callbacks, email links and secure cookies (D4)."
    )
  }

  // HIGH #5: derive Secure from the public origin scheme rather than hardcoding
  // it. Hardcoded Secure cookies are dropped by browsers over the plain-http
  // staging origin (http://192.168.178.50:3001), so the session never persists
  // there and the mandated D4 smoke test can never pass. https prod → secure;
  // http staging → not secure → cookie persists. Mirrors site-access.ts:32.
  const isSecureOrigin = (process.env.BETTER_AUTH_URL ?? "").startsWith("https://")

  // W15: only register providers whose app credentials actually exist. A
  // provider registered with undefined credentials made /api/auth/sign-in/social
  // 500 (no app was ever registered; the COMPLETION_W11 David-only residual).
  // An absent provider is rejected cleanly instead, and the login page hides
  // its button via getEnabledOAuthProviders(). Setting the two env vars brings
  // the provider back untouched.
  const googleId = process.env.GOOGLE_CLIENT_ID
  const googleSecret = process.env.GOOGLE_CLIENT_SECRET
  const githubId = process.env.GITHUB_CLIENT_ID
  const githubSecret = process.env.GITHUB_CLIENT_SECRET
  const linkedinId = process.env.LINKEDIN_CLIENT_ID
  const linkedinSecret = process.env.LINKEDIN_CLIENT_SECRET

  // W25: no new accounts while the site is private. This is the API-layer
  // block, not a UI one — before it, /signup rendered invite-only COPY while
  // POST /api/auth/sign-up/email happily created a real account for anyone
  // (the gate was downstream in getCurrentUser(), so strangers got a valid
  // session and an invite-required dashboard). Sign-IN is untouched, so the
  // demo accounts still work.
  //
  // Two different property paths, verified against better-auth 1.6.19:
  // sign-up.mjs:143 reads `emailAndPassword.disableSignUp`, while the OAuth
  // path that actually creates users (callback.mjs:150) reads
  // `provider.options?.disableSignUp` — and the provider factory stores the
  // whole config object you pass as `.options`, so setting the key beside
  // clientId/clientSecret is what lands in the right place. The types declare
  // it at both levels, so tsc cannot catch getting this wrong.
  //
  // getAuth() caches the instance on globalThis, so this is read ONCE per
  // process: flipping PRIVATE_CONTENT_MODE needs a container restart, which
  // the Coolify redeploy that accompanies an env change already provides.
  const lockSignUp = isPrivateContentMode()

  return betterAuth({
    baseURL,
    secret: process.env.BETTER_AUTH_SECRET,
    database: drizzleAdapter(getDb(), {
      provider: "pg",
      schema,
    }),
    trustedOrigins: [
      "https://gwth.ai",
      "http://192.168.178.50:3001",
      "http://localhost:3000",
      // Extra origins for dev and review previews, comma-separated. Production
      // does not set this, so the list above is unchanged there. It exists
      // because a preview served over Tailscale (a different origin from the
      // one the server was started with) is rejected with INVALID_ORIGIN, and
      // the workaround was otherwise to hardcode a tailnet host in this
      // security-relevant list. Never point it at an origin you do not control.
      ...(process.env.AUTH_EXTRA_TRUSTED_ORIGINS ?? "")
        .split(",")
        .map((o) => o.trim())
        .filter(Boolean),
    ],
    advanced: {
      useSecureCookies: isSecureOrigin,
      defaultCookieAttributes: {
        sameSite: "lax",
        secure: isSecureOrigin,
        httpOnly: true,
        path: "/",
      },
    },
    // HIGH #3: enable OAuth account linking across our first-party providers. A
    // granted tester who first signs in with LinkedIn/GitHub (email reported
    // unverified by the provider) would otherwise be permanently locked out when
    // they later use a different provider — or even the same email/password —
    // because Better Auth refuses to link to an existing unverified-email user.
    account: {
      accountLinking: {
        enabled: true,
        trustedProviders: ["google", "github", "linkedin"],
      },
    },
    emailAndPassword: {
      enabled: true,
      disableSignUp: lockSignUp,
      requireEmailVerification: true,
      revokeSessionsOnPasswordReset: true,
      sendResetPassword: async ({ user, url }) => {
        const parts = renderFdeEmail({
          kicker: "Password reset",
          heading: `Reset your password, ${user.name || "there"}.`,
          blocks: [
            {
              type: "p",
              text: "We received a request to reset your GWTH.ai password. Use the button below to choose a new one.",
            },
            {
              type: "p",
              text: "If you didn't request this, you can safely ignore this email.",
            },
          ],
          cta: { label: "Reset your password", href: toPublicEmailLink(url) },
        })
        await sendPlunkEmail({
          to: user.email,
          subject: "Reset your GWTH.ai password",
          body: parts.html,
          text: parts.text,
        })
      },
    },
    emailVerification: {
      sendOnSignUp: true,
      // MEDIUM #8: re-issue + re-send the verification link when an unverified
      // user attempts to sign in. With requireEmailVerification: true, an
      // unverified user is rejected on every sign-in; without this they are
      // locked out if the single signup email never arrives.
      sendOnSignIn: true,
      autoSignInAfterVerification: true,
      sendVerificationEmail: async ({ user, url }) => {
        const parts = renderFdeEmail({
          kicker: "Confirm your email",
          heading: `Welcome to GWTH.ai, ${user.name || "there"}.`,
          blocks: [
            {
              type: "p",
              text: "Please confirm your email address using the button below to finish setting up your account.",
            },
            {
              type: "p",
              text: "If you didn't create this account, you can safely ignore this email.",
            },
          ],
          cta: { label: "Verify your email", href: toPublicEmailLink(url) },
        })
        await sendPlunkEmail({
          to: user.email,
          subject: "Verify your GWTH.ai email",
          body: parts.html,
          text: parts.text,
        })
      },
    },
    socialProviders: {
      ...(googleId && googleSecret
        ? {
            google: {
              clientId: googleId,
              clientSecret: googleSecret,
              disableSignUp: lockSignUp,
            },
          }
        : {}),
      ...(githubId && githubSecret
        ? {
            github: {
              clientId: githubId,
              clientSecret: githubSecret,
              disableSignUp: lockSignUp,
            },
          }
        : {}),
      ...(linkedinId && linkedinSecret
        ? {
            linkedin: {
              clientId: linkedinId,
              clientSecret: linkedinSecret,
              disableSignUp: lockSignUp,
            },
          }
        : {}),
    },
    databaseHooks: {
      user: {
        create: {
          // Invite-only beta gate (replaces the Supabase signIn-checks-and-
          // signs-out + OAuth-delete-ungranted logic). When a new account is
          // created (email/password OR social), if its email has a manual beta
          // grant we apply that grant to the new user id. Ungranted accounts
          // are NOT deleted — they get a valid session, but the access gate in
          // getCurrentUser() returns null for them, so they land on the
          // invite-required FreeDashboard view and can never reach gated
          // content. (The proxy guard only bounces anonymous, no-cookie traffic
          // to the bare /login — no ?error param is ever emitted.) This
          // deliberately drops the OAuth-deletion quirk.
          after: async (user) => {
            try {
              if (await isEmailGrantedBetaAccess(user.email)) {
                await applyBetaAccessGrantToUser(user.id, user.email)
              }
            } catch {
              // A grant-application failure must never block account creation;
              // the access gate still denies entry until a grant is applied.
            }
          },
        },
      },
    },
    // nextCookies() MUST be the LAST plugin: it flushes Set-Cookie headers from
    // Server Actions so server-side auth ops set the session cookie correctly.
    plugins: [
      // N5: org tenancy (institution pivot). The plugin's three models map
      // onto the UK-named tables from migration 013 via modelName; the field
      // names stay the plugin defaults because the Drizzle declarations in
      // src/db/auth-schema.ts carry the UK snake_case column names (the
      // adapter resolves `schema[modelName]`, so the modelName values MUST
      // equal the export names there: organisation/orgMembership/orgInvitation).
      organization({
        ac: orgAccessControl,
        roles: orgRoles,
        creatorRole: "owner",
        // GWTH provisions orgs (design: owner is held by GWTH); rank-and-file
        // users can never create one. Fail closed on an empty allowlist.
        allowUserToCreateOrganization: (user) =>
          isPlatformAdminEmail(user.email),
        schema: {
          organization: { modelName: "organisation" },
          member: { modelName: "orgMembership" },
          invitation: { modelName: "orgInvitation" },
        },
        // N6 (N5 QA defect 4): constrain the plugin to SINGLE roles before
        // anything reaches Postgres, so a multi-role assignment ("tutor,admin")
        // is a clean 400 with a message instead of a 23514 CHECK-violation 500.
        // The 013 single-role CHECKs stay as the DB backstop. Invitation-role
        // validation also refuses `owner` cleanly (invitations cannot grant it).
        organizationHooks: {
          beforeAddMember: async ({ member }) => {
            requireSingleOrgRole(member.role)
          },
          beforeUpdateMemberRole: async ({ newRole }) => {
            requireSingleOrgRole(newRole)
          },
          beforeCreateInvitation: async ({ invitation }) => {
            requireSingleOrgRole(invitation.role, { invitation: true })
          },
        },
        sendInvitationEmail: async (data) => {
          // The accept page is N7's build; this link shape is the Better Auth
          // convention the page will implement (invitation id in the path).
          const inviteUrl = `${process.env.BETTER_AUTH_URL ?? ""}/accept-invitation/${data.id}`
          const parts = renderFdeEmail({
            kicker: "You're invited",
            heading: `Join ${data.organization.name} on GWTH.ai`,
            blocks: [
              {
                type: "p",
                text: `${data.inviter.user.name || "A team admin"} has invited you to join ${data.organization.name} on GWTH.ai.`,
              },
              {
                type: "p",
                text: "If you weren't expecting this invitation, you can safely ignore this email.",
              },
            ],
            cta: { label: "Accept invitation", href: toPublicEmailLink(inviteUrl) },
          })
          await sendPlunkEmail({
            to: data.email,
            subject: `You're invited to join ${data.organization.name} on GWTH.ai`,
            body: parts.html,
            text: parts.text,
          })
        },
      }),
      nextCookies(),
    ],
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
