# Two-company test

Companies: Riverside Plumbing Ltd and Hill Top Bakery Ltd, three documents each.
Question asked as each user: "What is our pricing policy?"

Answers

- Riverside user: fixed quotes under £500, citing how-we-quote-jobs.md only.
- Hill Top user: April price reviews and 10% off over 40 loaves, citing
  pricing-policy.md only.

Network traffic

- With the browser's network tab open as the Hill Top user, I searched every
  /api/chat response for "Riverside", "£500" and "call-out". None found.

Where the filter lives

- Every tenant query goes through forOrg() in lib/queries.ts. I searched the
  code for "from chunks" and "from documents": both appear only in that file.

Result: PASS on answers and on network traffic.
