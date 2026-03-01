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
import socket
import ssl
import subprocess
import sys
import urllib.request
from datetime import datetime, timedelta
from pathlib import Path

# Config
TELEGRAM_BOT_TOKEN = os.environ.get("TELEGRAM_BOT_TOKEN", "")
TELEGRAM_CHAT_ID = os.environ.get("TELEGRAM_CHAT_ID", "")
KANBAN_DIR = Path(__file__).parent
LOG_FILE = KANBAN_DIR / ".heartbeat.log"
POLL_LOG = KANBAN_DIR / ".unified-sync.log"
LEGACY_POLL_LOG = KANBAN_DIR / ".linear-poll.log"

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
    # Use errors="replace" to avoid UnicodeEncodeError on Windows cp1252 consoles
    print(line.encode(sys.stdout.encoding or "utf-8", errors="replace").decode(sys.stdout.encoding or "utf-8", errors="replace"))
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
    """Check if unified-sync.py (or legacy linear-poll.py) has run recently."""
    # Prefer unified-sync log, fall back to legacy
    log_file = POLL_LOG if POLL_LOG.exists() else LEGACY_POLL_LOG
    label = "unified-sync" if log_file == POLL_LOG else "linear-poll (legacy)"

    if not log_file.exists():
        return "WARN", f"Sync log not found — {label} may never have run"

    # Check last modification time of the log file
    mtime = datetime.fromtimestamp(log_file.stat().st_mtime)
    age = datetime.now() - mtime
    if age > timedelta(hours=POLL_STALE_HOURS):
        hours = age.total_seconds() / 3600
        return "WARN", f"Sync log ({label}) is {hours:.1f}h old (threshold: {POLL_STALE_HOURS}h)"

    # Read last line to check for errors
    lines = log_file.read_text(encoding="utf-8").strip().split("\n")
    last_line = lines[-1] if lines else ""
    if "ERROR" in last_line:
        return "FAIL", f"Last sync had error: {last_line}"

    return "OK", f"Last sync ({label}): {last_line}"


def check_beads_health():
    """Check Beads issue stats and flag stale in-progress issues."""
    results = []

    try:
        result = subprocess.run(
            ["bd", "stats", "--json"],
            capture_output=True, text=True, timeout=15,
            cwd=str(KANBAN_DIR.parent)
        )
        if result.returncode != 0:
            return [("WARN", "Beads stats unavailable (bd command failed)")]

        data = json.loads(result.stdout)
        summary = data.get("summary", {})
        open_count = summary.get("open_issues", 0)
        in_progress = summary.get("in_progress_issues", 0)
        blocked = summary.get("blocked_issues", 0)
        ready = summary.get("ready_issues", 0)

        stats_msg = f"Open: {open_count}, In-progress: {in_progress}, Blocked: {blocked}, Ready: {ready}"
        results.append(("OK", f"Beads: {stats_msg}"))

        # Check for stale in-progress issues (claimed but not updated in 24h)
        if in_progress > 0:
            list_result = subprocess.run(
                ["bd", "list", "--status=in_progress", "--json"],
                capture_output=True, text=True, timeout=15,
                cwd=str(KANBAN_DIR.parent)
            )
            if list_result.returncode == 0:
                issues = json.loads(list_result.stdout)
                for issue in issues:
                    updated = issue.get("updated_at", "")
                    if updated:
                        try:
                            updated_dt = datetime.fromisoformat(updated.replace("Z", "+00:00"))
                            age = datetime.now(updated_dt.tzinfo) - updated_dt
                            if age > timedelta(hours=24):
                                hours = age.total_seconds() / 3600
                                results.append((
                                    "WARN",
                                    f"Stale issue: {issue.get('id', '?')} ({issue.get('title', '?')}) — {hours:.0f}h since update"
                                ))
                        except (ValueError, TypeError):
                            pass

    except (FileNotFoundError, subprocess.TimeoutExpired, json.JSONDecodeError) as e:
        results.append(("WARN", f"Beads stats check failed: {e}"))

    return results


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


def check_dolt_server(host="127.0.0.1", port=3307, timeout=5):
    """Check if the Dolt SQL server is reachable on the expected port."""
    try:
        with socket.create_connection((host, port), timeout=timeout):
            return "OK", f"Dolt server responding on port {port}"
    except (ConnectionRefusedError, OSError) as e:
        return "FAIL", f"Dolt server unreachable on port {port}: {e}"


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

    # 3. Dolt server health (Beads dependency)
    status, msg = check_dolt_server()
    emoji = {"OK": "✅", "WARN": "⚠️", "FAIL": "❌"}.get(status, "❓")
    results.append(f"{emoji} *Dolt:* {msg}")
    if status != "OK":
        has_issues = True

    # 4. Beads issue stats (only if Dolt is healthy)
    if status == "OK":
        beads_checks = check_beads_health()
        for b_status, b_msg in beads_checks:
            emoji = {"OK": "✅", "WARN": "⚠️", "FAIL": "❌"}.get(b_status, "❓")
            results.append(f"{emoji} *{b_msg}*")
            if b_status != "OK":
                has_issues = True

    # 5. Items awaiting review
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
