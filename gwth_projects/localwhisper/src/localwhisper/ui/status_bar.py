"""Multi-monitor floating status bars for LocalWhisper.

Shows a small pill at the top-center of every connected monitor.
Changes color/text to reflect app state: idle, recording, processing, error.
After transcription, displays the text; click to copy to clipboard.
"""

import ctypes
import ctypes.wintypes
import logging
import tkinter as tk
import webbrowser
from dataclasses import dataclass

logger = logging.getLogger(__name__)

# Windows extended styles
GWL_EXSTYLE = -20
WS_EX_TOOLWINDOW = 0x00000080
WS_EX_TOPMOST = 0x00000008
WS_EX_NOACTIVATE = 0x08000000

# State → (background, foreground, default text)
_STATE_STYLES = {
    "idle": ("#2d2d2d", "#4ade80", "LocalWhisper \u2014 Idle"),
    "recording": ("#dc2626", "#ffffff", "\u25cf Recording\u2026"),
    "processing": ("#d97706", "#ffffff", "\u231b Processing\u2026"),
    "error": ("#991b1b", "#ffffff", "Error"),
    "transcribed": ("#1e40af", "#ffffff", ""),
}

# Recording pulse colors
_PULSE_BRIGHT = "#dc2626"
_PULSE_DARK = "#7f1d1d"

BAR_WIDTH = 300
BAR_HEIGHT = 28
BAR_Y_OFFSET = 6  # pixels from top of screen


@dataclass
class MonitorRect:
    """Rectangle describing a monitor's geometry."""

    x: int
    y: int
    width: int
    height: int


def get_monitors() -> list[MonitorRect]:
    """Enumerate all connected monitors via Windows API."""
    monitors: list[MonitorRect] = []

    def _callback(hMonitor, hdcMonitor, lprcMonitor, dwData):
        rc = lprcMonitor.contents
        monitors.append(MonitorRect(
            x=rc.left, y=rc.top,
            width=rc.right - rc.left,
            height=rc.bottom - rc.top,
        ))
        return True

    MONITORENUMPROC = ctypes.WINFUNCTYPE(
        ctypes.c_int,
        ctypes.wintypes.HMONITOR,
        ctypes.wintypes.HDC,
        ctypes.POINTER(ctypes.wintypes.RECT),
        ctypes.wintypes.LPARAM,
    )
    ctypes.windll.user32.EnumDisplayMonitors(
        None, None, MONITORENUMPROC(_callback), 0
    )
    return monitors


class _BarWindow:
    """A single status-bar Toplevel on one monitor."""

    def __init__(self, root: tk.Tk, monitor: MonitorRect, on_click, on_toggle):
        self.monitor = monitor
        self._on_click = on_click
        self._on_toggle = on_toggle

        self.win = tk.Toplevel(root)
        self.win.overrideredirect(True)
        self.win.attributes("-topmost", True)
        self.win.attributes("-alpha", 0.88)
        self.win.configure(bg="#2d2d2d")

        # Position at top-center of this monitor
        x = monitor.x + (monitor.width - BAR_WIDTH) // 2
        y = monitor.y + BAR_Y_OFFSET
        self.win.geometry(f"{BAR_WIDTH}x{BAR_HEIGHT}+{x}+{y}")

        # Frame holds label + record button side by side
        self.frame = tk.Frame(self.win, bg="#2d2d2d")
        self.frame.pack(fill=tk.BOTH, expand=True)

        self.label = tk.Label(
            self.frame,
            text="LocalWhisper \u2014 Idle",
            fg="#4ade80",
            bg="#2d2d2d",
            font=("Segoe UI", 10),
            anchor="center",
            cursor="hand2",
        )
        self.label.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        self.label.bind("<Button-1>", self._handle_click)

        # Record/Stop button
        self.rec_btn = tk.Label(
            self.frame,
            text="\u23fa",  # ⏺ record icon
            fg="#ff6b6b",
            bg="#2d2d2d",
            font=("Segoe UI", 12),
            cursor="hand2",
            padx=6,
        )
        self.rec_btn.pack(side=tk.RIGHT)
        self.rec_btn.bind("<Button-1>", self._handle_toggle)

        # Drag-to-move support
        self._drag_start_x = 0
        self._drag_start_y = 0
        for widget in (self.frame, self.label):
            widget.bind("<ButtonPress-3>", self._drag_start)
            widget.bind("<B3-Motion>", self._drag_motion)

        # Make unfocusable
        self.win.update_idletasks()
        self._make_unfocusable()

    def _make_unfocusable(self):
        try:
            hwnd = int(self.win.frame(), 16)
            style = ctypes.windll.user32.GetWindowLongW(hwnd, GWL_EXSTYLE)
            style |= WS_EX_TOOLWINDOW | WS_EX_TOPMOST | WS_EX_NOACTIVATE
            ctypes.windll.user32.SetWindowLongW(hwnd, GWL_EXSTYLE, style)
        except Exception as e:
            logger.debug("Could not set window styles: %s", e)

    def _handle_click(self, event):
        if self._on_click:
            self._on_click()

    def _handle_toggle(self, event):
        if self._on_toggle:
            self._on_toggle()

    def _drag_start(self, event):
        self._drag_start_x = event.x_root - self.win.winfo_x()
        self._drag_start_y = event.y_root - self.win.winfo_y()

    def _drag_motion(self, event):
        x = event.x_root - self._drag_start_x
        y = event.y_root - self._drag_start_y
        self.win.geometry(f"+{x}+{y}")

    def update_style(self, bg: str, fg: str, text: str):
        try:
            self.win.configure(bg=bg)
            self.frame.configure(bg=bg)
            self.label.configure(bg=bg, fg=fg, text=text)
            self.rec_btn.configure(bg=bg)
        except tk.TclError:
            pass

    def set_rec_icon(self, recording: bool):
        """Switch between record and stop icons."""
        try:
            if recording:
                self.rec_btn.configure(text="\u23f9", fg="#ffffff")  # ⏹ stop
            else:
                self.rec_btn.configure(text="\u23fa", fg="#ff6b6b")  # ⏺ record
        except tk.TclError:
            pass

    def destroy(self):
        try:
            self.win.destroy()
        except tk.TclError:
            pass


class StatusBar:
    """Multi-monitor floating status bars.

    Creates one bar per connected monitor. Thread-safe: all UI mutations
    are dispatched to the main thread via root.after().
    """

    def __init__(self, settings_url: str = "http://127.0.0.1:9876",
                 on_toggle_recording=None):
        self._settings_url = settings_url
        self._on_toggle_recording = on_toggle_recording
        self._root: tk.Tk | None = None
        self._bars: list[_BarWindow] = []
        self._state = "idle"
        self._last_text = ""
        self._pulse_id = None
        self._pulse_on = True
        self._text_clear_id = None

    def init_ui(self, root: tk.Tk) -> None:
        """Create bars on every monitor. Must be called from main thread."""
        self._root = root
        monitors = get_monitors()
        if not monitors:
            # Fallback: single virtual monitor from tkinter
            monitors = [MonitorRect(
                x=0, y=0,
                width=root.winfo_screenwidth(),
                height=root.winfo_screenheight(),
            )]
            logger.warning("EnumDisplayMonitors returned nothing, using fallback.")

        for mon in monitors:
            bar = _BarWindow(root, mon, on_click=self._on_click,
                             on_toggle=self._on_toggle_recording)
            self._bars.append(bar)

        logger.info("Status bars created on %d monitor(s).", len(self._bars))

    # -- public API (thread-safe) -----------------------------------------

    def set_state(self, state: str) -> None:
        """Update bars to reflect a new state. Thread-safe."""
        if self._root:
            self._root.after(0, self._do_set_state, state)

    def show_transcription(self, text: str) -> None:
        """Show transcribed text in bars. Click copies to clipboard."""
        self._last_text = text
        if self._root:
            self._root.after(0, self._do_show_transcription, text)

    def show_error(self, message: str) -> None:
        """Show error message in bars."""
        if self._root:
            self._root.after(0, self._do_show_error, message)

    def destroy(self) -> None:
        """Clean up all bar windows."""
        self._stop_pulse()
        self._cancel_text_clear()
        for bar in self._bars:
            bar.destroy()
        self._bars.clear()

    # -- internal (main-thread only) --------------------------------------

    def _do_set_state(self, state: str):
        self._stop_pulse()
        self._cancel_text_clear()
        self._state = state

        style = _STATE_STYLES.get(state, _STATE_STYLES["idle"])
        bg, fg, text = style
        is_recording = state == "recording"
        for bar in self._bars:
            bar.update_style(bg, fg, text)
            bar.set_rec_icon(is_recording)

        if is_recording:
            self._start_pulse()

    def _do_show_transcription(self, text: str):
        self._stop_pulse()
        self._cancel_text_clear()
        self._state = "transcribed"
        self._last_text = text

        # Truncate for display but keep full text for copy
        display = text if len(text) <= 40 else text[:37] + "\u2026"
        bg, fg, _ = _STATE_STYLES["transcribed"]
        for bar in self._bars:
            bar.update_style(bg, fg, display)

        # Auto-clear back to idle after 5 seconds
        if self._root:
            self._text_clear_id = self._root.after(5000, self._clear_transcription)

    def _do_show_error(self, message: str):
        self._stop_pulse()
        self._cancel_text_clear()
        self._state = "error"

        display = message if len(message) <= 35 else message[:32] + "\u2026"
        bg, fg, _ = _STATE_STYLES["error"]
        for bar in self._bars:
            bar.update_style(bg, fg, f"Error: {display}")

    def _clear_transcription(self):
        """Return to idle after showing transcribed text."""
        self._text_clear_id = None
        self._do_set_state("idle")

    def _cancel_text_clear(self):
        if self._text_clear_id and self._root:
            self._root.after_cancel(self._text_clear_id)
            self._text_clear_id = None

    # -- pulse animation --------------------------------------------------

    def _start_pulse(self):
        self._pulse_on = True
        self._pulse()

    def _stop_pulse(self):
        if self._pulse_id and self._root:
            self._root.after_cancel(self._pulse_id)
            self._pulse_id = None

    def _pulse(self):
        if self._state != "recording":
            return
        color = _PULSE_BRIGHT if self._pulse_on else _PULSE_DARK
        for bar in self._bars:
            try:
                bar.win.configure(bg=color)
                bar.frame.configure(bg=color)
                bar.label.configure(bg=color)
                bar.rec_btn.configure(bg=color)
            except tk.TclError:
                pass
        self._pulse_on = not self._pulse_on
        if self._root:
            self._pulse_id = self._root.after(500, self._pulse)

    # -- click handling ---------------------------------------------------

    def _on_click(self):
        if self._state == "transcribed" and self._last_text:
            # Copy transcribed text to clipboard
            if self._root:
                self._root.clipboard_clear()
                self._root.clipboard_append(self._last_text)
                logger.info("Copied transcription to clipboard.")
                # Visual feedback: briefly show "Copied!"
                for bar in self._bars:
                    bar.update_style("#166534", "#ffffff", "Copied to clipboard!")
                self._cancel_text_clear()
                self._text_clear_id = self._root.after(1500, self._clear_transcription)
        else:
            webbrowser.open(self._settings_url)
