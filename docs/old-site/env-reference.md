# Environment Variables Reference — Old GWTH.ai (Compromised Server)

> Extracted from the compromised Hetzner server on 2026-02-20.
> **ALL secrets must be rotated before reuse.** The server was compromised with a crypto miner trojan.
> The actual .env.local with values is saved locally (gitignored) for reference only.

## Secrets That MUST Be Rotated

| Secret | Service | Dashboard URL | Action | v2 Equivalent |
|--------|---------|---------------|--------|---------------|
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Google Cloud Console | https://console.cloud.google.com/apis/credentials | Regenerate client secret | Same (Supabase uses these) |
| `BACKEND_GOOGLE_CLIENT_ID` / `BACKEND_GOOGLE_CLIENT_SECRET` | Google Cloud Console | Same project, second OAuth client | Regenerate | May not need separate backend client |
| `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` | GitHub Settings | https://github.com/settings/developers | Regenerate secret | Same (Supabase uses these) |
| `STRIPE_SECRET_KEY` | Stripe Dashboard | https://dashboard.stripe.com/apikeys | Roll API key | Same |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe Dashboard | Same | Roll key | Same |
| `STRIPE_WEBHOOK_SECRET` | Stripe Dashboard | https://dashboard.stripe.com/webhooks | Regenerate | New webhook endpoint |
| `MAILERSEND_API_KEY` | MailerSend | https://app.mailersend.com/api-tokens | Regenerate | Switching to Resend (new key) |
| `MAILERLITE_API_KEY` | MailerLite | https://app.mailerlite.com/integrations/api | Regenerate | Same |
| SSH keys on server | Local machine | `~/.ssh/` | Generate new key pair for new VM | New key for new VM |

## Secrets That Are Obsolete (v2 uses different tech)

| Old Secret | Old Service | v2 Replacement |
|------------|-------------|----------------|
| `DATABASE_URL` (PostgreSQL local) | Local PostgreSQL | Supabase managed PostgreSQL |
| `BETTER_AUTH_SECRET` | Better Auth | Supabase Auth (no secret needed) |
| `NEXTAUTH_SECRET` / `NEXTAUTH_URL` | NextAuth (already deprecated in v1) | Supabase Auth |
| `CLERK_SECRET_KEY` / `CLERK_PUBLISHABLE_KEY` | Clerk (already deprecated in v1) | Supabase Auth |

## Stripe Product/Price IDs (May Still Be Valid)

These don't need rotation (they're identifiers, not secrets), but verify they're still active:

| ID | Purpose |
|----|---------|
| `prod_SexQdJ035Pbja8` | GWTH Months 1-3 product |
| `prod_SexR7DSZPs3e60` | GWTH After 3 Months product |
| `price_1RjdVMAoJchMxUsK8483FA9g` | Months 1-3 price ($37.50/mo) |
| `price_1RjdWoAoJchMxUsK1sxLRNU4` | After 3 Months price ($7.50/mo) |
| `prod_SxQ5Z25xGZTssi` | Beta Months 1-3 product |
| `prod_SxQ7uvqC4wyP8a` | Beta After 3 Months product |
| `price_1S1VFgAoJchMxUsK3w6bKoQk` | Beta Months 1-3 price |
| `price_1S1VGpAoJchMxUsKx22F3Jri` | Beta After 3 Months price |

## v2 Environment Variables (New)

These will be needed for the new build (values TBD):

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Stripe (rotated keys)
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=

# Email
RESEND_API_KEY=
MAILERLITE_API_KEY=

# Monitoring
NEXT_PUBLIC_SENTRY_DSN=
SENTRY_AUTH_TOKEN=

# Video
VIDEO_SIGNING_SECRET=
VIDEO_BASE_URL=https://video.gwth.ai
```

## MailerLite Group ID

`MAILERLITE_GROUP_ID=153050394844464755` — this is the subscriber group for the GWTH mailing list. Check if still valid after API key rotation.
