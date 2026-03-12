# Technology Stack Decision

## Date: 2026-02-14

## Decision: Pure Python + FastAPI Settings UI

### Why Not Electron?
- Heavy memory overhead (~200MB+ just for Electron)
- Unnecessary complexity for a personal tool
- Slower startup time
- OpenWhispr already exists if we wanted Electron

### Why Not Tauri?
- Requires Rust toolchain setup
- More complex build pipeline
- Overkill for personal use

### Why Pure Python?
- faster-whisper is Python-native (no bridge needed)
- OmniDictate proves this architecture works
- Single language for entire stack
- Easy to iterate and modify
- Lightweight resource usage
- Python has excellent Windows automation libraries

### Why FastAPI for Settings UI?
- Playwright can test web UIs natively (user requirement)
- Modern, fast, async Python web framework
- Serves a local web page for settings/history
- Opens in default browser on demand
- No additional runtime (unlike Electron's Chromium)

## Final Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Speech Engine** | faster-whisper + CTranslate2 | Whisper model inference with CUDA |
| **VAD** | Silero VAD (via faster-whisper) | Detect speech segments |
| **Audio Capture** | sounddevice | Record from microphone |
| **Global Hotkey** | keyboard (library) | System-wide hotkey detection |
| **Text Injection** | clipboard + win32 SendInput | Paste transcribed text into active app |
| **System Tray** | pystray + Pillow | Tray icon with menu |
| **Overlay** | tkinter (TopLevel, overrideredirect) | Transparent recording indicator |
| **Settings UI** | FastAPI + Jinja2 + HTMX | Web-based settings (Playwright-testable) |
| **Database** | SQLite (via sqlite3 stdlib) | Transcription history, settings |
| **Config** | TOML (tomllib stdlib) | User configuration file |
| **Testing** | pytest + Playwright + coverage | Full test suite |
| **Packaging** | PyInstaller (future) | Single executable distribution |

## Key Libraries (requirements.txt preview)

```
faster-whisper>=1.1.0
sounddevice>=0.5.0
keyboard>=0.13.5
pystray>=0.19.5
Pillow>=10.0.0
pyperclip>=1.9.0
pynput>=1.7.7
fastapi>=0.115.0
uvicorn>=0.32.0
jinja2>=3.1.0
python-multipart>=0.0.18
httpx>=0.28.0
pytest>=8.0.0
pytest-asyncio>=0.24.0
playwright>=1.49.0
```

## Text Injection Strategy

### Primary Method: Clipboard Paste
1. Save current clipboard contents
2. Copy transcribed text to clipboard
3. Simulate Ctrl+V (or Ctrl+Shift+V for terminals)
4. Restore original clipboard contents

### Why Clipboard Over Key-by-Key?
- **Speed**: Instant paste vs. character-by-character delay
- **Unicode**: Full Unicode support (emojis, accented chars)
- **Reliability**: Works in Notion, Warp, VS Code, all apps
- **Terminal**: Warp uses Ctrl+Shift+V (detectable via window class)

### Terminal Detection
```python
# Detect terminal emulators for Ctrl+Shift+V
TERMINAL_CLASSES = ["WarpTerminal", "ConsoleWindowClass", "CASCADIA_HOSTING_WINDOW_CLASS"]
```

## Architecture Diagram

```
[Global Hotkey] --> [Audio Recorder] --> [Silero VAD] --> [faster-whisper]
                                                                |
                                                          [Transcribed Text]
                                                                |
                                                    [Text Injector (Clipboard)]
                                                                |
                                                    [Active Window (any app)]

[System Tray] <--> [Settings UI (FastAPI)]
      |
[Recording Overlay (tkinter)]
```
