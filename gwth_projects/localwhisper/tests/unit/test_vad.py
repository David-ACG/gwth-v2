"""Tests for Voice Activity Detection wrapper."""

import numpy as np
import pytest

from localwhisper.core.vad import VoiceActivityDetector


def _make_silence(duration_s: float = 2.0, sample_rate: int = 16000) -> np.ndarray:
    """Generate silent audio."""
    return np.zeros(int(duration_s * sample_rate), dtype=np.float32)


def _make_noise(duration_s: float = 2.0, sample_rate: int = 16000, amplitude: float = 0.5) -> np.ndarray:
    """Generate random noise (may or may not trigger VAD)."""
    rng = np.random.default_rng(42)
    return (rng.random(int(duration_s * sample_rate)) * 2 - 1).astype(np.float32) * amplitude


def test_vad_init():
    """VAD initializes with correct defaults."""
    vad = VoiceActivityDetector()
    assert vad.threshold == 0.5
    assert vad.sample_rate == 16000


def test_vad_detects_silence():
    """VAD correctly identifies silent audio as having no speech."""
    vad = VoiceActivityDetector()
    audio = _make_silence(2.0)
    segments = vad.get_speech_segments(audio)
    assert len(segments) == 0


def test_vad_empty_audio():
    """VAD handles empty audio gracefully."""
    vad = VoiceActivityDetector()
    segments = vad.get_speech_segments(np.array([], dtype=np.float32))
    assert segments == []


def test_vad_has_speech_silence():
    """has_speech returns False for silence."""
    vad = VoiceActivityDetector()
    assert vad.has_speech(_make_silence(1.0)) is False


def test_vad_configurable_threshold():
    """Different thresholds can be set."""
    vad_low = VoiceActivityDetector(threshold=0.1)
    vad_high = VoiceActivityDetector(threshold=0.9)
    assert vad_low.threshold == 0.1
    assert vad_high.threshold == 0.9


def test_vad_trim_silence_empty():
    """trim_silence returns original audio if no speech detected."""
    vad = VoiceActivityDetector()
    audio = _make_silence(1.0)
    trimmed = vad.trim_silence(audio)
    # Should return original since no speech found
    assert len(trimmed) == len(audio)


def test_vad_segments_have_timestamps():
    """Speech segments have start and end keys."""
    vad = VoiceActivityDetector()
    # Use noise which might trigger VAD
    audio = _make_noise(2.0, amplitude=0.8)
    segments = vad.get_speech_segments(audio)
    for seg in segments:
        assert "start" in seg
        assert "end" in seg
        assert seg["end"] > seg["start"]
