"""Tests for first-run model download manager."""

import sys
from pathlib import Path
from unittest.mock import patch, MagicMock

import pytest

from localwhisper.core.model_manager import (
    is_model_available,
    ensure_model_ready,
    _MODEL_SIZES,
)


def test_model_not_available_empty_dir(tmp_path):
    """Model is not available when directory is empty."""
    assert not is_model_available("iic/SenseVoiceSmall", "sensevoice", str(tmp_path))


def test_model_not_available_faster_whisper(tmp_path):
    """faster-whisper model not available without model.bin."""
    model_dir = tmp_path / "small"
    model_dir.mkdir()
    assert not is_model_available("small", "faster-whisper", str(tmp_path))


def test_model_available_faster_whisper(tmp_path):
    """faster-whisper model detected when model.bin exists."""
    model_dir = tmp_path / "small"
    model_dir.mkdir()
    (model_dir / "model.bin").write_bytes(b"fake")
    assert is_model_available("small", "faster-whisper", str(tmp_path))


def test_model_available_sensevoice_bin_files(tmp_path):
    """SenseVoice model detected when .bin files exist in subdir."""
    sub = tmp_path / "some_model"
    sub.mkdir()
    (sub / "model.bin").write_bytes(b"fake")
    assert is_model_available("iic/SenseVoiceSmall", "sensevoice", str(tmp_path))


def test_model_available_sensevoice_onnx(tmp_path):
    """SenseVoice model detected when .onnx files exist."""
    sub = tmp_path / "models"
    sub.mkdir()
    (sub / "model.onnx").write_bytes(b"fake")
    assert is_model_available("iic/SenseVoiceSmall", "sensevoice", str(tmp_path))


def test_model_available_hub_pattern(tmp_path):
    """SenseVoice model detected in huggingface hub cache pattern."""
    hub_dir = tmp_path / "hub" / "models--iic--SenseVoiceSmall"
    hub_dir.mkdir(parents=True)
    (hub_dir / "snapshot").write_bytes(b"fake")
    assert is_model_available("iic/SenseVoiceSmall", "sensevoice", str(tmp_path))


def test_ensure_model_ready_already_available(tmp_path):
    """No download triggered when model already exists."""
    model_dir = tmp_path / "small"
    model_dir.mkdir()
    (model_dir / "model.bin").write_bytes(b"fake")

    # Should not raise or attempt download
    ensure_model_ready("small", "faster-whisper", str(tmp_path))


def test_ensure_model_ready_creates_dir(tmp_path):
    """Model directory is created if it doesn't exist."""
    download_dir = tmp_path / "new_models"
    ensure_model_ready("small", "faster-whisper", str(download_dir))
    assert download_dir.exists()


def test_model_sizes_dict():
    """Known model sizes are defined."""
    assert "iic/SenseVoiceSmall" in _MODEL_SIZES
    assert "large-v3-turbo" in _MODEL_SIZES
    assert "tiny" in _MODEL_SIZES


def test_unknown_engine_returns_false(tmp_path):
    """Unknown engine always returns model not available."""
    assert not is_model_available("model", "unknown_engine", str(tmp_path))
