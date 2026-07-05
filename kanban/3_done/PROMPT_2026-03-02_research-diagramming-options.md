# Task: Research Diagramming Options for Lesson Content

**Beads:** GWTH-3rawd4 | **Linear:** GWTH-12

## What to do

Research and evaluate diagramming tools/workflows for creating educational diagrams in GWTH lesson content. The goal is to find the best approach for producing ~500 diagrams (5 per lesson × 100 lessons) that:

- Have a consistent, hand-drawn/sketch aesthetic (like Excalidraw with max "sloppiness")
- Can be updated frequently (~50/month as lesson content evolves)
- Can be automated or semi-automated (ideally with Playwright or CLI scripting)
- Integrate into the existing content pipeline (write lessons → generate diagrams)

## Research scope

Investigate these categories of tools:

### 1. Excalidraw-based workflows

- Excalidraw CLI / API for programmatic diagram generation
- Claude Code skill for auto-generating Excalidraw diagrams (see: https://medium.com/@ooi_yee_fei/custom-claude-code-skill-auto-generating-updating-architecture-diagrams-with-excalidraw-431022f75a13)
- Storing `.excalidraw` JSON in the repo and rendering to SVG/PNG in the build pipeline

### 2. Mermaid + AI rendering (Nano Banana 2)

- Mermaid.js for diagram definitions (text-based, version-controllable)
- Google Nano Banana 2 for "pro-level" rendering of Mermaid diagrams (see: https://blog.google/innovation-and-ai/technology/ai/nano-banana-2/)
- Article reference: https://itnext.io/stop-using-ugly-charts-how-to-build-pro-level-diagrams-with-mermaid-js-and-nano-banana-2-f2c96d914350
- Mermaid Chart MCP tool (already available in this workspace)

### 3. AI image generation for diagrams

- Chinese cloud tools (e.g., Tongyi Wanxiang, Kling, others)
- Open-source models that run on RTX 3090 (Stable Diffusion, FLUX, etc.)
- Prompt-based diagram generation with consistent style control
- "Knolling" / flat-lay infographic style (see example prompts in the Linear issue)

### 4. Remotion-based approach

- Using Remotion (React video framework) to render diagrams as React components
- Advantages: full programmatic control, consistent styling via CSS, batch rendering
- Could double as animated diagram generation for video lessons

### 5. Hybrid approaches

- Mermaid for structure + AI for styling
- 2-3 different diagram styles for different content types (flowcharts, architecture, data flow)
- 2 workflows: quick/simple diagrams vs. rich/detailed diagrams

## Deliverables

1. **Research document** (`kanban/1_planning/PLAN_2026-03-02_diagramming-research.md`) containing:
   - Comparison table of tools: automation level, quality, cost, local vs cloud, style control
   - Pros/cons for each approach
   - Recommended 3 best options with rationale

2. **3 demo diagrams** of the "Unified Workflow" (kanban pipeline) using the top 3 recommended tools:
   - Save demos in `kanban/1_planning/diagrams/` as PNG/SVG
   - Include the source files (Mermaid code, Excalidraw JSON, prompts used)

3. **Workflow recommendation** — which tools to use and how to integrate into the pipeline:
   - How diagrams are authored (text DSL? drag-and-drop? AI prompt?)
   - How they're stored (repo? CDN? generated at build time?)
   - How they're updated when content changes
   - How batch updates work (50 diagrams/month)
   - Playwright automation feasibility for each approach

## Acceptance criteria

- [ ] Research document covers all 5 categories above with pros/cons
- [ ] Comparison table includes: tool name, automation level (manual/semi/full), cost, runs locally (RTX 3090), style consistency, output format
- [ ] 3 demo diagrams of the Unified Workflow produced and saved
- [ ] Clear recommendation for primary + secondary workflow
- [ ] Pipeline integration plan (how diagrams fit into lesson authoring → build → deploy)
- [ ] Cost estimate for 500 initial diagrams + 50/month ongoing

## Notes

- The Linear issue has attached example images showing preferred styles (flat-lay infographic, knolling layout, Excalidraw hand-drawn)
- David likes the hand-drawn aesthetic — avoid sterile/corporate diagram styles
- Scale matters: 500 diagrams initially, changing ~50/month. Manual tools are not viable long-term.
- RTX 3090 is available on the local workstation for running open-source models
- This is research only — no code changes to the GWTH app in this task

---

## Implementation Notes — 2026-03-03 17:08

- **Commit:** 7c831ea docs: add diagramming research for GWTH lesson content (GWTH-12)
- **Tests:** 14 files passed, 110 tests passed (no test changes — research only)
- **Verification URL:** http://192.168.178.50:3001 (P520 test)
- **Playwright check:** N/A — research task, no UI changes
- **Changes summary:**
  - Created comprehensive research document `PLAN_2026-03-02_diagramming-research.md` covering all 5 categories (Excalidraw, Mermaid+AI, AI image generation, Remotion, hybrid approaches)
  - Includes 10-tool comparison table with automation level, cost, local/cloud, style consistency, output format
  - Top 3 recommendations with rationale and workflows
  - Pipeline integration plan (authoring, storage, updates, batch rendering)
  - Cost estimates ($0/year with local tools, ~$21/year with cloud AI)
  - Created 4 demo source files in `kanban/1_planning/diagrams/`:
    - `unified-workflow-mermaid.mmd` — Mermaid DSL with hand-drawn look (rendered via MCP)
    - `unified-workflow-excalidraw.excalidraw` — Programmatic Excalidraw JSON (roughness=2, Virgil font)
    - `unified-workflow-remotion-spec.json` — Remotion-compatible data spec with animation config
    - `unified-workflow-ai-prompt.md` — Flat-lay knolling prompt for AI image generation
- **Deviations from plan:** Demo diagrams saved as source files rather than rendered PNG/SVG, because rendering tools (excalidraw-to-svg, mmdc CLI) are not installed in this environment. The Mermaid diagram was rendered via the MCP tool (screenshot available in the conversation). The Excalidraw JSON can be opened at excalidraw.com to view/export.
- **Follow-up issues:**
  - Install `@mermaid-js/mermaid-cli` and `excalidraw-to-svg` for batch rendering
  - Train FLUX.2 LoRA on 25 curated reference images for knolling style
  - Build Remotion diagram component library (8-11 days, Phase 2)
  - Create `npm run render:diagrams` script for CI/CD integration

---

## Testing Checklist — 2026-03-03 17:08

**Check the changes:** http://192.168.178.50:3001

- [ ] Page loads without errors
- [ ] Research document is complete and readable at `kanban/1_planning/PLAN_2026-03-02_diagramming-research.md`
- [ ] All 5 categories covered with pros/cons
- [ ] Comparison table has all required columns
- [ ] 3+ demo source files saved in `kanban/1_planning/diagrams/`
- [ ] Excalidraw JSON opens correctly at https://excalidraw.com (paste content)
- [ ] Mermaid source renders at https://mermaid.live (paste content)
- [ ] Recommendations are clear and actionable
- [ ] Cost estimates included

### Actions for David

1. **Review the research document:** `file:///C:/Projects/GWTH_V2/kanban/1_planning/PLAN_2026-03-02_diagramming-research.md`
2. **View the Mermaid demo:** Open `kanban/1_planning/diagrams/unified-workflow-mermaid.mmd` at https://mermaid.live to see the hand-drawn rendering
3. **View the Excalidraw demo:** Open https://excalidraw.com, then File > Open and select `kanban/1_planning/diagrams/unified-workflow-excalidraw.excalidraw`
4. **Decide on primary workflow:** The recommendation is Mermaid+Excalidraw for structural (80%) + FLUX.2/LoRA for conceptual (20%). Approve or suggest changes.
5. **Decide on Remotion:** Is the animated diagram capability (Phase 2) worth the 8-11 day development investment?

**Review this file:** `file:///C:/Projects/GWTH_V2/kanban/1_planning/PROMPT_2026-03-02_research-diagramming-options.md`
