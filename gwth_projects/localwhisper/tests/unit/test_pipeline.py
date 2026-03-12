"""Tests for pipeline orchestrator."""

import time
from unittest.mock import MagicMock, patch

import numpy as np
import pytest

from localwhisper.core.pipeline import Pipeline, PipelineState
from localwhisper.core.audio_recorder import AudioRecorder
from localwhisper.core.transcriber import Transcriber, TranscriptionResult


@pytest.fixture
def mock_recorder():
    """Mock audio recorder."""
    rec = MagicMock(spec=AudioRecorder)
    rec.is_recording = False
    rec.stop.return_value = np.random.randn(16000).astype(np.float32)
    return rec


@pytest.fixture
def mock_transcriber():
    """Mock transcriber."""
    trans = MagicMock(spec=Transcriber)
    trans.is_loaded = True
    trans.transcribe.return_value = TranscriptionResult(
        text="hello world",
        language="en",
        language_probability=0.99,
        duration_s=1.0,
        segments=[],
    )
    return trans


def test_pipeline_initial_state(mock_recorder, mock_transcriber):
    """Pipeline starts in IDLE state."""
    pipeline = Pipeline(mock_recorder, mock_transcriber)
    assert pipeline.state == PipelineState.IDLE


def test_pipeline_state_machine(mock_recorder, mock_transcriber):
    """Pipeline transitions through correct states."""
    states = []

    def on_state(s):
        states.append(s)

    pipeline = Pipeline(mock_recorder, mock_transcriber, on_state_change=on_state)
    pipeline.start_worker()

    pipeline.start_recording()
    assert pipeline.state == PipelineState.RECORDING
    mock_recorder.start.assert_called_once()

    pipeline.stop_recording()
    # Should transition to PROCESSING
    assert PipelineState.PROCESSING in [pipeline.state] + states

    # Wait for worker to process
    time.sleep(0.5)

    pipeline.stop_worker()
    # Should be back to IDLE
    assert pipeline.state == PipelineState.IDLE


def test_pipeline_ignores_short_audio(mock_recorder, mock_transcriber):
    """Pipeline ignores very short audio (<0.1s)."""
    mock_recorder.stop.return_value = np.zeros(100, dtype=np.float32)  # Very short

    pipeline = Pipeline(mock_recorder, mock_transcriber)
    pipeline.start_recording()
    pipeline.stop_recording()

    # Should go back to IDLE without transcribing
    assert pipeline.state == PipelineState.IDLE
    mock_transcriber.transcribe.assert_not_called()


def test_pipeline_fires_transcription_callback(mock_recorder, mock_transcriber):
    """on_transcription callback fires with result."""
    results = []

    pipeline = Pipeline(
        mock_recorder,
        mock_transcriber,
        on_transcription=lambda r: results.append(r),
    )
    pipeline.start_worker()
    pipeline.start_recording()
    pipeline.stop_recording()

    time.sleep(0.5)
    pipeline.stop_worker()

    assert len(results) == 1
    assert results[0].text == "hello world"


def test_pipeline_cannot_record_while_processing(mock_recorder, mock_transcriber):
    """Cannot start a new recording while processing."""
    pipeline = Pipeline(mock_recorder, mock_transcriber)
    pipeline.start_worker()
    pipeline.start_recording()
    pipeline.stop_recording()

    # Try to start again immediately (while processing)
    # Should be ignored
    pipeline.start_recording()
    time.sleep(0.5)
    pipeline.stop_worker()


def test_pipeline_error_handling(mock_recorder, mock_transcriber):
    """Pipeline recovers from transcription errors."""
    mock_transcriber.transcribe.side_effect = RuntimeError("Model error")
    errors = []

    pipeline = Pipeline(
        mock_recorder,
        mock_transcriber,
        on_error=lambda e: errors.append(e),
    )
    pipeline.start_worker()
    pipeline.start_recording()
    pipeline.stop_recording()

    time.sleep(0.5)
    pipeline.stop_worker()

    assert len(errors) == 1
    assert pipeline.state == PipelineState.IDLE  # Recovered to IDLE
