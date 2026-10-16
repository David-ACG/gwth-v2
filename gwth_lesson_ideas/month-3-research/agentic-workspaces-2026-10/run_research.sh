#!/bin/bash
D=/home/david/projects/GWTH_V2/gwth_lesson_ideas/month-3-research/agentic-workspaces-2026-10
cd "$D"
run() { # $1 letter $2 brief
  cat _common.md "$2" | timeout 3000 codex exec --skip-git-repo-check -m gpt-6.1-sol -c model_reasoning_effort=high \
    -c web_search=live -s workspace-write -C "$D" - > "log_$1.txt" 2>&1
  echo "$1 exit $?" >> status.txt
}
run A brief_A_quick.md & run B brief_B_vendors.md & run C brief_C_opensource.md &
wait
echo ALL_DONE >> status.txt
