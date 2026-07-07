# Completion: W16 — Lesson images student-visible (CDN refs in learnContent + renderer resolve)

**Date:** 2026-07-07 · **Repos:** GWTH_V2 (renderer) + 1_gwthpipeline520 (assembler)
**Commits:** GWTH_V2 `24cf5bb` (renderer, ancestor of master `c5a0e47`) · pipeline `972fec67` (assembler, ancestor of master `74233849`)
**Test URL:** http://hlab.taila51191.ts.net:3001/course/applied-ai-skills/lesson/welcome-to-gwth-six-ways-ai-can-give-you-superpowers
**Status:** partial — **staging VERIFIED; production PREPARED and HELD for David** (prod DB write + prod deploy are David-gated, NOT executed here).

## What changed (the three legs)
- **Pipeline assembler** (`app/services/lesson_assembler.py`, `972fec67`): `_transform_learn_images()` rewrites authored `assets/...` figure refs to bare R2 keys `lessons/<id>/assets/...` when the file exists, and for image-less lessons injects the curated flat `images/` files one per `##` section (skips Further Reading / quiz, fence-aware, alt = heading). Authored images always win; the two styles never mix. `R2Uploader` also publishes `content/assets/**`.
- **Renderer** (`src/lib/media/url.ts` `markdownImageUrl()` + `src/components/shared/markdown-renderer.tsx` `GracefulImage`, `24cf5bb`): bare `lessons/...` keys resolve onto `https://media.gwth.ai` via `NEXT_PUBLIC_MEDIA_CDN_BASE_URL`; any other relative ref returns `null` so it is hidden rather than shown as a broken icon.
- **Content refresh**: applied to the staging DB as a **slug-matched `learn_content`-only** UPDATE (26/26 live Month-1 rows). IDs deliberately untouched (the live DB predates the syllabus renumbering).

## UI — staging, logged-in lesson pages (cutout register, FDE page-flip viewer)

Authored figures (m1 lesson 1, `welcome-to-gwth-...`, 17 figures):

![l01 authored figures — desktop](W16/l01-authored-figures-desktop.png)
![l01 authored figures — mobile](W16/l01-authored-figures-mobile.png)

Section-injected figures (image-less lesson `research-superpower-...`, 7 figures placed under `##` headings):

![research injected sections — desktop](W16/research-injected-sections-desktop.png)
![research injected sections — mobile](W16/research-injected-sections-mobile.png)

The lesson viewer renders single-theme (FDE cream/paper register, `OutlineRail` is `lg:`-only), so light is the only theme; both widths shown. Images are the cutout register (overhead flat-lay, paper-craft cut-out stickers, cream label cards, black-ink doodles, plaster ground) per bible `cutout-image-register`.

Test it live (Tailscale):
- Authored: http://hlab.taila51191.ts.net:3001/course/applied-ai-skills/lesson/welcome-to-gwth-six-ways-ai-can-give-you-superpowers
- Injected: http://hlab.taila51191.ts.net:3001/course/applied-ai-skills/lesson/research-superpower-find-compare-and-verify-anything

## Backend / data — resolve + refresh path

```mermaid
flowchart LR
  A["lesson.md authored fig<br/>assets/generated/foo.png"] -->|assembler 972fec67<br/>rewrite if file exists| B["learn_content:<br/>lessons/m1_l01/assets/generated/foo.png"]
  A2["image-less lesson"] -->|inject flat images/<br/>one per ## heading| B
  B -->|slug-matched<br/>learn_content UPDATE| C[(staging DB<br/>26/26 rows)]
  C --> D["GWTH_V2 renderer 24cf5bb<br/>markdownImageUrl()"]
  D -->|NEXT_PUBLIC_MEDIA_CDN_BASE_URL| E["https://media.gwth.ai/lessons/..."]
  E --> F["GracefulImage renders<br/>0 broken icons"]
```

Why it is safe: the content update is `learn_content`-only and matched **by slug** (never by id, never `publish_lessons --month 1`), so it cannot scramble the live DB's pre-dedup id/slug ordering. R2 objects already exist (all keys HEAD 200); no media is created or deleted by this task.

## PROD — PREPARED, **DAVID RUNS THIS** (not executed by the agent)

**(1) Content refresh SQL** — slug-matched, `learn_content`-only, transactional with pre/post checks. File committed at [`completion/W16/W16_PROD_learn_content_by_slug.sql`](W16/W16_PROD_learn_content_by_slug.sql) (26 UPDATEs; dry-run-validated against staging inside a rolled-back transaction: 26 slugs matched, 26 rows updated, 26/26 with image refs, ROLLBACK). Run against the **production** DB (connection string in `deploy/secrets.production.env`):

```bash
# DAVID RUNS THIS — not executed by the agent
psql "$PROD_DATABASE_URL" -v ON_ERROR_STOP=1 \
  -f /home/david/projects/GWTH_V2/completion/W16/W16_PROD_learn_content_by_slug.sql
# Review the two printed counts: prod_rows_matching_target_slugs = 26 and
# with_image_refs = 26 → COMMIT (the file's trailing COMMIT). Else ROLLBACK.
```

**(2) Prod site deploy** — GWTH_V2 master (`c5a0e47`, ≥ `24cf5bb`) to gwth.ai via Hetzner Coolify. Ensure the **build-time** env var is set on the app first, then redeploy:

```
# DAVID RUNS THIS — not executed by the agent
# Coolify UI: http://195.201.177.66:8000  (login david@agilecommercegroup.com)
#   → My first project → production → GWTH v2 (app UUID tw0cc8oc0w4scwoccs0cw0go)
#   → Environment Variables: set (Build-time)  NEXT_PUBLIC_MEDIA_CDN_BASE_URL=https://media.gwth.ai
#   → Redeploy  (or use the Coolify web terminal → localhost → coolify):
php artisan tinker --execute="
use App\Models\Application;
use App\Models\ApplicationDeploymentQueue;
\$app = Application::where('uuid', 'tw0cc8oc0w4scwoccs0cw0go')->first();
\$server = \$app->destination->server;
\$queue = ApplicationDeploymentQueue::create([
    'application_id' => \$app->id,
    'deployment_uuid' => Illuminate\Support\Str::uuid()->toString(),
    'force_rebuild' => true,
    'commit' => 'HEAD',
    'status' => 'queued',
    'is_webhook' => false,
    'server_id' => \$server->id,
]);
dispatch(new App\Jobs\ApplicationDeploymentJob(\$queue->id));
echo 'Deploy queued! Queue ID: ' . \$queue->id;
"
```

`force_rebuild: true` so the new build-time `NEXT_PUBLIC_MEDIA_CDN_BASE_URL` is baked in (Next inlines `NEXT_PUBLIC_*` at build).

## What David should verify
- [ ] Run the two prod steps above (SQL first, then deploy). Confirm prod SQL prints `26` / `26`.
- [ ] On https://gwth.ai open the two lessons above logged-in: figures render, **zero broken-image icons**, images are the cutout register.
- [ ] Spot-check one more injected lesson (e.g. `data-superpower-turn-messy-information-into-answers`) shows a figure under each `##` section.

## Verification run (staging, 2026-07-07)
```
# Renderer + assembler present on master
GWTH_V2:  24cf5bb is ancestor of HEAD (c5a0e47)      → YES
pipeline: 972fec67 is ancestor of HEAD (74233849)    → YES

# Staging DB image coverage (Coolify PG, coolify net)
lessons with lessons/ key: 26 / 26 total

# CDN HEAD check — every referenced key
190 unique keys extracted from learn_content; checked=190 ok=190 non200=0

# Playwright staging (http://hlab.taila51191.ts.net:3001, tester w13-fresh@gwth.ai)
[desktop] l01-authored-figures:      17 figures, loaded, 0 broken, 0 CDN 4xx/5xx, 0 non-CDN  PASS
[desktop] research-injected-sections: 7 figures, loaded, 0 broken, 0 CDN 4xx/5xx, 0 non-CDN  PASS
[mobile]  research-injected-sections: 7 figures, loaded, 0 broken, 0 CDN 4xx/5xx, 0 non-CDN  PASS
[mobile]  l01-authored-figures:       loaded=3 broken=0 (via in-DOM outline; rail is lg-only) PASS

# Prod SQL dry-run against staging (BEGIN … ROLLBACK)
prod_rows_matching_target_slugs = 26 ; with_image_refs = 26 ; 26× "UPDATE 1" ; ROLLBACK
```
