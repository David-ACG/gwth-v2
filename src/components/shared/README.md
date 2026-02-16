# Shared Components

Cross-cutting components used across multiple feature areas -- empty states, bookmarks, content rendering, and notes.

## Components

### `EmptyState` (`empty-state.tsx`)
Reusable placeholder shown when a list has no items. Displays a Lucide icon in a muted circle, a title, a description, and an optional CTA button linking to a relevant page. Used on courses, labs, bookmarks, and notifications pages. Server component.

### `BookmarkButton` (`bookmark-button.tsx`)
Toggle button for saving/unsaving lessons and labs. Uses the `useBookmark` hook for optimistic UI -- the bookmark icon fills immediately on click before the server confirms. Accepts either a `lessonId` or `labId` prop. Client component.

### `MarkdownRenderer` (`markdown-renderer.tsx`)
Renders markdown content as styled HTML. Includes a built-in markdown-to-HTML converter that handles headers, code blocks (fenced and inline), bold, italic, unordered lists, basic tables, and paragraphs. Output is styled with Tailwind Typography prose classes for both light and dark mode. Will be enhanced with Shiki syntax highlighting later. Server component.

### `NotesPanel` (`notes-panel.tsx`)
Slide-out panel for lesson annotations. Fixed-positioned on the right side of the viewport. Supports creating new notes (validated with Zod via `react-hook-form`), viewing existing notes with timestamps, and deleting notes. Shows toast notifications on save/delete via Sonner. Client component.

## Tests

- `empty-state.test.tsx` -- tests for EmptyState rendering with and without a CTA action.

## Main Entry Points

- `EmptyState` is used on any list page that can be empty.
- `BookmarkButton` is used in `LessonViewer` and can be added to any card component.
- `MarkdownRenderer` is dynamically imported by `LessonViewer` for lesson content.
- `NotesPanel` is dynamically imported by `LessonViewer` for the notes sidebar.
