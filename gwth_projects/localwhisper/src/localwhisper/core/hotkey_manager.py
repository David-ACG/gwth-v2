"""Global hotkey management for recording control.

Supports push-to-talk (hold to record) and toggle (press to start/stop) modes.
"""

import logging
import threading
from typing import Callable

import keyboard as kb

logger = logging.getLogger(__name__)


class HotkeyManager:
    """Manages global hotkeys for recording control."""

    def __init__(
        self,
        hotkey: str = "ctrl+shift+space",
        mode: str = "push_to_talk",
        on_start: Callable[[], None] | None = None,
        on_stop: Callable[[], None] | None = None,
    ):
        self.hotkey = hotkey
        self.mode = mode  # "push_to_talk" or "toggle"
        self._on_start = on_start
        self._on_stop = on_stop

        self._registered = False
        self._toggle_active = False
        self._ptt_active = False  # Guards against key repeat spam
        self._lock = threading.Lock()

    @property
    def is_registered(self) -> bool:
        return self._registered

    def register(self) -> None:
        """Register the global hotkey."""
        if self._registered:
            return

        if self.mode == "push_to_talk":
            self._register_push_to_talk()
        elif self.mode == "toggle":
            self._register_toggle()
        else:
            raise ValueError(f"Unknown hotkey mode: {self.mode}")

        self._registered = True
        logger.info("Hotkey '%s' registered (mode=%s)", self.hotkey, self.mode)

    def unregister(self) -> None:
        """Unregister the global hotkey."""
        if not self._registered:
            return

        try:
            kb.unhook_all_hotkeys()
            kb.unhook_all()
        except Exception:
            pass

        self._registered = False
        self._toggle_active = False
        self._ptt_active = False
        logger.info("Hotkey unregistered.")

    def _register_push_to_talk(self) -> None:
        """Register push-to-talk: hold to record, release to stop.

        Uses a low-level hook to track modifier+key press/release properly,
        avoiding the key-repeat spam from add_hotkey.
        """
        # Parse the hotkey into modifiers and main key
        parts = [k.strip().lower() for k in self.hotkey.split("+")]
        self._ptt_modifiers = set(parts[:-1])  # e.g. {"ctrl", "shift"}
        self._ptt_main_key = parts[-1]          # e.g. "space"

        # Use a low-level hook that sees all key events
        kb.hook(self._ptt_hook, suppress=False)

    def _ptt_hook(self, event: kb.KeyboardEvent) -> None:
        """Low-level keyboard hook for push-to-talk."""
        # Normalize the event key name
        key = event.name.lower() if event.name else ""

        # We only care about the main key (e.g. "space")
        if key != self._ptt_main_key:
            return

        if event.event_type == kb.KEY_DOWN:
            # Check if all modifiers are currently held
            modifiers_held = all(
                kb.is_pressed(mod) for mod in self._ptt_modifiers
            )
            if modifiers_held:
                with self._lock:
                    if not self._ptt_active:
                        # First press - start recording
                        self._ptt_active = True
                        if self._on_start:
                            self._on_start()
                    # If already active, ignore (key repeat)

        elif event.event_type == kb.KEY_UP:
            with self._lock:
                if self._ptt_active:
                    # Main key released while we were recording - stop
                    self._ptt_active = False
                    if self._on_stop:
                        self._on_stop()

    def _register_toggle(self) -> None:
        """Register toggle: press to start, press again to stop."""
        kb.add_hotkey(self.hotkey, self._on_toggle, suppress=True, trigger_on_release=True)

    def _on_toggle(self) -> None:
        """Called when hotkey is pressed (toggle mode)."""
        with self._lock:
            if self._toggle_active:
                self._toggle_active = False
                if self._on_stop:
                    self._on_stop()
            else:
                self._toggle_active = True
                if self._on_start:
                    self._on_start()

    @staticmethod
    def parse_hotkey(hotkey_str: str) -> list[str]:
        """Parse a hotkey string into its component keys."""
        return [k.strip().lower() for k in hotkey_str.split("+")]
