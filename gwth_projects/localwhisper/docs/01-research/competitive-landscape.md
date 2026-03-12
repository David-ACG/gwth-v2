# Competitive Landscape Research

## Date: 2026-02-14

## Commercial Products

### SuperWhisper (superwhisper.com)
- **Platform**: macOS-first, Windows version available
- **Model**: Uses OpenAI Whisper locally
- **Key Features**: System-wide dictation, AI-powered text cleanup, global hotkey
- **Pricing**: Paid subscription
- **Limitation**: Closed source, requires internet for some features

### Wispr Flow (wisprflow.ai)
- **Platform**: macOS, Windows, iOS, Android (waitlist)
- **Speed**: ~220 WPM (4x faster than typing at 45 WPM)
- **Key Features**:
  - AI Auto-Edits (transforms rambled thoughts into formatted text)
  - Personal Dictionary (learns user-specific words)
  - Snippet Library (voice shortcuts for templates)
  - Tone Adaptation (adjusts style per application)
  - 100+ language support with auto-detection
- **Integration**: System-wide across 40+ apps (Gmail, Slack, VS Code, Notion, ChatGPT)
- **Limitation**: Closed source, subscription model

## Open Source Alternatives

### OpenWhispr (github.com/OpenWhispr/openwhispr)
- **Stack**: Electron 36 + React 19 + TypeScript + Tailwind CSS v4
- **Speech**: whisper.cpp (local) or NVIDIA Parakeet (sherpa-onnx) or cloud APIs
- **Text Injection**: Native C binary (`windows-fast-paste`) using Win32 SendInput API
- **Global Hotkey**: Low-level keyboard hook with compound hotkey support
- **Database**: better-sqlite3 for local transcription history
- **Architecture**: Two-window design (minimal overlay + full control panel)
- **License**: MIT
- **Pros**: Full-featured, multi-platform, well-architected
- **Cons**: Heavy Electron overhead (~200MB+ RAM), complex build

### OmniDictate (github.com/gurjar1/OmniDictate)
- **Stack**: Pure Python + PyQt5 + faster-whisper
- **Speech**: faster-whisper with CUDA GPU acceleration
- **Text Injection**: pynput (simulates keyboard input into active window)
- **Global Hotkey**: Push-to-talk via hotkey_listener.py
- **VAD**: Built-in voice activity detection
- **Size**: ~4.5GB including model weights + embedded Python
- **License**: Open source
- **Pros**: Simple, Python-native, works well
- **Cons**: Large bundle, PyQt5 (aging), basic UI

### Other Notable Projects
- **WhisperTyping** (whispertyping.com) - Windows 10/11 dictation
- **winWhisper** (winwhisper.app) - One-click recording, global hotkeys
- **WhisperWriter** (github discussion) - Simple dictation tool
- **Handy** (github.com/cjpais/Handy) - Tauri-based, offline-first

## Key Takeaways for LocalWhisper

1. **Pure Python is viable** - OmniDictate proves this works well
2. **faster-whisper is the engine of choice** - CTranslate2 backend, best perf/VRAM ratio
3. **Clipboard paste is most reliable** for text injection across all apps
4. **Silero VAD is standard** - Built into faster-whisper, <1ms per chunk
5. **System tray + global hotkey** is the expected UX pattern
6. **int8 quantization** enables large models on 4GB VRAM
