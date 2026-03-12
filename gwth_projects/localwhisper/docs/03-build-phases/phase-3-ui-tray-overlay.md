# Phase 3: System Tray & Recording Overlay

## Goal
Build the system tray icon with menu and the transparent recording overlay.

## Dependencies
- Phase 2 complete (hotkeys and injection work)

## Tasks

### 3.1 System Tray (`src/localwhisper/ui/tray.py`)
- Create system tray icon using `pystray`
- Menu items:
  - **Start/Stop Recording** (toggle)
  - **Settings** (opens browser to FastAPI settings page)
  - **History** (opens browser to history page)
  - **---** (separator)
  - **Model: large-v3-turbo** (display only)
  - **Status: Idle / Recording / Processing** (display only)
  - **---** (separator)
  - **Quit**
- Icon states:
  - Green circle = Idle
  - Red circle = Recording
  - Yellow circle = Processing
- Run in its own thread (pystray requirement)
- Tooltip shows status on hover

### 3.2 Recording Overlay (`src/localwhisper/ui/overlay.py`)
- Transparent tkinter `Toplevel` window
- Always on top (`topmost=True`, `overrideredirect=True`)
- Shows when recording starts, hides when done
- Visual elements:
  - Pulsing red circle (recording indicator)
  - "Listening..." text
  - Semi-transparent dark background
- Position configurable (top-center default)
- Minimal size (~200x48px)
- Does not steal focus from active app (critical!)
- Fade in/out animation (optional nicety)

### 3.3 Generate Tray Icons
- Create icon images programmatically using Pillow
- 64x64 ICO files with transparency
- Colors: green (idle), red (recording), yellow (processing)
- Save to `assets/` directory

### 3.4 Wire UI to Pipeline
- Pipeline state changes update both tray and overlay
- Recording start -> show overlay, change tray icon
- Transcription complete -> hide overlay, change tray icon
- Error -> show error notification via tray

## Acceptance Criteria (Tests)

```python
# tests/unit/test_tray.py (limited - system tray hard to test)
def test_tray_icon_creates():
    """Tray icon can be instantiated without error."""
def test_tray_menu_items():
    """Menu has expected items."""
def test_tray_icon_states():
    """Icons exist for all states."""

# tests/unit/test_overlay.py
def test_overlay_creates():
    """Overlay window can be created."""
def test_overlay_show_hide():
    """Overlay can show and hide."""
def test_overlay_does_not_steal_focus():
    """Overlay does not become focused window."""
def test_overlay_position():
    """Overlay appears at configured position."""
def test_overlay_transparency():
    """Overlay has configured opacity."""

# Programmatic icon generation test
def test_icons_generated():
    """All icon files exist in assets/."""
    assert Path("assets/icon_idle.ico").exists()
    assert Path("assets/icon_recording.ico").exists()
    assert Path("assets/icon_processing.ico").exists()
```

## Key Implementation Notes

### Overlay Without Focus Stealing (Critical for Dictation)
```python
import tkinter as tk
import ctypes

# Windows-specific: Set window as tool window (no taskbar, no focus steal)
GWL_EXSTYLE = -20
WS_EX_TOOLWINDOW = 0x00000080
WS_EX_TOPMOST = 0x00000008
WS_EX_NOACTIVATE = 0x08000000

def make_overlay_unfocusable(hwnd):
    style = ctypes.windll.user32.GetWindowLongW(hwnd, GWL_EXSTYLE)
    style |= WS_EX_TOOLWINDOW | WS_EX_TOPMOST | WS_EX_NOACTIVATE
    ctypes.windll.user32.SetWindowLongW(hwnd, GWL_EXSTYLE, style)
```

### Threading Note
- tkinter MUST run on main thread
- pystray runs in its own thread
- Overlay updates must use `root.after()` for thread safety

## Ralph Wiggum Gate
- Tray icon appears in system tray -> pass
- Overlay shows/hides without stealing focus -> pass
- All tests pass -> proceed to Phase 4
