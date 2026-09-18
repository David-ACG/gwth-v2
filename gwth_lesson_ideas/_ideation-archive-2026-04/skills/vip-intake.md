---
name: vip-intake
description: Turn a curated article / URL / PDF / YouTube video into a GWTH kanban idea file with fact-check + corpus cross-check + placement proposals.
---

# /vip-intake — runbook

You are running a **VIP asset intake** for the GWTH curriculum. Given an input (URL, local PDF path, or YouTube URL), your output is a single markdown file at `kanban/0_idea/IDEA_<date>_vip-<slug>.md` following the template at `kanban/templates/VIP_IDEA_TEMPLATE.md`.

**Do not edit lesson-ideas / research files in this skill.** That's for `/plan` + `/build` after David reviews your idea file.

**You are the main Claude Code agent.** You have WebSearch, WebFetch, Read, Grep, Glob, Write, Bash, Edit. Don't spawn subagents — main-session tools are exactly what this skill needs.

## Input
The user invokes `/vip-intake <input>`. `<input>` is one of:
- an HTTP(S) URL (article, blog, LinkedIn, Substack)
- a local file path (PDF already downloaded)
- a YouTube URL (watch link or youtu.be)

## Runbook

### Step 1 — Classify
Decide: URL / PDF / YouTube. Pick `target_months` (ask yourself which of M1 / M2 / M3 this asset is relevant to based on its content; it's fine to pick multiple). Pick `category` (matches a subfolder name under `C:/Projects/1_gwthpipeline520/data/PDFs_manual_download/GWTH_Month_<X>/`, e.g. `FT_Focaldata`, `UK_Creators`, `Mollick`, `Karpathy`, `Anthropic`, `OpenAI`; check with `ls` if unsure).

### Step 2 — Fetch
- **URL:** use `WebFetch` with a prompt like "extract full article text, title, author, publication date, publisher".
- **PDF:** `Read` the file. (Paths with spaces need quoting.)
- **YouTube:** run via Bash:
  ```bash
  python -c "from youtube_transcript_api import YouTubeTranscriptApi; print(YouTubeTranscriptApi.get_transcript('<VIDEO_ID>', languages=['en']))" 2>&1 | head -500
  ```
  If this fails (no captions), surface the error in the idea file's Open Questions section — don't silently fall back to Whisper in this skill (Whisper is slow and noisy).

### Step 3 — Save into pipeline data folder
Build a slug from the title (lowercased, dashes for spaces, max 60 chars). Save the raw asset to:
```
C:/Projects/1_gwthpipeline520/data/PDFs_manual_download/GWTH_Month_<X>/<category>/<slug>-<YYYY-MM-DD>.<ext>
```
For URLs, save the extracted HTML or markdown. For PDFs, copy (don't move) the source file.
Also write a sibling `<slug>-<YYYY-MM-DD>.meta.md` with publisher, URL, date, headline findings placeholder (use the FT/BBC `.meta.md` files in that tree as shape reference).

The pipeline's folder scanner will ingest these to Qdrant on its next pass — no action needed from you.

### Step 4 — Fact-check
Pick the 3–5 **load-bearing** claims in the asset (the ones GWTH will quote or cite as evidence). For each:
- Run `WebSearch` with a query designed to find corroboration or contradiction.
- Mark verdict:
  - `verified` — 2+ independent credible sources corroborate. Record the URLs.
  - `contested` — credible sources contradict. Record both sides.
  - `uncertain` — couldn't establish (default when in doubt; it's honest).
- Do NOT mark `verified` just because no contradiction was found. Require positive corroboration.
- **Attribution — prefer a named individual over an institution.** For each load-bearing claim, try to identify the actual person who authored, presented, or officially endorsed it: the report's named author(s), the executive quoted in the press release, the analyst on the conference call, the LinkedIn post that broke the finding. Read the source piece and the org's newsroom/blog/about page; check LinkedIn if necessary. Record the attribution as `Named Person, Role, Org (via publisher URL)` — e.g. *"Vivek Pandya, Director, Adobe Digital Insights (via TechCrunch)"* — not just *"Adobe"*. Institutional attribution (`Adobe Analytics`, `McKinsey`) is acceptable as a **fallback** only when (a) the claim is a measured dataset with no human spokesperson, or (b) multiple attempts found no named individual. When you fall back, flag it in the idea file's **Open questions** so David can decide whether to dig further before a lesson relies on the claim.

### Step 5 — Corpus cross-check

**Qdrant (preferred):**
```bash
# Check Qdrant is up:
curl -sf http://localhost:6333/ -o /dev/null && echo "qdrant up" || echo "qdrant down"
# List collections:
curl -s http://localhost:6333/collections | python -c "import sys,json; d=json.load(sys.stdin); print([c['name'] for c in d.get('result',{}).get('collections',[])])"
# Scroll/search (adapt collection name; typically gwth_month_1 / gwth_month_2 / gwth_month_3):
curl -s -X POST http://localhost:6333/collections/gwth_month_1/points/scroll \
  -H 'Content-Type: application/json' \
  -d '{"limit": 10, "filter": {"must": [{"key": "speaker", "match": {"value": "Sunak"}}]}, "with_payload": true}'
```
If embeddings are needed for semantic search, see if the pipeline exposes an embed endpoint; otherwise keyword-filter scroll is fine for cross-check purposes.

If Qdrant is down or the collection doesn't exist, record "Qdrant unreachable — falling back to file scan" and continue.

**File scan (always run, even if Qdrant works):**
```bash
# From C:/Projects/GWTH_curriculum:
grep -rn "<speaker name>" gwth_lesson_ideas/
grep -rn "<key phrase or quote fragment>" gwth_lesson_ideas/
grep -rn "<publisher>" gwth_lesson_ideas/
```
Catches duplicate quotes and past citations of the same source.

### Step 6 — Read target lesson-ideas + research
For each month in `target_months`:
- `Read` `gwth_lesson_ideas/MONTH_<X>_LESSON_IDEAS_*.md` (the most recent dated file).
- `Glob` `gwth_lesson_ideas/month-<X>-research/*.md` and `Read` 2–3 files most relevant to the asset's topic (by filename or grepped keywords).

Build a mental map of where the asset's findings could land — which journeys, which lessons, which research files.

### Step 7 — Draft placement proposals
For each finding / quote in the asset, pick one primary placement with:
- exact target file
- line range or section heading anchor
- a 1–2 sentence draft of the insertion
- a rationale sentence

If a finding belongs in both a lesson-idea AND a research folder, note both (research folders hold the fuller version; lesson-ideas get the summary).

Never propose >1 placement per finding unless the finding splits naturally into two distinct uses.

### Step 8 — Write the idea file
Render `kanban/templates/VIP_IDEA_TEMPLATE.md` with everything collected. Fill in:
- YAML frontmatter (asset_type, source_url, publisher, dates, target_months, category, pipeline_files, qdrant_ingested, token counts if you can estimate them)
- Summary (3–5 neutral bullets)
- Fact-check table (rows = claims; one row per load-bearing claim)
- Corpus cross-check section (bullet list of Qdrant hits + grep hits with duplicate/contradiction/complementary flags)
- Placement proposals per month (use the structure in the template)
- Quotable lines table
- Open questions
- Source URL

`Write` to `kanban/0_idea/IDEA_<YYYY-MM-DD>_vip-<slug>.md`.

Also append a single line to `kanban/vip-assets-index.json`:
```json
{"date": "YYYY-MM-DD", "slug": "<slug>", "source_url": "<URL>", "target_months": [1,3], "category": "<cat>", "idea_file": "kanban/0_idea/IDEA_YYYY-MM-DD_vip-<slug>.md", "token_count_input": <N>, "token_count_output": <N>}
```

### Step 9 — Report back

Tell David:
- Idea file path (clickable `file://` link)
- One-line summary of what was found
- Any open questions he should resolve before `/plan`
- Token/cost estimate if meaningful

That's it. David takes over from there.

## Guardrails

- **Never edit lesson-ideas or research files in this skill.** Proposals only.
- **Always cite sources for verified claims.** Don't mark verified without URLs.
- **Never paraphrase a quote — use verbatim.** If you can't get verbatim, flag in Open Questions.
- **Prefer named-individual attribution over institutional attribution.** "Vivek Pandya, Adobe Digital Insights" beats "Adobe". "Michael Chui, McKinsey Global Institute" beats "McKinsey". The **Quotable lines** table's *Speaker + role* column must default to a named person — institutional names ("Adobe Analytics") are a fallback only when the figure is a pure measured dataset and no human source stated it publicly. If you can't find the individual after a real attempt (source article + org newsroom/blog + LinkedIn), flag it in **Open questions** — don't silently settle for the institution.
- **If Qdrant is down, continue anyway** — record the degradation in the idea file's metadata.
- **Respect the pipeline data layout.** Save into the correct `GWTH_Month_<X>/<category>/` folder so the scanner ingests correctly.
- **UK-first framing matches the curriculum voice** — prefer UK sources and examples unless the asset is inherently global.

## Example invocation

```
/vip-intake https://www.ft.com/content/high-earners-race-ahead-ai
```

Expected behaviour: Claude classifies as URL, fetches article, saves to `GWTH_Month_1/FT_Focaldata/<slug>.html` + meta, fact-checks 3–5 claims about the AI income divide, queries Qdrant for existing FT / Acemoglu / Focaldata content, reads M1 + M3 lesson-ideas + matching research files, drafts ~8 placement proposals, writes `kanban/0_idea/IDEA_2026-04-23_vip-ft-focaldata-ai-divide.md`, reports path back.
