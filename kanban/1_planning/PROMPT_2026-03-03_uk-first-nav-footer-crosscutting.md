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
