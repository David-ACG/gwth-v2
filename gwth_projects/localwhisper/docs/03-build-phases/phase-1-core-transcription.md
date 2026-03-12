# Phase 1: Core Transcription Engine

## Goal
Build and test the transcription pipeline: audio capture -> VAD -> faster-whisper -> text output.

## Duration Estimate: Medium

## Dependencies
- Phase 0 complete

## Tasks

### 1.1 Configuration Manager (`src/localwhisper/config.py`)
- Load `default.toml` as base
- Overlay `localwhisper.toml` if exists
- Override with environment variables
- Provide typed access: `config.model.name`, `config.audio.sample_rate`
- Thread-safe singleton pattern

### 1.2 Audio Recorder (`src/localwhisper/core/audio_recorder.py`)
- Use `sounddevice` to capture from default microphone
- 16kHz mono PCM audio (what Whisper expects)
- Start/stop recording on demand
- Return audio as numpy array (float32)
- Buffer management with configurable max duration
- List available audio devices

### 1.3 Transcriber (`src/localwhisper/core/transcriber.py`)
- Initialize faster-whisper `WhisperModel` with config
- Load model on first use (lazy loading)
- Transcribe audio numpy array -> text string
- Support int8 quantization for T1000
- VAD filtering enabled by default
- Return transcription with metadata (confidence, language, duration)
- Model download with progress reporting

### 1.4 VAD Wrapper (`src/localwhisper/core/vad.py`)
- Thin wrapper around faster-whisper's built-in Silero VAD
- Configurable thresholds from config
- Can be used standalone for real-time speech detection
- Returns speech segments with timestamps

### 1.5 Pipeline Orchestrator (`src/localwhisper/core/pipeline.py`)
- Connects audio_recorder -> VAD -> transcriber
- Queue-based async processing
- State machine: IDLE -> RECORDING -> PROCESSING -> INJECTING -> IDLE
- Event callbacks for state changes
- Error handling and recovery

## Acceptance Criteria (Tests)

```python
# tests/unit/test_config.py
def test_default_config_loads():
    """Default TOML loads with all required keys."""
def test_config_override():
    """User TOML overrides defaults."""
def test_env_var_override():
    """Environment variables override TOML."""
def test_config_singleton():
    """Config returns same instance."""

# tests/unit/test_audio_recorder.py
def test_list_audio_devices():
    """Lists at least one audio device."""
def test_record_short_clip():
    """Records 1 second of audio, returns correct shape."""
def test_audio_sample_rate():
    """Audio is captured at 16kHz."""
def test_audio_is_mono():
    """Audio has single channel."""
def test_start_stop_recording():
    """Can start and stop recording cleanly."""

# tests/unit/test_transcriber.py
def test_model_loads():
    """WhisperModel loads with int8 on CUDA."""
def test_transcribe_silence():
    """Silent audio returns empty or near-empty text."""
def test_transcribe_speech():
    """Known speech audio returns expected text."""
    # Use a pre-recorded test WAV file
def test_transcribe_returns_metadata():
    """Transcription includes confidence and language."""

# tests/unit/test_vad.py
def test_vad_detects_speech():
    """VAD correctly identifies speech segments."""
def test_vad_detects_silence():
    """VAD correctly identifies silent segments."""
def test_vad_configurable_threshold():
    """Different thresholds produce different results."""

# tests/unit/test_pipeline.py
def test_pipeline_state_machine():
    """Pipeline transitions through correct states."""
def test_pipeline_processes_audio():
    """Full pipeline: audio array -> text string."""

# tests/integration/test_record_and_transcribe.py
def test_record_and_transcribe_real_audio():
    """Record from microphone, transcribe, get text back."""
    # Requires microphone - mark as integration test
```

## Test Data
- Create `tests/fixtures/` directory
- Include `hello_world.wav` - clear English "Hello, world" at 16kHz mono
- Include `silence.wav` - 2 seconds of silence
- Include `mixed.wav` - speech with silence gaps
- Generate these programmatically in conftest.py using TTS or record manually

## Ralph Wiggum Gate
- ALL unit tests pass -> proceed to Phase 2
- Integration test is optional (requires mic) -> skip if no mic detected
- Model download may take time -> allow up to 10 minutes
- After 3 failures on same test -> STOP and log to errors.md

## Context Window Management
- Run `/compact` after completing this phase
- This phase touches many files - good compaction point
