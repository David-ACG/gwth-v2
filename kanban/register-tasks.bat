@echo off
REM Register Windows Task Scheduler jobs for kanban automation
REM Run this once from an elevated (admin) command prompt

schtasks /Create /TN "LinearKanbanPoll" /TR "python C:\Projects\GWTH_V2\kanban\linear-poll.py" /SC HOURLY /ST 00:00 /F
if %ERRORLEVEL% EQU 0 (echo LinearKanbanPoll registered successfully) else (echo FAILED to register LinearKanbanPoll)

schtasks /Create /TN "KanbanHeartbeat" /TR "python C:\Projects\GWTH_V2\kanban\heartbeat.py" /SC HOURLY /ST 00:30 /F
if %ERRORLEVEL% EQU 0 (echo KanbanHeartbeat registered successfully) else (echo FAILED to register KanbanHeartbeat)

echo.
echo Verify with: schtasks /Query /TN "LinearKanbanPoll"
echo              schtasks /Query /TN "KanbanHeartbeat"
pause
