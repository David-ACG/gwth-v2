# GWTH_curriculum

This repository holds the **teaching content** for GWTH (Grow With The Help): lesson ideas, research folders, syllabus drafts, and — once written — lesson / lab / project markdown files.

## What this repo IS

- The source of truth for GWTH curriculum: what's taught, how it's taught, which sources back it up.
- A markdown-only workspace. No build. No tests beyond semantic review. No deploys.
- Home of the VIP asset intake skill (`/vip-intake`) — the workflow for ingesting a new article / URL / PDF / YouTube video and turning it into a kanban idea file for integration into the curriculum.
- Home of the curriculum kanban (`kanban/0_idea → 1_planning → 2_testing → 3_done`).

## What this repo IS NOT

- **Not the platform.** The Next.js student-facing app lives in `C:\Projects\GWTH_V2`. That repo imports curriculum content from here at build time.
- **Not the pipeline.** The Docling → Qdrant ingestion pipeline + NiceGUI dashboard lives in `C:\Projects\1_gwthpipeline520`. This repo *uses* Qdrant (via HTTP) for corpus cross-checks during VIP intake, but owns none of the pipeline's services.
- **Not engineering-tracked.** Use engineering beads/kanban in GWTH_V2 or pipeline for code work. This repo's beads + kanban track *curriculum edits* — adding quotes, weaving in findings, reshaping lesson ideas.

## Sibling repos

- [`GWTH_V2`](https://github.com/David-ACG/gwth-v2) — Next.js student platform. Consumes curriculum content.
- [`1_gwthpipeline520`](https://github.com/David-ACG/gwthpipeline520) — Docling + Qdrant + NiceGUI dashboard. Ingests sources, runs RAG, feeds the VIP intake skill.

## Layout

```
GWTH_curriculum/
├── CLAUDE.md                          # Claude Code context for curriculum work
├── README.md                          # this file
├── kanban/
│   ├── 0_idea/                        # new ideas land here (including VIP idea files)
│   ├── 1_planning/                    # plans + prompts
│   ├── 2_testing/                     # prompts executed, awaiting review
│   ├── 3_done/                        # completed
│   ├── templates/
│   │   └── VIP_IDEA_TEMPLATE.md       # template the VIP skill renders
│   ├── docs/
│   │   └── VIP_ASSET_CONTRACT.md      # how the skill works, how to diagnose failures
│   ├── reports/                       # drift reports, audit summaries
│   ├── KANBAN_RUNNER.md               # curriculum-specific workflow rules
│   ├── PLAN_TEMPLATE.md
│   ├── PROMPT_TEMPLATE.md
│   └── vip-assets-index.json          # append-only log of VIP intakes
├── gwth_lesson_ideas/                 # living lesson-idea documents
│   ├── MONTH_1_LESSON_IDEAS_<date>.md
│   ├── MONTH_2_LESSON_IDEAS_<date>.md
│   ├── MONTH_3_LESSON_IDEAS_<date>.md
│   ├── SYLLABUS_DIFF_<date>.md
│   └── month-{1,2,3}-research/        # detailed research feeding the lesson ideas
├── content/                           # future: written lessons / labs / projects
└── .claude/
    └── skills/
        └── vip-intake.md              # the /vip-intake skill runbook
```

## Workflow

1. **Curating a new asset (article / video / PDF):**
   - Start a Claude Code session from this repo
   - Invoke `/vip-intake <URL or file-path>`
   - Claude fetches, fact-checks, queries Qdrant, reads lesson-ideas + research, writes an idea file to `kanban/0_idea/`
   - Review the idea file
   - Run `/plan` to generate a surgical-edit plan
   - Run `/build` to apply the edits to lesson ideas / research folders

2. **Writing lessons / labs / projects (later):**
   - Same flow. Start in this repo. Use `/plan` + `/build`. Content lands in `content/`.
   - GWTH_V2 imports from `content/` at build time (script to be added when lessons are ready).

## Editorial style

Lessons and research notes follow a consistent voice: UK-first framing, named 2026 sources (FT, BBC, CIPD, Mollick, Karpathy, OpenAI, Anthropic, Google), recurring motifs ("flat is the new up", "career-pyramid erosion", "AI complements proficiency"), and concrete quotes over paraphrase. See `gwth_lesson_ideas/MONTH_*_LESSON_IDEAS_*.md` for the canonical voice.
