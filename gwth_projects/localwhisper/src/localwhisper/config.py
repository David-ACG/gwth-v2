"""Configuration management for LocalWhisper.

Loads config from TOML files with environment variable overrides.
Thread-safe singleton pattern.
"""

import os
import threading
import tomllib
from pathlib import Path
from typing import Any

from localwhisper.paths import get_app_dir, get_user_dir


_CONFIG_LOCK = threading.Lock()
_CONFIG_INSTANCE = None

DEFAULT_CONFIG_PATH = get_app_dir() / "config" / "default.toml"
USER_CONFIG_PATH = get_user_dir() / "config" / "localwhisper.toml"
ENV_PREFIX = "LOCALWHISPER_"


class _ConfigSection:
    """Attribute-access wrapper over a dict."""

    def __init__(self, data: dict):
        self._data = data

    def __getattr__(self, name: str) -> Any:
        try:
            value = self._data[name]
        except KeyError:
            raise AttributeError(f"No config key: {name}")
        if isinstance(value, dict):
            return _ConfigSection(value)
        return value

    def __getitem__(self, name: str) -> Any:
        return self._data[name]

    def __contains__(self, name: str) -> bool:
        return name in self._data

    def to_dict(self) -> dict:
        return dict(self._data)


class Config(_ConfigSection):
    """Application configuration loaded from TOML with env overrides."""

    def __init__(self, config_path: Path | None = None, user_path: Path | None = None):
        default_path = config_path or DEFAULT_CONFIG_PATH
        with open(default_path, "rb") as f:
            data = tomllib.load(f)

        # Overlay user config if exists
        u_path = user_path or USER_CONFIG_PATH
        if u_path.exists():
            with open(u_path, "rb") as f:
                user_data = tomllib.load(f)
            data = _deep_merge(data, user_data)

        # Apply environment variable overrides
        data = _apply_env_overrides(data)

        super().__init__(data)

    def get(self, dotted_key: str, default: Any = None) -> Any:
        """Get a value by dotted key path, e.g. 'model.name'."""
        keys = dotted_key.split(".")
        current = self._data
        for key in keys:
            if isinstance(current, dict) and key in current:
                current = current[key]
            else:
                return default
        return current


def get_config(**kwargs) -> Config:
    """Get or create the singleton Config instance."""
    global _CONFIG_INSTANCE
    with _CONFIG_LOCK:
        if _CONFIG_INSTANCE is None:
            _CONFIG_INSTANCE = Config(**kwargs)
        return _CONFIG_INSTANCE


def reset_config():
    """Reset the singleton (for testing)."""
    global _CONFIG_INSTANCE
    with _CONFIG_LOCK:
        _CONFIG_INSTANCE = None


def _deep_merge(base: dict, override: dict) -> dict:
    """Recursively merge override into base."""
    merged = dict(base)
    for key, value in override.items():
        if key in merged and isinstance(merged[key], dict) and isinstance(value, dict):
            merged[key] = _deep_merge(merged[key], value)
        else:
            merged[key] = value
    return merged


def _apply_env_overrides(data: dict) -> dict:
    """Apply LOCALWHISPER_* environment variables as overrides.

    E.g. LOCALWHISPER_MODEL=small -> data["model"]["name"] = "small"
    E.g. LOCALWHISPER_DEVICE=cpu -> data["model"]["device"] = "cpu"
    E.g. LOCALWHISPER_PORT=8080 -> data["server"]["port"] = 8080
    """
    env_map = {
        "ENGINE": ("model", "engine"),
        "MODEL": ("model", "name"),
        "DEVICE": ("model", "device"),
        "COMPUTE_TYPE": ("model", "compute_type"),
        "HOTKEY": ("hotkey", "push_to_talk"),
        "PORT": ("server", "port"),
        "LANGUAGE": ("general", "language"),
    }

    for env_suffix, path in env_map.items():
        env_key = ENV_PREFIX + env_suffix
        value = os.environ.get(env_key)
        if value is not None:
            section, key = path
            # Try to cast to int if the existing value is int
            if isinstance(data.get(section, {}).get(key), int):
                try:
                    value = int(value)
                except ValueError:
                    pass
            if section not in data:
                data[section] = {}
            data[section][key] = value

    return data
