# Lesson Components

Components for the redesigned 5-section lesson page layout. Built for the GWTH v2 learning platform.

## Components

| Component | Description |
|-----------|-------------|
| `CalloutBox` | Styled callout with 4 variants: note (aqua), warning (amber), tip (green), deep-dive (mint, collapsible) |
| `CollapsibleSection` | Animated expand/collapse with Motion. Used by deep-dive callouts |
| `TableOfContents` | Right-side sticky TOC with scroll-spy via Intersection Observer |
| `ObjectivesCard` | "What you'll learn" card with icon checklist |
| `KeyTermTooltip` | Inline dotted-underline term with tooltip definition |
| `ImageLightbox` | Click-to-expand image with fullscreen overlay |
| `StepProgress` | Numbered milestones with checkboxes and progress bar |
| `CodeBlock` | Shiki-highlighted code with copy button and theme switching |
| `QuizSection` | Inline quiz with immediate feedback and score summary |
| `AudioBar` | Compact audio player with speed control, collapsible |
| `LessonSection` | Wrapper for consistent spacing and optional section numbering |

## Usage

Import from the barrel export:

```tsx
import { CalloutBox, ObjectivesCard, QuizSection } from "@/components/lesson"
```

Or import individual components:

```tsx
import { CodeBlock } from "@/components/lesson/code-block"
```

## Custom Markdown Syntax

The enhanced `MarkdownRenderer` (in `../shared/markdown-renderer.tsx`) parses custom syntax into these components:

- `:::note` / `:::warning` / `:::tip` / `:::deep-dive[Title]` → `CalloutBox`
- `==term|definition==` → `KeyTermTooltip`
- Fenced code blocks → `CodeBlock` (with Shiki highlighting)
