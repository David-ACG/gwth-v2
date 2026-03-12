"""Pipeline orchestrator for the record -> transcribe -> inject flow.

State machine: IDLE -> RECORDING -> PROCESSING -> INJECTING -> IDLE
"""

import enum
import logging
import queue
import threading
from typing import Callable

import numpy as np

from localwhisper.core.audio_recorder import AudioRecorder
from localwhisper.core.engine import STTEngine
from localwhisper.core.transcriber import TranscriptionResult

logger = logging.getLogger(__name__)


class PipelineState(enum.Enum):
    IDLE = "idle"
    RECORDING = "recording"
    PROCESSING = "processing"
    INJECTING = "injecting"
    ERROR = "error"


class Pipeline:
    """Orchestrates the record -> transcribe -> inject flow."""

    def __init__(
        self,
        recorder: AudioRecorder,
        transcriber: STTEngine,
        on_state_change: Callable[[PipelineState], None] | None = None,
        on_transcription: Callable[[TranscriptionResult], None] | None = None,
        on_error: Callable[[Exception], None] | None = None,
    ):
        self.recorder = recorder
        self.transcriber = transcriber
        self._on_state_change = on_state_change
        self._on_transcription = on_transcription
        self._on_error = on_error

        self._state = PipelineState.IDLE
        self._audio_queue: queue.Queue[np.ndarray] = queue.Queue()
        self._worker_thread: threading.Thread | None = None
        self._running = False
        self._lock = threading.Lock()

    @property
    def state(self) -> PipelineState:
        return self._state

    def start_worker(self) -> None:
        """Start the background transcription worker thread."""
        self._running = True
        self._worker_thread = threading.Thread(
            target=self._worker_loop, daemon=True, name="transcription-worker"
        )
        self._worker_thread.start()

    def stop_worker(self) -> None:
        """Stop the background worker thread."""
        self._running = False
        self._audio_queue.put(np.array([], dtype=np.float32))  # sentinel
        if self._worker_thread is not None:
            self._worker_thread.join(timeout=5.0)

    def start_recording(self) -> None:
        """Begin capturing audio from the microphone."""
        with self._lock:
            if self._state != PipelineState.IDLE:
                logger.warning("Cannot start recording in state %s", self._state)
                return
            self._set_state(PipelineState.RECORDING)
            self.recorder.start()
            logger.info("Recording started.")

    def stop_recording(self) -> None:
        """Stop recording and queue audio for transcription."""
        with self._lock:
            if self._state != PipelineState.RECORDING:
                logger.warning("Cannot stop recording in state %s", self._state)
                return
            audio = self.recorder.stop()
            logger.info("Recording stopped. Audio length: %.2fs", len(audio) / 16000)

            if len(audio) < 1600:  # Less than 0.1s, ignore
                logger.info("Audio too short, ignoring.")
                self._set_state(PipelineState.IDLE)
                return

            self._set_state(PipelineState.PROCESSING)
            self._audio_queue.put(audio)

    def _worker_loop(self) -> None:
        """Background worker that processes audio from the queue."""
        while self._running:
            try:
                audio = self._audio_queue.get(timeout=1.0)
            except queue.Empty:
                continue

            if len(audio) == 0:
                continue  # sentinel or empty

            try:
                result = self.transcriber.transcribe(audio)
                logger.info("Transcription: %s", result.text[:100])

                self._set_state(PipelineState.INJECTING)

                if self._on_transcription:
                    self._on_transcription(result)

            except Exception as e:
                logger.error("Transcription error: %s", e)
                self._set_state(PipelineState.ERROR)
                if self._on_error:
                    self._on_error(e)

            finally:
                self._set_state(PipelineState.IDLE)

    def _set_state(self, new_state: PipelineState) -> None:
        """Update state and fire callback."""
        old_state = self._state
        self._state = new_state
        if old_state != new_state and self._on_state_change:
            try:
                self._on_state_change(new_state)
            except Exception:
                logger.exception("Error in state change callback")
