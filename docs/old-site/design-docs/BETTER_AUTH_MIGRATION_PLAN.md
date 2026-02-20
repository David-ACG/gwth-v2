# Better Auth Migration Plan - Complete Step-by-Step Guide

## Overview
This document provides a complete, step-by-step plan to implement Better Auth for both frontend and backend authentication. Follow each step in order - do NOT skip steps.

## Current Status
- **Frontend**: OAuth providers show "Coming Soon", email login partially works
- **Backend**: Temporary login works, Google OAuth not configured
- **Database**: Better Auth tables not created
- **OAuth Keys**: Commented out in .env.local

## Part 1: Database Setup (30 minutes)

### Step 1.1: Create Better Auth Database Tables
```bash
# Connect to database
psql -U gwthai_user -d gwthai_production

# Run this SQL to create Better Auth tables
```

```sql
-- User table
CREATE TABLE IF NOT EXISTS "user" (
  "id" TEXT PRIMARY KEY,
  "email" TEXT UNIQUE NOT NULL,
  "name" TEXT,
  "emailVerified" BOOLEAN DEFAULT false,
  "image" TEXT,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Session table
CREATE TABLE IF NOT EXISTS "session" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "expiresAt" TIMESTAMP NOT NULL,
  "token" TEXT UNIQUE NOT NULL,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Account table (for OAuth providers)
CREATE TABLE IF NOT EXISTS "account" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "accountId" TEXT NOT NULL,
  "providerId" TEXT NOT NULL,
  "accessToken" TEXT,
  "refreshToken" TEXT,
  "idToken" TEXT,
  "accessTokenExpiresAt" TIMESTAMP,
  "refreshTokenExpiresAt" TIMESTAMP,
  "scope" TEXT,
  "password" TEXT,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE("providerId", "accountId")
);

-- Verification table (for email verification & password reset)
CREATE TABLE IF NOT EXISTS "verification" (
  "id" TEXT PRIMARY KEY,
  "identifier" TEXT NOT NULL,
  "value" TEXT NOT NULL,
  "expiresAt" TIMESTAMP NOT NULL,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS "idx_session_userId" ON "session"("userId");
CREATE INDEX IF NOT EXISTS "idx_session_token" ON "session"("token");
CREATE INDEX IF NOT EXISTS "idx_account_userId" ON "account"("userId");
CREATE INDEX IF NOT EXISTS "idx_verification_identifier" ON "verification"("identifier");

-- Exit psql
\q
```

### Step 1.2: Verify Tables Were Created
```bash
psql -U gwthai_user -d gwthai_production -c "\dt"
# Should show: user, session, account, verification tables
```

## Part 2: OAuth Credentials Setup (1 hour)

### Step 2.1: Google OAuth Setup
1. Go to https://console.cloud.google.com
2. Create a new project or select existing
3. Enable Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. Configure OAuth consent screen:
   - App name: GWTH.ai
   - Support email: david@agilecommercegroup.com
   - Authorized domains: gwth.ai
6. Create OAuth 2.0 Client ID:
   - Application type: Web application
   - Name: GWTH.ai Production
   - Authorized JavaScript origins:
     - https://gwth.ai
   - Authorized redirect URIs:
     - https://gwth.ai/api/auth/callback/google
7. Save the Client ID and Client Secret

### Step 2.2: GitHub OAuth Setup
1. Go to https://github.com/settings/developers
2. Click "New OAuth App"
3. Fill in:
   - Application name: GWTH.ai
   - Homepage URL: https://gwth.ai
   - Authorization callback URL: https://gwth.ai/api/auth/callback/github
4. Save the Client ID and Client Secret

### Step 2.3: LinkedIn OAuth Setup
1. Go to https://www.linkedin.com/developers/apps
2. Create a new app
3. Fill in required information
4. Add OAuth 2.0 settings:
   - Redirect URL: https://gwth.ai/api/auth/callback/linkedin
5. Request access to "Sign In with LinkedIn using OpenID Connect"
6. Save the Client ID and Client Secret

### Step 2.4: Update Environment Variables
Edit `/var/www/gwth-ai/.env.local`:
```bash
# Uncomment and add your OAuth credentials
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GITHUB_CLIENT_ID=your_github_client_id_here
GITHUB_CLIENT_SECRET=your_github_client_secret_here
LINKEDIN_CLIENT_ID=your_linkedin_client_id_here
LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret_here
```

## Part 3: Update Better Auth Configuration (30 minutes)

### Step 3.1: Update Better Auth Configuration
Replace `/var/www/gwth-ai/src/lib/better-auth.ts` with:

```typescript
import { betterAuth } from "better-auth";
import { Pool } from "pg";

// Create a PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

export const auth = betterAuth({
  database: pool,
  
  // Base URL configuration
  baseURL: process.env.BETTER_AUTH_URL || "https://gwth.ai",
  secret: process.env.BETTER_AUTH_SECRET!,
  
  // Email/Password authentication
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    minPasswordLength: 6,
  },
  
  // OAuth providers
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
  
  // Session configuration
  session: {
    expiresIn: 60 * 60 * 24 * 30, // 30 days
    updateAge: 60 * 60 * 24, // Update every 24 hours
    cookieName: "better-auth.session_token",
  },
  
  // Email configuration for password reset
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    sendResetPassword: async ({ user, url }) => {
      // Use MailerSend for transactional emails
      const response = await fetch("https://api.mailersend.com/v1/email", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.MAILERSEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: {
            email: process.env.MAILERSEND_FROM_EMAIL,
            name: "GWTH.ai",
          },
          to: [{
            email: user.email,
            name: user.name || user.email,
          }],
          subject: "Reset Your Password",
          html: `
            <p>Hi ${user.name || "there"},</p>
            <p>You requested to reset your password. Click the link below:</p>
            <p><a href="${url}">Reset Password</a></p>
            <p>If you didn't request this, please ignore this email.</p>
            <p>Best regards,<br>GWTH.ai Team</p>
          `,
          text: `Reset your password: ${url}`,
        }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to send reset email");
      }
    },
  },
});

// Export type for use in other files
export type Auth = typeof auth;

// Helper functions remain the same...
export async function getSession(req: Request): Promise<any> {
  try {
    const session = await auth.api.getSession({
      headers: req.headers,
    });
    return session;
  } catch (error) {
    console.error("Error getting session:", error);
    return null;
  }
}

export async function requireAuth(req: Request) {
  const session = await getSession(req);
  if (!session?.user) {
    throw new Error("Unauthorized: No valid session");
  }
  return session;
}

export async function validateApiAuth(req: Request) {
  try {
    const session = await requireAuth(req);
    return { success: true, user: session.user, session };
  } catch (error) {
    return { success: false, error: "Unauthorized", user: null, session: null };
  }
}

export async function getUserById(userId: string) {
  try {
    const result = await pool.query(
      'SELECT * FROM "user" WHERE id = $1',
      [userId]
    );
    return result.rows[0] || null;
  } catch (error) {
    console.error("Error fetching user:", error);
    return null;
  }
}

export default auth;
```

## Part 4: Create API Routes (45 minutes)

### Step 4.1: Update Main Auth Route
Create `/var/www/gwth-ai/src/app/api/auth/[...all]/route.ts`:

```typescript
import { auth } from "@/lib/better-auth";
import { toNextJsHandler } from "better-auth/next-js";

const handler = toNextJsHandler(auth);

export const { GET, POST } = handler;
```

### Step 4.2: Create Sign-up Route
Create `/var/www/gwth-ai/src/app/api/auth/signup/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/better-auth';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  try {
    const { email, password, name } = await req.json();
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create user using Better Auth
    const result = await auth.api.signUpEmail({
      body: {
        email,
        password: hashedPassword,
        name: name || email.split('@')[0],
      },
      headers: req.headers,
    });
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Signup failed' },
      { status: 400 }
    );
  }
}
```

### Step 4.3: Update OAuth Status Route
The route at `/var/www/gwth-ai/src/app/api/auth/oauth-status/route.ts` is already correct.

## Part 5: Update Backend Authentication (30 minutes)

### Step 5.1: Update Backend Auth Helper
Replace `/var/www/gwth-ai/src/lib/backend-auth.ts`:

```typescript
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { auth } from '@/lib/better-auth';

// List of authorized admin emails
const AUTHORIZED_ADMINS = [
  'david@agilecommercegroup.com'
];

async function currentUser(): Promise<{ email: string } | null> {
  try {
    const cookieStore = cookies();
    const sessionToken = cookieStore.get('better-auth.session_token');
    
    if (!sessionToken) {
      return null;
    }
    
    // Get session from Better Auth
    const session = await auth.api.getSession({
      headers: {
        cookie: `better-auth.session_token=${sessionToken.value}`,
      },
    });
    
    return session?.user || null;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

export async function requireBackendAuth() {
  const user = await currentUser();
  
  if (!user) {
    redirect('/backend/login');
  }
  
  const userEmail = user?.email;
  
  if (!userEmail || !AUTHORIZED_ADMINS.includes(userEmail)) {
    redirect('/backend/unauthorized');
  }
  
  return user;
}

export async function isAuthorizedAdmin() {
  const user = await currentUser();
  
  if (!user) {
    return false;
  }
  
  const userEmail = user?.email;
  return userEmail && AUTHORIZED_ADMINS.includes(userEmail);
}

export function getAuthorizedEmails() {
  return AUTHORIZED_ADMINS;
}
```

### Step 5.2: Create Backend Google-Only Auth Route
Create `/var/www/gwth-ai/src/app/api/backend/auth/google/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';

const AUTHORIZED_EMAIL = 'david@agilecommercegroup.com';

export async function GET(req: NextRequest) {
  // Redirect to Google OAuth with specific callback for backend
  const callbackURL = encodeURIComponent('https://gwth.ai/backend/auth-callback');
  const authURL = `https://gwth.ai/api/auth/callback/google?callbackURL=${callbackURL}&prompt=select_account`;
  
  return NextResponse.redirect(authURL);
}
```

### Step 5.3: Update Backend Auth Callback
Ensure `/var/www/gwth-ai/src/app/backend/auth-callback/page.tsx` exists and validates the user.

## Part 6: Frontend Implementation (45 minutes)

### Step 6.1: Update Auth Client
The `/var/www/gwth-ai/src/lib/auth-client-better.ts` is mostly correct but needs minor updates for social auth to work properly.

### Step 6.2: Create Reset Password Page
Create `/var/www/gwth-ai/src/app/reset-password/page.tsx`:

```typescript
"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { MainLayout } from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Lock } from "lucide-react";
import { resetPasswordWithToken } from "@/lib/auth-client-better";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');
  
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setError("Invalid or missing reset token");
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    
    setIsLoading(true);
    setError("");

    try {
      await resetPasswordWithToken(token!, password);
      setSuccess(true);
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch (err: any) {
      setError(err.message || "Failed to reset password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MainLayout animated={false} showFooter={false}>
      <div className="min-h-screen flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full">
          <div className="bg-white/80 dark:bg-dark-700/50 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-dark-600 p-8 shadow-xl">
            <h1 className="text-3xl font-bold text-center mb-8">Reset Password</h1>
            
            {error && (
              <Alert className="mb-6 border-red-200 bg-red-50 dark:bg-red-900/20">
                <AlertDescription className="text-red-800 dark:text-red-400">
                  {error}
                </AlertDescription>
              </Alert>
            )}
            
            {success ? (
              <Alert className="border-green-200 bg-green-50 dark:bg-green-900/20">
                <AlertDescription className="text-green-800 dark:text-green-400">
                  Password reset successful! Redirecting to login...
                </AlertDescription>
              </Alert>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="password">New Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10"
                      required
                      disabled={isLoading || !token}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-10"
                      required
                      disabled={isLoading || !token}
                    />
                  </div>
                </div>
                
                <Button
                  type="submit"
                  disabled={isLoading || !token}
                  className="w-full"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Resetting...
                    </>
                  ) : (
                    "Reset Password"
                  )}
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
```

## Part 7: Testing & Verification (30 minutes)

### Step 7.1: Build and Deploy
```bash
cd /var/www/gwth-ai
npm run build
pm2 restart gwth-ai
pm2 logs gwth-ai --lines 20
```

### Step 7.2: Test Frontend Authentication
1. **Test Email Sign Up**:
   - Go to https://gwth.ai/sign-up
   - Create a new account with email/password
   - Verify you can log in

2. **Test Social Login**:
   - Go to https://gwth.ai/login
   - Click "Continue with Google"
   - Complete OAuth flow
   - Verify redirect to dashboard

3. **Test Password Reset**:
   - Go to https://gwth.ai/forgot-password
   - Enter email address
   - Check email for reset link
   - Click link and reset password
   - Verify new password works

### Step 7.3: Test Backend Authentication
1. **Test Google-Only Login**:
   - Go to https://gwth.ai/backend/login
   - Click "Sign In with Google"
   - Sign in with david@agilecommercegroup.com
   - Verify access to backend dashboard

2. **Test Unauthorized Access**:
   - Try logging in with different Google account
   - Verify redirect to unauthorized page

## Part 8: Troubleshooting

### Common Issues and Solutions

#### Issue: OAuth providers still show "Coming Soon"
**Solution**: 
1. Verify environment variables are uncommented in .env.local
2. Restart the application: `pm2 restart gwth-ai`
3. Check logs: `pm2 logs gwth-ai --err`

#### Issue: "Cannot read properties of undefined"
**Solution**:
1. Clear browser cache and cookies
2. Check that Better Auth tables exist in database
3. Verify OAuth status endpoint returns correct format

#### Issue: Google OAuth redirect fails
**Solution**:
1. Verify redirect URI in Google Console matches exactly
2. Check that BETTER_AUTH_URL is set to https://gwth.ai
3. Ensure OAuth consent screen is configured

#### Issue: Password reset emails not sending
**Solution**:
1. Verify MailerSend API key is correct
2. Check MailerSend domain is verified
3. Review MailerSend logs for errors

## Part 9: Security Checklist

- [ ] All OAuth credentials are in .env.local (not committed)
- [ ] Backend only accepts david@agilecommercegroup.com
- [ ] Session cookies are httpOnly and secure
- [ ] Password reset tokens expire after 1 hour
- [ ] Failed login attempts are logged
- [ ] CSRF protection is enabled
- [ ] Rate limiting is configured

## Part 10: Final Verification

### Frontend Checklist:
- [ ] Email sign up works
- [ ] Email login works
- [ ] Google OAuth works
- [ ] GitHub OAuth works
- [ ] LinkedIn OAuth works
- [ ] Forgot password works
- [ ] Reset password works
- [ ] User dashboard accessible after login

### Backend Checklist:
- [ ] Google OAuth works for admin
- [ ] Only david@agilecommercegroup.com can access
- [ ] Other emails are rejected
- [ ] Backend dashboard loads after auth
- [ ] Session persists across page reloads
- [ ] Logout works correctly

## Support

If you encounter issues not covered here:
1. Check PM2 logs: `pm2 logs gwth-ai --err --lines 100`
2. Check database: `psql -U gwthai_user -d gwthai_production -c "SELECT * FROM \"user\";"`
3. Verify environment variables are set correctly
4. Test OAuth providers individually
5. Review Better Auth documentation: https://better-auth.com

## Estimated Time: 4-5 hours total

Following this plan step-by-step should result in a fully functional authentication system for both frontend and backend.