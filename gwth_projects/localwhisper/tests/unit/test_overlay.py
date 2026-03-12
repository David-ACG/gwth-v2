"""Tests for recording overlay."""

import pytest
from localwhisper.ui.overlay import RecordingOverlay


def test_overlay_creates():
    """Overlay can be created."""
    overlay = RecordingOverlay()
    assert overlay is not None
    assert overlay.is_visible is False


def test_overlay_defaults():
    """Overlay has correct defaults."""
    overlay = RecordingOverlay()
    assert overlay.position == "top-center"
    assert overlay.opacity == 0.85


def test_overlay_custom_position():
    """Overlay accepts custom position."""
    overlay = RecordingOverlay(position="top-right")
    assert overlay.position == "top-right"


def test_overlay_custom_opacity():
    """Overlay accepts custom opacity."""
    overlay = RecordingOverlay(opacity=0.5)
    assert overlay.opacity == 0.5


def test_overlay_show_hide_without_root():
    """Show/hide without root doesn't crash."""
    overlay = RecordingOverlay()
    # These should be no-ops without a root
    overlay.show()
    overlay.hide()
    assert overlay.is_visible is False


def test_overlay_destroy_without_init():
    """Destroy without init doesn't crash."""
    overlay = RecordingOverlay()
    overlay.destroy()  # Should be safe
