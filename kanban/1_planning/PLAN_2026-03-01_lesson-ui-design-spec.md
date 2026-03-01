# Lesson UI Redesign — Full Design Specification

**Date:** 2026-03-01
**Referenced by:** PROMPT_6, PROMPT_7, PROMPT_8

This is the shared design specification for the lesson UI redesign. All three implementation prompts reference this file.

---

## New Lesson Page Structure (5-Section Flow)

Every lesson page follows this vertical flow — **no tabs**. All sections are visible in a single scrollable page:

```
┌─────────────────────────────────────────────────────────────────┐
│ Left Sidebar      │  Main Content (720px max)    │  Right TOC   │
│ (course nav)      │                              │  (200px)     │
│ 280px, collapsible│  ┌──────────────────────────┐│  sticky      │
│                   │  │ 1. INTRO VIDEO           ││  scroll-spy  │
│ Sections:         │  │    (full content width)  ││              │
│  - Lesson 1 [x]  │  │    Duration badge         ││  On this page│
│  - Lesson 2 [>]  │  │    Brief intro text       ││  ─────────── │
│  - Lesson 3 [ ]  │  ├──────────────────────────┤│  Objectives  │
│                   │  │ 2. OBJECTIVES            ││  Section 1   │
│                   │  │    Card with checklist    ││  Section 2   │
│                   │  │    icons per objective    ││  Section 3   │
│                   │  ├──────────────────────────┤│  Q&A         │
│                   │  │ 3. LESSON CONTENT        ││  Project     │
│                   │  │    Sub-topic headings     ││              │
│                   │  │    Callouts, code, tables ││              │
│                   │  │    Audio player (TTS)     ││              │
│                   │  │    Key term tooltips      ││              │
│                   │  │    Collapsible deep dives ││              │
│                   │  ├──────────────────────────┤│              │
│                   │  │ 4. Q&A                   ││              │
│                   │  │    3 quiz questions       ││              │
│                   │  │    Immediate feedback     ││              │
│                   │  ├──────────────────────────┤│              │
│                   │  │ 5. PROJECT               ││              │
│                   │  │    Milestone checkboxes   ││              │
│                   │  │    Progress bar           ││              │
│                   │  │    Project video          ││              │
│                   │  ├──────────────────────────┤│              │
│                   │  │ Prev/Next + Mark Complete ││              │
│                   │  └──────────────────────────┘│              │
└─────────────────────────────────────────────────────────────────┘
```

### Responsive Breakpoints

| Device | Left Sidebar | Main Content | Right TOC |
|--------|-------------|-------------|-----------|
| Desktop (1280px+) | 280px, visible, collapsible | 720px max, centred | 200px, sticky |
| Large tablet (1024-1279px) | 280px, collapsible (default collapsed) | 720px max | 200px, sticky |
| Tablet (768-1023px) | Hidden (sheet trigger) | Full width, max 720px | Hidden (optional toggle) |
| Mobile (<768px) | Hidden (sheet trigger) | Full width, reflowed | Hidden |

---

## Typography Specification

```css
/* Body text */
font-family: var(--font-inter);
font-size: 1rem (16px);
line-height: 1.75 (28px);
color: var(--foreground);

/* Headings */
h1: 2rem (32px), font-weight 700, line-height 1.2, margin-top 0, margin-bottom 0.75em
h2: 1.5rem (24px), font-weight 600, line-height 1.3, margin-top 2em, margin-bottom 0.75em
h3: 1.25rem (20px), font-weight 600, line-height 1.4, margin-top 1.5em, margin-bottom 0.5em
h4: 1.125rem (18px), font-weight 600, line-height 1.4, margin-top 1.25em, margin-bottom 0.5em

/* Paragraphs */
margin-bottom: 1.25em (20px)

/* Content width */
max-width: 720px (centred within available space)

/* Lists */
ul/ol: margin-bottom 1.25em, li spacing 0.5em
list-style: disc for ul, decimal for ol
padding-left: 1.5em

/* Links */
color: var(--primary)
text-decoration: none, underline on hover

/* Blockquotes */
border-left: 3px solid var(--border)
padding-left: 1em
color: var(--muted-foreground)
font-style: italic

/* Tables */
width: 100%
border-collapse: collapse
th: font-weight 600, text-align left, padding 0.75em 1em, border-bottom 2px
td: padding 0.75em 1em, border-bottom 1px solid var(--border)
striped: even rows get bg-muted/50

/* Horizontal rules */
border: none
border-top: 1px solid var(--border)
margin: 2em 0
```

---

## Component Specifications

### 1. CalloutBox

Four variants with left-border styling (react.dev pattern adapted to GWTH colours):

| Type | CSS Classes | Icon (lucide-react) | Label |
|------|------------|---------------------|-------|
| note | `bg-primary/5 border-l-4 border-primary` | `Info` | "Note" |
| warning | `bg-warning/5 border-l-4 border-warning` | `AlertTriangle` | "Warning" |
| tip | `bg-success/5 border-l-4 border-success` | `Lightbulb` | "Tip" |
| deep-dive | `bg-accent/5 border-l-4 border-accent` | `BookOpen` | "Deep Dive" |

- Deep-dive variant is collapsible (click title to toggle)
- Padding: `1rem 1.25rem`
- Border-radius: `0.5rem` (right side only for left-bordered variant)
- Icon + label in a row at top, content below
- Dark mode: same structure, colours auto-adapt via CSS custom properties
- Max 3-5 per page

**Markdown syntax** (to be parsed by enhanced MarkdownRenderer):
```
:::note
This is a note callout.
:::

:::warning
Watch out for this common mistake.
:::

:::tip
Here's a helpful tip.
:::

:::deep-dive[Optional Title]
Expandable advanced content here.
:::
```

### 2. CollapsibleSection

- Trigger: clickable header row with chevron icon (rotates 90° on open)
- Content: hidden by default, slides open with Motion `AnimatePresence`
- Animation: height auto with `layout` prop, 200ms spring
- Border: subtle bottom border when closed, full border when open
- Used for "Deep Dive" callouts and optional supplementary content

### 3. TableOfContents (Right Side)

- Extracts H2 and H3 headings from the rendered content
- Sticky position: `top-24` (below header)
- Scroll-spy using Intersection Observer API
- Active heading: `text-primary font-medium`
- Inactive: `text-muted-foreground`
- H3 items indented with `pl-3`
- Width: 200px
- "On this page" label at top in small caps / muted text
- Smooth scroll on click (no anchor in URL per user request)
- Hidden below 1024px

### 4. ObjectivesCard

- Visually distinct card at top of lesson (below intro video)
- Background: `bg-primary/5` or `bg-card` depending on variant
- Border: `border border-primary/20`
- Header: "What you'll learn" with Target/CheckCircle icon
- List items: each with a small circle/check icon, bulleted
- Typography: slightly smaller than body (0.9375rem / 15px)
- Padding: `1.5rem`
- Border-radius: design system default

### 5. KeyTermTooltip

- Inline element: `<span>` with dotted underline and subtle accent background
- Style: `border-b border-dashed border-accent/50 bg-accent/5 px-0.5 rounded-sm cursor-help`
- Tooltip on hover/focus: shadcn `Tooltip` component with definition text
- Accessible: `tabIndex={0}`, `aria-describedby` pointing to tooltip
- Dark mode: same pattern, colours adapt

**Markdown syntax:**
```
The ==AI primitive|A fundamental capability that AI systems can perform== is key.
```

### 6. ImageLightbox

- Wraps `next/image` components
- Click to open: fullscreen overlay with Motion scale animation
- Background: `bg-black/80 backdrop-blur-sm`
- Close: click outside, Escape key, X button (top-right)
- Caption: rendered below image in lightbox
- Animation: `initial={{ opacity: 0, scale: 0.9 }}` → `animate={{ opacity: 1, scale: 1 }}`
- Maintains aspect ratio, max 90vw × 90vh

### 7. StepProgress (Project Section)

- Milestone list with checkboxes
- Each milestone: number + title + optional description
- Checkbox: shadcn Checkbox component, checked state managed locally (demo) or via progress API
- Progress bar at top: shows X/Y milestones completed
- Bar colour: gradient from primary to accent
- Milestone numbers: circular badges (1, 2, 3...) with vertical connecting line
- Completed milestones: muted text, checked checkbox, green check icon

### 8. Enhanced CodeBlock (with Shiki)

- Syntax highlighting via `shiki` package (already in dependencies)
- Light theme: `github-light` or similar
- Dark theme: `github-dark` or `one-dark-pro`
- Theme switches with `next-themes` (use `useTheme()` hook)
- Copy button: top-right, `Copy` icon from lucide-react, shows "Copied!" toast for 2s
- Optional filename label: top-left, muted text, monospace
- Optional line highlighting: `bg-primary/10` on specified lines
- Font: JetBrains Mono at 0.875em (14px)
- Background: `bg-muted` (light) / `bg-card` (dark)
- Padding: `1rem 1.25rem`
- Border-radius: `0.625rem`
- Border: `1px solid var(--border)`
- Overflow-x: auto with custom scrollbar

### 9. AudioPlayer (Enhanced)

- Compact bar that sticks below the video / above the lesson content
- Play/pause, progress bar, time display, speed control (0.75x-2x)
- Label: "Listen to this lesson" with headphones icon
- Collapsible to just an icon when not in use

### 10. QuizSection (Inline, not tabbed)

- Section header: "Check Your Understanding" with HelpCircle icon
- 3 questions displayed inline (not in a separate tab)
- Each question: card with question text, radio options, submit button
- Immediate feedback: green/red highlight on selection with explanation
- Score summary at bottom after all answered
- Can retake (reset button)

---

## Demo Lesson Data Structure

The mock data for "Welcome to GWTH" needs to be restructured from the current format into the new 5-section structure. Create a new data file or extend mock-data.ts:

```typescript
interface DemoLessonData {
  // Section 1: Intro
  introVideo: {
    url: string
    duration: number // seconds
    title: string
    description: string // 1-2 sentences
  }

  // Section 2: Objectives
  objectives: string[] // array of objective strings

  // Section 3: Lesson Content
  lessonContent: string // markdown with callout syntax, key terms, etc.
  audioUrl: string | null
  audioDuration: number | null

  // Section 4: Q&A
  questions: QuizQuestion[] // existing type

  // Section 5: Project
  project: {
    title: string
    description: string
    milestones: {
      title: string
      description: string
      completed: boolean
    }[]
    videoUrl: string | null
    videoDuration: number | null
  }
}
```

The lesson content markdown should include examples of ALL component types:
- At least 2 callout boxes (note, tip)
- At least 1 deep-dive collapsible
- At least 1 code block with syntax highlighting
- At least 1 table
- At least 2 key term highlights
- At least 1 image (use placeholder)
- Headings H2 and H3 for TOC
- A blockquote
- Ordered and unordered lists

---

## Design References

| Source | What to Draw From |
|--------|------------------|
| **react.dev/learn** | Callout boxes (Note blue, Pitfall amber, Deep Dive green collapsible), "You Will Learn" objectives box, scroll-spy TOC, constrained content width ~720px, generous line-height |
| **Notion** | Block-based visual rhythm, toggle/collapsible sections, generous whitespace, callout blocks with icons, clean dividers between sections |
| **Linear docs** | Minimal aesthetic, 8px spacing grid, restrained colour palette, Inter font, tiered text colour (primary/muted/faint) |
| **Mintlify** | Clean documentation layout, dark/light theme switching, styled code blocks with copy + language label, step components, card grids, tabs, accordion components, subtle backgrounds |
| **Medium/Substack** | Blog-style reading experience, large headings, pull quotes, generous paragraph spacing, wide content area |
| **Coursera/Udemy** | Video-first layout, progress tracking in sidebar, quiz inline feedback |

---

## Colour Tokens (Already Defined — Reference Only)

All colours use CSS custom properties from `globals.css`. Do NOT hardcode hex values.

| Token | Light | Dark | Usage |
|-------|-------|------|-------|
| `--primary` | Aqua | Lighter aqua | Links, active TOC, callout (note) |
| `--accent` | Mint | Lighter mint | Key terms, callout (deep-dive) |
| `--success` | Green | Green | Completed state, callout (tip) |
| `--warning` | Amber | Amber | Callout (warning) |
| `--destructive` | Red | Red | Errors, callout (danger if needed) |
| `--muted` | Light blue-grey | Dark warm grey | Code block backgrounds |
| `--muted-foreground` | Subdued text | Warm grey text | Secondary text, inactive TOC |
| `--card` | White | Dark charcoal | Card backgrounds |
| `--border` | Light border | Subtle white border | Borders, dividers |
| `--foreground` | Dark teal | Warm off-white | Body text |
| `--background` | Near-white | Warm charcoal | Page background |
