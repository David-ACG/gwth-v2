# Pipeline-to-Site Lesson Bridge

**Date:** 2026-03-02
**Scope:** Build the automated content flow from GWTH Pipeline (lesson creation) to GWTH V2 (student-facing site)

---

## Problem Statement

The GWTH ecosystem has two repos that don't talk to each other:

| Repo                | Purpose                                 | Stack                                    | Location                        |
| ------------------- | --------------------------------------- | ---------------------------------------- | ------------------------------- |
| **gwthpipeline520** | Create lessons (AI + RAG + TTS + video) | Python, NiceGUI, Qdrant, Docker          | `C:\Projects\1_gwthpipeline520` |
| **GWTH_V2**         | Display lessons to students             | Next.js 16, React 19, Tailwind, Supabase | `C:\Projects\GWTH_V2`           |

The pipeline generates lesson content as **separate markdown files** on disk. The website expects lesson data as **structured TypeScript objects** matching the `Lesson` interface. There is no bridge between them. Lessons cannot flow from creation to delivery without manual copy-paste.

---

## Current Architecture

### Pipeline Output (per lesson)

The pipeline generates **6 separate files** in `data/generated_lessons/month_N/`:

| File                      | Format                      | Contains                                   |
| ------------------------- | --------------------------- | ------------------------------------------ |
| `lesson_NN_lesson.md`     | Markdown + YAML frontmatter | Main lesson content (2000-3000 words)      |
| `lesson_NN_project.md`    | Markdown                    | Build-along / lab instructions             |
| `lesson_NN_intro.md`      | Markdown                    | Intro narration script with visual markers |
| `lesson_NN_qna.md`        | Markdown                    | 10-15 Q&A pairs with answers               |
| `lesson_NN_slides.json`   | JSON                        | Slide deck structure for video rendering   |
| `lesson_NN_storyboard.md` | Markdown                    | Visual sequence for video production       |

Plus audio/video assets:

- `f5_intro_lesson_NN.wav` — Voice-cloned intro narration (F5-TTS)
- `kokoro_lesson_NN_final.wav` — Main lesson narration (Kokoro TTS)
- `kokoro_lesson_NN_timestamps.json` — Word-level timestamps
- `lesson_NN_intro.mp4` — Rendered intro video (Remotion)

The export service packages these into `gwth-exports/month_NN/lesson_NN/` with a `manifest.json`.

### Pipeline Lesson Schema (syllabus.json)

```json
{
  "id": "uuid",
  "title": "Welcome to GWTH — What AI Can Actually Do For You",
  "description": "string",
  "project_title": "Your First AI Conversation",
  "project_domain": "optional string",
  "difficulty": "Beginner | Intermediate | Advanced",
  "column": "month1 | month2 | month3 | backlog",
  "order": 0,
  "week": 1,
  "duration_minutes": 45,
  "primitive": "Foundations | Content | Code | Data | Ideation | Automation",
  "tags": ["string"],
  "prerequisites": ["string"],
  "source_transcripts": ["filename1.txt"],
  "objectives": ["By end of lesson, you will..."],
  "applied_concepts": ["string"],
  "status": "draft | in_progress | review | published | exported",
  "sub_topics": ["string"],
  "milestones": ["string"],
  "created_at": "ISO-8601",
  "updated_at": "ISO-8601"
}
```

126 lessons defined: 25 (month1) + 35 (month2) + 40 (month3) + 26 (backlog).

### Website Expected Format (TypeScript `Lesson` interface)

```typescript
interface Lesson {
  id: string;
  slug: string; // URL-safe, e.g. "welcome-to-gwth"
  title: string;
  description: string;
  order: number;
  duration: number; // minutes
  difficulty: "beginner" | "intermediate" | "advanced";
  category: string; // maps to pipeline's "primitive"
  sectionId: string; // parent section (week grouping)
  courseId: string; // always "course_gwth" for now
  courseSlug: string; // always "applied-ai-skills" for now
  month: 1 | 2 | 3;
  isOptional?: boolean;
  optionalTrack?: string;

  // Learn content
  introVideoUrl: string | null;
  learnContent: string; // Markdown with custom callout syntax
  audioFileUrl: string | null;
  audioDuration: number | null; // seconds

  // Build content
  buildVideoUrl: string | null;
  buildInstructions: string | null;

  // Quiz & resources
  questions: QuizQuestion[];
  resources: Resource[];

  // State
  status: "locked" | "available" | "in-progress" | "completed";
  createdAt: Date;
  updatedAt: Date;
}

interface QuizQuestion {
  id: string;
  question: string;
  options: string[]; // 4 choices
  correctOptionIndex: number; // 0-based
  explanation: string;
}

interface Resource {
  title: string;
  url: string;
  type: "link" | "download" | "video" | "article";
}
```

### Website Custom Markdown Syntax

The `learnContent` field supports these extensions beyond standard markdown:

```markdown
:::note
Informational callout.
:::

:::warning
Caution callout.
:::

:::tip
Helpful tip callout.
:::

:::deep-dive[Optional Title]
Collapsible advanced content.
:::

The ==AI primitive|A fundamental capability AI systems can perform== is key.
```

The `==term|definition==` syntax renders as a highlighted term with hover tooltip.

---

## The Gap

### Data Model Mismatches

| Field               | Pipeline Has                      | Site Expects                  | Gap                                                                    |
| ------------------- | --------------------------------- | ----------------------------- | ---------------------------------------------------------------------- |
| `slug`              | Not generated                     | Required for URLs             | Must derive from title                                                 |
| `sectionId`         | `week` field                      | Section UUID                  | Need week-to-section mapping                                           |
| `courseId`          | Not present                       | Required                      | Always `"course_gwth"` for now                                         |
| `courseSlug`        | Not present                       | Required                      | Always `"applied-ai-skills"` for now                                   |
| `category`          | `primitive` field                 | String                        | Direct rename                                                          |
| `difficulty`        | Title case (`"Beginner"`)         | Lowercase (`"beginner"`)      | Case transform                                                         |
| `month`             | Derived from `column`             | `1 \| 2 \| 3`                 | Parse from `"month1"` etc.                                             |
| `learnContent`      | Separate `.md` file               | Single string field           | Read file, inject callout syntax                                       |
| `buildInstructions` | Separate `_project.md` file       | Single string field           | Read file content                                                      |
| `questions`         | Separate `_qna.md` file (prose)   | Structured `QuizQuestion[]`   | Parse or restructure during generation                                 |
| `introVideoUrl`     | Generated `.mp4` on disk          | Public HTTPS URL              | Need CDN upload step                                                   |
| `audioFileUrl`      | Generated `.wav` on disk          | Public HTTPS URL              | Need CDN upload step                                                   |
| `resources`         | Not generated                     | `Resource[]` array            | Generate during lesson writing or add manually                         |
| `objectives`        | In `syllabus.json`                | Not in `Lesson` type directly | Used by `ObjectivesCard` component in demo; not in production type yet |
| `status`            | Pipeline status (draft/published) | UI status (locked/available)  | Different meaning — site status is per-user                            |

### Content Format Gaps

| Content            | Pipeline Generates                                         | Site Expects                                                                            |
| ------------------ | ---------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| Lesson body        | Standard markdown with `## Sources Used` table at bottom   | Markdown with `:::note`, `:::warning`, `:::tip`, `:::deep-dive`, `==term\|def==` syntax |
| Q&A                | Prose markdown with questions + answers                    | Structured JSON: `{ question, options[], correctOptionIndex, explanation }`             |
| Build instructions | Markdown with step-by-step narrative                       | Markdown (compatible, but milestones need separate `StepProgress` data)                 |
| Intro script       | Narration markdown with `[VISUAL]` / `[NARRATION]` markers | Not used directly — intro video URL is what the site needs                              |

### Missing Pieces

1. **No CDN/storage for media assets** — Audio `.wav` and video `.mp4` files sit on the P520 filesystem. The site needs public HTTPS URLs.
2. **No structured quiz generation** — The pipeline's `/write-qna` skill produces prose Q&A, not the `{ options[], correctOptionIndex }` format the site needs.
3. **No Supabase lesson tables** — The database has auth and news tables only. No schema for courses, sections, or lessons.
4. **No sync mechanism** — Export creates ZIP packages but nothing pushes them to the site's data layer.

---

## Proposed Solution: 3-Phase Bridge

### Phase 1 — Structured Export (Pipeline Side)

**Goal:** Make the pipeline output match the site's `Lesson` JSON schema directly.

**Where:** `C:\Projects\1_gwthpipeline520`

1. **Add a `lesson_assembler` service** that:
   - Reads syllabus metadata for a lesson
   - Reads the generated markdown files (lesson, project, qna)
   - Assembles a single JSON object matching the site's `Lesson` interface
   - Generates `slug` from title (lowercase, hyphenated)
   - Maps `primitive` → `category`, `column` → `month`, `week` → `sectionId`
   - Injects callout syntax (:::note, :::tip, etc.) into lesson markdown
   - Outputs to `gwth-exports/month_NN/lesson_NN/lesson.json`

2. **Update the `/write-qna` skill** to output structured quiz JSON:

   ```json
   [
     {
       "id": "m1_l01_q1",
       "question": "What is the core philosophy of GWTH?",
       "options": [
         "You need to learn to code first",
         "If you can describe it, you can build it with AI",
         "AI will replace all human jobs",
         "Only experts can use AI tools"
       ],
       "correctOptionIndex": 1,
       "explanation": "GWTH's philosophy is that clear thinking and plain English descriptions are enough to build with AI."
     }
   ]
   ```

3. **Update the `/write-lesson` skill** to include custom callout syntax:
   - Use `:::note` for "good to know" asides
   - Use `:::warning` for common mistakes / gotchas
   - Use `:::tip` for practical advice
   - Use `:::deep-dive[Title]` for optional advanced content
   - Use `==term|definition==` for key vocabulary

4. **Add a `resources` field** to the syllabus schema and populate during lesson writing.

### Phase 2 — Media Storage + Supabase Schema (Both Repos)

**Goal:** Give media assets public URLs and create database tables for lessons.

**Pipeline side:**

1. Upload audio/video to Supabase Storage (or S3/R2) after generation
2. Store the public URLs in the export manifest
3. Include URLs in the assembled `lesson.json`

**Site side:**

1. Create Supabase migration for lesson-related tables:
   - `courses` — single course for now
   - `sections` — week groupings within a month
   - `lessons` — all lesson metadata + content fields
   - `quiz_questions` — normalized from lesson
   - `resources` — normalized from lesson
2. Update `src/lib/data/lessons.ts` to query Supabase instead of mock data
3. Keep the same public interface (`getLesson()`, `getLessons()`, etc.)

### Phase 3 — Automated Sync (Pipeline → Site)

**Goal:** One-click or fully automatic lesson publishing.

**Options (choose one):**

**Option A — Push from Pipeline:**

- Pipeline export service calls a Supabase API to upsert lesson records
- Media already uploaded in Phase 2
- Dashboard "Publish" button triggers the full flow
- Pros: Pipeline controls when content goes live
- Cons: Pipeline needs Supabase credentials

**Option B — Pull from Site:**

- Pipeline exports `lesson.json` to a shared location (Supabase Storage bucket or Git)
- Site has an admin API route (`/api/admin/import-lessons`) that reads and imports
- Cron job or webhook triggers import
- Pros: Site controls its own data
- Cons: Extra hop

**Option C — Shared Database (Recommended):**

- Pipeline writes directly to the same Supabase instance the site reads from
- Pipeline uses `SUPABASE_SERVICE_ROLE_KEY` for writes
- Site uses `SUPABASE_ANON_KEY` for reads (RLS policies control access)
- No sync needed — write once, read everywhere
- The pipeline's "Publish" button does: assemble JSON → upload media → upsert to Supabase → lesson is live
- Pros: Simplest, no sync lag, single source of truth
- Cons: Tighter coupling (but they share a database anyway via Supabase)

---

## Recommended Implementation Order

### Sprint 1: Structured Quiz Generation (Pipeline)

- Update `/write-qna` skill to output `QuizQuestion[]` JSON format
- Update export service to include structured quiz data
- Test with 2-3 lessons

### Sprint 2: Lesson Assembler Service (Pipeline)

- New `lesson_assembler.py` service
- Reads syllabus + generated files → outputs `Lesson` JSON
- Handles all field mappings (slug, category, sectionId, month, difficulty case)
- Injects custom markdown syntax during assembly
- Add "Assemble" button to Export tab in dashboard

### Sprint 3: Custom Markdown in Lesson Writing (Pipeline)

- Update `/write-lesson` skill prompt to use `:::note`, `:::tip`, `:::warning`, `:::deep-dive`, `==term|def==`
- Validate output contains expected syntax
- Regenerate first few lessons as proof of concept

### Sprint 4: Supabase Lesson Schema (Site)

- Create migration: `courses`, `sections`, `lessons`, `quiz_questions`, `resources` tables
- Update `src/lib/data/lessons.ts` to query Supabase
- Keep mock data as fallback when DB is empty
- Test with manually inserted records

### Sprint 5: Media Upload + CDN (Pipeline)

- Configure Supabase Storage bucket for lesson media
- Upload audio (`.wav` → `.mp3` transcode first) and video (`.mp4`)
- Store public URLs in assembled `lesson.json`
- Add upload step to export pipeline

### Sprint 6: Direct Publish Flow (Pipeline → Supabase)

- Pipeline writes assembled lesson directly to Supabase
- Dashboard "Publish" button: assemble → upload media → upsert DB → lesson is live
- Add rollback capability (unpublish = set status to draft)
- Add bulk publish for releasing a whole month at once

---

## Architecture Decisions

### Keep Separate Repos

The pipeline and site communicate through **data** (Supabase DB + Storage), not code imports. This is a natural boundary:

- Pipeline = producer (write lessons)
- Supabase = shared state (lesson records + media)
- Site = consumer (read and display lessons)

### Shared Types via JSON Schema

To prevent schema drift, create a `lesson-schema.json` (JSON Schema) that both repos validate against:

- Pipeline validates assembled JSON before writing to Supabase
- Site can validate on read (optional, TypeScript types are primary)
- Schema lives in a shared location (Supabase Storage or a tiny shared npm package)

### Custom Markdown as Source Format

The lesson content uses custom syntax (`:::note`, `==term|def==`). This syntax should be:

- **Generated by the pipeline** during lesson writing (not injected post-hoc)
- **Rendered by the site** via `MarkdownRenderer` component (already works)
- **Stored as-is** in the database (no pre-rendering)

### Quiz Format Change

The pipeline currently generates Q&A as prose markdown. The site needs structured `QuizQuestion[]`. This means:

- The `/write-qna` skill must output JSON, not markdown
- Each question needs 4 options (multiple choice), one correct answer, and an explanation
- The pipeline should validate quiz structure before export

---

## File Locations for New Code

| What                             | Where                                            | Why                                                                     |
| -------------------------------- | ------------------------------------------------ | ----------------------------------------------------------------------- |
| Lesson assembler service         | `pipeline/app/services/lesson_assembler.py`      | Pipeline responsibility — transforms generated content into site format |
| Updated `/write-qna` skill       | `pipeline/.claude/skills/write-qna/SKILL.md`     | Pipeline responsibility — content generation                            |
| Updated `/write-lesson` skill    | `pipeline/.claude/skills/write-lesson/SKILL.md`  | Pipeline responsibility — content generation                            |
| Supabase lesson migration        | `site/supabase/migrations/003_lesson_tables.sql` | Site responsibility — database schema                                   |
| Updated data layer               | `site/src/lib/data/lessons.ts`                   | Site responsibility — data fetching                                     |
| JSON Schema (shared)             | Both repos: `schemas/lesson.schema.json`         | Validation contract between systems                                     |
| Media upload utility             | `pipeline/app/services/media_uploader.py`        | Pipeline responsibility — asset management                              |
| Admin import route (if Option B) | `site/src/app/api/admin/import-lessons/route.ts` | Site responsibility — data ingestion                                    |

---

## Success Criteria

1. Pipeline can generate a lesson and export it as a single `Lesson` JSON matching the site's TypeScript interface
2. Quiz questions are structured (`options[]`, `correctOptionIndex`, `explanation`) not prose
3. Lesson content includes custom markdown syntax (callouts, key terms) natively
4. Audio/video assets have public HTTPS URLs (not local filesystem paths)
5. A "Publish" action in the pipeline dashboard makes a lesson appear on the website within seconds
6. No manual copy-paste, file editing, or code deployment needed to publish a lesson
7. Both repos validate against a shared schema to prevent drift

---

## Implementation Notes — 2026-03-03 16:42

- **Commit:** 89402fc test: add pipeline-to-site bridge test coverage (import API + pipeline types)
- **Tests:** 14 files, 110 tests — all passed (including 27 new bridge tests)
- **Verification URL:** http://192.168.178.50:3001 (P520 test)
- **Playwright check:** N/A — this prompt is an architecture/bridge plan; site-side infrastructure was already implemented in previous sessions
- **Changes summary:**
  - Added 17 tests for `/api/admin/import-lessons` route (auth validation, payload validation, RPC flow, manual fallback, GET endpoint, mixed results, 422 on total failure)
  - Added 10 tests for `pipelinePayloadToLesson` conversion (field mapping, date conversion, optional fields, custom markdown preservation, all difficulty/month values)
  - PIPELINE_API_KEY already configured on P520 (env var ID: 42)
  - Site-side bridge infrastructure verified complete: Supabase migration (003), admin import API, data layer with Supabase+mock fallback, shared JSON schema, pipeline types
  - Moved PROMPT_6 from 2_testing/ to 3_done/
- **Deviations from plan:** The site-side code (Sprint 4: Supabase schema, data layer, import API) was already fully implemented in a prior session. This execution focused on adding test coverage for the bridge components and verifying the deployment. Pipeline-side work (Sprints 1-3, 5-6) is in the gwthpipeline520 repo and out of scope for this GWTH_V2 prompt.
- **Follow-up issues:**
  - Pipeline assembler needs updating for new lesson directory format (Task 2 in PLAN_2026-03-03_pipeline-bridge-remaining.md)
  - Pipeline publisher service needs creation (Task 3)
  - Hetzner production needs PIPELINE_API_KEY env var set (Task 1)
  - End-to-end lesson viewer verification with real Supabase data (Task 4)

---

## Testing Checklist — 2026-03-03 16:42

**Check the changes:** http://192.168.178.50:3001

- [ ] Page loads without errors
- [ ] Import API returns 401 without valid API key (curl -s http://192.168.178.50:3001/api/admin/import-lessons → 401 or method not allowed)
- [ ] Health endpoint returns healthy (curl -sf http://192.168.178.50:3001/api/health)
- [ ] Dashboard pages load (login → /dashboard)
- [ ] Course detail page loads with lesson list
- [ ] Light/dark mode correct
- [ ] No console errors

**Review this file:** `file:///C:/Projects/GWTH_V2/kanban/1_planning/PROMPT_2026-03-02_pipeline-to-site-lesson-bridge.md`
