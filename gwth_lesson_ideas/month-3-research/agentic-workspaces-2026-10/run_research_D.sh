#!/bin/bash
D=/home/david/projects/GWTH_V2/gwth_lesson_ideas/month-3-research/agentic-workspaces-2026-10
cd "$D"
cat _common.md brief_D_landscape.md | timeout 3600 codex exec --skip-git-repo-check -m "$(python3 /home/david/projects/GWTH-launch-plan/scripts/latest_models.py sol)" -c model_reasoning_effort=high \
  -c web_search=live -s workspace-write -C "$D" - > log_D.txt 2>&1
echo "D exit $?" >> status.txt
