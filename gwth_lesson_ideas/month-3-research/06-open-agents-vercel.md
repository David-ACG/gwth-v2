# Open Agents — Vercel's Reference Platform for Cloud Coding Agents

**Primary source:** Vercel Labs + Guillermo Rauch (CEO, Vercel), launched 2026.
**GitHub:** https://github.com/vercel-labs/open-agents
**Announcement coverage:** https://tessl.io/blog/vercel-open-sources-open-agents-to-help-companies-build-their-own-ai-coding-agents/

## What it is

Open Agents is an open-source reference app for running background coding agents. Guillermo Rauch's pitch: *"A chat takes a prompt, spins up a real machine in the cloud, edits a real Git repo, and opens a real pull request — with no laptop in the loop."*

It is deliberately designed to be **forked and customised**, not used as a black box.

## Three-layer architecture

1. **Web interface.** Auth, sessions, chat UI, streaming output.
2. **Long-running agent workflow.** Durable workflow process; handles reasoning and orchestration. Runs *outside* the sandbox.
3. **Sandboxed execution environment.** A VM with filesystem, shell, Git, dev servers. Isolated and resumable from snapshot.

The agent is *separate* from the sandbox — it calls the sandbox through discrete tools. This means: workflows persist across requests; sandboxes hibernate independently; models are swappable; the VM is "just" an execution layer.

## Why Rauch built it (strategic claim)

> *"Off-the-shelf coding agents don't perform well with huge monorepos. They don't have your institutional knowledge, integrations, and custom workflows."*

Rauch's broader framing: software companies' competitive advantage is shifting from *the code they wrote* to *the means of production of that code — the software factory*.

This mirrors the Ramp Glass argument: in-house AI infrastructure *is* the moat.

## Who's already doing this

- **Stripe** — "Minions", 1,000+ merged PRs/week, 400+ internal tools via MCP.
- **Ramp** — Glass + Dojo + Sensei.
- **Spotify** — internal coding agents.
- **Block** — internal coding agents.

All four have released public write-ups. Open Agents gives everyone else a forking starting point.

## Trade-off (direct quote from the tessl.io coverage)

> *"Building custom systems offers greater control over execution, costs, and model routing, but requires ongoing infrastructure maintenance. Alternatively, platforms like Anthropic's Claude Managed Agents handle orchestration as a hosted service, trading customization for simplicity."*

## Related Vercel moves

- **Agent Skills** (Jan 2026): a package manager for AI coding agent skills — standardising the "skill" primitive that Ramp uses internally.
- Ryan Carson ("code factories"): predicts complete code-factory solutions from all major providers by end of 2026.

## How to use this in GWTH

- **Lesson on buy-vs-build.** The big-company evidence that leading orgs are building internal harnesses, not buying them.
- **Useful even to SMEs** — fork Open Agents rather than build from scratch; the same strategic argument applies at smaller scale.
- **Live example** of what Ch 22 of Rewired ("the art of developing agentic AI solutions") looks like in practice.
- **Good segue to "what does this mean for my IT team?"** — the skill of configuring and maintaining these systems is the new engineering job.

## Sources

- [Open Agents GitHub repo](https://github.com/vercel-labs/open-agents)
- [tessl.io announcement coverage](https://tessl.io/blog/vercel-open-sources-open-agents-to-help-companies-build-their-own-ai-coding-agents/)
- [Product Hunt listing](https://www.producthunt.com/products/open-agents-2)
- [Agent Skills coverage — Indianic signal](https://signal.indianic.com/vercel-debuts-agent-skills-a-strategic-move-to-standardize-the-ai-coding-ecosystem/)
- [Cognitive Revolution — Guillermo Rauch on v0 and software 2.0](https://www.cognitiverevolution.ai/vercel-ceo-guillermo-rauch-on-v0-ai-powered-coding-and-software-2-0/)
- [Guillermo Rauch on LinkedIn](https://www.linkedin.com/in/rauchg/)
