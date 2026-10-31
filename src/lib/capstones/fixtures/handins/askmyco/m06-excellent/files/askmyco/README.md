# AskMyCo

AskMyCo lets staff at a small UK business ask plain-English questions about
their own documents and get answers with citations to the passage used. Each
company is its own org; every query is filtered by the signed-in user's org.

Stack: Next.js on Vercel, Neon Postgres with pgvector (EU region), OpenAI
embeddings, Anthropic for answers with the Citations API, Better Auth.

To try it: copy `.env.example` to `.env.local`, fill in the values (never
commit them), run `npm run migrate`, then `npm run dev`. The sample corpus for
the two test companies is in `sample-corpus/`.
