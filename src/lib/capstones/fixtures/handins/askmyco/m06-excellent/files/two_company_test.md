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

## How I would find out if data ever leaked

- Every answer is logged with the session's org_id and the org_id of each cited
  chunk (lib/retrieval.ts writes one row to answer_log).
- A daily query flags any row where the two differ:
  `select * from answer_log where cited_org_id <> session_org_id;`
  It has returned nothing since I added it. If it ever returns a row, it emails
  me and I treat it as a personal data breach: check within 72 hours whether
  the ICO must be told.
- Once a month I re-run this test with a fresh third company.
