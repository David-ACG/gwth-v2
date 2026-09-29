# Lessons in parts: the site side

Bead gwth-launch-hqyp. Style Bible item `lesson-viewer-two-formats`.

A lesson with a row in `lesson_parts` is shown one part per screen in the format the learner chose:

- **Read or listen**: the part's text is read out word for word, with the spoken word highlighted.
- **Watch short videos**: a narrated video per part, with captions, and the text underneath.

Every part ends with one check question. The learner must get it right to continue. After two wrong tries, the answer and explanation show and Continue unlocks. These checks replace the end-of-lesson quiz. A lesson without a `lesson_parts` row keeps the page-flip viewer. Admins can see that viewer for any lesson with `?viewer=classic`.

## Tables (migration 024)

| Table | Holds |
|---|---|
| `lesson_parts` | The content, including check answers. Only the server reads it. |
| `lesson_part_checks` | Per learner and part: tries, whether the first answer was right, when the check was resolved. |
| `learner_preferences` | The chosen format and the read-along setting. |
| `lesson_events` | The first-party event log behind `/admin/lessons`. |

Migration 024 changes no existing table. If the site runs without it, every lesson falls back to the page-flip viewer.

**Apply 024 on production before the release that carries this code.** The command is in the migration header.

When every part is resolved, the lesson is credited on `lesson_progress`:

- `quiz_passed` and `intro_video_progress = 1`, so the existing completion formula, the dashboard and the org reports read it as complete.
- `best_quiz_score`, set to the share of parts answered right first time.

## Content shape (`src/lib/lessons/parts.ts`, `lessonPartsSchema`)

```json
{
  "version": 1,
  "lessonId": "m1_l10",
  "title": "Data superpower: turn messy information into answers",
  "intro": {"video": "lessons/m1_l10/formats/intro.mp4", "poster": "lessons/m1_l10/formats/intro.jpg", "seconds": 74.8, "captions": "WEBVTT\n..."},
  "parts": [{
    "id": "p1", "title": "...", "minutes": 5,
    "bodyMd": "Markdown, 400 to 700 words",
    "image": {"light": "lessons/m1_l10/formats/img/pitfalls.jpg", "dark": "lessons/m1_l10/formats/img/pitfalls-dark.jpg", "alt": "...", "caption": "..."},
    "check": {"question": "...", "options": ["...", "...", "..."], "answerIndex": 1,
              "feedbackRight": "...", "feedbackWrong": "...", "explanation": "optional; falls back to feedbackRight"},
    "read": {"audio": "lessons/m1_l10/formats/verbatim_p1.mp3", "seconds": 146.0, "words": [[0.0, "Why"], [0.125, "a"]]},
    "watch": {"video": "lessons/m1_l10/formats/video_p1.mp4", "poster": "lessons/m1_l10/formats/video_p1.jpg", "seconds": 63.2, "captions": "WEBVTT\n..."}
  }]
}
```

- **Media fields:** R2 keys, resolved by `mediaUrl()` onto `media.gwth.ai`.
- **Word timings and captions:** kept inside the content. The site serves them from its own origin at `/api/lesson-parts/<id>/{words,captions}/<part>`, because the media CDN sends no CORS header.
- **Spread the right answers across positions.** The Lesson 10 pilot has every answer in position B.

## Importing

```bash
# the Lesson 10 prototype layout (GWTH-launch-plan/completion/lesson-formats)
DATABASE_URL=... npx tsx scripts/import-lesson-parts.ts --lesson m1_l10 \
  --prototype /home/david/projects/GWTH-launch-plan/completion/lesson-formats
# a file already in the shape above
DATABASE_URL=... npx tsx scripts/import-lesson-parts.ts --lesson m1_l10 --site parts.site.json
```

The importer validates the file before writing anything. The media files go to R2 under the same keys; the pipeline's R2 uploader already does this for other media. The pipeline's publish-tree contract (`1_gwthpipeline520/docs/lesson-parts-contract.md`, bead gwth-launch-t97p) is not written yet. When it is, add it as a third input here.

## Checking it

- **Unit tests:** `npx vitest run src/lib/lessons src/components/lesson-parts`.
- **Database test:** `src/lib/data/lesson-parts.db.test.ts`. It needs `DATABASE_URL`.
- **Browser test**, at 1440 and 390, light and dark, with an axe scan at each screen:

  ```bash
  PLAYWRIGHT_BASE_URL=https://hlab.taila51191.ts.net:9458 DATABASE_URL=postgresql://gwth:devpass@127.0.0.1:5443/gwth_v2 \
    npx playwright test lesson-parts --project desktop-chromium
  ```

  It signs in as `lesson-parts-check@example.com`, a learner with Month 1 access and no organisation, and resets that learner first.
- **Screenshots:** `node deploy/shot-lesson-parts.mjs <outDir> [baseUrl]`.
