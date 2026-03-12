"""Speech-to-text transcription using faster-whisper.

Wraps the WhisperModel for lazy loading, transcription, and metadata extraction.
"""

import logging
import threading
from dataclasses import dataclass
from pathlib import Path

import numpy as np
from faster_whisper import WhisperModel

from localwhisper.paths import get_user_dir

logger = logging.getLogger(__name__)


@dataclass
class TranscriptionResult:
    """Result of a transcription."""

    text: str
    language: str
    language_probability: float
    duration_s: float
    segments: list[dict]


class Transcriber:
    """Manages a faster-whisper model and transcribes audio."""

    def __init__(
        self,
        model_name: str = "large-v3-turbo",
        device: str = "cuda",
        compute_type: str = "int8",
        download_dir: str = "./models",
        language: str | None = "en",
        vad_enabled: bool = True,
        vad_threshold: float = 0.5,
        vad_min_silence_ms: int = 500,
    ):
        self.model_name = model_name
        self.device = device
        self.compute_type = compute_type
        # Resolve relative download dirs against user data dir
        dl_path = Path(download_dir)
        self.download_dir = str(dl_path if dl_path.is_absolute() else get_user_dir() / download_dir)
        self.language = language
        self.vad_enabled = vad_enabled
        self.vad_threshold = vad_threshold
        self.vad_min_silence_ms = vad_min_silence_ms

        self._model: WhisperModel | None = None
        self._lock = threading.Lock()

    @property
    def is_loaded(self) -> bool:
        return self._model is not None

    def load_model(self) -> None:
        """Load the Whisper model (downloads if needed)."""
        with self._lock:
            if self._model is not None:
                return
            logger.info(
                "Loading model %s (device=%s, compute=%s)...",
                self.model_name,
                self.device,
                self.compute_type,
            )
            self._model = WhisperModel(
                self.model_name,
                device=self.device,
                compute_type=self.compute_type,
                download_root=self.download_dir,
            )
            logger.info("Model loaded successfully.")

    def transcribe(
        self,
        audio: np.ndarray,
        sample_rate: int = 16000,
    ) -> TranscriptionResult:
        """Transcribe audio array to text.

        Args:
            audio: float32 numpy array of audio samples.
            sample_rate: Sample rate of the audio (default 16000).

        Returns:
            TranscriptionResult with text, language, and metadata.
        """
        if self._model is None:
            self.load_model()

        if len(audio) == 0:
            return TranscriptionResult(
                text="",
                language="",
                language_probability=0.0,
                duration_s=0.0,
                segments=[],
            )

        duration_s = len(audio) / sample_rate

        vad_params = None
        if self.vad_enabled:
            vad_params = {
                "threshold": self.vad_threshold,
                "min_silence_duration_ms": self.vad_min_silence_ms,
            }

        segments_gen, info = self._model.transcribe(
            audio,
            language=self.language,
            beam_size=5,
            vad_filter=self.vad_enabled,
            vad_parameters=vad_params,
        )

        segments = []
        text_parts = []
        for seg in segments_gen:
            segments.append({
                "start": seg.start,
                "end": seg.end,
                "text": seg.text,
                "avg_logprob": seg.avg_logprob,
            })
            text_parts.append(seg.text.strip())

        full_text = " ".join(text_parts)

        return TranscriptionResult(
            text=full_text,
            language=info.language,
            language_probability=info.language_probability,
            duration_s=duration_s,
            segments=segments,
        )

    def unload_model(self) -> None:
        """Unload the model to free memory."""
        with self._lock:
            self._model = None
            logger.info("Model unloaded.")
