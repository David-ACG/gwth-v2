# Progress Components

Visual indicators for tracking learning progress -- rings, status badges, and streak calendars.

## Components

### `ProgressRing` (`progress-ring.tsx`)
Circular SVG progress indicator. Renders a background circle and a filled arc proportional to the given value (0-1). Configurable size and stroke width. Accepts children for center content (e.g., a percentage label). Uses CSS transitions for smooth animation. Client component.

### `StatusBadge` (`status-badge.tsx`)
Colored badge with icon showing a lesson's completion status. Supports four states: completed (green check), in-progress (blue clock), available (gray circle), and locked (gray lock). Uses CSS custom properties for status colors. Conveys meaning through both color and icon+text for accessibility. Server component.

### `StudyStreakCalendar` (`study-streak-calendar.tsx`)
GitHub-style activity heatmap showing the last 365 days of study activity. Displays days as small colored squares grouped by week, with intensity levels (none, low, medium, high). Shows the current streak length and longest streak. Includes a legend. Server component.

## Tests

- `progress-ring.test.tsx` -- tests for SVG rendering, circle attributes, size props, and zero/full progress.
- `status-badge.test.tsx` -- tests for text and icon rendering across all status states.

## Main Entry Points

- `ProgressRing` is used on the dashboard (course cards) and progress page.
- `StatusBadge` is used on course detail pages (lesson lists) and the lesson viewer.
- `StudyStreakCalendar` is used on the dashboard page.
