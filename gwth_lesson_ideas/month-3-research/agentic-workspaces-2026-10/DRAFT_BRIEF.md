# Draft brief: Month 3 Lesson 13, "Your Company's AI Workspace - What A Rollout Really Takes"

Requested by David (course founder), 2026-10-10, in his words: "I'd like to add a new lesson in month three for
tools like Amazon's Quick. Please research all the alternatives for Quick, such as Copilot, and maybe OpenClaw and
Hermes. Although I'm not sure they're ready for businesses and enterprises yet. However, I have heard that Hermes is
about to release an enterprise plan. I've been using Quick for quite a while and found it extremely useful, but that
could be because it's been set up so well. I'm not sure how a vanilla install in a medium-sized company would work."
And later: "Don't just look at copilot and quick - find other competitors and compare them."

## Decisions David made (binding)

1. Core lesson, Month 3 position 13, straight after Lesson 12 "Workflow Redesign With Agents" and before
   Lesson 14 "Your AI Garage - Premium Models and Multi-Model Workflows". Lesson 15 is "Adoption That Sticks".
   Lesson 11 is "Enterprise Economics - ROI, Cost, And The AI P&L".
2. Vendor-neutral, with Amazon Quick as the running worked example of what "well set up" means (curated Spaces,
   permission tests, flows, an owner). Start the choice from the company's existing ecosystem (Microsoft, Google,
   AWS, or app-centric). Keep the comparison strictly fair: Quick is the example, not the winner.
3. Compare MANY competitors, not just Quick and Copilot. Use the categories from research D.
4. Project = "AI Workspace Decision Pack", decision pack ONLY (no trial account or tool needed): the learner scores
   a shortlist against their own organisation (ecosystem, data, risk, cost for their headcount), picks one, and writes
   a one-page recommendation plus a 90-day pilot plan. Every learner must be able to do it whatever their employer
   allows.
5. Cover OpenClaw and Hermes Agent honestly: what they are, the security record, the September 2026 enterprise
   offerings, and the verdict (good for a bounded IT-led pilot on non-sensitive data, not a governed company rollout yet).

## Read first

- Research (the factual base; every fact you use must come from here, keep the dates):
  `/home/david/projects/GWTH_V2/gwth_lesson_ideas/month-3-research/agentic-workspaces-2026-10/`
  A_amazon_quick.md, B_alternatives.md, C_openclaw_hermes.md, D_landscape.md
- Voice: `/home/david/projects/GWTH-launch-plan/.agents/skills/gwth-public-writing/SKILL.md` (binding)
- House format, read in full as the model to match:
  `~/gwth-dashboard/generated_lessons/m3_l12_workflow_redesign_with_agents_humans_tools_and_new_operating_models/content/`
  lesson.md, project.md, qna.json
- Skim for links into the course: m3_l11_* lesson.md (economics), m3_l14_adoption_* lesson.md (adoption),
  m3_l06_consent_trust_and_uk_ai_governance lesson.md (lethal trifecta, permissions), m3_l23_public_sector_procurement_and_vendor_risk lesson.md.

## What to write

Write three files into
`~/gwth-dashboard/generated_lessons/m3_l13_your_company_s_ai_workspace_what_a_rollout_really_takes/content/`:

1. `lesson.candidate.md`, about 6,000 to 7,500 words, same section pattern as m3_l12 (Hook; What you will be able to
   do by the end; Where this sits in the course; Core concepts in plain English; the main teaching sections; a guided
   activity; The project; The privacy line; Recap; The bridge: what's next). Must teach:
   - What an "AI workspace" is (chat over company knowledge + research + agents/automations across apps) and why
     it is different from a personal chatbot. Plain English for every term (connector, index, permissions/ACL,
     agent-hours, MCP, data residency).
   - The categories (from D) with the main names in each, and when to look at each category.
   - Amazon Quick as the worked example: its parts, what it costs (dated), and the honest core lesson: buying licences
     fills nothing; the useful version comes from curated knowledge, tested permissions, bounded actions, cost
     controls and an owner. Make the "vanilla versus well set up" contrast concrete and vivid (week 1 of a vanilla
     rollout vs the same tool after setup).
   - The mainstream alternatives (Copilot incl. free Copilot Chat, Gemini, ChatGPT, Claude, Glean) and the
     mid-market/European ones worth piloting (Dust, Langdock, Mistral, Cohere North etc.), fairly.
   - OpenClaw and Hermes Agent: honest readiness verdict.
   - A master comparison table (keep it to the 10 to 14 most relevant products; columns that a non-technical
     reader understands; prices dated October 2026 and in USD unless a GBP price was found).
   - "Start from your ecosystem" decision guide, the shortlist recipe (30 names to 3), and the pilot method:
     same tasks across 3 candidates, measure accepted outputs, total cost and admin time.
   - Real costs for a 300-person company with the arithmetic (Quick $20/$40 + $250 account; usage charges
     elsewhere), linking to Lesson 11's economics.
   - UK specifics: UK storage is not UK processing; UK government Copilot evidence (HMRC July 2026 etc.).
   - Risks: oversharing through existing permissions, prompt injection through connectors (link to the lethal
     trifecta from Lesson 6), agent sprawl, cost creep, licence wastage.
   - Dating: say clearly that prices and product names are as of October 2026 and teach the learner how to
     re-check them (vendor pricing page, release notes), because this market changes monthly.
   Cross-references to other lessons use the existing style ("Month 3 Lesson 11"). Do NOT invent numbers,
   customer names or quotes not in the research. No em dashes, en dashes or section signs anywhere. British English.
   David's own experience may be mentioned only in the general form "people who use a well set-up Quick
   instance find it extremely useful", never as a named endorsement or invented quote.
2. `project.candidate.md`, same structure as m3_l12 project.md (artefact; privacy and workplace guardrails;
   step-by-step; copy/paste template; worked example for a fictional 300-person UK company; "what good looks like"
   checklist). The decision pack: context about the organisation, shortlist from 30 to 3 with reasons, a weighted
   scorecard, cost model for their headcount with arithmetic, data/permissions readiness check, risks, a one-page
   recommendation, a 90-day pilot plan with measures and a stop/go point. No tool access needed.
3. `qna.candidate.json`: exactly 3 questions in the same JSON shape as m3_l12's qna.json, ids "M3L13_q1".."q3",
   testing understanding (the vanilla vs set-up point; storage vs processing; choosing from ecosystem / pilot
   method), with explanations that teach.

Then self-check: grep the three files for "—", "–", "§" and fix any; confirm every price/date matches the research.
Report back: word counts, the list of sections, any fact you could not source and left out.
Do not edit any other file, do not commit.
