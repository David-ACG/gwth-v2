# Waitlist and Beta Tester System Documentation

## Overview

This system allows users to join a waitlist and enables beta testing before the full launch. It integrates with Clerk for authentication and provides a smooth transition from waitlist to paid subscriptions.

## System Architecture

### Database Models

#### User Model (Enhanced)
```prisma
model User {
  // ... existing fields
  
  // Beta tester info
  isBetaTester         Boolean   @default(false)
  betaTesterStartedAt  DateTime?
  betaTesterEndsAt     DateTime?
  betaTesterPhase      String?   // "phase1" ($1/month), "phase2" ($0.50/month), "completed"
  
  // Relations
  waitlistEntry     Waitlist? @relation("UserWaitlist")
  whitelistEntry    Whitelist? @relation("UserWhitelist")
}
```

#### Waitlist Model (Enhanced)
```prisma
model Waitlist {
  // ... existing fields
  
  // Clerk integration
  clerkUserId     String?  // Link to Clerk user if they signed up
  
  // Promotion tracking
  isPromoted      Boolean  @default(false) // Promoted to whitelist (beta tester)
  promotedAt      DateTime?
  promotedBy      String?  // Admin who promoted them
  
  // Relations
  user            User?    @relation("UserWaitlist", fields: [email], references: [email])
}
```

#### Whitelist Model (Enhanced)
```prisma
model Whitelist {
  // ... existing fields
  
  // Clerk integration
  clerkUserId String?  // Link to Clerk user
  
  // Beta tester info
  isBetaTester       Boolean   @default(false)
  betaTesterPricing  String?   // "phase1", "phase2", "standard"
  betaTesterNotes    String?   // Admin notes about beta tester
  
  // Relations
  user        User?    @relation("UserWhitelist", fields: [email], references: [email])
}
```

## Key Features

### 1. Public Waitlist Signup (`/waitlist`)
- **Purpose**: Allow visitors to join waitlist and receive launch notifications
- **Clerk Integration**: Users can optionally create accounts for seamless transition
- **Features**:
  - Email and name collection
  - Marketing/product update preferences
  - Automatic Clerk user linking if signed in
  - Clear messaging about news alerts

### 2. Backend Waitlist Management (`/backend/waitlist`)
- **Purpose**: Admin interface to view and manage waitlist entries
- **Key Features**:
  - View all waitlist entries with promotion status
  - Search and filter functionality
  - **Promote to Beta Tester**: One-click promotion to whitelist
  - Export to CSV functionality
  - Shows Clerk user linkage

### 3. Backend Whitelist Management (`/backend/whitelist`)
- **Purpose**: Admin interface to manage beta testers and early access users
- **Key Features**:
  - View all whitelisted users with beta tester status
  - Shows beta tester pricing phase ($1/month or $0.50/month)
  - Manual whitelist entry creation
  - Access tracking and management

### 4. Beta Tester Pricing System
- **Phase 1**: $1/month for first 3 months (Stripe: `prod_SxQ5Z25xGZTssi`)
- **Phase 2**: $0.50/month thereafter (Stripe: `prod_SxQ7uvqC4wyP8a`)
- **Standard**: Regular pricing for non-beta users ($29.99/month)

## API Endpoints

### Public Endpoints
- `POST /api/waitlist` - Join waitlist (with optional Clerk integration)

### Admin Endpoints (Protected)
- `GET /api/backend/waitlist` - Fetch waitlist entries
- `POST /api/backend/waitlist/promote` - Promote waitlist user to beta tester
- `GET /api/backend/whitelist` - Fetch whitelist entries
- `POST /api/backend/whitelist` - Add user to whitelist
- `PATCH /api/backend/whitelist/[id]` - Update whitelist entry
- `DELETE /api/backend/whitelist/[id]` - Remove from whitelist

## User Flow

### Waitlist User Flow
1. **Discovery**: User visits `/waitlist` page
2. **Signup**: User provides email, optionally creates Clerk account
3. **Confirmation**: User receives confirmation and is added to waitlist
4. **Promotion**: Admin promotes user to beta tester in backend
5. **Notification**: User is notified they have beta access
6. **Payment**: User pays beta pricing ($1/month initially)
7. **Access**: User gets full access to lessons and features

### Beta Tester Flow
1. **Invitation**: Admin manually adds to whitelist or promotes from waitlist
2. **Account Creation**: If no Clerk account exists, user creates one
3. **Beta Access**: User gets access with special pricing
4. **Phase 1**: $1/month for 3 months
5. **Phase 2**: $0.50/month ongoing
6. **Feedback**: User provides feedback during beta period

## Launch Preparation

### Steps to Remove Waitlist System (Keep Beta Testers)

#### 1. Update Middleware Configuration
```typescript
// In src/middleware.ts
const WAITLIST_MODE_ENABLED = false; // Already set to false
```

#### 2. Remove Waitlist Signup Page
**Option A**: Redirect to pricing page
```typescript
// In src/app/waitlist/page.tsx
import { redirect } from 'next/navigation';

export default function WaitlistPage() {
  redirect('/pricing');
}
```

**Option B**: Show "Launched" message
```typescript
return (
  <MainLayout>
    <div className="container mx-auto px-4 py-16 text-center">
      <h1 className="text-4xl font-bold mb-4">We've Launched!</h1>
      <p className="text-xl text-muted-foreground mb-8">
        Thank you for your interest! Our platform is now live.
      </p>
      <Button asChild>
        <Link href="/pricing">View Pricing</Link>
      </Button>
    </div>
  </MainLayout>
);
```

#### 3. Update Navigation (if needed)
Remove any waitlist links from navigation components.

#### 4. Keep Beta Tester Functionality
**DO NOT REMOVE**:
- `/backend/whitelist` page
- Beta tester pricing logic
- Whitelist API endpoints
- Beta tester database fields

#### 5. Update Homepage/Marketing
Remove waitlist messaging and add "Get Started" or "Sign Up" buttons that go to pricing/registration.

#### 6. Database Cleanup (Optional)
After launch, you may want to:
```sql
-- Mark all waitlist entries as processed (optional)
UPDATE waitlist SET isPromoted = true, promotedAt = NOW() WHERE isPromoted = false;
```

### Steps to Transition Beta Testers to Regular Pricing

#### After 3 Months (Phase 1 → Phase 2)
1. Update user records:
```sql
UPDATE users 
SET betaTesterPhase = 'phase2' 
WHERE isBetaTester = true 
AND betaTesterPhase = 'phase1' 
AND betaTesterStartedAt < NOW() - INTERVAL '3 months';
```

2. Update Stripe subscriptions to $0.50/month pricing.

#### End of Beta Program
1. Update user records:
```sql
UPDATE users 
SET isBetaTester = false, betaTesterPhase = 'completed' 
WHERE isBetaTester = true;
```

2. Update Stripe subscriptions to standard pricing.

## Testing Checklist

### Before Launch
- [ ] Test waitlist signup (with and without Clerk account)
- [ ] Test promotion workflow (waitlist → whitelist)
- [ ] Test beta tester pricing in Stripe
- [ ] Verify email notifications work
- [ ] Test all backend management functions
- [ ] Confirm middleware whitelist checking works
- [ ] Test user dashboard shows correct status

### Launch Day
- [ ] Disable waitlist mode in middleware
- [ ] Update waitlist page (redirect or "launched" message)
- [ ] Update navigation and marketing copy
- [ ] Monitor for any errors in logs
- [ ] Verify regular users can sign up normally

## Environment Variables

Ensure these are set in production:
```env
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...

# Database
DATABASE_URL=postgresql://...

# Stripe Payments
STRIPE_SECRET_KEY=sk_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Beta Tester Pricing (Production IDs)
STRIPE_BETA_PHASE1_PRICE_ID=prod_SxQ5Z25xGZTssi  # $1/month
STRIPE_BETA_PHASE2_PRICE_ID=prod_SxQ7uvqC4wyP8a  # $0.50/month
STRIPE_STANDARD_PRICE_ID=price_...  # Standard pricing

# Email Services (for notifications)
MAILERSEND_API_KEY=...
MAILERLITE_API_KEY=...
```

## Monitoring

### Key Metrics to Track
- Waitlist signups per day
- Promotion rate (waitlist → beta)
- Beta tester retention
- Revenue from beta testers
- Conversion rate (beta → regular)

### Database Queries for Insights
```sql
-- Total waitlist signups
SELECT COUNT(*) FROM waitlist;

-- Promoted users
SELECT COUNT(*) FROM waitlist WHERE isPromoted = true;

-- Active beta testers
SELECT COUNT(*) FROM users WHERE isBetaTester = true;

-- Beta tester revenue
SELECT 
  betaTesterPhase,
  COUNT(*) as users,
  CASE 
    WHEN betaTesterPhase = 'phase1' THEN COUNT(*) * 1.00
    WHEN betaTesterPhase = 'phase2' THEN COUNT(*) * 0.50
    ELSE 0
  END as monthly_revenue
FROM users 
WHERE isBetaTester = true 
GROUP BY betaTesterPhase;
```

## Security Considerations

### Admin Protection
- All backend routes are protected with admin email check
- API endpoints verify admin authentication
- Sensitive operations require confirmation

### Data Privacy
- Users can opt out of marketing emails
- Personal data is handled according to privacy policy
- Clerk manages authentication securely

### Rate Limiting
Consider adding rate limiting to waitlist signup to prevent abuse.

## Support and Maintenance

### Common Issues
1. **User not promoted**: Check if email matches exactly
2. **Pricing not applied**: Verify Stripe webhook processing
3. **Access denied**: Check whitelist status and expiration

### Regular Maintenance
- Weekly review of new waitlist signups
- Monthly beta tester status review
- Quarterly pricing phase transitions

---

**Last Updated**: August 2025  
**Version**: 1.0  
**Contact**: Admin backend system for management

This system provides a complete waitlist-to-beta-tester pipeline with smooth transition to paid subscriptions.