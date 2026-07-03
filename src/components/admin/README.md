# components/admin

Client components for the W4 admin dashboard (`/admin`, David-facing).

- `admin-nav.tsx` — header navigation across the four panels (Overview,
  Roster, Funnel, Feedback) with active-route underline.
- `grant-form.tsx` — Panel 4: manual beta grant form. Posts to the
  session-gated `/api/admin/grant` wrapper and `router.refresh()`es so the
  roster reflects the new grant without a manual reload.
- `feedback-read-toggle.tsx` — Panel 3: read/unread marker button per inbox
  row, PATCHing `/api/admin/feedback`.

Server-side pieces live elsewhere: the access gate in `src/app/admin/layout.tsx`
(Better Auth session + `ADMIN_EMAILS` env allowlist via `src/lib/admin.ts`),
data reads in `src/lib/data/admin.ts`, and the FDE-register styles in
`src/app/admin/admin-fde.module.css` (DESIGN_FDE.md governs; denser tables are
sanctioned for this David-facing surface).

This module does not import from sibling feature modules.
