# Diagramming Research for GWTH Lesson Content

**Date:** 2026-03-03
**Beads:** GWTH-3rawd4 | **Linear:** GWTH-12
**Status:** Research complete

## Executive Summary

After evaluating 5 categories of diagramming tools across automation, cost, quality, style consistency, and scale feasibility, the recommended approach is a **two-tier hybrid workflow**:

1. **Primary (80% of diagrams):** Mermaid.js (hand-drawn look) + Excalidraw export pipeline — for flowcharts, architecture, data flow, sequence diagrams
2. **Secondary (20% of diagrams):** AI image generation (FLUX.2 locally or Nano Banana 2 cloud) — for rich conceptual illustrations, knolling/flat-lay infographics
3. **Bonus:** Remotion for animated diagram walkthroughs in video lessons (uses the same source data)

---

## 1. Excalidraw-Based Workflows

### Overview

Excalidraw is an open-source virtual whiteboard with a signature hand-drawn aesthetic. It stores diagrams as JSON, which can be generated programmatically and rendered to SVG/PNG.

### Key Tools

| Tool                                | What it does                                 | Automation | Cost | Local |
| ----------------------------------- | -------------------------------------------- | ---------- | ---- | ----- |
| `@swiftlysingh/excalidraw-cli`      | Creates `.excalidraw` JSON from text DSL     | Full (CLI) | Free | Yes   |
| `@excalidraw/mermaid-to-excalidraw` | Converts Mermaid → Excalidraw elements       | Full (API) | Free | Yes   |
| `excalidraw-to-svg`                 | Headless `.excalidraw` → SVG conversion      | Full (CLI) | Free | Yes   |
| `excalirender`                      | Headless `.excalidraw` → PNG/SVG/PDF         | Full (CLI) | Free | Yes   |
| Cole Medin's Claude skill           | AI generates + renders + validates diagrams  | Semi-auto  | Free | Yes   |
| Ooi Yee Fei's Claude skill          | AI analyzes codebase → architecture diagrams | Semi-auto  | Free | Yes   |

### Style Consistency

Excalidraw's hand-drawn look is controlled by JSON properties:

- `roughness: 2` (Cartoonist = maximum sketch effect)
- `fontFamily: 1` (Virgil = hand-written font)
- `fillStyle: "hachure"` (hand-drawn hatching)

These are baked into the JSON — every rendering tool reproduces them identically. A style template applied during generation ensures 100% consistency across 500+ diagrams.

### Batch Pipeline

```
Data Source (lesson content JSON)
    → Generator Script (Node.js/Python, produces .excalidraw files)
    → excalidraw-to-svg or excalirender (batch conversion)
    → 500 SVG files in ~30-60 seconds
```

### Pros

- Signature hand-drawn aesthetic that David likes
- JSON format is version-controllable and diffable
- Multiple rendering tools available (headless, no browser needed)
- Claude Code skills exist for AI-assisted generation
- 100% style consistency via JSON property templates
- Free and fully local

### Cons

- Requires building a generator script to produce JSON
- Limited to Excalidraw's built-in shapes (no complex illustrations)
- Arrow routing and layout need manual effort or dagre/ELK.js integration
- Not as polished as AI-generated images for conceptual diagrams
- Font rendering can vary between tools (Virgil font must be available)

### Verdict: Strong choice for structural diagrams (flowcharts, architecture, data flow)

---

## 2. Mermaid + AI Rendering

### Overview

Mermaid.js defines diagrams as text DSL (version-controllable, diffable). Version 11 added a `handDrawn` look using rough.js. Google's Nano Banana 2 can transform Mermaid diagrams into visually stunning images.

### Mermaid.js Capabilities

**24 diagram types** including: flowchart, sequence, class, state, ER, gantt, user journey, mindmap, timeline, architecture, kanban, and more.

**Built-in hand-drawn look** (v11+):

```
---
config:
  look: handDrawn
  theme: neutral
---
flowchart LR
  A --> B --> C
```

Currently supported for flowcharts and state diagrams. Other types planned.

### Mermaid CLI (`mmdc`)

| Feature         | Detail                           |
| --------------- | -------------------------------- |
| Output formats  | SVG, PNG, PDF                    |
| Themes          | default, dark, forest, neutral   |
| Custom CSS      | Via `--cssFile` flag             |
| Batch rendering | Shell loop over `.mmd` files     |
| Deterministic   | Same input → same output, always |
| Cost            | Free (open source)               |
| Local           | Yes (Puppeteer + Chromium)       |

### Nano Banana 2 (Google Gemini 3.1 Flash Image)

A two-stage pipeline: Mermaid for structure → Nano Banana 2 for visual polish.

| Property      | Value                                                                    |
| ------------- | ------------------------------------------------------------------------ |
| Model         | Gemini 3.1 Flash Image Preview                                           |
| Automation    | Full API (Gemini API), batch mode available                              |
| Cost          | $0.03/img (1K, batch) to $0.15/img (4K, real-time)                       |
| Style         | Prompt-controlled: Swiss Modernism, Neo-Memphis, Blueprint, Isometric 3D |
| Text accuracy | 95%+ for short labels (<25 chars)                                        |
| Output        | Raster PNG/JPEG (not editable)                                           |

**Cost for GWTH:**

- 500 initial (1K batch): ~$15
- 50/month ongoing (1K batch): ~$1.50/month
- Annual total: ~$21

### Mermaid Chart MCP (Available in Workspace)

Already configured with `validate_and_render_mermaid_diagram` tool. Good for quick validation during development. Limited to Mermaid's built-in themes — not suitable for production-quality styled output.

### Mermaid-to-Excalidraw

Converts Mermaid definitions to Excalidraw's hand-drawn format. **Limitation:** Only flowcharts are truly converted; other diagram types fall back to embedded images.

### Pros

- Text DSL is the most version-control-friendly format
- 24 diagram types cover almost any educational content
- Built-in hand-drawn look for informal/friendly diagrams
- Deterministic rendering (same source → same output)
- Nano Banana 2 produces stunning visuals at low cost
- Free baseline (mmdc) with premium option (Nano Banana 2)

### Cons

- Default Mermaid rendering is functional but not beautiful
- hand-drawn look only supports flowcharts + state diagrams currently
- Nano Banana 2 output is raster-only (not editable)
- Nano Banana 2 introduces style variability (generative AI)
- Requires Puppeteer/Chromium for rendering (heavyweight)

### Verdict: Best baseline for all diagrams; Nano Banana 2 for selective premium styling

---

## 3. AI Image Generation

### Overview

AI image models can generate rich, visually appealing diagrams — especially knolling/flat-lay infographics. However, they struggle with structural accuracy and text rendering.

### Cloud API Options

| Provider | Model                            | Cost/Image                  | Text Quality | Automation           | Notes              |
| -------- | -------------------------------- | --------------------------- | ------------ | -------------------- | ------------------ |
| Google   | Nano Banana 2 (Gemini 3.1 Flash) | $0.03 batch                 | 95% (short)  | Full API             | Best value         |
| OpenAI   | GPT Image 1.5                    | $0.02 batch                 | 95% (best)   | Full API             | Best text          |
| OpenAI   | GPT Image 1 Mini                 | $0.005 batch                | Good         | Full API             | Cheapest quality   |
| Ideogram | 3.0                              | $0.03-0.06                  | 90%          | Full API + CSV batch | Good all-round     |
| Recraft  | V3                               | $0.04 (raster), $0.08 (SVG) | 85%          | Full API             | Vector SVG output! |

### Local Models (RTX 3090, 24GB VRAM)

| Model                  | VRAM    | Speed      | Text Quality     | License        | Notes                      |
| ---------------------- | ------- | ---------- | ---------------- | -------------- | -------------------------- |
| FLUX.2 Dev (quantized) | 18-20GB | 12-15s/img | 85%              | Non-commercial | Best quality local         |
| FLUX.2 Klein 4B        | 13GB    | <1s/img    | Moderate         | Apache 2.0     | Best speed + license       |
| CogView4 6B            | 8GB     | 5-8s/img   | Good (bilingual) | Apache 2.0     | Lightweight, free          |
| SDXL + ControlNet      | 6-8GB   | 5-8s/img   | Poor (50%)       | Varies         | Best compositional control |

### Knolling / Flat-Lay Style

AI models handle this style **very well** — the overhead perspective and organized layouts align with diffusion models' strengths. The example images from the Linear issue (water cycle, DeepMind knolling) are achievable with FLUX.2 or Nano Banana 2.

**Effective prompt template:**

```
High-quality flat lay knolling photography creating a DIY infographic that explains [TOPIC],
objects arranged at 90-degree angles on a clean light gray textured background,
simple clean black hand-drawn arrows guiding the viewer's eye between elements,
soft overhead studio lighting, minimalist composition,
educational diagram style, labeled components, professional product photography
```

### Custom LoRA Training (Recommended for Style Consistency)

Train a LoRA on 20-25 reference images of the target style:

- Training time: ~20-30 minutes on RTX 3090
- Tools: SimpleTuner or kohya-ss
- Result: Consistent style across all generations using trigger word in prompt

### Text Accuracy Problem

Even the best models achieve ~85-95% accuracy per label. With 5 labels per diagram, ~50% of images will have at least one error. **Recommended mitigation:** Generate images without text labels, then overlay labels programmatically.

### Pros

- Produces visually stunning, rich illustrations
- Knolling/flat-lay style is excellent for educational content
- Custom LoRA ensures style consistency
- FLUX.2 runs locally on RTX 3090 (free)
- Cloud options are extremely cheap ($0.005-0.06/image)

### Cons

- Cannot produce structurally accurate technical diagrams
- Text rendering is unreliable (needs post-processing or overlay)
- Each image is a raster bitmap — not editable
- Style drift over 500 images requires QA
- Not suitable for flowcharts, sequence diagrams, architecture diagrams

### Verdict: Excellent for conceptual/illustrative diagrams, not for structural ones

---

## 4. Remotion-Based Approach

### Overview

Remotion is a React framework for rendering video and still images programmatically. Diagrams are built as React components using SVG + layout libraries, then rendered via headless Chromium.

### Key Capabilities

| Capability        | Detail                                                |
| ----------------- | ----------------------------------------------------- |
| Static output     | PNG, JPEG, WebP, PDF via `renderStill()`              |
| Video output      | MP4, WebM, GIF via `renderMedia()`                    |
| Diagram libraries | React Flow, dagre, ELK.js, D3 — any React/SVG library |
| Hand-drawn look   | `react-rough-fiber` wraps any SVG in sketchy style    |
| Batch rendering   | Built-in dataset rendering with browser reuse         |
| Dual output       | Same component → static image AND animated video      |
| Style consistency | Full CSS/React — use GWTH's design tokens directly    |

### Dual-Output Advantage

This is Remotion's killer feature for GWTH. The same diagram component produces:

1. **Static PNG** for lesson pages (captured at a specific frame)
2. **Animated MP4** for video walkthroughs (nodes appearing, edges drawing in, data flowing)

Build once, get both deliverables.

### Development Effort

| Component                                  | Effort        |
| ------------------------------------------ | ------------- |
| Core SVG diagram renderer + dagre layout   | 2-3 days      |
| Node types (process, decision, data, etc.) | 1-2 days      |
| Edge types + arrowheads                    | 1 day         |
| react-rough-fiber integration              | 0.5 day       |
| Color/theme system                         | 0.5 day       |
| Animation system                           | 2-3 days      |
| Batch rendering script                     | 1 day         |
| Data schema + validation                   | 0.5 day       |
| **Total**                                  | **8-11 days** |

### Scale Performance

| Batch             | Time (sequential, browser reuse) |
| ----------------- | -------------------------------- |
| 500 diagrams      | 8-25 minutes                     |
| 50 diagrams/month | 50-150 seconds                   |

### Cost

Free for individuals and teams up to 3 employees. $100/month for larger teams.

### Pros

- Dual static + animated output from same source
- Full programmatic control via React/CSS
- Uses GWTH's existing design system tokens
- react-rough-fiber provides hand-drawn aesthetic
- Excellent style consistency (CSS-based)
- Runs fully locally

### Cons

- Highest initial development effort (8-11 days)
- Output is raster only (PNG/JPEG), not vector SVG
- Requires building a custom diagram component library
- Remotion is a heavy dependency (Chromium-based rendering)
- Overkill if you don't need animation

### Verdict: Best long-term investment if animated diagrams for video lessons are needed

---

## 5. Hybrid Approaches

### Recommended: Two-Tier Workflow

Based on the research, diagrams in GWTH lessons fall into two categories that need different tools:

**Tier 1 — Structural Diagrams (80% of diagrams)**

- Flowcharts, architecture, data flow, sequence diagrams, state machines
- Accuracy of structure and labels is critical
- Need: deterministic, text-based, version-controlled

**Tier 2 — Conceptual Illustrations (20% of diagrams)**

- Concept overviews, process explanations, metaphorical diagrams
- Visual appeal and engagement are critical
- Need: artistic, attention-grabbing, hand-drawn/knolling aesthetic

### Workflow A: Structural Diagrams

```
Author .mmd file (Mermaid DSL, committed to repo)
    → Mermaid-to-Excalidraw (convert to hand-drawn format)
    → excalidraw-to-svg (render to SVG)
    → Commit SVG to repo or deploy to CDN
```

**Alternative fast path:**

```
Author .mmd file → mmdc --look handDrawn (direct Mermaid hand-drawn rendering)
```

### Workflow B: Conceptual Illustrations

```
Write prompt template (committed to repo)
    → FLUX.2 Dev locally (RTX 3090) or Nano Banana 2 (cloud)
    → Generate image without text labels
    → Overlay text labels programmatically (ImageMagick/Pillow)
    → Commit to repo or deploy to CDN
```

### Workflow C: Animated Diagrams (Phase 2)

```
Diagram data JSON (same as Workflow A source)
    → Remotion React components + react-rough-fiber
    → renderStill() for lesson page images
    → renderMedia() for video lesson walkthroughs
```

---

## Comparison Table

| Tool                      | Automation    | Quality           | Cost      | Local (RTX 3090) | Style Consistency           | Output Format   | Best For                   |
| ------------------------- | ------------- | ----------------- | --------- | ---------------- | --------------------------- | --------------- | -------------------------- |
| **Mermaid CLI (mmdc)**    | Full          | Functional        | Free      | Yes              | Perfect (deterministic)     | SVG/PNG         | Baseline for all diagrams  |
| **Mermaid handDrawn**     | Full          | Good (sketch)     | Free      | Yes              | Perfect                     | SVG/PNG         | Informal/whiteboard style  |
| **Mermaid-to-Excalidraw** | Full          | Good (hand-drawn) | Free      | Yes              | Good                        | Excalidraw JSON | Flowcharts only            |
| **Excalidraw pipeline**   | Full          | Good (hand-drawn) | Free      | Yes              | Excellent (JSON templates)  | SVG/PNG         | Structural + hand-drawn    |
| **Nano Banana 2**         | Full (API)    | Excellent         | $0.03/img | No (cloud)       | Variable (prompt-dependent) | PNG/JPEG        | Premium styled diagrams    |
| **GPT Image 1.5**         | Full (API)    | Excellent         | $0.02/img | No (cloud)       | Variable                    | PNG/JPEG        | Best text in images        |
| **FLUX.2 Dev**            | Full (script) | Excellent         | Free      | Yes (18-20GB)    | Good (with LoRA)            | PNG             | Rich illustrations locally |
| **FLUX.2 Klein 4B**       | Full (script) | Very good         | Free      | Yes (13GB)       | Moderate                    | PNG             | Fast local generation      |
| **Remotion + rough.js**   | Full          | Good (hand-drawn) | Free\*    | Yes              | Excellent (CSS-based)       | PNG/MP4         | Static + animated output   |
| **Recraft V3**            | Full (API)    | Very good         | $0.08/SVG | No (cloud)       | Good                        | SVG vector      | Scalable vector output     |

\*Free for individuals/small teams

---

## Top 3 Recommendations

### 1. Mermaid + Excalidraw Pipeline (Primary — Structural Diagrams)

**Why:** Best balance of automation, consistency, hand-drawn aesthetic, and version control. Free, local, deterministic.

**Workflow:**

1. Author diagrams as `.mmd` files alongside lesson content
2. Convert to Excalidraw format via `mermaid-to-excalidraw` (for flowcharts) or generate Excalidraw JSON directly
3. Render to SVG via `excalidraw-to-svg`
4. Store both `.mmd`/`.excalidraw` source and rendered SVG in repo
5. CI/CD renders all diagrams on build

**Cost:** $0 (all open-source, runs locally)
**Style:** Hand-drawn with roughness=2, Virgil font, hachure fill
**Scale:** 500 diagrams in ~1-2 minutes of render time

### 2. AI Generation with FLUX.2 + Custom LoRA (Secondary — Conceptual Illustrations)

**Why:** Produces visually stunning knolling/flat-lay infographics that engage students. Runs on existing RTX 3090 hardware.

**Workflow:**

1. Train a LoRA on 25 curated reference images (one-time, 30 min)
2. Write prompt templates with `[TOPIC]` placeholders
3. Generate images via ComfyUI or Python diffusers script
4. Overlay text labels programmatically (Pillow/ImageMagick)
5. QA and commit to repo

**Cost:** Electricity only (~$0 per image)
**Style:** Flat-lay knolling, consistent via LoRA
**Scale:** 500 images in ~1.7 hours (FLUX.2 Dev) or ~8 min (FLUX.2 Klein)
**Fallback:** Nano Banana 2 cloud API ($0.03/img) if local generation is impractical

### 3. Remotion Pipeline (Phase 2 — Animated + Static)

**Why:** Same diagram definitions produce both static lesson images AND animated video walkthroughs. The development investment pays off when video lessons need diagram animations.

**Workflow:**

1. Define diagrams as JSON data
2. Build React diagram components with react-rough-fiber
3. `renderStill()` for lesson page PNGs
4. `renderMedia()` for video lesson animated walkthroughs
5. Batch render via Node.js script

**Cost:** Free (individual license)
**Development:** 8-11 days initial investment
**Style:** Full CSS control, uses GWTH design tokens
**Scale:** 500 stills in ~10-25 minutes

---

## Pipeline Integration Plan

### How Diagrams Are Authored

**Structural diagrams:** Written as Mermaid DSL (`.mmd` files) in `content/diagrams/` alongside lesson markdown. Claude Code can generate Mermaid from lesson content descriptions.

**Conceptual illustrations:** Prompt templates in `content/diagram-prompts/` with `[TOPIC]` and `[DESCRIPTION]` placeholders. A script substitutes lesson-specific values and generates images.

### How Diagrams Are Stored

```
content/
  lessons/
    lesson-01/
      content.mdx          # Lesson text (references diagrams by path)
      diagrams/
        architecture.mmd    # Mermaid source (git-tracked)
        architecture.svg    # Rendered output (git-tracked or gitignored if generated at build)
        overview.prompt.md  # AI prompt template (git-tracked)
        overview.png        # AI-generated image (git-tracked after QA)
```

**Source files** (`.mmd`, `.excalidraw`, `.prompt.md`) are always committed.
**Rendered outputs** (`.svg`, `.png`) can be either:

- Committed to repo (simpler, works offline)
- Generated at build time (cleaner repo, requires render tools in CI)

Recommendation: Commit rendered outputs for now. Move to build-time generation when the pipeline is more mature.

### How Diagrams Are Updated

1. Edit the `.mmd` source file or `.prompt.md` template
2. Run render script: `npm run render:diagrams` (wrapper around batch rendering)
3. Review diffs in PR (SVGs are diffable, PNGs show visual diff in GitHub)
4. Merge and deploy

### How Batch Updates Work (50 diagrams/month)

```bash
# Render all structural diagrams (Mermaid → SVG)
npm run render:diagrams:structural

# Render specific AI illustrations (prompts → PNG)
npm run render:diagrams:illustrations --lessons=1,5,12

# Render all (both pipelines)
npm run render:diagrams:all
```

Each script:

1. Finds source files that changed since last render (git diff)
2. Renders only changed diagrams (incremental)
3. Reports what was generated

### Playwright Automation Feasibility

| Approach            | Playwright Needed?    | Notes                                |
| ------------------- | --------------------- | ------------------------------------ |
| Mermaid CLI         | No                    | mmdc handles rendering natively      |
| Excalidraw pipeline | No                    | excalidraw-to-svg is headless        |
| FLUX.2 local        | No                    | ComfyUI or Python diffusers          |
| Nano Banana 2       | No                    | Direct API calls                     |
| Remotion            | No                    | renderStill() uses built-in Chromium |
| Excalidraw web app  | Yes (not recommended) | Fragile, slow, unnecessary           |

**Verdict:** Playwright automation is not needed for any recommended workflow. All tools have CLI/API interfaces.

---

## Cost Estimate

### Initial 500 Diagrams

| Category                              | Count   | Tool                 | Cost   |
| ------------------------------------- | ------- | -------------------- | ------ |
| Structural (flowcharts, architecture) | 400     | Mermaid + Excalidraw | $0     |
| Conceptual illustrations              | 100     | FLUX.2 Dev (local)   | $0     |
| **Total**                             | **500** |                      | **$0** |

If using cloud AI instead of local:
| Category | Count | Tool | Cost |
|----------|-------|------|------|
| Structural | 400 | Mermaid + Excalidraw | $0 |
| Conceptual | 100 | Nano Banana 2 (batch) | $3.00 |
| **Total** | **500** | | **$3.00** |

### Ongoing 50 Diagrams/Month

| Category           | Count  | Tool                 | Cost/Month   |
| ------------------ | ------ | -------------------- | ------------ |
| Structural updates | 40     | Mermaid + Excalidraw | $0           |
| Conceptual updates | 10     | FLUX.2 Dev (local)   | $0           |
| **Total**          | **50** |                      | **$0/month** |

Cloud alternative: $0.30/month for Nano Banana 2

### Annual Total

- **All local:** $0/year
- **With cloud AI for illustrations:** ~$6.60/year
- **Premium option (all Nano Banana 2):** ~$21/year

### LoRA Training (One-Time)

- 25 reference images (curate manually): 2-3 hours of curation
- Training on RTX 3090: ~30 minutes
- Cost: $0 (local compute)

### Remotion Development (One-Time, Phase 2)

- 8-11 developer days
- Cost: Developer time only (Remotion is free for individuals)

---

## Demo Diagrams

Three demos of the "Unified Workflow" have been produced and saved in `kanban/1_planning/diagrams/`:

### Demo 1: Mermaid (hand-drawn look)

- **Source:** `unified-workflow-mermaid.mmd`
- **Output:** Rendered via Mermaid Chart MCP with `look: handDrawn, theme: neutral`
- **Style:** Sketchy lines, hand-written feel, subgraph groupings
- **Verdict:** Good for structural accuracy. The hand-drawn look softens the "corporate diagram" feel. Fast to author and update.

### Demo 2: Excalidraw (programmatic JSON)

- **Source:** `unified-workflow-excalidraw.excalidraw`
- **Style:** roughness=2, Virgil font, hachure fill, pastel colors
- **Verdict:** The most authentic hand-drawn aesthetic. JSON is machine-generated. Can be opened in Excalidraw web app for manual touch-ups. Requires excalidraw-to-svg for rendering.

### Demo 3: Remotion Spec (data-driven JSON)

- **Source:** `unified-workflow-remotion-spec.json`
- **Style:** Defines nodes, edges, colors, and animation parameters
- **Verdict:** Not renderable without the Remotion component library (which needs to be built). But shows how diagram data would be structured. The same data drives both static and animated output.

### Bonus: AI Image Prompt

- **Source:** `unified-workflow-ai-prompt.md`
- **Style:** Flat-lay knolling infographic prompt
- **Verdict:** Would produce a visually stunning but non-editable image. Best for hero/overview diagrams, not for detailed technical flows.

---

## Final Recommendation

### Start With (Week 1)

1. **Mermaid DSL** as the universal source format for all structural diagrams
2. **Mermaid CLI** (`mmdc`) for rendering with hand-drawn look where supported
3. **Mermaid Chart MCP** for quick validation during authoring in Claude Code

### Add Next (Week 2-3)

4. **Excalidraw pipeline** for diagrams needing authentic hand-drawn aesthetic beyond what Mermaid's hand-drawn look provides
5. **FLUX.2 + LoRA** for 100 conceptual/illustrative diagrams (train LoRA first)

### Add Later (Month 2+)

6. **Remotion** for animated diagram walkthroughs when video lesson production begins

### Summary

The beauty of this approach is that **Mermaid DSL is the single source of truth** for 80% of diagrams. It is text-based (version-controllable), supports 24 diagram types, and can be rendered through multiple backends:

- Default Mermaid rendering (clean, functional)
- Mermaid hand-drawn look (sketch aesthetic)
- Mermaid → Excalidraw → SVG (authentic hand-drawn)
- Mermaid → Nano Banana 2 (AI-polished premium)

If any rendering approach becomes inadequate, you switch the backend without changing the source files.

---

## Review Checklist — 2026-03-03

- [ ] Scope is correctly bounded (not too broad, not too narrow)
- [ ] All 5 categories researched with pros/cons
- [ ] Comparison table covers: tool name, automation, cost, local, style consistency, output format
- [ ] 3 demo diagrams produced and saved
- [ ] Clear recommendation for primary + secondary workflow
- [ ] Pipeline integration plan included
- [ ] Cost estimate for 500 initial + 50/month ongoing
- [ ] No unexpected dependencies introduced

**Review this plan:** `file:///C:/Projects/GWTH_V2/kanban/1_planning/PLAN_2026-03-02_diagramming-research.md`
