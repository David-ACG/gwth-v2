# Lesson UI Redesign — Format Lessons for Readability & Visual Appeal

**Date:** 2026-03-01
**Priority:** High
**Type:** Feature / UX Improvement

---

## Problem

The current lesson page (`/course/[slug]/lesson/[lessonSlug]`) renders markdown content as a wall of text with minimal visual formatting. There are no callout boxes, no table of contents, no visual breaks between sections, no syntax highlighting, and the content runs edge-to-edge. This makes lessons difficult to read, scan, and engage with — especially for 10-40 minute reading sessions.

## Goal

Redesign the lesson content area to be **highly readable, visually engaging, and well-structured** while staying within the established GWTH design system (OKLCH colors, Inter/JetBrains Mono fonts, aqua/mint accent palette, light + dark mode).

Create **10 demo UI variants** as separate pages so the design can be evaluated side-by-side before committing to one approach.

---

## New Lesson Page Structure

Every lesson follows a **5-section flow** (replacing the current Learn/Build/Quiz tab layout):

### Section 1: Intro Video (2-3 mins)
- Video player at the top of the page, full content-area width
- Duration badge visible before playback
- Brief 1-2 sentence intro text below the video

### Section 2: Objectives
- Visually distinct card/box (not inline text)
- Bulleted checklist format with icons
- Example objectives:
  - See what AI can do right now through 6 live demos (one per primitive)
  - Understand the 6 AI superpowers and how they combine
  - Know why AI skills are the #1 career differentiator in 2026
  - Create a personal AI Wishlist of 10 things you want AI to do for you
  - Understand the GWTH learning path and what you will build by end of month

### Section 3: Lesson Content (10-40 mins reading/listening)
- Rich formatted text broken into sub-topic headings
- Callout boxes, code blocks, tables, expandable sections, key term highlights
- Audio player (TTS) available for the lesson text
- Example sub-topics:
  - Live demos: 6 things AI can do (one from each primitive)
  - The 6 primitives explained simply: your 6 AI superpowers
  - Why coding/building has become #1 (the $4B story)
  - Preview of what you will build: the Family AI Bot capstone
  - The GWTH promise: 90 days from casual user to builder

### Section 4: Q&A (3 mins)
- 3 questions to track progress/comprehension
- Interactive quiz with immediate feedback
- Scores tracked per attempt

### Section 5: Project (10-40 mins)
- Step-by-step instructions broken into **Milestones**
- Checkbox progress indicators for each milestone
- Example milestones:
  - Write down 10 things you wish AI could do for you
  - Rate each 1-5 for life improvement impact
- Project explanation video at the bottom (10-40 mins)

---

## Design Requirements

### Confirmed Features

| Feature | Decision | Notes |
|---------|----------|-------|
| Table of contents | Yes — floating right side | Desktop + tablet; hidden on mobile |
| Callout boxes | Yes — tip, warning, info, important | react.dev style with left border + icon |
| Syntax highlighting | Yes — Shiki | Already in stack, not wired up |
| Collapsible sections | Yes | For deep-dive / optional content |
| Key term highlights | Yes | Tooltips or visual distinction |
| Copy button on code blocks | Yes | Top-right, visible on hover |
| Step progress indicators | Yes | Checkboxes for project milestones |
| Zoomable images | Yes | Click to expand |
| Anchored headings | No | Not needed |
| Content width | Demo both | Constrained (65-75ch) vs wider |

### Needs Demo Comparison (Both Options in the 10 Variants)

| Decision | Option A | Option B |
|----------|----------|----------|
| Content feel | Textbook/documentation (react.dev) | Blog/article (Medium/Substack) |
| Content width | Constrained 650-750px | Wider, edge-to-edge in content area |
| Visual style | Clean/minimal (Notion, Linear) | Colourful/engaging (react.dev callouts) |
| Content area | White card on grey background | Flat/seamless |

### Device Behaviour

| Device | Layout |
|--------|--------|
| Desktop (1024px+) | Left sidebar (course nav, collapsible) + Main content (constrained) + Right TOC |
| Tablet (768-1023px) | Collapsible sidebar + Main content + Right TOC (may overlay) |
| Mobile (<768px) | No sidebar (sheet trigger) + Full-width content, reflowed. Primary use: video + audio |

---

## 10 Demo Variants

All use the same lesson content (Welcome to GWTH). All must work with the existing GWTH design system. Variations stay within a narrow band — no radical departures.

### Variant 1: "Documentation Clean" (react.dev inspired)
- Constrained width (720px max)
- Left-border callout boxes (blue info, amber warning, green tip)
- Flat/seamless content area
- Right TOC with scroll-spy
- Clean/minimal style
- Generous line-height (1.75)

### Variant 2: "Card Sections" (Notion inspired)
- Constrained width (720px max)
- Content sections in subtle cards with borders
- White card on grey background
- Callout boxes as full-width cards with emoji icons
- Collapsible "Deep Dive" sections
- Right TOC

### Variant 3: "Magazine Layout"
- Wider content area (~900px)
- Full-bleed images and video
- Text constrained within wider container
- Colourful callout boxes with background fills
- Flat/seamless
- More visual breaks (dividers, pull quotes)

### Variant 4: "Linear Minimal"
- Constrained width (700px)
- Maximum whitespace, minimum decoration
- Subtle grey callout boxes (no color coding — icons only)
- Flat/seamless
- 8px spacing grid
- Very clean, lots of breathing room

### Variant 5: "Textbook Rich"
- Constrained width (720px)
- Numbered sections with progress breadcrumb
- Colour-coded callout boxes (react.dev style)
- Card-based objectives box with checkmarks
- White card content area on grey background
- Key terms with dotted underline + tooltip

### Variant 6: "Blog Article"
- Wider content (~800px)
- Medium/Substack feel — large headings, generous paragraph spacing
- Pull quotes for emphasis
- Minimal callouts (just blockquotes with left border)
- Flat/seamless
- Serif-influenced heading style (still Inter, but heavier weight)

### Variant 7: "Two-Column Content"
- Main text constrained (650px) with sidebar callouts/notes
- Key terms and tips appear in the right margin alongside relevant text
- Textbook style with margin notes
- Flat/seamless
- Best for desktop; falls back to inline on smaller screens

### Variant 8: "Notion Blocks"
- Constrained width (720px)
- Toggle blocks for expandable content
- Callout blocks with customisable accent colours (GWTH aqua/mint palette)
- Dividers between major sections
- Card content area on background
- Block-based visual rhythm

### Variant 9: "Colourful Documentation"
- Constrained width (720px)
- Bright callout boxes (react.dev blue/amber/green)
- Syntax-highlighted code with dark theme
- Objectives as a coloured banner/card at top
- Flat/seamless with accent colour section headers
- Right TOC with colour indicators per section type

### Variant 10: "Hybrid Best-of"
- Constrained width (720px)
- react.dev callout style + Notion toggle blocks + Linear spacing
- Flat/seamless main area
- Card-based objectives and project sections only
- Right TOC with scroll-spy
- Key terms with highlights
- Best combination from research

---

## Typography Recommendations (from Research)

| Property | Current | Recommended |
|----------|---------|-------------|
| Body font-size | 16px (1rem) | 16px (keep) |
| Body line-height | ~1.5 (prose default) | 1.75 (28px) — more generous for long reads |
| Paragraph spacing | prose default | 1.25em (20px) between paragraphs |
| Content max-width | none (full width) | 720px for prose content |
| H1 | prose default | 32px, weight 700, line-height 1.2 |
| H2 | prose default | 24px, weight 600, line-height 1.3, 1.75em top margin |
| H3 | prose default | 20px, weight 600, line-height 1.4, 1.5em top margin |
| Code inline | prose default | 0.875em, bg-muted, 0.125em 0.375em padding |
| Code blocks | bg-muted, no highlighting | Shiki syntax highlighting, copy button, filename label |
| Line length | unlimited | 45-75 characters target (66 ideal) |

## Callout Box Design

Four variants following the react.dev pattern, adapted to GWTH colours:

| Type | Background | Left Border | Icon | Label |
|------|-----------|-------------|------|-------|
| Info/Note | `primary/10` (aqua tint) | `border-l-4 border-primary` | InfoCircle | "Note" |
| Warning/Pitfall | `warning/10` (amber tint) | `border-l-4 border-warning` | AlertTriangle | "Pitfall" |
| Tip | `success/10` (green tint) | `border-l-4 border-success` | Lightbulb | "Tip" |
| Deep Dive | `accent/10` (mint tint) | `border-l-4 border-accent` | BookOpen | "Deep Dive" (collapsible) |

Maximum 3-5 callouts per page. Keep under 2-3 sentences each with bullet points.

## Content Rhythm Rule

**Never let more than 3 paragraphs pass without a visual break.** Acceptable breaks:
- Callout box
- Code block
- Image or diagram
- Divider (horizontal rule)
- Table
- Collapsible section
- Pull quote

## Code Block Specifications

- Syntax highlighting via Shiki (light + dark theme variants)
- Copy button: top-right corner, visible on hover, toast confirmation on copy
- Optional filename label (top-left)
- Optional line highlighting (subtle background on key lines)
- Font: JetBrains Mono at 0.875em
- Background: card token (slightly different from page background)
- Padding: 1rem 1.25rem
- Border-radius: match design system (0.625rem)

## Table of Contents (Right Side)

- Sticky position, appears on desktop + tablet
- Scroll-spy: highlights the heading currently visible in viewport
- Uses Intersection Observer API
- Shows H2 and H3 headings only
- Subtle styling — doesn't compete with content
- Hidden on mobile (screen < 768px)
- Width: ~200px

## Key Term Highlights

- Visually distinct inline styling (dotted underline or subtle background highlight)
- Tooltip on hover showing a brief definition
- Uses the accent/mint colour for the highlight
- Must be accessible (keyboard focusable, aria-describedby)

## Step Progress Indicators (Project Section)

- Each milestone has a checkbox
- Checked state persists (ties into progress tracking)
- Visual progress bar at the top of the project section showing X/Y milestones complete
- Milestones are numbered and have clear completion criteria

## Zoomable Images

- Click to expand in a lightbox/dialog overlay
- Smooth scale animation (Motion)
- Close on click outside, Escape key, or X button
- Maintains aspect ratio
- Caption support below images

---

## Research Sources

- **react.dev/learn** — Callout patterns (Note/Pitfall/Deep Dive), content structure, scroll-spy TOC, typography scale, interactive code examples
- **Notion** — Block-based content, toggle blocks, callout blocks with emoji, generous whitespace, content width toggle
- **Linear documentation** — Minimal aesthetic, 8px spacing grid, restrained colour palette, Inter font, tiered text colour system
- **Coursera/Udemy** — Video-first layout, curriculum sidebar, progress checkmarks, tabbed content
- **Khan Academy (Wonder Blocks)** — Typography reduction (119 styles to 14), colour reduction (58 to 18), accessibility-first density
- **USWDS Typography** — 16px min font-size, 45-75 char line length, 1.5+ line-height for long text
- **Nielsen Norman Group** — Video positioning at top, text complements video (never duplicate), duration badges, chapter markers
- **Codecademy** — Split-pane narration + code layout, step-by-step progression
- **freeCodeCamp** — Hierarchical challenge structure, hands-on from start

## Implementation Notes

- All 10 demos use the same lesson content (Welcome to GWTH mock data)
- Each demo is a separate page route (e.g., `/demo/lesson-v1` through `/demo/lesson-v10`)
- Demos must work in both light and dark mode
- Demos must work on desktop, tablet, and mobile
- The lesson content will need to be restructured from the current format to match the new 5-section flow (Intro Video, Objectives, Lesson, Q&A, Project)
- The MarkdownRenderer needs significant enhancement (or replacement with a proper markdown library like react-markdown + remark/rehype plugins)
- Shiki integration needed for syntax highlighting
- New components needed: CalloutBox, TableOfContents, KeyTermTooltip, StepProgress, ImageLightbox, CollapsibleSection, ObjectivesCard
