"""Text injection into the active application via clipboard paste.

Saves clipboard -> sets text -> pastes (Ctrl+V or Ctrl+Shift+V) -> restores clipboard.
"""

import ctypes
import ctypes.wintypes
import logging
import time

import pyperclip
import keyboard as kb

logger = logging.getLogger(__name__)

user32 = ctypes.windll.user32

# Known terminal window class names that need Ctrl+Shift+V
DEFAULT_TERMINAL_CLASSES = frozenset({
    "WarpTerminal",
    "ConsoleWindowClass",
    "CASCADIA_HOSTING_WINDOW_CLASS",
    "mintty",
    "VirtualConsoleClass",
    "PseudoConsoleWindow",
})


def get_active_window_class() -> str:
    """Get the class name of the currently focused window."""
    hwnd = user32.GetForegroundWindow()
    class_name = ctypes.create_unicode_buffer(256)
    user32.GetClassNameW(hwnd, class_name, 256)
    return class_name.value


def get_active_window_title() -> str:
    """Get the title of the currently focused window."""
    hwnd = user32.GetForegroundWindow()
    length = user32.GetWindowTextLengthW(hwnd)
    if length == 0:
        return ""
    buf = ctypes.create_unicode_buffer(length + 1)
    user32.GetWindowTextW(hwnd, buf, length + 1)
    return buf.value


def is_terminal(class_name: str, extra_classes: frozenset[str] | None = None) -> bool:
    """Check if a window class name belongs to a terminal emulator."""
    classes = DEFAULT_TERMINAL_CLASSES
    if extra_classes:
        classes = classes | extra_classes
    return class_name in classes


class TextInjector:
    """Injects text into the active application via clipboard paste."""

    def __init__(
        self,
        restore_clipboard: bool = True,
        paste_delay_ms: int = 50,
        terminal_classes: list[str] | None = None,
    ):
        self.restore_clipboard = restore_clipboard
        self.paste_delay_ms = paste_delay_ms
        self._extra_terminal_classes = (
            frozenset(terminal_classes) if terminal_classes else None
        )

    def inject(self, text: str) -> bool:
        """Inject text into the currently active application.

        Returns True if injection was attempted, False if text was empty.
        """
        if not text or not text.strip():
            return False

        # Save current clipboard
        original_clipboard = None
        if self.restore_clipboard:
            try:
                original_clipboard = pyperclip.paste()
            except Exception:
                original_clipboard = None

        try:
            # Set clipboard to our text
            pyperclip.copy(text)

            # Small delay to ensure clipboard is set
            time.sleep(self.paste_delay_ms / 1000.0)

            # Detect if we're in a terminal
            window_class = get_active_window_class()
            use_shift = is_terminal(window_class, self._extra_terminal_classes)

            # Send paste keystroke
            if use_shift:
                kb.send("ctrl+shift+v")
                logger.debug("Pasted with Ctrl+Shift+V (terminal: %s)", window_class)
            else:
                kb.send("ctrl+v")
                logger.debug("Pasted with Ctrl+V (app: %s)", window_class)

            # Wait for paste to complete
            time.sleep(0.1)

            return True

        except Exception as e:
            logger.error("Injection failed: %s", e)
            return False

        finally:
            # Restore original clipboard
            if self.restore_clipboard and original_clipboard is not None:
                time.sleep(0.1)
                try:
                    pyperclip.copy(original_clipboard)
                except Exception:
                    pass
