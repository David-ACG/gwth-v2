#!/usr/bin/env python3
"""
Shared utilities for unified-sync.py and heartbeat.py.
Provides Linear API queries, kanban file generation, state management, and slug helpers.
"""

import json
import os
import re
import subprocess
import urllib.request
from pathlib import Path

# Config
KANBAN_DIR = Path(__file__).parent
IDEA_DIR = KANBAN_DIR / "0_idea"
STATE_FILE = KANBAN_DIR / ".unified-sync-state.json"
LINEAR_API_KEY = os.environ.get("LINEAR_API_KEY", "")
LINEAR_TEAM_ID = "46301be0-5e7b-4428-8cef-67149fab4f1c"
LINEAR_API_URL = "https://api.linear.app/graphql"
BD_CMD = "bd"


def slugify(text):
    """Convert title to filename-safe slug."""
    text = text.lower().strip()
    text = re.sub(r"[^\w\s-]", "", text)
    text = re.sub(r"[-\s]+", "-", text)
    return text[:60]


def load_state():
    """Load the set of Beads issue IDs that already have kanban files."""
    if STATE_FILE.exists():
        data = json.loads(STATE_FILE.read_text(encoding="utf-8"))
        return set(data.get("kanban_generated", []))
    return set()


def save_state(kanban_generated):
    """Save the set of issue IDs that have kanban files."""
    from datetime import datetime
    STATE_FILE.write_text(json.dumps({
        "kanban_generated": list(kanban_generated),
        "last_sync": datetime.now().isoformat(),
    }, indent=2), encoding="utf-8")


def query_linear_ideas():
    """
    Query Linear GraphQL API for issues with the "idea" label in the GWTH team.
    Returns a set of Linear issue identifiers (e.g. {"GWTH-12", "GWTH-13"}).
    """
    if not LINEAR_API_KEY:
        return set()

    query = """
    query($teamId: ID!) {
      issues(filter: {
        team: { id: { eq: $teamId } }
        labels: { name: { eq: "idea" } }
      }) {
        nodes {
          identifier
          title
          state { type }
        }
      }
    }
    """

    payload = json.dumps({
        "query": query,
        "variables": {"teamId": LINEAR_TEAM_ID},
    }).encode()

    req = urllib.request.Request(LINEAR_API_URL, data=payload, headers={
        "Content-Type": "application/json",
        "Authorization": LINEAR_API_KEY,
    })

    try:
        resp = urllib.request.urlopen(req, timeout=15)
        data = json.loads(resp.read().decode())
        nodes = data.get("data", {}).get("issues", {}).get("nodes", [])
        # Filter out canceled/completed issues client-side
        active = [
            n for n in nodes
            if n.get("state", {}).get("type") not in ("canceled", "completed")
        ]
        return {node["identifier"] for node in active}
    except Exception:
        return set()


def generate_kanban_file(issue):
    """
    Create a markdown file in kanban/0_idea/ from a Beads issue dict.
    Returns the Path of the created file.
    """
    IDEA_DIR.mkdir(parents=True, exist_ok=True)

    identifier = issue.get("id", "unknown")
    title = issue.get("title", "Untitled")
    description = issue.get("description", "No description provided.")
    priority = issue.get("priority", "")
    issue_type = issue.get("type", issue.get("issue_type", "task"))
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


def run_bd(*args, timeout=120):
    """Run a bd command and return (success, stdout)."""
    cmd = [BD_CMD] + list(args)
    try:
        result = subprocess.run(
            cmd, capture_output=True, text=True, timeout=timeout,
            cwd=str(KANBAN_DIR.parent),
            encoding="utf-8", errors="replace"
        )
        stdout = result.stdout or ""
        stderr = result.stderr or ""
        if result.returncode != 0:
            return False, stderr.strip()
        return True, stdout.strip()
    except FileNotFoundError:
        return False, "bd not found"
    except subprocess.TimeoutExpired:
        return False, "timeout"


def extract_linear_identifier(external_ref):
    """
    Extract the Linear identifier (e.g. 'GWTH-13') from an external_ref URL.
    Example: 'https://linear.app/gwth/issue/GWTH-13' -> 'GWTH-13'
    """
    if not external_ref:
        return None
    match = re.search(r"([A-Z]+-\d+)$", external_ref)
    return match.group(1) if match else None
