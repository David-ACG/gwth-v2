"""First-run model download manager.

On first launch (or when model files are missing), this module checks
whether the required model is present and downloads it if necessary.
Uses a simple tkinter progress dialog when running as a frozen app.
"""

import logging
import sys
import threading
from pathlib import Path

from localwhisper.paths import get_user_dir

logger = logging.getLogger(__name__)

# Known model sizes (approximate, for progress display)
_MODEL_SIZES = {
    "iic/SenseVoiceSmall": "~400 MB",
    "large-v3-turbo": "~1.5 GB",
    "large-v3": "~3 GB",
    "medium": "~1.5 GB",
    "small": "~500 MB",
    "base": "~150 MB",
    "tiny": "~75 MB",
}


def is_model_available(model_name: str, engine: str, download_dir: str | None = None) -> bool:
    """Check if a model's files exist locally.

    For SenseVoice models, checks for the model directory in the download dir.
    For faster-whisper models, checks CTranslate2 model directory.
    """
    if download_dir is None:
        download_dir = str(get_user_dir() / "models")

    dl_path = Path(download_dir)

    if engine == "sensevoice":
        # funasr stores models in cache_dir with the model name as subdir
        # The model name "iic/SenseVoiceSmall" becomes a directory structure
        model_dir = dl_path / model_name.replace("/", "--")
        if model_dir.exists() and any(model_dir.iterdir()):
            return True
        # Also check the huggingface hub cache pattern
        hub_dir = dl_path / "hub" / f"models--{model_name.replace('/', '--')}"
        if hub_dir.exists() and any(hub_dir.iterdir()):
            return True
        # Check if model exists in any subdirectory pattern
        for child in dl_path.rglob("*.bin"):
            return True
        for child in dl_path.rglob("*.onnx"):
            return True
        return False
    elif engine == "faster-whisper":
        # CTranslate2 models store as directories with model.bin
        model_dir = dl_path / model_name
        return model_dir.exists() and (model_dir / "model.bin").exists()

    return False


def ensure_model_ready(
    model_name: str,
    engine: str,
    download_dir: str | None = None,
    on_progress: callable = None,
) -> None:
    """Ensure the model is downloaded and ready.

    If the model is not available locally, triggers a download.
    For frozen builds, shows a tkinter dialog with a progress message.
    For dev builds, just logs the download.

    Args:
        model_name: The model identifier (e.g., "iic/SenseVoiceSmall").
        engine: The engine name ("sensevoice" or "faster-whisper").
        download_dir: Directory to store models. Defaults to user_dir/models.
        on_progress: Optional callback for progress updates.
    """
    if download_dir is None:
        download_dir = str(get_user_dir() / "models")

    # Create models directory
    Path(download_dir).mkdir(parents=True, exist_ok=True)

    if is_model_available(model_name, engine, download_dir):
        logger.info("Model '%s' is already available.", model_name)
        return

    size_hint = _MODEL_SIZES.get(model_name, "unknown size")
    logger.info(
        "Model '%s' not found locally. Downloading (%s)...",
        model_name,
        size_hint,
    )

    if getattr(sys, "frozen", False):
        _download_with_dialog(model_name, engine, download_dir, size_hint)
    else:
        # In dev mode, just let the engine handle the download
        logger.info("Model will be downloaded on first use by the engine.")


def _download_with_dialog(
    model_name: str, engine: str, download_dir: str, size_hint: str
) -> None:
    """Show a tkinter dialog while downloading the model."""
    import tkinter as tk
    from tkinter import ttk

    root = tk.Tk()
    root.title("LocalWhisper - First Run Setup")
    root.geometry("420x150")
    root.resizable(False, False)

    # Center on screen
    root.update_idletasks()
    x = (root.winfo_screenwidth() - 420) // 2
    y = (root.winfo_screenheight() - 150) // 2
    root.geometry(f"+{x}+{y}")

    label = tk.Label(
        root,
        text=f"Downloading speech model ({size_hint})...\nThis only happens on first launch.",
        pady=10,
    )
    label.pack()

    progress = ttk.Progressbar(root, mode="indeterminate", length=350)
    progress.pack(pady=10)
    progress.start(10)

    status_var = tk.StringVar(value="Starting download...")
    status_label = tk.Label(root, textvariable=status_var, fg="gray")
    status_label.pack()

    download_error = [None]

    def do_download():
        try:
            if engine == "sensevoice":
                _download_sensevoice_model(model_name, download_dir)
            elif engine == "faster-whisper":
                _download_faster_whisper_model(model_name, download_dir)
            root.after(0, root.destroy)
        except Exception as e:
            download_error[0] = e
            logger.error("Model download failed: %s", e)
            root.after(0, lambda: status_var.set(f"Error: {e}"))
            root.after(3000, root.destroy)

    thread = threading.Thread(target=do_download, daemon=True)
    thread.start()
    root.mainloop()

    if download_error[0]:
        raise download_error[0]


def _download_sensevoice_model(model_name: str, download_dir: str) -> None:
    """Download a SenseVoice model using funasr."""
    from funasr import AutoModel

    # This triggers the model download
    AutoModel(model=model_name, device="cpu", cache_dir=download_dir)
    logger.info("SenseVoice model '%s' downloaded successfully.", model_name)


def _download_faster_whisper_model(model_name: str, download_dir: str) -> None:
    """Download a faster-whisper model."""
    from faster_whisper import WhisperModel

    # Loading the model triggers download
    WhisperModel(model_name, device="cpu", compute_type="int8", download_root=download_dir)
    logger.info("faster-whisper model '%s' downloaded successfully.", model_name)
