"""System tray icon and menu for LocalWhisper.

Runs pystray in its own thread. Provides menu for start/stop, settings, quit.
"""

import logging
import threading
import webbrowser
from pathlib import Path
from typing import Callable

from PIL import Image
import pystray

from localwhisper.paths import get_app_dir

logger = logging.getLogger(__name__)

ASSETS_DIR = get_app_dir() / "assets"


class TrayIcon:
    """System tray icon with context menu."""

    def __init__(
        self,
        on_toggle_recording: Callable[[], None] | None = None,
        on_quit: Callable[[], None] | None = None,
        settings_url: str = "http://127.0.0.1:9876",
    ):
        self._on_toggle_recording = on_toggle_recording
        self._on_quit = on_quit
        self._settings_url = settings_url

        self._icon: pystray.Icon | None = None
        self._thread: threading.Thread | None = None
        self._status = "Idle"
        self._model_name = "loading..."

        # Load icons
        self._icons = {
            "idle": self._load_icon("icon_idle.png"),
            "recording": self._load_icon("icon_recording.png"),
            "processing": self._load_icon("icon_processing.png"),
        }

    def _load_icon(self, filename: str) -> Image.Image:
        """Load an icon image from assets."""
        path = ASSETS_DIR / filename
        if path.exists():
            return Image.open(path)
        # Fallback: create a simple colored circle
        img = Image.new("RGBA", (64, 64), (0, 0, 0, 0))
        return img

    def _build_menu(self) -> pystray.Menu:
        """Build the context menu."""
        return pystray.Menu(
            pystray.MenuItem(
                "Start/Stop Recording",
                self._handle_toggle_recording,
                default=True,
            ),
            pystray.Menu.SEPARATOR,
            pystray.MenuItem("Settings", self._handle_open_settings),
            pystray.MenuItem("History", self._handle_open_history),
            pystray.Menu.SEPARATOR,
            pystray.MenuItem(f"Model: {self._model_name}", None, enabled=False),
            pystray.MenuItem(f"Status: {self._status}", None, enabled=False),
            pystray.Menu.SEPARATOR,
            pystray.MenuItem("Quit", self._handle_quit),
        )

    def start(self) -> None:
        """Start the tray icon in a background thread."""
        self._icon = pystray.Icon(
            name="LocalWhisper",
            icon=self._icons.get("idle"),
            title="LocalWhisper - Idle",
            menu=self._build_menu(),
        )
        self._thread = threading.Thread(
            target=self._icon.run, daemon=True, name="tray-icon"
        )
        self._thread.start()
        logger.info("Tray icon started.")

    def stop(self) -> None:
        """Stop the tray icon."""
        if self._icon:
            self._icon.stop()
            logger.info("Tray icon stopped.")

    def set_state(self, state: str) -> None:
        """Update the tray icon state: 'idle', 'recording', 'processing'."""
        self._status = state.capitalize()
        if self._icon:
            icon_img = self._icons.get(state, self._icons.get("idle"))
            self._icon.icon = icon_img
            self._icon.title = f"LocalWhisper - {self._status}"
            self._icon.menu = self._build_menu()

    def set_model_name(self, name: str) -> None:
        """Update the displayed model name."""
        self._model_name = name
        if self._icon:
            self._icon.menu = self._build_menu()

    def notify(self, title: str, message: str) -> None:
        """Show a system notification."""
        if self._icon:
            try:
                self._icon.notify(message, title)
            except Exception as e:
                logger.debug("Notification failed: %s", e)

    def _handle_toggle_recording(self, icon=None, item=None) -> None:
        if self._on_toggle_recording:
            self._on_toggle_recording()

    def _handle_open_settings(self, icon=None, item=None) -> None:
        webbrowser.open(self._settings_url)

    def _handle_open_history(self, icon=None, item=None) -> None:
        webbrowser.open(f"{self._settings_url}/history")

    def _handle_quit(self, icon=None, item=None) -> None:
        if self._on_quit:
            self._on_quit()
        self.stop()
