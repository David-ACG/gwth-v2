# Task: Create `/why-gwth` Government AI Skills Boost Comparison Page

## What to change

Create a new public page at `/why-gwth` that provides a detailed, evidence-based comparison between GWTH.ai and the UK government's AI Skills Boost programme. This is the page that other pages (pricing, landing) link to when they reference the government comparison. It should be compelling, well-sourced, and use real quotes from Computer Weekly, FE Week, and other press sources.

### Context

The UK government launched the AI Skills Boost programme in January 2026 (delivered by PwC for 4.1 million pounds, targeting 10 million workers). The programme has been savaged by the press for being shallow, vendor-biased, and poorly executed. GWTH fills every gap the programme leaves open.

This page is NOT an attack on the government. It is a factual comparison that helps potential learners understand what the government programme covers, where it stops, and how GWTH continues from there. The tone should be: "The government's goal is admirable. Their execution has gaps. We fill those gaps."

**Research files -- these are essential reading** (contain all the quotes, statistics, and comparison data to use on this page):

- `C:\Projects\GWTH_V2\kanban\0_idea\Files\gwth-vs-government-ai-courses.md`
- `C:\Projects\GWTH_V2\kanban\0_idea\Files\ai-skills-hub-gwth-strategy.md`

### Page structure

Create `src/app/(public)/why-gwth/page.tsx` as a Server Component. Follow the same patterns as the existing about, pricing, and for-teams pages (alternating `bg-muted/30` and plain backgrounds, `max-w-7xl` container, `Card` components for structured content).

**Section 1: Hero**

- Headline: "Completed the AI Skills Boost? Here is what comes next." (or similar)
- Subtitle: Explain that the UK government has the right idea -- upskilling the nation on AI is essential. But there is a gap between a 20-minute foundation course and the skills that actually transform careers and businesses.
- Include the key stat: "Only 21% of UK workers feel confident using AI at work."

**Section 2: What the Government Programme Covers**

- Brief, factual summary of the AI Skills Boost: 14 benchmarked courses, free, from 8 US tech providers, 20 minutes to 9 hours each, covering basic AI awareness, prompting, and responsible use.
- Present this neutrally. Acknowledge it is a good starting point.
- Note it targets 10 million UK workers by 2030 and is the "biggest targeted training programme since the Open University."

**Section 3: What the Press Says** (the credibility section)
Use real quotes from the research files. Display these as styled blockquotes with source attribution. Key quotes to include:

From Computer Weekly:

> "The hub is simply a bookmark or affiliate list of online courses that are already available."
> "All 14 benchmarked courses come from US big tech companies... the opposite of positioning the UK as an AI maker, not an AI taker."

From FE Week:

> "A copy and paste of past failure."
> "Hard to navigate and does not clearly link to digital standards."

From users/critics:

> "The website feels messy. I am an everyday person. I do not want to be a programmer. I just want to understand how to use AI."

From Ed Newton-Rex:

> "The AI Skills Hub seems mostly to consist of rehashed sales propaganda written by big tech and low-quality slide decks meant for other countries."

Style these as `Card` components with a left border accent, the quote in italics, and the source below in `text-muted-foreground`. Use 4-5 of the strongest quotes.

**Section 4: Side-by-Side Comparison Table**
Create a comparison table using a responsive design (table on desktop, stacked cards on mobile). Columns: Dimension | Government AI Skills Boost | GWTH.ai. Use the comparison data from the research file. Key rows:

| Dimension           | Government                                  | GWTH                                        |
| ------------------- | ------------------------------------------- | ------------------------------------------- |
| Price               | Free                                        | 29 pounds/month for 3 months                |
| Depth               | Foundation (20 min - 9 hrs)                 | Comprehensive (120+ hrs over 3 months)      |
| Scope               | Basic AI awareness                          | Use, Implement, Build, Transform            |
| Hands-on projects   | None                                        | 94 projects with video walkthroughs         |
| Tool bias           | Vendor-specific (Google, Microsoft, Amazon) | Independent, vendor-neutral                 |
| Content freshness   | Static, some courses from 2023-2024         | Updated every day                           |
| Enterprise content  | None                                        | Month 3: governance, ROI, change management |
| Progression pathway | None beyond foundation                      | 3-month structured pathway                  |
| Assessment          | Badge on completion                         | Dynamic scoring that stays current          |
| Community           | None                                        | Peer support, forums                        |
| UK focus            | Courses from US companies                   | Built in the UK, UK-focused content         |

Use green checkmark icons for GWTH advantages and neutral/grey for government items. Do not use red X marks for the government -- keep it respectful.

**Section 5: The Numbers**
Display key UK statistics in a grid (similar to the about page stats section):

- "21%" / "of UK workers feel confident using AI"
- "1 in 6" / "UK businesses were using AI as of mid-2025"
- "400 billion pounds" / "potential AI contribution to UK economy by 2030"
- "94" / "hands-on projects in the GWTH course"

**Section 6: GWTH Fills the Gap**
A brief narrative section explaining:

- The government programme is not a competitor -- it is a starting point
- GWTH covers everything the government programme does in the first two weeks of Month 1
- Months 2 and 3 have zero government equivalent (enterprise AI, multi-agent systems, governance)
- GWTH is the natural next step after the government badge

**Section 7: CTA**

- Primary CTA: "Start Where the Government Stops" linking to `/signup`
- Secondary CTA: "See Our Pricing" linking to `/pricing`
- Tertiary CTA: "Try a Free Lab" linking to `/labs`

### Metadata and SEO

```tsx
export const metadata: Metadata = {
  title: "Why GWTH | Beyond the Government AI Skills Boost",
  description:
    "The UK government's AI Skills Boost covers the basics. GWTH.ai goes dramatically further with 94 hands-on projects, vendor-neutral training, and enterprise transformation over 3 months.",
};
```

Add JSON-LD structured data (WebPage type, as used on other pages).

### Responsive design

- The comparison table should be a proper HTML `<table>` on desktop (`md:` breakpoint and above) and stacked cards on mobile.
- Quotes should be single-column on all screen sizes.
- Stats grid: 2 columns on mobile, 4 on desktop.

## Files likely affected

- `src/app/(public)/why-gwth/page.tsx` -- new file (the entire page)

## Acceptance criteria

- [ ] The page exists at `/why-gwth` and renders without errors
- [ ] The page has proper metadata (title, description)
- [ ] The page has JSON-LD structured data
- [ ] The hero section includes the "21% of UK workers" statistic
- [ ] There are at least 4 real press quotes with source attribution
- [ ] The comparison table has at least 10 rows comparing government vs GWTH
- [ ] The comparison table is responsive (table on desktop, cards/stacked on mobile)
- [ ] The stats section shows at least 4 UK-specific statistics
- [ ] The CTAs link to `/signup`, `/pricing`, and `/labs`
- [ ] The tone is respectful towards the government programme (not attacking, factual comparison)
- [ ] The page follows existing design patterns (alternating sections, Card components, shadcn/ui)
- [ ] All copy uses British English spelling
- [ ] `npm test` passes with no failures
- [ ] The site builds successfully with `npm run build`

## Notes

- This is the most important page in the UK-first strategy. It should be compelling enough that someone who has just completed the government badge thinks "this is exactly what I need next."
- Use ONLY real quotes and statistics from the research files. Do not fabricate press quotes.
- The pricing page and for-teams page already link to `/why-gwth` (or will, after their prompts are implemented). This page must exist for those links to work.
- Follow the same layout patterns as the about page and for-teams page: alternating section backgrounds, consistent heading sizes, Card components for structured content.
- Import `COURSE_MONTHLY_PRICE` from `src/lib/config.ts` for any price references so they stay in sync.
