# Kanban Runner — Curriculum Edition

Autonomous prompt loop that takes curriculum ideas from rough-thought to integrated-in-lesson-ideas, with structured review gates at every stage.

## Project Configuration

- **Project:** GWTH_curriculum (Curriculum Content)
- **Test Command:** none (markdown only)
- **Deploy Target:** none — content is consumed by GWTH_V2 at build time
- **Verification Method:** David reads the diff and the prose. No Playwright, no P520, no Hetzner.
- **Beads Integration:** Yes (curriculum-scoped, separate from engineering beads)
- **Linear Integration:** Optional

## Workflow

```
0_idea/   ──Claude──>  1_planning/   ──run-kanban.sh──>  2_testing/  ──David──>  3_done/
(rough      (craft       (plan + prompt    apply edits to    (review edits  promote after      (archived
 notes or    plan &       with review       MD files, no     in MDs)        approval           with date)
 VIP idea    prompts)     checklists)       code)
 file)

  Gate 1: Plan Review          Gate 2: Prompt Review     Gate 3: Edit Verify    Gate 4: Handoff
  (checklist appended          (checklist appended        (impl notes             (testing checklist
   to PLAN file)                to PROMPT file)            appended: "edits       appended, move
                                                           applied, prose          to 2_testing/)
                                                           reads cleanly")
```

## File Naming Convention (Mandatory)

All kanban files MUST use: `PREFIX_YYYY-MM-DD_short-slug.md`

- Ideas: `IDEA_YYYY-MM-DD_slug.md`
- VIP-generated ideas: `IDEA_YYYY-MM-DD_vip-slug.md`
- Plans: `PLAN_YYYY-MM-DD_slug.md`
- Prompts: `PROMPT_YYYY-MM-DD_slug.md`
- Research: `RESEARCH_YYYY-MM-DD_slug.md`
- Drift reports: `reports/DRIFT_YYYY-MM-DD.md`

## Quality Gates

### Gate 1 — Plan Review
After writing PLAN file, APPEND:
```
---
## Review Checklist — YYYY-MM-DD HH:MM
- [ ] Scope bounded (right lessons / journeys / research files targeted)
- [ ] Surgical edits (no unnecessary rewriting of surrounding content)
- [ ] Voice matches existing curriculum (UK framing, concrete sources, consistent motifs)
- [ ] Cited sources are load-bearing and named
- [ ] No new "facts" without source

**Review this plan:** `file:///C:/Projects/GWTH_curriculum/kanban/1_planning/PLAN_YYYY-MM-DD_slug.md`
```

### Gate 2 — Prompt Review
After writing PROMPT file, APPEND:
```
---
## Review Checklist — YYYY-MM-DD HH:MM
- [ ] Instructions self-contained (no assumed context)
- [ ] Target files + line ranges correct
- [ ] Quotes verbatim (never paraphrased into the prompt)
- [ ] Acceptance criteria match the plan

**Review this prompt:** `file:///C:/Projects/GWTH_curriculum/kanban/1_planning/PROMPT_YYYY-MM-DD_slug.md`
```

### Gate 3 — Edit Verify (after applying edits)
APPEND to prompt:
```
---
## Implementation Notes — YYYY-MM-DD HH:MM
- **Commit:** <hash + message>
- **Files edited:** <list>
- **Insertions per file:** <N lines added, M lines changed>
- **Prose read:** <did it read cleanly? where was the edit rough?>
- **Voice check:** <does the edit match surrounding voice? any jarring shifts?>
- **Deviations from plan:** <any differences>
- **Follow-ups filed:** <new ideas / beads raised during editing>
```

### Gate 4 — Testing Handoff
APPEND to prompt:
```
---
## Review Checklist — YYYY-MM-DD HH:MM
**Read the edits:** <list of target files + anchors>
- [ ] New insertion reads cleanly in place
- [ ] Source is correctly cited
- [ ] No unintended changes to surrounding content
- [ ] Voice matches curriculum style

### Actions for David
<Explicit list — "read the diff for L22 and L15", "confirm the Sunak quote isn't already used elsewhere", etc.>

**Review this file:** `file:///C:/Projects/GWTH_curriculum/kanban/2_testing/PROMPT_YYYY-MM-DD_slug.md`
```
Then MOVE the prompt file to `kanban/2_testing/`.

## File Lifecycle

- Ideas: `0_idea/` → (after plan written) `3_done/` with `IDEA_` prefix (never deleted)
- Plans: `1_planning/` → (after prompts written) `3_done/`
- Prompts: `1_planning/` → `2_testing/` → `3_done/`
- All gate sections APPENDED — never overwrite existing content.

## VIP Intake Integration

When `/vip-intake` runs, it writes an `IDEA_<date>_vip-<slug>.md` into `0_idea/` with:
- Summary of the asset
- Fact-check table (verified / contested / uncertain)
- Corpus cross-check (Qdrant + lesson-ideas scan)
- Placement proposals with file:line refs
- Open questions

David reviews that file, then runs `/plan <idea-file>` to move it into `1_planning/`. Standard flow from there.

See `docs/VIP_ASSET_CONTRACT.md` for diagnosis tips.
