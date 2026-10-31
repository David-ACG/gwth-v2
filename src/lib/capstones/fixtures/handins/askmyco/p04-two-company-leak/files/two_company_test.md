# Two-company test

Companies: Riverside Plumbing Ltd and Hill Top Bakery Ltd, three documents each.

Chat page: "What is our pricing policy?"

- Riverside user: fixed quotes under £500, citing how-we-quote-jobs.md only.
- Hill Top user: April price reviews, citing pricing-policy.md only.

Dashboard search box, signed in as the Hill Top user, searching "cancellation":

- The results list showed returns-and-refunds.md, which is a Riverside document,
  including the £45 call-out fee text.

Result: chat passes. The search box shows the other company's documents; it
is the new /api/search route. I will route it through forOrg() next sprint.
