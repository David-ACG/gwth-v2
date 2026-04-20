# Sources log

Provenance for every claim in this corpus, per the sourcing rules: (1) David's Kindle Notes & Highlights export, (2) publicly available material, (3) direct typing from the Kindle copy, (4) McKinsey open companion articles.

## Confirmed direct sources (paste-in from David)

### Wiley product description and TOC — 20 Apr 2026

The full table of contents for the 2nd edition (ISBN 9781394381906) was supplied by David from the Wiley product page. It lists 39 chapters across seven sections, an introduction with a "transformation manifesto" section, acknowledgments (p. 592) and index (p. 596). NEW and EXPANDED chapter labels are from Wiley's own copy and are recorded per-chapter in the frontmatter of each chapter file.

The Wiley description also confirms the marketing-level framing:

- Six capabilities: transformation roadmapping, talent bench, operating model, distributed technology, embedded data, adoption and scaling.
- Four deep-dive case studies: **Toyota, DBS Bank, Freeport-McMoRan, LATAM Airlines**.
- 100 exhibits, 30+ case studies total.
- New-to-2nd-edition themes: tech muscle of AI transformation leaders, human-AI collaboration models, software development with AI agents, industrialising AI at scale, the new economics of Tech & AI transformations.

This is the authoritative scaffolding source for all chapter files.

## Public material used for capability-level framing (source type 2)

All capability files (`capabilities/*.md`) were drafted from search-engine snippets of publicly available material:

- McKinsey & Company featured-insights pages (book landing page; "Rewired to outcompete"; "The rewired enterprise"; "Rewiring for the era of gen AI"; "Author talks: Rewiring to outcompete with AI"; "AI transformation manifesto").
- Wiley publisher marketing pages.
- Retailer book-description pages (Amazon, Barnes & Noble, Walmart, Waterstones, Blackwell's, Porchlight, Booktopia).
- Third-party book-summary sites (Blinkist, StoryShots, Bookey, Paminy, 1HourGuide, Soundview Book Snap).
- McKinsey "Rewired in Action" case collections (2023, 2024, 2025 PDFs).

None of these pages were fetched in full — egress proxy blocked every retailer, publisher, aggregator and search-engine domain at drafting time. Framing content is therefore paraphrase, not verbatim. Treat all capability-file content as `[TODO-VERIFY]` until reconciled with the Kindle text.

## Chapter-title source confidence

Chapter titles now come directly from Wiley's own TOC paste and are treated as authoritative for structure. However:

- Titles are marketing-rendered and may differ slightly from the inside-book rendering (capitalisation, punctuation). Leave room for minor correction once highlights arrive.
- Page numbers are the print-book pagination; Kindle locations will replace them in the `kindle_locations` frontmatter field.

## Blocked domains (egress proxy)

At the time of drafting, WebFetch returned `EGRESS_BLOCKED` for: `wiley.com`, `oreilly.com`, `mckinsey.com`, `amazon.com`, `amazon.co.uk`, `books.google.com`, `barnesandnoble.com`, `goodreads.com`, `walmart.com`, `waterstones.com`, `blackwells.co.uk`, `porchlightbooks.com`, `dokumen.pub`, `bookey.app`, `getstoryshots.com`, `paminy.com`, `medium.com`, `en.wikipedia.org`. This is why David's paste-in of the Wiley TOC was needed.

## Known-good companion-article URLs (for cross-linking, not fetched)

- `mckinsey.com/featured-insights/mckinsey-on-books/rewired` — 2nd edition landing page.
- `mckinsey.com/featured-insights/mckinsey-on-books/author-talks-rewiring-to-outcompete-with-ai` — 2nd edition author talks.
- `mckinsey.com/capabilities/mckinsey-digital/our-insights/rewired-to-outcompete` — original companion.
- `mckinsey.com/capabilities/mckinsey-digital/our-insights/the-rewired-enterprise-how-five-companies-built-to-outcompete` — five-company feature.
- `mckinsey.com/capabilities/mckinsey-digital/our-insights/rewiring-for-the-era-of-gen-ai` — gen AI reframe.
- `mckinsey.com/capabilities/tech-and-ai/our-insights/the-ai-transformation-manifesto` — AI transformation manifesto (likely the direct-line source for Ch 0's "transformation manifesto" section).
- Rewired In Action case collection PDFs (2023, 2024, 2025) — hosted on `mckinsey.com/~/media/...`.

David's separate `rewired-reference-pack/` is expected to already contain these — verify before resolving `[TODO-CROSSLINK]` markers.
