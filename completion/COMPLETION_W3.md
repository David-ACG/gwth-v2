# Completion: W3 — Wire real Month-1 lesson & lab content end to end (Drizzle/Postgres)

**Date:** 2026-06-23 · **Repo:** GWTH_V2 · **Commit(s):** _see git log for this packet's commit_
**Test URL:** http://192.168.178.50:3001/course/applied-ai-skills · **Status:** verified

## What changed (data path: mock/Supabase → Drizzle/Postgres)
- **Import endpoint ported off Supabase** (`src/app/api/admin/import-lessons/route.ts`):
  now upserts course → section → lesson → quiz → resources through Drizzle
  (`getDb()` + transactions), keeping the service-key auth and the per-lesson
  response contract. The old `createAdminClient` / `rpc("upsert_lesson_from_pipeline")`
  path is gone — staging had no Supabase env, so that route used to 500.
- **New `labs` table** (`drizzle/schema.ts` + `drizzle/0001_w3_labs.sql`) matching the
  `Lab` shape (instructions stored as `jsonb`). `labs.ts`, `lessons.ts` and `courses.ts`
  now **read Postgres first** via `getDb()` and keep the **mock fallback** when
  `DATABASE_URL` is absent (same pattern as `progress.ts`).
- **26 Month-1 lessons + 30 Month-1 labs imported** into the staging Postgres and rendering
  live on :3001. The lesson viewer + lab pages render the **real imported body, Q&A and
  figures**, with missing images degrading gracefully (no broken icons).
- **Zero Supabase** remains in the lesson/lab/import path.

## UI
**Lesson viewer — real imported body (prose) + real Q&A**
![lesson desktop](W3/lesson-1280.png)
![lesson mobile](W3/lesson-390.png)
![lesson Q&A desktop](W3/lesson-qa-1280.png)

**Course page — 26 imported Month-1 lessons grouped by week**
![course desktop](W3/course-1280.png)
![course mobile](W3/course-390.png)

**Labs — 30 real Month-1 labs from Postgres**
![labs desktop](W3/labs-1280.png)
![lab detail desktop](W3/lab-1280.png)
![lab detail mobile](W3/lab-390.png)

Test it:
- Course → lesson: http://192.168.178.50:3001/course/applied-ai-skills → open any lesson
- Lesson direct: http://192.168.178.50:3001/course/applied-ai-skills/lesson/welcome-to-gwth-six-ways-ai-can-give-you-superpowers
- Lab direct: http://192.168.178.50:3001/labs/three-chatbots-one-difficult-email

## Content (live, the way a student sees it)
26 Month-1 lessons (real bodies 17k–35k chars, 3 Q&A each) + 30 labs, all on Postgres/Drizzle:
- L01 Welcome to GWTH — http://192.168.178.50:3001/course/applied-ai-skills/lesson/welcome-to-gwth-six-ways-ai-can-give-you-superpowers
- L03 How AI Works — http://192.168.178.50:3001/course/applied-ai-skills/lesson/how-ai-works-the-useful-bits-that-make-you-better-at-it
- L06 Research Superpower — http://192.168.178.50:3001/course/applied-ai-skills/lesson/research-superpower-find-compare-and-verify-anything
- L21 FamilyBot Blueprint — http://192.168.178.50:3001/course/applied-ai-skills/lesson/familybot-blueprint-design-a-helpful-ai-for-home-life
- Lab 1 — http://192.168.178.50:3001/labs/three-chatbots-one-difficult-email

### Binding / relink note (hard rule honoured)
The pipeline `syllabus.json` M1 bindings are broken (`research_folder` unset on all 24 →
positional-glob resolution produced **3 duplicate-content pairs + ~20 title/content
mismatches**; a naive `--month 1` publish would have written the **wrong body** to most
slots). Per the hard rule "never import unrelinked duplicates," I did **not** import the
broken dry-run. Instead the payloads were rebuilt **keyed by content folder** (each
lesson's id, title, slug, body and Q&A all come from the *same* `generated_lessons/m1_lNN_*`
folder, so title↔body is always self-consistent and no two lessons share a body). The 5
duplicate/empty alternate folders were dropped and logged. `apply_relink` itself was not
required (the 2026-06-18 `research_folder`-preference fix already made it optional — see
`1_gwthpipeline520/kanban/FINDINGS_2026-06-16_m1-export-resolver.md`).

## Backend / data / infra
```mermaid
flowchart LR
  subgraph Pipeline["1_gwthpipeline520"]
    F[generated_lessons/m1_l*<br/>folders = source of truth]
    F --> P[w3-clean payloads<br/>26 self-consistent JSON]
  end
  P -->|POST /api/admin/import-lessons<br/>PIPELINE_API_KEY| R[Import route<br/>Drizzle upsert in a txn]
  R --> DB[(staging Postgres 17.10<br/>l08k8… on coolify net)]
  DB --> RL[lessons.ts / labs.ts / courses.ts<br/>getDb → mock fallback]
  RL --> UI[Lesson viewer + Lab pages<br/>:3001]
  classDef gone fill:#fdd,stroke:#c00;
  X[createAdminClient / supabase.rpc]:::gone -.removed.-> R
```
**What changed & why it's safe:** the import route now writes via Drizzle inside a
per-lesson **transaction** (partial failure rolls back; re-import is idempotent — course
upserted `onConflictDoNothing`, section/lesson `onConflictDoUpdate`, quiz/resources
delete-then-insert). The `labs` table is **additive** (`CREATE TABLE IF NOT EXISTS`, no
existing table touched); FKs (`sections.course_id`, `lessons.section_id`) stay intact
because course+section are upserted before the lesson. Read layer keeps the mock fallback,
so unsetting `DATABASE_URL` reverts to in-memory data with no code change. No Supabase
remains in this path.

## What David should verify
- [ ] Open http://192.168.178.50:3001/course/applied-ai-skills — 26 real Month-1 lessons listed across 4 weeks; click into one and read the real body + Q&A (no lorem, no broken images).
- [ ] Open http://192.168.178.50:3001/labs/three-chatbots-one-difficult-email — real lab content + step instructions render from Postgres.
- [ ] Spot-check a lesson's title matches its body topic (the binding fix) — e.g. "How AI Works" reads about how AI works.

## Verification run
```
npm test            → 298 passed | 11 skipped (43 files); import-lessons route: 19/19
npx tsc --noEmit    → clean
POST :3001 import   → HTTP 200 {total:26, successful:26, failed:0}
staging DB counts   → lessons 26 | sections 4 | quiz 78 | labs 30
GET lessonCount     → 26
mock fallback       → DATABASE_URL unset: /labs, /course, lesson + lab pages all HTTP 200 (mock data)
supabase grep       → none in lessons.ts/labs.ts/courses.ts/import route/course+labs pages
Playwright walk     → course→lesson→lab on :3001; console errors: 0 (after graceful-image fix)
```
