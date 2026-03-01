#!/usr/bin/env python3
"""
Linear -> Kanban Bridge
Polls Linear for issues labeled "idea" and creates markdown files in kanban/0_idea/.

Run hourly via Windows Task Scheduler:
  schtasks /Create /TN "LinearKanbanPoll" /TR "python C:\\Projects\\GWTH_V2\\kanban\\linear-poll.py" /SC HOURLY /ST 00:00

Manual test:
  python C:/Projects/GWTH_V2/kanban/linear-poll.py
"""

import json
import os
import re
import urllib.request
from datetime import datetime
from pathlib import Path

# Config
LINEAR_API_KEY = os.environ["LINEAR_API_KEY"]
LINEAR_API_URL = "https://api.linear.app/graphql"
KANBAN_DIR = Path(__file__).parent
IDEA_DIR = KANBAN_DIR / "0_idea"
STATE_FILE = KANBAN_DIR / ".linear-poll-state.json"
LOG_FILE = KANBAN_DIR / ".linear-poll.log"
TEAM_NAME = "GWTH Dev"
PICKUP_LABEL = "idea"


def log(msg):
    """Append a timestamped message to the log file."""
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    line = f"[{timestamp}] {msg}"
    print(line)
    with open(LOG_FILE, "a", encoding="utf-8") as f:
        f.write(line + "\n")


def graphql(query, variables=None):
    """Execute a GraphQL query against the Linear API."""
    payload = {"query": query}
    if variables:
        payload["variables"] = variables
    data = json.dumps(payload).encode()
    req = urllib.request.Request(LINEAR_API_URL, data=data, headers={
        "Content-Type": "application/json",
        "Authorization": LINEAR_API_KEY,
    })
    resp = urllib.request.urlopen(req)
    return json.loads(resp.read())


def load_state():
    """Load the set of already-processed issue IDs."""
    if STATE_FILE.exists():
        return set(json.loads(STATE_FILE.read_text()))
    return set()


def save_state(processed_ids):
    """Save processed issue IDs to prevent reprocessing."""
    STATE_FILE.write_text(json.dumps(list(processed_ids)))


def slugify(text):
    """Convert title to filename-safe slug."""
    text = text.lower().strip()
    text = re.sub(r"[^\w\s-]", "", text)
    text = re.sub(r"[-\s]+", "-", text)
    return text[:60]


def fetch_new_ideas():
    """Fetch issues labeled 'idea' in Todo/Backlog status."""
    query = """
    {
      issues(filter: {
        team: { name: { eq: "%s" } }
        state: { type: { in: ["unstarted", "backlog"] } }
        labels: { name: { eq: "%s" } }
      }, first: 50, orderBy: createdAt) {
        nodes {
          id identifier title description
          state { name }
          labels { nodes { id name } }
          priority
          createdAt
        }
      }
    }
    """ % (TEAM_NAME, PICKUP_LABEL)
    result = graphql(query)
    return result["data"]["issues"]["nodes"]


def create_idea_file(issue):
    """Create a markdown file in kanban/0_idea/ from a Linear issue."""
    IDEA_DIR.mkdir(parents=True, exist_ok=True)
    slug = slugify(issue["title"])
    filename = f"{issue['identifier'].lower()}_{slug}.md"
    filepath = IDEA_DIR / filename

    labels = [l["name"] for l in issue["labels"]["nodes"] if l["name"] != PICKUP_LABEL]
    label_str = ", ".join(labels) if labels else "none"
    priority_map = {0: "None", 1: "Urgent", 2: "High", 3: "Normal", 4: "Low"}
    priority = priority_map.get(issue.get("priority", 0), "None")

    content = f"""# {issue['title']}

**Linear:** {issue['identifier']} | **Priority:** {priority} | **Labels:** {label_str} | **Created:** {issue['createdAt'][:10]}

## Description

{issue.get('description') or 'No description provided.'}

---
*Auto-imported from Linear issue {issue['identifier']}*
"""
    filepath.write_text(content, encoding="utf-8")
    return filepath


def mark_picked_up(issue_id):
    """Add a comment to the Linear issue noting it was picked up."""
    graphql(
        """
        mutation($issueId: String!, $body: String!) {
          commentCreate(input: { issueId: $issueId, body: $body }) {
            success
          }
        }
        """,
        {
            "issueId": issue_id,
            "body": f"Picked up by kanban automation at {datetime.now().isoformat()}",
        },
    )


def main():
    processed = load_state()
    try:
        issues = fetch_new_ideas()
    except Exception as e:
        log(f"ERROR: Failed to query Linear: {e}")
        return

    new_count = 0
    for issue in issues:
        if issue["id"] in processed:
            continue

        filepath = create_idea_file(issue)
        mark_picked_up(issue["id"])
        processed.add(issue["id"])
        new_count += 1
        log(f"Created: {filepath.name} (from {issue['identifier']})")

    save_state(processed)
    log(f"Polled Linear: {len(issues)} idea(s) found, {new_count} new")


if __name__ == "__main__":
    main()
