# Task: UK-First Updates to Navigation, Footer, and Cross-Cutting Concerns

## What to change

Update the site navigation, footer, and any remaining cross-cutting elements to reflect UK-first positioning. This is the final prompt in the UK-first series and handles all the connecting tissue.

### Context

This is the fifth and final prompt in the GWTH UK-first positioning series. By this point, the following should already be implemented:
1. Landing page, hero, and about page UK messaging (PROMPT_2026-03-03_uk-first-landing-hero-about.md)
2. Pricing and for-teams UK positioning (PROMPT_2026-03-03_uk-first-pricing-and-teams.md)
3. Tech radar country flags (PROMPT_2026-03-03_tech-radar-country-flags.md)
4. `/why-gwth` comparison page (PROMPT_2026-03-03_why-gwth-comparison-page.md)

This prompt ties everything together with navigation, footer, and cross-cutting polish.

### Navigation updates (`src/components/layout/public-nav.tsx`)

1. **Add "Why GWTH" to the nav links**: Add a new entry to the `navLinks` array:
   ```typescript
   { href: "/why-gwth", label: "Why GWTH" }
   ```
   Position it first or second in the list -- it is a key marketing page that should be prominent. Suggested order: About, Why GWTH, Pricing, For Teams, Tech Radar, News.

2. **Verify mobile nav**: The nav uses a `Sheet` for mobile. Ensure the new link appears in the mobile menu as well (it should, if it is in the `navLinks` array).

### Footer updates (`src/components/layout/footer.tsx`)

1. **Add "Why GWTH" link**: Add `{ href: "/why-gwth", label: "Why GWTH" }` to the "Product" link group.

2. **Update the tagline**: Change the current bottom-right text from:
   > "Independent. No sponsors. No ads. No vendor partnerships."

   To:
   > "Independent. UK-based. No sponsors. No ads. No vendor partnerships."

3. **Add "Based in the United Kingdom" line**: Below the tagline or in the copyright area, add a subtle line: "Based in the United Kingdom" with a small UK flag emoji (optional). This is a trust signal.

4. **Update the footer description**: Change the current description from:
   > "Learn to build apps, automate workflows, and solve real problems using AI -- all in plain English. No coding required."

   To something that includes the UK angle:
   > "UK-based AI training. Learn to build apps, automate workflows, and solve real problems using AI -- all in plain English. No coding required."

### Metadata base URL verification

Verify that the root layout metadata (`src/app/layout.tsx`) has the correct `metadataBase`:
```tsx
metadataBase: new URL("https://gwth.ai"),
```
This should already be correct but verify it.

### Sitemap update (`src/app/sitemap.ts`)

If a sitemap generator exists, add the new `/why-gwth` route to it. Check if `src/app/sitemap.ts` exists and update it.

### robots.ts verification

Verify `src/app/robots.ts` does not block the new `/why-gwth` route.

### British English audit

Do a final pass across all public-facing page files to ensure British English spelling is used consistently:
- "organised" not "organized"
- "programme" not "program" (when referring to a scheme/initiative)
- "recognised" not "recognized"
- "analyse" not "analyze"
- "behaviour" not "behavior"
- "colour" not "color" (in copy text, NOT in code/CSS)
- "defence" not "defense"
- "licence" not "license" (noun)
- "specialisation" not "specialization"

Focus on these files:
- `src/app/(public)/page.tsx`
- `src/app/(public)/about/page.tsx`
- `src/app/(public)/pricing/page.tsx`
- `src/app/(public)/for-teams/page.tsx`
- `src/app/(public)/why-gwth/page.tsx`
- `src/components/landing/hero-section.tsx`
- `src/components/layout/footer.tsx`

Note: Do NOT change British English to American English. The existing codebase already uses British English in most places. Just verify consistency.

### Contact page check (`src/app/(public)/contact/page.tsx`)

Briefly check the contact page. If it exists and has content, add a line about being UK-based if not already present.

### Test verification

After all changes, run `npm test` and `npm run build` to verify everything works.

## Files likely affected
- `src/components/layout/public-nav.tsx` -- add "Why GWTH" nav link
- `src/components/layout/footer.tsx` -- add "Why GWTH" footer link, update tagline, add UK-based line
- `src/app/sitemap.ts` -- add `/why-gwth` route (if file exists)
- Various public page files -- British English audit (edits only if spelling errors found)

## Acceptance criteria
- [ ] "Why GWTH" link appears in the desktop navigation
- [ ] "Why GWTH" link appears in the mobile navigation menu
- [ ] "Why GWTH" link appears in the footer under "Product"
- [ ] Footer tagline includes "UK-based"
- [ ] Footer has a "Based in the United Kingdom" line
- [ ] Footer description includes UK angle
- [ ] The `/why-gwth` route is in the sitemap (if sitemap.ts exists)
- [ ] The `/why-gwth` route is not blocked by robots.ts
- [ ] All public-facing copy uses consistent British English spelling
- [ ] No remaining dollar signs in any public-facing page (spot check)
- [ ] `npm test` passes with no failures
- [ ] The site builds successfully with `npm run build`

## Notes
- This prompt has no heavy implementation -- it is mostly connecting work and polish. It should be quick.
- The nav link order matters for UX. "Why GWTH" should be prominent but not the first link (keep "About" first for convention).
- The British English audit is a scan, not a rewrite. Only change words that are genuinely American English. Do not rephrase sentences.
- If you find any remaining dollar signs in price displays, fix them (they should have been caught by the first prompt, but this is a safety net).

---
## Implementation Notes — 2026-03-04 15:26
- **Commit:** bec26b8 feat: add UK-first updates to footer, sitemap, and contact page
- **Tests:** 14 test files, 110 tests — all passed
- **Verification URL:** http://192.168.178.50:3001 (P520 test)
- **Playwright check:** not applicable — changes are text/link updates only, verified via test suite
- **Changes summary:**
  - Added "Why GWTH" link to footer Product section (was already in Learn section and nav)
  - Updated footer tagline from "Independent. No sponsors..." to "Independent. UK-based. No sponsors..."
  - Added "Based in the United Kingdom 🇬🇧" line below the tagline in footer
  - Updated footer description to lead with "UK-based AI training."
  - Fixed British English in footer JSDoc comment ("organized" → "organised")
  - Added /why-gwth, /for-teams, /tech-radar, /contact routes to sitemap.ts
  - Added UK-based mention to contact page description
  - Verified: nav already had "Why GWTH" in correct position (About, Why GWTH, Pricing, For Teams, Tech Radar, News)
  - Verified: metadataBase correctly set to https://gwth.ai in root layout
  - Verified: robots.ts does not block /why-gwth (only blocks dashboard/settings/profile/bookmarks/notifications)
  - British English audit: all 7 target files use consistent British English (programme, analyse, organised, specialisation, etc.) — no corrections needed
  - Dollar sign audit: no dollar signs found in any public-facing page — all prices use £
- **Deviations from plan:** Nav already had "Why GWTH" from a previous prompt (UK4), so no nav changes were needed
- **Follow-up issues:** None

---
## Testing Checklist — 2026-03-04 15:26
**Check the changes:** http://192.168.178.50:3001
- [ ] Page loads without errors
- [ ] Footer shows "Why GWTH" link under Product column
- [ ] Footer tagline reads "Independent. UK-based. No sponsors. No ads. No vendor partnerships."
- [ ] Footer shows "Based in the United Kingdom 🇬🇧" line
- [ ] Footer description starts with "UK-based AI training."
- [ ] Contact page mentions "GWTH is based in the United Kingdom"
- [ ] Navigation shows Why GWTH link (desktop and mobile)
- [ ] Light/dark mode correct
- [ ] Mobile responsive
- [ ] No console errors

### Actions for David
Visit http://192.168.178.50:3001 and scroll to the footer to verify the UK-based messaging. Check the contact page at /contact. Verify the "Why GWTH" link works in both the footer and nav. Toggle dark mode to confirm text is readable.

**Review this file:** `file:///C:/Projects/GWTH_V2/kanban/1_planning/PROMPT_UK5_2026-03-03_uk-first-nav-footer-crosscutting.md`
