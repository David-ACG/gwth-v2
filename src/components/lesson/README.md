# Lesson Components

Presentational pieces used inside rendered lesson prose. They reach the page
through `../shared/markdown-renderer.tsx`, which parses custom markdown syntax
into them, rather than being composed by hand.

## Components

| Component | Description |
|-----------|-------------|
| `CalloutBox` | Styled callout with 4 variants: note (aqua), warning (amber), tip (green), deep-dive (mint, collapsible) |
| `CollapsibleSection` | Animated expand/collapse with Motion. Used by deep-dive callouts |
| `KeyTermTooltip` | Inline dotted-underline term with tooltip definition |
| `CodeBlock` | Shiki-highlighted code with copy button and theme switching |

## Usage

Import the component directly. There is no barrel export.

```tsx
import { CodeBlock } from "@/components/lesson/code-block"
```

## Custom Markdown Syntax

The enhanced `MarkdownRenderer` (in `../shared/markdown-renderer.tsx`) parses custom syntax into these components:

- `:::note` / `:::warning` / `:::tip` / `:::deep-dive[Title]` → `CalloutBox`
- `==term|definition==` → `KeyTermTooltip`
- Fenced code blocks → `CodeBlock` (with Shiki highlighting)

## History

This directory originally held an eleven-component kit for a proposed
five-section lesson layout: `TableOfContents`, `ObjectivesCard`,
`ImageLightbox`, `StepProgress`, `QuizSection`, `AudioBar`, `LessonSection`,
plus the `index.ts` barrel and `src/lib/demo-utils.ts`.

That layout was never adopted. The shipped lesson viewer is
`src/app/(dashboard)/course/[slug]/lesson/[lessonSlug]/editorial-lesson-viewer.tsx`,
which carries its own audio bar, quiz and progress UI. The kit survived only
because the `/demo/lesson-v1..v11` design-variant routes still imported it.
W25 deleted those routes (they were client components shipping real lesson
prose into a public `/_next/static` chunk) and the eight orphans went with
them, so nobody mistakes them for live viewer code. They are in git history if
the five-section idea is ever revived.
