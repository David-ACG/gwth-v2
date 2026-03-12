"""Tests for frozen-aware path resolver."""

import sys
from pathlib import Path
from unittest.mock import patch

from localwhisper.paths import get_app_dir, get_user_dir


def test_get_app_dir_dev():
    """In dev mode, app dir is the repo root."""
    # Ensure not frozen
    assert not getattr(sys, "frozen", False)
    app_dir = get_app_dir()
    # Should be 3 levels up from paths.py: src/localwhisper/paths.py -> repo root
    assert (app_dir / "src" / "localwhisper").is_dir()
    assert (app_dir / "config" / "default.toml").is_file()


def test_get_user_dir_dev():
    """In dev mode, user dir is cwd (repo root)."""
    assert not getattr(sys, "frozen", False)
    user_dir = get_user_dir()
    assert user_dir == Path(".")


def test_get_app_dir_frozen(tmp_path):
    """When frozen, app dir is sys._MEIPASS."""
    with patch.object(sys, "frozen", True, create=True), \
         patch.object(sys, "_MEIPASS", str(tmp_path), create=True):
        assert get_app_dir() == tmp_path


def test_get_user_dir_frozen(tmp_path):
    """When frozen, user dir is %APPDATA%/LocalWhisper."""
    with patch.object(sys, "frozen", True, create=True), \
         patch.dict("os.environ", {"APPDATA": str(tmp_path)}):
        result = get_user_dir()
        assert result == tmp_path / "LocalWhisper"


def test_app_dir_contains_assets():
    """Dev app dir should contain the assets folder."""
    app_dir = get_app_dir()
    assert (app_dir / "assets").is_dir()


def test_app_dir_contains_config():
    """Dev app dir should contain config/default.toml."""
    app_dir = get_app_dir()
    assert (app_dir / "config" / "default.toml").is_file()
