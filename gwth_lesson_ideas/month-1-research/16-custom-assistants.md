# Custom Assistants — Custom GPTs + Claude Projects (L15)

## What these are

**Custom GPTs** (ChatGPT) and **Claude Projects** (Claude) let you build a domain-specific AI assistant with:
- Uploaded reference documents (the "knowledge pack").
- Persistent **system instructions** defining behaviour.
- Consistent replies across sessions.

Gemini has **Gems** as a lighter equivalent; no marketplace yet.

## April 2026 capability deltas to teach

| Capability | Custom GPT | Claude Project (2026) |
|------------|------------|------------------------|
| File size | ~20 files, ~512 MB total | **30 MB per file, unlimited files** |
| Retrieval | Built-in RAG | **Auto-RAG at 10× capacity** |
| Pricing | ChatGPT Plus $20/mo | Claude Pro $20/mo |
| Marketplace | Yes (GPT Store) | Shareable with team |
| System prompt | Yes | Yes (richer) |

Claude Projects is the biggest 2026 jump — it went from "works on 10 PDFs" to "works on your whole company handbook."

## What a good system prompt contains

- **Role** (who this assistant is).
- **Context** (what domain / audience).
- **Rules** (British English; never invent citations; always flag uncertainty; format requirements).
- **Style** (tone, length defaults, formatting defaults).
- **Boundaries** (what it will NOT do).
- **Known facts** (the knowledge-pack summary it should rely on).
- **Examples** (few-shot, if quality matters).

Aim for ≥ 300 words. Students test with 10 real queries and iterate.

## UK examples (from Month 1 research brief)

- **Illuminate AI** (illuminateai.co.uk) — public walk-through of their Custom GPTs.
- **Writearm** (writearm.co.uk) — UK copywriting consultancy; published why UK SMEs should build their own.
- **e-innovate.co.uk** — UK directory "Best Custom GPT Software 2026".
- UK solicitors using Custom GPTs on firm case-law notes.
- UK parents building GCSE/A-level tutor bots.
- UK charities building volunteer-onboarding bots.
- UK GPs experimenting with patient-facing Claude Projects for admin (within ICO rules).

## Global asset worth sharing

- **OpenAI Academy — *Four GPT templates for small businesses*** (5 March 2026). Free, downloadable, UK-usable.
- Reported productivity uplift for UK sales teams using Custom GPTs: **40% faster proposal creation** (unverified in UK specifically — flag as indicative).

## L15 build — My Personal AI Assistant

- Clear role (tutor, advisor, coach, domain expert).
- At least 3 uploaded reference documents.
- System prompt ≥ 300 words.
- Handles ≥ 5 different question types reliably.
- Tested with 10 real queries; results documented in the Tool Log.

## Why this matters for the capstone

The Family Bot processing engine is, in effect, a Claude Project (or Custom GPT) with the extraction prompt as its system prompt. L15 is the dress rehearsal for L17–L19.

## Key URLs

- https://support.claude.com/en/articles/9517075-what-are-projects
- https://help.openai.com/en/articles/8554397-creating-a-gpt
- https://gemini.google/plans/gems/
- https://launchcodex.com/blog/llms-ai-agents-tools/gemini-gems-vs-custom-gpts/
- https://learnprompting.org/blog/custom-gpts-vs-gemini-gems
- https://illuminateai.co.uk/why-i-built-my-own-custom-gpts-and-why-you-should-too/
- https://www.writearm.co.uk/news/custom-gpts-why-you-need-them-and-how-to-create-them/
- https://www.e-innovate.co.uk/the-best-custom-gpt-software-for-businesses-in-2026/
