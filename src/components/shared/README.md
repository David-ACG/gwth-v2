# Shared Components

Cross-cutting components used across multiple feature areas -- empty states, bookmarks, content rendering, and notes.

## Components

### `EmptyState` (`empty-state.tsx`)
Reusable placeholder shown when a list has no items. Displays a Lucide icon in a muted circle, a title, a description, and an optional CTA button linking to a relevant page. Used on courses, labs, bookmarks, and notifications pages. Server component.

### `BookmarkButton` (`bookmark-button.tsx`)
Toggle button for saving/unsaving lessons and labs. Uses the `useBookmark` hook for optimistic UI -- the bookmark icon fills immediately on click before the server confirms. Accepts either a `lessonId` or `labId` prop. Client component.

### `MarkdownRenderer` (`markdown-renderer.tsx`)
Renders markdown content as styled HTML. Includes a built-in markdown-to-HTML converter that handles headers, code blocks (fenced and inline), bold, italic, unordered lists, basic tables, and paragraphs. Output is styled with Tailwind Typography prose classes for both light and dark mode. Will be enhanced with Shiki syntax highlighting later. Server component.

### `VideoPlayer` (`video-player.tsx`)
Responsive HTML5 video player with play/pause overlay, progress bar, mute toggle, fullscreen, and seek. Shows a loading skeleton while the video loads and an error fallback with retry button if it fails. Designed to be loaded via `next/dynamic` for code-splitting. Client component.

### `AudioPlayer` (`audio-player.tsx`)
Inline audio player with playback speed control (0.5x to 2x), progress bar, time display, and mute toggle. Uses native HTML5 `<audio>` element. Shows an error state if the audio fails to load. Designed to be loaded via `next/dynamic` for code-splitting. Client component.

### `NotesPanel` (`notes-panel.tsx`)
Slide-out panel for lesson annotations. Fixed-positioned on the right side of the viewport. Supports creating new notes (validated with Zod via `react-hook-form`), viewing existing notes with timestamps, and deleting notes. Shows toast notifications on save/delete via Sonner. Client component.

### `Spinner` / `PageSpinner` (`spinner.tsx`)
SVG dual-ring spinner with primary outer arc and accent inner counter-rotating arc. `Spinner` accepts a configurable size. `PageSpinner` wraps it in a full-page centered layout with "Loading..." text. Used in all `loading.tsx` files.

### `RouteProgress` (`route-progress.tsx`)
Route transition indicator that shows a top gradient progress bar and a small corner spinner during client-side navigation. Auto-dismisses after 500ms. Wired into the root layout.

### `ThemeToggle` (`theme-toggle.tsx`)
Light/dark mode toggle button using `next-themes`. Animates between Sun and Moon icons with CSS transitions. Used in both the public nav and dashboard header.

## Tests

- `empty-state.test.tsx` -- tests for EmptyState rendering with and without a CTA action.

## Main Entry Points

- `EmptyState` is used on any list page that can be empty.
- `BookmarkButton` is used in `LessonViewer` and can be added to any card component.
- `MarkdownRenderer` is dynamically imported by `LessonViewer` for lesson content.
- `VideoPlayer` is dynamically imported by `LessonViewer` for intro and build videos.
- `AudioPlayer` is dynamically imported by `LessonViewer` for the audio version of lessons.
- `NotesPanel` is dynamically imported by `LessonViewer` for the notes sidebar.
- `Spinner` / `PageSpinner` are used in all `loading.tsx` files.
- `RouteProgress` is mounted in the root layout for navigation transitions.
- `ThemeToggle` is used in `PublicNav` and `DashboardHeader`.
