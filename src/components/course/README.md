# Course Components

Components for browsing courses, viewing lessons, filtering course lists, and taking quizzes.

## Components

### `CourseCard` (`course-card.tsx`)

Card displaying a single course with a gradient thumbnail placeholder, difficulty and category badges, title, description, lesson count, estimated duration, and an optional progress bar. Links to the course detail page. Server component.

### `CoursesFilter` (`courses-filter.tsx`)

Filter bar for the courses listing page. Provides a search input, category dropdown, and difficulty dropdown. All filter state is synced to URL search params so filtered views are shareable and bookmarkable. Client component.

### `LessonNav` (`lesson-nav.tsx`)

Course navigation sidebar tree showing sections and lessons with progress indicators (completed, in-progress, locked, available). Auto-expands the section containing the current lesson. Highlights the active lesson. Locked lessons are rendered as non-clickable items. Used in the lesson viewer page. Client component.

### `HandInForm` (`hand-in/hand-in-form.tsx`)

The capstone hand-in form and the preview the learner confirms (beads gwth-launch-9289.2 and 9289.3). Step one sends the folder (files, a zip or a public GitHub link), whose details are in it, the names to hide and the four answers to `/api/hand-in/<capstone>/prepare`, which stores only the redacted copies; step two shows exactly that, and "Hand in" sends the tick and the preview's hash to `/confirm`. Rendered by `src/app/(dashboard)/course/[slug]/hand-in/[capstone]/page.tsx`, behind `ENABLE_CAPSTONE_HAND_IN`. The rules live in `src/lib/capstones/`. Client component.

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
