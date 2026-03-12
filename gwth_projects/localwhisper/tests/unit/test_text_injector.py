"""Tests for text injection system."""

import pytest
import pyperclip

from localwhisper.core.text_injector import (
    TextInjector,
    get_active_window_class,
    get_active_window_title,
    is_terminal,
)


def test_set_clipboard_text():
    """Can set clipboard to a string."""
    pyperclip.copy("test_clipboard_value")
    assert pyperclip.paste() == "test_clipboard_value"


def test_get_clipboard_text():
    """Can read clipboard contents back."""
    pyperclip.copy("read_back_test")
    result = pyperclip.paste()
    assert result == "read_back_test"


def test_unicode_clipboard():
    """Unicode characters survive clipboard round-trip."""
    text = "Hello caf\u00e9 \u00fc\u00f6\u00e4 \u2603"
    pyperclip.copy(text)
    assert pyperclip.paste() == text


def test_multiline_clipboard():
    """Multi-line text is preserved in clipboard."""
    text = "Line 1\nLine 2\nLine 3"
    pyperclip.copy(text)
    assert pyperclip.paste() == text


def test_save_and_restore_clipboard():
    """Clipboard is restored after injection."""
    original = "ORIGINAL_CLIPBOARD_CONTENT"
    pyperclip.copy(original)

    injector = TextInjector(restore_clipboard=True, paste_delay_ms=10)
    # Inject will paste into current window (the terminal running tests)
    # We just verify the clipboard is restored
    injector.inject("injected text")

    # Give time for restore
    import time
    time.sleep(0.3)

    restored = pyperclip.paste()
    assert restored == original


def test_inject_empty_returns_false():
    """Injecting empty text returns False."""
    injector = TextInjector()
    assert injector.inject("") is False
    assert injector.inject("   ") is False


def test_inject_returns_true_for_text():
    """Injecting valid text returns True."""
    injector = TextInjector(paste_delay_ms=10)
    assert injector.inject("hello world") is True


def test_terminal_detection():
    """Known terminal class names are correctly identified."""
    assert is_terminal("ConsoleWindowClass") is True
    assert is_terminal("CASCADIA_HOSTING_WINDOW_CLASS") is True
    assert is_terminal("WarpTerminal") is True
    assert is_terminal("mintty") is True


def test_regular_app_detection():
    """Non-terminal apps are not identified as terminals."""
    assert is_terminal("Chrome_WidgetWin_1") is False
    assert is_terminal("Notepad") is False
    assert is_terminal("MozillaWindowClass") is False
    assert is_terminal("") is False


def test_extra_terminal_classes():
    """Extra terminal classes can be provided."""
    assert is_terminal("MyCustomTerminal") is False
    assert is_terminal("MyCustomTerminal", frozenset({"MyCustomTerminal"})) is True


def test_get_active_window_class():
    """Can get active window class name (returns a string)."""
    cls = get_active_window_class()
    assert isinstance(cls, str)
    assert len(cls) > 0  # Should be something


def test_get_active_window_title():
    """Can get active window title (returns a string)."""
    title = get_active_window_title()
    assert isinstance(title, str)
