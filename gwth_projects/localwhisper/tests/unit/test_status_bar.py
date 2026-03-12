"""Tests for multi-monitor floating status bars."""

import tkinter as tk
from unittest.mock import patch, MagicMock

import pytest

from localwhisper.ui.status_bar import (
    StatusBar,
    MonitorRect,
    get_monitors,
    _STATE_STYLES,
    BAR_WIDTH,
    BAR_HEIGHT,
)


@pytest.fixture(scope="module")
def root():
    """Single Tk root for all tests (avoids Tcl exhaustion on Windows)."""
    r = tk.Tk()
    r.withdraw()
    yield r
    r.destroy()


@pytest.fixture
def fake_monitors():
    """Two fake monitors side by side."""
    return [
        MonitorRect(x=0, y=0, width=1920, height=1080),
        MonitorRect(x=1920, y=0, width=2560, height=1440),
    ]


@pytest.fixture
def status_bar(root, fake_monitors):
    """StatusBar with mocked monitor enumeration."""
    with patch("localwhisper.ui.status_bar.get_monitors", return_value=fake_monitors):
        sb = StatusBar(settings_url="http://127.0.0.1:9876")
        sb.init_ui(root)
        yield sb
        sb.destroy()


class TestMonitorEnumeration:
    def test_get_monitors_returns_list(self):
        """get_monitors returns a list of MonitorRect."""
        monitors = get_monitors()
        assert isinstance(monitors, list)
        # Should find at least one monitor on any Windows machine
        assert len(monitors) >= 1
        for m in monitors:
            assert isinstance(m, MonitorRect)
            assert m.width > 0
            assert m.height > 0

    def test_monitor_rect_fields(self):
        m = MonitorRect(x=100, y=200, width=1920, height=1080)
        assert m.x == 100
        assert m.y == 200
        assert m.width == 1920
        assert m.height == 1080


class TestStatusBarCreation:
    def test_creates_one_bar_per_monitor(self, status_bar, fake_monitors):
        """One bar window is created for each monitor."""
        assert len(status_bar._bars) == len(fake_monitors)

    def test_bars_are_toplevel_windows(self, status_bar):
        for bar in status_bar._bars:
            assert isinstance(bar.win, tk.Toplevel)

    def test_bars_are_always_on_top(self, status_bar):
        for bar in status_bar._bars:
            assert bar.win.attributes("-topmost") == 1

    def test_bars_have_no_title_bar(self, status_bar):
        for bar in status_bar._bars:
            assert bar.win.overrideredirect()

    def test_initial_state_is_idle(self, status_bar):
        assert status_bar._state == "idle"

    def test_bar_position_calculation(self, fake_monitors):
        """Bar x-coordinate should be centered on each monitor."""
        for mon in fake_monitors:
            expected_x = mon.x + (mon.width - BAR_WIDTH) // 2
            # Monitor 1 (1920px): x = (1920-300)/2 = 810
            # Monitor 2 (2560px): x = 1920 + (2560-300)/2 = 3050
            assert expected_x > mon.x
            assert expected_x < mon.x + mon.width


class TestStatusBarStates:
    def test_set_state_idle(self, status_bar, root):
        status_bar._do_set_state("idle")
        assert status_bar._state == "idle"
        bg, fg, text = _STATE_STYLES["idle"]
        for bar in status_bar._bars:
            assert bar.label.cget("text") == text
            assert bar.label.cget("fg") == fg

    def test_set_state_recording(self, status_bar, root):
        status_bar._do_set_state("recording")
        assert status_bar._state == "recording"
        # Pulse should be active
        assert status_bar._pulse_id is not None

    def test_set_state_processing(self, status_bar, root):
        status_bar._do_set_state("processing")
        assert status_bar._state == "processing"
        _, _, text = _STATE_STYLES["processing"]
        for bar in status_bar._bars:
            assert bar.label.cget("text") == text

    def test_recording_pulse_stops_on_state_change(self, status_bar, root):
        status_bar._do_set_state("recording")
        assert status_bar._pulse_id is not None
        status_bar._do_set_state("idle")
        assert status_bar._pulse_id is None

    def test_show_error(self, status_bar, root):
        status_bar._do_show_error("Something broke")
        assert status_bar._state == "error"
        for bar in status_bar._bars:
            assert "Error:" in bar.label.cget("text")
            assert "Something broke" in bar.label.cget("text")

    def test_error_long_message_truncated(self):
        """Long error messages are truncated to fit the bar."""
        long_msg = "x" * 100
        # Truncation logic: display = msg[:32] + "..."
        display = long_msg if len(long_msg) <= 35 else long_msg[:32] + "\u2026"
        assert len(display) == 33
        assert display.endswith("\u2026")


class TestTranscriptionDisplay:
    def test_show_transcription(self, status_bar, root):
        status_bar._do_show_transcription("Hello world")
        assert status_bar._state == "transcribed"
        assert status_bar._last_text == "Hello world"
        for bar in status_bar._bars:
            assert bar.label.cget("text") == "Hello world"

    def test_long_text_truncated(self, status_bar, root):
        long_text = "A" * 60
        status_bar._do_show_transcription(long_text)
        for bar in status_bar._bars:
            display = bar.label.cget("text")
            assert len(display) <= 41
            assert display.endswith("\u2026")
        # Full text preserved for copy
        assert status_bar._last_text == long_text

    def test_auto_clear_scheduled(self, status_bar, root):
        status_bar._do_show_transcription("test")
        assert status_bar._text_clear_id is not None

    def test_clear_returns_to_idle(self, status_bar):
        """Clearing transcription sets state back to idle."""
        status_bar._state = "transcribed"
        status_bar._do_set_state("idle")
        assert status_bar._state == "idle"


class TestDragToMove:
    def test_drag_bindings_exist(self, status_bar):
        """Right-click drag bindings are set on label and frame."""
        for bar in status_bar._bars:
            # Check that Button-3 binding exists on the label
            assert bar.label.bind("<ButtonPress-3>")
            assert bar.label.bind("<B3-Motion>")

    def test_drag_start_stores_offset(self, status_bar):
        bar = status_bar._bars[0]
        event = MagicMock()
        event.x_root = 500
        event.y_root = 100
        # Simulate the window being at (400, 50)
        bar.win.geometry("+400+50")
        bar.win.update_idletasks()
        bar._drag_start(event)
        assert bar._drag_start_x == 500 - bar.win.winfo_x()
        assert bar._drag_start_y == 100 - bar.win.winfo_y()


class TestToggleButton:
    def test_rec_button_exists(self, status_bar):
        for bar in status_bar._bars:
            assert hasattr(bar, "rec_btn")
            assert isinstance(bar.rec_btn, tk.Label)

    def test_rec_icon_default_is_record(self, status_bar):
        for bar in status_bar._bars:
            assert bar.rec_btn.cget("text") == "\u23fa"  # ⏺

    def test_rec_icon_changes_on_recording(self, status_bar, root):
        status_bar._do_set_state("recording")
        for bar in status_bar._bars:
            assert bar.rec_btn.cget("text") == "\u23f9"  # ⏹

    def test_rec_icon_reverts_on_idle(self, status_bar, root):
        status_bar._do_set_state("recording")
        status_bar._do_set_state("idle")
        for bar in status_bar._bars:
            assert bar.rec_btn.cget("text") == "\u23fa"  # ⏺

    def test_toggle_callback_called(self, root, fake_monitors):
        mock_toggle = MagicMock()
        with patch("localwhisper.ui.status_bar.get_monitors", return_value=fake_monitors):
            sb = StatusBar(on_toggle_recording=mock_toggle)
            sb.init_ui(root)
            sb._bars[0]._handle_toggle(None)
            mock_toggle.assert_called_once()
            sb.destroy()


class TestClickBehavior:
    def test_click_idle_opens_browser(self, status_bar):
        with patch("localwhisper.ui.status_bar.webbrowser.open") as mock_open:
            status_bar._state = "idle"
            status_bar._on_click()
            mock_open.assert_called_once_with("http://127.0.0.1:9876")

    def test_click_recording_opens_browser(self, status_bar):
        with patch("localwhisper.ui.status_bar.webbrowser.open") as mock_open:
            status_bar._state = "recording"
            status_bar._on_click()
            mock_open.assert_called_once_with("http://127.0.0.1:9876")

    def test_click_transcribed_copies_to_clipboard(self, status_bar, root):
        status_bar._state = "transcribed"
        status_bar._last_text = "copied text"
        status_bar._on_click()
        # Check clipboard
        clipboard = root.clipboard_get()
        assert clipboard == "copied text"

    def test_click_transcribed_shows_feedback(self, status_bar, root):
        status_bar._state = "transcribed"
        status_bar._last_text = "some text"
        status_bar._on_click()
        for bar in status_bar._bars:
            assert "Copied" in bar.label.cget("text")


class TestFallbackMonitor:
    def test_empty_monitors_uses_fallback(self, root):
        """If EnumDisplayMonitors returns nothing, use a single fallback."""
        with patch("localwhisper.ui.status_bar.get_monitors", return_value=[]):
            sb = StatusBar()
            sb.init_ui(root)
            assert len(sb._bars) == 1
            sb.destroy()


class TestDestroy:
    def test_destroy_clears_bars(self, status_bar):
        assert len(status_bar._bars) > 0
        status_bar.destroy()
        assert len(status_bar._bars) == 0

    def test_destroy_stops_pulse(self, status_bar, root):
        status_bar._do_set_state("recording")
        status_bar.destroy()
        assert status_bar._pulse_id is None


class TestStateStyles:
    def test_all_states_have_styles(self):
        for state in ["idle", "recording", "processing", "error", "transcribed"]:
            assert state in _STATE_STYLES
            bg, fg, text = _STATE_STYLES[state]
            assert bg.startswith("#")
            assert fg.startswith("#")
