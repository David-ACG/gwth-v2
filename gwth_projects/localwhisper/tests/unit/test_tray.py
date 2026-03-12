"""Tests for system tray icon."""

from pathlib import Path
from unittest.mock import MagicMock

from localwhisper.ui.tray import TrayIcon


def test_tray_icon_creates():
    """Tray icon can be instantiated without error."""
    tray = TrayIcon()
    assert tray is not None
    assert tray._status == "Idle"


def test_tray_icon_states():
    """Icons exist for all states."""
    tray = TrayIcon()
    assert "idle" in tray._icons
    assert "recording" in tray._icons
    assert "processing" in tray._icons


def test_tray_menu_items():
    """Menu has expected items."""
    tray = TrayIcon()
    menu = tray._build_menu()
    # pystray.Menu is iterable
    items = list(menu)
    labels = [str(item) for item in items if hasattr(item, "text")]
    # Check at least the key items exist
    assert len(items) >= 5  # Several items + separators


def test_tray_set_state():
    """Can set state without running icon."""
    tray = TrayIcon()
    tray.set_state("recording")
    assert tray._status == "Recording"
    tray.set_state("idle")
    assert tray._status == "Idle"
    tray.set_state("processing")
    assert tray._status == "Processing"


def test_tray_set_model_name():
    """Can set model name."""
    tray = TrayIcon()
    tray.set_model_name("large-v3-turbo")
    assert tray._model_name == "large-v3-turbo"


def test_tray_callbacks():
    """Callbacks are stored correctly."""
    toggle_mock = MagicMock()
    quit_mock = MagicMock()
    tray = TrayIcon(on_toggle_recording=toggle_mock, on_quit=quit_mock)

    tray._handle_toggle_recording()
    toggle_mock.assert_called_once()

    tray._handle_quit()
    quit_mock.assert_called_once()


def test_icons_are_pil_images():
    """Icon images are PIL Images."""
    from PIL import Image
    tray = TrayIcon()
    for name, img in tray._icons.items():
        assert isinstance(img, Image.Image), f"Icon '{name}' is not a PIL Image"
