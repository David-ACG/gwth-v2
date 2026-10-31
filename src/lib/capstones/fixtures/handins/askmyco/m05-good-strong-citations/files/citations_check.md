# Citation check

I asked ten questions I know the answers to (I wrote the corpus) and clicked
every citation chip.

| #   | Question               | Right passage?                 |
| --- | ---------------------- | ------------------------------ |
| 1   | Cancel within 24 hours | yes, returns-and-refunds.md s3 |
| 2   | Holiday allowance      | yes, leave-policy.md s1        |
| 3   | How long a quote lasts | yes, how-we-quote-jobs.md s2   |
| 4   | Deposit refund time    | first run: NO                  |

## The weak answer (question 4)

"How fast do we refund a deposit?" first came back as "We refund deposits
promptly", citing the heading of returns-and-refunds.md, not the sentence
with "5 working days".

Why: my chunker split on every 400 characters, so the heading and the first
line ended up in one chunk and the "5 working days" sentence in the next one,
which ranked lower.

What I changed: chunking now splits on headings first and keeps each section
whole when it is under 1,200 characters (lib/ingest.ts). I re-ingested both
companies. Question 4 now answers "within 5 working days" and the chip opens
section 3.
