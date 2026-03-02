# Idea - Research Diagramming options for lessons Text Section

**Beads:** GWTH-3rawd4 | **Linear:** https://linear.app/gwth/issue/GWTH-12 | **Priority:** Backlog | **Type:** idea

## Description

I would like to create clear diagrams that look handmade to use in each lesson. The reason I like Excalidraw is it looks hand drawn if you use the max “sloppiness” setting. Can you research how I should draw diagrams for the main lesson section, which is made up of text and diagrams. I want to know which tools are best, how I can automate the process as much as possible and then I’d like to see a demo of the 3 best options you recommend. I’d like to add this to the pipeline so we can write the lessons and then create the diagrams. Please use the new “Unified Workflow” as an example of such a diagram. Please research using the web and look at tools such as [https://blog.google/innovation-and-ai/technology/ai/nano-banana-2/](https://blog.google/innovation-and-ai/technology/ai/nano-banana-2/) which was released recently. Also look at Chinese cloud tools, Open Source LLMs and tools that will run on an RTX 3090 and developing something based on Remotion. In the end I would like our diagrams to have a certain style and uniformity across the course. If we have 5 images per lesson and 100 lessons then it is 500 images that will change regularly (e.g. 50 / month) so I need a workflow that is simple and could be automated with Playwright.

Here are some useful articles -

[https://itnext.io/stop-using-ugly-charts-how-to-build-pro-level-diagrams-with-mermaid-js-and-nano-banana-2-f2c96d914350](https://itnext.io/stop-using-ugly-charts-how-to-build-pro-level-diagrams-with-mermaid-js-and-nano-banana-2-f2c96d914350)

[https://medium.com/@ooi_yee_fei/custom-claude-code-skill-auto-generating-updating-architecture-diagrams-with-excalidraw-431022f75a13](https://medium.com/@ooi_yee_fei/custom-claude-code-skill-auto-generating-updating-architecture-diagrams-with-excalidraw-431022f75a13)

After looking at example diagrams I like, maybe we can have 2 or 3 styles and 2 workflows?

---

Raising an Idea

From phone (Linear):

1. Create issue in Linear with the "idea" label
2. Hourly [unified-sync.py](http://unified-sync.py/) runs → bd linear sync --pull imports it into Beads as issue_type=idea
3. Script generates kanban/0_idea/{id}\_{slug}.md automatically
4. You review it next time you're at the desk

From a Claude session: bd create --title="My idea" --description="..." --type=idea Next hourly sync picks it up and generates the kanban file.

Manually: Drop a .md file directly in kanban/0_idea/.

---

Working a Task (Kanban Pipeline)

0_idea/ → review → 1_planning/PROMPT\_\*.md → [run-kanban.sh](http://run-kanban.sh/) → 2_testing/ → [promote.sh](http://promote.sh/) → 3_done/

1. Triage: Read idea in 0_idea/, craft PROMPT\_\*.md in 1_planning/, delete the idea file
2. Execute: bash kanban/run-kanban.sh

- Pre-flight: shows bd stats + bd ready
- If prompt has Beads: beads-xxx reference, Claude auto-claims (bd update --status=in_progress) and closes (bd close) the Beads issue
- Post-run: bd linear sync --push syncs closures back to Linear
- Completed prompts move to 2_testing/

3. Verify on P520 (test server at 192.168.178.50:3001)
4. Promote: bash kanban/promote.sh → deploys to Hetzner prod → moves to 3_done/

- Also runs bd linear sync --push as safety net

---

Checking Status (from phone)

Open Linear — closed Beads issues sync back as "Done" in Linear via the hourly push. You see which ideas have been completed without touching the desktop.

---

Monitoring (Automatic)

Heartbeat ([heartbeat.py](http://heartbeat.py/), hourly at :30):

- Checks unified-sync log freshness (stale if >2h old)
- Checks P520 + Hetzner health endpoints
- Checks Dolt server on port 3307
- Reports Beads stats (open/in-progress/blocked/ready)
- Flags stale in-progress issues (>24h without update)
- Checks 2_testing/ folders across all projects
- Sends Telegram alert only if issues detected (suppresses green heartbeats)

---

Scheduled Tasks

┌─────────────────┬───────────────┬──────────────────────────────────────────────────────────────────────┐ │ Task │ Schedule │ Script │ ├─────────────────┼───────────────┼──────────────────────────────────────────────────────────────────────┤ │ UnifiedSync │ Hourly at :00 │ [unified-sync.py](http://unified-sync.py/) (pull Linear → Beads → kanban files → push closures) │ ├─────────────────┼───────────────┼──────────────────────────────────────────────────────────────────────┤ │ KanbanHeartbeat │ Hourly at :30 │ [heartbeat.py](http://heartbeat.py/) (health checks + Telegram alerts) │ └─────────────────┴───────────────┴──────────────────────────────────────────────────────────────────────┘

---

Graceful Degradation

If Dolt is down (port 3307):

- [unified-sync.py](http://unified-sync.py/) → aborts with log message, no crash
- [run-kanban.sh](http://run-kanban.sh/) → runs without Beads (skips stats, prompt injection, post-sync)
- [promote.sh](http://promote.sh/) → runs without Beads sync
- [heartbeat.py](http://heartbeat.py/) → reports Dolt as FAIL, skips Beads stats

I’ve attached some example diagrams I like:

![image.png](https://uploads.linear.app/f1f00ee6-d251-47ff-a041-aab5fede6832/fe5e99a0-727f-4746-8dfb-b1c0622f4f44/8dc86389-6b05-496b-901e-a6e08515d558)

Prompt: High-quality flat lay photography creating a DIY infographic that simply explains how the water cycle works, arranged on a clean, light gray textured background. The visual story flows from left to right in clear steps. Simple, clean black arrows are hand-drawn onto the background to guide the viewer's eye. The overall mood is educational, modern, and easy to understand. The image is shot from a top-down, bird's-eye view with soft, even lighting that minimizes shadows and keeps the focus on the process.

![Knolling_design_with_Nano_Banana_Pro_63e3dd174d.png](https://uploads.linear.app/f1f00ee6-d251-47ff-a041-aab5fede6832/560f38ac-7572-4abe-8b7f-56212d04a983/66728853-f80f-42b3-a566-06e585f46bbc)

Prompt: “Create a minimal knolling layout of skincare products, arranged in a perfect grid, soft shadows, white background, high-end DTC aesthetic.”

[Post on nanobanana2 and mermaid 2026-03-02_100020.pdf](https://uploads.linear.app/f1f00ee6-d251-47ff-a041-aab5fede6832/be862e92-47ec-447a-ac67-f967f196b57e/0b38380e-4117-4e20-8b46-bccad5d9346d)

![image.png](https://uploads.linear.app/f1f00ee6-d251-47ff-a041-aab5fede6832/8023ad33-f58e-467f-863d-0e0827bfec08/50657034-bf08-441c-b142-177b95de7359)

Excalidraw data flow diagram

---

_Auto-imported from Beads issue GWTH-3rawd4_
