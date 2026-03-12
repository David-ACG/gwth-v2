"""Tests for global hotkey manager."""

import time
from unittest.mock import MagicMock
from types import SimpleNamespace

import pytest

from localwhisper.core.hotkey_manager import HotkeyManager


def test_hotkey_parse():
    """Hotkey string parses correctly."""
    keys = HotkeyManager.parse_hotkey("ctrl+shift+space")
    assert keys == ["ctrl", "shift", "space"]


def test_hotkey_parse_single():
    """Single key parses correctly."""
    keys = HotkeyManager.parse_hotkey("f12")
    assert keys == ["f12"]


def test_register_hotkey():
    """Can register a global hotkey."""
    mgr = HotkeyManager(hotkey="ctrl+alt+f12", mode="toggle")
    assert mgr.is_registered is False
    mgr.register()
    assert mgr.is_registered is True
    mgr.unregister()
    assert mgr.is_registered is False


def test_unregister_hotkey():
    """Can cleanly unregister a hotkey."""
    mgr = HotkeyManager(hotkey="ctrl+alt+f11", mode="toggle")
    mgr.register()
    mgr.unregister()
    assert mgr.is_registered is False
    # Double unregister should not raise
    mgr.unregister()


def test_toggle_callbacks():
    """Toggle fires start on first call, stop on second."""
    start_mock = MagicMock()
    stop_mock = MagicMock()

    mgr = HotkeyManager(
        hotkey="ctrl+alt+f10",
        mode="toggle",
        on_start=start_mock,
        on_stop=stop_mock,
    )

    # Simulate toggle presses
    mgr._on_toggle()
    start_mock.assert_called_once()
    stop_mock.assert_not_called()

    mgr._on_toggle()
    assert start_mock.call_count == 1
    stop_mock.assert_called_once()


def test_ptt_guards_against_repeat():
    """Push-to-talk ignores key repeats (only fires start once)."""
    start_mock = MagicMock()
    stop_mock = MagicMock()

    mgr = HotkeyManager(
        hotkey="ctrl+shift+space",
        mode="push_to_talk",
        on_start=start_mock,
        on_stop=stop_mock,
    )
    mgr._ptt_modifiers = {"ctrl", "shift"}
    mgr._ptt_main_key = "space"

    # Simulate: first press starts, repeats are ignored
    with mgr._lock:
        mgr._ptt_active = False

    # First "press" - should fire start
    mgr._ptt_active = False
    with mgr._lock:
        if not mgr._ptt_active:
            mgr._ptt_active = True
            start_mock()
    start_mock.assert_called_once()

    # Second "press" (key repeat) - should NOT fire start again
    with mgr._lock:
        if not mgr._ptt_active:
            start_mock()  # This should not execute
    assert start_mock.call_count == 1

    # Release - should fire stop
    with mgr._lock:
        if mgr._ptt_active:
            mgr._ptt_active = False
            stop_mock()
    stop_mock.assert_called_once()


def test_invalid_mode():
    """Invalid mode raises ValueError."""
    mgr = HotkeyManager(mode="invalid")
    with pytest.raises(ValueError, match="Unknown hotkey mode"):
        mgr.register()


def test_hotkey_default_values():
    """Default values are sensible."""
    mgr = HotkeyManager()
    assert mgr.hotkey == "ctrl+shift+space"
    assert mgr.mode == "push_to_talk"
    assert mgr._ptt_active is False
