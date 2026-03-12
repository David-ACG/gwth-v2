"""SenseVoice STT engine — alternative to faster-whisper.

Uses FunASR's SenseVoice model (Alibaba/FunAudioLLM).
The `funasr` package is only imported when this engine is selected.
"""

import logging
import re
import threading
from pathlib import Path

import numpy as np

from localwhisper.core.transcriber import TranscriptionResult
from localwhisper.paths import get_user_dir

logger = logging.getLogger(__name__)

# Regex to strip SenseVoice tags: <|en|>, <|Speech|>, <|HAPPY|>, <|withitn|>, etc.
_TAG_RE = re.compile(r"<\|[^|]+\|>")


class SenseVoiceTranscriber:
    """SenseVoice STT engine matching the STTEngine protocol."""

    def __init__(
        self,
        model_name: str = "iic/SenseVoiceSmall",
        device: str = "cuda",
        language: str | None = "en",
        download_dir: str = "./models",
        # Accepted but ignored — faster-whisper-specific params
        compute_type: str = "int8",
        vad_enabled: bool = True,
        vad_threshold: float = 0.5,
        vad_min_silence_ms: int = 500,
        **_extra,
    ):
        self.model_name = model_name
        self._device = device
        self._language = language or "auto"
        # Resolve relative download dirs against user data dir
        dl_path = Path(download_dir)
        self._download_dir = str(dl_path if dl_path.is_absolute() else get_user_dir() / download_dir)

        self._model = None
        self._lock = threading.Lock()

    @property
    def is_loaded(self) -> bool:
        return self._model is not None

    def load_model(self) -> None:
        """Load the SenseVoice model via funasr (downloads on first use)."""
        with self._lock:
            if self._model is not None:
                return

            try:
                from funasr import AutoModel
            except ImportError:
                raise ImportError(
                    "SenseVoice requires the 'funasr' package. "
                    "Install it with: pip install funasr"
                )

            # funasr expects "cuda:0" not bare "cuda"
            device = self._device
            if device == "cuda":
                device = "cuda:0"

            logger.info(
                "Loading SenseVoice model %s (device=%s)...",
                self.model_name,
                device,
            )
            self._model = AutoModel(
                model=self.model_name,
                device=device,
                cache_dir=self._download_dir,
            )
            logger.info("SenseVoice model loaded successfully.")

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
            TranscriptionResult with text and metadata.
        """
        if len(audio) == 0:
            return TranscriptionResult(
                text="",
                language="",
                language_probability=0.0,
                duration_s=0.0,
                segments=[],
            )

        if self._model is None:
            self.load_model()

        duration_s = len(audio) / sample_rate

        result = self._model.generate(
            input=audio,
            language=self._language,
            use_itn=True,
        )

        # Extract text from funasr result
        raw_text = ""
        if result and isinstance(result, list) and len(result) > 0:
            entry = result[0]
            if isinstance(entry, dict) and "text" in entry:
                raw_text = entry["text"]
            elif isinstance(entry, str):
                raw_text = entry

        # Strip emotion/event tags
        text = _TAG_RE.sub("", raw_text).strip()

        return TranscriptionResult(
            text=text,
            language=self._language if self._language != "auto" else "unknown",
            language_probability=1.0,
            duration_s=duration_s,
            segments=[],
        )

    def unload_model(self) -> None:
        """Unload the model to free memory."""
        with self._lock:
            self._model = None
            logger.info("SenseVoice model unloaded.")
