"""Tests for STT engine abstraction and factory."""

import pytest

from localwhisper.core.engine import (
    DEFAULT_ENGINE,
    ENGINE_MODELS,
    STTEngine,
    create_engine,
    get_available_engines,
    get_engine_models,
)
from localwhisper.core.transcriber import Transcriber


def test_default_engine_is_faster_whisper():
    assert DEFAULT_ENGINE == "faster-whisper"


def test_get_available_engines():
    engines = get_available_engines()
    assert "faster-whisper" in engines
    assert "sensevoice" in engines


def test_get_engine_models_faster_whisper():
    models = get_engine_models("faster-whisper")
    assert "tiny" in models
    assert "large-v3-turbo" in models


def test_get_engine_models_sensevoice():
    models = get_engine_models("sensevoice")
    assert "iic/SenseVoiceSmall" in models


def test_get_engine_models_unknown():
    assert get_engine_models("nonexistent") == []


def test_factory_creates_faster_whisper():
    engine = create_engine(
        "faster-whisper",
        model_name="tiny",
        device="cpu",
        compute_type="int8",
    )
    assert isinstance(engine, Transcriber)
    assert engine.model_name == "tiny"


def test_factory_creates_sensevoice():
    from localwhisper.core.sensevoice import SenseVoiceTranscriber

    engine = create_engine(
        "sensevoice",
        model_name="iic/SenseVoiceSmall",
        device="cpu",
    )
    assert isinstance(engine, SenseVoiceTranscriber)
    assert engine.model_name == "iic/SenseVoiceSmall"


def test_factory_unknown_engine_raises():
    with pytest.raises(ValueError, match="Unknown engine 'banana'"):
        create_engine("banana")


def test_transcriber_satisfies_protocol():
    """Transcriber is a structural subtype of STTEngine."""
    t = Transcriber(model_name="tiny", device="cpu", compute_type="int8")
    assert isinstance(t, STTEngine)


def test_sensevoice_satisfies_protocol():
    """SenseVoiceTranscriber is a structural subtype of STTEngine."""
    from localwhisper.core.sensevoice import SenseVoiceTranscriber

    s = SenseVoiceTranscriber(model_name="iic/SenseVoiceSmall", device="cpu")
    assert isinstance(s, STTEngine)


def test_engine_models_dict_has_all_engines():
    for engine in get_available_engines():
        assert engine in ENGINE_MODELS
        assert len(ENGINE_MODELS[engine]) > 0
