# GWTH.ai Soft Launch Plan

## Overview
This document outlines the comprehensive plan for soft launching GWTH.ai with limited beta access before the full public launch.

**Target Beta Testers:** ~10 trusted individuals
**Admin Access:** david@agilecommercegroup.com only
**Timeline:** To be determined based on task completion

---

## Phase 1: Authentication & Access Control
**Priority:** Critical
**Dependencies:** None

### 1.1 Clerk Authentication Setup
- [ ] Configure Clerk with custom roles (admin, beta_tester, waitlist_user)
- [ ] Create middleware to restrict admin routes to david@agilecommercegroup.com only
- [ ] Set up protected routes for lessons/labs (beta_tester role required)
- [ ] Implement role-based redirects on sign-in
- [ ] Create custom sign-in/sign-up pages with appropriate messaging
- [ ] Test authentication flows for all user types

### 1.2 Access Control Implementation
- [ ] Create authorization utility functions
- [ ] Implement route guards for all protected pages
- [ ] Add unauthorized access error pages with clear messaging
- [ ] Set up session management and timeout handling
- [ ] Test access restrictions thoroughly

---

## Phase 2: Waitlist & Newsletter System
**Priority:** Critical
**Dependencies:** Phase 1

### 2.1 Database Schema
- [ ] Create waitlist table (email, name, signup_date, source, status)
- [ ] Create newsletter_subscribers table (email, name, preferences, unsubscribe_token)
- [ ] Add indexes for email lookups
- [ ] Create migration scripts

### 2.2 Waitlist Page Implementation
- [ ] Create /waitlist page with sign-up form
- [ ] Add client-side validation (email format, required fields)
- [ ] Implement server-side validation and rate limiting
- [ ] Add duplicate email detection with appropriate messaging
- [ ] Include clear note about newsletter signup
- [ ] Create success confirmation page/modal
- [ ] Add honeypot and/or CAPTCHA for spam prevention

### 2.3 Newsletter Page Implementation  
- [ ] Create /newsletter page with subscription form
- [ ] Share backend logic with waitlist where appropriate
- [ ] Add preference options (frequency, topics of interest)
- [ ] Implement unsubscribe mechanism
- [ ] Create privacy-compliant consent checkboxes

### 2.4 MailerLite Integration
- [ ] Set up MailerLite API credentials in environment variables
- [ ] Create API service for MailerLite operations
- [ ] Implement subscriber sync (add/update/remove)
- [ ] Set up groups/segments for waitlist vs newsletter
- [ ] Create webhook endpoints for MailerLite events
- [ ] Test email deliverability

### 2.5 Navigation Updates
- [ ] Add Waitlist link to main navigation
- [ ] Add Newsletter link to footer
- [ ] Hide Sign In/Register for non-beta users
- [ ] Update mobile navigation accordingly

---

## Phase 3: Beta Tester Management System
**Priority:** Critical
**Dependencies:** Phase 1, Phase 2

### 3.1 Database Schema
- [ ] Create beta_testers table (email, name, invite_token, invite_sent_at, registered_at, status)
- [ ] Add foreign key relationships to users table
- [ ] Create audit log for beta tester actions

### 3.2 Admin Dashboard - Beta Tester Section
- [ ] Create /admin/beta-testers route (admin only)
- [ ] Build beta tester list view with search/filter
- [ ] Add form to input beta tester details (name, email)
- [ ] Implement bulk import from CSV
- [ ] Add status indicators (invited, registered, active)
- [ ] Create activity log viewer

### 3.3 Invitation System
- [ ] Generate unique, secure invitation tokens
- [ ] Create invitation email template with branding
- [ ] Build hidden registration page (/register/beta/[token])
- [ ] Implement token validation and expiration (72 hours)
- [ ] Auto-assign beta_tester role on registration
- [ ]Send welcome email after successful registration
- [ ] Track invitation metrics (sent, opened, converted)

### 3.4 Beta Tester Management Features
- [ ] Resend invitation functionality
- [ ] Revoke access capability
- [ ] View beta tester activity (lessons viewed, feedback submitted)
- [ ] Export beta tester list
- [ ] Add notes/tags to beta testers

---

## Phase 4: Feedback Collection System
**Priority:** High
**Dependencies:** Phase 3

### 4.1 GitHub Issue Submission Form
- [ ] Create /feedback page (beta testers only)
- [ ] Design user-friendly form with categories:
  - Bug Report
  - Feature Request
  - Content Issue
  - General Feedback
- [ ] Add fields: title, description, category, priority, screenshot upload
- [ ] Implement GitHub API integration
- [ ] Add rate limiting (max 10 issues per user per day)
- [ ] Create success confirmation with issue link
- [ ] Test issue creation and formatting

### 4.2 In-App Feedback Widget
- [ ] Create floating feedback button on lesson pages
- [ ] Quick feedback form (thumbs up/down, comment)
- [ ] Store feedback in database for admin review
- [ ] Option to convert to GitHub issue from admin panel

---

## Phase 5: Email Templates & Automation
**Priority:** High
**Dependencies:** Phase 2, Phase 3

### 5.1 Transactional Email Templates (MailerSend)
- [ ] Beta invitation email with custom registration link
- [ ] Registration confirmation email
- [ ] Password reset email
- [ ] Admin notification for new signups

### 5.2 Marketing Email Sequences (MailerLite)
- [ ] Waitlist welcome email
- [ ] Newsletter welcome sequence (3 emails)
- [ ] Weekly update template for beta testers
- [ ] Launch announcement template

### 5.3 Email Automation Setup
- [ ] Configure MailerLite automation workflows
- [ ] Set up admin digest emails (daily/weekly)
- [ ] Create re-engagement campaigns
- [ ] Test all email flows end-to-end

---

## Phase 6: Backup & Restore System
**Priority:** Critical
**Dependencies:** None (can run parallel)

### 6.1 Database Backup
- [ ] Set up automated PostgreSQL backups (pg_dump)
- [ ] Configure backup schedule (daily at 2 AM UTC)
- [ ] Implement backup rotation (keep 30 days)
- [ ] Store backups in secure cloud storage (S3/GCS)
- [ ] Create backup monitoring and alerts

### 6.2 Content Backup
- [ ] Export lessons/labs to JSON format
- [ ] Include all media assets and references
- [ ] Version control for content changes
- [ ] Create content backup script
- [ ] Schedule automated content exports

### 6.3 Restore Testing
- [ ] Document restore procedures
- [ ] Create restore scripts for database
- [ ] Create restore scripts for content
- [ ] Test full restore on staging environment
- [ ] Create disaster recovery playbook
- [ ] Schedule monthly restore drills

---

## Phase 7: Analytics & Monitoring
**Priority:** Medium
**Dependencies:** Phase 1

### 7.1 Analytics Setup
- [ ] Install Google Analytics 4
- [ ] Configure conversion tracking (signups, beta registrations)
- [ ] Set up custom events for lesson interactions
- [ ] Create admin analytics dashboard
- [ ] Implement privacy-compliant tracking

### 7.2 Error Monitoring
- [ ] Set up Sentry for error tracking
- [ ] Configure error severity levels
- [ ] Set up alert channels (email, Slack)
- [ ] Create error dashboard
- [ ] Test error capturing

### 7.3 Performance Monitoring
- [ ] Implement Core Web Vitals tracking
- [ ] Set up uptime monitoring (UptimeRobot/Pingdom)
- [ ] Configure performance alerts
- [ ] Create performance dashboard

### 7.4 Admin Metrics Dashboard
- [ ] Build /admin/metrics page
- [ ] Display key metrics:
  - Waitlist signups (daily/weekly/total)
  - Beta tester activity
  - Lesson completion rates
  - System health status
- [ ] Add export functionality for reports

---

## Phase 8: Security Hardening
**Priority:** High
**Dependencies:** Phase 1-4

### 8.1 Security Audit
- [ ] Review all API endpoints for vulnerabilities
- [ ] Implement proper input sanitization
- [ ] Add CSRF protection
- [ ] Configure security headers (CSP, HSTS, etc.)
- [ ] Review and update CORS policies

### 8.2 Rate Limiting & Protection
- [ ] Implement rate limiting on all forms
- [ ] Add IP-based blocking for suspicious activity
- [ ] Set up DDoS protection (Cloudflare)
- [ ] Configure WAF rules
- [ ] Implement session security

### 8.3 Data Protection
- [ ] Encrypt sensitive data at rest
- [ ] Implement secure password policies
- [ ] Add two-factor authentication for admin
- [ ] Create data retention policies
- [ ] Document GDPR compliance

---

## Phase 9: Content Preparation
**Priority:** Medium
**Dependencies:** Phase 6

### 9.1 Initial Content Creation
- [ ] Create 3-5 sample lessons for beta testing
- [ ] Develop 2-3 interactive labs
- [ ] Prepare lesson templates for consistency
- [ ] Create content style guide

### 9.2 Documentation
- [ ] Write beta tester guide
- [ ] Create admin user manual
- [ ] Document content creation process
- [ ] Prepare FAQ section
- [ ] Create troubleshooting guide

### 9.3 Content Management Tools
- [ ] Build admin interface for lesson creation
- [ ] Implement content preview functionality
- [ ] Add content versioning
- [ ] Create content scheduling system

---

## Phase 10: Pre-Launch Testing
**Priority:** Critical
**Dependencies:** All previous phases

### 10.1 Functional Testing
- [ ] Test all user flows (visitor, beta tester, admin)
- [ ] Verify email delivery and formatting
- [ ] Test payment flows (if applicable)
- [ ] Validate backup and restore procedures
- [ ] Check all integrations

### 10.2 Cross-Browser Testing
- [ ] Test on Chrome (Windows/Mac)
- [ ] Test on Safari (Mac/iOS)
- [ ] Test on Firefox
- [ ] Test on Edge
- [ ] Document any browser-specific issues

### 10.3 Mobile Testing
- [ ] Test on iOS devices (iPhone, iPad)
- [ ] Test on Android devices
- [ ] Verify responsive design breakpoints
- [ ] Test touch interactions
- [ ] Check mobile performance

### 10.4 Load Testing
- [ ] Set up load testing scenarios
- [ ] Test with expected beta traffic (10-20 concurrent users)
- [ ] Identify and fix bottlenecks
- [ ] Document performance baseline

### 10.5 Security Testing
- [ ] Run security scanning tools
- [ ] Perform penetration testing
- [ ] Test authentication bypass attempts
- [ ] Verify data encryption
- [ ] Check for exposed secrets

---

## Phase 11: Production Deployment
**Priority:** Critical
**Dependencies:** Phase 10

### 11.1 Infrastructure Setup
- [ ] Provision production server/hosting
- [ ] Configure domain and SSL certificates
- [ ] Set up CDN for static assets
- [ ] Configure production database
- [ ] Set up backup infrastructure

### 11.2 Deployment Pipeline
- [ ] Create production environment variables
- [ ] Set up CI/CD pipeline
- [ ] Configure automated deployments
- [ ] Create rollback procedures
- [ ] Document deployment process

### 11.3 Migration & Launch
- [ ] Migrate database to production
- [ ] Deploy application code
- [ ] Verify all services are running
- [ ] Run smoke tests
- [ ] Monitor initial traffic

### 11.4 Post-Deployment
- [ ] Monitor error rates
- [ ] Check performance metrics
- [ ] Verify email delivery
- [ ] Test critical user paths
- [ ] Create launch checklist

---

## Critical Path & Dependencies

### Week 1-2: Foundation
1. Phase 1: Authentication & Access Control
2. Phase 6: Backup & Restore System (parallel)
3. Phase 7: Analytics & Monitoring (partial)

### Week 3-4: Core Features
1. Phase 2: Waitlist & Newsletter System
2. Phase 3: Beta Tester Management System
3. Phase 5: Email Templates & Automation

### Week 5: Enhancement & Security
1. Phase 4: Feedback Collection System
2. Phase 8: Security Hardening
3. Phase 9: Content Preparation

### Week 6: Testing & Deployment
1. Phase 10: Pre-Launch Testing
2. Phase 11: Production Deployment

---

## Success Criteria

### Must Have (Launch Blockers)
- ✅ Admin-only access working correctly
- ✅ Waitlist/Newsletter signup functional
- ✅ Beta tester invitation system working
- ✅ Basic backup/restore tested
- ✅ Production deployment successful

### Should Have
- ✅ GitHub issue submission form
- ✅ Email automation configured
- ✅ Analytics tracking active
- ✅ Security hardening complete

### Nice to Have
- ✅ Advanced admin dashboard
- ✅ Comprehensive documentation
- ✅ Performance optimization

---

## Risk Mitigation

### High Risk Items
1. **Authentication misconfiguration** → Thorough testing of all user types
2. **Data loss** → Daily backups with tested restore procedures
3. **Security breach** → Security audit and penetration testing
4. **Poor performance** → Load testing and optimization before launch

### Contingency Plans
1. **Rollback procedure** documented for all deployments
2. **Backup communication channel** (email list) for beta testers
3. **Manual processes** documented for automated features
4. **Support escalation path** defined for critical issues

---

## Notes & Considerations

1. **Beta Tester Communication**: Direct email/calls for ~10 trusted users
2. **GitHub Issues**: Simple form to reduce friction in feedback
3. **Scalability**: Architecture should support transition to full launch
4. **Documentation**: Keep updated throughout development
5. **Testing**: Each phase should include comprehensive testing

---

**Document Version:** 1.0
**Last Updated:** August 2025
**Next Review:** Before Phase 10 completion