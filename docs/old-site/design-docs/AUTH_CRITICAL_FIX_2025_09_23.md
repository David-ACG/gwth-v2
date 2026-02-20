# CRITICAL AUTH FIX PLAN - PRODUCTION
**Created:** 2025-09-23 10:15:00 UTC
**Priority:** URGENT
**Environment:** Production Server (195.201.177.66)

## IDENTIFIED ROOT CAUSES

### 1. **Missing Trust Proxy Configuration (CRITICAL)**
- Server behind Nginx proxy but Better Auth not configured to trust proxy headers
- Causes incorrect protocol detection (HTTP vs HTTPS)
- Breaks secure cookie settings

### 2. **Missing Client-Side Environment Variable (CRITICAL)**
- `NEXT_PUBLIC_BETTER_AUTH_URL` not set
- Client can't properly construct auth URLs
- Causes redirect failures

### 3. **Incomplete Session Validation in Middleware**
- Only checking cookie presence, not validity
- No actual session verification with auth server

### 4. **OAuth Callback URL Mismatches**
- Potential mismatch between configured and actual callback URLs
- Need to verify in Google Cloud Console

## FIX IMPLEMENTATION PLAN

### Phase 1: Environment Configuration (IMMEDIATE)
**Time: 5 minutes**

1. Add missing environment variable to `.env.local`:
   ```bash
   NEXT_PUBLIC_BETTER_AUTH_URL=https://gwth.ai
   ```

2. Rebuild application to pick up new env variable

### Phase 2: Better Auth Server Configuration
**Time: 10 minutes**

1. Update `/src/lib/better-auth.ts`:
   - Add `trustProxy: true` for production environment
   - Add trusted origins configuration
   - Fix cookie security settings

2. Create admin authorization helper function

### Phase 3: Fix Middleware Session Validation
**Time: 10 minutes**

1. Update `/src/middleware.ts`:
   - Implement proper session validation
   - Add admin role checking
   - Fix redirect logic

### Phase 4: Client Configuration Updates
**Time: 5 minutes**

1. Update `/src/lib/auth-client.ts`:
   - Ensure proper base URL configuration
   - Fix OAuth callback URLs

### Phase 5: Verify OAuth Provider Settings
**Time: 10 minutes**

1. Check Google Cloud Console:
   - Verify authorized redirect URIs
   - Ensure `https://gwth.ai/api/auth/callback/google` is listed

2. Check GitHub OAuth App:
   - Verify callback URL configuration

### Phase 6: Testing & Validation
**Time: 15 minutes**

1. Test admin Google OAuth login
2. Test student registration/login
3. Test session persistence
4. Test protected route access

## DETAILED FIXES

### Fix 1: Environment Variable
```bash
# Add to .env.local
NEXT_PUBLIC_BETTER_AUTH_URL=https://gwth.ai
```

### Fix 2: Better Auth Configuration
```typescript
// /src/lib/better-auth.ts
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "@/lib/db";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql"
  }),

  // CRITICAL FIX: Trust proxy headers in production
  trustHost: true,

  // Add trusted origins
  trustedOrigins: ["https://gwth.ai"],

  // Fix cookie configuration
  session: {
    cookieOptions: {
      secure: true, // Force secure in production
      sameSite: 'lax',
      httpOnly: true,
      path: '/',
      domain: '.gwth.ai' // Ensure cookies work across subdomains
    }
  },

  // Advanced configuration for proxy environments
  advanced: {
    generateId: () => crypto.randomUUID(),
    useSecureCookies: true,
    cookiePrefix: "better-auth"
  },

  // Rest of existing configuration...
});

// Add admin authorization helper
export async function isAuthorizedAdmin(email: string): Promise<boolean> {
  const adminEmails = [
    'familyuccelli@gmail.com',
    'yash.makan.22@gmail.com',
    'jonasmortensen35@gmail.com',
    'admin@gwth.ai'
  ];
  return adminEmails.includes(email.toLowerCase());
}
```

### Fix 3: Middleware Update
```typescript
// /src/middleware.ts
import { auth } from './lib/better-auth';

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Validate session properly
  let session = null;
  try {
    // Get session from Better Auth
    const authRequest = {
      headers: Object.fromEntries(request.headers.entries()),
      cookies: Object.fromEntries(
        request.cookies.getAll().map(c => [c.name, c.value])
      )
    };

    session = await auth.api.getSession(authRequest);
  } catch (error) {
    console.error('Session validation error:', error);
  }

  const hasValidSession = !!session?.user;
  const userEmail = session?.user?.email;

  // Admin routes protection
  if (pathname.startsWith('/backend') || pathname.startsWith('/api/backend')) {
    if (!hasValidSession) {
      return NextResponse.redirect(new URL('/backend/login', request.url));
    }

    // Check admin authorization
    const isAdmin = await isAuthorizedAdmin(userEmail);
    if (!isAdmin) {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
  }

  // Rest of middleware logic...
}
```

### Fix 4: OAuth Redirect Configuration
```typescript
// /src/lib/auth-client.ts
const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "https://gwth.ai",

  // Ensure proper callback URLs
  plugins: [
    socialClient({
      redirectOnError: "/sign-in?error=oauth_error"
    })
  ]
});
```

## ROLLBACK PLAN

If issues persist after fixes:

1. **Check PM2 logs immediately:**
   ```bash
   pm2 logs gwth-ai --lines 100
   ```

2. **Verify environment variables loaded:**
   ```bash
   npm run build && pm2 restart gwth-ai
   pm2 env gwth-ai | grep BETTER_AUTH
   ```

3. **Emergency rollback:**
   ```bash
   git stash
   git checkout HEAD~1
   npm run build && pm2 restart gwth-ai
   ```

## MONITORING CHECKLIST

After implementing fixes:

- [ ] Admin can log in via Google OAuth
- [ ] Students can register new accounts
- [ ] Students can log in with existing accounts
- [ ] Sessions persist across page refreshes
- [ ] Protected routes redirect properly when not authenticated
- [ ] Admin dashboard accessible to admin users only
- [ ] No console errors related to authentication
- [ ] Cookies are set with secure flag in production

## SUCCESS CRITERIA

1. Admin Google OAuth completes without redirect loop
2. Student sign-up creates account and auto-logs in
3. Student sign-in works with email/password
4. Sessions persist for 30 days as configured
5. Protected routes work correctly for both admin and students

## COMMON ERROR PATTERNS TO WATCH

1. **"Invalid CSRF token"** - Trust proxy issue
2. **"Session not found"** - Cookie configuration issue
3. **Redirect loops** - Middleware validation issue
4. **403/401 errors** - Authorization check failures

## POST-FIX VERIFICATION

Run these commands after fixes:

```bash
# Check application status
pm2 status gwth-ai

# Monitor logs for errors
pm2 logs gwth-ai --lines 50

# Test endpoints
curl -I https://gwth.ai/api/auth/session
curl -I https://gwth.ai/backend/login

# Check database sessions
psql -U gwthai_user -d gwthai_production -c "SELECT COUNT(*) FROM session WHERE expires_at > NOW();"
```

---
**IMPORTANT:** This is a critical production fix. Test each change carefully and monitor logs continuously during implementation.