import { NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import type { User as SupabaseUser } from "@supabase/supabase-js"
import { cookies } from "next/headers"
import { createAdminClient } from "@/lib/supabase/server"
import {
  applyBetaAccessGrantToUser,
  isUserGrantedBetaAccess,
} from "@/lib/billing/access"

const OAUTH_PROVISION_CLEANUP_WINDOW_MS = 10 * 60 * 1000

function authProvidersForUser(user: SupabaseUser): string[] {
  const provider = user.app_metadata?.provider
  const providers = user.app_metadata?.providers

  return [
    ...(typeof provider === "string" ? [provider] : []),
    ...(Array.isArray(providers)
      ? providers.filter((item): item is string => typeof item === "string")
      : []),
  ]
}

function hasOAuthProvider(user: SupabaseUser): boolean {
  const providers = authProvidersForUser(user)
  return providers.some((provider) => provider !== "email")
}

export function shouldDeleteUngrantedOAuthUser(
  user: SupabaseUser,
  now = new Date()
): boolean {
  if (!hasOAuthProvider(user)) return false

  const createdAt = Date.parse(user.created_at)
  if (!Number.isFinite(createdAt)) return false

  const ageMs = now.getTime() - createdAt
  return ageMs >= 0 && ageMs <= OAUTH_PROVISION_CLEANUP_WINDOW_MS
}

async function deleteUngrantedOAuthUserIfNew(
  admin: ReturnType<typeof createAdminClient>,
  user: SupabaseUser
) {
  if (!shouldDeleteUngrantedOAuthUser(user)) return

  try {
    await admin.auth.admin.deleteUser(user.id)
  } catch {
    // Access is still denied below; cleanup failure must not admit the user.
  }
}

/**
 * Auth callback route handler. Supabase redirects here after email
 * confirmation or OAuth. Beta access is invite-only: the callback signs out
 * users whose email/user id has not been manually granted. Newly
 * auto-provisioned OAuth users are deleted so first-login OAuth cannot create
 * a durable ungranted account during beta.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const next = searchParams.get("next") ?? "/dashboard"

  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          },
        },
      }
    )

    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      const admin = createAdminClient()
      const hasExistingGrant = user?.id
        ? await isUserGrantedBetaAccess(admin, user.id)
        : false
      const appliedEmailGrant =
        !hasExistingGrant && user?.id && user.email
          ? await applyBetaAccessGrantToUser(admin, user.id, user.email)
          : false

      if (hasExistingGrant || appliedEmailGrant) {
        return NextResponse.redirect(`${origin}${next}`)
      }

      if (user) {
        await deleteUngrantedOAuthUserIfNew(admin, user)
      }
      await supabase.auth.signOut()
      return NextResponse.redirect(`${origin}/login?error=beta_access_required`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`)
}
