# Agents — April 2026 Snapshot for Beginners

Research spine for L14. Critical: April 2026 is a volatile moment for agent security — pair every tool mention with the right caveat.

## What's an "agent" (beginner definition)

Software that **takes actions on your behalf**, not just answers questions. The spectrum:

| Level | Example | Month 1 relevance |
|-------|---------|-------------------|
| **One-off task** | "Summarise these 10 PDFs" | L14 first agent task |
| **Scheduled** | Run every Sunday at 7 pm | L16 automations, L19 family bot distribution |
| **Always-on** | OpenClaw bot listening on WhatsApp | Mentioned, not hands-on for beginners |

## April 2026 agent lineup

### Safe defaults (recommend these)

**Claude Desktop + Cowork**
- Bundled in Claude Pro ($20/£16) and Max tiers.
- Models: Sonnet 4.6 / Opus 4.7.
- **Plugin marketplace launched Feb 2026** with 1,000+ skills. Sales, legal, finance, marketing verticals.
- **Microsoft 365 connector** (Outlook, SharePoint, OneDrive).
- **Full computer-use capability since March 2026.**
- Anthropic's Felix Rieseberg: Cowork itself was *"built almost entirely by Claude Code in ~1.5 weeks."*
- Sandboxed VM — safer than open agents.
- **Our Month 1 default.**

**Claude Code**
- Terminal-based agent. $1 B+ ARR on its own.
- Bundled in Pro/Max; Max 5× ($100) is where heavy use sits (88 k tokens / 5 h; Max 20× ≈ 220 k).
- Name-drop only for Month 1 beginners — comes back in Month 2.

**Claude for Chrome**
- Browser-context agent. **Now open to all paid plans** (Pro / Max / Team / Enterprise).
- Chrome + Edge only (not Brave / Arc).
- **UK/EU Microsoft tenancies get Claude-in-Copilot off by default** pending DPIA sign-off.
- Good beginner-friendly introduction to browser automation.

**ChatGPT Agent**
- Replaces Operator (shut 31 Aug 2025). Plus/Pro.
- Books flights, fills forms, researches products.
- Works today on all platforms.

**Zapier AI Agents** and **Make.com Maia**
- Light agentic add-ons to familiar automation tools.
- Covered in L16 rather than L14.

### Use carefully

**ChatGPT Atlas**
- OpenAI's AI-native browser (Agent Mode, browser memories).
- **macOS only as of April 2026.** Windows / iOS / Android "coming soon."
- **UK Windows users CANNOT use Atlas yet** — use Claude for Chrome instead.

### Avoid for beginners

**OpenClaw**
- Open-source, 247 k GitHub stars.
- Connects WhatsApp / Telegram / Signal / iMessage.
- **SECURITY WARNINGS (April 2026):**
  - **CVE-2026-25253** — one-click RCE, **CVSS 8.8**.
  - **CVE-2026-32922** — privilege escalation, **CVSS 9.9** (per ARMO).
  - **~35% of internet-exposed OpenClaw instances vulnerable** (SecurityScorecard Feb 2026).
  - **ClawHavoc incident January 2026:** 341 malicious skills distributed via the ClawHub marketplace.
  - **Palo Alto Networks:** *"the biggest insider threat of 2026."*
  - **Microsoft** published guidance on *"running OpenClaw safely — identity isolation, runtime risk."*
  - **Gary Marcus** publicly warned non-technical users away.
- **Month 1 position:** mention it briefly as "the open-source alternative, with serious caveats." Do not run hands-on exercises on OpenClaw. Revisit in Month 2 with the hardened configuration lesson.

## Applied concepts to install

- **Sandboxing.** Cowork runs in a VM — an agent's actions are contained. OpenClaw skills run on your real machine with your real permissions. That's the difference.
- **Scheduled vs triggered.** Cron runs at a time; webhooks run when something happens. Agents do both.
- **Observability.** Can you see what your agent did? Cowork logs every action. OpenClaw logs depend on configuration. If you can't see it, you can't trust it.
- **The UK tenancy default-off reality.** Microsoft 365 tenants in UK/EU get Claude-in-Copilot off by default — this isn't a bug, it's ICO compliance.

## L14 build — First Agent Task

Use Claude Cowork (or ChatGPT Agent as fallback) to do *one* of:

1. **Organise a folder** — rename, sort, move files by date or topic.
2. **Process a batch** — summarise 10 PDFs into a single report.
3. **Templated documents** — 10 personalised cover letters from a CSV.

The point is the "wow" of watching AI do work autonomously on the student's machine. It's also the psychological bridge to the capstone: *"if it can organise my Downloads folder, it can run my weekly family meeting."*

## Key URLs

- https://support.claude.com/en/articles/13345190-getting-started-with-cowork
- https://claude.com/plugins
- https://claude.com/blog/cowork-plugins
- https://claude.com/chrome
- https://support.claude.com/en/articles/12012173-get-started-with-claude-in-chrome
- https://www.cnbc.com/2026/03/24/anthropic-claude-ai-agent-use-computer-finish-tasks.html
- https://www.datacamp.com/tutorial/claude-cowork-tutorial
- https://openai.com/index/introducing-chatgpt-atlas/
- https://chatgpt.com/atlas/
- https://help.openai.com/en/articles/12591856-chatgpt-atlas-release-notes
- https://www.sangfor.com/blog/cybersecurity/openclaw-ai-agent-security-risks-2026
- https://www.armosec.io/blog/cve-2026-32922-openclaw-privilege-escalation-cloud-security/
- https://www.microsoft.com/en-us/security/blog/2026/02/19/running-openclaw-safely-identity-isolation-runtime-risk/
- https://cdn.openai.com/business-guides-and-resources/a-practical-guide-to-building-agents.pdf
