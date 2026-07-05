# Task: UK-First Messaging on Landing Page, Hero Section, and About Page

## What to change

Update the landing page (hero section, differentiators, audience cards, pricing preview, final CTA), and the about page to position GWTH as a **UK-based, UK-first** AI course. The tone should be welcoming to international learners but clearly signal that the UK is the primary market and that GWTH is built in the UK. This also includes updating the config constants from USD to GBP pricing.

### Context

GWTH.ai is repositioning to target the UK market first. The UK government launched an "AI Skills Boost" programme (January 2026) that has been widely criticised for being shallow, vendor-biased, and poorly executed. GWTH fills the gap the government programme leaves open. This prompt handles the foundational messaging changes; a separate prompt will create a dedicated comparison page.

**Research files for reference** (read these for UK stats, press quotes, and positioning language):
- `C:\Projects\GWTH_V2\kanban\0_idea\Files\gwth-vs-government-ai-courses.md`
- `C:\Projects\GWTH_V2\kanban\0_idea\Files\ai-skills-hub-gwth-strategy.md`

### Pricing change

The pricing is moving from USD to GBP. Update the config constants:
- `COURSE_MONTHLY_PRICE`: change from `37.5` (USD) to `29` (GBP)
- `ONGOING_MONTHLY_PRICE`: change from `7.5` (USD) to `5` (GBP)
- `TOTAL_COURSE_COST` is computed automatically from `COURSE_MONTHLY_PRICE * TOTAL_COURSE_MONTHS`
- All price displays across the site use these constants, so changing config is the single source of truth

Add a comment above the pricing constants noting the currency is GBP. The `$` symbols rendered in JSX on all pages that display prices must be changed to the pound sign. Search the entire `src/` directory for `$${` and `$` followed by price references and replace with the pound sign. Key files to check:
- `src/app/(public)/page.tsx` (landing page pricing section)
- `src/app/(public)/pricing/page.tsx` (pricing page)
- `src/app/(public)/for-teams/page.tsx` (for-teams investment section and FAQ)
- `src/components/landing/hero-section.tsx` (if any price references)

### Landing page hero changes (`src/components/landing/hero-section.tsx`)

1. Add a small "UK-first" badge/pill above the headline, e.g.: `Built in the UK. For the world.` -- use the same `rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary` pattern used on the tech-radar and news pages.
2. Update the subtitle paragraph to weave in a UK reference naturally. The current text is:
   > "Learn to build apps, automate workflows, research faster, create content, analyse data, and solve real problems using AI -- all in plain English."

   Add a sentence like: "Built in the UK by practitioners, not marketers. Independent of any vendor or government programme."
3. Keep the stats unchanged (94 projects, 60+ tools, 3 months).

### Landing page differentiators update (`src/app/(public)/page.tsx`)

In the `differentiators` array, update the "Completely independent" card to strengthen the UK angle:
- Current title: "Completely independent"
- New title: "Independent and UK-based"
- Update description to mention that GWTH is based in the UK and is not funded by or affiliated with any government programme or US tech vendor. Reference the fact that the UK government's AI training is delivered by US big tech companies, and GWTH is the independent British alternative.

### Landing page audiences update (`src/app/(public)/page.tsx`)

In the `audiences` array, make the descriptions more UK-relevant:
- For "You have been made redundant and need to reskill" -- reference the UK job market specifically (e.g., "UK employers are hiring for exactly these skills")
- For "You run a small business" -- reference UK SMEs specifically (e.g., "UK SMEs that adopt AI are X% more productive" or similar, using stats from the research files: "Micro businesses are 45% less likely to adopt AI than large businesses")

### Landing page pricing section update (`src/app/(public)/page.tsx`)

- Change all `$` currency symbols to the pound sign in the pricing section JSX
- The pricing values come from config constants, so only the currency symbol in the JSX needs changing

### Landing page final CTA update (`src/app/(public)/page.tsx`)

Add a subtle UK reference to the final CTA section. For example, update the description paragraph to include something like: "Based in the UK. Built for everyone who wants to stay relevant."

### About page updates (`src/app/(public)/about/page.tsx`)

1. **Hero section**: Add "Based in the UK" to the subtitle text. Update the founder description to mention being UK-based.
2. **The GWTH Story section**: Add a paragraph about being based in the UK, understanding the UK skills gap, and building a course that addresses the specific needs of UK workers and businesses. Reference that only 21% of UK workers feel confident using AI.
3. **Independence Pledge section**: Strengthen this by contrasting with the UK government's approach of outsourcing AI training to US big tech. Add a line about GWTH being a British company with no foreign vendor partnerships.
4. **The Numbers section**: Add a stat for "UK-based" (e.g., a stat card showing "UK" with label "Based & Built").

### Tone guidance

- Be proud of being UK-based but not jingoistic or exclusionary
- Frame it as "starting with the UK" not "only for the UK"
- Use British English throughout (already the case, but double-check: "organised" not "organized", "programme" not "program", "colour" not "color" in copy text)
- Never bash the government programme directly on these pages -- save the detailed comparison for the `/why-gwth` page (a separate prompt)
- Use real statistics from the research files where they strengthen the message

## Files likely affected
- `src/lib/config.ts` -- change pricing constants from USD to GBP, add currency comment
- `src/components/landing/hero-section.tsx` -- add UK badge, update subtitle
- `src/app/(public)/page.tsx` -- update differentiators, audiences, pricing section currency, final CTA
- `src/app/(public)/about/page.tsx` -- update hero, story, independence pledge, numbers
- `src/app/(public)/pricing/page.tsx` -- change `$` to pound sign in all price displays
- `src/app/(public)/for-teams/page.tsx` -- change `$` to pound sign in all price displays and FAQ answers

## Acceptance criteria
- [ ] `COURSE_MONTHLY_PRICE` in `src/lib/config.ts` is `29` (not `37.5`)
- [ ] `ONGOING_MONTHLY_PRICE` in `src/lib/config.ts` is `5` (not `7.5`)
- [ ] A comment above the pricing constants indicates the currency is GBP
- [ ] All price displays across the site show the pound sign, not the dollar sign
- [ ] The hero section has a "Built in the UK" badge/pill
- [ ] The hero subtitle references being UK-based and independent
- [ ] The "Completely independent" differentiator card is updated to "Independent and UK-based"
- [ ] At least one audience card references UK-specific context (UK job market, UK SMEs)
- [ ] The landing page final CTA mentions being UK-based
- [ ] The about page hero mentions being UK-based
- [ ] The about page story section includes a paragraph about the UK skills gap
- [ ] The about page independence pledge contrasts with government/vendor approach
- [ ] The about page numbers section includes a "UK-based" stat
- [ ] All copy uses British English spelling
- [ ] `npm test` passes with no failures
- [ ] The site builds successfully with `npm run build` (no TypeScript errors)

## Notes
- The pricing page and for-teams page have their own dedicated prompt for deeper UK content changes, but the currency symbol fix must happen here because it is a cross-cutting change driven by the config update.
- Do NOT create any new pages in this prompt. The `/why-gwth` comparison page is handled by a separate prompt.
- Do NOT modify the tech radar in this prompt. Country flags are handled by a separate prompt.
- Read the research files referenced above for accurate UK statistics to use in copy.

---
## Implementation Notes — 2026-03-04 00:30
- **Commit:** c742834 feat: uk-first messaging and GBP pricing across all pages
- **Tests:** 110/110 passed (14 test files, 0 failures)
- **Verification URL:** http://192.168.178.50:3001
- **Playwright check:** skipped (health endpoint returned 200; visual check deferred to Gate 4)
- **Changes summary:**
  - `src/lib/config.ts` — COURSE_MONTHLY_PRICE 37.5→29, ONGOING_MONTHLY_PRICE 7.5→5, added GBP comment
  - `src/components/landing/hero-section.tsx` — added "Built in the UK. For the world." badge pill, updated subtitle
  - `src/app/(public)/page.tsx` — "Independent and UK-based" differentiator, UK stats in audience cards, £ symbols in pricing, UK reference in final CTA
  - `src/app/(public)/about/page.tsx` — "Based in the UK" hero, UK skills gap paragraph, British company independence pledge, "UK Based & built" stat
  - `src/app/(public)/pricing/page.tsx` — all $ → £, updated metadata description
  - `src/app/(public)/for-teams/page.tsx` — all $ → £, £35k salary reference, updated FAQ
  - `src/app/(dashboard)/settings/page.tsx` — 3x $ → £ for subscription prices
  - `src/app/(dashboard)/dashboard/page.tsx` — 1x $ → £ for subscribe button
  - `src/app/(public)/pricing/pricing.test.tsx` — updated 4 test expectations to GBP values
  - `src/app/(public)/for-teams/for-teams.test.tsx` — updated 2 test expectations to GBP values
- **Deviations from plan:** None. All acceptance criteria met.
- **Follow-up issues:** None discovered.

---
## Testing Checklist — 2026-03-04 00:30
**Check the changes:** http://192.168.178.50:3001

- [ ] Landing page loads without errors
- [ ] Hero shows "Built in the UK. For the world." badge pill
- [ ] Hero subtitle mentions UK-based and independent
- [ ] "Independent and UK-based" differentiator card visible
- [ ] Audience cards show UK-specific stats (21% confidence, 45% micro business gap)
- [ ] Pricing section shows £29.00 and £5.00 (not $ signs)
- [ ] Final CTA mentions "Based in the UK"
- [ ] About page (/about) hero mentions "Based in the UK"
- [ ] About page story section has UK skills gap paragraph
- [ ] About page independence pledge contrasts with government approach
- [ ] About page numbers section has "UK Based & built" stat (5 columns)
- [ ] Pricing page (/pricing) shows all prices in £ (£0, £29.00, £5.00, £87.00)
- [ ] For Teams page (/for-teams) shows £ prices and £35k salary reference
- [ ] Dashboard pricing references show £ (login required to check)
- [ ] Light/dark mode correct on all changed pages
- [ ] Mobile responsive on landing page hero and about page
- [ ] No console errors

### Actions for David
Check the URL above (http://192.168.178.50:3001) and tick the boxes. Key pages to visit:
1. `/` — landing page (hero badge, differentiators, audience cards, pricing, final CTA)
2. `/about` — about page (hero, story, independence pledge, numbers)
3. `/pricing` — pricing page (all £ symbols)
4. `/for-teams` — for teams page (£ symbols, £35k salary)

**Review this file:** `file:///C:/Projects/GWTH_V2/kanban/1_planning/PROMPT_UK1_2026-03-03_uk-first-landing-hero-about.md`
