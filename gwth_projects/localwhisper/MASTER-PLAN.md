# LocalWhisper - Master Build Plan

## What Is This?
A local, privacy-first, system-wide speech-to-text dictation app for Windows 11.
Think SuperWhisper/Wispr Flow, but 100% local, 100% free, running on your T1000 GPU.

**Press a hotkey. Speak. Text appears wherever your cursor is. Done.**

## Target Hardware
- **GPU**: NVIDIA T1000 (4GB VRAM, Turing architecture)
- **OS**: Windows 11 Pro
- **Model**: faster-whisper large-v3-turbo with int8 quantization (~2.5GB VRAM)

## Must Work In
- Notion (browser)
- Claude Code in Warp terminal
- Every other Windows application

## Architecture Summary

```
[Ctrl+Shift+Space] -> [Microphone] -> [Silero VAD] -> [faster-whisper]
                                                              |
                                                     [Transcribed Text]
                                                              |
                                                  [Clipboard + Ctrl+V]
                                                              |
                                                   [Text in Active App]
```

**Stack**: Pure Python | faster-whisper | sounddevice | keyboard | pystray | tkinter | FastAPI

## Build Phases

| # | Phase | What Gets Built | Tests |
|---|-------|----------------|-------|
| 0 | [Project Setup](docs/03-build-phases/phase-0-project-setup.md) | Git, deps, structure, CUDA verification | 4 unit tests |
| 1 | [Core Transcription](docs/03-build-phases/phase-1-core-transcription.md) | Audio capture, VAD, faster-whisper engine | 15 unit + 1 integration |
| 2 | [Text Injection](docs/03-build-phases/phase-2-text-injection.md) | Clipboard paste, hotkey system, window detection | 12 unit + 1 integration |
| 3 | [UI: Tray + Overlay](docs/03-build-phases/phase-3-ui-tray-overlay.md) | System tray icon, recording overlay | 8 unit tests |
| 4 | [Settings Web UI](docs/03-build-phases/phase-4-settings-web-ui.md) | FastAPI settings page, history, Playwright tests | 15 Playwright E2E |
| 5 | [Integration & Polish](docs/03-build-phases/phase-5-integration-polish.md) | Wire everything, error handling, logging | 8 integration + 4 E2E |
| 6 | [Security](docs/03-build-phases/phase-6-security-hardening.md) | Localhost binding, input validation (deferred) | 5 unit tests |

**Total**: ~72 automated tests + 10 manual test procedures

## Documentation Map

```
C:\Projects\LocalWhisper\
|
+-- MASTER-PLAN.md                          <-- YOU ARE HERE
|
+-- docs/
|   +-- 01-research/
|   |   +-- competitive-landscape.md        # SuperWhisper, Wispr, OmniDictate analysis
|   |   +-- hardware-capabilities.md        # T1000 VRAM, model sizes, benchmarks
|   |   +-- tech-stack-decision.md          # Why Python, why faster-whisper, etc.
|   |
|   +-- 02-architecture/
|   |   +-- system-architecture.md          # Full system design, module structure
|   |   +-- configuration-schema.md         # TOML config schema
|   |
|   +-- 03-build-phases/
|   |   +-- phase-0-project-setup.md        # Git, deps, structure
|   |   +-- phase-1-core-transcription.md   # Audio, VAD, Whisper
|   |   +-- phase-2-text-injection.md       # Clipboard, hotkeys
|   |   +-- phase-3-ui-tray-overlay.md      # Tray, overlay
|   |   +-- phase-4-settings-web-ui.md      # FastAPI, Playwright
|   |   +-- phase-5-integration-polish.md   # Wire up, polish
|   |   +-- phase-6-security-hardening.md   # Security (deferred)
|   |
|   +-- 04-testing/
|   |   +-- test-strategy.md                # Test pyramid, commands, fixtures
|   |   +-- manual-test-plan.md             # 10 manual test procedures
|   |
|   +-- 05-operations/
|       +-- ralph-wiggum-loop.md            # Autonomous build protocol
|       +-- build-log.md                    # Phase completion tracking
|       +-- errors.md                       # Error log
```

## Ralph Wiggum Loop (Autonomous Build)

The app will be built autonomously using the Ralph Wiggum protocol:

1. **No questions asked** - every decision is pre-made in the phase docs
2. **Test-gated phases** - each phase must pass all tests before proceeding
3. **Auto-retry** - failures are automatically fixed (max 3 attempts)
4. **Auto-stop** - 3 identical failures = stop and log error for human
5. **Context managed** - /compact runs at ~100k tokens or after every 2 phases
6. **Hard limit** - never exceed 120k/200k context window

### To Start Building

```
Tell Claude Code:
"Execute the Ralph Wiggum loop. Start at Phase 0. Follow docs/05-operations/ralph-wiggum-loop.md.
Read each phase doc, build it, test it, log it. Don't ask questions. /compact when needed."
```

## Key Design Decisions

| Decision | Choice | Why |
|----------|--------|-----|
| Clipboard paste over keystroke simulation | Clipboard + Ctrl+V | Works in all apps, handles Unicode, fast |
| Push-to-talk default | Ctrl+Shift+Space | No conflict with common shortcuts |
| FastAPI for settings | Web UI | Playwright-testable (user requirement) |
| tkinter for overlay | Built-in | No extra deps, minimal window |
| SQLite for history | stdlib sqlite3 | Zero config, embedded, reliable |
| TOML for config | stdlib tomllib | Human-readable, Python-native |
| large-v3-turbo int8 | Default model | Best accuracy in 4GB VRAM budget |

## Performance Targets

| Metric | Target | How |
|--------|--------|-----|
| Hotkey-to-text latency | <1.5 seconds | Model pre-loaded, CUDA inference |
| Audio capture quality | 16kHz mono | Whisper's native format |
| VAD processing | <1ms per chunk | Silero VAD on CPU |
| Transcription speed | >10x real-time | CTranslate2 + CUDA |
| Memory (idle) | <500MB | Model loaded, app waiting |
| Memory (recording) | <600MB | Audio buffer + inference |
| Startup time | <10 seconds | Model lazy-load on first use |

## Sources (Research)

- [SuperWhisper](https://superwhisper.com/windows) - Commercial competitor (macOS-first)
- [Wispr Flow](https://wisprflow.ai/) - Commercial competitor (system-wide dictation)
- [OpenWhispr](https://github.com/OpenWhispr/openwhispr) - MIT, Electron+React, whisper.cpp
- [OmniDictate](https://github.com/gurjar1/OmniDictate) - Open source, Python+faster-whisper
- [faster-whisper](https://github.com/SYSTRAN/faster-whisper) - CTranslate2 Whisper engine
- [Silero VAD](https://github.com/snakers4/silero-vad) - Voice Activity Detection
- [Tom's Hardware GPU Benchmarks](https://www.tomshardware.com/news/whisper-audio-transcription-gpus-benchmarked)
- [Tauri Global Shortcuts](https://v2.tauri.app/plugin/global-shortcut/)
- [pystray Documentation](https://pystray.readthedocs.io/en/latest/usage.html)
