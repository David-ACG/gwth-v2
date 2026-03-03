# Plan: Pipeline-to-Site Bridge — Remaining Tasks

## Context

The Pipeline-to-Site Lesson Bridge (GWTH-7jf) was implemented in the previous session. The import API, Supabase migration, and data layer are all working — we successfully imported lesson 1.2 end-to-end on P520. Four tasks remain to complete the bridge.

---

## Task 1: Set PIPELINE_API_KEY on Hetzner Production

**Files:** None (infra only)

SSH + tinker is confirmed working on Hetzner. David IS in the docker group (CLAUDE.md note is outdated).

**Steps:**
1. `ssh hetzner` → `docker exec coolify php artisan tinker` → `EnvironmentVariable::create(...)` with `resourceable_id: 3`, `is_runtime: true`
2. Trigger redeploy via tinker (app UUID `tw0cc8oc0w4scwoccs0cw0go`)
3. Wait 60s + health check `https://gwth.ai/api/health`
4. Verify import API returns 401: `https://gwth.ai/api/admin/import-lessons`

---

## Task 2: Update Assembler for New Lesson Directory Format

**File:** `C:\Projects\1_gwthpipeline520\app\services\lesson_assembler.py`

The assembler currently expects the OLD format:
```
generated_lessons/month1/lesson_01_welcome.md
generated_lessons/month1/lesson_01_project.md
generated_lessons/month1/lesson_01_qna.json
```

But the pipeline now generates lessons in a NEW format:
```
generated_lessons/lesson_1_2_intro_to_llms_and_.../
├── metadata.json
├── description.md
├── learn_sections/all_sections.md
├── build_section.md
├── check_questions.json
├── intro_video_script.md
└── LESSON_PACK.md
```

**Changes to `LessonAssembler`:**

1. Add `_find_new_format_dir(month, lesson_num)` — Glob for `lesson_{month}_{lesson_num}_*` directories in `self.generated_dir`

2. Add `_convert_check_questions(raw, month, lesson_num)` — Convert from pipeline format:
   ```python
   # From: {"questions": [{"number":1, "options":{"A":"...","B":"..."}, "correct":"B"}]}
   # To:   [{"id":"m1_l02_q1", "options":["...","..."], "correctOptionIndex":1}]
   ```

3. Modify `assemble_lesson()` — After syllabus lookup, try new format first, fall back to old:
   ```python
   new_dir = self._find_new_format_dir(m, num)
   if new_dir:
       learn_content = read new_dir/learn_sections/all_sections.md
       project_md = read new_dir/build_section.md
       description = read new_dir/description.md
       questions = convert new_dir/check_questions.json
   else:
       # existing old-format logic
   ```

4. Use `description.md` from new format to populate the `description` field (currently only gets it from syllabus metadata, which is long — the generated `description.md` is better).

---

## Task 3: Wire Up Auto-POST After Assembly

**New file:** `C:\Projects\1_gwthpipeline520\app\services\lesson_publisher.py`
**Modified:** `C:\Projects\1_gwthpipeline520\app\services\lesson_assembler.py` (add publish method)

Create a `LessonPublisher` service that POSTs assembled payloads to the site's import API.

```python
class LessonPublisher:
    def __init__(self, api_url: str, api_key: str):
        ...

    def publish(self, payloads: list[dict]) -> dict:
        """POST lessons to the import API. Returns the API response."""

    def assemble_and_publish(self, assembler, month=None, lesson_id=None):
        """Assemble + publish in one call."""
```

Also add a CLI entry point script `scripts/publish_lessons.py`:
```
python scripts/publish_lessons.py --month 1           # all month 1
python scripts/publish_lessons.py --lesson-id UUID     # single lesson
python scripts/publish_lessons.py --all                # everything
python scripts/publish_lessons.py --lesson-num 1.2     # by number
```

Config from env vars: `GWTH_SITE_URL`, `PIPELINE_API_KEY`.

---

## Task 4: Verify Lesson Viewer Renders Supabase Content

**Context:** The lesson viewer, MarkdownRenderer, QuizEngine, and data layer already exist and work with mock data. The Supabase data layer is already wired in (lessons.ts, courses.ts). We need to verify end-to-end rendering with real imported data.

**Steps:**
1. Open P520 site in browser, log in with test account
2. Navigate to the course page → verify section "Week 1: Foundations" appears
3. Navigate to lesson 1.2 → verify:
   - Learn tab: markdown renders correctly (headings, lists, tables, bold text)
   - Quiz tab: 3 questions render, can select answers, submit, see explanations
   - Resources tab: 4 links display
   - Navigation: prev/next buttons work (even if only 1 lesson)
4. Fix any rendering issues found

**Likely fixes needed:**
- Course thumbnail missing (`/images/course-gwth.jpg` doesn't exist) — add a placeholder or handle null gracefully
- Learn content may need callout injection (the raw content from the pipeline doesn't have `:::note` syntax yet)

---

## Execution Order

1. **Task 2** (assembler update) — foundation for everything else
2. **Task 3** (publisher) — depends on Task 2
3. **Task 1** (Hetzner env var) — independent, can run in parallel with 2+3
4. **Task 4** (viewer verification) — run after importing via the new publisher

## Verification

1. **Assembler:** Run `python -c "from app.services.lesson_assembler import LessonAssembler; a = LessonAssembler(Path('data')); r = a.assemble_lesson(month=1, lesson_num=2); print(r['title'], len(r['learnContent']), len(r['questions']))"` in pipeline repo
2. **Publisher:** Run `python scripts/publish_lessons.py --lesson-num 1.2` → should POST to P520 and return success
3. **Hetzner:** `curl -s https://gwth.ai/api/health` → healthy; `curl -s https://gwth.ai/api/admin/import-lessons` → 401
4. **Viewer:** Playwright or manual browser check on P520 (login → course → lesson)
5. **Tests:** `cd C:\Projects\GWTH_V2 && npm test` — all existing tests pass
