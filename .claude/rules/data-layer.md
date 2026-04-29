---
paths:
  - "src/lib/**/*.ts"
---

<!-- SENTINEL: rule=data-layer, salt=dl-5J1n -->

# Data Layer — Domain Model

Loaded automatically when editing files under `src/lib/**`. Defines the content types the UI must support. How they're stored is a backend concern.

## Data layer abstraction (architectural rule)

All data access goes through functions in `lib/data/` (e.g. `getCourse(slug)`, `getLessons(courseId)`, `updateProgress()`). These return typed interfaces. Initially use mock/seed data. The real backend will be wired in later. Every function must have a JSDoc comment describing what it returns.

**Auth abstraction.** Use a `lib/auth.ts` that exports `getCurrentUser()`, `requireAuth()`, etc. Stub these with a mock user for now. Real auth provider will be configured separately.

**Config abstraction.** All magic numbers, feature flags, and app-wide settings go in `lib/config.ts` — not scattered across components. This includes layout dimensions, animation durations, pagination sizes, etc.

## File structure (under `src/lib/`)

```
src/lib/
├── data/                     # Data-fetching abstraction layer
│   ├── courses.ts            # getCourses(), getCourse(slug), searchCourses()
│   ├── lessons.ts            # getLessons(), getLesson(slug)
│   ├── labs.ts               # getLabs(), getLab(slug), searchLabs()
│   ├── progress.ts           # getProgress(), updateProgress(), getStreak()
│   ├── bookmarks.ts          # getBookmarks(), toggleBookmark()
│   ├── notes.ts              # getNotes(), saveNote(), deleteNote()
│   ├── notifications.ts      # getNotifications(), markRead()
│   └── mock-data.ts          # Seed/mock data for development
├── auth.ts                   # Auth abstraction (getCurrentUser, requireAuth)
├── config.ts                 # App-wide constants, feature flags, layout dimensions
├── types.ts                  # Shared TypeScript interfaces (all JSDoc'd)
├── utils.ts                  # cn() and helpers
└── validations.ts            # Zod schemas for forms (login, signup, quiz, profile, settings)
```

## Domain Model (reference — shapes the UI, not the database)

### Course

- `title`, `slug`, `description`, `thumbnail`, `blurDataUrl`, `price`
- Contains ordered **sections**, each containing ordered **lessons**
- `category`, `difficulty`, `estimatedDuration`

### Lesson

- `title`, `slug`, `description`, `order`, `duration`, `difficulty`, `category`
- **Learn content:** video (`introVideoUrl`) + rich text/MDX (`learnContent`) + audio (`audioFileUrl`, `audioDuration`)
- **Build content:** video (`buildVideoUrl`) + step-by-step instructions (`buildInstructions`)
- **Quiz:** questions with scoring (`questions` JSON)
- **Resources:** links, downloads (`resources` JSON)
- **Status:** locked | available | completed
- **Hierarchy:** lessons can have sub-lessons (parent/child)

### Lab

- `title`, `slug`, `description`, `difficulty`, `duration`
- `technologies[]`, `learningOutcomes[]`, `prerequisites`
- `content` (markdown), `instructions` (step-by-step JSON)
- `category`, `projectType`, `color`, `icon`
- `isPremium`

### Progress (per user)

- **Lesson:** `isCompleted`, `progress` (0-1), `quizScore`, `bestQuizScore`, `quizAttempts`, `timeSpent`
- **Lab:** `isCompleted`, `progress` (0-1)
- **Course:** `progress` (0-1), `completedAt`

### Study Streak

- `currentStreak` (consecutive days), `longestStreak`, `lastActiveDate`
- `weeklyActivity[]` (array of 7 booleans for heatmap display)

### Bookmark

- `userId`, `lessonId` or `labId`, `createdAt`
- Used for "saved for later" / favorites feature

### Note

- `userId`, `lessonId`, `content` (markdown), `timestamp` (video position if applicable)
- Students can annotate lessons with personal notes

### Certificate

- `userId`, `courseId`, `issuedAt`, `certificateUrl`
- Awarded on course completion (100% lessons + passing quiz scores)

### Notification

- `userId`, `type` (achievement | reminder | announcement), `title`, `message`, `read`, `createdAt`
- For study reminders, achievement unlocks, new content alerts

## Constants

Use `lib/config.ts` for constants like `MAX_QUIZ_ATTEMPTS`, `SIDEBAR_WIDTH`, animation durations, pagination sizes. UPPER_SNAKE_CASE naming.
