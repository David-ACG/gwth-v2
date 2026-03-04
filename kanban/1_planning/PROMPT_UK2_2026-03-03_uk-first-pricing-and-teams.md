# Task: UK-First Positioning on Pricing Page and For-Teams Page

## What to change

Update the pricing page and for-teams page with UK-specific messaging, statistics, and positioning. This prompt assumes that the config pricing constants have already been changed to GBP and all dollar signs have been replaced with pound signs by the previous prompt (`PROMPT_2026-03-03_uk-first-landing-hero-about.md`). If that has not been done yet, do it now before proceeding.

### Context

GWTH.ai is repositioning to target the UK market first. The UK government's AI Skills Boost programme (launched January 2026, delivered by PwC for 4.1 million pounds) has been widely criticised. GWTH fills the gap. This prompt updates the pricing and for-teams pages to reflect UK-first positioning.

**Research files for reference** (read these for UK stats and positioning language):
- `C:\Projects\GWTH_V2\kanban\0_idea\Files\gwth-vs-government-ai-courses.md`
- `C:\Projects\GWTH_V2\kanban\0_idea\Files\ai-skills-hub-gwth-strategy.md`

### Pricing page updates (`src/app/(public)/pricing/page.tsx`)

1. **Metadata**: Update the description to use pound signs and reference UK pricing.

2. **Header subtitle**: Change from "Start free. Learn everything in 3 months. Stay current for the price of a coffee." to something that references the UK context, e.g.: "Start free. Learn everything in 3 months. Stay current for less than a flat white." (more British than "coffee")

3. **Add a government comparison callout**: Below the three pricing tiers and above the "earlybird note", add a new section -- a subtle callout card or banner that reads something like:

   > **How does this compare?**
   > The UK Government's AI Skills Boost offers 14 free foundation courses covering basic AI awareness -- roughly equivalent to GWTH's first two weeks. GWTH covers everything the government programme does in Month 1, then goes dramatically further with 94 hands-on projects, industry-specific modules, and enterprise transformation over 3 months.
   > [See the full comparison](/why-gwth)

   Style this as a `Card` with a border and subtle background (`bg-muted/30`), similar to the existing "For Teams" card at the bottom of the pricing page. Include a `Button` link to `/why-gwth` (this page will be created by a separate prompt; the link can exist before the page does).

4. **For Teams card**: Update the description to mention UK teams specifically. Change "Same per-person price" to include UK context, e.g.: "Same per-person price for UK teams of any size."

5. **Earlybird note**: Add a line about being UK-first, e.g.: "We are launching in the UK first. International pricing in USD and EUR will follow."

6. **Add a "Why not just use the free government course?" FAQ-style section**: Add a small accordion or expandable section below the government comparison callout with 3-4 Q&A items:
   - "Is the government AI Skills Boost enough?" -- Answer: covers basics in 20 minutes to 9 hours, equivalent to GWTH's first two weeks. No hands-on projects, no progression pathway, no enterprise content.
   - "Why should I pay when the government course is free?" -- Answer: The government course teaches you to ask AI a question. GWTH teaches you to build with AI. 94 projects, 3 capstones, daily updates, vendor-neutral.
   - "Can I do both?" -- Answer: Absolutely. Start with the government badge, then come to GWTH for everything it does not cover. We designed the course to work as the natural next step.

### For-teams page updates (`src/app/(public)/for-teams/page.tsx`)

1. **Metadata**: Update description to reference UK teams and GBP pricing.

2. **Hero subtitle**: Change from "The gap is not tools. It is skills." to include a UK angle, e.g.: "UK businesses are falling behind on AI skills. The gap is not tools -- it is training."

3. **Business case stats section**: Replace the current 3 stats with UK-specific statistics from the research files:
   - "21%" / "of UK workers feel confident using AI at work"
   - "1 in 6" / "UK businesses were using AI as of mid-2025"
   - "45%" / "less likely for micro businesses to adopt AI vs large firms"

   These are directly from the UK government's own research, which makes them authoritative.

4. **Business case description paragraph**: Update to reference UK specifically:
   > "Most AI training fails because it teaches tools, not skills. The UK government's own research shows only 21% of workers feel confident using AI. A 20-minute vendor course will not change that. 120 hours of hands-on, vendor-neutral training will."

5. **The Real Cost section**: Ensure all price references use pound signs (should already be done if config was updated). Update the salary reference from "$50k" to "30,000 pounds" (more typical UK salary reference for this audience).

6. **FAQ updates**:
   - Update the ROI answer to use GBP and UK salary references
   - Add a new FAQ: "How does this compare to the government's AI Skills Boost?" with answer: "The government programme covers AI awareness basics in 20 minutes to 9 hours. That is roughly equivalent to our first two weeks. GWTH goes dramatically further -- 94 hands-on projects, industry-specific modules, enterprise transformation, and content updated every day. Many teams complete the free government badge first, then use GWTH for the comprehensive skills their people actually need."
   - Update "Will this displace our employees?" answer to reference UK employment context

7. **Investment section**: Add a line below the price card: "All prices in GBP. International pricing coming soon."

8. **How it works section**: No changes needed.

9. **CTA section**: Update to reference UK teams, e.g.: "Ready to upskill your UK team?"

## Files likely affected
- `src/app/(public)/pricing/page.tsx` -- government comparison callout, FAQ section, UK messaging
- `src/app/(public)/for-teams/page.tsx` -- UK stats, GBP salary references, new FAQ, UK messaging throughout

## Acceptance criteria
- [ ] Pricing page metadata description references GBP pricing
- [ ] Pricing page has a government comparison callout card with a link to `/why-gwth`
- [ ] Pricing page has a small FAQ section about the government course (2-3 questions)
- [ ] Pricing page earlybird note mentions UK-first launch
- [ ] For-teams page hero subtitle references UK businesses
- [ ] For-teams page business case stats use UK-specific statistics (21% confidence, 1 in 6 businesses, 45% micro business gap)
- [ ] For-teams page business case description references UK government research
- [ ] For-teams page salary reference uses GBP (30,000 pounds not $50k)
- [ ] For-teams page has a new FAQ about the government AI Skills Boost
- [ ] For-teams page investment section mentions GBP currency
- [ ] For-teams page CTA references UK teams
- [ ] All price displays show pound signs (verify no remaining dollar signs in these two files)
- [ ] All copy uses British English spelling
- [ ] `npm test` passes with no failures
- [ ] The site builds successfully with `npm run build`

## Notes
- The `/why-gwth` page does not need to exist yet -- the link can be a forward reference. It is created by a separate prompt.
- If the config has not been updated to GBP by the previous prompt, do that first (change `COURSE_MONTHLY_PRICE` to `29`, `ONGOING_MONTHLY_PRICE` to `5`, and all `$` to pound signs across the codebase).
- Use statistics from the research files. Do not invent numbers. The key UK stats are: 21% worker confidence, 1 in 6 businesses using AI, 45% micro business gap, 400 billion pounds potential economic impact, 10 million workers target.
- Keep the "For Teams" card on the pricing page -- just update its copy for UK context.

---
## Implementation Notes — 2026-03-04 06:56
- **Commit:** 8d75c7a feat: uk-first positioning on pricing and for-teams pages
- **Tests:** 14 files, 110 tests — all passed
- **Verification URL:** http://192.168.178.50:3001 (P520 test)
- **Playwright check:** not applicable (copy-only changes, no new interactive behaviour)
- **Changes summary:**
  - Pricing page: updated metadata description to reference UK/GBP pricing
  - Pricing page: changed subtitle from "coffee" to "flat white" (British)
  - Pricing page: added government comparison callout Card with Info icon and link to /why-gwth
  - Pricing page: added 3-question FAQ accordion (gov AI Skills Boost, why pay, can I do both)
  - Pricing page: updated earlybird note to mention UK-first launch and international pricing coming
  - Pricing page: updated For Teams card copy — "Same per-person price for UK teams of any size"
  - For-teams page: updated metadata description to reference UK teams
  - For-teams page: updated hero subtitle — "UK businesses are falling behind on AI skills"
  - For-teams page: replaced 3 business case stats with UK-specific data (21% confidence, 1 in 6 businesses, 45% micro business gap) with DSIT source attribution
  - For-teams page: updated business case paragraph to reference UK government research
  - For-teams page: updated salary reference from £35k to £30,000
  - For-teams page: added new FAQ — "How does this compare to the government's AI Skills Boost?"
  - For-teams page: updated "Will this displace our employees?" FAQ to reference UK employment law
  - For-teams page: updated ROI FAQ salary from £35k to £30,000
  - For-teams page: added "All prices in GBP. International pricing coming soon." under investment card
  - For-teams page: updated CTA to "Ready to upskill your UK team?"
- **Deviations from plan:** Salary was already £35k (not $50k as prompt suggested — previous UK prompt had already converted). Changed to £30,000 as specified.
- **Follow-up issues:** None

---
## Testing Checklist — 2026-03-04 06:56
**Check the changes:** http://192.168.178.50:3001
- [ ] Page loads without errors
- [ ] Pricing page (/pricing) shows "flat white" subtitle and government comparison callout card
- [ ] Pricing page FAQ accordion expands/collapses for all 3 government course questions
- [ ] Pricing page earlybird note mentions UK-first launch
- [ ] Pricing page For Teams card mentions "UK teams of any size"
- [ ] For-teams page (/for-teams) shows UK-specific stats (21%, 1 in 6, 45%)
- [ ] For-teams page business case paragraph references UK government research
- [ ] For-teams page salary reference shows £30,000 (not £35k or $50k)
- [ ] For-teams page FAQ includes "How does this compare to the government's AI Skills Boost?"
- [ ] For-teams page investment section shows "All prices in GBP" note
- [ ] For-teams page CTA says "Ready to upskill your UK team?"
- [ ] Light/dark mode correct on both pages
- [ ] Mobile responsive on both pages
- [ ] No console errors

### Actions for David
Visit http://192.168.178.50:3001/pricing and http://192.168.178.50:3001/for-teams. Check all the items above. Review the copy for tone and accuracy — all statistics come from the UK government's own DSIT research published alongside the AI Skills Boost programme.

**Review this file:** `file:///C:/Projects/GWTH_V2/kanban/1_planning/PROMPT_UK2_2026-03-03_uk-first-pricing-and-teams.md`
