# Data Analysis for Non-Coders (L12, L13)

## The core beginner move: upload-and-ask

Drag a CSV / XLSX / PDF / screenshot into Claude or ChatGPT. Ask in plain English:

- *"What are my top 5 expenses?"*
- *"Show me trends over the last 6 months."*
- *"Which products are most profitable?"*
- *"This spreadsheet is a mess — clean it up."*

Both Claude (Sonnet 4.6 / Opus 4.7) and ChatGPT (GPT-5.4) handle this well in April 2026. ChatGPT uses a secure Python sandbox (Code Interpreter / Advanced Data Analysis); Claude uses its Analysis tool.

## Applied concept — structured vs unstructured data

- **Structured:** rows and columns (spreadsheets, CSVs).
- **Unstructured:** plain text (transcripts, emails, reports).
- *AI can convert one to the other.*

This is the **foundation of the Family AI Bot**: a meeting transcript (unstructured) → tasks / events / meals / shopping (structured). The insight lands in L12 and pays off in L18.

## UK banking CSV exports that work

- **Starling** — full CSV export via app/web.
- **Monzo** — full CSV export.
- **Revolut** — CSV export.
- **Barclays / NatWest / HSBC / Lloyds** — CSV export (vary in cleanliness; AI handles).

## Dashboard building — combining primitives (L13)

Building + Data Analysis = interactive dashboards. Neither alone produces one this good. The core GWTH insight.

### What makes a portfolio-worthy dashboard

- At least 3 chart types (bar, line, pie; or heatmap; or scatter).
- At least 1 filter or tab.
- Clean design (AI handles this for free).
- At least one insight a spreadsheet wouldn't surface.

## UK tools

- **Claude for Excel** (Microsoft Office add-in, 2025–26). Reads the whole workbook, understands cell relationships, edits directly. Requires Claude Pro ($20/£16). UK SMEs building 3-statement models, DCF, SaaS dashboards from natural language.
- **Gemini in Google Sheets** — free with Workspace; built-in charts and formulas from prompts.
- **ChatGPT Advanced Data Analysis** — Plus $20/mo.
- **Power BI + ChatGPT** — UK corporate pattern; The Data School UK documents this.

## Suggested L12 build — Personal Finance Analysis

Using a bank CSV (or sample we provide):
- Top 5 spending categories.
- Trend over 6 months.
- Surprising pattern (hidden subscription, creeping delivery spend).
- Three specific recommendations.
- At least two charts.
- **Must reveal something you didn't already know.**

## Suggested L13 build — My Dashboard

From L12's data, build an interactive dashboard in Claude Artifacts (with persistent storage — it remembers the data). 3+ chart types, 1+ filter, one non-obvious insight.

## UK public datasets for practice

- **ONS** (Office for National Statistics).
- **UK Gov** datasets.
- **TfL** open data.
- **NHS Digital** open data.

## Key URLs

- https://platform.openai.com/docs/guides/data-analysis
- https://aitoolsreview.co.uk/insights/claude-for-excel
- https://www.veritly.co.uk/blog/post/chatgpt-for-excel-analysts-practical-guide
- https://www.csl-uk.com/future-of-ai-and-dashboards/
- https://support.claude.com/en/articles/9487310-what-are-artifacts-and-how-do-i-use-them
