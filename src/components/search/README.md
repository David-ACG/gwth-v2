# Search Components

Global search functionality accessible from any dashboard page via the Cmd+K keyboard shortcut.

## Components

### `SearchPalette` (`search-palette.tsx`)
Command palette dialog for finding courses, labs, and navigating to key pages. Built on shadcn's `CommandDialog` (which wraps cmdk) for fuzzy matching. Organized into three result groups:
- **Courses** -- all available courses from mock data.
- **Labs** -- all available labs from mock data.
- **Quick Links** -- Dashboard, Settings, Profile.

Selecting an item navigates to its page and closes the dialog. Uses the `useSearch` hook for open/close state. Client component.

## Main Entry Points

- `SearchPalette` is rendered once in the dashboard layout and controlled via the `useSearch` hook.
- The `DashboardHeader` component triggers the palette via its search button.
- Keyboard shortcut (Cmd+K / Ctrl+K) is handled by the `useSearch` hook.
