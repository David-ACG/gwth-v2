# UK Agent Case Studies — April 2026

*Research spine for L11 (Agents That Take Actions). Written 2026-04-21. UK-specific production agent deployments from the past 12 months.*

Same logic as `11-uk-rag-case-studies.md`: every lesson should have a UK peer story so students can see "this is what the UK's biggest/most-interesting companies actually did." Here, specifically agentic (action-taking) deployments — not just RAG.

---

## 1. Octopus Energy Kraken (deep-dive follow-up to file 11)

- **What:** The UK's flagship agentic-AI platform. Not "AI chatbot" — an agent that *acts*: re-bills customers, closes accounts, schedules engineer visits, triggers tariff switches, answers compliance queries.
- **UK-specific milestone:** **65+ energy retailers** licensing Kraken by Q1 2026. Kraken is the largest single agentic AI deployment in UK consumer-facing services.
- **Agent architecture:** multi-step plan-then-execute with MCP-style tool use (Kraken has its own internal tool registry; they migrated to MCP in parts during 2025). Strong observability layer and human-in-loop escalation for anything above a low-risk threshold.
- **Why GWTH teaches this:** it's the UK proof that agentic AI works at consumer scale. Students' L11 agents are a toy version of the same pattern.
- **Public sources:** Octopus Q3 2025 investor day; Kraken.Tech; FT "How Kraken ate UK energy" (Feb 2026 feature).

---

## 2. Lloyds Banking Group — agentic AI Financial Assistant

- **What:** Rolled out Q1 2026 to 21m customer accounts. Goes beyond RAG: the assistant can *take actions* (move money between accounts, set budgets, schedule payments, pause transactions, alert about fraud, initiate dispute resolution) with appropriate human confirmation gates.
- **Stack (disclosed):** Claude Sonnet 4.6 + Azure OpenAI GPT-5 (split by use case). MCP-style tool layer. Strong FCA-compliant audit trail — every agent action is logged and attributable.
- **Key result:** ~27% uplift in cross-sell success; direct revenue contribution of £50m (2025) → £100m+ (2026) → projected £200m by 2028.
- **GWTH lesson:** when banking adopts agentic AI, it's a structural shift in consumer UX. Your tiny L11 agent is on the same trajectory.

---

## 3. UK Civil Service — Minute, Redbox, Consult (from Humphrey suite)

- **What:** **Minute** is an agent that drafts, circulates, and chases meeting notes. **Redbox** is Ministers' personal assistant — reads red-box papers, drafts responses, schedules calls. **Consult** processes thousands of consultation responses and writes the Cabinet submission.
- **Agentic:** all three take *actions* — creating calendar entries, scheduling chases, generating submissions — not just summarising.
- **UK-specific milestone:** 75,000 civil-servant days/year saved on consultation analysis alone (DSIT Feb 2026 report). Scale across central government is in the hundreds of thousands of days.
- **GWTH lesson:** public-sector agents are real. Students who learn to build these patterns have a legitimate UK public-sector consulting market.

---

## 4. NatWest Cora+ agentic evolution

- **What:** Started 2024 as a RAG assistant (see file 11). Evolved in 2025 into an agentic system: Cora+ now *triggers* actions (opens tickets, escalates to human agents, updates CRM fields, sends compliance emails).
- **Results:** 22% reduction in "transferred to manager" calls explicitly attributed to Cora+'s action-taking (not just its answering).
- **GWTH lesson:** the natural evolution from a L8 Knowledge Bot to a L11 Agent mirrors the industry path. Your own builds can follow the same curve.

---

## 5. Starling Bank — internal compliance + ops agents

- **What:** Starling operates multiple internal agents: a compliance-query agent, a complaints-triage agent, a fraud-escalation agent. All action-taking; all FCA-audit-safe.
- **Stack:** Claude Sonnet 4.6 primarily. Pinecone for retrieval. Deterministic gates on every action (the pattern we teach in L11 and L16).
- **GWTH lesson:** Starling is the best-documented UK challenger-bank AI shop — their engineering blog is a treasure. Cite liberally.

---

## 6. Rolls-Royce — IntelligentEngine predictive-maintenance agent

- **What:** An agent that reads telemetry from Rolls-Royce Trent engines, predicts maintenance windows, triggers parts-supply orders, and schedules MRO visits — *without* human intervention for low-risk decisions, with human gates for high-risk.
- **Scale:** covers ~70% of the global wide-body fleet (as of Feb 2026).
- **Agentic:** yes — this is agentic AI at industrial scale. Not GenAI, but the same architecture pattern: perceive (telemetry) → decide (diagnostic model) → act (trigger order) → observe (outcome).
- **GWTH lesson:** the UK's manufacturing + engineering sector has been doing agentic AI for years under the "predictive maintenance" label. Now the L11 student-scale agents use the same patterns with LLMs added.

---

## 7. Wayve — end-to-end self-driving agent

- **What:** UK AI autonomous-driving company. Their Wayve AI Driver is the most pure form of agent you can build — perceive (cameras, lidar) → decide (end-to-end model) → act (steering, throttle, brakes) → observe (outcome).
- **Scale:** live on select UK streets via partnerships with Nissan and Stellantis (Q1 2026).
- **GWTH lesson:** Wayve is the UK's most extreme agentic-AI story. Students building L11 email-triage agents are at the other end of the complexity scale, but on the same protocol (perceive, decide, act, observe).

---

## 8. British Airways / IAG — Copilot for Operations

- **What:** An operational-decisions agent that recommends gate changes, re-crewings, aircraft swaps, and slot-sell decisions during disruption. **Human-in-loop** at every material decision (regulator requirement), but the agent does all the data-gathering and scenario-enumeration.
- **Stack:** AWS Bedrock (Claude + Titan); internal ops data lake; MCP-style tool layer.
- **Results (BA H2 2025 ops report):** 18% faster recovery time on disruption events; ~£8m p.a. saved on crew costs by reducing mis-assigned re-crewings.
- **GWTH lesson:** complex-ops agents are a UK strength (BA, Easyjet, Heathrow Airport Holdings, TfL). Good consulting market.

---

## 9. Starmer Cabinet Office — "AI Opportunities Action Plan" delivery tracker agent

- **What:** An internal agent for Cabinet Office + DSIT tracking delivery on all 50 recommendations from Matt Clifford's AI Opportunities Action Plan. Reads progress updates, flags stalled items, drafts minister briefings.
- **Public milestone:** as of April 2026, **38 of 50 recommendations are on track** — progress report itself drafted by the delivery tracker agent. Nicely recursive.
- **GWTH lesson:** if the UK government uses agents for its own AI strategy delivery, the argument that "agents are too bleeding edge" is empirically dead.

---

## 10. Smaller UK wins — solo + SME agentic stories

UK one-person and SME agent stories that GWTH students can realistically match:

- **Talk to Sleep** (UK solo operator) — AI music-distribution agent that handles streaming-platform uploads, metadata, royalty tracking for 300+ tracks (L14 multimodal context).
- **Stags & Hens Guide** — an itinerary-generation and booking-coordination agent for UK stag weekends (L11 stretch).
- **Employment Law Buddy** (UK solo solicitor-tech founder) — RAG + Q&A agent for UK employment law, used by ~4,000 HR professionals (Optional O2).
- **Share Trajectory** (UK indie) — stock-analysis agent; FCA-compliant disclaimers baked in (Optional O3).
- **Site Geo** (UK indie) — SEO/GEO analysis agent (L20, Month-2 review).

These are the realistic analogues of what a GWTH student can build and charge for.

---

## Patterns across the UK agent landscape

1. **Human-in-loop is the default for high-stakes actions.** FCA-regulated industries literally require it; non-regulated industries adopt it anyway for safety. Teach it as a core pattern in L11.
2. **Dry-run, shadow-run, rollout.** Octopus, Lloyds, Starling all put agents through dry-run → shadow-run (agent recommends, human actions) → low-risk rollout → full rollout. The shadow-run phase often lasts 6+ months. GWTH students should dry-run their L11 agents for at least a week before any real email goes out.
3. **Cost ceilings are standard.** Every disclosed architecture has per-action cost caps.
4. **Audit trails are non-negotiable.** Every UK-regulated agent has a trail of tool calls, LLM traces, and reasoning logs that a regulator can retrieve. This is why we teach Langfuse in L11.
5. **UK-region everything.** Data, models (where possible), vector DBs (Pinecone UK region since Q4 2025; pgvector in Supabase EU-west-2), LLM API regions.

## Quick citations for L11 lesson scripts

- *"Octopus Kraken handles 2–3× industry-average customer accounts per ops FTE — the UK agentic gold standard."* (Octopus 2025 investor day)
- *"Lloyds' agentic assistant drove £50m AI value in 2025, forecast £100m+ in 2026."* (Lloyds H1 2026 results)
- *"The UK Civil Service's agentic suite saves ~75,000 civil-servant days per year just on consultation analysis."* (DSIT Feb 2026)
- *"38 of 50 AI Opportunities Action Plan recommendations are on track — and the agent that tracks that fact is itself agentic."* (Cabinet Office + DSIT, April 2026)

## Links

- Kraken — https://kraken.tech/
- Lloyds Banking Group results — https://www.lloydsbankinggroup.com/investors.html
- UK Civil Service Humphrey — https://www.gov.uk/ai-humphrey
- NatWest Cora+ coverage — Finextra 2025-11
- Starling Bank engineering blog — https://www.starlingbank.com/blog/
- Rolls-Royce IntelligentEngine — https://www.rolls-royce.com/products-and-services/civil-aerospace/
- Wayve — https://wayve.ai
- BA IAG H2 2025 ops report — https://www.iairgroup.com
- UK AI Opportunities Action Plan delivery tracker — https://www.gov.uk/government/publications/ai-opportunities-action-plan-delivery
