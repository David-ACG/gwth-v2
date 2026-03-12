"""Tests for configuration management."""

import os
from pathlib import Path
from unittest import mock

import pytest

from localwhisper.config import Config, get_config, reset_config


@pytest.fixture(autouse=True)
def clean_config():
    """Reset singleton before each test."""
    reset_config()
    yield
    reset_config()


def test_default_config_loads(tmp_path):
    """Default TOML loads with all required keys."""
    # Use nonexistent user path so only default.toml is loaded
    config = Config(user_path=tmp_path / "nonexistent.toml")
    assert config.model.name == "iic/SenseVoiceSmall"
    assert config.model.compute_type == "int8"
    assert config.model.device == "cpu"
    assert config.audio.sample_rate == 16000
    assert config.audio.channels == 1
    assert config.hotkey.push_to_talk == "ctrl+shift+space"
    assert config.hotkey.mode == "push_to_talk"
    assert config.vad.enabled is True
    assert config.server.port == 9876
    assert config.server.host == "127.0.0.1"


def test_config_override(tmp_path):
    """User TOML overrides defaults."""
    user_toml = tmp_path / "user.toml"
    user_toml.write_text('[model]\nname = "small"\n')

    config = Config(user_path=user_toml)
    assert config.model.name == "small"
    # Other defaults preserved
    assert config.model.device == "cpu"
    assert config.audio.sample_rate == 16000


def test_env_var_override():
    """Environment variables override TOML."""
    with mock.patch.dict(os.environ, {"LOCALWHISPER_MODEL": "tiny"}):
        config = Config()
        assert config.model.name == "tiny"


def test_env_var_port_cast():
    """Port env var is cast to int."""
    with mock.patch.dict(os.environ, {"LOCALWHISPER_PORT": "8080"}):
        config = Config()
        assert config.server.port == 8080
        assert isinstance(config.server.port, int)


def test_config_singleton():
    """Config returns same instance."""
    c1 = get_config()
    c2 = get_config()
    assert c1 is c2


def test_config_get_dotted(tmp_path):
    """Can access nested values with dotted key."""
    config = Config(user_path=tmp_path / "nonexistent.toml")
    assert config.get("model.name") == "iic/SenseVoiceSmall"
    assert config.get("nonexistent.key", "default") == "default"
