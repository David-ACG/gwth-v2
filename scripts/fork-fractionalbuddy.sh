#!/usr/bin/env bash
# Fork conscia-fractional MVP into fractionalbuddy-site, stripping private data
# and build artifacts in a single pass. Leaves the new dir clean and git-free;
# a subsequent `git init` + `gh repo create` commits the forked tree.
set -euo pipefail

SRC=/c/Projects/conscia-fractional
DST=/c/Projects/fractionalbuddy-site

if [ -e "$DST" ]; then
  echo "ERROR: $DST already exists. Remove it first." >&2
  exit 1
fi

mkdir -p "$DST"

EXCLUDE=(
  # git / build artifacts / caches
  ".git" ".next" ".beads" ".playwright-mcp" ".husky"
  "node_modules" "playwright-report" "test-results" "tsconfig.tsbuildinfo"
  # secrets
  ".env.local"
  # private client data (keep .env.local.example, components.json etc.)
  "CRM" "meetings" "deliverables" "contacts" "calendar"
  "certificates" "research" "timesheet"
)

should_exclude() {
  local name="$1"
  for ex in "${EXCLUDE[@]}"; do
    [ "$name" = "$ex" ] && return 0
  done
  return 1
}

cd "$SRC"
# Regular + dotfiles
shopt -s dotglob nullglob
for item in *; do
  if should_exclude "$item"; then
    echo "  skip  $item"
    continue
  fi
  echo "  copy  $item"
  cp -r "$item" "$DST/"
done

echo ""
echo "Fork complete. Size:"
du -sh "$DST"
echo ""
echo "Top-level contents:"
ls -la "$DST" | head -40
