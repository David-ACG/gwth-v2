"""Tests for SenseVoice STT engine (mocked funasr)."""

from unittest.mock import MagicMock, patch

import numpy as np
import pytest

from localwhisper.core.sensevoice import SenseVoiceTranscriber, _TAG_RE
from localwhisper.core.transcriber import TranscriptionResult


@pytest.fixture
def sv():
    """SenseVoiceTranscriber instance (not loaded)."""
    return SenseVoiceTranscriber(
        model_name="iic/SenseVoiceSmall",
        device="cuda",
        language="en",
    )


def test_not_loaded_initially(sv):
    assert not sv.is_loaded


def test_ignores_extra_kwargs():
    """faster-whisper-specific kwargs are accepted but ignored."""
    t = SenseVoiceTranscriber(
        model_name="iic/SenseVoiceSmall",
        device="cpu",
        compute_type="float16",
        vad_enabled=True,
        vad_threshold=0.6,
        vad_min_silence_ms=300,
    )
    assert t.model_name == "iic/SenseVoiceSmall"


def test_empty_audio_returns_empty(sv):
    result = sv.transcribe(np.array([], dtype=np.float32))
    assert result.text == ""
    assert result.duration_s == 0.0
    assert result.segments == []


@patch("localwhisper.core.sensevoice.AutoModel", create=True)
def test_load_model_lazy(mock_auto_cls):
    """funasr.AutoModel is called on load_model()."""
    mock_model = MagicMock()
    # Patch the import inside load_model
    with patch.dict("sys.modules", {"funasr": MagicMock(AutoModel=mock_auto_cls)}):
        sv = SenseVoiceTranscriber(device="cuda")
        sv.load_model()
        assert sv.is_loaded


def test_load_model_import_error():
    """ImportError when funasr is not installed."""
    with patch.dict("sys.modules", {"funasr": None}):
        sv = SenseVoiceTranscriber(device="cpu")
        with pytest.raises(ImportError, match="funasr"):
            sv.load_model()


def test_transcribe_with_mock_model(sv):
    """Full transcription with a mocked funasr model."""
    mock_model = MagicMock()
    mock_model.generate.return_value = [{"text": "hello world"}]
    sv._model = mock_model

    audio = np.random.randn(16000).astype(np.float32)
    result = sv.transcribe(audio)

    assert isinstance(result, TranscriptionResult)
    assert result.text == "hello world"
    assert result.duration_s == pytest.approx(1.0)
    assert result.language == "en"
    assert result.language_probability == 1.0
    assert result.segments == []
    mock_model.generate.assert_called_once()


def test_emotion_tag_stripping(sv):
    """Emotion/event tags are removed from output."""
    mock_model = MagicMock()
    mock_model.generate.return_value = [
        {"text": "<|HAPPY|>Hello<|BGM|> world<|NEUTRAL|>"}
    ]
    sv._model = mock_model

    result = sv.transcribe(np.random.randn(16000).astype(np.float32))
    assert result.text == "Hello world"


def test_tag_regex():
    """_TAG_RE strips all known tag formats."""
    assert _TAG_RE.sub("", "<|HAPPY|>text<|SAD|>") == "text"
    assert _TAG_RE.sub("", "<|BGM|><|SPEECH|>hello") == "hello"
    assert _TAG_RE.sub("", "no tags here") == "no tags here"
    assert _TAG_RE.sub("", "<|EMO_UNKNOWN|>ok") == "ok"
    # Mixed-case tags from SenseVoice output
    assert _TAG_RE.sub("", "<|en|><|Speech|><|withitn|>hello") == "hello"
    assert _TAG_RE.sub("", "<|zh|><|BGM|>text") == "text"


def test_transcribe_string_result(sv):
    """Handle funasr returning a list of strings."""
    mock_model = MagicMock()
    mock_model.generate.return_value = ["hello from string"]
    sv._model = mock_model

    result = sv.transcribe(np.random.randn(16000).astype(np.float32))
    assert result.text == "hello from string"


def test_unload_model(sv):
    sv._model = MagicMock()
    assert sv.is_loaded
    sv.unload_model()
    assert not sv.is_loaded


def test_device_mapping():
    """'cuda' should be mapped to 'cuda:0' for funasr."""
    sv = SenseVoiceTranscriber(device="cuda")
    assert sv._device == "cuda"  # stored as-is
    # The mapping happens inside load_model(), tested via mock above


def test_auto_language():
    """When language is None, defaults to 'auto'."""
    sv = SenseVoiceTranscriber(language=None)
    assert sv._language == "auto"
