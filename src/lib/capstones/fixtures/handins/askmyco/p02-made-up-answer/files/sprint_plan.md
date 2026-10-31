# Production Sprint Plan: AskMyCo

Owner: J. Ellis
Date: 2026-10-29
Target deployment path: managed cloud
Target go-live date: 2026-11-16

## Day 1: Environments

- Artefact: local, preview and production, each with its own Neon branch and secrets
- Reference: Vercel environments docs
- Done when: a preview URL boots from a clean clone of main

## Day 2: Secrets and supply chain

- Artefact: all keys in Vercel settings; production needs a reviewer; dependencies reviewed
- Reference: GitHub Actions secrets guidance; NCSC supply chain principles
- Done when: a search for 'sk-' finds nothing and a production deploy waits for my approval

## Day 3: Database, migrations, rollback

- Artefact: forwards and backwards migrations run in CI; backup restored into a scratch branch
- Reference: Neon production checklist
- Done when: a restore drill is done and timed

## Day 4: Deploy pipeline and rollback drill

- Artefact: preview-to-production promotion written down; one rollback done
- Reference: Vercel instant rollback docs
- Done when: I have rolled back once on a quiet day

## Day 5: Observability minimum

- Artefact: logs, errors and cost per answer for the last 24 hours
- Reference: Twelve-Factor App logs
- Done when: I can say what happened in the last hour and what it cost

## Day 6: Rate-limit and cost guardrails

- Artefact: spend caps on OpenAI and Anthropic; retries with backoff
- Reference: Anthropic and OpenAI production guidance
- Done when: a spend cap is tested and one call survives a rate-limit reply

## Day 7: UK GDPR readiness pack

- Artefacts:
  - DPIA
  - ROPA
  - Subject Access Request procedure
  - retention schedule
  - ICO AI risk toolkit applied
- Reference: ICO DPIA, ROPA and right of access guidance
- Done when: each document exists and is dated

## Day 8: Security floor

- Artefacts:
  - Cyber Essentials self-assessment
  - two-step sign-in on every service
  - OWASP Top 10 for LLM Applications review
  - OWASP Top 10 for Agentic Applications review
  - DSIT AI Code applied
- Reference: NCSC Cyber Essentials; DSIT AI Cyber Security Code of Practice; OWASP
- Done when: each checklist is filled in, dated and signed

## Day 9: Accessibility and go-live readiness

- Artefact: WCAG 2.2 AA check of the sign-in and chat pages; assisted-digital plan
- Reference: GDS Service Standard
- Done when: failing items are listed with a fix date

## Day 10: First paying client pack

- Artefacts:
  - Companies House status
  - HMRC registration
  - Stripe Tax for UK VAT
  - master services agreement and order form
  - status page
  - incident runbook
- Reference: Companies House and HMRC guidance; Stripe Tax docs
- Done when: the pack folder has each named document

Signed: J. Ellis
Date: 2026-10-29
