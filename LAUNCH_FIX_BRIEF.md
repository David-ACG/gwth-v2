# Launch fix brief — pointer

The consolidated fix brief for the 2026-07-10 pre-invite review lives in the
**GWTH-launch-plan** repo (launch coordination), because it spans both this repo
(website) and the lesson-content pipeline:

- **Canonical brief:** `GWTH-launch-plan/completion/launch-fix-2026-07-10/FIX_BRIEF.md`
  - GitHub: https://github.com/David-ACG/GWTH-launch-plan/blob/master/completion/launch-fix-2026-07-10/FIX_BRIEF.md
- **Per-lesson editorial findings:** `GWTH-launch-plan/completion/fable-sweep/index.html`
  (served at http://hlab.taila51191.ts.net:8090/packet/board/fable-sweep/index.html)
- **Task tracker:** `bd` (beads) in `GWTH-launch-plan` — `bd show <id>` for any id below.

## The website (this repo) work items, most severe first
Each is fully specified in the brief with repro + root cause + proposed fix + acceptance.

| Bead | Sev | Issue |
|------|-----|-------|
| `26b` | P0 | Dashboard "Month 3 of 3" + scrambled order + wrong Continue (dashboard/page.tsx:156-158, 187; user_access/beta_access_grants month default 3→1) |
| `5vh` | P0 | Blockquotes + quiz bold render as raw markdown (markdown-renderer.tsx:46 pre-parse DOMPurify; editorial-lesson-viewer.tsx:2045/2116/2066) |
| `qar` | P1 | Lesson outline + pagination is a hardcoded placebo |
| `sg6` | P1 | Mobile horizontal-scroll across lesson viewer, /labs, /progress, lab detail |
| `a0k` | P1 | "Report a problem" launcher overlaps the viewer FEEDBACK/NOTES rail (report-problem-launcher/lesson-widgets) |
| `bbg` | P1 | Public "free labs, no account" but lab details 307-redirect anon → /login |
| `fqp` | P2 | Chrome polish (footer date, £29 on locked cards, raw lesson ids, grammar) |

Do NOT send the beta cohort invites until `26b`, `5vh`, `qar` are fixed and a fresh-account
first-hour walk passes (see the brief's "Definition of ready to send the cohort invites").
