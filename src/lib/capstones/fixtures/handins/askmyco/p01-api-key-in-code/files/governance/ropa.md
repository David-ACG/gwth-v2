# AskMyCo - Record of Processing Activities (Riverside Plumbing Ltd)

| Field                                 | Value                                                                                                           |
| ------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| Controller name and contact           | Riverside Plumbing Ltd - office@riverside-plumbing.example                                                      |
| Purpose of processing                 | Staff ask plain-English questions about Riverside's handbook and policies                                       |
| Categories of data subjects           | Staff and suppliers named in the uploaded documents; no customers                                               |
| Categories of personal data           | Names, work emails and roles                                                                                    |
| Categories of recipients              | Riverside staff only, after sign-in                                                                             |
| Transfers outside the UK              | OpenAI (embeddings) and Anthropic (answers), US, under their data processing terms; Vercel and Neon in the EU   |
| Retention period                      | Deleted 30 days after a document is removed; whole org deleted 90 days after the contract ends                  |
| Lawful basis                          | Legitimate interests, see lawful-basis.md                                                                       |
| Technical and organisational measures | Org filter in lib/queries.ts, two-step sign-in on every admin account, keys in Vercel environment settings only |
