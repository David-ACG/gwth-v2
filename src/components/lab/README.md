# Lab Components

Components for browsing and displaying hands-on labs.

## Components

### `LabCard` (`lab-card.tsx`)
Card displaying a single lab. Shows a colored top bar (using the lab's assigned color), difficulty badge, optional "Pro" badge for premium labs, title, description, technology pills, duration, and an optional progress indicator. Links to the lab detail page. Server component.

### `LabsFilter` (`labs-filter.tsx`)
Filter bar for the labs listing page. Provides a search input, category dropdown, difficulty dropdown, and technology dropdown. All filter state is synced to URL search params for shareable/bookmarkable filtered views. Client component.

## Main Entry Points

- `LabCard` is used on the labs listing page, dashboard, and bookmarks page.
- `LabsFilter` is used on the labs listing page.

## Data

Lab data is served from `lib/data/labs.ts` with functions: `getLabs()`, `getLab(slug)`, `searchLabs()`, `getLabFilters()`.
