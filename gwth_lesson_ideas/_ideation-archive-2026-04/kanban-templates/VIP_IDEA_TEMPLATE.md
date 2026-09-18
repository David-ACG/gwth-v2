---
asset_type: <pdf | url | youtube>
source_url: <URL>
publisher: <e.g. Financial Times, BBC News, Mollick Substack>
date_published: <YYYY-MM-DD>
date_curated: <YYYY-MM-DD>
target_months: [<1 | 2 | 3>]
category: <e.g. FT_Focaldata, UK_Creators, Mollick, Karpathy>
pipeline_files:
  - <path to raw asset in pipeline data/ folder>
  - <path to .meta.md sibling>
qdrant_ingested: <true | false | pending>
research_log: <path to any saved agent log, optional>
token_count_input: <N>
token_count_output: <N>
web_fetches_used: <N>
---

# VIP Asset — <Title>

## Summary

<3–5 bullets. Neutral summary of the asset. No editorial framing yet.>

## Fact-check

| # | Claim | Verdict | Supporting sources |
|---|-------|---------|--------------------|
| 1 | <load-bearing claim, quoted or precisely paraphrased> | verified / contested / uncertain | <2+ URLs for verified, both sides for contested, why-unresolved for uncertain> |
| 2 | ... | ... | ... |
| 3 | ... | ... | ... |

**Verdict rules:**
- `verified` = 2+ independent corroborating sources found via WebSearch
- `contested` = credible sources contradict the claim
- `uncertain` = couldn't be established either way (default if in doubt)

## Corpus cross-check

<What existing GWTH material covers this speaker / publisher / topic? Are there contradictions with prior citations? Are the quotes about to be proposed already used elsewhere in the curriculum? Lists Qdrant hits + lesson-ideas scan hits. If none, explicitly say "no prior GWTH material on this topic/speaker" — never leave empty.>

Example:
- **Duplicate risk:** Acemoglu "AI will increase inequality" already cited in `MONTH_3_LESSON_IDEAS_*.md:L412`. Don't re-use; this intake's *different* Acemoglu quote ("rhetoric out there is that the tools are democratising") is unused.
- **Contradiction risk:** Sunak's 2024 interview (cited in M1 L1) said AI would create jobs; this 2026 interview reverses. Flag for Journey 2 reframe.
- **Complementary:** CIPD Winter 2025/26 data (M1 Journey 1) matches FT/Focaldata 60/16 divide — stack these together.

## Placement proposals

### Month 1
- **Journey 1 (Redundancy)** — near `MONTH_1_LESSON_IDEAS_<date>.md:L<NN>-L<MM>` (section heading `<##>`). Suggested insertion: <1-2 sentence draft>. Rationale: <why this lands here>.
- **L22 (CV & LinkedIn)** — near `MONTH_1_LESSON_IDEAS_<date>.md:L<NN>`. Suggested quote: "<verbatim>" — <speaker>. Rationale: <why>.

### Month 2
- (if relevant)

### Month 3
- **L13 (Agentic Talent)** — near `MONTH_3_LESSON_IDEAS_<date>.md:L<NN>`. ...

### Research folders (deeper notes)
- `month-1-research/<NN>-topic.md` — add a new sub-section capturing the full finding + supporting data (richer than the lesson-ideas insertion).

## Quotable lines

| Quote (verbatim) | Speaker + role | Suggested placement |
|------------------|----------------|----------------------|
| "..." | <Name, role> | <M1 L22 / M3 L13 / etc.> |

## Open questions

- <anything the research agent couldn't decide — David resolves before `/plan`>
- e.g. "Unclear whether Sunak's 'abolish NI' is a Conservative Party position or his personal view. Worth verifying before building a lesson around it."

## Source URL

<Primary URL. If paywalled, note the archive/PDF fallback path.>

---

**Next step for David:**
1. Review this file (especially Fact-check + Corpus cross-check sections).
2. Edit placement proposals if you disagree.
3. Run `/plan <path-to-this-file>` in this repo to generate a surgical-edit plan.
4. Review the plan, then run `/build` to apply edits.
