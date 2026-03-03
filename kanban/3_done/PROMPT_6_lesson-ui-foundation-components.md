# Task: Build Lesson UI Foundation Components

## What to change

Build all the shared components and infrastructure needed for the lesson UI redesign. These components will be used by 10 demo variant pages (built in subsequent prompts).

**Read the full design spec first:** `kanban/1_planning/PLAN_2026-03-01_lesson-ui-design-spec.md` — it contains exact specifications for every component, typography, colours, and layout.

### 1. Enhanced MarkdownRenderer

Replace the current hand-rolled markdown parser in `src/components/shared/markdown-renderer.tsx` with a proper markdown pipeline:

- Install `react-markdown` + `remark-gfm` (tables, strikethrough, task lists) + `rehype-raw` (allow HTML in markdown)
- Keep DOMPurify sanitisation
- Support custom syntax for callouts (`:::note`, `:::warning`, `:::tip`, `:::deep-dive[Title]`)
- Support key term syntax (`==term|definition==`)
- Wire up Shiki for syntax highlighting in code blocks (the `shiki` package is already installed)
- Use `useTheme()` from next-themes to switch between light/dark Shiki themes
- The enhanced renderer should be a drop-in replacement — the existing lesson pages should still work

### 2. New Components (in `src/components/lesson/`)

Create a new `src/components/lesson/` directory with these components:

| Component            | File                      | Description                                                                                                                      |
| -------------------- | ------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `CalloutBox`         | `callout-box.tsx`         | 4 variants: note (primary/aqua), warning (amber), tip (green), deep-dive (accent/mint, collapsible). Left-border style per spec. |
| `CollapsibleSection` | `collapsible-section.tsx` | Animated expand/collapse with Motion. Chevron rotates. Used by deep-dive callouts.                                               |
| `TableOfContents`    | `table-of-contents.tsx`   | Right-side sticky TOC. Scroll-spy with Intersection Observer. Shows H2/H3. Hidden < 1024px.                                      |
| `ObjectivesCard`     | `objectives-card.tsx`     | Card with "What you'll learn" header, icon list of objectives. `bg-primary/5` border accent.                                     |
| `KeyTermTooltip`     | `key-term-tooltip.tsx`    | Inline dotted-underline term with shadcn Tooltip showing definition. Accessible.                                                 |
| `ImageLightbox`      | `image-lightbox.tsx`      | Click-to-expand image in fullscreen overlay. Motion animation. Close on Escape/click-outside. Caption support.                   |
| `StepProgress`       | `step-progress.tsx`       | Numbered milestone list with checkboxes, vertical connecting line, progress bar at top.                                          |
| `CodeBlock`          | `code-block.tsx`          | Shiki-highlighted code with copy button (top-right), optional filename label, optional line highlighting. Light/dark theme.      |
| `QuizSection`        | `quiz-section.tsx`        | Inline quiz (not tabbed). 3 questions with radio options, immediate feedback, score summary. Reuses existing QuizQuestion type.  |
| `AudioBar`           | `audio-bar.tsx`           | Compact "Listen to this lesson" bar with play/pause, progress, speed control. Collapsible.                                       |
| `LessonSection`      | `lesson-section.tsx`      | Wrapper component that adds consistent spacing and optional section numbering.                                                   |

### 3. Typography Updates

Update `src/app/globals.css` to add a new `.lesson-prose` class (do NOT modify the existing `.prose` behaviour — the rest of the site depends on it):

```css
.lesson-prose {
  /* See typography spec in PLAN file */
  /* line-height: 1.75, max-width: 720px, generous paragraph spacing */
  /* Heading scales, list spacing, table styling, blockquote styling */
  /* Horizontal rule styling */
}
```

### 4. Demo Lesson Data

Create `src/lib/data/demo-lesson-data.ts` with the "Welcome to GWTH" content restructured into the 5-section format:

- **introVideo**: use the existing ForBiggerBlazes.mp4 URL from mock-data
- **objectives**: 5 objective strings from the idea file
- **lessonContent**: the existing learnContent markdown, enhanced with callout syntax (`:::note`, `:::tip`, `:::deep-dive`), key term syntax (`==term|definition==`), and ensuring it has a good mix of H2/H3 headings, code blocks, tables, blockquotes, lists
- **questions**: the existing 3 quiz questions
- **project**: restructured from existing buildInstructions into milestones format with title + description per milestone, plus the build video URL

The content should exercise ALL the new components so every demo variant can showcase them.

## Files likely affected

- `src/components/shared/markdown-renderer.tsx` (major rewrite)
- `src/components/lesson/` (new directory, ~11 new files)
- `src/components/lesson/README.md` (new — describe what's in the directory)
- `src/app/globals.css` (add `.lesson-prose` class)
- `src/lib/data/demo-lesson-data.ts` (new file)
- `package.json` (add `react-markdown`, `remark-gfm`, `rehype-raw` — Shiki already installed)

## Acceptance criteria

- [ ] `react-markdown`, `remark-gfm`, `rehype-raw` installed and working
- [ ] Enhanced MarkdownRenderer renders callout syntax (`:::note` etc.) as styled CalloutBox components
- [ ] Enhanced MarkdownRenderer renders key term syntax (`==term|definition==`) as KeyTermTooltip components
- [ ] Shiki syntax highlighting works in code blocks with light/dark theme switching
- [ ] CodeBlock has a working copy button that copies code to clipboard with a toast confirmation
- [ ] CalloutBox renders all 4 variants correctly in light and dark mode
- [ ] CollapsibleSection animates open/close smoothly with Motion
- [ ] TableOfContents extracts H2/H3 headings and highlights the active one via scroll-spy
- [ ] ObjectivesCard renders a list of objectives with icons
- [ ] KeyTermTooltip shows definition on hover and is keyboard-accessible
- [ ] ImageLightbox opens on click, closes on Escape/click-outside, animates with Motion
- [ ] StepProgress shows numbered milestones with checkboxes and a progress bar
- [ ] QuizSection renders questions inline with immediate feedback on answer
- [ ] AudioBar plays audio with speed control and is collapsible
- [ ] `.lesson-prose` CSS class provides the typography spec from the design doc
- [ ] Demo lesson data file exists with all 5 sections populated and exercises all component types
- [ ] All existing lesson pages still work (no regressions)
- [ ] All components work in both light and dark mode
- [ ] `npm run build` passes with no errors
- [ ] `npm run lint` passes with no errors

## Notes

- Read `PLAN_2026-03-01_lesson-ui-design-spec.md` in `kanban/1_planning/` for exact component specs, colours, spacing, and typography values
- The existing MarkdownRenderer in `src/components/shared/markdown-renderer.tsx` uses a hand-rolled parser with DOMPurify. Replace the parser but keep the DOMPurify layer for security
- Shiki is already in `package.json` — just not wired up. Use `shiki/bundle/web` for smaller bundle
- All colour values must use CSS custom properties (e.g., `var(--primary)`), never hardcoded hex
- Use `next/dynamic` for CodeBlock and ImageLightbox to avoid SSR issues with Shiki and the dialog
- The demo data should be rich enough to properly test all formatting — include at least 2 callouts, 1 deep-dive, 1 code block, 1 table, 2 key terms, headings for TOC, a blockquote, and both list types
- Follow project conventions: kebab-case files, PascalCase components, JSDoc on all exports
