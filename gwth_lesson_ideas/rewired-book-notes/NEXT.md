# Next — how to highlight and what to paste back

Quick handoff notes for David on picking up from this scaffold.

## Highlighting strategy

The scaffold is designed so you can highlight lightly on a first pass and come back to thicken the corpus over time. A realistic first-pass target:

- **Section One (Ch 1–7, roadmap)**: highlight densely. This section is the one that most directly feeds the GWTH course opener. Target 5–10 highlights per chapter.
- **Section Two (Ch 8–11, talent)**: Ch 8 ("tech muscle of business leaders") is the highest-priority chapter in the whole book for GWTH — highlight hard. Ch 11 (agentic talent model) next. Ch 9–10 can be lighter.
- **Section Three (Ch 12–16, operating model)**: Ch 13 ("embedding engineering") is the priority. Ch 14 ("blueprint") and Ch 15 ("transition") can be summary-only unless you're serving enterprise clients.
- **Section Four (Ch 17–23, technology)**: Ch 20 (AI in software) and Ch 22 (building agents) are priorities. Ch 17–19 can be light.
- **Section Five (Ch 24–29, data)**: Ch 29 (proprietary data advantage) and Ch 28 (data protection in LLM world) are priorities. Ch 26 (data products) is the conceptual anchor.
- **Section Six (Ch 30–35, adoption & scaling)**: Ch 30 (make adoption stick) and Ch 33 (midstream adjustments) are priorities.
- **Section Seven (Ch 36–39, case studies)**: highlight numbers, specific organisational moves, and specific "before and after" framings. Skip narrative colour.

## What to paste back

Either format works:

1. **Paste of the notebook page** from `read.amazon.co.uk/notebook`. Select all in the right-hand pane and paste. The typical structure looks like:

   ```
   Chapter 1 — Inspired, aligned, and ready to go

   Highlight (yellow) — Location 145
   [highlight text]

   Note — Location 145
   [your note, if any]

   Highlight (yellow) — Location 189
   [highlight text]
   ```

2. **Email export**. `read.amazon.co.uk/notebook` has an export option (icon top-right on a book's page). It emails you a file. Paste the contents directly.

Either way, include the chapter/section headers if they appear — Claude will use them for the initial per-chapter bucketing.

## What Claude will do with the paste

1. Parse the export into per-chapter groups by Kindle location (using the page-range hints in each chapter file's frontmatter as a rough guide; Kindle locations don't map cleanly to pages, so the bucketing will be verified against the section/chapter headers in the export).
2. For each chapter file:
   - Fill the `kindle_locations:` frontmatter field with the range of locations highlighted in that chapter.
   - Write a 3–5 sentence paraphrased summary based on the highlights.
   - List key frameworks/concepts surfaced by the highlights.
   - Quote verbatim passages (under ~25 words, blockquoted, location-attributed, `[verify]` where uncertain).
   - Sharpen the GWTH course application notes.
   - Resolve any `[TODO-VERIFY]` markers that the highlights settle.
3. Update `INDEX.md` workflow log with a summary of what changed.
4. Rebuild any capability files where a cross-cutting theme has emerged.
5. Report back: where highlights were sparse and a `[TODO-HIGHLIGHT]` marker was added to prompt a second pass.

## Lightweight first pass is fine

You don't need to highlight the whole book before pasting. Paste whatever you have. Claude will fill the chapters you've highlighted and leave `[TODO-HIGHLIGHT]` markers on the rest. You can paste a second export later to top up.

## Tracking changes between sessions

If you paste multiple exports over time, Claude will preserve prior content rather than overwrite. New highlights are additive; summaries get re-written with the larger sample. The workflow log in `INDEX.md` will record each paste-in pass.

## One ask before the first paste

Two things worth confirming so the first pass is accurate:

1. **Which edition are your Kindle Locations from?** The scaffold assumes the 2nd edition (ISBN 9781394381906). If your Kindle copy is somehow the 1st edition, the scaffold will need to be rebuilt against different chapter numbering.
2. **Do you want the four case studies (Ch 36–39) treated as chapter-level files or bundled into a single "case studies" file?** The scaffold currently gives each its own file because each is 10–14 pages long and covers distinct capabilities — but that's a call you may want to revisit once you're deep in them.
