#!/bin/bash
# PostToolUse hook: runs ESLint on edited files and feeds errors back to Claude.
# Reads tool input from stdin to extract the file path.

set -uo pipefail

cd "$CLAUDE_PROJECT_DIR" 2>/dev/null || cd "$(dirname "$0")/../.."

# Read stdin (tool input JSON)
input=$(cat)

# Extract file_path from the tool input
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

# Only lint TypeScript/JavaScript files
if [[ "$file_path" != *.ts && "$file_path" != *.tsx && "$file_path" != *.js && "$file_path" != *.jsx ]]; then
  exit 0
fi

# Run eslint on the specific file
output=$(npx eslint --no-warn-ignored "$file_path" 2>&1) || true

if [ -n "$output" ]; then
  echo "$output" | head -20
fi
