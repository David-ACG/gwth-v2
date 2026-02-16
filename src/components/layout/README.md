# Layout Components

Structural components that make up the application shell -- navigation, sidebar, header, footer, and breadcrumbs.

## Components

### `PublicNav` (`public-nav.tsx`)
Navigation bar for public-facing pages (landing, about, pricing). Renders the GWTH.ai logo, nav links (Home, About, Pricing), and login/signup CTA buttons. Sticky-positioned with a frosted glass background. Client component (uses `usePathname` for active link highlighting).

### `Sidebar` (`sidebar.tsx`)
Collapsible dashboard sidebar with two navigation groups: main (Dashboard, Courses, Labs, Progress) and secondary (Bookmarks, Notifications, Profile, Settings). On desktop, renders as a persistent `<aside>` that toggles between expanded (280px) and collapsed (64px) widths. On mobile, renders inside a shadcn `Sheet` overlay. Uses the `useSidebar` hook for state management.

### `DashboardHeader` (`header.tsx`)
Top header bar for authenticated dashboard pages. Contains the breadcrumb navigation, a search trigger (opens the Cmd+K palette via `useSearch`), a light/dark theme toggle (via `next-themes`), and a user avatar. On mobile, includes a hamburger button to open the sidebar sheet.

### `BreadcrumbNav` (`breadcrumb-nav.tsx`)
Dynamic breadcrumb trail built from the current URL path. Automatically maps route segments to human-readable labels and filters out Next.js route groups (parenthesized segments). The last segment renders as non-linked text; all others are clickable links.

### `Footer` (`footer.tsx`)
Site footer for public pages. Displays the GWTH.ai logo, a tagline, and organized link columns (Product, Resources, Legal) with a copyright line. Server component.

## Layout Flow

```
Public pages:  PublicNav -> content -> Footer
Auth pages:    Centered card (no nav/footer)
Dashboard:     Sidebar + DashboardHeader -> content area (max 1400px)
```

## Main Entry Points

- Use `PublicNav` + `Footer` in the public layout (`app/(public)/layout.tsx`).
- Use `Sidebar` + `DashboardHeader` in the dashboard layout (`app/(dashboard)/layout.tsx`).
- `BreadcrumbNav` is consumed internally by `DashboardHeader`.
