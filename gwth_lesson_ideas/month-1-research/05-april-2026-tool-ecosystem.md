# April 2026 AI Tool Ecosystem for Beginners

*Snapshot compiled 2026-04-20. All prices in USD unless marked; UK users generally pay via card FX (~£0.80/$1).*

Updates the Feb 2026 v2 redesign doc with what actually works, costs and is available as of April 2026. Critical for L3 (toolkit setup), L8 (content), L9 (build), L14 (agents).

## Conversational assistants

| Tool | Models live April 2026 | Pricing (UK approx) | Key beginner feature |
|------|------------------------|---------------------|----------------------|
| **Claude** | Haiku 4.5 / **Sonnet 4.6** / **Opus 4.7** (GA 16 Apr 2026) | Free · Pro $20 (~£16) · Max 5× $100 · Max 20× $200 | Best for building (Artifacts + Projects + Cowork), 1 M-token context |
| **ChatGPT** | GPT-5.3 Instant (free) · GPT-5.4 Thinking · GPT-5.4 Pro | Free · Go $8 · Plus $20 · **Pro $100 NEW** (9 Apr 2026) · Pro $200 | Broadest feature surface: Atlas (macOS only), Codex, Deep Research, Agent |
| **Gemini** | Gemini 3 Pro (Jan 2026) · 3.1 Pro preview | **AI Plus $7.99** · AI Pro $19.99 · AI Ultra $249.99. *Free Pro tier removed 1 Apr 2026* | Deep Google Workspace integration |
| **Perplexity** | Sonar + frontier models via "Model Council" | Free · Pro $20 · Max $200. **Comet browser now FREE worldwide** | Best research with citations |
| **Grok** | Grok 4 / 4.1 Fast / 4.20 Heavy | Free · SuperGrok $30 · Heavy $300. UK via Tesla/X Premium £9.99 | Real-time X integration; less essential for Month 1 |

**Retired:** GPT-4o, GPT-4.1, original GPT-5 — all retired 13 Feb 2026. Don't reference.

## Vibe-coding app builders

| Tool | Pricing | Key feature |
|------|---------|-------------|
| **Claude Artifacts** | Included in Claude Pro/Max | **Persistent storage 20 MB/artifact (NEW 2026)** — real stateful apps, not prototypes |
| **Lovable** | Free 5 msg/day, 30/mo · Pro $25 · Teams $30 for 20 seats | European favourite. Supabase-backed full-stack. 8 M users, $200 M ARR (Nov 2025). 60% non-developers. **UK ≈ 5% of traffic (#2 non-US market)** |
| **Bolt.new** | Token-based from ~$20/mo | Instant in-browser full-stack; token pricing unpredictable |
| **v0 (Vercel)** | Free ($5 credits) · Pro $20/user · Team $30/user | React/Next.js UI gen, deploys to Vercel |
| **Replit Agent** | Core $20–25 · Teams $40. Heavy users hit $100–300/mo | Full-stack with DB + auth one-click |
| **Cursor / Windsurf** | Pro $20 · Ultra $200 | Name-drop only — too advanced for Month 1 |

## Content — images

| Tool | Current version | Pricing | Status |
|------|-----------------|---------|--------|
| **GPT Image 1.5** (in ChatGPT) | 1.5 | Included in Plus+ | **Replaced DALL-E.** DALL-E 3 API deprecated 12 May 2026 |
| **Ideogram** | v3 | ~$0.03–0.05/image; free tier | Best text-in-image (~90% accuracy) |
| **Midjourney** | **V8 (March 2026)** — 5× faster, native 2K | Basic $10 · Standard $30 · Pro $60 · Mega $120. No free tier | Best aesthetic quality. Web + Discord |
| **FLUX 2 / 2 Pro** | Flux 2 (Black Forest Labs) | ~$0.03–0.05/image via fal.ai / Replicate | ~40% API market share — photorealism leader |
| **Adobe Firefly** | Current | CC subscription | Commercial safety for CC users |

## Content — video (IMPORTANT 2026 reality)

- **OpenAI Sora is shutting down 26 April 2026.** App closes, API sunsets 24 Sep 2026. Cited cost: $15 M/day. Codenamed successor "Spud" signalled but not public. **Do not teach Sora.**
- **Google Veo 3.1 / 3.1 Fast / Lite** — only mainstream model with synced audio. Integrated into Gemini app, Flow, Google Vids (from April 2026). In AI Pro $19.99. **Month 1 default.**
- **Runway Gen-4.5** — cinematic control. Standard $12, Pro $76.
- **Kling 3.0** — budget pick, ~$0.50/clip via fal.ai, up to 2-min clips.
- **Seedance 2.0** (ByteDance) — topped 2026 quality benchmarks.

## Content — audio / avatar

- **ElevenLabs v3** — Starter $6, Creator $22, Pro $99. Best TTS; voice cloning with consent. Audiobook Platform launched Feb 2026 (60% royalty + Spotify distribution).
- **Synthesia** (UK-founded) — 70%+ of FTSE 100 use for L&D. Starter ~$22 (10-min cap); Enterprise for translation.
- **HeyGen Avatar IV** — Creator $29 unlimited videos; 175+ languages. UK invoices include VAT.

## Agents

- **Claude Desktop + Cowork** — bundled in Pro/Max. **Plugin marketplace Feb 2026** with 1,000+ skills. **Microsoft 365 connector** (Outlook/SharePoint/OneDrive). Full computer-use since March 2026.
- **Claude Code** — bundled; terminal-based. Max 5× ($100) for heavy agentic coding.
- **Claude for Chrome** — beta **now open to all paid plans**. Chrome/Edge only. **UK/EU Microsoft tenants default-off Claude-in-Copilot** pending DPIA.
- **ChatGPT Agent** — replaces Operator (shut down 31 Aug 2025). Plus/Pro.
- **ChatGPT Atlas** — **macOS only** as of April 2026; Windows/iOS/Android coming. UK Windows users *cannot* use yet.
- **OpenClaw** — 247 k GitHub stars BUT **CVE-2026-25253 (RCE, CVSS 8.8)**, ~35% exposed instances vulnerable, **ClawHavoc incident Jan 2026 — 341 malicious skills**. Palo Alto Networks: *"biggest insider threat of 2026."* **Do not recommend for beginners.**

## Custom assistants / knowledge packs

- **Custom GPTs** — Plus $20; ~20 files/GPT; GPT Store marketplace.
- **Claude Projects** — **Up to 30 MB/file, unlimited files, auto-RAG at 10× capacity.** Biggest jump since Feb 2026.
- **Gemini Gems** — free creation with Gmail; depth on AI Pro. Works inside Gmail/Docs/Drive. No marketplace yet.

## Automation

- **Zapier** — Free 100 tasks; Pro $19.99; Team $69. Zapier Copilot + Agents are $150–200/mo add-ons. Rebranded as "AI Orchestration Platform."
- **Make.com** — **Maia** AI assistant. Cheaper than Zapier at volume.
- **n8n 2.0** — self-host free; Cloud Starter ~$20. Jan 2026: LangChain + 70+ AI nodes. 1 execution = 1 workflow regardless of steps. UK data-sovereignty favourite.
- **Pipedream** — Free 100 credits · Basic $29 · Advanced $79. Skip for Month 1.

## Transcription + meeting AI

- **Whisper** (OpenAI open-source) — free baseline. **Voxtral (Mistral AI)** now beats it on English + multilingual, half the API cost.
- **Otter.ai** — Pro $16.99/user (6,000 min).
- **Fathom** — **free unlimited** recording/transcription personal tier; paid from $50/mo teams.
- **Zoom AI Companion** — bundled in Zoom Workplace from $14.16/user; standalone $8.33.
- **Google Meet AI** — included in AI Pro/Workspace.
- **Microsoft Teams Copilot** — +$30/user on M365. Dominant in UK corporate.

## Research

- **Perplexity Deep Research** — Pro $20 gives 500 runs/mo (most of any provider). Finishes under 3 min, cited.
- **ChatGPT Deep Research** — Plus 25/mo · Pro 250/mo.
- **Claude Research** — Pro+. Runs 5–45 min, 200 K context (1 M beta). Best for deep analytical write-ups.

## What's changed since Feb 2026 that matters for Month 1

**Model releases:** Claude Opus 4.7 (16 Apr 2026), GPT-5.4 family, Gemini 3 Pro/3.1, Midjourney V8, Veo 3.1 Lite.

**Pricing changes:** New ChatGPT Pro $100 tier, new Google AI Plus $7.99, Gemini free Pro tier gone 1 Apr, Windsurf repriced 19 Mar.

**Discontinuations:** Sora (26 Apr), DALL-E 3 API (12 May), GPT-4o/4.1/original GPT-5 (13 Feb), Operator (31 Aug 2025).

**Capability leaps:** Artifacts persistent 20 MB; Projects 30 MB/file + auto-RAG; Cowork plugin marketplace + 1,000+ skills; Perplexity Comet free worldwide; FLUX 2 + Ideogram v3 eclipse DALL-E on APIs.

**Security:** OpenClaw danger level up significantly — pair every mention with a warning.

## UK-specific notes

- All three billed in USD; budget ~5% FX.
- ChatGPT Health UK-excluded (launched 7 Jan 2026 excl. UK/EEA/Switzerland).
- Atlas browser macOS only — UK Windows users need Claude for Chrome instead.
- Teams Copilot dominates UK corporate; worth teaching alongside Zoom.
- Synthesia UK-founded, widely adopted.

## Key URLs

- https://claude.com/pricing
- https://chatgpt.com/pricing/
- https://openai.com/index/introducing-gpt-5-4/
- https://help.openai.com/en/articles/20001152-what-to-know-about-the-sora-discontinuation
- https://gemini.google/subscriptions/
- https://www.perplexity.ai/hub/blog/introducing-comet-plus
- https://openai.com/index/introducing-chatgpt-atlas/
- https://docs.midjourney.com/hc/en-us/articles/27870484040333-Comparing-Midjourney-Plans
- https://elevenlabs.io/pricing
- https://github.com/openclaw/openclaw (caution)
- https://www.similarweb.com/website/lovable.dev/ (UK 4.97% traffic)
- https://wise.com/gb/blog/claude-pricing
