# OAuth Provider Setup Guide

This guide explains how to configure social authentication providers (Google, GitHub, LinkedIn) for the GWTH.ai platform.

## Current Status

All social authentication providers are currently **disabled** because OAuth credentials are not configured. Users will see:
- Disabled social login buttons with "(Coming Soon)" text
- Tooltip messages explaining OAuth is not configured yet
- Functional email/password authentication as the primary method

## Environment Variables Required

To enable social authentication, add these environment variables to `.env.local`:

### Google OAuth
```bash
GOOGLE_CLIENT_ID="your_google_client_id"
GOOGLE_CLIENT_SECRET="your_google_client_secret"
```

### GitHub OAuth
```bash
GITHUB_CLIENT_ID="your_github_client_id"
GITHUB_CLIENT_SECRET="your_github_client_secret"
```

### LinkedIn OAuth
```bash
LINKEDIN_CLIENT_ID="your_linkedin_client_id"
LINKEDIN_CLIENT_SECRET="your_linkedin_client_secret"
```

## Setting Up Each Provider

### 1. Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing project
3. Enable Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
5. Configure OAuth consent screen
6. Set authorized redirect URIs:
   - `https://gwth.ai/api/auth/callback/google`
   - `http://localhost:3000/api/auth/callback/google` (for development)

### 2. GitHub OAuth Setup

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Fill in application details:
   - **Application name**: GWTH.ai
   - **Homepage URL**: https://gwth.ai
   - **Authorization callback URL**: https://gwth.ai/api/auth/callback/github
4. Copy Client ID and Client Secret

### 3. LinkedIn OAuth Setup

1. Go to [LinkedIn Developers](https://www.linkedin.com/developers/apps)
2. Create a new app
3. Fill in required information
4. Add OAuth 2.0 redirect URLs:
   - `https://gwth.ai/api/auth/callback/linkedin`
5. Request necessary permissions:
   - `r_liteprofile` (basic profile info)
   - `r_emailaddress` (email address)

## After Configuration

1. Add the environment variables to `.env.local`
2. Restart the application: `pm2 restart gwth-ai`
3. Test the OAuth flow:
   - Visit `/sign-in` or `/sign-up`
   - Social buttons will become enabled automatically
   - Click buttons to test OAuth flows

## Security Notes

- Always use HTTPS in production
- Keep client secrets secure and never commit to version control
- Regularly rotate OAuth credentials
- Monitor OAuth usage in provider dashboards
- Set up proper rate limiting and abuse protection

## Troubleshooting

### Social buttons still disabled
- Check environment variables are set correctly
- Restart the application
- Check browser console for OAuth status API errors

### OAuth callback errors
- Verify redirect URIs match exactly in provider settings
- Check for HTTPS requirements in production
- Ensure Better Auth base URL is configured correctly

### Authentication failures
- Check provider client ID/secret are correct
- Verify OAuth app is approved and not in sandbox mode
- Check provider-specific API quotas and limits

## API Endpoint

The system automatically detects OAuth configuration via:
```
GET /api/auth/oauth-status
```

This endpoint returns which providers are configured and available.

## Code References

- OAuth configuration: `src/lib/better-auth.ts`
- Social auth buttons: `src/components/auth/sign-in-form.tsx`, `src/components/auth/sign-up-form.tsx`
- OAuth status API: `src/app/api/auth/oauth-status/route.ts`
- Better Auth handlers: `src/app/api/auth/[...all]/route.ts`

## Future Enhancements

- Add Twitter/X OAuth support
- Implement Apple Sign In
- Add Discord OAuth for developer community
- Add Microsoft/Azure AD for enterprise users