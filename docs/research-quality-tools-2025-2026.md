# Quality Tools, Techniques & Practices for Next.js/React Web Applications (2025-2026)

> Comprehensive research for a solo developer building a student learning platform with Next.js 16, React 19, Tailwind CSS v4, shadcn/ui, TypeScript, deploying via Coolify (Docker).
>
> **Existing stack:** ESLint, Vitest, Playwright, Husky, GitHub Actions CI/CD, Sentry (planned), axe-core.
>
> **Date compiled:** 2026-02-20

---

## Table of Contents

1. [Code Quality & Static Analysis](#1-code-quality--static-analysis)
2. [Performance & Core Web Vitals](#2-performance--core-web-vitals)
3. [Security](#3-security)
4. [Visual Quality & Design](#4-visual-quality--design)
5. [Testing Beyond What You Have](#5-testing-beyond-what-you-have)
6. [Monitoring & Observability](#6-monitoring--observability)
7. [Developer Experience](#7-developer-experience)
8. [SEO & Marketing](#8-seo--marketing)
9. [Accessibility Beyond axe-core](#9-accessibility-beyond-axe-core)
10. [AI-Assisted Development](#10-ai-assisted-development)
11. [Priority Matrix](#11-priority-matrix)

---

## 1. Code Quality & Static Analysis

### 1.1 Knip - Unused Code & Dependency Detection

**What:** Knip analyzes your project and detects unused files, exports, dependencies, devDependencies, duplicate dependencies, unused binaries, and unresolved imports -- all in a single run.

**Why:** Dead code accumulates fast in growing projects. Knip understands the JS/TS ecosystem deeply -- it knows how tools like Vitest, Storybook, ESLint, and Next.js reference files, so it won't flag your test setup or page routes as "unused." Removing dead code reduces bundle size, speeds up builds, and reduces cognitive load.

**Setup:**
```bash
npm install -D knip
npx knip        # One-shot analysis
npx knip --fix  # Auto-remove unused exports
```

Add to `package.json`:
```json
{
  "scripts": {
    "knip": "knip",
    "knip:fix": "knip --fix"
  }
}
```

Knip auto-detects Next.js entry points (pages, API routes, app directory). For custom entry points, add a `knip.json`:
```json
{
  "entry": ["src/app/**/page.tsx", "src/app/**/layout.tsx"],
  "ignore": ["public/**"]
}
```

**Cost:** Free, open source (MIT). npm: `knip` (v5.84+). GitHub: [webpro-nl/knip](https://github.com/webpro-nl/knip)

**Impact:** HIGH | **Effort:** Quick win (10 min setup)

---

### 1.2 Biome - ESLint + Prettier Alternative

**What:** Biome is a Rust-based toolchain that combines linting (423+ rules) and formatting (Prettier-compatible) into a single binary. It's 10-25x faster than ESLint + Prettier and requires one config file instead of four.

**Why:** Next.js 15.5+ officially supports Biome as an alternative to ESLint. For a solo developer, the speed improvement is meaningful during development (instant feedback) and CI (faster pipelines). Biome v2.3 (2026) includes type-aware linting, closing the gap with typescript-eslint.

**Setup:**
```bash
npm install -D @biomejs/biome
npx biome init  # Creates biome.json
npx biome migrate eslint-prettier  # Migrates existing config
```

**Tradeoff:** You already have ESLint configured and working. Migration has diminishing returns unless ESLint is causing friction. Biome's plugin ecosystem is smaller (no equivalent for every ESLint plugin). **Recommendation: Stay with ESLint for now, monitor Biome adoption.**

**Cost:** Free, open source. npm: `@biomejs/biome`. Docs: [biomejs.dev](https://biomejs.dev/)

**Impact:** MEDIUM | **Effort:** Moderate (migration from ESLint)

---

### 1.3 SonarCloud - Code Smell & Bug Detection

**What:** Cloud-hosted static analysis that detects bugs, code smells, security vulnerabilities, and duplications. Integrates with GitHub PRs to provide inline feedback.

**Why:** Catches subtle issues ESLint misses: complex cognitive complexity, duplicated logic blocks, untested exception paths, and security hotspots. The quality gate concept (pass/fail threshold) prevents code quality from degrading over time.

**Setup:**
1. Sign up at [sonarcloud.io](https://sonarcloud.io) with GitHub OAuth
2. Import your repository
3. Add GitHub Actions step:
```yaml
- name: SonarCloud Scan
  uses: SonarSource/sonarcloud-github-action@master
  env:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
    SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}
```

**Cost:** Free for projects up to 50K lines of code. Paid starts at EUR 30/month for 100K LoC. A GWTH learning platform is likely under 50K LoC for a long time.

**Impact:** MEDIUM | **Effort:** Quick win (20 min setup)

---

### 1.4 CodeQL - GitHub's Free Security Scanning

**What:** GitHub's semantic code analysis engine that finds security vulnerabilities by querying code as data. Supports JavaScript and TypeScript natively.

**Why:** Free for all public and private GitHub repos. Runs automatically on every push/PR. Particularly important given the critical CVEs discovered in React Server Components (CVE-2025-55182) and Next.js (CVE-2025-66478) in 2025 -- both CVSS 10.0 RCE vulnerabilities.

**Setup:** Add `.github/workflows/codeql.yml`:
```yaml
name: "CodeQL Analysis"
on:
  push:
    branches: [master]
  pull_request:
    branches: [master]
  schedule:
    - cron: '0 6 * * 1'  # Weekly Monday scan

jobs:
  analyze:
    runs-on: ubuntu-latest
    permissions:
      security-events: write
    steps:
      - uses: actions/checkout@v4
      - uses: github/codeql-action/init@v3
        with:
          languages: javascript-typescript
      - uses: github/codeql-action/analyze@v3
```

**Cost:** Completely free for GitHub repos. Docs: [GitHub CodeQL docs](https://docs.github.com/en/code-security/code-scanning/introduction-to-code-scanning/about-code-scanning-with-codeql)

**Impact:** HIGH | **Effort:** Quick win (5 min)

---

### 1.5 Dependency Vulnerability Scanning

Three complementary tools for supply chain security:

#### npm audit (built-in)
```bash
npm audit          # Check for known vulnerabilities
npm audit --fix    # Auto-fix where possible
```
Add to CI: `npm audit --audit-level=high` fails the build on high/critical vulns.

#### Socket.dev
**What:** Goes beyond known CVE databases to detect supply chain attacks (typosquatting, hidden code, suspicious API usage) with 60+ detection categories. Especially relevant after the devastating 2025 npm supply chain attacks (Shai-Hulud, Chalk/Debug hijack).

**Setup:** Install the [Socket Security GitHub App](https://github.com/apps/socket-security) -- it automatically scans PRs. Also available as a CLI:
```bash
npm i -g sfw  # Socket Firewall Free
```

**Cost:** Free GitHub app for basic scanning. CLI is free.

#### Dependabot (GitHub native)
Enable in repo Settings > Security > Dependabot. Zero config, automatic PRs for vulnerable dependencies.

**Impact:** HIGH | **Effort:** Quick win (15 min total for all three)

---

### 1.6 Bundle Size Monitoring

#### BundleWatch
**What:** Monitors bundle sizes on every PR, failing builds when assets exceed configured limits. Reports results as GitHub PR status checks.

**Setup:**
```bash
npm install -D bundlewatch
```

Add to `package.json`:
```json
{
  "bundlewatch": {
    "files": [
      { "path": ".next/static/chunks/*.js", "maxSize": "200kB" },
      { "path": ".next/static/css/*.css", "maxSize": "50kB" }
    ]
  }
}
```

GitHub Actions:
```yaml
- name: BundleWatch
  run: npx bundlewatch
  env:
    BUNDLEWATCH_GITHUB_TOKEN: ${{ secrets.BUNDLEWATCH_GITHUB_TOKEN }}
```

**Cost:** Free, open source. npm: `bundlewatch`. GitHub: [bundlewatch/bundlewatch](https://github.com/bundlewatch/bundlewatch)

#### Alternative: BundleMon
Similar but with richer GitHub integration (comments on PRs with detailed breakdowns). npm: `bundlemon`. GitHub: [LironEr/bundlemon](https://github.com/LironEr/bundlemon)

**Impact:** MEDIUM | **Effort:** Quick win (15 min)

---

### 1.7 TypeScript Strict Mode Best Practices

You already have `strict: true`. Additional compiler flags to consider:

```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,   // array[0] is T | undefined
    "exactOptionalProperties": true,     // undefined !== missing
    "noPropertyAccessFromIndexSignature": true,  // force bracket notation
    "verbatimModuleSyntax": true         // explicit type imports
  }
}
```

`noUncheckedIndexedAccess` is the single most impactful flag beyond `strict` -- it prevents the #1 source of runtime TypeErrors in TypeScript code (accessing array elements or object properties that might not exist).

**Impact:** HIGH | **Effort:** Quick win (add flags, fix resulting errors)

---

## 2. Performance & Core Web Vitals

### 2.1 Lighthouse CI - Automated Performance Scoring

**What:** Runs Lighthouse audits on every PR, tracks historical trends, and blocks merges when performance dips below thresholds.

**Why:** Prevents performance regressions from reaching production. Catches LCP, TBT, CLS issues before users see them.

**Setup:**
```bash
npm install -D @lhci/cli
```

Create `lighthouserc.js`:
```js
module.exports = {
  ci: {
    collect: {
      startServerCommand: 'npm run start',
      url: ['http://localhost:3000/', 'http://localhost:3000/dashboard'],
      numberOfRuns: 3,
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 0.95 }],
        'categories:seo': ['error', { minScore: 0.9 }],
        'first-contentful-paint': ['warn', { maxNumericValue: 2000 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 2500 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
      },
    },
    upload: {
      target: 'temporary-public-storage', // Free, results last 7 days
    },
  },
};
```

GitHub Actions:
```yaml
- name: Lighthouse CI
  uses: treosh/lighthouse-ci-action@v12
  with:
    configPath: ./lighthouserc.js
    uploadArtifacts: true
```

**Cost:** Free, open source. npm: `@lhci/cli`. GitHub: [GoogleChrome/lighthouse-ci](https://github.com/GoogleChrome/lighthouse-ci)

**Impact:** HIGH | **Effort:** Moderate (30 min setup + build step required)

---

### 2.2 Unlighthouse - Full-Site Audit

**What:** Crawls your entire site and runs Lighthouse on every page in parallel, producing a unified dashboard. Discovers URLs via sitemap.xml, robots.txt, and internal links.

**Why:** Lighthouse CI tests specific URLs you configure. Unlighthouse finds pages you forgot about. Run it periodically (weekly) or before major releases.

**Setup:**
```bash
npx unlighthouse --site http://localhost:3000
```

For CI (headless):
```bash
npx unlighthouse-ci --site https://your-domain.com --budget 75
```

**Cost:** Free, open source. npm: `unlighthouse`. Docs: [unlighthouse.dev](https://unlighthouse.dev/)

**Impact:** MEDIUM | **Effort:** Quick win (one command)

---

### 2.3 @next/bundle-analyzer

**What:** Generates interactive treemap visualizations of your JavaScript bundles, showing exactly which packages contribute to bundle size.

**Why:** Visual inspection reveals unexpected large dependencies. Next.js 16 also has experimental `next analyze` with Turbopack integration.

**Setup:**
```bash
npm install -D @next/bundle-analyzer
```

In `next.config.ts`:
```ts
import bundleAnalyzer from '@next/bundle-analyzer';

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

export default withBundleAnalyzer(nextConfig);
```

Run: `ANALYZE=true npm run build`

**Cost:** Free, official Next.js package. npm: `@next/bundle-analyzer`

**Impact:** MEDIUM | **Effort:** Quick win (5 min)

---

### 2.4 Partytown - Third-Party Script Offloading

**What:** Offloads third-party scripts (analytics, chat widgets, tracking) to a web worker, freeing the main thread for your application code.

**Why:** Third-party scripts are the #1 cause of poor Core Web Vitals in production. One audit showed Lighthouse Performance jumping from 70 to 99 after adding Partytown.

**Setup:** For Next.js App Router:
```tsx
// app/layout.tsx
import { Partytown } from '@builder.io/partytown/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <head>
        <Partytown forward={['dataLayer.push']} />
        <script
          type="text/partytown"
          dangerouslySetInnerHTML={{
            __html: `/* your analytics script */`,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
```

**Caveat:** Still in beta. Some third-party scripts may not work correctly in a web worker context. Test thoroughly.

**Cost:** Free, open source. npm: `@builder.io/partytown`. GitHub: [QwikDev/partytown](https://github.com/QwikDev/partytown)

**Impact:** HIGH (if using analytics/chat) | **Effort:** Moderate (requires testing each third-party script)

---

### 2.5 Image Optimization Beyond next/image

#### BlurHash
Generates a compact 20-30 character string representing a blurry placeholder. Ideal for database-stored placeholders.
```bash
npm install blurhash sharp
```
Generate: encode the image to a BlurHash string server-side, store in your database, decode client-side to a tiny canvas.

#### CSS-only LQIP (Low Quality Image Placeholders)
A newer approach (2025) using pure inline CSS data URLs. ~150 bytes larger than BlurHash but renders without JavaScript and looks better. Next.js `placeholder="blur"` with `blurDataURL` already supports this pattern.

#### Sharp
Next.js already uses Sharp internally for image optimization. For build-time image processing (generating blur placeholders, resizing thumbnails), use it directly:
```bash
npm install sharp
```

**Recommendation for GWTH:** Use Next.js built-in `placeholder="blur"` with `blurDataURL` generated at build time using Sharp. This covers 95% of use cases without adding BlurHash complexity.

**Impact:** MEDIUM | **Effort:** Quick win (already mostly handled by next/image)

---

### 2.6 Partial Prerendering (PPR)

**What:** PPR combines static and dynamic content in the same route. The server sends a static shell instantly (cached at CDN) with "holes" for dynamic content that streams in via Suspense.

**Why:** Best of both worlds -- static speed for shell + dynamic data for personalization. In Next.js 16 (your stack), PPR is available with the Cache Components feature.

**Setup:** In `next.config.ts`:
```ts
const nextConfig: NextConfig = {
  experimental: {
    ppr: 'incremental',
  },
};
```

Per-route opt-in:
```tsx
export const experimental_ppr = true;

export default async function DashboardPage() {
  return (
    <div>
      {/* Static shell - instant */}
      <h1>Dashboard</h1>
      <Suspense fallback={<Skeleton />}>
        {/* Dynamic - streams in */}
        <UserProgress />
      </Suspense>
    </div>
  );
}
```

**Cost:** Free, built into Next.js 16.

**Impact:** HIGH | **Effort:** Moderate (requires understanding Suspense boundaries)

---

### 2.7 Font Subsetting

**What:** Reduce font file sizes by including only the character sets you need.

**Why:** Inter and JetBrains Mono are already loaded via `next/font/google`, which automatically subsets to the `latin` subset you specified. The framework handles this optimally.

**Additional optimization:** If you only use a specific weight range (e.g., 400-700), you can limit the font weights:
```tsx
const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
});
```

**Impact:** LOW (already handled) | **Effort:** Quick win

---

## 3. Security

### 3.1 Nosecone - Security Headers Library

**What:** A type-safe library from Arcjet for setting security headers (CSP, HSTS, X-Frame-Options, etc.) in Next.js middleware. Provides pragmatic defaults that score well on Mozilla Observatory.

**Why:** Manually configuring security headers is error-prone. Nosecone provides type-safe configuration with sensible defaults that satisfy PCI DSS 4.0 requirements (effective 2025). It's the recommended approach over hand-rolling CSP in middleware.

**Setup:**
```bash
npm install @nosecone/next
```

In `middleware.ts`:
```ts
import { createMiddleware } from "@nosecone/next";

export default createMiddleware({
  // Defaults are secure. Override as needed:
  contentSecurityPolicy: {
    directives: {
      scriptSrc: ["'self'", "'unsafe-inline'"], // Adjust for your needs
      imgSrc: ["'self'", "data:", "blob:"],
    },
  },
});
```

**Cost:** Free, open source. npm: `@nosecone/next`, `nosecone`. Docs: [docs.arcjet.com/nosecone](https://docs.arcjet.com/nosecone/quick-start)

**Impact:** HIGH | **Effort:** Quick win (15 min)

---

### 3.2 Content Security Policy (CSP) with Nonces

**What:** CSP with nonces allows specific inline scripts to execute while blocking all others. Each page load generates a unique nonce.

**Why:** Prevents XSS attacks. However, nonce-based CSP requires dynamic rendering (no static generation), which impacts performance.

**Trade-off for GWTH:** For a learning platform, most pages can use a hash-based CSP (which works with static generation) instead of nonces. Use Nosecone's defaults which provide a good balance. Only add nonces if you have inline scripts that change per-request.

**Impact:** HIGH | **Effort:** Moderate (Nosecone handles most of it)

---

### 3.3 Arcjet - Comprehensive Security SDK

**What:** All-in-one security SDK for Next.js: bot protection, rate limiting, Shield WAF, email validation. Decisions are made locally with <1ms latency when cached.

**Why:** Combines multiple security concerns into one SDK. The rate limiting is serverless-friendly (unlike Upstash which requires Redis). Bot protection is particularly important for a learning platform (prevents scraping, credential stuffing).

**Setup:**
```bash
npm install @arcjet/next
```

```ts
// lib/arcjet.ts
import arcjet, { shield, rateLimit, detectBot } from "@arcjet/next";

export const aj = arcjet({
  key: process.env.ARCJET_KEY!,
  rules: [
    shield({ mode: "LIVE" }),
    rateLimit({ mode: "LIVE", window: "60s", max: 100 }),
    detectBot({ mode: "LIVE", allow: ["CATEGORY:SEARCH_ENGINE"] }),
  ],
});
```

**Cost:** Free tier available. Docs: [docs.arcjet.com](https://docs.arcjet.com/)

**Impact:** HIGH | **Effort:** Moderate (20 min setup + per-route configuration)

---

### 3.4 Rate Limiting with Upstash

**What:** Serverless-friendly rate limiting using Redis, specifically designed for edge functions and Next.js middleware.

**Why:** Prevents abuse of API routes, login endpoints, and quiz submissions. The free tier (10K requests/day) is sufficient for a learning platform.

**Setup:**
```bash
npm install @upstash/ratelimit @upstash/redis
```

```ts
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "10 s"), // 10 requests per 10 seconds
});
```

**Cost:** Free tier: 10K requests/day. Beyond: $0.20 per 100K requests. npm: `@upstash/ratelimit`. Docs: [upstash.com/docs/redis/sdks/ratelimit-ts](https://upstash.com/docs/redis/sdks/ratelimit-ts/overview)

**Recommendation:** Use Arcjet for general rate limiting (no external dependency). Use Upstash only if you need Redis for other purposes too.

**Impact:** HIGH | **Effort:** Quick win (10 min with Arcjet, 20 min with Upstash)

---

### 3.5 DOMPurify - Input Sanitization

**What:** DOM-only XSS sanitizer for HTML, MathML, and SVG. The industry standard for sanitizing user-generated HTML content.

**Why:** Your MarkdownRenderer component renders lesson content that may include HTML. Even if content is trusted (from your CMS), defense-in-depth requires sanitization before `dangerouslySetInnerHTML`. Critical for any user-generated content (notes, forum posts).

**Setup:**
```bash
npm install dompurify
npm install -D @types/dompurify
```

```tsx
import DOMPurify from 'dompurify';

// Sanitize immediately before rendering
const clean = DOMPurify.sanitize(htmlContent);
return <div dangerouslySetInnerHTML={{ __html: clean }} />;
```

For server-side rendering, use `isomorphic-dompurify`:
```bash
npm install isomorphic-dompurify
```

**Cost:** Free, open source. npm: `dompurify` or `isomorphic-dompurify`. GitHub: [cure53/DOMPurify](https://github.com/cure53/DOMPurify)

**Impact:** HIGH | **Effort:** Quick win (5 min per component)

---

### 3.6 npm Provenance & Supply Chain Security

**What:** npm provenance creates cryptographic proof that a published package was built from a specific repository commit using verified CI/CD. Shown as a provenance badge on npm.

**Why:** 2025 was devastating for npm supply chain security. The Shai-Hulud attack compromised 500+ packages, and the Chalk/Debug hijack affected packages with 2.6 billion weekly downloads. npm killed classic tokens in December 2025, requiring Granular Access Tokens.

**Actions to take:**
1. Enable `npm audit` in CI (already available)
2. Install Socket.dev GitHub App (free)
3. Use `npm ci` (not `npm install`) in CI for lockfile integrity
4. Enable Dependabot in GitHub settings
5. If publishing packages: use `--provenance` flag with npm publish

**Impact:** HIGH | **Effort:** Quick win (15 min)

---

### 3.7 security.txt & Mozilla Observatory

**security.txt:** A standard file at `/.well-known/security.txt` telling security researchers how to report vulnerabilities.

```
# /.well-known/security.txt
Contact: mailto:security@gwth.ai
Preferred-Languages: en
Canonical: https://gwth.ai/.well-known/security.txt
Expires: 2027-01-01T00:00:00.000Z
```

In Next.js, serve via `public/.well-known/security.txt`.

**Mozilla Observatory:** Free online tool that scores your site's security headers. Run it after deploying Nosecone to verify your headers: [observatory.mozilla.org](https://observatory.mozilla.org)

**Impact:** LOW | **Effort:** Quick win (5 min)

---

## 4. Visual Quality & Design

### 4.1 Storybook - Component Development & Documentation

**What:** An isolated development environment for building, testing, and documenting UI components. The Vite-based `@storybook/nextjs-vite` is the recommended framework for Next.js.

**Why:** Develop components in isolation without navigating to specific pages. Auto-generates documentation from your component props. Integrates with Chromatic for visual regression. Essential for maintaining a component library as a solo developer.

**Setup:**
```bash
npx storybook@latest init
```

This auto-detects Next.js and installs `@storybook/nextjs-vite`.

Write stories:
```tsx
// components/course/course-card.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { CourseCard } from './course-card';

const meta: Meta<typeof CourseCard> = {
  component: CourseCard,
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj<typeof CourseCard>;

export const Default: Story = {
  args: {
    course: mockCourse,
    progress: 0.65,
  },
};

export const Completed: Story = {
  args: {
    course: mockCourse,
    progress: 1.0,
  },
};
```

**Cost:** Free, open source. Current version: 10.2+. Docs: [storybook.js.org](https://storybook.js.org/docs/get-started/frameworks/nextjs-vite)

**Impact:** HIGH | **Effort:** Significant (initial setup is quick, but writing stories for all components takes time)

---

### 4.2 Chromatic - Visual Regression Testing (Cloud)

**What:** Cloud-based visual regression testing that captures screenshots of every Storybook story on every PR. Highlights pixel-level changes for review.

**Why:** Catches unintended visual changes (broken layouts, wrong colors, misaligned elements) that unit tests miss. Particularly valuable for dark mode changes.

**Setup:** (requires Storybook)
```bash
npm install -D chromatic
npx chromatic --project-token=<token>
```

**Cost:** Free: 5,000 snapshots/month, Chrome only. Paid: starts at $149/month for 35,000 snapshots. For a solo developer, the free tier is likely sufficient.

**Alternative (Free):** Use Playwright's built-in screenshot comparison:
```ts
await expect(page).toHaveScreenshot('dashboard-light.png');
await expect(page).toHaveScreenshot('dashboard-dark.png');
```
This is free and already in your stack, but lacks Chromatic's review UI.

**Recommendation:** Start with Playwright screenshot tests (free). Add Chromatic if you need the visual review workflow.

**Impact:** MEDIUM | **Effort:** Quick win (with Playwright), Moderate (with Chromatic/Storybook)

---

### 4.3 CSS Container Queries

**What:** Allow component styles to adapt based on the parent container's size rather than the viewport. Now production-ready in all major browsers (2025).

**Why:** Your CourseCard, LabCard, and LessonNav components appear in different contexts (full-width grid, sidebar, mobile). Container queries let the component itself decide its layout, not the page.

**Setup with Tailwind CSS v4:**
```tsx
// Parent container
<div className="@container">
  {/* Child responds to container width */}
  <div className="@lg:grid-cols-2 @sm:flex-col">
    {/* ... */}
  </div>
</div>
```

Install the Tailwind container query plugin if not already included in v4:
```bash
npm install @tailwindcss/container-queries
```

**Best practice:** Use media queries for macro layout (page columns), container queries for micro layout (card internals, widgets).

**Cost:** Free, built into CSS. Plugin: `@tailwindcss/container-queries`

**Impact:** MEDIUM | **Effort:** Quick win per component

---

### 4.4 AutoAnimate - Zero-Config Animations

**What:** A 2.3KB drop-in animation utility that automatically applies smooth FLIP transitions when DOM elements are added, removed, or reordered. Works with React via a hook.

**Why:** You already use Motion (framer-motion successor) for intentional animations. AutoAnimate is complementary -- it handles the "everything else" (lists sorting, accordion toggles, tab switches) with zero configuration. 13K+ GitHub stars.

**Setup:**
```bash
npm install @formkit/auto-animate
```

```tsx
import { useAutoAnimate } from '@formkit/auto-animate/react';

function LessonList({ lessons }) {
  const [parent] = useAutoAnimate();
  return (
    <ul ref={parent}>
      {lessons.map(lesson => <li key={lesson.id}>{lesson.title}</li>)}
    </ul>
  );
}
```

**Cost:** Free, open source. npm: `@formkit/auto-animate`. Docs: [auto-animate.formkit.com](https://auto-animate.formkit.com/)

**Impact:** LOW (you already have Motion) | **Effort:** Quick win

---

### 4.5 View Transitions API

**What:** A browser-native API for animating transitions between DOM states (page navigations, element changes). React 19 includes an experimental `<ViewTransition>` component.

**Why:** Native browser animations are smoother and more performant than JavaScript-driven transitions. Firefox added support in October 2025, making it Baseline Newly Available.

**Setup:** In `next.config.ts`:
```ts
const nextConfig: NextConfig = {
  experimental: {
    viewTransition: true,
  },
};
```

```tsx
import { ViewTransition } from 'react';

<ViewTransition name="page-transition">
  {children}
</ViewTransition>
```

**Caveat:** Still experimental in React 19 / Next.js 16. The `next-view-transitions` library provides a more stable API for basic use cases.

**Cost:** Free, built into browsers and React. npm: `next-view-transitions` (for stable API). GitHub: [shuding/next-view-transitions](https://github.com/shuding/next-view-transitions)

**Impact:** MEDIUM | **Effort:** Moderate (experimental, may need workarounds)

---

### 4.6 Skeleton Loading Patterns

**Best practice:** Skeletons should match the actual content layout exactly. For a learning platform:

```tsx
// components/course/course-card-skeleton.tsx
export function CourseCardSkeleton() {
  return (
    <div className="rounded-lg border">
      <Skeleton className="aspect-video w-full rounded-t-lg" />
      <div className="p-4 space-y-2">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-1/2" />
        <div className="flex items-center gap-2 mt-4">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
    </div>
  );
}
```

Create one skeleton per card/component type. Use in `loading.tsx` files with the correct grid layout to minimize CLS.

**Impact:** HIGH (for perceived performance) | **Effort:** Moderate (one per component type)

---

## 5. Testing Beyond What You Have

### 5.1 Stryker - Mutation Testing

**What:** Introduces small code changes (mutations) to your source code and checks if your tests catch them. If a mutation survives (tests still pass), your test suite has a gap.

**Why:** Code coverage is a lie -- 80% coverage doesn't mean 80% of behavior is tested. Mutation testing measures actual test effectiveness. Stryker supports TypeScript, React, and Vitest with incremental mode for large codebases.

**Setup:**
```bash
npm install -D @stryker-mutator/core @stryker-mutator/vitest-runner @stryker-mutator/typescript-checker
npx stryker init
```

`stryker.config.mjs`:
```js
export default {
  testRunner: "vitest",
  checkers: ["typescript"],
  tsconfigFile: "tsconfig.json",
  mutate: ["src/lib/**/*.ts", "!src/lib/**/*.test.ts"],
  incremental: true, // Only test changed code
};
```

Run: `npx stryker run`

**Cost:** Free, open source. GitHub: [stryker-mutator/stryker-js](https://github.com/stryker-mutator/stryker-js)

**Impact:** HIGH (for test quality) | **Effort:** Significant (slow runs, requires interpretation)

---

### 5.2 fast-check - Property-Based Testing

**What:** Instead of writing specific test cases, you define properties that should always hold true. fast-check generates random inputs and finds the minimal failing case (shrinking).

**Why:** Catches edge cases you'd never think to test manually. Trusted by Jest, Ramda, fp-ts. Works with Vitest without special integration.

**Setup:**
```bash
npm install -D fast-check
```

```ts
import { test, expect } from 'vitest';
import fc from 'fast-check';
import { calculateQuizScore } from './quiz-engine';

test('quiz score is always between 0 and 100', () => {
  fc.assert(
    fc.property(
      fc.array(fc.record({
        questionId: fc.string(),
        selectedOption: fc.integer({ min: 0, max: 3 }),
        correctOption: fc.integer({ min: 0, max: 3 }),
      })),
      (answers) => {
        const score = calculateQuizScore(answers);
        expect(score).toBeGreaterThanOrEqual(0);
        expect(score).toBeLessThanOrEqual(100);
      }
    )
  );
});
```

**Cost:** Free, open source. npm: `fast-check`. Docs: [fast-check.dev](https://fast-check.dev/)

**Impact:** MEDIUM | **Effort:** Quick win per test (learning the paradigm takes time)

---

### 5.3 Playwright Component Testing

**What:** Test individual React components in a real browser without an E2E server, using `@playwright/experimental-ct-react`.

**Why:** Sits between Vitest (JSDOM, fast but not real browser) and full E2E Playwright tests (real browser, but slow and needs full app). Ideal for testing complex interactive components like QuizEngine, VideoPlayer, and LessonNav in a real browser.

**Setup:**
```bash
npm install -D @playwright/experimental-ct-react
```

```tsx
// components/quiz/quiz-engine.spec.tsx
import { test, expect } from '@playwright/experimental-ct-react';
import { QuizEngine } from './quiz-engine';

test('renders questions and calculates score', async ({ mount }) => {
  const component = await mount(
    <QuizEngine questions={mockQuestions} onComplete={vi.fn()} />
  );
  await component.getByRole('radio', { name: 'Option A' }).click();
  await component.getByRole('button', { name: 'Submit' }).click();
  await expect(component.getByText('Score:')).toBeVisible();
});
```

**Cost:** Free, part of Playwright. Docs: [playwright.dev/docs/test-components](https://playwright.dev/docs/test-components)

**Impact:** MEDIUM | **Effort:** Moderate (experimental, separate from Vitest)

---

### 5.4 k6 - Load Testing

**What:** Open-source load testing tool by Grafana, written in Go with JavaScript/TypeScript test scripts. Includes browser-based testing for frontend metrics (LCP, CLS, TBT).

**Why:** Before launch, you need to know how many concurrent students your Coolify/Docker setup can handle. k6 Browser can run real Chromium sessions alongside protocol-level load.

**Setup:**
```bash
# Install k6 (binary, not npm)
# Windows: choco install k6
# Or download from https://k6.io
```

```js
// load-test.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 20 },  // Ramp up to 20 users
    { duration: '1m', target: 20 },   // Stay at 20
    { duration: '10s', target: 0 },   // Ramp down
  ],
};

export default function () {
  const res = http.get('https://gwth.ai/');
  check(res, { 'status 200': (r) => r.status === 200 });
  sleep(1);
}
```

Run: `k6 run load-test.js`

**Cost:** Free, open source. Cloud: Grafana Cloud k6 has a free tier. GitHub: [grafana/k6](https://github.com/grafana/k6). Docs: [k6.io](https://k6.io)

**Impact:** HIGH (before launch) | **Effort:** Moderate (writing realistic scenarios)

---

### 5.5 Test Coverage Thresholds

**What:** Configure Vitest to fail if coverage drops below a threshold.

**Why:** Prevents gradual erosion of test coverage. Enforce per-file and global thresholds.

**Setup:** In `vitest.config.ts`:
```ts
export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/**/*.stories.tsx', 'src/**/*.test.{ts,tsx}', 'src/components/ui/**'],
      thresholds: {
        lines: 70,
        functions: 70,
        branches: 65,
        statements: 70,
        // Per-file minimum (no single file below 50%)
        perFile: true,
      },
    },
  },
});
```

**Cost:** Free, built into Vitest. Docs: [vitest.dev/config/coverage](https://vitest.dev/config/coverage)

**Impact:** HIGH | **Effort:** Quick win (config change)

---

## 6. Monitoring & Observability

### 6.1 Sentry - Error Tracking & Session Replay

**What:** Error tracking, performance monitoring, and session replay for Next.js. Already planned in your stack.

**Why:** Captures errors with full stack traces, breadcrumbs, and video-like session replays showing exactly how users triggered issues. The Next.js SDK understands App Router, Server Components, edge middleware.

**Setup:**
```bash
npx @sentry/wizard@latest -i nextjs
```

This creates `sentry.client.config.ts`, `sentry.server.config.ts`, `sentry.edge.config.ts`, and wraps your `next.config.ts`.

Key configuration:
```ts
// sentry.client.config.ts
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1,           // 10% of transactions
  replaysSessionSampleRate: 0.1,    // 10% of sessions
  replaysOnErrorSampleRate: 1.0,    // 100% of error sessions
  integrations: [
    Sentry.replayIntegration({
      maskAllText: false,           // Learning platform -- text is the content
      blockAllMedia: false,
    }),
  ],
});
```

**Cost:** Free: 5K errors, 10K transactions, 50 replays/month. Paid: starts at $26/month. Docs: [docs.sentry.io/platforms/javascript/guides/nextjs](https://docs.sentry.io/platforms/javascript/guides/nextjs/)

**Impact:** HIGH | **Effort:** Quick win (15 min with wizard)

---

### 6.2 PostHog - Product Analytics, Feature Flags, Session Replay

**What:** All-in-one open-source platform: product analytics, session replay, feature flags, A/B testing, surveys. Can self-host or use cloud.

**Why:** Replaces 5+ separate tools. The connection between analytics and session replays is unique -- when you see a drop-off in your course completion funnel, you're two clicks from watching the exact sessions where users dropped off. Feature flags enable safe deployments.

**Free tier:**
- 1M analytics events/month
- 5,000 session recordings/month
- 1M feature flag requests/month
- 250 survey responses/month
- Unlimited team members

**Setup:**
```bash
npm install posthog-js
```

```tsx
// providers/posthog-provider.tsx
'use client';
import posthog from 'posthog-js';
import { PostHogProvider } from 'posthog-js/react';

if (typeof window !== 'undefined') {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
    capture_pageview: false, // Manual capture for App Router
  });
}

export function PHProvider({ children }: { children: React.ReactNode }) {
  return <PostHogProvider client={posthog}>{children}</PostHogProvider>;
}
```

**Self-hosting option:** Docker image available, but the cloud free tier is generous enough for a learning platform.

**Cost:** Free tier is very generous. Paid: usage-based. Docs: [posthog.com](https://posthog.com). GitHub: [PostHog/posthog](https://github.com/PostHog/posthog)

**Impact:** HIGH | **Effort:** Moderate (30 min setup + event instrumentation over time)

---

### 6.3 Web Vitals Reporting in Production

**What:** Next.js provides `useReportWebVitals` to capture real user performance metrics (LCP, INP, CLS, FCP, TTFB) and send them to your analytics.

**Why:** Lab tests (Lighthouse) don't reflect real user experience. Field data from actual users is what Google uses for ranking.

**Setup:**
```tsx
// app/web-vitals.tsx
'use client';
import { useReportWebVitals } from 'next/web-vitals';

export function WebVitals() {
  useReportWebVitals((metric) => {
    // Send to your analytics (PostHog, Sentry, custom endpoint)
    console.log(metric.name, metric.value);

    // Example: send to PostHog
    posthog.capture('web_vital', {
      metric_name: metric.name,
      metric_value: metric.value,
      metric_rating: metric.rating, // 'good' | 'needs-improvement' | 'poor'
    });
  });
  return null;
}
```

Add `<WebVitals />` to your root layout.

**Cost:** Free, built into Next.js. Docs: [nextjs.org/docs/pages/api-reference/functions/use-report-web-vitals](https://nextjs.org/docs/pages/api-reference/functions/use-report-web-vitals)

**Impact:** HIGH | **Effort:** Quick win (10 min)

---

### 6.4 Feature Flags - Unleash (Self-Hosted)

**What:** Open-source feature flag management with 25+ SDKs, web UI, and advanced targeting rules.

**Why:** Deploy code to production without releasing features. Gradually roll out new course content, A/B test onboarding flows, or kill-switch a broken feature. Self-hostable with Docker.

**Self-hosting:**
```bash
docker run -p 4242:4242 \
  -e DATABASE_URL=postgres://user:pass@host/unleash \
  unleashorg/unleash-server
```

**Alternative:** Use PostHog's feature flags (already in the stack if you adopt PostHog). This avoids running another service.

**Cost:** Free to self-host. Cloud: $75/seat/month. GitHub: [Unleash/unleash](https://github.com/Unleash/unleash)

**Recommendation:** Use PostHog feature flags (bundled free) rather than self-hosting Unleash.

**Impact:** MEDIUM | **Effort:** Quick win (with PostHog), Significant (self-hosting Unleash)

---

### 6.5 Statsig - A/B Testing & Experimentation

**What:** Combined A/B testing, feature flags, analytics, and session replay platform. Free tier includes 2M events and unlimited feature flags.

**Why:** Advanced statistics (CUPED variance reduction, sequential testing) help reach significance 30-50% faster. Used by OpenAI, Notion, Brex.

**Cost:** Free: 2M events, unlimited flags, 50K replays. Docs: [statsig.com](https://www.statsig.com/)

**Recommendation:** For a solo developer, PostHog covers both analytics and basic experimentation. Consider Statsig only if you need advanced statistical rigor for A/B tests.

**Impact:** LOW (for solo dev) | **Effort:** Moderate

---

## 7. Developer Experience

### 7.1 Commitlint - Conventional Commits

**What:** Lints commit messages against the Conventional Commits standard (feat:, fix:, docs:, etc.). Integrates with Husky's commit-msg hook.

**Why:** Consistent commit messages enable automated changelogs, semantic versioning, and clear git history. Particularly useful when AI tools generate commits.

**Setup:**
```bash
npm install -D @commitlint/cli @commitlint/config-conventional
```

Create `.commitlintrc.json`:
```json
{
  "extends": ["@commitlint/config-conventional"]
}
```

Add Husky hook:
```bash
npx husky add .husky/commit-msg 'npx commitlint --edit $1'
```

**Cost:** Free, open source. npm: `@commitlint/cli`, `@commitlint/config-conventional`. GitHub: [conventional-changelog/commitlint](https://github.com/conventional-changelog/commitlint)

**Impact:** MEDIUM | **Effort:** Quick win (10 min, you already have Husky)

---

### 7.2 Renovate - Automated Dependency Updates

**What:** Automated dependency update PRs with grouping, automerge, and scheduling. Supports 90+ package managers including Docker.

**Why:** Superior to Dependabot for solo developers: groups common dependencies into single PRs, has built-in automerge for patch updates, supports Docker file updates (important for Coolify), and allows shared config presets.

**Setup:** Install the [Renovate GitHub App](https://github.com/apps/renovate). It auto-creates a `renovate.json` config PR.

Recommended config for a solo dev:
```json
{
  "$schema": "https://docs.renovatebot.com/renovate-schema.json",
  "extends": [
    "config:recommended",
    "schedule:weekly",
    ":automergeMinor",
    ":automergePatch"
  ],
  "packageRules": [
    {
      "matchPackagePatterns": ["@types/*"],
      "automerge": true
    },
    {
      "groupName": "shadcn dependencies",
      "matchPackagePatterns": ["@radix-ui/*", "class-variance-authority", "clsx"]
    }
  ]
}
```

**Cost:** Free for public and private repos via GitHub App. Docs: [docs.renovatebot.com](https://docs.renovatebot.com/)

**Impact:** HIGH | **Effort:** Quick win (5 min to install app)

---

### 7.3 Coolify PR Preview Deployments

**What:** Coolify automatically deploys new versions of your application when PRs are opened, with unique URLs per PR. Preview deployments are deleted when PRs are merged/closed.

**Why:** See changes in a real environment before merging. Each preview gets its own URL template (e.g., `pr-{{pr_id}}.preview.gwth.ai`). Environment variables are separated from production.

**Setup:** In Coolify dashboard:
1. Go to your application settings
2. Enable "Preview Deployments"
3. Configure the URL template (e.g., `{{pr_id}}.preview.gwth.ai`)
4. Set preview-specific environment variables

Production secrets are never exposed to preview deployments.

**Cost:** Free (part of Coolify). Docs: [coolify.io/docs/applications/ci-cd/github/preview-deploy](https://coolify.io/docs/applications/ci-cd/github/preview-deploy)

**Impact:** HIGH | **Effort:** Quick win (5 min in Coolify dashboard)

---

### 7.4 Git Hooks Beyond pre-commit

You already have Husky for pre-commit. Add these hooks:

#### commit-msg (Commitlint)
```bash
# .husky/commit-msg
npx commitlint --edit $1
```

#### pre-push (Run tests before pushing)
```bash
# .husky/pre-push
npm run test:ci
npm run build
```

#### post-merge (Auto-install deps after pulling)
```bash
# .husky/post-merge
npm install
```

**Impact:** MEDIUM | **Effort:** Quick win (5 min per hook)

---

### 7.5 Documentation Generators

#### TypeDoc (API docs from TSDoc comments)
```bash
npm install -D typedoc
npx typedoc src/lib/types.ts src/lib/data/*.ts --out docs/api
```
Generates HTML docs from your JSDoc/TSDoc comments. Great for documenting your data layer API.

#### Fumadocs (Full documentation site)
A Next.js-based documentation framework with MDX support, TypeScript Twoslash, search, and beautiful defaults. Overkill for GWTH unless you need public API docs or a separate docs site.

**Recommendation:** Use TypeDoc for internal API documentation. Skip Fumadocs unless you need a public-facing docs site.

**Cost:** Both free, open source. TypeDoc: [typedoc.org](https://typedoc.org/). Fumadocs: [fumadocs.dev](https://www.fumadocs.dev/)

**Impact:** LOW | **Effort:** Quick win (TypeDoc), Significant (Fumadocs)

---

## 8. SEO & Marketing

### 8.1 JSON-LD Structured Data for Educational Content

**What:** Schema.org markup that tells search engines this is an educational course, enabling rich results in Google.

**Why:** Google's Course structured data enables enhanced search appearances. As Google moves toward AI/LLM-based search, structured data becomes even more important for content understanding.

**Implementation:**
```tsx
// app/(public)/page.tsx or course detail page
const courseJsonLd = {
  "@context": "https://schema.org",
  "@type": "Course",
  "name": "GWTH AI Development Course",
  "description": "Master AI development with hands-on projects",
  "provider": {
    "@type": "Organization",
    "name": "GWTH.ai",
    "sameAs": "https://gwth.ai"
  },
  "courseMode": "online",
  "educationalLevel": "intermediate",
  "inLanguage": "en",
  "hasCourseInstance": {
    "@type": "CourseInstance",
    "courseMode": "online",
    "courseWorkload": "P3M", // 3 months
  },
  "teaches": [
    "AI application development",
    "Machine learning fundamentals",
  ],
};

// In component
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{ __html: JSON.stringify(courseJsonLd) }}
/>
```

For lessons, use `LearningResource`:
```tsx
const lessonJsonLd = {
  "@context": "https://schema.org",
  "@type": ["VideoObject", "LearningResource"],
  "name": lesson.title,
  "description": lesson.description,
  "duration": `PT${lesson.duration}M`,
  "educationalLevel": lesson.difficulty,
  "isPartOf": {
    "@type": "Course",
    "name": course.title,
  },
};
```

**Cost:** Free. Validate at [Google Rich Results Test](https://search.google.com/test/rich-results). Schema docs: [schema.org/Course](https://schema.org/Course), [schema.org/LearningResource](https://schema.org/LearningResource)

**Impact:** HIGH | **Effort:** Quick win (copy-paste patterns)

---

### 8.2 Dynamic Open Graph Images with next/og

**What:** Generate custom social media preview images on-the-fly using JSX and CSS (flexbox only). Built into Next.js via `next/og` using Satori under the hood.

**Why:** Every course and lesson gets a unique, branded OG image for social sharing without manually designing hundreds of images.

**Setup:**
```tsx
// app/course/[slug]/opengraph-image.tsx
import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Course thumbnail';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function OGImage({ params }: { params: { slug: string } }) {
  const course = await getCourse(params.slug);

  return new ImageResponse(
    (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '60px',
        background: 'linear-gradient(135deg, #0D4F4F, #33BBFF)',
        width: '100%',
        height: '100%',
        color: 'white',
        fontFamily: 'Inter',
      }}>
        <div style={{ fontSize: 60, fontWeight: 700 }}>{course?.title}</div>
        <div style={{ fontSize: 28, marginTop: 20, opacity: 0.8 }}>
          {course?.description}
        </div>
        <div style={{ fontSize: 24, marginTop: 'auto' }}>GWTH.ai</div>
      </div>
    ),
    { ...size }
  );
}
```

Next.js automatically serves this at `/course/[slug]/opengraph-image` and adds the `og:image` meta tag.

**Cost:** Free, built into Next.js. Docs: [nextjs.org/docs/app/getting-started/metadata-and-og-images](https://nextjs.org/docs/app/getting-started/metadata-and-og-images)

**Impact:** HIGH | **Effort:** Quick win (per route, 15 min each)

---

### 8.3 PWA Basics

**What:** Progressive Web App features: web manifest, service worker, offline support, installability.

**Why:** Students can install the learning platform as an app on their phone/desktop. Offline support enables reviewing downloaded lesson content without internet.

**Setup:** Using Serwist (successor to next-pwa):
```bash
npm install @serwist/next
```

Create `public/manifest.json`:
```json
{
  "name": "GWTH.ai - Learn AI Development",
  "short_name": "GWTH",
  "start_url": "/dashboard",
  "display": "standalone",
  "background_color": "#F5F5F5",
  "theme_color": "#33BBFF",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

Or use Next.js built-in manifest support:
```tsx
// app/manifest.ts
import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'GWTH.ai',
    short_name: 'GWTH',
    start_url: '/dashboard',
    display: 'standalone',
    background_color: '#F5F5F5',
    theme_color: '#33BBFF',
  };
}
```

**Cost:** Free. npm: `@serwist/next` (for service worker). Docs: [nextjs.org/docs/app/guides/progressive-web-apps](https://nextjs.org/docs/app/guides/progressive-web-apps)

**Impact:** MEDIUM | **Effort:** Moderate (manifest is quick, offline support is significant)

---

### 8.4 Web Share API

**What:** Native OS sharing from the browser -- share course links, lesson progress, or certificates via the device's share sheet.

**Why:** Students sharing their progress or course links is free marketing. Works on mobile and desktop.

**Implementation:**
```tsx
'use client';

function ShareButton({ title, text, url }: { title: string; text: string; url: string }) {
  const canShare = typeof navigator !== 'undefined' && navigator.share;

  if (!canShare) return null; // Graceful degradation

  return (
    <Button
      onClick={async () => {
        try {
          await navigator.share({ title, text, url });
        } catch (err) {
          // User cancelled or error -- ignore
        }
      }}
    >
      <Share2 className="h-4 w-4 mr-2" />
      Share
    </Button>
  );
}
```

**Cost:** Free, built into browsers. MDN: [Web Share API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Share_API)

**Impact:** LOW | **Effort:** Quick win (10 min)

---

### 8.5 RSS Feed for Course Updates

**What:** An RSS/Atom feed that notifies subscribers when new lessons or courses are published.

**Why:** Students and RSS readers can follow course updates. Also enables integration with email marketing tools.

**Implementation:**
```tsx
// app/feed.xml/route.ts
export async function GET() {
  const lessons = await getRecentLessons();

  const feed = `<?xml version="1.0" encoding="UTF-8"?>
    <rss version="2.0">
      <channel>
        <title>GWTH.ai Course Updates</title>
        <link>https://gwth.ai</link>
        <description>New lessons and course content</description>
        ${lessons.map(lesson => `
          <item>
            <title>${lesson.title}</title>
            <link>https://gwth.ai/course/${lesson.courseSlug}/lesson/${lesson.slug}</link>
            <description>${lesson.description}</description>
            <pubDate>${new Date(lesson.publishedAt).toUTCString()}</pubDate>
          </item>
        `).join('')}
      </channel>
    </rss>`;

  return new Response(feed, {
    headers: { 'Content-Type': 'application/rss+xml' },
  });
}
```

**Impact:** LOW | **Effort:** Quick win (15 min)

---

## 9. Accessibility Beyond axe-core

### 9.1 Guidepup - Automated Screen Reader Testing

**What:** Screen reader driver for test automation supporting NVDA (Windows) and VoiceOver (macOS). Integrates with Playwright.

**Why:** axe-core catches ~30% of accessibility issues (the automated ones). Real screen reader testing catches the rest -- broken focus order, missing announcements, confusing navigation patterns. NVDA alone uncovers 90% of screen reader compatibility issues.

**Setup:**
```bash
npm install -D @guidepup/guidepup @guidepup/playwright
```

```ts
import { voiceOver } from '@guidepup/guidepup';

test('lesson navigation is announced correctly', async () => {
  await voiceOver.start();
  await voiceOver.navigate(); // Move to next element
  const spoken = await voiceOver.lastSpokenPhrase();
  expect(spoken).toContain('Lesson 1');
  await voiceOver.stop();
});
```

**Caveat:** NVDA testing only works on Windows CI runners. VoiceOver only on macOS. For GitHub Actions, use macOS runners for VoiceOver tests.

**Cost:** Free, open source. npm: `@guidepup/guidepup`. Docs: [guidepup.dev](https://www.guidepup.dev/)

**Impact:** HIGH | **Effort:** Significant (requires learning screen reader testing patterns)

---

### 9.2 Focus Management Patterns

Key patterns for a learning platform:

```tsx
// After quiz submission, move focus to results
const resultsRef = useRef<HTMLDivElement>(null);
useEffect(() => {
  if (quizSubmitted) {
    resultsRef.current?.focus();
  }
}, [quizSubmitted]);

<div ref={resultsRef} tabIndex={-1} aria-live="polite">
  Your score: {score}%
</div>
```

```tsx
// Trap focus in modal/dialog (shadcn Dialog handles this)
// Skip link at top of page
<a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-background focus:p-4 focus:rounded">
  Skip to main content
</a>
```

```tsx
// ARIA live region for progress updates
<div aria-live="polite" aria-atomic="true" className="sr-only">
  Lesson progress: {Math.round(progress * 100)}% complete
</div>
```

**Impact:** HIGH | **Effort:** Moderate (per component)

---

### 9.3 Reduced Motion Patterns

```tsx
// hooks/use-reduced-motion.ts
import { useEffect, useState } from 'react';

export function useReducedMotion() {
  const [prefersReduced, setPrefersReduced] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReduced(mql.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReduced(e.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);

  return prefersReduced;
}
```

Use in Motion components:
```tsx
const shouldReduce = useReducedMotion();

<motion.div
  initial={shouldReduce ? false : { opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={shouldReduce ? { duration: 0 } : { duration: 0.5 }}
>
```

Also add CSS fallback:
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

**Impact:** HIGH | **Effort:** Quick win (CSS) + Moderate (per component)

---

### 9.4 High Contrast Mode Support

```css
/* globals.css */
@media (forced-colors: active) {
  .status-badge {
    border: 2px solid ButtonText;
  }
  .progress-ring circle {
    stroke: Highlight;
  }
}
```

Forced-colors mode (Windows High Contrast) overrides your colors. Ensure meaning is conveyed through text/icons, not just color.

**Impact:** MEDIUM | **Effort:** Quick win

---

### 9.5 Accessibility Statement

Create a page at `/accessibility` describing your commitment, conformance level (WCAG 2.1 AA), known limitations, and contact for issues. Several generators exist:
- [W3C Accessibility Statement Generator](https://www.w3.org/WAI/planning/statements/generator/)
- Template: describe scope, standards, limitations, feedback mechanism

**Impact:** LOW | **Effort:** Quick win (30 min)

---

## 10. AI-Assisted Development

### 10.1 Claude Code Hooks for Quality Gates

**What:** Claude Code hooks are commands, prompts, or agents that execute automatically at specific lifecycle points (PreToolUse, PostToolUse, Stop, etc.).

**Why:** Enforce quality gates without relying on the AI to remember a checklist. The Stop hook runs after every Claude Code response, catching issues before they're committed.

**Setup:** In `.claude/settings.json` (or project-level):
```json
{
  "hooks": {
    "Stop": [
      {
        "type": "command",
        "command": "npm run lint && npm run type-check",
        "description": "Lint and type check after changes"
      },
      {
        "type": "command",
        "command": "npm test -- --run --reporter=verbose",
        "description": "Run tests before completing"
      }
    ],
    "PreToolUse": [
      {
        "matcher": "Write|Edit",
        "type": "command",
        "command": "echo 'File modification detected'",
        "description": "Log file modifications"
      }
    ]
  }
}
```

**Advanced: Agent hooks** for deep analysis:
```json
{
  "type": "agent",
  "prompt": "Review the changes made in this session. Check for: 1) Missing JSDoc comments on exports, 2) Missing error boundaries, 3) Hardcoded values that should be in config.ts, 4) Missing loading states",
  "description": "Code review agent"
}
```

**Cost:** Free, built into Claude Code. Docs: [code.claude.com/docs/en/hooks](https://code.claude.com/docs/en/hooks)

**Impact:** HIGH | **Effort:** Quick win (10 min per hook)

---

### 10.2 MCP Servers for Development

Useful MCP servers for your workflow:

| Server | Purpose | Setup |
|--------|---------|-------|
| **GitHub MCP** | Manage PRs, issues, commits from Claude | Built into Claude Code |
| **Playwright MCP** | Browser testing and visual inspection | Already configured |
| **PostgreSQL MCP** | Query database directly from Claude | When backend is added |
| **Socket MCP** | Security scanning from Claude | `npx socket-mcp` |

**Discovery:** [github.com/punkpeye/awesome-mcp-servers](https://github.com/punkpeye/awesome-mcp-servers)

**Impact:** MEDIUM | **Effort:** Quick win per server

---

### 10.3 CodeRabbit - AI Code Review

**What:** AI-powered code review that runs on every PR. Provides summaries, inline suggestions, and can be conversed with in PR comments.

**Why:** As a solo developer, you don't have a code review partner. CodeRabbit provides a "second pair of eyes" on every PR, catching bugs, suggesting improvements, and explaining changes.

**Free tier:** PR summarization and basic reviews. Pro: $24-30/month for comprehensive reviews including code graph analysis and documentation context.

**Setup:** Install the [CodeRabbit GitHub App](https://github.com/apps/coderabbitai). Zero config required.

Optional `.coderabbit.yaml`:
```yaml
reviews:
  request_changes_workflow: true
  high_level_summary: true
  poem: false  # Skip the poem
  auto_review:
    enabled: true
    drafts: false
language: en
```

**Cost:** Free for PR summaries. Pro: ~$24/month. Docs: [coderabbit.ai](https://www.coderabbit.ai/)

**Impact:** HIGH | **Effort:** Quick win (2 min to install app)

---

### 10.4 CLAUDE.md Optimization

Your project CLAUDE.md is already excellent. Additional patterns to consider:

```markdown
## Quality Checklist (Claude Code should verify these)

Before completing any task:
- [ ] All new exports have JSDoc comments
- [ ] Loading states exist for all new routes
- [ ] Error boundaries exist for all new route groups
- [ ] Dark mode works for all new components
- [ ] Mobile responsive (check at 375px width)
- [ ] No hardcoded colors (use CSS variables)
- [ ] No hardcoded dimensions (use config.ts constants)
```

```markdown
## Forbidden Patterns

- NEVER use `any` type. Use `unknown` and narrow.
- NEVER use `dangerouslySetInnerHTML` without DOMPurify
- NEVER import from `components/ui/` in test files (test the wrapper, not the primitive)
- NEVER use `console.log` in committed code (use proper logging or remove)
```

**Impact:** HIGH | **Effort:** Quick win (15 min to add sections)

---

## 11. Priority Matrix

### Immediate Quick Wins (Do This Week)

| Tool | Category | Impact | Time |
|------|----------|--------|------|
| CodeQL | Security | HIGH | 5 min |
| Dependabot + Socket.dev | Security | HIGH | 15 min |
| Knip | Code Quality | HIGH | 10 min |
| Nosecone | Security | HIGH | 15 min |
| Commitlint | DX | MEDIUM | 10 min |
| Renovate | DX | HIGH | 5 min |
| CodeRabbit | AI | HIGH | 2 min |
| Vitest coverage thresholds | Testing | HIGH | 5 min |
| Web Vitals reporting | Monitoring | HIGH | 10 min |
| `noUncheckedIndexedAccess` | Code Quality | HIGH | 5 min |
| Claude Code hooks | AI | HIGH | 10 min |
| DOMPurify | Security | HIGH | 5 min |

**Total: ~1.5 hours for 12 high-impact improvements**

### Short-Term (Next 2 Weeks)

| Tool | Category | Impact | Time |
|------|----------|--------|------|
| Sentry | Monitoring | HIGH | 30 min |
| PostHog | Monitoring | HIGH | 30 min |
| Lighthouse CI | Performance | HIGH | 30 min |
| @next/bundle-analyzer | Performance | MEDIUM | 5 min |
| BundleWatch | Code Quality | MEDIUM | 15 min |
| SonarCloud | Code Quality | MEDIUM | 20 min |
| JSON-LD structured data | SEO | HIGH | 30 min |
| Dynamic OG images | SEO | HIGH | 45 min |
| Coolify PR previews | DX | HIGH | 5 min |
| Skip link + focus management | A11y | HIGH | 1 hr |

### Medium-Term (Next Month)

| Tool | Category | Impact | Time |
|------|----------|--------|------|
| Storybook | Visual | HIGH | 4+ hrs |
| PPR (Partial Prerendering) | Performance | HIGH | 2 hrs |
| fast-check | Testing | MEDIUM | 2 hrs |
| k6 load testing | Testing | HIGH | 3 hrs |
| PWA manifest + service worker | SEO | MEDIUM | 3 hrs |
| CSS Container Queries | Visual | MEDIUM | 2 hrs |
| View Transitions API | Visual | MEDIUM | 2 hrs |
| Reduced motion patterns | A11y | HIGH | 2 hrs |

### Long-Term (When Needed)

| Tool | Category | Impact | Time |
|------|----------|--------|------|
| Stryker mutation testing | Testing | HIGH | 4+ hrs |
| Guidepup screen reader testing | A11y | HIGH | 8+ hrs |
| Biome migration | Code Quality | MEDIUM | 4+ hrs |
| Chromatic | Visual | MEDIUM | 2+ hrs |
| Arcjet full security | Security | HIGH | 2 hrs |
| Partytown | Performance | HIGH | 2+ hrs |
| Unleash self-hosted | Monitoring | MEDIUM | 4+ hrs |

---

## Summary of Recommended Stack Additions

```
Current Stack:
  ESLint + Vitest + Playwright + Husky + GitHub Actions + axe-core

Recommended Additions (Free):
  Code Quality:    Knip, CodeQL, Socket.dev, Dependabot, BundleWatch, noUncheckedIndexedAccess
  Security:        Nosecone, DOMPurify, Arcjet (free tier)
  Performance:     Lighthouse CI, @next/bundle-analyzer, PPR, Unlighthouse
  Monitoring:      Sentry (free tier), PostHog (free tier), Web Vitals reporting
  Testing:         Vitest coverage thresholds, fast-check
  DX:              Commitlint, Renovate, Coolify PR previews, Claude Code hooks
  AI:              CodeRabbit (free tier)
  SEO:             JSON-LD structured data, Dynamic OG images, PWA manifest
  Accessibility:   Focus management, Reduced motion, Skip links

Optional Paid (when budget allows):
  Monitoring:      Sentry Pro ($26/mo), PostHog paid (usage-based)
  AI Review:       CodeRabbit Pro ($24/mo)
  Visual:          Chromatic ($0-149/mo)
  Code Quality:    SonarCloud (free under 50K LoC)
```

---

## Sources

### Code Quality & Static Analysis
- [Knip - Declutter your JavaScript & TypeScript projects](https://knip.dev/)
- [Biome - Toolchain for the web](https://biomejs.dev/)
- [Biome vs ESLint + Prettier: The 2025 Linting Revolution](https://medium.com/better-dev-nextjs-react/biome-vs-eslint-prettier-the-2025-linting-revolution-you-need-to-know-about-ec01c5d5b6c8)
- [SonarCloud - Online Code Review as a Service](https://sonarcloud.io/)
- [About Code Scanning with CodeQL - GitHub Docs](https://docs.github.com/en/code-security/code-scanning/introduction-to-code-scanning/about-code-scanning-with-codeql)
- [BundleWatch - Keep watch of your bundle size](https://github.com/bundlewatch/bundlewatch)
- [Socket.dev - Guide to Socket for GitHub](https://docs.socket.dev/docs/socket-for-github)

### Performance & Core Web Vitals
- [Lighthouse CI - GoogleChrome](https://github.com/GoogleChrome/lighthouse-ci)
- [Lighthouse CI Action - treosh](https://github.com/treosh/lighthouse-ci-action)
- [Unlighthouse - Scan your entire site](https://unlighthouse.dev/)
- [Next.js Partial Prerendering](https://nextjs.org/docs/15/app/getting-started/partial-prerendering)
- [Next.js Bundle Analyzer](https://nextjs.org/docs/app/guides/package-bundling)
- [Partytown - Relocate resource intensive scripts](https://github.com/QwikDev/partytown)
- [BlurHash - Compact placeholder for images](https://blurha.sh/)

### Security
- [Nosecone - Security headers for JS frameworks](https://docs.arcjet.com/nosecone/quick-start)
- [Next.js CSP Guide](https://nextjs.org/docs/app/guides/content-security-policy)
- [Arcjet - Bot detection, rate limiting, attack protection](https://github.com/arcjet/arcjet-js)
- [Upstash Rate Limiting for Next.js](https://upstash.com/blog/nextjs-ratelimiting)
- [DOMPurify - XSS sanitizer](https://github.com/cure53/DOMPurify)
- [npm Provenance - Bridging the missing security layer](https://www.exaforce.com/blogs/npm-provenance-bridging-the-missing-security-layer-in-javascript-libraries)
- [OWASP Secure Headers Project](https://owasp.org/www-project-secure-headers/)
- [Next.js Security Checklist - Arcjet Blog](https://blog.arcjet.com/next-js-security-checklist/)

### Visual Quality & Design
- [Storybook for Next.js with Vite](https://storybook.js.org/docs/get-started/frameworks/nextjs-vite)
- [Chromatic - Visual Regression Testing Pricing](https://www.chromatic.com/pricing)
- [CSS Container Queries in 2026 - LogRocket](https://blog.logrocket.com/container-queries-2026/)
- [AutoAnimate - Add motion with a single line](https://auto-animate.formkit.com/)
- [View Transitions API - Next.js Config](https://nextjs.org/docs/app/api-reference/config/next-config-js/viewTransition)
- [View Transitions in 2025 - Chrome Blog](https://developer.chrome.com/blog/view-transitions-in-2025)

### Testing
- [Stryker Mutator - Mutation testing for JavaScript](https://stryker-mutator.io/)
- [fast-check - Property based testing](https://fast-check.dev/)
- [Playwright Component Testing](https://playwright.dev/docs/test-components)
- [k6 - Load testing for engineering teams](https://k6.io/)
- [Vitest Coverage Configuration](https://vitest.dev/config/coverage)

### Monitoring & Observability
- [Sentry for Next.js](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- [Sentry Session Replay Setup](https://docs.sentry.io/platforms/javascript/guides/nextjs/session-replay/)
- [PostHog - Open-source product analytics](https://github.com/PostHog/posthog)
- [PostHog Analytics 2026 Deep-Dive Review](https://userpilot.com/blog/posthog-analytics/)
- [Statsig - Feature flags and experimentation](https://www.statsig.com/)
- [Unleash - Open-source feature management](https://github.com/Unleash/unleash)
- [Next.js useReportWebVitals](https://nextjs.org/docs/pages/api-reference/functions/use-report-web-vitals)

### Developer Experience
- [Commitlint - Lint commit messages](https://github.com/conventional-changelog/commitlint)
- [Renovate Bot Comparison](https://docs.renovatebot.com/bot-comparison/)
- [Coolify PR Preview Deployments](https://coolify.io/docs/applications/ci-cd/github/preview-deploy)
- [TypeDoc - Documentation generator](https://typedoc.org/)
- [Fumadocs - Documentation framework](https://www.fumadocs.dev/)

### SEO & Marketing
- [Schema.org Course](https://schema.org/Course)
- [Schema.org LearningResource](https://schema.org/LearningResource)
- [Google Course Structured Data](https://developers.google.com/search/docs/appearance/structured-data/course)
- [Next.js OG Image Generation](https://nextjs.org/docs/app/getting-started/metadata-and-og-images)
- [Dynamic OG Images with Next.js 16](https://makerkit.dev/blog/tutorials/dynamic-og-image)
- [Next.js PWA Guide](https://nextjs.org/docs/app/guides/progressive-web-apps)

### Accessibility
- [Guidepup - Screen reader driver for automation](https://www.guidepup.dev/)
- [NVDA vs JAWS vs VoiceOver 2025 Comparison](https://accessibility-test.org/blog/development/screen-readers/nvda-vs-jaws-vs-voiceover-2025-screen-reader-comparison/)
- [Automating Screen Readers - Assistiv Labs](https://assistivlabs.com/articles/automating-screen-readers-for-accessibility-testing)

### AI-Assisted Development
- [Claude Code Hooks Reference](https://code.claude.com/docs/en/hooks)
- [Claude Code Hooks for Production Quality](https://www.pixelmojo.io/blogs/claude-code-hooks-production-quality-ci-cd-patterns)
- [Awesome Claude Code - Skills, Hooks, Plugins](https://github.com/hesreallyhim/awesome-claude-code)
- [CodeRabbit - AI Code Reviews](https://www.coderabbit.ai/)
- [Awesome MCP Servers](https://github.com/punkpeye/awesome-mcp-servers)
- [Best MCP Servers for Developers in 2026](https://www.builder.io/blog/best-mcp-servers-2026)
