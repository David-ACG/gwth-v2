# Automated Development Workflow Setup Guide

> A reusable guide for setting up CI/CD, code quality, testing automation, and Claude Code hooks on any Next.js/TypeScript project. Copy and adapt for new projects.
>
> Last updated: 2026-02-20

---

## Table of Contents

1. [Context Management (Auto-Compact)](#1-context-management-auto-compact)
2. [Pre-Commit Hooks (Husky + lint-staged)](#2-pre-commit-hooks-husky--lint-staged)
3. [GitHub Actions CI/CD](#3-github-actions-cicd)
4. [Claude Code Hooks](#4-claude-code-hooks)
5. [Playwright Testing (Visual Regression + A11y + Dark Mode)](#5-playwright-testing)
6. [Claude Code Prompt for Setting Up Automation](#6-claude-code-prompt)

---

## 1. Context Management (Auto-Compact)

Claude Code defaults to auto-compacting at ~83.5% context usage. For better quality responses, trigger compaction earlier at 60%.

### Setup

Add to your shell profile (`~/.bash_profile`, `~/.bashrc`, or `~/.zshrc`):

```bash
# Claude Code: auto-compact at 60% context usage
export CLAUDE_AUTOCOMPACT_PCT_OVERRIDE=60
```

On Windows (system-level, all terminals):

```powershell
[Environment]::SetEnvironmentVariable("CLAUDE_AUTOCOMPACT_PCT_OVERRIDE", "60", "User")
```

**Restart your terminal** for this to take effect.

---

## 2. Pre-Commit Hooks (Husky + lint-staged)

Enforces linting and tests before every commit. Nothing broken gets committed.

### Install

```bash
npm install -D husky lint-staged
npx husky init
```

### Configure `.husky/pre-commit`

```bash
npx lint-staged
npm test
```

### Configure `package.json` (add to root)

```json
{
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix --no-warn-ignored"
    ],
    "*.{json,md,css}": [
      "npx prettier --write --no-error-on-unmatched-pattern"
    ]
  }
}
```

**Adapt the patterns** for your project:
- Python projects: `"*.py": ["ruff check --fix", "ruff format"]`
- Go projects: `"*.go": ["gofmt -w"]`

---

## 3. GitHub Actions CI/CD

### 3.1 CI Workflow (lint + typecheck + test + build)

Create `.github/workflows/ci.yml`:

```yaml
name: CI

on:
  push:
    branches: [master]
  pull_request:
    branches: [master]

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

jobs:
  check:
    name: Lint, Typecheck, Test, Build
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm

      - name: Install dependencies
        run: npm ci

      - name: Lint
        run: npm run lint

      - name: Typecheck
        run: npx tsc --noEmit

      - name: Unit tests
        run: npm test

      - name: Build
        run: npm run build
```

### 3.2 Auto-Deploy to Coolify

Add a deploy job that runs after CI passes:

```yaml
  deploy:
    name: Deploy to Production
    needs: check
    if: github.ref == 'refs/heads/master' && github.event_name == 'push'
    runs-on: ubuntu-latest
    steps:
      - name: Trigger Coolify deployment
        run: |
          response=$(curl -s -w "\n%{http_code}" \
            "http://YOUR_COOLIFY_IP:8000/api/v1/deploy?uuid=${{ secrets.COOLIFY_APP_UUID }}&force=false" \
            -H "Authorization: Bearer ${{ secrets.COOLIFY_TOKEN }}")
          http_code=$(echo "$response" | tail -1)
          body=$(echo "$response" | head -n -1)
          echo "Status: $http_code"
          echo "Response: $body"
          if [ "$http_code" -ge 400 ]; then
            echo "::error::Coolify deploy failed with status $http_code"
            exit 1
          fi
```

### Required GitHub Secrets

Set these in **GitHub repo > Settings > Secrets and variables > Actions**:

| Secret | Description | Example |
|--------|-------------|---------|
| `COOLIFY_APP_UUID` | App UUID from Coolify dashboard | `koww08cgw8o0ckg4oowkw04c` |
| `COOLIFY_TOKEN` | Coolify API token | `1\|abc123...` |
| `P520_HOST` | Dev server IP (if deploying to test) | `192.168.178.50` |
| `P520_USER` | SSH username | `david` |
| `P520_SSH_KEY` | Private SSH key for P520 | Contents of `~/.ssh/p520_ed25519` |
| `P520_APP_UUID` | Test app UUID in P520 Coolify | `xw4csk0ssos8800kws0cswwk` |

---

## 4. Claude Code Hooks

Hooks automate quality checks and git operations during Claude Code sessions.

### 4.1 Directory Structure

```
.claude/
├── settings.local.json    # Hooks configuration (gitignored)
├── hooks/
│   ├── auto-commit.sh     # Stop hook: test + commit
│   └── lint-on-edit.sh    # PostToolUse hook: lint after edits
```

### 4.2 Auto-Commit on Stop (`auto-commit.sh`)

When Claude finishes a response, this hook:
1. Checks if there are uncommitted changes
2. Runs tests
3. If tests pass → auto-commits with a descriptive message
4. If tests fail → **blocks Claude from stopping** and forces it to fix

```bash
#!/bin/bash
set -euo pipefail

cd "$CLAUDE_PROJECT_DIR" 2>/dev/null || cd "$(dirname "$0")/../.."

# No changes? Nothing to do
if git diff --quiet && git diff --cached --quiet && [ -z "$(git ls-files --others --exclude-standard)" ]; then
  echo '{"decision": "allow"}'
  exit 0
fi

# Run tests
if npm test 2>&1 | tail -5; then
  git add -A
  if ! git diff --cached --quiet; then
    summary=$(git diff --cached --stat | tail -1 | sed 's/^ *//')
    git commit -m "Auto-commit: ${summary}" -m "Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>" --no-verify
    echo '{"decision": "allow"}'
  else
    echo '{"decision": "allow"}'
  fi
else
  echo '{"decision": "block", "reason": "Tests are failing. Fix the failing tests before finishing."}'
fi
```

### 4.3 Lint on Edit (`lint-on-edit.sh`)

Runs ESLint on every file that Claude writes or edits, feeding errors back immediately:

```bash
#!/bin/bash
set -uo pipefail

cd "$CLAUDE_PROJECT_DIR" 2>/dev/null || cd "$(dirname "$0")/../.."

input=$(cat)

file_path=$(echo "$input" | node -e "
  const chunks = [];
  process.stdin.on('data', c => chunks.push(c));
  process.stdin.on('end', () => {
    try {
      const d = JSON.parse(chunks.join(''));
      const fp = d.tool_input?.file_path || '';
      console.log(fp);
    } catch { console.log(''); }
  });
" 2>/dev/null)

if [[ "$file_path" != *.ts && "$file_path" != *.tsx && "$file_path" != *.js && "$file_path" != *.jsx ]]; then
  exit 0
fi

output=$(npx eslint --no-warn-ignored "$file_path" 2>&1) || true
if [ -n "$output" ]; then
  echo "$output" | head -20
fi
```

### 4.4 Settings Configuration (`.claude/settings.local.json`)

Add the hooks section to your project settings:

```json
{
  "hooks": {
    "Stop": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "bash .claude/hooks/auto-commit.sh",
            "timeout": 120
          }
        ]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "bash .claude/hooks/lint-on-edit.sh",
            "timeout": 30
          }
        ]
      }
    ]
  }
}
```

### 4.5 All Available Hook Events

| Event | When | Can Block? | Use Case |
|-------|------|-----------|----------|
| `SessionStart` | Session begins | No | Setup, environment check |
| `UserPromptSubmit` | Before prompt processed | Yes | Input validation |
| `PreToolUse` | Before tool executes | Yes | Prevent dangerous commands |
| `PostToolUse` | After tool succeeds | No | Lint, format, validate |
| `PostToolUseFailure` | After tool fails | No | Error logging |
| `Stop` | Claude finishes response | Yes | Auto-commit, test gate |
| `Notification` | Notification sent | No | Slack/Telegram alerts |
| `PreCompact` | Before compaction | No | Save context state |
| `SessionEnd` | Session ends | No | Cleanup |

---

## 5. Playwright Testing

### 5.1 Configuration (`playwright.config.ts`)

Three project profiles: desktop light, desktop dark, mobile:

```typescript
import { defineConfig, devices } from "@playwright/test"

export default defineConfig({
  testDir: "./src/__tests__/pages",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  timeout: 60000,
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
    navigationTimeout: 45000,
  },
  projects: [
    {
      name: "desktop-chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "desktop-dark",
      use: {
        ...devices["Desktop Chrome"],
        colorScheme: "dark",
      },
    },
    {
      name: "mobile-chromium",
      use: { ...devices["Pixel 5"] },
    },
  ],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 60000,
  },
})
```

### 5.2 Test Template with Screenshots + Accessibility

```typescript
import { test, expect } from "@playwright/test"
import AxeBuilder from "@axe-core/playwright"

test.describe("Page Name", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/your-page", { waitUntil: "domcontentloaded" })
    await page.waitForTimeout(1000)
  })

  test("renders key element", async ({ page }) => {
    await expect(page.locator("h1").first()).toBeVisible()
  })

  test("screenshot - light mode", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" })
    await page.waitForTimeout(500)
    await expect(page).toHaveScreenshot("page-light.png", {
      fullPage: true,
      maxDiffPixelRatio: 0.05,
    })
  })

  test("screenshot - dark mode", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "dark", reducedMotion: "reduce" })
    await page.waitForTimeout(500)
    await expect(page).toHaveScreenshot("page-dark.png", {
      fullPage: true,
      maxDiffPixelRatio: 0.05,
    })
  })

  test("no critical accessibility violations", async ({ page }) => {
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa"])
      .disableRules(["color-contrast"])
      .analyze()

    expect(results.violations.filter((v) => v.impact === "critical")).toEqual([])
  })
})
```

### 5.3 Install Dependencies

```bash
npm install -D @playwright/test @axe-core/playwright
npx playwright install chromium
```

### 5.4 Running Playwright Tests

```bash
# Run all E2E tests
npx playwright test

# Update golden screenshots after intentional visual changes
npx playwright test --update-snapshots

# Run with visible browser for debugging
npx playwright test --headed

# Run a specific test file
npx playwright test src/__tests__/pages/landing.spec.ts
```

---

## 6. Claude Code Prompt

Copy this prompt and give it to Claude Code in any new project to set up the full automation stack:

---

### Prompt: Set Up Automated Development Workflow

```
Set up the following automated development workflow for this project:

1. **Pre-commit hooks (Husky + lint-staged)**
   - Install husky and lint-staged
   - Configure pre-commit to run lint-staged then npm test
   - lint-staged should eslint --fix TS/TSX files and prettier --write JSON/MD/CSS files

2. **GitHub Actions CI/CD (.github/workflows/ci.yml)**
   - On push/PR to master: lint, typecheck (tsc --noEmit), test, build
   - Use Node 22, npm ci, concurrency grouping
   - Add a deploy job that calls Coolify webhook on master push success
   - Deploy job should check HTTP status and fail on 4xx/5xx
   - Use secrets: COOLIFY_APP_UUID, COOLIFY_TOKEN

3. **Claude Code hooks (.claude/settings.local.json)**
   - Stop hook: runs tests, auto-commits if passing, blocks if failing
   - PostToolUse hook on Write|Edit: runs eslint on the edited file
   - Create hook scripts in .claude/hooks/ directory
   - Auto-commit message should include diff summary and Co-Authored-By

4. **Playwright testing enhancements**
   - Add desktop-dark project (colorScheme: "dark") to playwright.config.ts
   - Ensure all specs have: screenshot tests (light + dark), axe-core accessibility tests
   - Install @axe-core/playwright if not present

5. **Context management**
   - Add `export CLAUDE_AUTOCOMPACT_PCT_OVERRIDE=60` to ~/.bash_profile

Run all tests after setup to verify everything works.
```

---

## Summary: What Runs When

| Trigger | What Runs | Effect |
|---------|-----------|--------|
| Claude edits a file | `lint-on-edit.sh` (PostToolUse) | ESLint errors fed back to Claude instantly |
| Claude finishes responding | `auto-commit.sh` (Stop) | Tests run → auto-commit or block |
| Developer runs `git commit` | Husky pre-commit | lint-staged + npm test gate |
| Code pushed to GitHub | GitHub Actions CI | lint + typecheck + test + build |
| CI passes on master | Deploy job | Coolify webhook → production deploy |
| Context hits 60% | Auto-compact | Claude summarises and continues fresh |

**The full pipeline: Claude edits → lint feedback → Claude stops → tests → auto-commit → push → CI → deploy. Zero manual steps.**
