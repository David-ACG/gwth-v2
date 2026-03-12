"""Voice Activity Detection wrapper using Silero VAD.

Thin wrapper around faster-whisper's built-in Silero VAD for standalone use.
"""

import numpy as np
from faster_whisper.vad import VadOptions, get_speech_timestamps


class VoiceActivityDetector:
    """Detects speech segments in audio using Silero VAD."""

    def __init__(
        self,
        threshold: float = 0.5,
        min_speech_duration_ms: int = 250,
        max_speech_duration_s: float = 30.0,
        min_silence_duration_ms: int = 500,
        sample_rate: int = 16000,
    ):
        self.threshold = threshold
        self.min_speech_duration_ms = min_speech_duration_ms
        self.max_speech_duration_s = max_speech_duration_s
        self.min_silence_duration_ms = min_silence_duration_ms
        self.sample_rate = sample_rate

    def get_speech_segments(self, audio: np.ndarray) -> list[dict]:
        """Detect speech segments in audio.

        Args:
            audio: float32 numpy array of audio samples at self.sample_rate.

        Returns:
            List of dicts with 'start' and 'end' keys (in seconds).
        """
        if len(audio) == 0:
            return []

        vad_opts = VadOptions(
            threshold=self.threshold,
            min_speech_duration_ms=self.min_speech_duration_ms,
            max_speech_duration_s=self.max_speech_duration_s,
            min_silence_duration_ms=self.min_silence_duration_ms,
        )

        # get_speech_timestamps returns list of dicts with 'start' and 'end' in samples
        timestamps = get_speech_timestamps(audio, vad_options=vad_opts)

        segments = []
        for ts in timestamps:
            segments.append({
                "start": ts["start"] / self.sample_rate,
                "end": ts["end"] / self.sample_rate,
            })
        return segments

    def has_speech(self, audio: np.ndarray) -> bool:
        """Check if audio contains any speech."""
        return len(self.get_speech_segments(audio)) > 0

    def trim_silence(self, audio: np.ndarray) -> np.ndarray:
        """Remove leading and trailing silence from audio.

        Returns trimmed audio or original if no speech found.
        """
        segments = self.get_speech_segments(audio)
        if not segments:
            return audio

        start_sample = int(segments[0]["start"] * self.sample_rate)
        end_sample = int(segments[-1]["end"] * self.sample_rate)
        return audio[start_sample:end_sample]
