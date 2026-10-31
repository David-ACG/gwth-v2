# FractionalBuddy Spec: Riverside Plumbing Ltd

## What FractionalBuddy is

FractionalBuddy for Riverside Plumbing Ltd is an AI assistant for the owner,
Gareth Morgan. It drafts, suggests, and on instruction completes a short list
of office tasks. It is not a consultant and gives no regulated legal,
financial, tax or employment advice.

## Who it is for

Gareth runs Riverside from Cardiff with six plumbers and an office manager.
Quotes and chasing invoices pile up in the evenings.

## What it can do: the five capabilities

1. Answer questions from Riverside's own documents, with citations (AskMyCo).
2. Suggest next steps as options with a recommended one.
3. Draft quotes, follow-up emails and the monthly cash note.
4. Act only through the tools below.
5. Watch the metrics below and tell Gareth when one is breached.

## Tool allow-list

| Tool            | Action                         | Approval gate                          |
| --------------- | ------------------------------ | -------------------------------------- |
| AskMyCo         | Read Riverside's documents     | Org filter; read only                  |
| Companies House | Look up a company (read only)  | None needed: public data               |
| Cal.com         | Book a site visit              | Gareth confirms before it sends        |
| Postmark        | Send an email                  | Gareth approves every send for 14 days |
| Xero            | Read invoices; draft reminders | No writes to Xero                      |

## Guardrails

- No regulated advice: no tax, legal or employment advice; it points to the accountant.
- No automatic outbound action in the first 14 days.
- No publishing anything (reviews, social posts).
- No changing or deleting its own logs.
- Escalate on low retrieval confidence or two failed tool calls in a row.

## Metrics monitored

Cash below £8k; invoices overdue 30+ days; quotes not answered in 7 days.

## Pricing

£250 a month retainer plus £10 per email campaign over 10 recipients.

## What FractionalBuddy will not do for Riverside

- Give regulated advice of any kind.
- Send, book or publish without Gareth in the first 14 days.
- See data outside Riverside's org.
- Act outside the tool list.

Signed off: Gareth Morgan Date: 28 October 2026
