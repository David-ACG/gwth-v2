# Quality Statement: AskMyCo

**Version:** 1.0
**Date:** 2026-10-29
**Owner:** J. Ellis

## What this software does

AskMyCo lets staff at a small business ask plain-English questions about
their own handbook and policies and get answers that cite the passage used.

## What it currently does well

Tested with two companies' documents (Riverside Plumbing and Hill Top
Bakery): it answered 18 of 20 policy questions correctly with the right
citation, and says "I cannot find this" when the answer is not there.

## What it does not yet do

It cannot read spreadsheets or scanned PDFs, it only works in English, and a
document longer than about 80 pages is slow to process.

## How a user gets help

Email help@askmyco.example, Monday to Friday 9:00 to 17:00. We reply within one
working day.

## How user data is handled

Documents stay in an EU-region database, filtered by company on every query.
The DPIA, ROPA and Subject Access Request procedure are available on request.

## Security floor

Built against the Cyber Essentials controls (self-assessed 2 November 2026),
two-step sign-in on every admin account, OWASP LLM Top 10 reviewed at this
release.

## How this software is maintained

Updates ship weekly after a green preview build. Rollback takes under five
minutes and was rehearsed on 31 October. If something breaks we tell affected
customers the same day and post it on status.askmyco.example.

Signed: J. Ellis
Date: 2026-10-29
