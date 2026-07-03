# Modern Prompting Fundamentals (Beginner Layer)

Anthropic's and OpenAI's current official guidance (Claude Opus 4.7 docs, GPT-5 Prompting Guide) converge on the same beginner skeleton. The labels differ; the substance is identical. This file is the research spine for L4.

## The 5 elements to teach (RCTFC)

| Element | What it answers | Example |
|---------|-----------------|---------|
| **Role** | Who should the AI be? | "You are a senior copywriter who writes for UK small businesses." |
| **Context** | What background does it need? | "I run a 4-person dental practice in Leeds. Patients 35–65." |
| **Task** | What exactly do you want? | "Write 3 subject lines for a reminder email about overdue check-ups." |
| **Format** | How should the answer look? | "Bullet list. Each line under 60 characters." |
| **Constraints** | What to avoid or include | "No exclamation marks. Don't sound pushy." |

OpenAI's GPT-5 guide calls it **CTCO** (Context · Task · Constraints · Output). Anthropic calls out the same four: task context, background data, detailed task, output format, and adds that *"role prompting via a system message is one of the most effective ways to steer Claude's behaviour."* Both warn beginners to **avoid contradictory instructions** — they degrade output far more than messy grammar does.

## Four techniques layered on top of RCTFC

1. **Few-shot (show, don't tell).** Paste one example of the output style you want: *"Here's a tone I like: [example]. Now write three more like this."* Anthropic's rule: start with one, add more only if output still misses.

2. **Chain-of-thought.** For any reasoning task, add *"think it through step by step"* or *"explain your reasoning first."* Modern models (GPT-5.4, Claude 4.x) do this natively when asked.

3. **Meta-prompting — the cheat code for beginners.** Instead of writing a great prompt, ask AI to write one for you:

   > *"I want to achieve X. Ask me any clarifying questions you need, then write me the best possible prompt I could give you for this task."*

   Single highest-leverage tip for a near-beginner. They learn prompt craft by watching AI restructure their scrappy request.

4. **Iterate, don't restart.** Accepting the first answer is the #1 beginner mistake. Second draft is almost always 3× better. Useful iteration phrases:
   - *"Make it shorter and sharper."*
   - *"Too corporate — rewrite in plain English."*
   - *"Give me three variations, each with a different angle."*
   - *"What did you leave out? What would a critic say?"*

## Context windows — plain English for beginners

The AI has a memory for this conversation — roughly the length of a short novel for modern models (1 M tokens on Claude Opus/Sonnet, 200 K+ on GPT-5.4). When memory fills, earlier parts blur.

**Practical rule:** *start a new chat when you change topic, role or goal. Keep one long chat when drilling deeper into the same project.*

## 10 common beginner mistakes — before and after

| # | Mistake | Before | After |
|---|---------|--------|-------|
| 1 | Googling at it | "productivity tips" | "I'm a solicitor, 3 kids, leave home at 7 am. Suggest 5 morning routines that fit my life." |
| 2 | No role, no context | "Write an email to my boss" | "You're my assistant. Write a short email to my boss asking for Friday off. My project is on track. Warm but professional." |
| 3 | One-shot, no iteration | Takes first draft, grumbles | "Good start — shorten paragraph 2 by 30%, drop the word *synergy*." |
| 4 | Trusting output blindly | Copies a fact into a report | Asks for sources, checks one link. |
| 5 | Vague format | "Tell me about pricing" | "3-column markdown table: Tier · Price · Ideal Customer." |
| 6 | One chat for everything | 6-hour chat across marketing, tax, travel | One new chat per topic; model stays sharp. |
| 7 | Short vague questions | "help with meeting" | "Here are my notes [paste]. Summary · 3 action items · follow-up email to attendees." |
| 8 | Fighting confidence | Accepts a made-up stat | "Where did that come from? If unsure, say so." |
| 9 | Not giving examples | "Make it on-brand" | "Here are two real pieces of our copy. Match this tone." |
| 10 | Closing the loop too early | "Good enough" | "What did you leave out? What would a critic say?" |

## Hallucinations in beginner English

ChatGPT isn't a database; it's autocomplete on steroids. It predicts the most *plausible* next word, not the most *true*. OpenAI's own paper: *"language models hallucinate because standard training and evaluation procedures reward guessing over acknowledging uncertainty."* When it doesn't know, it guesses — confidently.

Mollick's line to drive home: **"Perfect verification is becoming impossible."** The habit to install: *"How would I check this?"* before using any output that matters.

## System prompts vs user prompts (introduce lightly in L4, return in L15)

- **System prompt:** permanent instructions the AI follows for every turn (set once, e.g., "always write in British English; never use em-dashes").
- **User prompt:** each individual question/turn in the chat.

Custom GPTs and Claude Projects let you set rich system prompts; this is why they produce consistent, reliable behaviour.

## Key URLs

- https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/overview
- https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices
- https://developers.openai.com/cookbook/examples/gpt-5/gpt-5_prompting_guide
- https://blog.agent.ai/meta-prompting-the-fastest-way-to-improve-your-ai-prompts-free-tool
- https://simple.ai/p/meta-prompting-is-the-secret-to-better-ai-results
- https://openai.com/index/why-language-models-hallucinate/
- https://eternitymarketing.com/blog/7-mistakes-beginners-make-with-chatgptand-how-to-fix-them
- https://www.tomsguide.com/ai/stop-using-chatgpt-wrong-here-are-the-biggest-mistakes-beginners-make-and-how-to-fix-them
- https://www.mygreatlearning.com/blog/prompt-engineering-beginners-mistakes/
