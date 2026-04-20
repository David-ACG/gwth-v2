# Automation Platforms — Zapier, Make, n8n (L16, L19)

## The three platforms

| Tool | Pricing April 2026 | AI features | UK angle |
|------|---------------------|-------------|----------|
| **Zapier** | Free 100 tasks · Pro $19.99/mo · Team $69/mo. Rebranded as *"AI Orchestration Platform"*. | **Zapier Copilot** (natural-language → Zap). **Zapier Agents** (autonomous across 8,000+ apps). Add-on pricing brings heavy users to $150–200/mo. | Easiest on-ramp. Integrates with UK tools (Xero, FreeAgent, QuickBooks UK, HMRC via apps) |
| **Make.com** | Competitive at volume. | **Maia** natural-language scenario builder. **Make AI Agents on Canvas.** Visual scenario builder. | Cost-efficient once you scale past simple flows |
| **n8n 2.0** | Self-host free · Cloud Starter ~$20/mo. | **LangChain + 70+ AI nodes** (Jan 2026). AI Agent Tool Node. Persistent memory. 1 execution = 1 workflow regardless of steps. | **UK sovereignty favourite** — self-host on AWS London / OVHcloud Erith for 100% UK data control |

## Real UK TCO

From toptenaiagents.co.uk (500 k ops/year):
- **n8n self-hosted: £1,560**
- **Make: £1,070** (cheapest at this volume)
- **Zapier: £6,670+**

Use Zapier for ease in Month 1. Move to n8n / Make for scale in Month 2/3.

## The beginner pattern to teach

**Trigger → Action → Condition.** Every automation has these three parts. Once you see it, you can automate almost anything.

## L16 build — Save Yourself an Hour

Identify one genuinely repetitive task in real life. Automate it. Must actually save time, not theoretically. Document:
- The task before.
- The automation design (trigger / action / condition).
- The time saved.

## High-ROI UK automations beginners ship

- **Email with attachment** → save to Drive + log to Sheet.
- **Form submission** → Sheet row + confirmation email.
- **Receipts** → Xero / FreeAgent / QuickBooks UK.
- **Sunday-night family briefing** → calendar + weather + school menu → WhatsApp.
- **New landlord message** → template reply + calendar event.
- **Photo of a bill** → AI reads → logged to Sheet → tagged with due date.

## UK regulatory hygiene

- **UK GDPR**: self-hosted n8n = 100% UK data sovereignty.
- **ICO**: if an automation moves personal data, you're processing it — make sure you have a lawful basis.
- **Cloud Zapier/Make**: most UK SMEs are fine because they're using the apps' own data (not special category data).

## L19 relevance (Family Bot distribution)

The same platforms send Family Bot outputs to their destinations:
- Zapier → Google Calendar event creation.
- Zapier → Gmail send.
- Zapier → Google Sheet append (shopping list).
- Make → WhatsApp send (via Twilio).

## Key URLs

- https://zapier.com/ai/agents
- https://www.make.com/en/ai-agents
- https://n8n.io/
- https://www.digitalapplied.com/blog/marketing-automation-ai-agents-make-zapier-n8n-2026
- https://toptenaiagents.co.uk/blog/n8n-vs-zapier-vs-make-2026-automation-showdown.html
- https://startupowl.com/reviews/zapier
