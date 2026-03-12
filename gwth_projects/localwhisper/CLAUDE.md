# LocalWhisper - Claude Code Instructions

## Project
Local speech-to-text dictation app for Windows 11 with NVIDIA T1000 (4GB VRAM).
Pure Python. faster-whisper engine. System-wide dictation via clipboard paste.

## Quick Reference

### Test Commands
```bash
# Unit tests (fast, no hardware)
python -m pytest tests/unit/ -v

# Unit tests with coverage
python -m pytest tests/unit/ --cov=src/localwhisper --cov-report=term

# Integration tests
python -m pytest tests/integration/ -v

# E2E Playwright tests (requires running app)
python -m pytest tests/e2e/ -v

# All tests
python -m pytest tests/ -v

# Quick smoke test
python -m pytest tests/unit/ -x -q
```

### Run the App
```bash
python -m localwhisper
# or
python src/localwhisper/app.py
```

### Key Files
| File | Purpose |
|------|---------|
| `src/localwhisper/app.py` | Main entry point |
| `src/localwhisper/config.py` | Configuration (TOML) |
| `src/localwhisper/core/pipeline.py` | Orchestrator |
| `src/localwhisper/core/transcriber.py` | faster-whisper engine |
| `src/localwhisper/core/audio_recorder.py` | Microphone capture |
| `src/localwhisper/core/text_injector.py` | Clipboard paste |
| `src/localwhisper/core/hotkey_manager.py` | Global hotkeys |
| `src/localwhisper/ui/tray.py` | System tray |
| `src/localwhisper/ui/overlay.py` | Recording overlay |
| `src/localwhisper/web/server.py` | FastAPI settings UI |
| `config/default.toml` | Default configuration |

## Build Protocol
Follow the Ralph Wiggum loop: `docs/05-operations/ralph-wiggum-loop.md`
Build phases are in: `docs/03-build-phases/`

## Rules
1. Run tests after EVERY code change
2. Never exceed 120k/200k context - /compact at ~100k
3. Don't ask questions - all decisions are in the phase docs
4. If a test fails 3 times with same error, STOP and log to `docs/05-operations/errors.md`
5. Log phase completion to `docs/05-operations/build-log.md`

## Architecture
- **Engine**: faster-whisper (CTranslate2) with large-v3-turbo int8
- **Audio**: sounddevice at 16kHz mono
- **VAD**: Silero VAD (built into faster-whisper)
- **Hotkey**: keyboard library (global, push-to-talk)
- **Injection**: Clipboard + Ctrl+V (Ctrl+Shift+V for terminals)
- **Tray**: pystray
- **Overlay**: tkinter (no focus steal)
- **Settings**: FastAPI + Jinja2 on 127.0.0.1:9876
- **Config**: TOML (config/default.toml)
- **Database**: SQLite (data/localwhisper.db)
