# Phase 5: Integration, Polish & Full E2E Testing

## Goal
Wire everything together, add polish, and run comprehensive end-to-end tests.

## Dependencies
- Phase 4 complete (all components work individually)

## Tasks

### 5.1 Main Application Entry Point (`src/localwhisper/app.py`)
- Initialize all components in correct order:
  1. Load configuration
  2. Initialize database
  3. Load Whisper model (show progress)
  4. Start FastAPI server thread
  5. Start hotkey listener thread
  6. Start system tray thread
  7. Run tkinter main loop (overlay + event processing)
- Graceful shutdown on quit:
  - Unregister hotkeys
  - Stop audio recording
  - Stop FastAPI server
  - Close database
  - Exit cleanly

### 5.2 Error Handling & Recovery
- Catch and log all exceptions (don't crash)
- If transcription fails -> show tray notification, return to idle
- If model fails to load -> fall back to smaller model
- If microphone not available -> show error in tray menu
- If port 9876 in use -> try next port
- Log to `data/localwhisper.log` with rotation

### 5.3 Startup Experience
- First run: auto-download model (show progress in console)
- First run: open settings page in browser
- Subsequent runs: start minimized to tray
- Show tray notification: "LocalWhisper ready"

### 5.4 Performance Optimization
- Model stays loaded in memory (don't reload per transcription)
- Audio buffer pre-allocated
- Clipboard operations are fast (<50ms)
- Total latency target: <1.5s from hotkey release to text appearing

### 5.5 Notification System
- Windows toast notifications via `plyer` or `win10toast`
- Notify on:
  - App ready
  - Transcription complete (optional, configurable)
  - Errors

### 5.6 Logging
- Python `logging` module
- Log to file: `data/localwhisper.log`
- Rotating file handler (5MB max, 3 backups)
- Console output in debug mode
- Log levels configurable

## Acceptance Criteria (Tests)

```python
# tests/integration/test_end_to_end_flow.py

def test_app_starts_cleanly():
    """Application starts without errors."""
    # Start app in subprocess, check it initializes

def test_app_creates_tray_icon():
    """Tray icon appears in system tray after startup."""

def test_app_serves_settings():
    """Settings page is accessible after startup."""
    import httpx
    r = httpx.get("http://127.0.0.1:9876/health")
    assert r.status_code == 200

def test_full_dictation_flow():
    """Complete flow: start app -> hotkey -> speak -> text appears."""
    # This is a manual/supervised test
    # Steps documented in manual-test-plan.md

def test_app_shuts_down_cleanly():
    """App exits without errors when quit from tray."""

def test_model_fallback():
    """If configured model unavailable, falls back gracefully."""

def test_port_conflict_recovery():
    """If port in use, finds next available port."""

def test_clipboard_restored():
    """After injection, original clipboard is preserved."""

# tests/e2e/test_settings_ui.py (extends Phase 4 tests)
def test_status_updates_live(page):
    """Status API reflects current recording state."""

def test_microphone_test_button(page):
    """Microphone test records and shows waveform/result."""
```

### Playwright E2E Suite (Comprehensive)

```python
# tests/e2e/test_full_app.py
"""
Full application Playwright tests.
These test the Settings UI while the app is running.
"""

def test_settings_reflect_running_config(page):
    """Settings page shows actual running configuration."""

def test_history_populates_after_transcription(page):
    """After a transcription, history page shows new entry."""

def test_model_change_takes_effect(page):
    """Changing model in settings actually changes the transcription model."""

def test_hotkey_change_takes_effect(page):
    """Changing hotkey in settings registers new hotkey."""
```

## Ralph Wiggum Gate
- App starts, all components initialize -> pass
- Full E2E Playwright suite passes -> pass
- App shuts down cleanly -> pass
- All tests pass -> proceed to Phase 6
