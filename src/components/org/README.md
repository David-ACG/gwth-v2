# `components/org` — institution admin controls (N7)

The interactive parts of `/org`, the screen an institution's own staff use to
curate their edition of the GWTH course. Everything else on those pages is a
Server Component; these are `"use client"` only because they own a form
control or a pending state.

| Component | What it does |
|---|---|
| `org-nav.tsx` | Header navigation. Hides the editing sections from tutors — signposting only; the server actions refuse them independently. |
| `lesson-toggle.tsx` | `LessonToggle` switches a lesson in/out of the edition; `MandatoryToggle` decides whether it counts toward the baseline. |
| `pass-mark-form.tsx` | The one pass mark per edition (decision 4, 2026-08-28). Threads into N6's grading with no further wiring. |
| `ratification-controls.tsx` | Ratify a draft lesson, or send it back with a required note. |

## Rules this module follows

- **Authority is never in the client.** Every control calls a server action
  that re-derives the caller's role from the session and pins the edition to
  the one their organisation owns (`src/lib/actions/org-admin.ts`). A disabled
  button is a courtesy, never a gate.
- **Real form controls, not widget lookalikes.** The switches are
  `<input type="checkbox">` with a real `<label>`, so keyboard operation and
  screen-reader state come for free.
- **Optimistic with rollback.** Each control owns one boolean, flips it
  immediately, and puts it back with an error toast if the server refuses —
  including in preview mode, where the refusal is the honest message
  "changes are not saved".
- **No sibling-feature imports.** Styles come from the shared staff register
  (`src/app/admin/admin-fde.module.css` + `src/app/org/org-fde.module.css`);
  nothing here imports from `components/course`, `components/lab` or
  `components/admin`.
