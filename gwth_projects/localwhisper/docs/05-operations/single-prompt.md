# LocalWhisper — Single Prompt Build

> The prompt below captures every architectural decision, bug fix, and gotcha
> discovered during the original multi-session build. Feeding it to Claude Code
> in a fresh session should reproduce the entire app in one shot.

---

Build a local speech-to-text dictation app called **LocalWhisper** for Windows 11 with an NVIDIA T1000 GPU (4GB VRAM). It must work system-wide — Notion, Claude Code in Warp terminal, browsers, everything. Pure Python. No cloud APIs. All processing on-device.

## Tech Stack (non-negotiable)
- **Engine**: `faster-whisper` with `large-v3-turbo` model, `int8` quantization, CUDA inference
- **Audio**: `sounddevice` at 16kHz mono
- **VAD**: Silero VAD (built into faster-whisper)
- **Hotkey**: `keyboard` library for global push-to-talk
- **Text injection**: Clipboard + `Ctrl+V` paste (use `Ctrl+Shift+V` for terminal windows)
- **Terminal detection**: Win32 `GetClassName` via `ctypes` to detect Warp, Windows Terminal, ConHost, mintty
- **System tray**: `pystray` with colored circle icons (green=idle, red=recording, yellow=processing)
- **Recording overlay**: `tkinter` with `WS_EX_NOACTIVATE` | `WS_EX_TOOLWINDOW` | `WS_EX_TOPMOST` so it never steals focus
- **Settings UI**: `FastAPI` + `Jinja2` on `127.0.0.1:9876`
- **Config**: TOML (`config/default.toml` for defaults, `config/localwhisper.toml` for user overrides, gitignored)
- **Database**: SQLite with thread-local connections for transcription history
- **Models**: Pydantic v2

## Critical implementation details (bugs I've already hit — do these right the first time)

1. **CUDA DLL loading**: `ctranslate2` does NOT bundle CUDA libs. Install `nvidia-cublas-cu12` and `nvidia-cudnn-cu12` via pip. At the very top of `app.py` (before any other imports that touch CUDA), add `os.add_dll_directory()` for `.venv/Lib/site-packages/nvidia/cublas/bin` and `nvidia/cudnn/bin`, and prepend them to `os.environ["PATH"]`.

2. **Audio pre-buffer**: Do NOT open/close the audio stream on each recording — that causes 200-500ms device-open latency and loses the first words. Instead, keep the `sounddevice.InputStream` running continuously from app startup. Use a `collections.deque` as a rolling 1.5-second pre-buffer. When recording starts, prepend the pre-buffer contents so speech already in progress is captured.

3. **Push-to-talk hotkey**: Do NOT use `keyboard.add_hotkey()` — it fires on every OS key-repeat event and spams callbacks. Instead use `keyboard.hook()` with a low-level callback that: (a) checks `event.event_type == KEY_DOWN` with modifier keys held via `kb.is_pressed()`, (b) uses a `_ptt_active` boolean guard so only the first keydown fires `on_start`, (c) fires `on_stop` only on `KEY_UP` when `_ptt_active` is True. Key repeats are silently ignored.

4. **Ctrl+C handling**: The `keyboard` library's global hook swallows `KeyboardInterrupt` on Windows. Register explicit `signal.signal(signal.SIGINT, ...)` and `signal.signal(signal.SIGBREAK, ...)` handlers in `main()` that call `app.shutdown()` then `sys.exit(0)`.

5. **Auto-start on boot**: Create `scripts/launch.vbs` that runs `pythonw.exe -m localwhisper` with a hidden window. Use PowerShell to create a `.lnk` shortcut in `shell:startup`.

6. **Settings UI device selector**: List all audio input devices with channel count, sample rate, and `[System Default]` marker. Pre-select the currently configured device in the dropdown.

## Project structure
```
src/localwhisper/
  __init__.py, __main__.py, app.py, config.py
  core/  (audio_recorder.py, transcriber.py, vad.py, pipeline.py, hotkey_manager.py, text_injector.py)
  ui/    (tray.py, overlay.py)
  web/   (server.py, routes.py, templates/, static/)
  db/    (database.py, models.py)
config/default.toml
scripts/launch.vbs, generate_icons.py
tests/unit/, tests/integration/, tests/e2e/
docs/  (research, architecture, build phases, testing, operations)
```

## Build protocol
1. Write comprehensive docs first (research, architecture, build phases, test strategy) to MD files in `docs/`
2. Build in phases: setup → core transcription → text injection → UI → settings web UI → integration → security
3. Write tests for every phase. Run `pytest tests/unit/ -v` after every code change. All tests must pass before moving on.
4. Use Playwright for E2E tests of the settings web UI.
5. Do not ask questions — make all decisions from these instructions. If a test fails 3 times with the same error, stop and report.
6. Target: installable via `pip install -e .` and runnable via `python -m localwhisper`

Build the entire app end to end. Every phase. Every test. Ship it.
