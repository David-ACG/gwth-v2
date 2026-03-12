"""Integration tests for the full application flow."""

import time
import pytest
import httpx

from localwhisper.config import Config, reset_config
from localwhisper.db.database import Database
from localwhisper.db.models import Transcription
from localwhisper.web.server import SettingsServer


@pytest.fixture(autouse=True)
def clean():
    reset_config()
    yield
    reset_config()


def test_config_to_transcriber():
    """Config values correctly configure the transcriber."""
    from localwhisper.core.transcriber import Transcriber

    config = Config()
    t = Transcriber(
        model_name=config.model.name,
        device=config.model.device,
        compute_type=config.model.compute_type,
    )
    assert t.model_name == "large-v3-turbo"
    assert t.device == "cuda"
    assert t.compute_type == "int8"


def test_config_to_recorder():
    """Config values correctly configure the recorder."""
    from localwhisper.core.audio_recorder import AudioRecorder

    config = Config()
    r = AudioRecorder(
        sample_rate=config.audio.sample_rate,
        channels=config.audio.channels,
    )
    assert r.sample_rate == 16000
    assert r.channels == 1


def test_settings_server_starts(tmp_path):
    """Settings server starts and responds to health check."""
    db = Database(str(tmp_path / "test.db"))
    server = SettingsServer(host="127.0.0.1", port=29876, db=db)
    server.start()
    time.sleep(1)

    try:
        r = httpx.get("http://127.0.0.1:29876/health", timeout=5.0)
        assert r.status_code == 200
        assert r.json()["status"] == "ok"
    finally:
        server.stop()
        db.close()


def test_database_roundtrip(tmp_path):
    """Full database CRUD cycle."""
    db = Database(str(tmp_path / "test.db"))
    tid = db.add_transcription(Transcription(
        text="integration test",
        duration_s=2.0,
        model="tiny",
        language="en",
    ))
    assert tid > 0

    entries = db.get_transcriptions()
    assert len(entries) == 1
    assert entries[0].text == "integration test"

    db.delete_transcription(tid)
    assert db.get_transcription_count() == 0
    db.close()


def test_pipeline_state_transitions():
    """Pipeline state machine transitions correctly."""
    from unittest.mock import MagicMock
    import numpy as np
    from localwhisper.core.pipeline import Pipeline, PipelineState
    from localwhisper.core.audio_recorder import AudioRecorder
    from localwhisper.core.transcriber import Transcriber, TranscriptionResult

    rec = MagicMock(spec=AudioRecorder)
    rec.stop.return_value = np.random.randn(16000).astype(np.float32)
    trans = MagicMock(spec=Transcriber)
    trans.transcribe.return_value = TranscriptionResult(
        text="test", language="en", language_probability=0.9,
        duration_s=1.0, segments=[],
    )

    states = []
    pipeline = Pipeline(rec, trans, on_state_change=lambda s: states.append(s))
    pipeline.start_worker()
    assert pipeline.state == PipelineState.IDLE

    pipeline.start_recording()
    assert pipeline.state == PipelineState.RECORDING

    pipeline.stop_recording()
    time.sleep(1)
    pipeline.stop_worker()

    assert PipelineState.PROCESSING in states
    assert pipeline.state == PipelineState.IDLE


def test_text_injector_clipboard_roundtrip():
    """Injector preserves clipboard content."""
    import pyperclip
    from localwhisper.core.text_injector import TextInjector

    original = "PRESERVE_ME"
    pyperclip.copy(original)

    injector = TextInjector(restore_clipboard=True, paste_delay_ms=10)
    injector.inject("injected text")

    time.sleep(0.5)
    assert pyperclip.paste() == original
