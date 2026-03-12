# Single Prompt: Add SenseVoice as Alternative STT Engine

**Add SenseVoice as an alternative STT engine to LocalWhisper.**

## What to build

Add Alibaba's SenseVoice (via the `funasr` package) as a second speech-to-text engine alongside the existing faster-whisper. Use a `typing.Protocol` (not ABC) so the existing `Transcriber` class needs zero changes. A factory function creates the right engine based on config. `funasr` is an optional dependency — only imported when SenseVoice is selected.

## Architecture

- **`STTEngine` Protocol** in a new `src/localwhisper/core/engine.py` defining: `model_name`, `is_loaded`, `load_model()`, `transcribe()`, `unload_model()`
- **`create_engine(engine_name, **kwargs)`** factory with lazy imports — returns `Transcriber` for "faster-whisper", `SenseVoiceTranscriber` for "sensevoice", raises `ValueError` for unknown
- **`ENGINE_MODELS`** dict mapping engine names to their available model lists
- Helper functions: `get_available_engines()`, `get_engine_models(engine)`

## SenseVoice implementation (`src/localwhisper/core/sensevoice.py`)

- `SenseVoiceTranscriber` class matching the `STTEngine` protocol
- Uses `funasr.AutoModel` internally, imported lazily inside `load_model()` with a clear `ImportError` message if funasr is missing
- Strip ALL SenseVoice tags from output using regex `<\|[^|]+\|>` — these include `<|en|>`, `<|Speech|>`, `<|HAPPY|>`, `<|withitn|>`, `<|BGM|>`, etc. (mixed case, not just uppercase)
- Accept and silently ignore faster-whisper-specific kwargs (`compute_type`, `vad_*`)
- Map `device="cuda"` to `"cuda:0"` for funasr's format
- Return `TranscriptionResult` with `segments=[]` and `language_probability=1.0`
- Empty audio check must happen BEFORE `load_model()` call to avoid triggering import when unnecessary

## Config changes

- Add `engine = "faster-whisper"` to `[model]` section in `config/default.toml`
- Add `engine` field to all existing profiles
- Add two new profiles: `sensevoice_gpu` (model=`iic/SenseVoiceSmall`, device=cuda) and `sensevoice_cpu` (model=`iic/SenseVoiceSmall`, device=cpu)
- Add `"ENGINE": ("model", "engine")` to `env_map` in `config.py`

## App changes

- `app.py`: Replace `Transcriber(...)` with `create_engine(engine_name, ...)`. Only try "small" fallback for faster-whisper engine.
- `pipeline.py`: Change type hint from `Transcriber` to `STTEngine` (import from engine.py)
- `pyproject.toml`: Add `[project.optional-dependencies]` with `sensevoice = ["funasr>=1.0.0"]`

## Web UI changes

- `routes.py`: Pass `engines`, `current_engine`, `engine_models` to template. Add `engine` Form param. Make `/api/models` accept `?engine=` query param to return engine-specific model lists.
- `settings.html`: Add Engine `<select>` dropdown. Add `data-engine` attribute to profile `<option>` elements. Wrap compute_type in `id="compute-type-group"` div for conditional visibility.
- `app.js`: Add `onEngineChange(engine)` that fetches `/api/models?engine=X`, repopulates model dropdown, hides compute_type for SenseVoice. Update `applyProfile()` to set engine and trigger model refresh. Update `clearProfile()` to also match on engine.

## Tests

- `tests/unit/test_engine.py`: Factory creates correct types, unknown engine raises ValueError, both Transcriber and SenseVoiceTranscriber satisfy STTEngine protocol, engine/model list helpers work
- `tests/unit/test_sensevoice.py`: Mock `funasr` throughout. Test lazy loading, empty audio (no import triggered), transcription with mock model, emotion/language tag stripping, string result format, ignoring extra kwargs, ImportError when funasr missing, unload, device mapping, auto language default

## Install dependencies after implementation

Run `pip install funasr` (with `--no-deps` first, then install deps separately) plus `torch` and `torchaudio` from `https://download.pytorch.org/whl/cu124` since the machine has an NVIDIA GPU but PyTorch isn't already installed (faster-whisper uses CTranslate2 directly).

Run `python -m pytest tests/unit/ -v` after every change. Commit and push when all tests pass.
