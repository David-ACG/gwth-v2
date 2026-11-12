# Content protection, first slice: what GO LIVE has to do

Bead `gwth-launch-735c`. David's decisions, 12 November 2026:

1. Lesson media links are signed by the website itself (option A), with the read-only R2 key it already has.
2. The too-fast monitor alerts only (option A): the learner sees nothing.
3. A flagged account's next month waits until David has looked, with their clock held.
4. Month 2 opens only after 75% of Month 1's core lessons are complete, Month 3 after 75% of Month 2's, with the clock held ("set it to 75% lessons complete for now and we can adjust as needed").

The code is safe to release before the Cloudflare switches: signed links work while the public addresses still work too. Protection only starts once the public doors are closed (step 4). Nothing below runs until David types GO LIVE.

## Before the release

1. **Terms and pricing page.** The 75% rule has to be on the pricing page and in the Terms *before anyone pays* (consumer law). The review hold and the monitoring need a sentence in the Terms and the privacy notice (draft in `GWTH-launch-plan/research/2026-09-27_content-protection.md`, "Privacy notice paragraph"). A solicitor checks the wording. **Do not switch the gate on for paying students until this text is live.**
   - Written 12 Nov 2026 (ship `content-protection-wording`; latest Astra wrote it, latest Sol polished and checked it): `/pricing` section "When each course month opens" above both buying options and the notes beside each button; the months notes on `/`, `/lessons`, `/for-teams` and the `/gift` answer; Terms sections 8 "How course months open" and 9 "Protecting the course" (old 8 to 16 are now 10 to 18), the licence in section 2, and consistency changes in sections 4, 6, 7, 10, 12 and 13; Privacy section 1 "Course protection" with retention (90 days, 12 months after a check is resolved), plus sections 2, 3, 4 and 6.
   - The solicitor's checklist (12 points) is `GWTH-launch-plan/completion/content-protection-wording/solicitor.md`. David chose option A on the decision page `content-protection-wording` on 12 Nov 2026 ("I agree with your recommendation"): one short section before the buying options, a reminder beside each button. That is what the preview runs (a7eddcb), so nothing more to build; the solicitor's check is the remaining step.
   - **The share is printed from `DEFAULT_GATE_PERCENT`** (`src/lib/protection/month-hold.ts`), not from `MONTH_GATE_PERCENT`. To change the share: change the Terms and pricing wording first (the Terms promise notice before a change), then `DEFAULT_GATE_PERCENT`, then `MONTH_GATE_PERCENT` on production. Never set `MONTH_GATE_PERCENT` above what the Terms say.
   - If the persona-test pricing page (branch `persona-apply`, ship `public-pages-persona-apply`) is approved, carry this wording onto it: it keeps the same `TermsNote` and `pricing-offer-months` blocks, and needs the `MonthOpeningRules` section above its pay-once band.
2. **Migration 033** on production:
   ```bash
   ssh hetzner 'docker exec -i zo0gkcwoo0o4gow0go4cwk0o psql -U gwth -d gwth_v2' < supabase/migrations/033_content_protection.sql
   ```
3. **Production settings** (Coolify app `tw0cc8oc0w4scwoccs0cw0go`, then redeploy):
   - `S3_ENDPOINT`, `S3_BUCKET`, `S3_ACCESS_KEY`, `S3_SECRET_KEY`: the site's **read-only** R2 key (the `R2_READ_*` pair in `~/.cloudflare-gwth.env` on hlab, scoped to `gwth-media`). Never the write key.
   - `MEDIA_SIGNED_LINKS=1`
   - `MONTH_GATE_PERCENT=75` (0 switches the gate off; this is the one place to change the share)
   - Alerts on all three channels (David, 12 Nov: "lets do all 3 - slack, email and telegram"):
     - `FLAG_ALERT_SLACK_WEBHOOK`: the incoming-webhook address David creates for his alerts channel (secret).
     - `FLAG_ALERT_EMAIL`: David's address (sent through Plunk, which production already has).
     - `FLAG_ALERT_TELEGRAM_TOKEN` and `FLAG_ALERT_TELEGRAM_CHAT_ID`: the GWTH bot (`~/.gwth-telegram.env` on hlab).
     Each is independent; one failing never stops the others.

## The release

The normal GO LIVE (`ship.py release website`). Then check on gwth.ai, signed in as a learner, that a lesson's video, audio and pictures load and that their addresses start with `https://gwth-media.<account>.r2.cloudflarestorage.com/` and carry `X-Amz-Signature`.

## 4. Close the public doors (Cloudflare dashboard, about 5 minutes)

Only after the check above passes, or every lesson's media stops loading.

**a. Block the lessons folder on media.gwth.ai (one free custom rule).**
1. Cloudflare dashboard, account, the `gwth.ai` zone.
2. Security, then WAF, then Custom rules, then Create rule.
3. Name: `Lesson media only through signed links`.
4. Expression (Edit expression): `(http.host eq "media.gwth.ai" and starts_with(http.request.uri.path, "/lessons/"))`
5. Action: Block. Deploy.

`/site/` (homepage film, Start Here) and `/email/` stay public.

**b. Turn off the bucket's public r2.dev address.**
1. R2, then the `gwth-media` bucket, then Settings.
2. Public access, R2.dev subdomain: Disallow.
3. Leave the custom domain `media.gwth.ai` connected (it serves `/site/` and `/email/`).

**c. Prove it.** From any machine, signed out:
```bash
curl -sI https://media.gwth.ai/lessons/m1_l01/video/lesson_01_intro.mp4 | head -1   # 403
curl -sI https://media.gwth.ai/site/start-here/2026-11-06/poster-light.jpg | head -1   # 200 (or whichever site file exists)
```
and a lesson still plays for a signed-in learner.

**Undo** (if lessons stop loading): delete or disable the custom rule in step a. Nothing else needs to change; the site keeps signing links either way.

## What the learner sees

- Nothing new while they learn at a normal pace.
- On the course page: "Month 2 opens once you've finished 75% of the core lessons in Month 1: 20 of 26 lessons. You've finished 5 so far."
- When the gate holds them: a notice that their time (pass) or next payment (monthly) waits.
- When David is reviewing them: "Month 2 opens after a quick check. Someone from our team will take a quick look ... usually within a day", with a contact link.

## Where David looks

- `/admin/flagged` on gwth.ai: each flagged account, its reasons and timeline, with Looks fine, Suspend and Reinstate.
- The alert channel he picks.
