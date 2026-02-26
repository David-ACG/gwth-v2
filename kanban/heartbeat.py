#!/usr/bin/env python3
"""
Heartbeat Monitor — Infrastructure & Workflow Health
Checks Linear poll freshness, P520/Hetzner health, and kanban items awaiting review.
Sends Telegram summary.

Schedule hourly (offset 30 min from poll):
  schtasks /Create /TN "KanbanHeartbeat" /TR "python C:\\Projects\\GWTH_V2\\kanban\\heartbeat.py" /SC HOURLY /ST 00:30 /F

Manual test:
  python C:/Projects/GWTH_V2/kanban/heartbeat.py
"""

import json
import os
import ssl
import urllib.request
from datetime import datetime, timedelta
from pathlib import Path

# Config
TELEGRAM_BOT_TOKEN = os.environ.get("TELEGRAM_BOT_TOKEN", "")
TELEGRAM_CHAT_ID = os.environ.get("TELEGRAM_CHAT_ID", "")
KANBAN_DIR = Path(__file__).parent
LOG_FILE = KANBAN_DIR / ".heartbeat.log"
POLL_LOG = KANBAN_DIR / ".linear-poll.log"

# Projects to check for testing items
PROJECTS = {
    "GWTH_V2": Path("C:/Projects/GWTH_V2/kanban/2_testing"),
    "gwthtest2026-520": Path("C:/Projects/gwthtest2026-520/kanban/2_testing"),
    "1_gwthpipeline520": Path("C:/Projects/1_gwthpipeline520/kanban/2_testing"),
    "design-system": Path("C:/Projects/design-system/kanban/2_testing"),
}

# Health endpoints
HEALTH_CHECKS = {
    "P520 (test)": "http://192.168.178.50:3001/api/health",
    "Hetzner (prod)": "https://gwth.ai/api/health",
}

# Max age of poll log before it's considered stale (2 hours)
POLL_STALE_HOURS = 2


def log(msg):
    """Append a timestamped message to the log file."""
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    line = f"[{timestamp}] {msg}"
    print(line)
    with open(LOG_FILE, "a", encoding="utf-8") as f:
        f.write(line + "\n")


def send_telegram(message):
    """Send a message via Telegram bot."""
    if not TELEGRAM_BOT_TOKEN or not TELEGRAM_CHAT_ID:
        log("WARNING: Telegram credentials not set, skipping notification")
        return False

    url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"
    payload = json.dumps({
        "chat_id": TELEGRAM_CHAT_ID,
        "text": message,
        "parse_mode": "Markdown",
    }).encode()

    req = urllib.request.Request(url, data=payload, headers={
        "Content-Type": "application/json",
    })

    try:
        urllib.request.urlopen(req)
        return True
    except Exception as e:
        log(f"ERROR: Telegram send failed: {e}")
        return False


def check_poll_health():
    """Check if linear-poll.py has run recently."""
    if not POLL_LOG.exists():
        return "WARN", "Poll log not found — linear-poll.py may never have run"

    # Check last modification time of the log file
    mtime = datetime.fromtimestamp(POLL_LOG.stat().st_mtime)
    age = datetime.now() - mtime
    if age > timedelta(hours=POLL_STALE_HOURS):
        hours = age.total_seconds() / 3600
        return "WARN", f"Poll log is {hours:.1f}h old (threshold: {POLL_STALE_HOURS}h)"

    # Read last line to check for errors
    lines = POLL_LOG.read_text(encoding="utf-8").strip().split("\n")
    last_line = lines[-1] if lines else ""
    if "ERROR" in last_line:
        return "FAIL", f"Last poll had error: {last_line}"

    return "OK", f"Last poll: {last_line}"


def check_endpoint(name, url):
    """Check if an HTTP endpoint responds with 200."""
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE

    try:
        req = urllib.request.Request(url, method="GET")
        if url.startswith("https"):
            resp = urllib.request.urlopen(req, timeout=10, context=ctx)
        else:
            resp = urllib.request.urlopen(req, timeout=10)
        if resp.status == 200:
            return "OK", f"{name} responding (HTTP {resp.status})"
        else:
            return "WARN", f"{name} returned HTTP {resp.status}"
    except Exception as e:
        return "FAIL", f"{name} unreachable: {e}"


def check_testing_items():
    """Check for items in 2_testing/ folders across projects."""
    items = []
    for project, path in PROJECTS.items():
        if path.exists():
            files = list(path.glob("*.md"))
            if files:
                for f in files:
                    items.append(f"  - {project}: `{f.name}`")
    return items


def main():
    log("Heartbeat check starting")
    results = []
    has_issues = False

    # 1. Linear poll health
    status, msg = check_poll_health()
    emoji = {"OK": "✅", "WARN": "⚠️", "FAIL": "❌"}.get(status, "❓")
    results.append(f"{emoji} *Poll:* {msg}")
    if status != "OK":
        has_issues = True

    # 2. Infrastructure health
    for name, url in HEALTH_CHECKS.items():
        status, msg = check_endpoint(name, url)
        emoji = {"OK": "✅", "WARN": "⚠️", "FAIL": "❌"}.get(status, "❓")
        results.append(f"{emoji} *{name}:* {msg}")
        if status != "OK":
            has_issues = True

    # 3. Items awaiting review
    testing_items = check_testing_items()
    if testing_items:
        results.append(f"📋 *Awaiting review ({len(testing_items)} items):*")
        results.extend(testing_items)

    # Build message
    now = datetime.now().strftime("%Y-%m-%d %H:%M")
    header = "🔴 *GWTH Heartbeat — Issues Detected*" if has_issues else "🟢 *GWTH Heartbeat — All Clear*"
    message = f"{header}\n_{now}_\n\n" + "\n".join(results)

    # Only send Telegram if there are issues or testing items (reduce noise)
    if has_issues or testing_items:
        send_telegram(message)
        log(f"Telegram sent (issues: {has_issues}, testing items: {len(testing_items)})")
    else:
        log("All clear, no Telegram sent (suppressing green heartbeats)")

    # Always log the full status
    for r in results:
        log(r)


if __name__ == "__main__":
    main()
