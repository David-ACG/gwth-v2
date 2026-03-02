# GWTH Diagramming Research — Tool Evaluation & Workflow Recommendation

**Date:** 2026-03-02
**Beads:** GWTH-3rawd4 | **Linear:** GWTH-12
**Status:** Complete

---

## Executive Summary

This document evaluates 5 categories of diagramming tools for producing ~500 educational diagrams (5 per lesson x 100 lessons) with a consistent hand-drawn/sketch aesthetic. After extensive research, the **recommended primary workflow** is **Mermaid.js + Nano Banana 2** for structural diagrams, with **Remotion + Rough.js** as the secondary workflow for custom/interactive diagrams. An optional **Excalidraw** workflow serves as a manual fallback for complex one-off diagrams.

---

## Comparison Table

| Tool                               | Automation               | Quality                  | Cost (500 imgs) | Local (RTX 3090)   | Style Consistency             | Output Format       | Best For                       |
| ---------------------------------- | ------------------------ | ------------------------ | --------------- | ------------------ | ----------------------------- | ------------------- | ------------------------------ |
| **Mermaid.js (standard)**          | Full (CLI/MCP)           | Functional               | Free            | Yes                | High (deterministic)          | SVG, PNG, PDF       | Quick structural diagrams      |
| **Mermaid handDrawn**              | Full (CLI/MCP)           | Good sketch              | Free            | Yes                | High (deterministic + seed)   | SVG, PNG            | Sketch-style flowcharts        |
| **Mermaid + Nano Banana 2**        | Full (API)               | Presentation-grade       | ~$17-34         | No (cloud API)     | Medium-High (prompt template) | PNG (up to 4K)      | Polished educational diagrams  |
| **Excalidraw (programmatic)**      | Semi (JSON + CLI)        | Excellent hand-drawn     | Free            | Yes                | High (JSON template)          | SVG, PNG            | Detailed architecture diagrams |
| **Excalidraw (Claude Code skill)** | Semi (AI-generated JSON) | Excellent hand-drawn     | Free            | Yes                | High (skill refs)             | SVG, PNG            | AI-generated tech diagrams     |
| **Remotion + Rough.js**            | Full (Node.js batch)     | Excellent                | Free            | Yes                | Very High (React components)  | PNG, JPEG, SVG, MP4 | Interactive + static dual-use  |
| **PaperBanana (Google)**           | Full (API)               | Very High (diagrams)     | ~$25            | No (cloud API)     | High (multi-agent loop)       | PNG                 | Academic-style diagrams        |
| **Qwen-Image-2.0 (Alibaba)**       | Full (API)               | Very High (infographics) | ~$15            | No (cloud API)     | Medium (prompt-based)         | PNG                 | Infographic-style diagrams     |
| **FLUX.2 Dev (local)**             | Full (ComfyUI)           | Good                     | Free (compute)  | Yes (18-20GB VRAM) | Very High (LoRA)              | PNG                 | Stylized/artistic diagrams     |
| **SD 3.5 + ControlNet**            | Full (ComfyUI)           | Medium                   | Free (compute)  | Yes                | High (LoRA + structure)       | PNG                 | Structure-guided stylization   |
| **Seedream 5.0 Lite**              | Full (API)               | Good                     | ~$18            | No (cloud API)     | Medium                        | PNG                 | Reasoning-based diagrams       |
| **Imagen 4 (Google)**              | Full (API)               | Medium                   | ~$10-30         | No (cloud API)     | Low (no diagram logic)        | PNG                 | Simple illustrative images     |
| **Kling (Kuaishou)**               | Full (API)               | Medium                   | ~$70+           | No (cloud API)     | Medium                        | PNG                 | Not recommended (overpriced)   |

---

## Category 1: Excalidraw-Based Workflows

### Overview

Excalidraw produces the exact "hand-drawn whiteboard" aesthetic David wants (roughness=2, hachure fills, wobbly lines). It's the gold standard for sketch-style technical diagrams.

### Programmatic Generation

**JSON format:** Excalidraw uses a well-documented JSON format. Each element (rectangle, ellipse, arrow, text) carries its own style properties including `roughness` (0=clean, 1=artist, 2=cartoonist/max sloppiness), `fillStyle` (hachure, cross-hatch, zigzag, solid), and `strokeWidth`.

**Claude Code skill approach:** A proven pattern from the community (ooiyeefei/ccc) uses markdown reference files to teach Claude how to generate valid `.excalidraw` JSON. Claude reads the codebase, identifies components, and generates diagram JSON with correct arrow bindings, labels, and color palettes. Export uses `@excalidraw/utils` via Playwright.

### Rendering to SVG/PNG

| Tool                           | Browser?                 | Fidelity                 | Speed            |
| ------------------------------ | ------------------------ | ------------------------ | ---------------- |
| `excalirender` (JonRC)         | No (node-canvas)         | Good (re-implementation) | Fast             |
| `excalidraw-to-svg`            | No (Node.js)             | Good                     | Fast             |
| `excalidraw-brute-export-cli`  | Yes (Playwright+Firefox) | Perfect (real renderer)  | Slower           |
| `excalidraw-render` MCP server | Yes (headless Chromium)  | Perfect                  | ~60ms after init |

### Self-Hosted

Docker image: `excalidraw/excalidraw` — client-only, runs on port 5000. Can be automated with Playwright for batch operations.

### Pros

- Best hand-drawn aesthetic (roughness, hachure fills, organic lines)
- Free, open-source, no API costs
- JSON format is LLM-friendly — Claude generates valid diagrams
- Multiple rendering options (browser-based for fidelity, node-canvas for speed)
- `excalidraw-render` MCP server integrates directly with Claude Code (~60ms per render)

### Cons

- No single canonical CLI tool — fragmented ecosystem
- Browser-based rendering needed for pixel-perfect output
- JSON authoring is verbose compared to Mermaid's text DSL
- No built-in batch processing — requires custom scripting
- Claude Code skill requires setup (markdown reference files, Playwright MCP)

### Automation Feasibility

**Semi-automated.** Claude generates JSON, export requires Playwright or `excalirender`. Batch rendering of 500 diagrams is possible but requires custom scripting. Estimated ~15-30 minutes for 500 renders via `excalirender`.

### Cost

Free (all tools are open-source).

---

## Category 2: Mermaid + AI Rendering

### Mermaid.js

**23 diagram types** including flowcharts, sequence diagrams, state diagrams, ER diagrams, Gantt charts, architecture diagrams, Kanban boards, timelines, mindmaps, and more.

**CLI (`mmdc`):** Full command-line rendering to SVG, PNG, PDF. Supports custom themes (8 built-in), configuration files, custom CSS, transparent backgrounds, and Markdown processing (replaces code blocks with images).

**Hand-drawn look:** `look: handDrawn` config enables RoughJS rendering with wobbly lines and organic shapes. Currently limited to **flowcharts and state diagrams only** (expanding to all types). A `seed` option makes randomness deterministic for reproducible output.

**Mermaid Chart MCP:** Already installed in this workspace. The `validate_and_render_mermaid_diagram` tool renders diagrams directly and returns PNG images + live editor links. No authentication required for rendering.

### Google Nano Banana 2 (Gemini 3.1 Flash Image)

Released February 26, 2026. Google's best image generation model, combining pro-level fidelity with Flash-tier speed.

**Key capability for diagrams:** Excellent text rendering — legible labels, accurate positioning. Maintains subject consistency across multiple generations.

**Pricing:**

| Resolution  | Standard   | Batch (50% off) |
| ----------- | ---------- | --------------- |
| 512px       | $0.045/img | $0.022/img      |
| 1K (1024px) | $0.067/img | $0.034/img      |
| 2K (2048px) | $0.101/img | $0.050/img      |
| 4K (4096px) | $0.151/img | $0.076/img      |

**The Mermaid + NB2 Workflow (from Dmitry Kostyuk's article):**

1. **Structure with Mermaid** (deterministic, verifiable) — Generate Mermaid code, validate logic in live editor, iterate until correct
2. **Style with Nano Banana 2** (AI aesthetics) — Feed validated Mermaid diagram + style prompt to NB2 API
3. Recommended styles: Swiss Modernism, Neo-Memphis, Blueprint, Isometric 3D

**Why this works:** Mermaid forces strict logic definition, eliminating hallucination risk. NB2 handles only aesthetics, working from a verified structure.

### Google PaperBanana

An agentic framework for publication-ready scientific diagrams. Five specialized agents: Retriever, Planner, Stylist, Visualizer, Critic. The Critic agent identifies errors and triggers re-generation (3-round iterative refinement). Won 72.7% of head-to-head human preference tests.

**Cost:** ~$0.05/illustration via APIYI. Open-source on GitHub.

### Pros

- Mermaid is text-based — perfect for version control, LLM generation, batch processing
- Deterministic structure eliminates "hallucinated connections" problem
- NB2 produces presentation-grade output with accurate text
- Extremely cheap (~$17 for 500 images at 1K batch)
- Full API automation — no manual steps
- MCP tool already available in workspace for quick iterations
- PaperBanana adds structural understanding of diagram semantics

### Cons

- Mermaid handDrawn look limited to flowcharts/state diagrams (for now)
- NB2 requires Google Cloud API setup
- Two-step pipeline adds complexity (Mermaid → NB2)
- NB2 still doesn't understand graph topology — it stylizes, doesn't verify
- SynthID watermark on NB2 outputs (cannot be removed)

### Automation Feasibility

**Fully automatable.** Mermaid CLI + NB2 API = complete scripted pipeline. Batch mode available at 50% discount. For 500 diagrams: write Mermaid definitions → validate → send to NB2 API → download results. Estimated ~20 minutes total.

### Cost

| Scenario                               | Cost         |
| -------------------------------------- | ------------ |
| 500 diagrams, Mermaid only (free)      | $0           |
| 500 diagrams, Mermaid handDrawn (free) | $0           |
| 500 diagrams, Mermaid + NB2 1K (batch) | ~$17         |
| 500 diagrams, Mermaid + NB2 2K (batch) | ~$25         |
| 500 diagrams, PaperBanana              | ~$25         |
| 50/month ongoing (NB2 1K batch)        | ~$1.70/month |

---

## Category 3: AI Image Generation

### Google Ecosystem

**Imagen 4:** General-purpose image generator. Cheap ($0.02-0.06/image) but does NOT understand diagram semantics. Arrows and connections are unreliable for 5+ node diagrams.

**Nano Banana 2:** Best text rendering among general image models. Viable for diagrams with labels but still pattern-matches rather than understanding topology.

**PaperBanana:** The standout option — the only tool with structural understanding of diagrams. Multi-agent review loop catches errors. ~$25 for 500 diagrams.

### Chinese Cloud AI Tools

**Qwen-Image-2.0 (Alibaba):** Best for structured infographic generation. Supports ultra-long instructions up to 1,000 tokens — critical for detailed diagram specs. Native 2048x2048. Excellent bilingual text rendering. ~$0.03/image.

**Seedream 5.0 Lite (ByteDance):** Chain-of-thought reasoning for complex visual logic. Real-time web search integration. ~$0.035/image. Better for artistic generation than structured diagrams.

**Kling (Kuaishou):** Too expensive (~$0.14/unit), video-focused. Not recommended.

### Open-Source Models (RTX 3090)

**FLUX.2 Dev:** Best open-source option. Excellent text rendering. Fits in 18-20GB VRAM. ~12-15 seconds per image. LoRA fine-tuning provides style consistency (train on 20-30 reference images, 2-4 hours). ComfyUI enables CSV-driven batch automation.

**SD 3.5 + ControlNet:** The ControlNet approach is powerful — create wireframe diagrams, extract Canny edges, use AI for style only. Solves "hallucinated connections" problem. But text rendering is noticeably worse than FLUX.

### Quality Assessment (Honest Verdict)

**Text labels:** PaperBanana > Qwen-Image-2.0 > NB2 ≈ FLUX.2 > Imagen 4 > SD 3.5

**Arrows/flow indicators:** This is the **weakest area across ALL image generators.** Pure image generators don't understand graph topology.

- Simple 2-3 node diagrams: usually correct
- 5-10 nodes: frequent errors
- 10+ nodes: unreliable across all models

**Technical accuracy:** No image generator guarantees correctness. Only PaperBanana has structural understanding.

### Pros

- Can produce visually stunning, unique diagrams (flat-lay, knolling, isometric)
- Multiple price points from free (FLUX local) to cheap ($15-25 for 500)
- LoRA training enables rock-solid style consistency (FLUX)
- Chinese tools offer excellent value and quality

### Cons

- Text labels remain error-prone across all models
- No structural understanding of diagram semantics (except PaperBanana)
- Complex diagrams (10+ nodes) are unreliable
- Style consistency requires either LoRA training or careful prompt engineering
- Generated diagrams cannot be edited — must regenerate entirely

### Automation Feasibility

**Fully automatable** via APIs (cloud tools) or ComfyUI (local tools). All support batch processing.

### Cost

| Tool               | 500 Images          | 50/month Ongoing |
| ------------------ | ------------------- | ---------------- |
| FLUX.2 Dev (local) | Free (~2 hours GPU) | Free             |
| Qwen-Image-2.0     | $15                 | $1.50            |
| NB2 (1K, batch)    | $17                 | $1.70            |
| PaperBanana        | $25                 | $2.50            |
| Seedream 5.0       | $18                 | $1.75            |

---

## Category 4: Remotion + Rough.js

### Overview

Remotion is a React framework for rendering components to images/video. Combined with Rough.js (the same engine powering Excalidraw's hand-drawn look), it creates a fully programmatic diagram pipeline using React components.

### How It Works

1. **Define diagram as React component** with SVG elements
2. **Wrap in `<RoughSVG>`** from `react-rough-fiber` — automatically converts all SVG primitives to hand-drawn style
3. **Register as Remotion `<Still>` composition** — renders to PNG/JPEG/WebP
4. **Batch render** via Node.js API or CLI — pass different data to same template

```tsx
// Example: Diagram component with hand-drawn style
import { RoughSVG } from "react-rough-fiber";

const FlowchartDiagram = ({ nodes, connections }) => (
  <div style={{ width: 1920, height: 1080, background: "#F5F5F5" }}>
    <RoughSVG options={{ roughness: 1.2, bowing: 0.8, fillStyle: "hachure" }}>
      <svg viewBox="0 0 1920 1080">
        {connections.map((c) => (
          <ConnectionLine {...c} />
        ))}
        {nodes.map((n) => (
          <DiagramNode {...n} />
        ))}
      </svg>
    </RoughSVG>
  </div>
);
```

### Dual-Use Components

The strongest argument for Remotion: the **same React component** works in 3 contexts:

1. **Static PNG** via Remotion for offline content
2. **Interactive in browser** on lesson pages (hover, click, animate)
3. **Animated GIF/MP4** via Remotion for video lessons

This means designing a diagram once and using it everywhere.

### Shared Design System

Since Remotion compositions are React, they import GWTH's Tailwind tokens, OKLCH colors, Inter/JetBrains Mono fonts — guaranteed visual consistency with the website.

### Batch Rendering

```bash
# Single diagram
npx remotion still --props='{"diagramId":"arch-001"}' flowchart out/arch-001.png

# Batch via Node.js API
node render-all-diagrams.ts  # loops through JSON dataset
```

**Performance:** ~0.5-2 seconds per still. 500 diagrams in ~5-17 minutes. CPU-bound (RTX 3090 GPU not a factor for DOM rendering).

### Rough.js Style Options

| Property     | Description              | Recommended Value         |
| ------------ | ------------------------ | ------------------------- |
| roughness    | Line wobbliness (0-3+)   | 1.0-1.5 for educational   |
| bowing       | Line curvature           | 0.5-1.0                   |
| fillStyle    | Interior fill            | "hachure" (cross-hatched) |
| fillWeight   | Fill line thickness      | 1.5                       |
| hachureAngle | Fill line angle          | -41 (default)             |
| hachureGap   | Fill line spacing        | 4                         |
| seed         | Deterministic randomness | Fixed per diagram         |

### Licensing

Free for individuals and companies with 3 or fewer employees. Company license: $25/month per seat.

### Pros

- React-native: same language, tools, and design system as GWTH
- Dual-use: interactive in browser + static PNG + animated MP4
- Hand-drawn aesthetic via Rough.js (same engine as Excalidraw)
- Batch rendering is fast and fully scriptable
- Deterministic output (seed-based randomness)
- Free for small teams
- Diagram data is JSON — version-controllable, LLM-generatable
- 5-10 templates can generate hundreds of variations

### Cons

- Requires building diagram templates (5-10 needed, 2-3 days)
- Chromium dependency for rendering
- Sequential rendering recommended (one at a time)
- react-rough-fiber is a smaller community project
- The JSON data authoring for 500 diagrams is the real bottleneck, not rendering
- Adds ~4MB of dev dependencies

### Automation Feasibility

**Fully automatable.** Define diagram data as JSON, run batch render script. LLMs can generate the JSON data from lesson content. Estimated ~10-15 minutes for 500 renders.

### Cost

Free (Remotion is free for small teams, Rough.js is MIT licensed).

---

## Category 5: Hybrid Approaches

### Recommended Hybrid: 3 Styles, 2 Workflows

Based on the research, different diagram types need different tools:

| Diagram Type                | Example                    | Recommended Tool       | Style                     |
| --------------------------- | -------------------------- | ---------------------- | ------------------------- |
| Flowcharts, data flow       | API pipeline, kanban flow  | Mermaid + NB2          | Swiss Modern / Blueprint  |
| Architecture, system design | Service topology, infra    | Excalidraw or Remotion | Hand-drawn sketch         |
| Conceptual, educational     | "How X works", comparisons | Remotion + Rough.js    | Warm sketch + GWTH colors |
| Infographic, flat-lay       | Process overview, summary  | NB2 or Qwen-Image-2.0  | Flat-lay / knolling       |

### Workflow A: Quick/Simple (Mermaid Pipeline)

For most diagrams (~70% of the 500):

1. Write Mermaid code (or have Claude generate it from lesson content)
2. Validate with Mermaid MCP tool or CLI
3. Render with handDrawn look for sketch aesthetic
4. (Optional) Post-process through NB2 API for polish

**Cost:** Free (Mermaid only) or ~$0.034/image (with NB2 batch)
**Time:** ~30 seconds per diagram (generation + render)
**Automation:** Full — scriptable end to end

### Workflow B: Rich/Custom (Remotion Pipeline)

For complex, interactive, or animated diagrams (~30% of the 500):

1. Define diagram data as JSON (nodes, connections, labels)
2. Select from 5-10 pre-built React templates
3. Render via Remotion to PNG (static) and/or MP4 (animated)
4. Same component used interactively on the website

**Cost:** Free
**Time:** ~2 seconds per diagram (render only, excludes template design)
**Automation:** Full — JSON data can be LLM-generated from lesson content

### Workflow C: Manual Fallback (Excalidraw)

For one-off complex diagrams or diagrams that need precise manual adjustment:

1. Generate initial JSON via Claude Code skill
2. Open in Excalidraw for manual refinement
3. Export via excalirender or Playwright

**Cost:** Free
**Time:** 5-15 minutes per diagram (manual)
**Automation:** Semi — initial generation automated, refinement manual

---

## Demo Diagrams

Three demos of the "Unified Workflow" have been created:

### Demo 1: Mermaid Standard (LR flowchart)

**File:** `kanban/1_planning/diagrams/unified-workflow-mermaid.md`
**Style:** Clean, corporate, horizontal flow with subgraphs
**Rendering:** Via Mermaid Chart MCP tool (PNG)
**Verdict:** Functional but visually plain. Good for documentation, not for lesson content.

### Demo 2: Mermaid Hand-Drawn (TD flowchart)

**File:** `kanban/1_planning/diagrams/unified-workflow-mermaid-handdrawn.md`
**Style:** Sketch/hand-drawn via `look: handDrawn` + `theme: neutral`
**Rendering:** Via Mermaid Chart MCP tool (PNG)
**Verdict:** Subtle sketch aesthetic with wobbly lines. Better than standard but still "diagram-like." Would benefit from NB2 post-processing for lesson-quality output.

### Demo 3: Excalidraw JSON

**File:** `kanban/1_planning/diagrams/unified-workflow.excalidraw`
**Style:** Full hand-drawn with roughness=2, hachure fills, colored shapes (blue, green, orange, purple, pink)
**Rendering:** Open in excalidraw.com or render via excalirender/Playwright
**Verdict:** Best hand-drawn aesthetic. Colored shapes with hachure fills match David's preferred style. Requires browser or CLI tool to render to image.

---

## Recommended Strategy

### Primary Workflow: Mermaid + Nano Banana 2

**For ~70% of diagrams (350 of 500):** flowcharts, data flows, sequences, architecture overviews

1. **Author:** Write Mermaid code (text DSL) — store in repo alongside lesson content
2. **Store:** `.mmd` files in `content/diagrams/` directory, version-controlled in git
3. **Validate:** Run `mmdc` CLI or Mermaid MCP tool to verify structure
4. **Style:** Send validated Mermaid + style prompt to NB2 API
5. **Output:** PNG at 2K resolution, saved to `public/diagrams/`
6. **Update:** Edit the `.mmd` file, re-run pipeline — old image replaced automatically
7. **Batch:** Script processes all changed `.mmd` files, sends to NB2, saves output

**Why this wins:**

- Text-based authoring = fast, version-controllable, LLM-generatable
- Deterministic structure = no hallucinated connections
- NB2 styling = presentation-grade output
- Full automation = no manual steps
- Cheap = ~$17 for initial 500, ~$1.70/month ongoing

### Secondary Workflow: Remotion + Rough.js

**For ~30% of diagrams (150 of 500):** complex architecture, interactive diagrams, animated walkthroughs

1. **Author:** Define diagram data as JSON (nodes, edges, labels, positions)
2. **Store:** JSON data files in `content/diagrams/data/`, React templates in `src/diagrams/`
3. **Render:** Remotion batch script generates PNGs for all diagrams
4. **Interactive:** Same React components render in-browser with hover/click interactions
5. **Animated:** Remotion generates MP4/GIF variants for video lessons
6. **Update:** Edit JSON data, re-run render script
7. **Batch:** `npm run render:diagrams` processes all changed definitions

**Why this as secondary:**

- React-native = shared design system, dual-use (static + interactive)
- Rough.js = Excalidraw-quality hand-drawn aesthetic
- Free = no API costs
- But: requires building templates (2-3 day investment)
- And: JSON data authoring is more verbose than Mermaid text

### Manual Fallback: Excalidraw

**For special cases (<5%):** Complex diagrams needing precise layout, one-off illustrations

- Use Claude Code Excalidraw skill for initial generation
- Refine in excalidraw.com if needed
- Export via `excalirender` or Playwright

---

## Pipeline Integration Plan

### How Diagrams Fit Into Lesson Authoring

```
Lesson Content Written
        ↓
Claude analyzes lesson → generates Mermaid code for key concepts
        ↓
Mermaid validated (MCP or CLI)
        ↓
  ┌─────────────┬──────────────────┐
  │ Simple?     │ Complex/Interactive? │
  │ Mermaid+NB2 │ Remotion+Rough.js    │
  └──────┬──────┴──────────┬───────────┘
         ↓                 ↓
   NB2 API render    Remotion batch render
         ↓                 ↓
   public/diagrams/   public/diagrams/
         ↓                 ↓
   Referenced in lesson MDX content
         ↓
   Next.js build includes optimized images
```

### Storage Strategy

```
content/
├── diagrams/
│   ├── mermaid/           # .mmd source files (version-controlled)
│   │   ├── lesson-01/
│   │   │   ├── api-flow.mmd
│   │   │   ├── data-pipeline.mmd
│   │   │   └── ...
│   │   └── lesson-02/
│   ├── data/              # JSON definitions for Remotion diagrams
│   │   ├── lesson-01/
│   │   │   ├── architecture.json
│   │   │   └── ...
│   │   └── ...
│   └── excalidraw/        # .excalidraw files for manual diagrams
│       └── ...
public/
├── diagrams/              # Rendered output (PNG/SVG, gitignored)
│   ├── lesson-01/
│   │   ├── api-flow.png
│   │   ├── architecture.png
│   │   └── ...
│   └── ...
scripts/
├── render-diagrams.ts     # Batch render script
├── sync-mermaid-nb2.ts    # Mermaid → NB2 API pipeline
└── ...
```

### How Batch Updates Work (50 diagrams/month)

1. **Detect changes:** `git diff --name-only content/diagrams/` shows modified source files
2. **Re-render changed only:** Script processes only modified `.mmd` or `.json` files
3. **NB2 batch mode:** Changed Mermaid files sent to NB2 API in batch (50% discount)
4. **Remotion incremental:** Only re-render changed Remotion compositions
5. **Deploy:** New PNGs committed to `public/diagrams/`, deployed with next build

**Estimated time for 50 monthly updates:** ~5 minutes (automated script)
**Estimated cost for 50 monthly updates:** ~$1.70 (NB2 batch at 1K resolution)

### Playwright Automation Feasibility

| Approach          | Playwright Needed? | Notes                                         |
| ----------------- | ------------------ | --------------------------------------------- |
| Mermaid CLI       | No                 | CLI renders directly                          |
| Mermaid MCP       | No                 | MCP renders directly                          |
| NB2 API           | No                 | REST API, no browser                          |
| Remotion          | No                 | Node.js renderer (Chromium internal)          |
| Excalidraw render | Yes                | `excalidraw-brute-export-cli` uses Playwright |
| Excalidraw MCP    | Yes                | `excalidraw-render` uses headless Chromium    |

**Verdict:** Playwright is only needed for Excalidraw workflows. The primary (Mermaid+NB2) and secondary (Remotion) workflows are fully scriptable without Playwright.

---

## Cost Estimate

### Initial 500 Diagrams

| Item                      | Quantity     | Unit Cost            | Total    |
| ------------------------- | ------------ | -------------------- | -------- |
| Mermaid source authoring  | 350          | Free (LLM-generated) | $0       |
| NB2 rendering (1K, batch) | 350          | $0.034               | $11.90   |
| Remotion template design  | 10 templates | Free (labor)         | $0       |
| Remotion rendering        | 150          | Free (local compute) | $0       |
| Excalidraw one-offs       | ~25          | Free                 | $0       |
| **Total**                 | **500**      |                      | **~$12** |

### Monthly Ongoing (50 diagrams/month)

| Item                  | Quantity | Unit Cost | Total/month      |
| --------------------- | -------- | --------- | ---------------- |
| Mermaid updates + NB2 | ~35      | $0.034    | $1.19            |
| Remotion re-renders   | ~15      | Free      | $0               |
| **Total**             | **50**   |           | **~$1.20/month** |

### If Using 2K Resolution

| Scenario     | 500 Initial | 50/month |
| ------------ | ----------- | -------- |
| NB2 1K batch | $12         | $1.20    |
| NB2 2K batch | $18         | $1.75    |
| NB2 4K batch | $27         | $2.66    |

---

## Implementation Roadmap

### Phase 1: Quick Wins (Now)

- [x] Mermaid MCP tool already available — can generate diagrams immediately
- [ ] Set up Mermaid handDrawn rendering for sketch aesthetic
- [ ] Test NB2 API with a few Mermaid diagrams to validate quality

### Phase 2: Pipeline Setup (1-2 days)

- [ ] Create `content/diagrams/mermaid/` directory structure
- [ ] Write `scripts/sync-mermaid-nb2.ts` batch processing script
- [ ] Set up Google Cloud API key for NB2
- [ ] Define 3-4 style prompt templates (Swiss Modern, Blueprint, Educational Sketch)
- [ ] Generate first 10 production diagrams to validate quality

### Phase 3: Remotion Templates (2-3 days)

- [ ] Install Remotion + react-rough-fiber as dev dependencies
- [ ] Build 5-10 diagram templates (flowchart, architecture, data flow, timeline, comparison)
- [ ] Create `scripts/render-diagrams.ts` batch render script
- [ ] Test dual-use: same component renders in browser + Remotion

### Phase 4: Scale (Ongoing)

- [ ] Generate diagrams for all 100 lessons as content is written
- [ ] Monthly batch updates as lesson content evolves
- [ ] Refine style prompts and templates based on feedback

---

## Appendix: Diagram Style Prompts

### For Nano Banana 2 (educational diagrams)

**Swiss Modern:**

```
Transform this technical diagram into a clean Swiss Modernism style visualization.
Use a structured grid layout with clear hierarchy. Sans-serif typography.
Muted blue and teal color palette (#33BBFF, #1CBA93, #0F2624).
White background. Thin connecting lines with directional arrows.
Professional and authoritative. Educational context.
```

**Blueprint:**

```
Render this diagram as a technical blueprint. Dark navy background (#0F2624)
with white and cyan (#33BBFF) line work. Grid pattern overlay.
Monospace labels. Engineering/technical aesthetic. Clean arrows
and connection lines. Educational diagram for a software engineering course.
```

**Hand-Drawn Infographic:**

```
Create a hand-drawn style infographic explaining this concept.
Warm, approachable aesthetic. Sketchy lines and organic shapes.
Soft colors (aqua #33BBFF, mint #1CBA93, warm grey).
Simple icons and labels. Directional flow with hand-drawn arrows.
Top-down bird's eye view. Clean light background.
Educational and easy to understand.
```

### For FLUX.2 Dev LoRA (if using local generation)

**Training prompt template:**

```
educational diagram, hand-drawn sketch style, thick outlines,
hachure fill pattern, rounded corners, directional arrows,
labeled components, aqua and mint color scheme, white background,
clean layout, technical illustration, software engineering concept
```

---

## References

### Articles

- [Stop Using Ugly Charts — Mermaid + Nano Banana 2](https://itnext.io/stop-using-ugly-charts-how-to-build-pro-level-diagrams-with-mermaid-js-and-nano-banana-2-f2c96d914350)
- [Claude Code Excalidraw Skill](https://dev.to/yooi/custom-claude-code-skill-auto-generating-updating-architecture-diagrams-with-excalidraw-227k)
- [Google Nano Banana 2 Blog](https://blog.google/innovation-and-ai/technology/ai/nano-banana-2/)
- [PaperBanana — Automated Scientific Diagrams](https://www.marktechpost.com/2026/02/07/google-ai-introduces-paperbanana-an-agentic-framework-that-automates-publication-ready-methodology-diagrams-and-statistical-plots/)

### Tools

- [Mermaid.js](https://mermaid.js.org/) / [Mermaid CLI](https://github.com/mermaid-js/mermaid-cli) / [Mermaid Chart MCP](https://mermaid.ai/)
- [Excalidraw](https://excalidraw.com/) / [excalirender](https://github.com/JonRC/excalirender) / [excalidraw-render MCP](https://github.com/bassimeledath/excalidraw-render)
- [Remotion](https://www.remotion.dev/) / [Rough.js](https://roughjs.com/) / [react-rough-fiber](https://react-rough-fiber.amind.app/)
- [FLUX.2 Dev](https://bfl.ai/blog/flux-2) / [ComfyUI](https://github.com/comfyanonymous/ComfyUI)
- [Qwen-Image-2.0](https://www.alibabacloud.com/help/en/model-studio/models) / [Seedream 5.0](https://seed.bytedance.com/en/)

### Demo Files

- `kanban/1_planning/diagrams/unified-workflow-mermaid.md` — Mermaid standard demo
- `kanban/1_planning/diagrams/unified-workflow-mermaid-handdrawn.md` — Mermaid handDrawn demo
- `kanban/1_planning/diagrams/unified-workflow.excalidraw` — Excalidraw JSON demo
