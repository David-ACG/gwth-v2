# Phase 2: Text Injection & Hotkey System

## Goal
Build the text injection system (clipboard paste into active app) and global hotkey manager.

## Dependencies
- Phase 1 complete (transcriber works)

## Tasks

### 2.1 Text Injector (`src/localwhisper/core/text_injector.py`)
- Save current clipboard contents
- Set clipboard to transcribed text
- Detect active window class name (via win32gui)
- If terminal (Warp, cmd, PowerShell) -> Ctrl+Shift+V
- If regular app (Notion, browser, etc.) -> Ctrl+V
- Restore original clipboard after small delay
- Handle edge cases:
  - Empty clipboard (nothing to restore)
  - Binary clipboard data (images, etc.)
  - Multi-line text (preserve newlines)
  - Unicode text (emojis, accented characters)

### 2.2 Window Detection Helper
- `get_active_window_class()` -> returns window class name
- `get_active_window_title()` -> returns window title
- `is_terminal(class_name)` -> checks against known terminal classes
- Uses ctypes + win32 API (no heavy dependencies)

### 2.3 Hotkey Manager (`src/localwhisper/core/hotkey_manager.py`)
- Register global hotkeys using `keyboard` library
- Support two modes:
  - **Push-to-talk**: Hold key to record, release to transcribe
  - **Toggle**: Press once to start, press again to stop
- Configurable hotkey from config
- Callback-based: `on_recording_start`, `on_recording_stop`
- Clean unregistration on shutdown
- Prevent hotkey conflicts (check if already registered)

### 2.4 Connect Pipeline
- Wire hotkey events to pipeline state machine
- Hotkey press -> pipeline.start_recording()
- Hotkey release -> pipeline.stop_recording() -> transcribe -> inject

## Acceptance Criteria (Tests)

```python
# tests/unit/test_text_injector.py
def test_set_clipboard_text():
    """Can set clipboard to a string."""
def test_get_clipboard_text():
    """Can read clipboard contents back."""
def test_save_and_restore_clipboard():
    """Clipboard is restored after injection."""
def test_inject_into_notepad():
    """Opens Notepad, injects text, verifies it appeared."""
    # Integration test - opens actual Notepad
def test_unicode_injection():
    """Unicode characters survive clipboard round-trip."""
def test_multiline_injection():
    """Multi-line text is preserved."""
def test_terminal_detection():
    """Known terminal class names are correctly identified."""
def test_regular_app_detection():
    """Non-terminal apps use Ctrl+V."""

# tests/unit/test_hotkey_manager.py
def test_register_hotkey():
    """Can register a global hotkey."""
def test_unregister_hotkey():
    """Can cleanly unregister a hotkey."""
def test_push_to_talk_callbacks():
    """Push-to-talk fires start on press, stop on release."""
def test_toggle_callbacks():
    """Toggle fires start on first press, stop on second."""
def test_hotkey_from_config():
    """Hotkey string parses correctly."""

# tests/integration/test_end_to_end_flow.py
def test_hotkey_to_text_in_notepad():
    """Full flow: hotkey -> record -> transcribe -> paste in Notepad."""
    # Manual verification test
```

## Key Implementation Notes

### Clipboard via ctypes (no pywin32 needed)
```python
import ctypes
from ctypes import wintypes

user32 = ctypes.windll.user32
kernel32 = ctypes.windll.kernel32

CF_UNICODETEXT = 13

def get_clipboard_text():
    user32.OpenClipboard(0)
    try:
        handle = user32.GetClipboardData(CF_UNICODETEXT)
        if handle:
            return ctypes.c_wchar_p(handle).value
        return ""
    finally:
        user32.CloseClipboard()
```

### Active Window Detection
```python
def get_active_window_class():
    hwnd = user32.GetForegroundWindow()
    class_name = ctypes.create_unicode_buffer(256)
    user32.GetClassNameW(hwnd, class_name, 256)
    return class_name.value
```

## Ralph Wiggum Gate
- ALL unit tests pass -> proceed to Phase 3
- Integration test with Notepad is optional but recommended
- After 3 failures -> STOP and log
