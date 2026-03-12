"""Frozen-aware path resolver for LocalWhisper.

When running as a PyInstaller bundle, read-only assets come from sys._MEIPASS
and writable user data goes to %APPDATA%/LocalWhisper.
In development, both resolve to the repo root.
"""

import os
import sys
from pathlib import Path


def get_app_dir() -> Path:
    """Bundled app directory (read-only assets, config defaults).

    - Frozen (PyInstaller): sys._MEIPASS
    - Development: repo root (two levels up from this file)
    """
    if getattr(sys, "frozen", False):
        return Path(sys._MEIPASS)
    return Path(__file__).parent.parent.parent  # src/localwhisper -> src -> repo root


def get_user_dir() -> Path:
    """Writable user data directory.

    - Frozen (PyInstaller): %APPDATA%/LocalWhisper
    - Development: repo root (current working directory)
    """
    if getattr(sys, "frozen", False):
        return Path(os.environ["APPDATA"]) / "LocalWhisper"
    return Path(".")  # repo root in dev
