"""Recording overlay - transparent indicator that doesn't steal focus.

Shows a small "Listening..." indicator at the top of the screen during recording.
Uses tkinter with Windows-specific flags to prevent focus stealing.
"""

import ctypes
import logging
import threading
import tkinter as tk

logger = logging.getLogger(__name__)

# Windows extended styles
GWL_EXSTYLE = -20
WS_EX_TOOLWINDOW = 0x00000080
WS_EX_TOPMOST = 0x00000008
WS_EX_NOACTIVATE = 0x08000000
WS_EX_LAYERED = 0x00080000
WS_EX_TRANSPARENT = 0x00000020


class RecordingOverlay:
    """Transparent overlay showing recording state."""

    def __init__(
        self,
        position: str = "top-center",
        opacity: float = 0.85,
        size: int = 48,
    ):
        self.position = position
        self.opacity = opacity
        self.size = size

        self._root: tk.Tk | None = None
        self._overlay: tk.Toplevel | None = None
        self._visible = False
        self._pulse_id = None

    def init_ui(self, root: tk.Tk) -> None:
        """Initialize the overlay window. Must be called from main thread."""
        self._root = root
        self._overlay = tk.Toplevel(root)
        self._overlay.withdraw()  # Start hidden

        # Configure window
        self._overlay.overrideredirect(True)  # No title bar
        self._overlay.attributes("-topmost", True)
        self._overlay.attributes("-alpha", self.opacity)

        # Transparent background
        self._overlay.configure(bg="black")
        self._overlay.attributes("-transparentcolor", "black")

        # Create UI elements
        frame = tk.Frame(self._overlay, bg="#1a1a2e", padx=12, pady=6)
        frame.pack()

        self._dot = tk.Canvas(frame, width=16, height=16, bg="#1a1a2e", highlightthickness=0)
        self._dot.pack(side=tk.LEFT, padx=(0, 8))
        self._dot_circle = self._dot.create_oval(2, 2, 14, 14, fill="#F44336", outline="")

        self._label = tk.Label(
            frame,
            text="Listening...",
            fg="#ffffff",
            bg="#1a1a2e",
            font=("Segoe UI", 11, "bold"),
        )
        self._label.pack(side=tk.LEFT)

        # Position the window
        self._position_window()

        # Make unfocusable using Windows API
        self._overlay.update_idletasks()
        self._make_unfocusable()

    def _position_window(self) -> None:
        """Position overlay based on config."""
        if self._overlay is None:
            return

        self._overlay.update_idletasks()
        w = self._overlay.winfo_reqwidth()
        h = self._overlay.winfo_reqheight()
        screen_w = self._overlay.winfo_screenwidth()

        if self.position == "top-center":
            x = (screen_w - w) // 2
            y = 10
        elif self.position == "top-right":
            x = screen_w - w - 20
            y = 10
        elif self.position == "bottom-right":
            screen_h = self._overlay.winfo_screenheight()
            x = screen_w - w - 20
            y = screen_h - h - 60
        else:
            x = (screen_w - w) // 2
            y = 10

        self._overlay.geometry(f"+{x}+{y}")

    def _make_unfocusable(self) -> None:
        """Set Windows extended styles to prevent focus stealing."""
        try:
            hwnd = int(self._overlay.frame(), 16)
            style = ctypes.windll.user32.GetWindowLongW(hwnd, GWL_EXSTYLE)
            style |= WS_EX_TOOLWINDOW | WS_EX_TOPMOST | WS_EX_NOACTIVATE
            ctypes.windll.user32.SetWindowLongW(hwnd, GWL_EXSTYLE, style)
        except Exception as e:
            logger.debug("Could not set window styles: %s", e)

    def show(self) -> None:
        """Show the overlay. Thread-safe via root.after()."""
        if self._root and self._overlay:
            self._root.after(0, self._do_show)

    def hide(self) -> None:
        """Hide the overlay. Thread-safe via root.after()."""
        if self._root and self._overlay:
            self._root.after(0, self._do_hide)

    def _do_show(self) -> None:
        if self._overlay and not self._visible:
            self._overlay.deiconify()
            self._visible = True
            self._start_pulse()

    def _do_hide(self) -> None:
        if self._overlay and self._visible:
            self._stop_pulse()
            self._overlay.withdraw()
            self._visible = False

    def _start_pulse(self) -> None:
        """Animate the red dot (pulse effect)."""
        self._pulse_step = 0
        self._pulse()

    def _stop_pulse(self) -> None:
        """Stop the pulse animation."""
        if self._pulse_id and self._root:
            self._root.after_cancel(self._pulse_id)
            self._pulse_id = None

    def _pulse(self) -> None:
        """One pulse animation step."""
        if not self._visible or not self._overlay:
            return
        self._pulse_step = (self._pulse_step + 1) % 20
        # Pulse between bright red and darker red
        brightness = abs(self._pulse_step - 10) / 10.0
        r = int(180 + 75 * brightness)
        color = f"#{r:02x}3336"
        try:
            self._dot.itemconfig(self._dot_circle, fill=color)
        except tk.TclError:
            return
        self._pulse_id = self._root.after(100, self._pulse)

    def destroy(self) -> None:
        """Clean up the overlay window."""
        if self._overlay:
            self._stop_pulse()
            self._overlay.destroy()
            self._overlay = None

    @property
    def is_visible(self) -> bool:
        return self._visible
