# Christmas gift sale: switch-on checklist

Beads epic `gwth-launch-v1uj`. Plan: `GWTH-launch-plan/kanban/research-docs/christmas-gift/REPORT.md`.
Sales open **1 December 2026 00:00 UK**; the £69 price ends at the end of **6 January 2027**.
Everything below happens in production only after David types GO LIVE (the website goes live all
at once, through `ship.py release website`). Nothing here is done by the code on its own.

## What the code already does by itself

- Sells nothing before `SALES_OPEN_AT` (default `2026-12-01T00:00:00Z`): `/gift` says when sales
  open, `/pricing` is unchanged, both checkout routes refuse, sign-up stays invite-only.
- Switches the whole course from £69 to £87 at `CHRISTMAS_SALE_ENDS_AT` (default
  `2027-01-07T00:00:00Z`) on every page and in the checkout route.
- Gifts never take the recipient's card and never renew (`mode: "payment"`).
- No `automatic_tax` anywhere (not VAT registered). The admin Gifts page shows the rolling
  12-month takings against the £90,000 threshold and warns from £75,000.

## Before the GO LIVE release (by about 28 November)

1. **David: the old gwth.ai Stripe account** (bead `gwth-launch-v1uj.1`). Check the business name
   and the payout bank. Then roll the live keys (Developers, API keys, roll the secret key) so the
   copies in `docs/old-site/.env.local` stop working, and delete that file's Stripe lines.
2. **Live prices and portal.** With the NEW live secret key, once:
   `I_MEAN_LIVE=yes STRIPE_SECRET_KEY=sk_live_... node scripts/stripe-setup-gift-sale.mjs`
   It prints six env lines (five price ids and the portal configuration id).
3. **Webhook endpoint** in the Stripe Dashboard: `https://gwth.ai/api/stripe/webhook`, events
   `checkout.session.completed`, `checkout.session.async_payment_succeeded`,
   `customer.subscription.created`, `customer.subscription.updated`,
   `customer.subscription.deleted`, `invoice.paid`, `invoice.upcoming`, `charge.refunded`.
   Copy its signing secret.
4. **Renewal reminders (DMCC readiness).** Billing settings: "Upcoming renewal events" at
   7 days, so `invoice.upcoming` arrives a week before each charge and GWTH emails the reminder.
5. **Statement descriptor** `GWTH.AI` (Settings, Business, Public details).
6. **Coolify env on the production app** (never in git):
   `BILLING_ENABLED=true`, `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`,
   `STRIPE_WEBHOOK_SECRET`, the six lines from step 2, `CRON_SECRET` (a new random value).
   Do NOT set `SALES_OPEN_AT` or `CHRISTMAS_SALE_ENDS_AT`; the defaults are the decided dates.
   Do NOT set `STRIPE_REQUIRE_TEST_MODE` or `EMAIL_OUTBOX_DIR` (hlab only).
7. **`PRIVATE_CONTENT_MODE=off`** in production. While it is locked, sign-up is closed and only
   allowlisted emails can see lessons, so neither a gift recipient nor a monthly payer could use
   the course. This opens sign-up and the free labs to everyone.
8. **Database migrations 016 to 032, all of them**, before the release that carries the code.
   Production has 001 to 015. The release code reads tables and columns from the later files, and
   at boot the schema guard (`src/lib/schema-guard.ts`) refuses to start if 016, 019, 021, 022
   or 032 is missing. Back up first, then
   apply them in order, each file in one transaction (all are additive and safe to run again):
   ```bash
   for f in supabase/migrations/0{16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32}_*.sql; do
     echo "== $f"
     ssh hetzner 'docker exec -i zo0gkcwoo0o4gow0go4cwk0o psql -U gwth -d gwth_v2 -v ON_ERROR_STOP=1 -1 -q' < "$f" || break
   done
   ```
   The July code keeps working on the migrated database, so they can go in before the deploy.
   What each one changes, the backup, the check query and the rollback are in the release
   runbook: https://hlab.taila51191.ts.net:8101/packet/board/release-runbook/index.html#migrations
   (rehearsed on a copy of the live database, bead `gwth-launch-j52c`).
9. **Scheduler.** A Coolify scheduled task on the production app, every 15 minutes:
   `curl -fsS -X POST -H "x-cron-secret: $CRON_SECRET" http://localhost:3000/api/cron/passes`
   (sends gift emails on their day, retries receipts, holds payers' charges while a month is not open).
10. **Email deliverability** (ship `email-deliverability`, mail-tester 9+): the Christmas morning
    email is the product. The printable card is the fallback.

## After the release

- 1 December: buy one real gift with a real card, open it, refund it from `/admin/passes`.
- Set the Month 2 and Month 3 open dates on `/admin/passes` the day each month is finished.
  Until a date is set, everyone who reaches that month waits without losing any time.
- 7 January: archive the £69 price (`gwth_pass_course_christmas_2026`) in the Dashboard as a
  second lock. The site has already switched to £87 by itself.

## hlab preview (test mode)

Env lives in `~/.config/gwth/preview-gift-sale.env` and `~/.config/gwth/stripe-test.env`
(loaded by the drop-in `/etc/systemd/system/gwth-v2-preview.service.d/40-gift-sale.conf`).
`STRIPE_REQUIRE_TEST_MODE=1` makes the app refuse any key that is not a test key. Stripe cannot
reach hlab, so `stripe listen --forward-to 127.0.0.1:3000/api/stripe/webhook` forwards events
(its `whsec_` goes in `stripe-test.env`). `gwth-gift-cron.timer` calls the scheduler every
15 minutes. Emails are also copied to `~/.local/state/gwth-preview-outbox/`.
End to end: `src/__tests__/pages/gift-sale.spec.ts` (instructions at the top of the file).
