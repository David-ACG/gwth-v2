# OAuth Social Login — Google, GitHub, LinkedIn

## Goal

Add "Continue with Google / GitHub / LinkedIn" buttons to the signup and login pages, using Supabase Auth's native OAuth support. All three providers use the same `/auth/callback` route we already have.

## Prerequisites (David — manual setup in provider dashboards)

### 1. Google OAuth Credentials

- Go to [Google Cloud Console > OAuth Clients](https://console.cloud.google.com/auth/clients)
- Create a **Web application** OAuth 2.0 Client ID
- **Authorized JavaScript origins:** `http://localhost:3000`, `https://gwth.ai`
- **Authorized redirect URI:** `https://zdhnwxknovzdnxgvwykt.supabase.co/auth/v1/callback`
- Copy the **Client ID** and **Client Secret**
- In Supabase Dashboard > Authentication > Providers > Google: enable, paste credentials

### 2. GitHub OAuth Credentials

- Go to [GitHub Developer Settings > OAuth Apps](https://github.com/settings/developers)
- Create a new OAuth App
- **Homepage URL:** `https://gwth.ai`
- **Authorization callback URL:** `https://zdhnwxknovzdnxgvwykt.supabase.co/auth/v1/callback`
- Copy the **Client ID** and generate + copy the **Client Secret**
- In Supabase Dashboard > Authentication > Providers > GitHub: enable, paste credentials

### 3. LinkedIn OIDC Credentials

- Go to [LinkedIn Developer Dashboard](https://www.linkedin.com/developers/apps)
- Create an app (requires a LinkedIn Company Page)
- Under **Products** tab: request access to **"Sign In with LinkedIn using OpenID Connect"**
- Under **Auth** tab, add redirect URL: `https://zdhnwxknovzdnxgvwykt.supabase.co/auth/v1/callback`
- Verify scopes include `openid`, `profile`, `email`
- Copy the **Client ID** and **Client Secret**
- In Supabase Dashboard > Authentication > Providers > **LinkedIn (OIDC)**: enable, paste credentials

### 4. Supabase Redirect URL Allow List

- In Supabase Dashboard > Authentication > URL Configuration
- Add to **Redirect URLs**:
  - `http://localhost:3000/auth/callback`
  - `https://gwth.ai/auth/callback`

## Implementation Steps

### Step 1: Create `OAuthButtons` client component — `src/components/auth/oauth-buttons.tsx`

A reusable client component with three social login buttons (Google, GitHub, LinkedIn). Uses the **browser** Supabase client (`@/lib/supabase/client`) to call `signInWithOAuth()`.

```tsx
"use client";
import { createClient } from "@/lib/supabase/client";

// Provider config:
// - google → provider: "google"
// - github → provider: "github"
// - linkedin → provider: "linkedin_oidc" (NOT "linkedin")

// Each button calls:
supabase.auth.signInWithOAuth({
  provider,
  options: {
    redirectTo: `${window.location.origin}/auth/callback`,
  },
});
```

**Design:**

- Three full-width outline buttons with provider SVG icons (not lucide — use official brand SVGs)
- Loading state per-button while redirect is happening
- Error handling with toast notification
- Separated from email form with an "or" divider

**Icons:** Use inline SVGs for Google (colored G), GitHub (octocat), and LinkedIn (in logo). Store as small components in the same file or as constants — no external icon library needed for brand logos.

### Step 2: Add OAuth buttons to signup form — `src/components/auth/signup-form.tsx`

Insert `<OAuthButtons />` above the email/password form with a visual divider:

```
[Continue with Google]
[Continue with GitHub]
[Continue with LinkedIn]

──── or continue with email ────

Name: [________]
Email: [________]
Password: [________]
Confirm: [________]
[Create Account]
```

### Step 3: Add OAuth buttons to login form — `src/components/auth/login-form.tsx`

Same pattern — `<OAuthButtons />` above the email/password form:

```
[Continue with Google]
[Continue with GitHub]
[Continue with LinkedIn]

──── or continue with email ────

Email: [________]
Password: [________]
[Log In]
```

### Step 4: Handle OAuth user metadata in `getCurrentUser()` — `src/lib/auth.ts`

OAuth providers return different metadata shapes. Update the user mapping to handle:

- **Google:** `user.user_metadata.full_name`, `user.user_metadata.avatar_url`
- **GitHub:** `user.user_metadata.user_name` or `user.user_metadata.full_name`, `user.user_metadata.avatar_url`
- **LinkedIn OIDC:** `user.user_metadata.full_name`, `user.user_metadata.picture`

The current mapping already falls back to `user.email?.split("@")[0]` for name, but we should also grab avatar URLs when available.

### Step 5: Update auth callback to handle error query params — `src/app/auth/callback/route.ts`

The existing callback already works for OAuth (same code exchange flow). Just verify it handles the `error` and `error_description` query params that Supabase may send on OAuth failure.

### Step 6: Update `.env.local.example`

Document that OAuth provider credentials are configured in the Supabase Dashboard (not in env vars) and that `NEXT_PUBLIC_SITE_URL` is used for redirect URLs.

## Files Created

- `src/components/auth/oauth-buttons.tsx`

## Files Modified

- `src/components/auth/signup-form.tsx` — add OAuthButtons + divider
- `src/components/auth/login-form.tsx` — add OAuthButtons + divider
- `src/lib/auth.ts` — improve avatar_url extraction from OAuth metadata
- `src/app/auth/callback/route.ts` — handle OAuth error params
- `.env.local.example` — document OAuth setup

## No Backend Changes Needed

- OAuth uses the same Supabase Auth system — no new tables, no new RLS policies
- The existing `/auth/callback` route handles all providers (email confirmation + OAuth)
- The existing middleware session refresh works with OAuth sessions identically

## Verification

1. Click "Continue with Google" on `/signup` → Google consent → redirected to `/dashboard` with session
2. Click "Continue with GitHub" on `/login` → GitHub authorize → redirected to `/dashboard`
3. Click "Continue with LinkedIn" on `/signup` → LinkedIn consent → redirected to `/dashboard`
4. OAuth user's name and avatar appear in dashboard header
5. Signing out clears the OAuth session
6. Existing email/password login still works alongside OAuth
7. `npm run build` — no type errors
