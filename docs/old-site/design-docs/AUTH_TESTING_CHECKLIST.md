# AUTH TESTING CHECKLIST - MIGRATION FIXES
**Updated:** 2025-09-23 16:10:00 UTC
**Test Environment:** https://gwth.ai

## CRITICAL FIXES APPLIED

The authentication system has been fixed with the following changes:
1. ✅ Added missing `NEXT_PUBLIC_BETTER_AUTH_URL` environment variable
2. ✅ Fixed Better Auth configuration with trust proxy settings
3. ✅ Updated middleware to work with edge runtime limitations
4. ✅ Added admin authorization helper function
5. ✅ **NEW: Created user migration system for existing users**
6. ✅ **NEW: Added automatic migration on sign-up for existing users**
7. ✅ **NEW: Prepared admin user (familyuccelli@gmail.com) for OAuth**
8. ✅ Rebuilt and restarted application

## ROOT CAUSE RESOLUTION

**Problem Identified:** Existing users from Clerk migration had user records but no Better Auth credential accounts.

**Solution Implemented:**
- Created `/api/auth/migrate-user` endpoint to create Better Auth credentials for existing users
- Modified sign-up form to automatically migrate existing users
- Modified sign-in form to provide helpful migration guidance
- Created debug endpoint to prepare users for OAuth linking

## TESTING PROCEDURES

### Test 1: Admin Google OAuth Login ⭐ SHOULD NOW WORK
**URL:** https://gwth.ai/backend/login

**Steps:**
1. Navigate to https://gwth.ai/backend/login
2. Click "Sign In with Google"
3. Select your admin account (familyuccelli@gmail.com)
4. **Should now redirect to /backend/dashboard successfully**

**What's been fixed:**
- Admin user prepared for OAuth linking with emailVerified=true
- Better Auth configured to handle account linking properly
- Admin authorization updated to include all admin emails

### Test 2: Student Registration (New Users) ⭐ SHOULD NOW WORK
**URL:** https://gwth.ai/sign-up

**Steps:**
1. Navigate to https://gwth.ai/sign-up
2. Enter a NEW email address (not existing user)
3. Create a password (min 8 characters)
4. Click "Sign Up"
5. **Should auto-login and redirect to /dashboard**

### Test 3: Existing User Migration via Sign-Up ⭐ NEW FEATURE
**URL:** https://gwth.ai/sign-up

**For existing users (like familyuccelli@gmail.com):**
1. Navigate to https://gwth.ai/sign-up
2. Enter existing email (familyuccelli@gmail.com)
3. Create a NEW password (this will be your Better Auth password)
4. Click "Sign Up"
5. **System will automatically migrate your account and log you in**
6. Should redirect to /dashboard

### Test 4: Student Login (After Migration) ⭐ SHOULD NOW WORK
**URL:** https://gwth.ai/sign-in

**Steps:**
1. Navigate to https://gwth.ai/sign-in
2. Enter email (familyuccelli@gmail.com or any migrated email)
3. Enter the password you set during migration
4. Click "Sign In"
5. **Should redirect to /dashboard**

### Test 4: Waitlist Check (Admin)
**URL:** https://gwth.ai/backend/waitlist (after login)

**Steps:**
1. Complete Admin Google OAuth login first
2. Navigate to https://gwth.ai/backend/waitlist
3. Should see waitlist management interface

## TROUBLESHOOTING

### If Admin OAuth Still Loops:
1. **Clear browser cookies** for gwth.ai domain
2. **Check Google Console**: Ensure callback URL is exactly:
   ```
   https://gwth.ai/api/auth/callback/google
   ```
3. **Try incognito/private window**

### If "User not found" or "Credential account not found":
This is expected for existing users who haven't been migrated to Better Auth.

**Solution:**
1. For regular users: Sign up again at /sign-up with same email
2. For admin:
   - First sign up at /sign-up with admin email
   - Then use Google OAuth at /backend/login

### If Session Doesn't Persist:
1. Check cookies in browser DevTools
2. Look for `better-auth.session_token` cookie
3. Should have:
   - Domain: .gwth.ai
   - Secure: true
   - SameSite: Lax
   - HttpOnly: true

## DATABASE CHECK COMMANDS

Run these to verify user creation:

```bash
# Check if user exists in database
psql -U gwthai_user -d gwthai_production -c "SELECT id, email, createdAt FROM \"User\" WHERE email = 'familyuccelli@gmail.com';"

# Check active sessions
psql -U gwthai_user -d gwthai_production -c "SELECT COUNT(*) FROM session WHERE expires_at > NOW();"

# Check OAuth accounts
psql -U gwthai_user -d gwthai_production -c "SELECT user_id, provider FROM account WHERE provider = 'google';"
```

## VERIFICATION CHECKLIST

- [ ] Admin can access /backend/login page
- [ ] Google OAuth button is clickable
- [ ] OAuth redirects to Google sign-in
- [ ] After Google auth, redirects back to gwth.ai
- [ ] Admin dashboard loads for authorized emails
- [ ] Students can register new accounts
- [ ] Students can login with email/password
- [ ] Sessions persist across page refreshes
- [ ] Logout works correctly
- [ ] Protected routes redirect when not authenticated

## NEXT STEPS IF ISSUES PERSIST

1. **Check PM2 Logs:**
   ```bash
   pm2 logs gwth-ai --lines 50
   ```

2. **Check Browser Console:**
   - Open DevTools (F12)
   - Check Console tab for JavaScript errors
   - Check Network tab for failed requests

3. **Verify Environment Variables:**
   ```bash
   grep "BETTER_AUTH" .env.local
   ```
   Should show:
   - BETTER_AUTH_SECRET
   - BETTER_AUTH_URL
   - NEXT_PUBLIC_BETTER_AUTH_URL

4. **Test OAuth Callback Directly:**
   Visit: https://gwth.ai/api/auth/session
   Should return session data or null

---
**Note:** The authentication system is now using Better Auth. All new users need to register through the Better Auth system. Existing Clerk users will need to re-register.