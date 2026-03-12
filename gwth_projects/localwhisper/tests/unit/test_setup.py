"""Phase 0 acceptance tests - verify project setup."""

from pathlib import Path


def test_project_structure_exists():
    """All required directories exist."""
    dirs = [
        "src/localwhisper",
        "src/localwhisper/core",
        "src/localwhisper/ui",
        "src/localwhisper/web",
        "src/localwhisper/db",
        "tests",
        "config",
        "assets",
    ]
    for d in dirs:
        assert Path(d).is_dir(), f"Missing directory: {d}"


def test_config_loads():
    """Default config is valid TOML."""
    import tomllib

    with open("config/default.toml", "rb") as f:
        config = tomllib.load(f)
    assert config["model"]["name"] == "iic/SenseVoiceSmall"
    assert config["model"]["compute_type"] == "int8"
    assert config["model"]["device"] == "cpu"
    assert config["audio"]["sample_rate"] == 16000
    assert config["hotkey"]["push_to_talk"] == "ctrl+shift+space"


def test_cuda_available():
    """GPU is accessible via CTranslate2."""
    import ctranslate2

    assert ctranslate2.get_cuda_device_count() >= 1, "No CUDA devices found"


def test_faster_whisper_importable():
    """faster-whisper library loads."""
    from faster_whisper import WhisperModel

    assert WhisperModel is not None


def test_icons_generated():
    """All icon files exist in assets/."""
    assert Path("assets/icon_idle.ico").exists()
    assert Path("assets/icon_recording.ico").exists()
    assert Path("assets/icon_processing.ico").exists()
    assert Path("assets/icon_idle.png").exists()
    assert Path("assets/icon_recording.png").exists()
    assert Path("assets/icon_processing.png").exists()
