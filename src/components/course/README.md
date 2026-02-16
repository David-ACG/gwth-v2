# Course Components

Components for browsing courses, viewing lessons, filtering course lists, and taking quizzes.

## Components

### `CourseCard` (`course-card.tsx`)
Card displaying a single course with a gradient thumbnail placeholder, difficulty and category badges, title, description, lesson count, estimated duration, and an optional progress bar. Links to the course detail page. Server component.

### `CoursesFilter` (`courses-filter.tsx`)
Filter bar for the courses listing page. Provides a search input, category dropdown, and difficulty dropdown. All filter state is synced to URL search params so filtered views are shareable and bookmarkable. Client component.

### `LessonViewer` (`lesson-viewer.tsx`)
The core lesson page component. Features:
- Lesson header with breadcrumb link back to the course, difficulty badge, and duration.
- Tabbed content area: Learn (video placeholder + markdown content + audio + resources), Build (video + instructions), Quiz (dynamic-imported QuizEngine).
- Bottom navigation bar with previous/next lesson links and a "Mark Complete" button with optimistic UI via `useProgress`.
- Bookmark toggle and a slide-out notes panel (dynamic-imported NotesPanel).
- Heavy sub-components (QuizEngine, MarkdownRenderer, NotesPanel) are loaded via `next/dynamic`.

### `QuizEngine` (`quiz-engine.tsx`)
Interactive multiple-choice quiz with scoring. Uses `react-hook-form` for answer state and an `AlertDialog` for submit confirmation. Shows score, grade, and per-question explanations after submission. Enforces a maximum attempt limit from `lib/config.ts`.

## Tests

- `course-card.test.tsx` -- tests for CourseCard rendering, badges, progress, and links.
- `quiz-engine.test.tsx` -- tests for QuizEngine interaction, scoring, and attempt limits.

## Main Entry Points

- `CourseCard` is used on the dashboard, courses listing, and bookmarks pages.
- `CoursesFilter` is used on the courses listing page.
- `LessonViewer` is the primary component on the lesson detail page.
