#!/usr/bin/env python3
"""
Unified Sync — Linear + Beads + Kanban bridge.
Replaces linear-poll.py with a single script that:
  1. Pulls Linear ideas into Beads (bd linear sync --pull)
  2. Fixes issue_type for Linear "idea" issues (workaround for bd label_type_map bug)
  3. Generates kanban/0_idea/ files for new Beads issues tagged "idea"
  4. Pushes closed Beads issues back to Linear (bd linear sync --push)

Schedule hourly via Windows Task Scheduler:
  schtasks /Create /TN "UnifiedSync" /TR "python C:\\Projects\\GWTH_V2\\kanban\\unified-sync.py" /SC HOURLY /ST 00:00 /F

Manual test:
  python C:/Projects/GWTH_V2/kanban/unified-sync.py
"""

import json
import sys
from datetime import datetime

from kanban_utils import (
    KANBAN_DIR,
    extract_linear_identifier,
    generate_kanban_file,
    load_state,
    query_linear_ideas,
    run_bd,
    save_state,
)

# Config
LOG_FILE = KANBAN_DIR / ".unified-sync.log"
IDEA_LABEL = "idea"


def log(msg):
    """Append a timestamped message to the log file."""
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    line = f"[{timestamp}] {msg}"
    print(line.encode(sys.stdout.encoding or "utf-8", errors="replace").decode(
        sys.stdout.encoding or "utf-8", errors="replace"))
    with open(LOG_FILE, "a", encoding="utf-8") as f:
        f.write(line + "\n")


def check_dolt():
    """Check if Dolt server is reachable (Beads dependency)."""
    import socket
    try:
        with socket.create_connection(("127.0.0.1", 3307), timeout=5):
            return True
    except (ConnectionRefusedError, OSError):
        return False


def pull_from_linear():
    """Import Linear issues into Beads."""
    log("Pulling from Linear -> Beads...")
    ok, output = run_bd("linear", "sync", "--pull")
    if ok:
        log(f"Linear pull: {output}")
    else:
        log(f"Linear pull failed: {output}")
    return ok


def push_to_linear():
    """Push closed Beads issues back to Linear."""
    log("Pushing closed Beads -> Linear...")
    ok, output = run_bd("linear", "sync", "--push")
    if ok:
        log(f"Linear push: {output}")
    else:
        log(f"Linear push failed: {output}")
    return ok


def get_open_issues():
    """Get all open Beads issues as JSON."""
    ok, output = run_bd("list", "--status=open", "--json")
    if not ok:
        return []
    try:
        return json.loads(output)
    except json.JSONDecodeError:
        log(f"ERROR: Failed to parse bd list JSON: {output[:200]}")
        return []


def is_idea(issue):
    """Check if a Beads issue is an idea (type=idea from Linear label mapping, or has 'idea' label)."""
    if issue.get("issue_type", "") == IDEA_LABEL:
        return True

    labels = issue.get("labels", [])
    if isinstance(labels, list):
        for label in labels:
            if isinstance(label, str) and label.lower() == IDEA_LABEL:
                return True
            if isinstance(label, dict) and label.get("name", "").lower() == IDEA_LABEL:
                return True

    return False


def fix_idea_types(issues):
    """
    Workaround for bd linear sync --pull ignoring label_type_map config.
    Queries Linear API directly for issues with "idea" label, then updates
    any Beads issues that should be type=idea but aren't.
    Returns count of issues fixed.
    """
    linear_ideas = query_linear_ideas()
    if not linear_ideas:
        log("fix_idea_types: no Linear ideas found (or API unavailable)")
        return 0

    log(f"fix_idea_types: Linear has {len(linear_ideas)} idea(s): {linear_ideas}")
    fixed = 0

    for issue in issues:
        if issue.get("issue_type") == "idea":
            continue  # Already correct

        ext_ref = issue.get("external_ref", "")
        linear_id = extract_linear_identifier(ext_ref)
        if linear_id and linear_id in linear_ideas:
            issue_id = issue.get("id", "")
            log(f"fix_idea_types: fixing {issue_id} ({linear_id}) -> type=idea")
            ok, output = run_bd("update", issue_id, "--type=idea")
            if ok:
                issue["issue_type"] = "idea"  # Update in-memory too
                fixed += 1
            else:
                log(f"fix_idea_types: failed to update {issue_id}: {output}")

    return fixed


def main():
    log("=== Unified sync starting ===")

    # Pre-flight: check Dolt
    if not check_dolt():
        log("ERROR: Dolt server not reachable on port 3307. Beads commands will fail.")
        log("Start with: C:\\Users\\david\\AppData\\Local\\beads\\start-dolt.bat")
        log("=== Unified sync aborted ===")
        return

    # Phase 1: Pull from Linear -> Beads
    pull_from_linear()

    # Phase 1.5: Fix issue types for Linear "idea" issues
    # (workaround for bd linear sync ignoring label_type_map)
    issues = get_open_issues()
    fixed = fix_idea_types(issues)
    if fixed:
        log(f"Fixed {fixed} issue type(s) to 'idea'")

    # Phase 2: Generate kanban files for new Beads ideas
    kanban_generated = load_state()
    new_kanban = 0

    for issue in issues:
        issue_id = issue.get("id", "")
        if issue_id in kanban_generated:
            continue

        if not is_idea(issue):
            log(f"Skipping {issue_id} ({issue.get('title', '')}) — not an idea")
            kanban_generated.add(issue_id)  # Track so we don't re-check
            continue

        filepath = generate_kanban_file(issue)
        kanban_generated.add(issue_id)
        new_kanban += 1
        log(f"Created kanban file: {filepath.name} (from {issue_id})")

    save_state(kanban_generated)

    # Phase 3: Push closed Beads -> Linear
    push_to_linear()

    log(f"=== Unified sync complete: {len(issues)} open, {fixed} types fixed, {new_kanban} new kanban files ===")


if __name__ == "__main__":
    main()
