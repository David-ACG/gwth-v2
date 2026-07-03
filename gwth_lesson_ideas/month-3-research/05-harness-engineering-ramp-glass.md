# Harness Engineering & Ramp's Glass

**Primary sources:**
- Seb Goddijn (Ramp), internal-AI lead — essay on Glass ("The models are good enough; the harness isn't.").
- Eric Glyman (Ramp co-founder), [tweet summary](https://x.com/eglyman/status/2043362828178841860).
- OpenAI, [Harness engineering: leveraging Codex in an agent-first world](https://openai.com/index/harness-engineering/).
- Mitchell Hashimoto, *The Emerging "Harness Engineering" Playbook* — [ignorance.ai](https://www.ignorance.ai/p/the-emerging-harness-engineering).
- Department of Product, [How to Build Powerful Internal AI Productivity Tools](https://departmentofproduct.substack.com/p/how-to-build-powerful-internal-ai).

## What harness engineering is

A *harness* is everything around the AI agent: context delivery, tool interfaces, planning artefacts, verification loops, memory systems, sandboxes. The model is the engine; the harness is the chassis and the steering. In 2026 the model is rarely the bottleneck — the harness is.

Mitchell Hashimoto: *"Anytime you find an agent makes a mistake, you take the time to engineer a solution such that the agent never makes that mistake again."*

## The four harness primitives (from multiple sources)

1. **Architecture as guardrails.** Enforced layering, linters, dependency rules — agents can only edit inside sanctioned boundaries.
2. **Tools as foundation and feedback.** Agents need the same tools as humans. Stripe's Minions expose 400+ internal tools via MCP.
3. **Documentation as system of record.** `AGENTS.md` and skill files evolve every time an agent trips on something.
4. **Planning before execution.** Decompose the task (sometimes 200+ items) *before* generating code.

## Ramp's Glass — the organisation-level harness

Glass is Ramp's internal AI productivity platform. Eric Glyman's tweet frames the problem:

> *"99% of Ramp uses AI daily. But we noticed most people were stuck — not because the models weren't good enough, but because the setup was too painful and unintuitive for most. Terminal configs, MCP servers, everyone figuring it out alone. So we built Glass."*

### Design principles

1. **Don't limit anyone's upside.** No dumbed-down UIs for non-technical staff. Everyone gets the full Ferrari; the harness makes complexity invisible, not absent.
2. **One person's breakthrough should become everyone's baseline.** Workflows are packaged as skills and shared.
3. **The product is the enablement.** No training sessions — Glass itself nudges users to the right skill at the right moment.
4. **Everything connects on day one.** Single sign-on, pre-wired integrations, auto-provisioned context.

### Key components

- **Skills library.** Markdown files that teach the agent how to perform a specific task. **350+ skills** shared internally at Ramp.
- **Dojo.** The internal marketplace — employees publish skills, others discover them.
- **Sensei.** An in-AI guide that surfaces the 5 most relevant skills to each user on day one, based on role, tools, and active work.
- **Memory system.** Every 24 hours, a synthesis pipeline mines Slack, Notion, Linear, Calendar to build fresh per-user context.
- **Scheduled automations.** Cron-style triggers that post to Slack without the user being at the device.

## Why Ramp built it in-house (Seb's argument)

Relevant for any GWTH participant deciding buy-vs-build:

1. **Internal productivity is a moat.** Handing it to a vendor hands the moat to the vendor.
2. **Speed.** Own the tool, fix bugs the same day. No vendor roadmap.
3. **Dogfooding.** Ramp ships AI products externally. Building Glass gives them reps on the hardest AI product problems.

## The deeper claim — raise the floor, don't lower the ceiling

> *"We don't believe in lowering the ceiling. We believe in raising the floor."* — Seb Goddijn.

This is a direct challenge to the prevailing "tier your users" mental model (chat users / co-work users / superstar coders). At Ramp, anyone can be a superuser if the harness does the heavy lifting.

## How to use this in GWTH

- **The central case study for Month 3.** Week on "institutional AI in practice" builds around Ramp Glass.
- **Challenges a comforting lie.** SME leaders assume their non-technical staff can't use advanced AI. Ramp's evidence says otherwise — given the right harness.
- **Buy vs build framework.** Seb's three reasons are a ready-made decision rubric.
- **Artefact downloads.** "What's in a Glass-like internal platform?" as a one-pager participants can take to their own IT/ops teams.

## Sources

- [Eric Glyman's announcement tweet](https://x.com/eglyman/status/2043362828178841860)
- [Shane Buchan's follow-up on how Glass was built](https://x.com/buchan_sm/status/2044526740299526511)
- [How to Build Powerful Internal AI Productivity Tools — Department of Product](https://departmentofproduct.substack.com/p/how-to-build-powerful-internal-ai)
- [The Emerging Harness Engineering Playbook — ignorance.ai](https://www.ignorance.ai/p/the-emerging-harness-engineering)
- [Harness engineering — OpenAI](https://openai.com/index/harness-engineering/)
- [Complete Guide to Harness Engineering — QubitTool](https://qubittool.com/blog/harness-engineering-complete-guide)
- [awesome-harness-engineering — GitHub](https://github.com/ai-boost/awesome-harness-engineering)
