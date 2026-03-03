# Kanban Planner -- Persistent Memory

## Project Structure Patterns

- **Public pages** live in `src/app/(public)/` and follow a consistent pattern: alternating `bg-muted/30` sections, `max-w-7xl` container, `Card` components for structured content
- **Navigation links** are in `src/components/layout/public-nav.tsx` (array `navLinks`) and `src/components/layout/footer.tsx` (array `footerLinks`)
- **Pricing constants** are centralized in `src/lib/config.ts` -- `COURSE_MONTHLY_PRICE`, `ONGOING_MONTHLY_PRICE`, `TOTAL_COURSE_COST` (computed)
- **Tech Radar data** comes from `docs/tech_radar.json`, loaded via `src/lib/data/tech-radar.ts`, typed by `TechRadarTool` in `src/lib/types.ts`
- **Existing public pages**: `/` (landing), `/about`, `/pricing`, `/for-teams`, `/tech-radar`, `/news`, `/contact`, `/privacy`, `/terms`, `/newsletter`

## Prompt Writing Patterns

- Use the `PROMPT_TEMPLATE.md` format (What to change, Files likely affected, Acceptance criteria, Notes)
- Each prompt should be completable in a single Claude Code session (roughly 1 page of changes or 1 new page)
- When a change spans config + multiple pages, put config changes in the first prompt and note dependencies
- Reference research files by absolute path so the implementing agent can read them
- Include specific code snippets for type changes and patterns to follow
- Always include `npm test` and `npm run build` in acceptance criteria

## Pricing (as of March 2026)

- Currency: GBP (changed from USD in the UK-first initiative)
- Course: 29 pounds/month for 3 months (was $37.50)
- Ongoing: 5 pounds/month (was $7.50)
- Free labs available

## UK-First Strategy (GWTH-15 / GWTH-s444qz)

- Broken into 5 prompts: landing+about, pricing+teams, tech-radar-flags, why-gwth-page, nav+footer+polish
- Research files stored in `kanban/0_idea/Files/` (kept after idea deletion)
- Key UK stats: 21% worker confidence, 1 in 6 businesses using AI, 45% micro business gap, 400bn pounds potential
- Government programme: AI Skills Boost, 14 courses, PwC delivery partner, 4.1m pounds contract
