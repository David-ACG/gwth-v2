"""LocalWhisper - Main application entry point.

Initializes all components and runs the main event loop.
"""

import logging
import logging.handlers
import os
import signal
import subprocess
import sys
import threading
import tkinter as tk
from pathlib import Path

# pythonw.exe sets sys.stdout/stderr to None — libraries (funasr, uvicorn) crash.
# Redirect to devnull so write() calls succeed silently.
if sys.stdout is None:
    sys.stdout = open(os.devnull, "w")
if sys.stderr is None:
    sys.stderr = open(os.devnull, "w")

# Add NVIDIA CUDA DLLs to PATH before importing anything that uses them
# (Not needed for CPU-only frozen builds, but keeps GPU support in dev)
if not getattr(sys, "frozen", False):
    _nvidia_path = Path(sys.prefix) / "Lib" / "site-packages" / "nvidia"
    if _nvidia_path.exists():
        for sub in ["cublas", "cudnn"]:
            bin_dir = _nvidia_path / sub / "bin"
            if bin_dir.exists():
                os.add_dll_directory(str(bin_dir))
                os.environ["PATH"] = str(bin_dir) + os.pathsep + os.environ.get("PATH", "")

from localwhisper.paths import get_user_dir
from localwhisper.config import get_config
from localwhisper.core.audio_recorder import AudioRecorder
from localwhisper.core.hotkey_manager import HotkeyManager
from localwhisper.core.pipeline import Pipeline, PipelineState
from localwhisper.core.text_injector import TextInjector
from localwhisper.core.engine import DEFAULT_ENGINE, create_engine
from localwhisper.core.model_manager import ensure_model_ready
from localwhisper.core.transcriber import TranscriptionResult
from localwhisper.db.database import Database
from localwhisper.ui.status_bar import StatusBar
from localwhisper.ui.tray import TrayIcon
from localwhisper.web.server import SettingsServer

logger = logging.getLogger("localwhisper")


def setup_logging():
    """Configure logging with file and console handlers."""
    data_dir = get_user_dir() / "data"
    data_dir.mkdir(parents=True, exist_ok=True)
    logger.setLevel(logging.INFO)

    # File handler with rotation
    fh = logging.handlers.RotatingFileHandler(
        str(data_dir / "localwhisper.log"), maxBytes=5_000_000, backupCount=3, encoding="utf-8"
    )
    fh.setFormatter(logging.Formatter("%(asctime)s [%(levelname)s] %(name)s: %(message)s"))
    logger.addHandler(fh)

    # Console handler
    ch = logging.StreamHandler()
    ch.setFormatter(logging.Formatter("[%(levelname)s] %(message)s"))
    logger.addHandler(ch)


class LocalWhisperApp:
    """Main application class that wires all components together."""

    def __init__(self):
        self.config = get_config()
        db_path = self.config.get("database.path", "./data/localwhisper.db")
        # Resolve relative DB paths against user data dir
        db_path_obj = Path(db_path)
        if not db_path_obj.is_absolute():
            db_path_obj = get_user_dir() / db_path
        db_path_obj.parent.mkdir(parents=True, exist_ok=True)
        self.db = Database(str(db_path_obj))
        self._app_status = {"state": "idle", "model": self.config.model.name}
        self._shutting_down = False

        # Core components
        self.recorder = AudioRecorder(
            sample_rate=self.config.audio.sample_rate,
            channels=self.config.audio.channels,
            device_index=self.config.audio.device_index,
            max_duration_s=self.config.vad.max_speech_duration_s,
        )

        engine_name = self.config.get("model.engine", DEFAULT_ENGINE)
        self.transcriber = create_engine(
            engine_name,
            model_name=self.config.model.name,
            device=self.config.model.device,
            compute_type=self.config.model.compute_type,
            download_dir=self.config.model.download_dir,
            language=self.config.general.language if self.config.general.language != "auto" else None,
            vad_enabled=self.config.vad.enabled,
            vad_threshold=self.config.vad.threshold,
            vad_min_silence_ms=self.config.vad.min_silence_duration_ms,
        )

        self.injector = TextInjector(
            restore_clipboard=self.config.injection.restore_clipboard,
            paste_delay_ms=self.config.injection.paste_delay_ms,
            terminal_classes=self.config.injection.terminal_classes,
        )

        # Pipeline
        self.pipeline = Pipeline(
            recorder=self.recorder,
            transcriber=self.transcriber,
            on_state_change=self._on_state_change,
            on_transcription=self._on_transcription,
            on_error=self._on_error,
        )

        # UI components
        self.status_bar = StatusBar(
            settings_url=f"http://{self.config.server.host}:{self.config.server.port}",
            on_toggle_recording=self._toggle_recording,
        )

        self.tray = TrayIcon(
            on_toggle_recording=self._toggle_recording,
            on_quit=self.shutdown,
            settings_url=f"http://{self.config.server.host}:{self.config.server.port}",
        )

        # Hotkey
        self.hotkey_mgr = HotkeyManager(
            hotkey=self.config.hotkey.push_to_talk,
            mode=self.config.hotkey.mode,
            on_start=self.pipeline.start_recording,
            on_stop=self.pipeline.stop_recording,
        )

        # Settings server
        self.server = SettingsServer(
            host=self.config.server.host,
            port=self.config.server.port,
            db=self.db,
            app_status=self._app_status,
            restart_callback=self.restart,
        )

    def run(self):
        """Start the application."""
        logger.info("Starting LocalWhisper v0.1.0...")

        # Open audio stream early so pre-buffer is filling
        try:
            self.recorder.open_stream()
        except Exception as e:
            logger.warning("Audio device %s failed: %s. Falling back to system default.",
                           self.config.audio.device_index, e)
            self.recorder.device_index = None  # System default
            self.recorder.open_stream()

        # Start background services
        self.server.start()
        self.pipeline.start_worker()
        self.hotkey_mgr.register()
        self.tray.start()

        # Load model in background
        threading.Thread(target=self._load_model, daemon=True, name="model-loader").start()

        # Run tkinter main loop (must be on main thread)
        self._root = tk.Tk()
        self._root.withdraw()  # Hidden root window
        self.status_bar.init_ui(self._root)

        logger.info("LocalWhisper ready. Press %s to dictate.", self.config.hotkey.push_to_talk)
        self.tray.notify("LocalWhisper", f"Ready! Press {self.config.hotkey.push_to_talk} to dictate.")

        # Check for shutdown periodically
        self._check_shutdown()
        self._root.mainloop()

    def _check_shutdown(self):
        """Check if we should shut down (called periodically from main thread)."""
        if self._shutting_down:
            self._root.quit()
        else:
            self._root.after(500, self._check_shutdown)

    def _load_model(self):
        """Load the STT model in the background."""
        engine_name = self.config.get("model.engine", DEFAULT_ENGINE)
        try:
            # Ensure model is downloaded (shows dialog on first frozen launch)
            ensure_model_ready(
                model_name=self.config.model.name,
                engine=engine_name,
                download_dir=self.config.model.download_dir,
            )
            logger.info("Loading %s model '%s'...", engine_name, self.config.model.name)
            self.transcriber.load_model()
            self._app_status["model"] = self.config.model.name
            self.tray.set_model_name(self.config.model.name)
            logger.info("Model loaded successfully.")
        except Exception as e:
            logger.error("Failed to load model: %s", e)
            self.status_bar.show_error(f"Model load failed: {e}")
            # Fallback only makes sense for faster-whisper
            if engine_name == "faster-whisper":
                logger.info("Trying fallback model 'small'...")
                try:
                    self.transcriber.model_name = "small"
                    self.transcriber.load_model()
                    self._app_status["model"] = "small (fallback)"
                    self.tray.set_model_name("small (fallback)")
                except Exception as e2:
                    logger.error("Fallback model also failed: %s", e2)
                    self._app_status["model"] = "FAILED"
            else:
                self._app_status["model"] = "FAILED"

    def _on_state_change(self, state: PipelineState):
        """Handle pipeline state changes - update UI."""
        state_name = state.value
        self._app_status["state"] = state_name

        if state == PipelineState.RECORDING:
            self.tray.set_state("recording")
            self.status_bar.set_state("recording")
        elif state == PipelineState.PROCESSING:
            self.tray.set_state("processing")
            self.status_bar.set_state("processing")
        elif state == PipelineState.IDLE:
            self.tray.set_state("idle")
            self.status_bar.set_state("idle")
        elif state == PipelineState.ERROR:
            self.tray.set_state("idle")
            self.status_bar.set_state("idle")

    def _apply_custom_words(self, text: str) -> str:
        """Apply custom word replacements to transcribed text.

        Does case-insensitive whole-word replacement so Whisper's variations
        (e.g. 'gwth.aii', 'GWTH.AI') get corrected to the stored form.
        """
        import re
        custom_words = self.db.get_custom_words()
        for cw in custom_words:
            # Escape the word for regex, then do case-insensitive whole-word replace.
            # \b word-boundary handles most cases; we also strip trailing/leading
            # repeated chars that Whisper sometimes hallucinates.
            pattern = re.escape(cw.word)
            # Allow optional trailing duplicate of the last character (common Whisper artifact)
            if cw.word:
                last_char = re.escape(cw.word[-1])
                pattern = pattern + last_char + "?"
            text = re.sub(pattern, cw.word, text, flags=re.IGNORECASE)
        return text

    def _on_transcription(self, result: TranscriptionResult):
        """Handle completed transcription - inject text and save to DB."""
        if result.text.strip():
            text = self._apply_custom_words(result.text)
            self.injector.inject(text)
            self.status_bar.show_transcription(text)

            # Save to database
            from localwhisper.db.models import Transcription
            self.db.add_transcription(Transcription(
                text=text,
                duration_s=result.duration_s,
                model=self.transcriber.model_name,
                language=result.language,
                confidence=result.language_probability,
            ))
            logger.info("Transcribed: %s", text[:80])

    def _on_error(self, error: Exception):
        """Handle pipeline errors."""
        logger.error("Pipeline error: %s", error)
        self.tray.notify("LocalWhisper Error", str(error)[:200])
        self.status_bar.show_error(str(error)[:200])

    def _toggle_recording(self):
        """Toggle recording from tray menu."""
        if self.pipeline.state == PipelineState.IDLE:
            self.pipeline.start_recording()
        elif self.pipeline.state == PipelineState.RECORDING:
            self.pipeline.stop_recording()

    def restart(self):
        """Restart the application by spawning a new process and shutting down."""
        logger.info("Restarting LocalWhisper...")
        # Spawn a new instance before shutting down
        exe = sys.executable
        if getattr(sys, "frozen", False):
            subprocess.Popen([exe], creationflags=subprocess.DETACHED_PROCESS)
        else:
            subprocess.Popen(
                [exe, "-m", "localwhisper"],
                creationflags=subprocess.DETACHED_PROCESS,
            )
        self.shutdown()

    def shutdown(self):
        """Gracefully shut down all components."""
        logger.info("Shutting down...")
        self._shutting_down = True
        self.hotkey_mgr.unregister()
        self.pipeline.stop_worker()
        self.recorder.close_stream()
        self.server.stop()
        self.status_bar.destroy()
        self.tray.stop()
        self.db.close()
        logger.info("Shutdown complete.")


def main():
    setup_logging()
    app = LocalWhisperApp()

    # Register signal handlers so Ctrl+C works even when the keyboard
    # library's global hook is active (it can swallow KeyboardInterrupt).
    def _signal_shutdown(signum, frame):
        logger.info("Received signal %s, shutting down...", signum)
        app.shutdown()
        sys.exit(0)

    signal.signal(signal.SIGINT, _signal_shutdown)
    signal.signal(signal.SIGTERM, _signal_shutdown)
    # SIGBREAK is Windows-specific (Ctrl+Break)
    if hasattr(signal, "SIGBREAK"):
        signal.signal(signal.SIGBREAK, _signal_shutdown)

    try:
        app.run()
    except KeyboardInterrupt:
        app.shutdown()
    except Exception as e:
        logger.exception("Fatal error: %s", e)
        app.shutdown()
        sys.exit(1)


if __name__ == "__main__":
    main()
