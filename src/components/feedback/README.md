# feedback

The beta "report a problem" channel (W5 — tester onboarding).

| File | What it is |
|---|---|
| `report-problem-panel.tsx` | The single feedback surface. Paper panel in the FDE register (hard-offset shadow, ink border, square hairline inputs, mono labels). Captures the source page, posts to `POST /api/feedback`. `variant="inline"` for the always-in-view /guide column; `variant="modal"` for the launcher overlay. |
| `report-problem-launcher.tsx` | Floating trigger + overlay mounted on authenticated pages (dashboard + lesson viewer) via the `(dashboard)` layout. Opens the same panel; hidden on `/guide`. |
| `report-problem.module.css` | Scoped `--v-*` FDE palette (light + dark) + panel/form/launcher recipes. |

## Data flow

1. `report-problem-panel` → `POST /api/feedback` (`src/app/api/feedback/route.ts`).
2. The route resolves the Better Auth session, then `createFeedback()` writes the
   row **first** (`src/lib/data/feedback.ts`, Drizzle / `feedback` table).
3. A best-effort `sendPlunkEmail()` notifies `david@gwth.ai`; on success the row's
   `emailSent` flag is flipped. **The row survives any Plunk failure.**

## Scoping (D2 — no RLS, app-level)

Testers read only their own rows; `david@gwth.ai` reads all (the W4 inbox uses
`getAllFeedback()`). Enforced in `src/app/api/feedback/route.ts` via
`isFeedbackAdmin()`.
