# Cyber Essentials self-check: AskMyCo (2 November 2026)

| Control                    | Status   | Notes                                                                                            |
| -------------------------- | -------- | ------------------------------------------------------------------------------------------------ |
| Firewalls                  | in place | Vercel and Neon only accept HTTPS; Neon IP allow-list on                                         |
| Secure configuration       | in place | No default passwords; preview deployments need sign-in                                           |
| User access control        | in place | Two-step sign-in on Neon, Vercel, OpenAI, Anthropic and GitHub (checked each one today)          |
| Malware protection         | in place | Laptop: built-in protection, updated                                                             |
| Security update management | in place | Dependabot on; high and critical patched within 14 days                                          |
| Secrets                    | in place | API keys only in Vercel environment settings; none in the repo (checked with a search for "sk-") |
