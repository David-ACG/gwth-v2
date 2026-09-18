# VIP Asset Contract — how the `/vip-intake` skill works

## What the skill does

Given `<URL or file path>` as input, `/vip-intake` (defined in `.claude/skills/vip-intake.md`) produces an idea file in `kanban/0_idea/IDEA_<date>_vip-<slug>.md` following the template in `kanban/templates/VIP_IDEA_TEMPLATE.md`.

The skill runs **in the main Claude Code session** (not a subagent). This is deliberate — the main session has `WebSearch`, `WebFetch`, `Read`, `Grep`, `Glob`, `Write`, `Bash` and whatever Opus model you're running on. That's the complete toolset the skill needs. No subagent gymnastics, no risk of the prior "subagent has no web tools" failure mode.

## Inputs accepted

- **URL** — article, blog post, LinkedIn post, Substack, etc. Fetched via `WebFetch`.
- **Local PDF** — already-downloaded PDF. Saved path referenced directly.
- **YouTube URL** — transcript fetched via `youtube-transcript-api` (Python library, called via Bash). Falls back to Whisper only if no captions.

## Skill's 8-step runbook

1. **Classify input** — URL / PDF / YouTube.
2. **Fetch the asset** — WebFetch for URLs, read from disk for PDFs, Python subprocess for YouTube transcripts.
3. **Save into pipeline's data folder** — `C:/Projects/1_gwthpipeline520/data/PDFs_manual_download/GWTH_Month_<X>/<category>/<slug>.{pdf,html,md}` plus a `<slug>.meta.md` sibling. The pipeline's existing folder scanner will ingest these to Qdrant on its next pass (no new plumbing).
4. **Fact-check** — pick 3–5 load-bearing claims. For each, run `WebSearch` for corroboration. Mark `verified / contested / uncertain`. Record supporting URLs.
5. **Corpus cross-check** — two sub-steps:
   - **Qdrant query**: `Bash` → `curl -s http://localhost:6333/collections/<collection>/points/search -d '{"vector": [...], "limit": 10}'` OR use the simpler keyword-filter endpoint if embedding isn't available. (See `skills/vip-intake.md` for the exact curl invocation.) If Qdrant is unreachable, record "Qdrant unreachable — corpus cross-check via file scan only" and continue.
   - **File scan**: `Grep` across `gwth_lesson_ideas/` for the speaker's name, key phrases, and publisher — catches duplicate quotes and contradictions the embedding might miss.
6. **Read target lesson-ideas + research** — for each month in `target_months`, `Read` the corresponding `MONTH_<X>_LESSON_IDEAS_*.md` and scan `month-<X>-research/*.md` for relevant files. Build a list of candidate placement points.
7. **Draft placement proposals** — for each finding / quote, pick the best placement with file:line refs. Never propose >1 placement per finding unless the finding splits naturally.
8. **Write idea file** — render the template with all collected data. `Write` to `kanban/0_idea/IDEA_<date>_vip-<slug>.md`. Report the path to David.

## What the skill does NOT do

- Does **not** edit lesson-ideas or research files. That's `/plan` + `/build`'s job after David reviews the idea file.
- Does **not** ingest to Qdrant itself — just drops into the folder the scanner watches.
- Does **not** spawn subagents. Main-session only.
- Does **not** use external notification services (no Telegram). The user ran the skill; they see the output.

## Diagnosis — when it goes wrong

| Symptom | Likely cause | Fix |
|---|---|---|
| Skill writes an idea file with empty fact-check table | WebSearch rate-limited or quota exhausted | Retry, or skip fact-check for that run and mark claims `uncertain` |
| Qdrant query returns no results | Qdrant not running, or collection doesn't exist yet | Check `docker ps` on the pipeline box; verify collection name in `skills/vip-intake.md` |
| YouTube transcript fetch fails | Video is private / region-locked / has no captions | Fall back to Whisper (slower) or surface "transcript unavailable — skipping" |
| Idea file has no placement proposals | Asset's topic isn't covered in lesson-ideas at all | Legitimate outcome — skill surfaces open question "should a new lesson/journey be created?" |
| Claude says "tool WebSearch unavailable" | Running under a profile that stripped tools | Start a fresh session with full tools — do not continue |

## Updating the skill

Edit `.claude/skills/vip-intake.md` directly. It's a markdown file. Changes take effect in the next Claude Code session.

## When to bypass the skill

For urgent or trivial intakes (e.g. "just note this Mollick tweet in Journey 2"), skip the skill and do a direct edit. The skill exists for the full-research flow, not every minor nudge.
