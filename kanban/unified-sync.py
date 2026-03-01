#!/usr/bin/env python3
"""
Unified Sync — Linear + Beads + Kanban bridge.
Replaces linear-poll.py with a single script that:
  1. Pulls Linear ideas into Beads (bd linear sync --pull)
  2. Generates kanban/0_idea/ files for new Beads issues tagged "idea"
  3. Pushes closed Beads issues back to Linear (bd linear sync --push)

Schedule hourly via Windows Task Scheduler:
  schtasks /Create /TN "UnifiedSync" /TR "python C:\\Projects\\GWTH_V2\\kanban\\unified-sync.py" /SC HOURLY /ST 00:00 /F

Manual test:
  python C:/Projects/GWTH_V2/kanban/unified-sync.py
"""

import json
import os
import re
import subprocess
import sys
from datetime import datetime
from pathlib import Path

# Config
KANBAN_DIR = Path(__file__).parent
IDEA_DIR = KANBAN_DIR / "0_idea"
STATE_FILE = KANBAN_DIR / ".unified-sync-state.json"
LOG_FILE = KANBAN_DIR / ".unified-sync.log"
BD_CMD = "bd"
IDEA_LABEL = "idea"


def log(msg):
    """Append a timestamped message to the log file."""
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    line = f"[{timestamp}] {msg}"
    print(line.encode(sys.stdout.encoding or "utf-8", errors="replace").decode(
        sys.stdout.encoding or "utf-8", errors="replace"))
    with open(LOG_FILE, "a", encoding="utf-8") as f:
        f.write(line + "\n")


def run_bd(*args):
    """Run a bd command and return (success, stdout)."""
    cmd = [BD_CMD] + list(args)
    try:
        result = subprocess.run(
            cmd, capture_output=True, text=True, timeout=60,
            cwd=str(KANBAN_DIR.parent)
        )
        if result.returncode != 0:
            log(f"bd command failed: {' '.join(cmd)}\n  stderr: {result.stderr.strip()}")
            return False, result.stderr.strip()
        return True, result.stdout.strip()
    except FileNotFoundError:
        log(f"ERROR: '{BD_CMD}' not found in PATH")
        return False, "bd not found"
    except subprocess.TimeoutExpired:
        log(f"ERROR: bd command timed out: {' '.join(cmd)}")
        return False, "timeout"


def check_dolt():
    """Check if Dolt server is reachable (Beads dependency)."""
    import socket
    try:
        with socket.create_connection(("127.0.0.1", 3307), timeout=5):
            return True
    except (ConnectionRefusedError, OSError):
        return False


def load_state():
    """Load the set of Beads issue IDs that already have kanban files."""
    if STATE_FILE.exists():
        data = json.loads(STATE_FILE.read_text(encoding="utf-8"))
        return set(data.get("kanban_generated", []))
    return set()


def save_state(kanban_generated):
    """Save the set of issue IDs that have kanban files."""
    STATE_FILE.write_text(json.dumps({
        "kanban_generated": list(kanban_generated),
        "last_sync": datetime.now().isoformat(),
    }, indent=2), encoding="utf-8")


def slugify(text):
    """Convert title to filename-safe slug."""
    text = text.lower().strip()
    text = re.sub(r"[^\w\s-]", "", text)
    text = re.sub(r"[-\s]+", "-", text)
    return text[:60]


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
    # Primary check: issue_type set by bd linear sync via label_type_map.idea=idea
    if issue.get("issue_type", "") == IDEA_LABEL:
        return True

    # Fallback: check Beads labels (if manually tagged)
    labels = issue.get("labels", [])
    if isinstance(labels, list):
        for label in labels:
            if isinstance(label, str) and label.lower() == IDEA_LABEL:
                return True
            if isinstance(label, dict) and label.get("name", "").lower() == IDEA_LABEL:
                return True

    return False


def generate_kanban_file(issue):
    """Create a markdown file in kanban/0_idea/ from a Beads issue."""
    IDEA_DIR.mkdir(parents=True, exist_ok=True)

    identifier = issue.get("id", "unknown")
    title = issue.get("title", "Untitled")
    description = issue.get("description", "No description provided.")
    priority = issue.get("priority", "")
    issue_type = issue.get("type", "task")
    ext_ref = issue.get("external_ref", "")

    slug = slugify(title)
    filename = f"{identifier}_{slug}.md"
    filepath = IDEA_DIR / filename

    # Build metadata line
    meta_parts = [f"**Beads:** {identifier}"]
    if ext_ref:
        meta_parts.append(f"**Linear:** {ext_ref}")
    if priority is not None and priority != "":
        priority_map = {0: "Critical", 1: "High", 2: "Medium", 3: "Low", 4: "Backlog"}
        priority_str = priority_map.get(priority, str(priority))
        meta_parts.append(f"**Priority:** {priority_str}")
    meta_parts.append(f"**Type:** {issue_type}")

    content = f"""# {title}

{' | '.join(meta_parts)}

## Description

{description}

---
*Auto-imported from Beads issue {identifier}*
"""
    filepath.write_text(content, encoding="utf-8")
    return filepath


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

    # Phase 2: Generate kanban files for new Beads issues
    kanban_generated = load_state()
    issues = get_open_issues()
    new_kanban = 0

    for issue in issues:
        issue_id = issue.get("id", "")
        if issue_id in kanban_generated:
            continue

        # Only generate kanban files for issues typed as "idea"
        # (via Linear label_type_map or manual Beads label)
        if not is_idea(issue):
            log(f"Skipping {issue_id} ({issue.get('title', '')}) — not an idea")
            kanban_generated.add(issue_id)  # Track it so we don't re-check
            continue

        filepath = generate_kanban_file(issue)
        kanban_generated.add(issue_id)
        new_kanban += 1
        log(f"Created kanban file: {filepath.name} (from {issue_id})")

    save_state(kanban_generated)

    # Phase 3: Push closed Beads -> Linear
    push_to_linear()

    log(f"=== Unified sync complete: {len(issues)} open issues, {new_kanban} new kanban files ===")


if __name__ == "__main__":
    main()
