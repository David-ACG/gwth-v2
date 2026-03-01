# Task: Build Lesson UI Demo Pages — Variants 6-10

## What to change

Create 5 more demo lesson pages at `/demo/lesson-v6` through `/demo/lesson-v10`. These complete the set of 10 variants. Each page renders the same lesson content ("Welcome to GWTH") using the shared components built in PROMPT_6, with different styling treatments.

**Read the full design spec first:** `kanban/1_planning/PLAN_2026-03-01_lesson-ui-design-spec.md`

All variants share the same foundation as V1-V5:
- 5-section flow: Intro Video → Objectives → Lesson Content → Q&A → Project
- Demo lesson data from `src/lib/data/demo-lesson-data.ts`
- Shared components from `src/components/lesson/`
- Light/dark mode, responsive design, GWTH design system colours
- Right-side table of contents on desktop

Also update the demo index page (`/demo/page.tsx`) to include working links for V6-V10 (replacing any placeholder links from PROMPT_7).

### Variant 6: "Blog Article" (Medium/Substack inspired)

- **Content width:** 800px max — wider, more editorial
- **Background:** Flat/seamless
- **Callout boxes:** Minimal — styled as blockquotes with thicker left border (`border-l-4`) and slight background tint. No icons, no labels. Just the border colour indicates type.
- **Visual style:** Blog/article reading experience. Larger headings. More visual weight on text. Pull quotes as visual breaks.
- **Typography:** H1: 2.5rem (40px) bold. H2: 1.75rem (28px) semibold. Body: 1.0625rem (17px) for a slightly more readable size. Line-height: 1.8. Very generous paragraph spacing (1.5em).
- **Pull quotes:** `text-xl leading-relaxed italic text-muted-foreground` with thick left border in primary colour. Used to highlight key statements from the lesson.
- **Code blocks:** Clean, minimal border, light background
- **TOC:** Right side, compact, blog-article style
- **Objectives:** Simple numbered list under a heading. No card, no background. Clean.
- **Inspiration:** Medium articles, Substack newsletters, long-form blog posts

### Variant 7: "Two-Column Content" (Margin notes)

- **Content width:** Main text at 650px with a 200px right margin column for notes/tips (total ~900px)
- **Background:** Flat/seamless
- **Callout boxes:** Rendered in the **right margin** alongside the relevant content (on desktop). On tablet/mobile, they inline below the relevant paragraph.
- **Visual style:** Academic textbook with margin annotations. Main text is clean and uninterrupted. Tips, notes, and key term definitions appear as margin notes.
- **Typography:** Standard `lesson-prose` for main text. Margin notes: `text-sm text-muted-foreground`.
- **Layout:** CSS Grid with `grid-template-columns: 1fr 200px` on desktop. Single column below 1024px.
- **Key terms:** Definition appears in the right margin (not as tooltip). On mobile, appears as a tooltip.
- **TOC:** Replaces the margin column above the fold — TOC at top-right, margin notes below as you scroll
- **Objectives:** Main column, simple bordered card
- **Inspiration:** Academic textbooks, Tufte-style margin notes, print layout traditions

### Variant 8: "Notion Blocks"

- **Content width:** 720px max, centred
- **Background:** Card content area (`bg-card`) on page background. But individual blocks within also have subtle background variation.
- **Callout boxes:** Notion-style — full-width blocks with rounded corners, background fills using GWTH palette (aqua/mint tints), and customisable emoji icons (rendered as text, not images). Slightly more colourful than Notion's defaults.
- **Visual style:** Block-based — every element feels like a discrete, self-contained block. Clear dividers (`<hr>`) between major sections. Toggle blocks for collapsible content (prominent chevrons).
- **Typography:** `lesson-prose` base. Headings have a subtle bottom border to define block boundaries.
- **Spacing:** Consistent 1rem between blocks, 2rem between major sections
- **Code blocks:** Full-width block with language label tab at top, Shiki highlighting
- **Toggle blocks:** Prominent — used for all collapsible content (not just deep dives). Click anywhere on the header row to toggle.
- **Dividers:** Visible between Objectives/Lesson/Q&A/Project sections
- **TOC:** Right side, shows block-level structure
- **Inspiration:** Notion pages, block-based editors

### Variant 9: "Colourful Documentation" (Mintlify inspired)

- **Content width:** 720px max, centred
- **Background:** Flat/seamless with subtle colour accents
- **Callout boxes:** Vibrant — stronger background fills (`bg-primary/15`, `bg-warning/15`, `bg-success/15`). Rounded corners. Icon + bold label. More visual presence than V1's subtle approach.
- **Visual style:** Colourful but structured. Section headings get a small colour indicator (dot or line) in the section's accent colour. The page feels alive with colour but not chaotic.
- **Typography:** `lesson-prose` base. H2 headings have a coloured left bar (`border-l-4 border-primary pl-4`) for emphasis.
- **Code blocks:** Dark theme always (even in light mode) — `bg-zinc-900 text-zinc-100`. Strong contrast. Filename tab with coloured accent. Copy button always visible (not hover-only).
- **Objectives:** Coloured banner card — `bg-gradient-to-r from-primary/10 to-accent/10` background with primary border. Each objective has a coloured bullet.
- **TOC:** Right side with colour-coded section indicators (e.g., video=blue, lesson=green, quiz=amber, project=mint)
- **Key terms:** Highlighted with `bg-accent/15 rounded px-1` — more visible than other variants
- **Inspiration:** Mintlify docs, react.dev, colourful documentation sites

### Variant 10: "Hybrid Best-of"

This is the **recommended starting point** — it combines the best patterns from all other variants:

- **Content width:** 720px max, centred (consensus from research: best for readability)
- **Background:** Flat/seamless main area. Only the Objectives card and Project section use card backgrounds.
- **Callout boxes:** react.dev-style left-border with subtle background (same as V1). This tested best across documentation sites.
- **Collapsible sections:** Notion-style toggle blocks with smooth animation (from V8)
- **Visual style:** Clean with purposeful colour. Not as sparse as V4 (Linear), not as colourful as V9. Middle ground.
- **Typography:** `lesson-prose` with 1.75 line-height. H2: 1.5rem semibold with 2em top margin. H3: 1.25rem semibold with 1.5em top margin. Generous but not extreme spacing.
- **Spacing:** Linear's 8px grid as the base (8, 16, 24, 32, 48px)
- **Code blocks:** Themed (light/dark matches system), border, copy button visible on hover, optional filename label
- **TOC:** Right side, clean text links, scroll-spy with `text-primary` active state, "On this page" label
- **Objectives:** Card with primary border accent, circle check icons, `bg-primary/5` background
- **Key terms:** Dotted underline + `bg-accent/5` background, tooltip with definition
- **Project milestones:** Numbered badges with vertical connecting line, progress bar, checkboxes
- **Quiz:** Clean inline cards with radio options and immediate feedback
- **Inspiration:** Best elements from react.dev (callouts, TOC) + Notion (toggles, blocks) + Linear (spacing, restraint) + Mintlify (polish, dark code blocks)

## Files likely affected

- `src/app/demo/page.tsx` (update — add V6-V10 links)
- `src/app/demo/lesson-v6/page.tsx` (new)
- `src/app/demo/lesson-v7/page.tsx` (new)
- `src/app/demo/lesson-v8/page.tsx` (new)
- `src/app/demo/lesson-v9/page.tsx` (new)
- `src/app/demo/lesson-v10/page.tsx` (new)

## Acceptance criteria

- [ ] `/demo` index page updated with all 10 variants showing correct names and descriptions
- [ ] `/demo/lesson-v6` renders "Blog Article" variant — wider content, larger type, pull quotes, minimal callouts
- [ ] `/demo/lesson-v7` renders "Two-Column Content" variant — margin notes on desktop, inline fallback on mobile
- [ ] `/demo/lesson-v8` renders "Notion Blocks" variant — block-based with dividers, toggle blocks, emoji callouts
- [ ] `/demo/lesson-v9` renders "Colourful Documentation" variant — vibrant callouts, dark code blocks, coloured accents
- [ ] `/demo/lesson-v10` renders "Hybrid Best-of" variant — clean combination of best patterns from all research
- [ ] All 5 variants work correctly in both light and dark mode
- [ ] All 5 variants are responsive: desktop (TOC + content), tablet (reflowed), mobile (full-width)
- [ ] V7 "Two-Column" correctly shows margin notes on desktop and inlines them on smaller screens
- [ ] V9 code blocks use dark theme even in light mode
- [ ] V10 is clearly the "polished" option — it should look the most refined and balanced
- [ ] Demo index page works as a proper navigation hub for all 10 variants
- [ ] All quiz sections functional, all code copy buttons work, all StepProgress checkboxes interactive
- [ ] `npm run build` passes with no errors
- [ ] `npm run lint` passes with no errors

## Notes

- Read `PLAN_2026-03-01_lesson-ui-design-spec.md` in `kanban/1_planning/` for the full design spec
- PROMPT_6 and PROMPT_7 must have been completed first — these pages depend on shared components, demo data, and the demo layout
- V10 "Hybrid Best-of" is intentionally the most polished — spend extra time making it feel right. It's the one David is most likely to choose as the basis for the real implementation.
- For V7 "Two-Column", use CSS Grid with `grid-template-columns: 1fr 200px` and a `@media (max-width: 1023px)` fallback to single column. The margin notes need a way to associate with specific content — consider using a `data-margin-note` attribute or a custom component
- Keep variant-specific styling in Tailwind classes on the page components. Do not create separate CSS files per variant.
- The demo pages should be enjoyable to browse — David will be comparing these side-by-side to pick a direction
