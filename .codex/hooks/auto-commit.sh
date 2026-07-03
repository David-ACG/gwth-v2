#!/bin/bash
# Auto-commit hook for Claude Code Stop event.
# Runs tests first — only commits if tests pass and there are changes.
# Returns JSON with "decision": "block" if tests fail, forcing Claude to fix.

set -euo pipefail

project_dir="${CLAUDE_PROJECT_DIR:-}"
if [ -n "$project_dir" ] && [ -d "$project_dir" ]; then
  cd "$project_dir"
else
  cd "$(dirname "$0")/../.."
fi

# Some local orchestration workspaces keep beads locally without a git
# worktree at the project root. In that case this Stop hook should not block
# the session just because auto-commit is unavailable.
if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo '{"decision": "approve", "reason": "No git worktree available; skipped auto-commit."}'
  exit 0
fi

# Check if there are any changes to commit
if git diff --quiet && git diff --cached --quiet && [ -z "$(git ls-files --others --exclude-standard)" ]; then
  # No changes — nothing to do
  echo '{"decision": "approve"}'
  exit 0
fi

# Run tests
if npm test 2>&1 | tail -5; then
  # Tests passed — stage and commit
  git add -A
  if ! git diff --cached --quiet; then
    # Generate a conventional commit message from the diff summary
    summary=$(git diff --cached --stat | tail -1 | sed 's/^ *//')
    git commit -m "chore: auto-commit ${summary}" -m "Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>" --no-verify
    echo '{"decision": "approve"}'
  else
    echo '{"decision": "approve"}'
  fi
else
  # Tests failed — block Claude from stopping, force it to fix
  echo '{"decision": "block", "reason": "Tests are failing. Fix the failing tests before finishing."}'
fi
