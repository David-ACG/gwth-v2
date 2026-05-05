# GWTH v2 — Student Learning Platform

> **Current product source:** `docs/product-source-of-truth-2026-05-04.md` and
> `PRODUCT.md` override older implementation notes. For the UK beta, use
> £29/month course access, £7.50/month Stay Current, GWTH Score, Tech Radar
> deferred from public launch messaging, and coding/building as a course spine.

## Project Overview

Build GWTH v2, a student-facing learning platform where users can browse courses, view lessons (video + text + audio), complete labs, track progress, and take quizzes. This is a full rebuild — clean, modern, and properly architected from scratch.

**Content model:** This is a single course delivered over 3 months (not a multi-course catalog). The mock data uses multiple courses for UI development, but the production site will feature one course with monthly content releases.

## Sibling repos

- **Curriculum content** (lesson ideas, research, syllabus, future lesson/lab/project files): `C:\Projects\GWTH_curriculum` ([David-ACG/gwth-curriculum](https://github.com/David-ACG/gwth-curriculum)). Moved out of `GWTH_V2/gwth_lesson_ideas/` on 2026-04-23 so curriculum editing and platform engineering live in separate kanban/beads scopes. The platform will import content from `../GWTH_curriculum/content/` at build time (sync script not yet wired — Phase 5 of the VIP-asset plan).
- **Pipeline** (Docling → Qdrant ingestion, NiceGUI dashboard): `C:\Projects\1_gwthpipeline520` ([David-ACG/gwthpipeline520](https://github.com/David-ACG/gwthpipeline520)). Keeps Qdrant running with source material; GWTH_curriculum's `/vip-intake` skill queries it directly.

**Do not edit lesson-ideas or research files from this repo** — they live in `GWTH_curriculum`. Switch sessions.

## Tech Stack

Next.js 16 (App Router, React 19, React Compiler, Turbopack) + TypeScript strict + Tailwind v4 + shadcn/ui (new-york, unified `radix-ui`) + Motion (motion.dev) + tw-animate-css + lucide-react + Sonner + next-themes + Shiki + react-hook-form + zod. Matches the agilecommerce.ai stack (`next@16.1.4`, `react@19.2.3`, `tailwindcss@^4`).

Backend, auth, database, and payment foundations now use Supabase and Stripe. Keep clean data-fetching abstractions, but do not assume the site is frontend-only.

See `.claude/rules/tech-stack.md` for `next.config.ts`, ESLint flat config, TypeScript settings, and environment-variables guidance (loaded automatically when editing those files).

## File Structure

```
src/
├── app/         # App Router pages and layouts (route groups: (public), (auth), (dashboard))
├── components/  # Feature-module folders (ui, layout, course, lab, progress, shared, search)
├── lib/         # Data layer (lib/data/), auth, config, types, utils, validations (Zod)
├── hooks/       # Custom hooks (use-sidebar, use-theme, use-reduced-motion, etc.)
├── providers/   # ThemeProvider + RootProvider
├── middleware.ts
├── __tests__/
└── public/
```

Each directory under `components/` is a feature module. Components in `components/course/` should not import from `components/lab/`. Shared utilities go in `components/shared/` or `lib/`. Each component directory gets a brief `README.md`.

## Architecture Principles

These are the always-on subset that applies project-wide. Subtree-specific principles (data-layer abstraction, route-group structure, dynamic imports) live in the relevant rule file.

- **Server Components by default.** Only use `"use client"` for interactive elements (video player, quiz, sidebar toggle, theme toggle, forms).
- **React Compiler enabled.** Let the compiler handle memoization — do NOT manually use `useMemo`, `useCallback`, or `React.memo`.
- **Turbopack** as the default bundler (`next dev --turbopack`).
- **JSDoc on every export.** Functions, components, types, constants. Component prop interfaces have JSDoc per field. Inline comments explain _why_, not _what_.
- **Clear module boundaries.** Each `components/<feature>/` directory is a feature module that doesn't import sibling features.
- **Naming:** kebab-case files (`course-card.tsx`), PascalCase components (`CourseCard`), camelCase hooks with `use` prefix (`useSidebar`), PascalCase types/interfaces no `I` prefix, UPPER_SNAKE_CASE constants (`MAX_QUIZ_ATTEMPTS`), kebab-case CSS variables (`--primary`, `--sidebar-width`).
- **Accessibility (WCAG 2.1 AA).** 4.5:1 text contrast (3:1 large). Keyboard navigation for all interactive elements. `aria-label` on icon-only buttons. Semantic HTML (`nav`, `main`, `article`, `section`, `aside`). `aria-live` for dynamic updates. All Motion animations respect `prefers-reduced-motion` via `useReducedMotion()`.
- **Error boundaries at every route group.** Every route gets `loading.tsx` with skeleton UI. Every dynamic route handles missing data via `notFound()`. Components must never crash the page — graceful fallbacks for missing media.
- **Performance.** `next/image` for all images, `next/font/google` for fonts (zero layout shift), `next/dynamic` for heavy components. Target LCP < 2.5s, INP < 200ms, CLS < 0.1.
- **Testing strategy.** Vitest + React Testing Library (`npm test`) for component tests, Playwright for visual regression in light/dark + desktop/mobile, axe-core for a11y in CI. Test files live next to source: `course-card.tsx` ↔ `course-card.test.tsx`.

## Form Validation Patterns

All forms use react-hook-form + zod. Define a zod schema in `lib/validations.ts`, infer the type, and resolve via `@hookform/resolvers/zod`. Surface field-level errors via shadcn/ui's `<Form>` and `<FormMessage>` components.

## Important Notes

- This is a FRESH project. Do not copy v1 code — rebuild properly.
- **Backend dependencies exist.** Supabase and Stripe are now part of the beta implementation. Keep abstractions clean and retain graceful mock/local fallbacks where useful, but do not remove backend integrations as "future work".
- **Robust architecture.** Error boundaries on every route group. Loading skeletons on every page. Graceful fallbacks for missing media. No component should crash the page.
- **Well-documented.** JSDoc on every export. README per component module. Inline comments explaining _why_, not _what_.
- All colors must use CSS custom properties. Never hardcode hex values in components.
- Support light/dark mode from day one. Every component must work in both. Use `next-themes` ThemeProvider.
- Mobile-first responsive design. The lesson viewer should work on phones (sidebar becomes a sheet).
- All test files live next to their source files (`component.tsx` ↔ `component.test.tsx`).
- Use `next/image` for all images. Use `next/font/google` for fonts. Use `next/dynamic` for heavy components.
- Every list page must have an `<EmptyState>` fallback.
- Every filterable list must sync filters to URL search params (so users can share/bookmark filtered views).
- Use Sonner `toast()` for user feedback on actions (lesson completed, quiz submitted, bookmark toggled).
- Use `AlertDialog` for destructive or irreversible actions (submit quiz, reset progress).

## Kanban Workflow

This project uses the kanban workflow defined in `kanban/KANBAN_RUNNER.md`.
See the global CLAUDE.md (`~/.claude/CLAUDE.md`) for gate rules.

- **Test command:** `npm test`
- **Verification:** Playwright check at http://192.168.178.50:3001 (P520) / https://gwth.ai (prod)
- **File naming:** `PREFIX_YYYY-MM-DD_short-slug.md`

## Beads Issue Tracking

This project uses [Beads (bd)](https://github.com/steveyegge/beads) for persistent agent memory across sessions.

### Core Rules

- Track all non-trivial work in Beads (never use markdown TODOs or comment-based task lists for multi-session work)
- Use `bd ready` to find available work at session start
- Use `bd create` to track new issues/tasks/bugs discovered during work
- Use `bd sync` at end of session to persist state to git
- The SessionStart hook auto-runs `bd prime` — you get context for free

### Quick Reference

```bash
bd prime                              # Load complete workflow context (auto-runs on session start)
bd ready                              # Show issues ready to work (no blockers)
bd list --status=open                 # List all open issues
bd create --title="..." --type=task   # Create new issue
bd update <id> --status=in_progress   # Claim work
bd close <id>                         # Mark complete
bd dep add <issue> <depends-on>       # Add dependency
bd sync                               # Sync with git remote
```

### "Land the Plane" Protocol

When ending a session (or when David says "Land the Plane"):

1. Close completed Beads issues: `bd close <id>` for each finished item
2. File remaining discovered work as new issues: `bd create --title="..." --type=task`
3. Run quality gates: `npm test` (this project) or appropriate test command
4. Commit and push everything
5. Sync Beads state: `bd sync`
6. Summarize: what was done, what's next, known problems

### Dolt Server Dependency

Beads requires a running Dolt SQL server on port 3307. If `bd` commands fail with connection errors:

```bash
# Start the Dolt server
C:\Users\david\AppData\Local\beads\start-dolt.bat
```

## Path-scoped rules

These load automatically when Claude reads matching files:

| Rule                                     | Loads when working with                                                                      |
| ---------------------------------------- | -------------------------------------------------------------------------------------------- |
| `.claude/rules/tech-stack.md`            | `next.config.ts`, `tsconfig.json`, `eslint.config.mjs`, `postcss.config.mjs`, `package.json` |
| `.claude/rules/design-system.md`         | `src/components/**/*.tsx`, global CSS files                                                  |
| `.claude/rules/routing.md`               | files under `src/app/**`                                                                     |
| `.claude/rules/data-layer.md`            | files under `src/lib/**`                                                                     |
| `.claude/rules/middleware-and-layout.md` | `src/middleware.ts`, `src/app/layout.tsx`                                                    |
