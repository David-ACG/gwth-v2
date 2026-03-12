"""Tests for the transcription engine."""

import numpy as np
import pytest

from localwhisper.core.transcriber import Transcriber, TranscriptionResult


@pytest.fixture(scope="module")
def transcriber():
    """Shared transcriber instance (loads model once for all tests)."""
    t = Transcriber(
        model_name="tiny",  # Use tiny for fast tests
        device="cuda",
        compute_type="int8",
        download_dir="./models",
        language="en",
        vad_enabled=True,
    )
    t.load_model()
    return t


def _make_silence(duration_s: float = 2.0, sample_rate: int = 16000) -> np.ndarray:
    """Generate silent audio."""
    return np.zeros(int(duration_s * sample_rate), dtype=np.float32)


def _make_tone(freq_hz: float = 440.0, duration_s: float = 2.0, sample_rate: int = 16000) -> np.ndarray:
    """Generate a sine wave tone (not speech, but non-silent)."""
    t = np.linspace(0, duration_s, int(duration_s * sample_rate), dtype=np.float32)
    return 0.5 * np.sin(2 * np.pi * freq_hz * t)


@pytest.mark.gpu
def test_model_loads(transcriber):
    """WhisperModel loads with int8 on CUDA."""
    assert transcriber.is_loaded


@pytest.mark.gpu
def test_transcribe_silence(transcriber):
    """Silent audio returns empty or near-empty text."""
    audio = _make_silence(2.0)
    result = transcriber.transcribe(audio)
    assert isinstance(result, TranscriptionResult)
    # Silent audio should produce very little text
    assert len(result.text) < 50


@pytest.mark.gpu
def test_transcribe_empty():
    """Empty audio returns empty result."""
    t = Transcriber(model_name="tiny", device="cuda", compute_type="int8")
    t.load_model()
    result = t.transcribe(np.array([], dtype=np.float32))
    assert result.text == ""
    assert result.duration_s == 0.0


@pytest.mark.gpu
def test_transcribe_returns_metadata(transcriber):
    """Transcription includes language and duration metadata."""
    audio = _make_tone(440, 1.0)
    result = transcriber.transcribe(audio)
    assert isinstance(result, TranscriptionResult)
    assert isinstance(result.language, str)
    assert isinstance(result.duration_s, float)
    assert result.duration_s > 0


@pytest.mark.gpu
def test_transcribe_returns_segments(transcriber):
    """Transcription returns segment list."""
    audio = _make_tone(440, 1.0)
    result = transcriber.transcribe(audio)
    assert isinstance(result.segments, list)


def test_transcriber_lazy_load():
    """Model is not loaded until first transcribe or explicit load."""
    t = Transcriber(model_name="tiny", device="cpu", compute_type="int8")
    assert not t.is_loaded
