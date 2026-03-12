"""STT engine abstraction — Protocol + factory.

Allows swapping between faster-whisper and SenseVoice (or future engines)
without changing the rest of the codebase.
"""

from __future__ import annotations

from typing import Protocol, runtime_checkable

import numpy as np

from localwhisper.core.transcriber import TranscriptionResult

DEFAULT_ENGINE = "faster-whisper"

ENGINE_MODELS: dict[str, list[str]] = {
    "faster-whisper": [
        "tiny",
        "base",
        "small",
        "medium",
        "large-v3",
        "large-v3-turbo",
    ],
    "sensevoice": [
        "iic/SenseVoiceSmall",
    ],
}


@runtime_checkable
class STTEngine(Protocol):
    """Protocol that all STT engines must satisfy."""

    model_name: str
    is_loaded: bool

    def load_model(self) -> None: ...
    def transcribe(self, audio: np.ndarray, sample_rate: int = 16000) -> TranscriptionResult: ...
    def unload_model(self) -> None: ...


def get_available_engines() -> list[str]:
    """Return list of supported engine names."""
    return list(ENGINE_MODELS.keys())


def get_engine_models(engine: str) -> list[str]:
    """Return model list for a given engine."""
    return ENGINE_MODELS.get(engine, [])


def create_engine(engine_name: str, **kwargs) -> STTEngine:
    """Factory: create the right STT engine based on name.

    Args:
        engine_name: "faster-whisper" or "sensevoice"
        **kwargs: Passed to the engine constructor (model_name, device, etc.)

    Returns:
        An object satisfying the STTEngine protocol.
    """
    if engine_name == "faster-whisper":
        from localwhisper.core.transcriber import Transcriber

        return Transcriber(**kwargs)

    if engine_name == "sensevoice":
        from localwhisper.core.sensevoice import SenseVoiceTranscriber

        return SenseVoiceTranscriber(**kwargs)

    raise ValueError(
        f"Unknown engine '{engine_name}'. "
        f"Available: {', '.join(get_available_engines())}"
    )
