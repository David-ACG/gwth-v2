@echo off
REM Register Windows Task Scheduler jobs for kanban automation
REM Run this once from an elevated (admin) command prompt
REM
REM Tasks:
REM   UnifiedSync    — Pulls Linear ideas into Beads, generates kanban files, pushes closed issues back
REM   KanbanHeartbeat — Monitors infrastructure health, sends Telegram alerts, auto-repairs issues

REM Delete legacy task if it exists
schtasks /Delete /TN "LinearKanbanPoll" /F >nul 2>&1

REM Unified Sync: every 30 minutes, starting at :00
schtasks /Create /TN "UnifiedSync" /TR "\"C:\Program Files\Python313\python.exe\" C:\Projects\GWTH_V2\kanban\unified-sync.py" /SC MINUTE /MO 30 /ST 00:00 /F
if %ERRORLEVEL% EQU 0 (echo UnifiedSync registered successfully) else (echo FAILED to register UnifiedSync)

REM Heartbeat: every 30 minutes, starting at :15 (offset from sync)
schtasks /Create /TN "KanbanHeartbeat" /TR "\"C:\Program Files\Python313\python.exe\" C:\Projects\GWTH_V2\kanban\heartbeat.py" /SC MINUTE /MO 30 /ST 00:15 /F
if %ERRORLEVEL% EQU 0 (echo KanbanHeartbeat registered successfully) else (echo FAILED to register KanbanHeartbeat)

echo.
echo Verify with: schtasks /Query /TN "UnifiedSync"
echo              schtasks /Query /TN "KanbanHeartbeat"
pause
