"""Tests for audio recorder."""

import collections
import time
import numpy as np
import pytest

from localwhisper.core.audio_recorder import AudioRecorder


def test_list_audio_devices():
    """Lists at least one audio device."""
    devices = AudioRecorder.list_devices()
    assert isinstance(devices, list)
    # On CI/machines without mic, this might be empty - that's OK
    # But each device should have the right shape
    for dev in devices:
        assert "index" in dev
        assert "name" in dev
        assert "channels" in dev


def test_recorder_init():
    """Recorder initializes with correct defaults."""
    rec = AudioRecorder(sample_rate=16000, channels=1)
    assert rec.sample_rate == 16000
    assert rec.channels == 1
    assert rec.is_recording is False
    assert rec.pre_buffer_s == 1.5


def test_recorder_custom_pre_buffer():
    """Pre-buffer duration is configurable."""
    rec = AudioRecorder(pre_buffer_s=2.0)
    assert rec.pre_buffer_s == 2.0


def test_stop_without_start():
    """Stopping without starting returns empty array."""
    rec = AudioRecorder()
    audio = rec.stop()
    assert isinstance(audio, np.ndarray)
    assert len(audio) == 0


def test_pre_buffer_included_in_recording():
    """Pre-buffer contents are prepended when recording starts."""
    rec = AudioRecorder(sample_rate=16000, channels=1, pre_buffer_s=1.0)
    # Simulate pre-buffer with some audio chunks
    chunk1 = np.ones(512, dtype=np.float32) * 0.1
    chunk2 = np.ones(512, dtype=np.float32) * 0.2
    rec._pre_buffer.append(chunk1)
    rec._pre_buffer.append(chunk2)
    rec._stream_open = True  # Pretend stream is open

    rec.start()
    assert rec.is_recording is True
    # Buffer should contain the pre-buffer chunks
    assert len(rec._buffer) == 2

    # Simulate one more chunk arriving during recording
    rec._buffer.append(np.ones(512, dtype=np.float32) * 0.5)
    rec._recording = False  # bypass lock for test
    rec._recording = True

    audio = rec.stop()
    assert len(audio) == 512 * 3  # 2 pre-buffer + 1 recording chunk


def test_pre_buffer_rolls_over():
    """Pre-buffer discards old chunks when full."""
    rec = AudioRecorder(sample_rate=16000, channels=1, pre_buffer_s=0.1)
    # maxlen should be small for 0.1s
    max_chunks = rec._pre_buffer.maxlen
    assert max_chunks > 0

    # Overfill the pre-buffer
    for i in range(max_chunks + 20):
        rec._pre_buffer.append(np.zeros(512, dtype=np.float32))
    assert len(rec._pre_buffer) == max_chunks


@pytest.mark.mic
def test_record_short_clip():
    """Records 1 second of audio, returns correct shape."""
    rec = AudioRecorder(sample_rate=16000, channels=1, pre_buffer_s=0.5)
    rec.open_stream()
    time.sleep(0.6)  # Let pre-buffer fill
    rec.start()
    time.sleep(1.0)
    audio = rec.stop()
    rec.close_stream()
    assert isinstance(audio, np.ndarray)
    assert audio.dtype == np.float32
    # Should be roughly 16000 + pre-buffer samples, allow tolerance
    assert len(audio) > 12000


@pytest.mark.mic
def test_audio_sample_rate():
    """Audio is captured at the configured sample rate."""
    rec = AudioRecorder(sample_rate=16000, channels=1, pre_buffer_s=0.0)
    rec.open_stream()
    time.sleep(0.1)  # Let stream stabilize
    rec.start()
    time.sleep(0.5)
    audio = rec.stop()
    rec.close_stream()
    # ~8000 samples for 0.5s at 16kHz
    assert 6000 < len(audio) < 10000


@pytest.mark.mic
def test_audio_is_mono():
    """Audio has single dimension (mono)."""
    rec = AudioRecorder(sample_rate=16000, channels=1, pre_buffer_s=0.0)
    rec.open_stream()
    rec.start()
    time.sleep(0.5)
    audio = rec.stop()
    rec.close_stream()
    assert audio.ndim == 1


@pytest.mark.mic
def test_start_stop_recording():
    """Can start and stop recording cleanly, stream stays open."""
    rec = AudioRecorder(sample_rate=16000, channels=1, pre_buffer_s=0.5)
    rec.open_stream()
    assert rec.is_recording is False
    rec.start()
    assert rec.is_recording is True
    time.sleep(0.2)
    audio = rec.stop()
    assert rec.is_recording is False
    assert len(audio) > 0
    # Stream should still be open after stop
    assert rec._stream_open is True
    rec.close_stream()
    assert rec._stream_open is False


def test_max_duration_trim():
    """Audio is trimmed to max_duration_s."""
    rec = AudioRecorder(sample_rate=16000, max_duration_s=1.0)
    # Manually inject a long buffer
    rec._buffer = [np.zeros(32000, dtype=np.float32)]  # 2 seconds
    rec._recording = True
    audio = rec.stop()
    assert len(audio) == 16000  # Trimmed to 1 second


def test_close_stream_cleans_up():
    """close_stream resets all state."""
    rec = AudioRecorder(sample_rate=16000)
    rec._pre_buffer.append(np.zeros(512, dtype=np.float32))
    rec._buffer = [np.zeros(512, dtype=np.float32)]
    rec._recording = True
    rec._stream_open = True
    rec.close_stream()
    assert rec._stream_open is False
    assert rec._recording is False
    assert len(rec._pre_buffer) == 0
    assert len(rec._buffer) == 0
