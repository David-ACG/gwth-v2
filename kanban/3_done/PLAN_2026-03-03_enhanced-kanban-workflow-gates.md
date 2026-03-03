# Plan: Enhanced Kanban Workflow with Quality Gates

**Date:** 2026-03-03
**Status:** Awaiting Review
**Source Idea:** David's request to add review gates, verification steps, and archiving rules to kanban workflow across all 4 projects

## Context

The kanban workflow (0_idea → 1_planning → 2_testing → 3_done) works well for tracking work, but there are no structured review points between stages. Ideas get planned, prompts get written, code gets implemented — but there's no consistent moment where David is asked to check things with clear checklists and clickable links. Files also sometimes get deleted instead of archived, losing history.

This plan adds **4 quality gates** with review checklists, enforces consistent file naming with datestamps, and sets up the kanban structure in all 4 projects.

## Overview

Add structured quality gates at every stage transition in the kanban workflow. Each gate appends a date+timestamped checklist to the relevant file and provides David with a clickable link to review. Apply this to all 4 projects: GWTH_V2, Pipeline, GCSEReady, ACG.

## Goals

- Every plan and prompt file gets a review checkpoint before proceeding
- Every implementation gets verified (Playwright for web projects) before handoff
- Every stage transition has a testing checklist David can tick off
- Files are archived (never deleted) with consistent datestamped naming
- All 4 projects share the same workflow structure

## The 4 Gates

| Gate                                    | When                         | What gets appended                              | Where              |
| --------------------------------------- | ---------------------------- | ----------------------------------------------- | ------------------ |
| **Gate 1: Plan Review**                 | After writing PLAN file      | Review checklist + clickable file link          | End of PLAN file   |
| **Gate 2: Prompt Review**               | After writing PROMPT file(s) | Review checklist + clickable file link          | End of PROMPT file |
| **Gate 3: Implementation Verification** | After implementing           | Implementation notes + Playwright results + URL | End of PROMPT file |
| **Gate 4: Testing Handoff**             | After moving to 2_testing/   | Testing checklist + clickable file link         | End of PROMPT file |

Each gate section is **date+timestamped** and **appended** (never overwrites existing content).

## File Lifecycle (archive, never delete)

```
0_idea/IDEA_*.md  ──plan──>  1_planning/PLAN_*.md + PROMPT_*.md
                                │
     ┌──────────────────────────┘
     │  When planning complete:
     │  • IDEA archived to 3_done/ (not deleted)
     │  • PLAN archived to 3_done/ (when all prompts written)
     │
     └──>  PROMPT moves: 1_planning/ → 2_testing/ → 3_done/
```

## File Naming Convention (mandatory)

All kanban files: `PREFIX_YYYY-MM-DD_short-slug.md`

- `IDEA_2026-03-03_certificate-sharing.md`
- `PLAN_2026-03-03_certificate-sharing.md`
- `PROMPT_2026-03-03_certificate-sharing.md`
- `RESEARCH_2026-03-03_diagramming-options.md`

---

## Files to Create/Modify

### 1. Global CLAUDE.md — Add kanban gate rules

**File:** `C:\Users\david\.claude\CLAUDE.md`

Replace the existing `## Kanban Workflow` section with ~80 lines covering:

- All 4 gates with exact append format (timestamps, checkboxes, file links)
- File naming convention
- Archive rules (move to 3_done/, never delete)
- Project-aware verification (Playwright for web projects, pytest for pipeline, manual for GCSEReady)

This is the **enforcement mechanism** — Claude reads this at every session start.

### 2. KANBAN_RUNNER.md — Rewrite with gates documented

**File:** `C:\Projects\GWTH_V2\kanban\KANBAN_RUNNER.md`

Rewrite to document the enhanced workflow. Add a **Project Configuration** section at the top (test command, deploy URLs, verification method). Copy adapted versions to other projects.

### 3. PROMPT_TEMPLATE.md — Add gate placeholder sections

**File:** `C:\Projects\GWTH_V2\kanban\PROMPT_TEMPLATE.md`

Enhance from 16 lines to ~50 lines. Add empty placeholder sections at the bottom for Gates 2-4 that Claude fills in during the workflow.

### 4. PLAN_TEMPLATE.md — New file

**File:** `C:\Projects\GWTH_V2\kanban\PLAN_TEMPLATE.md` (new)

Plan template with Gate 1 review checklist placeholder at the bottom.

### 5. kanban-planner agent — Archive instead of delete, append gates

**File:** `C:\Projects\GWTH_V2\.claude\agents\kanban-planner.md`

- Step 7: Change "Delete the original idea file" → "Archive to 3_done/"
- After writing PLAN: append Gate 1 review checklist with timestamp
- After writing PROMPT: append Gate 2 review checklist with timestamp
- Communication protocol: include `file:///` clickable links

### 6. run-kanban.sh — Inject gate instructions into autonomous prompt

**File:** `C:\Projects\GWTH_V2\kanban\run-kanban.sh`

Update the injected system prompt to tell Claude to:

- Append Gate 3 (implementation notes) after code changes
- Append Gate 4 (testing checklist) before signaling completion
- Use Playwright to verify web pages load correctly

### 7. GCSEReady-520 — Create kanban folder structure

**Create:**

- `C:\Projects\GCSEReady-520\kanban\` (all 4 stage folders)
- `KANBAN_RUNNER.md`, `PROMPT_TEMPLATE.md`, `PLAN_TEMPLATE.md`

### 8. acgtest2026-520 — Create subfolders and templates

**Create within existing empty kanban/:**

- `0_idea/`, `1_planning/`, `2_testing/`, `3_done/`
- `KANBAN_RUNNER.md`, `PROMPT_TEMPLATE.md`, `PLAN_TEMPLATE.md`

### 9. Pipeline project — Add templates and update runner docs

**Create:**

- `C:\Projects\1_gwthpipeline520\kanban\PROMPT_TEMPLATE.md`
- `C:\Projects\1_gwthpipeline520\kanban\PLAN_TEMPLATE.md`

**Update:**

- `C:\Projects\1_gwthpipeline520\kanban\KANBAN_RUNNER.md` (rewrite with gates)

### 10. Project CLAUDE.md files — Add kanban references

Update each project's CLAUDE.md with a short section pointing to the kanban runner and specifying project-specific config:

- `C:\Projects\GCSEReady-520\CLAUDE.md`
- `C:\Projects\acgtest2026-520\CLAUDE.md`
- `C:\Projects\1_gwthpipeline520\.claude\claude.md`
- `C:\Projects\GWTH_V2\CLAUDE.md`

---

## Project-Specific Configuration

| Project   | Test Command                        | Verification URL                             | Verification Method |
| --------- | ----------------------------------- | -------------------------------------------- | ------------------- |
| GWTH_V2   | `npm test`                          | http://192.168.178.50:3001 / https://gwth.ai | Playwright browser  |
| Pipeline  | `pytest tests/ -m "not acceptance"` | http://192.168.178.50:8088                   | Playwright browser  |
| ACG       | `npm test`                          | https://agilecommerce.ai                     | Playwright browser  |
| GCSEReady | None (design phase)                 | N/A                                          | Manual file review  |

---

## Order of Operations

1. Global CLAUDE.md (enforcement first)
2. Templates (PLAN_TEMPLATE.md, PROMPT_TEMPLATE.md) in GWTH_V2
3. KANBAN_RUNNER.md rewrite in GWTH_V2
4. kanban-planner agent update
5. run-kanban.sh update
6. GCSEReady-520 folder setup + templates
7. acgtest2026-520 folder setup + templates
8. Pipeline templates + runner update
9. Project CLAUDE.md updates (all 4)
10. Commit and push each project

---

## Verification

1. **Start a fresh Claude Code session in GWTH_V2** — ask "What are the kanban gates?" and confirm Claude knows all 4
2. **Check folder structure** in all 4 projects: `ls kanban/*/`
3. **Check templates exist** in all 4 projects
4. **Test the workflow** — drop a test idea into GWTH_V2's 0_idea/ and verify:
   - PLAN gets Gate 1 checklist appended with timestamp
   - Idea gets archived to 3_done/ (not deleted)
   - PROMPT gets Gate 2 checklist appended
   - File links use `file:///C:/Projects/...` format

---

## Review Checklist — 2026-03-03 14:30

- [ ] The 4 gates make sense and cover the right checkpoints
- [ ] File naming convention (`PREFIX_YYYY-MM-DD_slug.md`) works for you
- [ ] Archive to 3_done/ (not a separate archive/ folder) is acceptable
- [ ] Clickable file links format (`file:///C:/Projects/...`) works in your terminal
- [ ] Project-specific config table is correct (test commands, URLs, verification methods)
- [ ] GCSEReady getting kanban setup makes sense (even though it's in design phase)
- [ ] Order of operations looks right (global CLAUDE.md first, then cascade to projects)
- [ ] The scope is right — not too much, not too little

**Review this plan:** `file:///C:/Projects/GWTH_V2/kanban/1_planning/PLAN_2026-03-03_enhanced-kanban-workflow-gates.md`
