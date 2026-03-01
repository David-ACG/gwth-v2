# Task: Fix Dolt Server Reliability

## What to change

The Dolt SQL server on port 3307 frequently goes down, breaking all `bd` (Beads) commands. Make it auto-start on Windows logon and add monitoring to the heartbeat script.

## Steps

### 1. Register Dolt as a Windows startup task

Check if `BeadsDoltServer` is already registered in Task Scheduler:
```bash
schtasks /Query /TN "BeadsDoltServer" 2>/dev/null
```

If not registered, create it:
```powershell
schtasks /Create /TN "BeadsDoltServer" /TR "C:\Users\david\AppData\Local\beads\start-dolt.bat" /SC ONLOGON /F
```

Verify Dolt is currently running on port 3307. If it's down, start it:
```bash
"C:\Users\david\AppData\Local\beads\start-dolt.bat"
```

### 2. Add Dolt health check to heartbeat.py

Edit `C:\Projects\GWTH_V2\kanban\heartbeat.py` to add a Dolt server check alongside the existing P520/Hetzner health checks.

The check should:
- Attempt a TCP connection to `127.0.0.1:3307` with a 5-second timeout
- Return OK/FAIL status like the other checks
- Include in the Telegram alert if it fails
- Be silent (no alert) when healthy, matching the existing pattern

## Files likely affected
- `kanban/heartbeat.py` — add Dolt health check function and wire into reporting

## Acceptance criteria
- [ ] Task Scheduler has a `BeadsDoltServer` task that runs on logon
- [ ] Dolt server is currently running on port 3307
- [ ] `heartbeat.py` includes a Dolt health check that alerts on failure
- [ ] Running `python kanban/heartbeat.py` completes without errors
- [ ] Existing heartbeat checks (P520, Hetzner, poll freshness, testing items) still work

## Notes
- The `start-dolt.bat` file already exists at `C:\Users\david\AppData\Local\beads\start-dolt.bat`
- `heartbeat.py` is at `C:\Projects\GWTH_V2\kanban\heartbeat.py`
- Heartbeat sends Telegram alerts only when issues are detected (green = silent)
- Environment vars needed: `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`
