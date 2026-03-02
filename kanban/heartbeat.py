#!/usr/bin/env python3
"""
Heartbeat Monitor — Self-Healing Infrastructure & Workflow Health.
Checks Linear poll freshness, P520/Hetzner health, Dolt, Beads stats,
and pipeline integrity (Linear → Beads → kanban). Performs safe, idempotent
repairs when issues are detected. Sends Telegram summary in HTML mode.

Schedule hourly (offset 30 min from sync):
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

from kanban_utils import (
    IDEA_DIR,
    KANBAN_DIR,
    extract_linear_identifier,
    generate_kanban_file,
    load_state,
    query_linear_ideas,
    run_bd,
    save_state,
)

# Config
TELEGRAM_BOT_TOKEN = os.environ.get("TELEGRAM_BOT_TOKEN", "")
TELEGRAM_CHAT_ID = os.environ.get("TELEGRAM_CHAT_ID", "")
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
    print(line.encode(sys.stdout.encoding or "utf-8", errors="replace").decode(
        sys.stdout.encoding or "utf-8", errors="replace"))
    with open(LOG_FILE, "a", encoding="utf-8") as f:
        f.write(line + "\n")


def send_telegram(message):
    """Send a message via Telegram bot using HTML parse mode."""
    if not TELEGRAM_BOT_TOKEN or not TELEGRAM_CHAT_ID:
        log("WARNING: Telegram credentials not set, skipping notification")
        return False

    url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"
    payload = json.dumps({
        "chat_id": TELEGRAM_CHAT_ID,
        "text": message,
        "parse_mode": "HTML",
    }).encode()

    req = urllib.request.Request(url, data=payload, headers={
        "Content-Type": "application/json",
    })

    try:
        urllib.request.urlopen(req)
        return True
    except Exception as e:
        log(f"ERROR: Telegram send failed: {e}")
        # Try plain text fallback (strip HTML tags)
        try:
            import re
            plain = re.sub(r"<[^>]+>", "", message)
            payload_plain = json.dumps({
                "chat_id": TELEGRAM_CHAT_ID,
                "text": plain,
            }).encode()
            req_plain = urllib.request.Request(url, data=payload_plain, headers={
                "Content-Type": "application/json",
            })
            urllib.request.urlopen(req_plain)
            log("Telegram sent as plain text fallback")
            return True
        except Exception as e2:
            log(f"ERROR: Telegram plain text fallback also failed: {e2}")
            return False


def check_poll_health():
    """Check if unified-sync.py (or legacy linear-poll.py) has run recently."""
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

    # Scan last 10 lines for errors (not just the last line)
    lines = log_file.read_text(encoding="utf-8").strip().split("\n")
    tail = lines[-10:] if len(lines) >= 10 else lines
    for line in reversed(tail):
        lower = line.lower()
        if "error" in lower or "failed" in lower:
            return "FAIL", f"Recent sync error: {line.strip()}"

    last_line = lines[-1] if lines else ""
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
                    items.append(f"  - {project}: {f.name}")
    return items


def check_linear_config():
    """Verify bd linear integration is configured."""
    ok, output = run_bd("linear", "status")
    if not ok:
        return "FAIL", "Linear integration not configured (bd linear status failed)"
    if "Team ID" in output:
        return "OK", "Linear integration configured"
    return "WARN", "Linear integration may be misconfigured"


def check_pipeline_integrity():
    """
    End-to-end check: every Linear "idea" issue should have a Beads issue
    with issue_type=idea AND a kanban file in 0_idea/ (or be tracked in state).
    Returns (status, message, orphans_list).
    """
    linear_ideas = query_linear_ideas()
    if not linear_ideas:
        return "OK", "No Linear ideas to check (or API unavailable)", []

    # Get open Beads issues
    ok, output = run_bd("list", "--status=open", "--json")
    if not ok:
        return "WARN", "Could not list Beads issues for pipeline check", []

    try:
        issues = json.loads(output)
    except json.JSONDecodeError:
        return "WARN", "Could not parse Beads issues for pipeline check", []

    # Map Linear identifiers to Beads issues
    linear_to_beads = {}
    for issue in issues:
        ext_ref = issue.get("external_ref", "")
        linear_id = extract_linear_identifier(ext_ref)
        if linear_id:
            linear_to_beads[linear_id] = issue

    # Check each Linear idea
    kanban_state = load_state()
    orphans = []

    for linear_id in linear_ideas:
        beads_issue = linear_to_beads.get(linear_id)
        if not beads_issue:
            orphans.append(f"{linear_id}: not in Beads")
            continue
        if beads_issue.get("issue_type") != "idea":
            orphans.append(f"{linear_id} ({beads_issue.get('id', '?')}): wrong type '{beads_issue.get('issue_type')}'")
            continue
        beads_id = beads_issue.get("id", "")
        if beads_id not in kanban_state:
            # Check if a file actually exists for this issue
            existing_files = list(IDEA_DIR.glob(f"{beads_id}_*.md")) if IDEA_DIR.exists() else []
            if not existing_files:
                orphans.append(f"{linear_id} ({beads_id}): no kanban file")

    if orphans:
        return "WARN", f"Pipeline has {len(orphans)} orphan(s)", orphans
    return "OK", f"Pipeline intact: {len(linear_ideas)} idea(s) tracked", []


def repair_idea_types():
    """
    Self-healing: fix Beads issues that should be type=idea but aren't.
    Safe and idempotent. Returns list of repair descriptions.
    """
    linear_ideas = query_linear_ideas()
    if not linear_ideas:
        return []

    ok, output = run_bd("list", "--status=open", "--json")
    if not ok:
        return []

    try:
        issues = json.loads(output)
    except json.JSONDecodeError:
        return []

    repairs = []
    for issue in issues:
        if issue.get("issue_type") == "idea":
            continue

        ext_ref = issue.get("external_ref", "")
        linear_id = extract_linear_identifier(ext_ref)
        if linear_id and linear_id in linear_ideas:
            issue_id = issue.get("id", "")
            ok, _ = run_bd("update", issue_id, "--type=idea")
            if ok:
                repairs.append(f"Fixed {issue_id} ({linear_id}) type → idea")
                log(f"REPAIR: {repairs[-1]}")

    return repairs


def repair_missing_kanban():
    """
    Self-healing: generate missing kanban files for Beads "idea" issues.
    Safe and idempotent. Returns list of repair descriptions.
    """
    ok, output = run_bd("list", "--status=open", "--json")
    if not ok:
        return []

    try:
        issues = json.loads(output)
    except json.JSONDecodeError:
        return []

    kanban_state = load_state()
    repairs = []

    for issue in issues:
        if issue.get("issue_type") != "idea":
            continue

        issue_id = issue.get("id", "")
        if issue_id in kanban_state:
            continue

        # Check if file already exists on disk
        existing = list(IDEA_DIR.glob(f"{issue_id}_*.md")) if IDEA_DIR.exists() else []
        if existing:
            kanban_state.add(issue_id)
            continue

        filepath = generate_kanban_file(issue)
        kanban_state.add(issue_id)
        repairs.append(f"Generated {filepath.name} for {issue_id}")
        log(f"REPAIR: {repairs[-1]}")

    save_state(kanban_state)
    return repairs


def repair_failed_sync():
    """
    Self-healing: if the last sync failed/timed out, retry pull+push.
    Returns list of repair descriptions.
    """
    if not POLL_LOG.exists():
        return []

    lines = POLL_LOG.read_text(encoding="utf-8").strip().split("\n")
    tail = lines[-10:] if len(lines) >= 10 else lines

    has_error = False
    for line in tail:
        lower = line.lower()
        if "error" in lower or "failed" in lower or "timeout" in lower:
            has_error = True
            break

    if not has_error:
        return []

    repairs = []
    log("REPAIR: retrying sync after detected failure...")

    ok, output = run_bd("linear", "sync", "--pull")
    if ok:
        repairs.append("Retry pull succeeded")
    else:
        repairs.append(f"Retry pull failed: {output}")

    ok, output = run_bd("linear", "sync", "--push")
    if ok:
        repairs.append("Retry push succeeded")
    else:
        repairs.append(f"Retry push failed: {output}")

    return repairs


def main():
    log("Heartbeat check starting")
    results = []
    repairs = []
    has_issues = False

    # 1. Linear poll health
    status, msg = check_poll_health()
    emoji = {"OK": "\u2705", "WARN": "\u26a0\ufe0f", "FAIL": "\u274c"}.get(status, "\u2753")
    results.append(f"{emoji} <b>Poll:</b> {msg}")
    if status != "OK":
        has_issues = True

    # 2. Infrastructure health
    for name, url in HEALTH_CHECKS.items():
        status, msg = check_endpoint(name, url)
        emoji = {"OK": "\u2705", "WARN": "\u26a0\ufe0f", "FAIL": "\u274c"}.get(status, "\u2753")
        results.append(f"{emoji} <b>{name}:</b> {msg}")
        if status != "OK":
            has_issues = True

    # 3. Dolt server health (Beads dependency)
    dolt_status, msg = check_dolt_server()
    emoji = {"OK": "\u2705", "WARN": "\u26a0\ufe0f", "FAIL": "\u274c"}.get(dolt_status, "\u2753")
    results.append(f"{emoji} <b>Dolt:</b> {msg}")
    if dolt_status != "OK":
        has_issues = True

    # 4. Beads issue stats (only if Dolt is healthy)
    if dolt_status == "OK":
        beads_checks = check_beads_health()
        for b_status, b_msg in beads_checks:
            emoji = {"OK": "\u2705", "WARN": "\u26a0\ufe0f", "FAIL": "\u274c"}.get(b_status, "\u2753")
            results.append(f"{emoji} <b>{b_msg}</b>")
            if b_status != "OK":
                has_issues = True

    # 5. Linear integration check
    if dolt_status == "OK":
        status, msg = check_linear_config()
        emoji = {"OK": "\u2705", "WARN": "\u26a0\ufe0f", "FAIL": "\u274c"}.get(status, "\u2753")
        results.append(f"{emoji} <b>Linear:</b> {msg}")
        if status != "OK":
            has_issues = True

    # 6. Pipeline integrity check
    if dolt_status == "OK":
        status, msg, orphans = check_pipeline_integrity()
        emoji = {"OK": "\u2705", "WARN": "\u26a0\ufe0f", "FAIL": "\u274c"}.get(status, "\u2753")
        results.append(f"{emoji} <b>Pipeline:</b> {msg}")
        if status != "OK":
            has_issues = True
            for orphan in orphans:
                results.append(f"  - {orphan}")

    # 7. Items awaiting review
    testing_items = check_testing_items()
    if testing_items:
        results.append(f"\U0001f4cb <b>Awaiting review ({len(testing_items)} items):</b>")
        results.extend(testing_items)

    # === Self-Healing Repairs ===
    if dolt_status == "OK":
        # Repair wrong issue types
        type_repairs = repair_idea_types()
        repairs.extend(type_repairs)

        # Repair missing kanban files
        kanban_repairs = repair_missing_kanban()
        repairs.extend(kanban_repairs)

        # Retry failed sync
        sync_repairs = repair_failed_sync()
        repairs.extend(sync_repairs)

    # Build message (HTML format for Telegram)
    now = datetime.now().strftime("%Y-%m-%d %H:%M")
    if repairs:
        header = "\U0001f527 <b>GWTH Heartbeat — Self-Healed</b>"
    elif has_issues:
        header = "\U0001f534 <b>GWTH Heartbeat — Issues Detected</b>"
    else:
        header = "\U0001f7e2 <b>GWTH Heartbeat — All Clear</b>"

    message = f"{header}\n<i>{now}</i>\n\n" + "\n".join(results)

    if repairs:
        message += "\n\n\U0001f527 <b>Repairs performed:</b>"
        for repair in repairs:
            message += f"\n  - {repair}"

    # Send Telegram if there are issues, repairs, or testing items
    if has_issues or testing_items or repairs:
        send_telegram(message)
        log(f"Telegram sent (issues: {has_issues}, repairs: {len(repairs)}, testing: {len(testing_items)})")
    else:
        log("All clear, no Telegram sent (suppressing green heartbeats)")

    # Always log the full status
    for r in results:
        log(r)
    for r in repairs:
        log(f"REPAIR: {r}")


if __name__ == "__main__":
    main()
