# Task: Build Lesson UI Demo Pages — Variants 1-5

## What to change

Create 5 demo lesson pages at `/demo/lesson-v1` through `/demo/lesson-v5`. Each page renders the same lesson content ("Welcome to GWTH") using the shared components built in PROMPT_6, but with different styling, layout, and visual treatment.

**Read the full design spec first:** `kanban/1_planning/PLAN_2026-03-01_lesson-ui-design-spec.md` — it contains the 5-section lesson structure, component specs, typography, and responsive breakpoints.

All variants share:

- The same 5-section flow: Intro Video → Objectives → Lesson Content → Q&A → Project
- The same demo lesson data from `src/lib/data/demo-lesson-data.ts`
- The same shared components from `src/components/lesson/`
- Light and dark mode support
- Responsive design (desktop, tablet, mobile)
- The GWTH design system colours (CSS custom properties only)
- A right-side table of contents on desktop
- No left sidebar (these are standalone demo pages, not inside the dashboard layout)

Each variant applies different CSS classes, spacing, backgrounds, and component configurations to explore the design space.

### Demo Index Page

Create `/demo/page.tsx` — a simple index page listing all 10 variants (V6-V10 will be added later) with:

- Title: "Lesson UI Demo Variants"
- Cards or links for each variant with its name and 1-line description
- Links to `/demo/lesson-v1` through `/demo/lesson-v10` (V6-V10 will 404 until PROMPT_8 runs)
- Light/dark toggle button

### Variant 1: "Documentation Clean" (react.dev inspired)

- **Content width:** 720px max, centred
- **Background:** Flat/seamless — content area uses page background directly, no card wrapper
- **Callout boxes:** Left-border style (4px left border), subtle background fills (`bg-primary/5` etc.)
- **Visual style:** Clean, minimal — muted colours, no heavy borders or shadows
- **Typography:** `lesson-prose` base class. Line-height 1.75. Headings: semibold, tight tracking.
- **Spacing:** Generous — 2em between sections, 1.25em between paragraphs
- **Code blocks:** Light background, subtle border, Shiki syntax highlighting
- **TOC:** Right side, `text-sm`, `text-muted-foreground`, active item in `text-primary`
- **Objectives:** Simple bordered card with circle icons per objective
- **Project milestones:** Numbered list with checkboxes, vertical connecting line
- **Key terms:** Dotted underline, tooltip on hover
- **Inspiration:** react.dev/learn, Mintlify documentation

### Variant 2: "Card Sections" (Notion inspired)

- **Content width:** 720px max, centred
- **Background:** Each major section (Objectives, Lesson, Q&A, Project) is wrapped in a card (`bg-card border rounded-lg shadow-sm`)
- **Overall background:** Page background (`bg-background`) visible between cards
- **Callout boxes:** Full-width cards with emoji icons instead of lucide icons. Rounded corners, no left-border — uses full background colour instead
- **Visual style:** Block-based — clear separation between sections via cards
- **Typography:** `lesson-prose` base. Slightly tighter spacing within cards (1em paragraphs)
- **Spacing:** 1.5rem gap between section cards
- **Code blocks:** Dark background always (even in light mode), rounded, copy button
- **TOC:** Right side, with section-level indicators (matches card structure)
- **Objectives:** Card with checklist, slightly darker background than other cards
- **Collapsible sections:** Toggle blocks with chevron, Notion-style
- **Inspiration:** Notion, card-based layouts

### Variant 3: "Magazine Layout"

- **Content width:** 900px max — wider than other variants
- **Background:** Flat/seamless
- **Video + images:** Full-bleed (break out of content column to full available width)
- **Text:** Constrained to 720px within the 900px container (centred)
- **Callout boxes:** Colourful — stronger background fills (`bg-primary/10` instead of `/5`), rounded corners, with icon + label row
- **Visual style:** More visual breaks — horizontal dividers between sub-sections, pull quotes for emphasis
- **Typography:** Slightly larger H2 (1.75rem / 28px). Pull quotes: `text-xl italic text-muted-foreground` with decorative left border
- **Spacing:** Extra-generous — 3em between major sections
- **Code blocks:** Full-width within 900px container, light Shiki theme
- **TOC:** Right side (may overlay on smaller screens due to wider content)
- **Objectives:** Banner-style at full 900px width with gradient background (`from-primary/5 to-accent/5`)
- **Inspiration:** Magazine layouts, editorial design

### Variant 4: "Linear Minimal"

- **Content width:** 700px max — slightly narrower
- **Background:** Flat/seamless
- **Callout boxes:** Monochrome grey only — `bg-muted` background, no colour coding. Icon + text only. Very subtle.
- **Visual style:** Maximum whitespace, minimum decoration. No borders on cards. No shadows. Just content.
- **Typography:** Standard `lesson-prose` but with extra top margins on headings (2.5em for H2). Very spacious.
- **Spacing:** Extreme — 3em between paragraphs, 4em between sections
- **Code blocks:** Minimal — `bg-muted` background, no border, small rounded corners, Shiki highlighting
- **TOC:** Right side, extremely minimal — just text links, no bullets, no background
- **Objectives:** Plain list with small check icons. No card, no background. Just a heading + list.
- **Key terms:** Subtle — slightly bolder text only, tooltip on hover. No background highlight.
- **Inspiration:** Linear documentation, minimal design philosophy

### Variant 5: "Textbook Rich"

- **Content width:** 720px max, centred
- **Background:** White card content area (`bg-card`) on grey page background (`bg-background`). The entire lesson content area is one large card with padding.
- **Callout boxes:** Colour-coded with both left-border AND subtle background fill. Icons + bold label text.
- **Visual style:** Rich, colourful, textbook-like. Section numbers ("01", "02") visible. Progress breadcrumb showing which section you're in.
- **Typography:** `lesson-prose` with numbered section headers. H2 gets a section number badge (e.g., `01 · What AI Can Do`).
- **Spacing:** Standard — 1.75em between sections, 1.25em between paragraphs
- **Code blocks:** Card-style with border, filename label, line numbers, copy button
- **TOC:** Right side with section numbers matching the content. Active section highlighted with colour.
- **Objectives:** Card with checkmark icons that could represent completion (visual only in demo). Coloured left border matching primary.
- **Key terms:** Dotted underline with accent background highlight. Tooltip with definition.
- **Project milestones:** Numbered with circular badges and vertical connecting line. Progress bar at top.
- **Inspiration:** Modern textbooks, Coursera structured content

## Files likely affected

- `src/app/demo/page.tsx` (new — demo index)
- `src/app/demo/layout.tsx` (new — minimal layout for demo pages, no dashboard sidebar)
- `src/app/demo/lesson-v1/page.tsx` (new)
- `src/app/demo/lesson-v2/page.tsx` (new)
- `src/app/demo/lesson-v3/page.tsx` (new)
- `src/app/demo/lesson-v4/page.tsx` (new)
- `src/app/demo/lesson-v5/page.tsx` (new)

## Acceptance criteria

- [ ] `/demo` shows an index page with links to all 10 variants (V6-V10 can be placeholders)
- [ ] `/demo/lesson-v1` renders "Documentation Clean" variant with all 5 sections, flat/seamless, constrained width, react.dev-style callouts
- [ ] `/demo/lesson-v2` renders "Card Sections" variant with all 5 sections, card-wrapped sections, emoji callouts, Notion-style toggles
- [ ] `/demo/lesson-v3` renders "Magazine Layout" variant with all 5 sections, wider content, full-bleed video, pull quotes, colourful callouts
- [ ] `/demo/lesson-v4` renders "Linear Minimal" variant with all 5 sections, maximum whitespace, monochrome callouts, extreme spacing
- [ ] `/demo/lesson-v5` renders "Textbook Rich" variant with all 5 sections, card background, numbered sections, rich callouts, progress breadcrumb
- [ ] All 5 variants work correctly in both light and dark mode
- [ ] All 5 variants are responsive: desktop shows right TOC, tablet reflowed, mobile full-width
- [ ] Table of contents scroll-spy works correctly on all 5 variants
- [ ] Quiz section is functional (can answer questions, get feedback) on all variants
- [ ] StepProgress checkboxes are interactive on all variants
- [ ] Code block copy buttons work on all variants
- [ ] All variants use the shared demo lesson data — no hardcoded content in page components
- [ ] `npm run build` passes with no errors
- [ ] `npm run lint` passes with no errors

## Notes

- Read `PLAN_2026-03-01_lesson-ui-design-spec.md` in `kanban/1_planning/` for the full design spec
- PROMPT_6 must have been completed first — these pages depend on the shared components and demo data
- The demo pages are NOT inside the `(dashboard)` route group — they bypass auth and the dashboard sidebar. Create a simple `demo/layout.tsx` with just a theme toggle and back-to-index link
- Keep each page component focused — extract variant-specific styling into Tailwind classes, not separate CSS files
- Each page should import the same demo lesson data and the same components, then compose them with different className props and configuration
- The differences between variants should be primarily CSS/Tailwind classes, not different component structures
- All variants share the 5-section vertical flow. The variation is in visual treatment, not content structure
