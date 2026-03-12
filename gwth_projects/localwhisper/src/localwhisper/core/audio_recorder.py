"""Audio recording from microphone using sounddevice.

Captures 16kHz mono PCM audio suitable for Whisper transcription.
Uses a continuously-running stream with a rolling pre-buffer so that
audio captured *before* the record button is pressed is included,
eliminating the first-word-lost problem.
"""

import collections
import logging
import threading
import numpy as np
import sounddevice as sd

logger = logging.getLogger(__name__)


class AudioRecorder:
    """Records audio from the microphone with pre-roll buffer.

    The stream runs continuously once open_stream() is called.
    A rolling pre-buffer captures the last `pre_buffer_s` seconds so
    that when start() is called, speech already in progress is included.
    """

    def __init__(
        self,
        sample_rate: int = 16000,
        channels: int = 1,
        device_index: int | None = None,
        max_duration_s: float = 30.0,
        pre_buffer_s: float = 1.5,
    ):
        self.sample_rate = sample_rate
        self.channels = channels
        self.device_index = device_index if device_index != -1 else None
        self.max_duration_s = max_duration_s
        self.pre_buffer_s = pre_buffer_s

        self._buffer: list[np.ndarray] = []
        self._recording = False
        self._stream: sd.InputStream | None = None
        self._stream_open = False
        self._lock = threading.Lock()

        # Rolling pre-buffer: stores recent audio chunks
        # Each chunk is ~512-1024 samples from the callback
        max_pre_chunks = int(self.pre_buffer_s * self.sample_rate / 512) + 10
        self._pre_buffer: collections.deque[np.ndarray] = collections.deque(maxlen=max_pre_chunks)

    @property
    def is_recording(self) -> bool:
        return self._recording

    def open_stream(self) -> None:
        """Open the audio stream and start continuous listening.

        The stream runs in the background, filling the pre-buffer.
        Call this once at app startup.
        """
        with self._lock:
            if self._stream_open:
                return
            self._stream = sd.InputStream(
                samplerate=self.sample_rate,
                channels=self.channels,
                dtype="float32",
                device=self.device_index,
                callback=self._audio_callback,
            )
            self._stream.start()
            self._stream_open = True
            logger.info("Audio stream opened (device=%s, pre_buffer=%.1fs)",
                        self.device_index, self.pre_buffer_s)

    def close_stream(self) -> None:
        """Close the audio stream. Call on app shutdown."""
        with self._lock:
            self._recording = False
            if self._stream is not None:
                self._stream.stop()
                self._stream.close()
                self._stream = None
            self._stream_open = False
            self._pre_buffer.clear()
            self._buffer = []

    def start(self) -> None:
        """Start recording from microphone.

        If the stream is not yet open, opens it first.
        Grabs the pre-buffer contents so early speech is captured.
        """
        # Auto-open stream if not already running
        if not self._stream_open:
            self.open_stream()

        with self._lock:
            if self._recording:
                return
            # Grab pre-buffer contents as the start of the recording
            self._buffer = list(self._pre_buffer)
            self._recording = True

    def stop(self) -> np.ndarray:
        """Stop recording and return captured audio as numpy array.

        The stream stays open for the next recording.

        Returns:
            numpy array of shape (n_samples,) with float32 values in [-1, 1].
        """
        with self._lock:
            if not self._recording:
                return np.array([], dtype=np.float32)
            self._recording = False

            if not self._buffer:
                return np.array([], dtype=np.float32)

            audio = np.concatenate(self._buffer, axis=0)
            # Flatten to mono if needed
            if audio.ndim > 1:
                audio = audio[:, 0]

            # Trim to max duration
            max_samples = int(self.max_duration_s * self.sample_rate)
            if len(audio) > max_samples:
                audio = audio[:max_samples]

            self._buffer = []
            return audio

    def _audio_callback(self, indata, frames, time_info, status):
        """Sounddevice callback - runs on audio thread."""
        chunk = indata.copy()
        if self._recording:
            self._buffer.append(chunk)
        else:
            # Not recording: feed the rolling pre-buffer
            self._pre_buffer.append(chunk)

    @staticmethod
    def list_devices() -> list[dict]:
        """List available audio input devices."""
        devices = sd.query_devices()
        inputs = []
        for i, dev in enumerate(devices):
            if dev["max_input_channels"] > 0:
                inputs.append({
                    "index": i,
                    "name": dev["name"],
                    "channels": dev["max_input_channels"],
                    "sample_rate": dev["default_samplerate"],
                })
        return inputs

    @staticmethod
    def get_default_device() -> dict | None:
        """Get default input device info."""
        try:
            idx = sd.default.device[0]
            if idx is None or idx < 0:
                return None
            dev = sd.query_devices(idx)
            return {
                "index": idx,
                "name": dev["name"],
                "channels": dev["max_input_channels"],
                "sample_rate": dev["default_samplerate"],
            }
        except Exception:
            return None
