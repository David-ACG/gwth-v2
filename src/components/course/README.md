# Course Components

Components for browsing courses, viewing lessons, filtering course lists, and taking quizzes.

## Components

### `CourseCard` (`course-card.tsx`)

Card displaying a single course with a gradient thumbnail placeholder, difficulty and category badges, title, description, lesson count, estimated duration, and an optional progress bar. Links to the course detail page. Server component.

### `CoursesFilter` (`courses-filter.tsx`)

Filter bar for the courses listing page. Provides a search input, category dropdown, and difficulty dropdown. All filter state is synced to URL search params so filtered views are shareable and bookmarkable. Client component.

### `LessonNav` (`lesson-nav.tsx`)

Course navigation sidebar tree showing sections and lessons with progress indicators (completed, in-progress, locked, available). Auto-expands the section containing the current lesson. Highlights the active lesson. Locked lessons are rendered as non-clickable items. Used in the lesson viewer page. Client component.

## Tests

- `course-card.test.tsx` -- tests for CourseCard rendering, badges, progress, and links.

## Main Entry Points

- `CourseCard` is used on the dashboard, courses listing, and bookmarks pages.
- `CoursesFilter` is used on the courses listing page.
- `LessonNav` is the course sidebar in the lesson viewer page (hidden on mobile).

> The lesson detail page itself is rendered by the editorial viewer at
> `src/app/(dashboard)/course/[slug]/lesson/[lessonSlug]/editorial-lesson-viewer.tsx`
> (W13: real audio/video playback via `mediaUrl()` and progress persistence via
> `useProgress`). The old tabbed `LessonViewer` was absorbed into it and removed.
