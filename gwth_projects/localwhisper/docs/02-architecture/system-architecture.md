# System Architecture

## Date: 2026-02-14

## High-Level Architecture

```
+------------------------------------------------------------------+
|                        LocalWhisper                                |
+------------------------------------------------------------------+
|                                                                    |
|  +------------------+    +------------------+    +---------------+ |
|  | System Tray      |    | Recording Overlay|    | Settings UI   | |
|  | (pystray)        |    | (tkinter)        |    | (FastAPI)     | |
|  | - Start/Stop     |    | - Red dot pulse  |    | - Model pick  | |
|  | - Settings       |    | - "Listening..." |    | - Hotkey cfg  | |
|  | - Quit           |    | - Semi-transparent|   | - History     | |
|  +--------+---------+    +--------+---------+    | - Language    | |
|           |                       |               +-------+-------+ |
|           |                       |                       |         |
|  +--------v-----------------------v-----------------------v-------+ |
|  |                    Core Engine (Python)                        | |
|  |                                                                | |
|  |  +-------------+  +-------------+  +-----------------------+  | |
|  |  | Hotkey      |  | Audio       |  | Transcription         |  | |
|  |  | Manager     |  | Recorder    |  | Pipeline              |  | |
|  |  | (keyboard)  |  | (sounddev)  |  | (faster-whisper+VAD)  |  | |
|  |  +------+------+  +------+------+  +----------+------------+  | |
|  |         |                |                     |               | |
|  |         v                v                     v               | |
|  |  [Hotkey Event] -> [Audio Buffer] -> [Transcribed Text]       | |
|  |                                              |                 | |
|  |                                    +---------v-----------+     | |
|  |                                    | Text Injector       |     | |
|  |                                    | - Clipboard save    |     | |
|  |                                    | - Copy text         |     | |
|  |                                    | - Detect app type   |     | |
|  |                                    | - Ctrl+V / Ctrl+S+V |     | |
|  |                                    | - Clipboard restore |     | |
|  |                                    +---------------------+     | |
|  |                                                                | |
|  |  +----------------------------------------------------------+ | |
|  |  | SQLite Database                                           | | |
|  |  | - transcriptions (id, text, timestamp, duration, model)   | | |
|  |  | - settings (key, value)                                   | | |
|  |  | - custom_words (word, frequency)                          | | |
|  |  +----------------------------------------------------------+ | |
|  +----------------------------------------------------------------+ |
+------------------------------------------------------------------+
```

## Module Structure

```
C:\Projects\LocalWhisper\
|
+-- src/
|   +-- localwhisper/
|   |   +-- __init__.py              # Package init, version
|   |   +-- app.py                   # Main application entry point
|   |   +-- config.py                # Configuration management (TOML)
|   |   |
|   |   +-- core/
|   |   |   +-- __init__.py
|   |   |   +-- audio_recorder.py    # Microphone capture via sounddevice
|   |   |   +-- transcriber.py       # faster-whisper inference engine
|   |   |   +-- vad.py               # Voice Activity Detection wrapper
|   |   |   +-- text_injector.py     # Clipboard paste into active app
|   |   |   +-- hotkey_manager.py    # Global hotkey registration
|   |   |   +-- pipeline.py          # Orchestrates record->transcribe->inject
|   |   |
|   |   +-- ui/
|   |   |   +-- __init__.py
|   |   |   +-- tray.py              # System tray icon and menu
|   |   |   +-- overlay.py           # Recording indicator overlay
|   |   |
|   |   +-- web/
|   |   |   +-- __init__.py
|   |   |   +-- server.py            # FastAPI settings server
|   |   |   +-- routes.py            # API routes
|   |   |   +-- templates/
|   |   |   |   +-- base.html        # Base template
|   |   |   |   +-- settings.html    # Settings page
|   |   |   |   +-- history.html     # Transcription history
|   |   |   +-- static/
|   |   |       +-- style.css
|   |   |       +-- app.js
|   |   |
|   |   +-- db/
|   |       +-- __init__.py
|   |       +-- database.py          # SQLite connection and queries
|   |       +-- models.py            # Data models / schemas
|   |
+-- tests/
|   +-- __init__.py
|   +-- conftest.py                  # Shared fixtures
|   +-- unit/
|   |   +-- test_config.py
|   |   +-- test_audio_recorder.py
|   |   +-- test_transcriber.py
|   |   +-- test_vad.py
|   |   +-- test_text_injector.py
|   |   +-- test_hotkey_manager.py
|   |   +-- test_pipeline.py
|   |   +-- test_database.py
|   +-- integration/
|   |   +-- test_record_and_transcribe.py
|   |   +-- test_end_to_end_flow.py
|   +-- e2e/
|       +-- test_settings_ui.py      # Playwright tests
|       +-- test_tray_menu.py        # System tray tests
|       +-- test_overlay.py          # Overlay visibility tests
|
+-- config/
|   +-- default.toml                 # Default configuration
|   +-- localwhisper.toml            # User overrides (gitignored)
|
+-- assets/
|   +-- icon.ico                     # System tray icon
|   +-- icon_recording.ico           # Recording state icon
|   +-- icon.png                     # PNG version for overlay
|
+-- docs/                            # This documentation
|
+-- requirements.txt                 # Production dependencies
+-- requirements-dev.txt             # Dev/test dependencies
+-- pyproject.toml                   # Project metadata
+-- CLAUDE.md                        # Claude Code instructions
+-- README.md                        # Project readme
```

## Threading Model

```
Main Thread (tkinter event loop)
  |
  +-- Thread: System Tray (pystray) - runs in own thread
  |
  +-- Thread: Hotkey Listener (keyboard) - daemon thread
  |
  +-- Thread: Audio Recorder (sounddevice callback) - daemon thread
  |
  +-- Thread: FastAPI Server (uvicorn) - daemon thread
  |
  +-- Thread: Transcription Worker - processes audio queue
```

### Thread Communication
- `queue.Queue` for audio chunks (recorder -> transcriber)
- `threading.Event` for recording state (hotkey -> recorder)
- Callbacks for UI updates (transcriber -> overlay/tray)

## Data Flow

### Recording Flow (Push-to-Talk)
1. User presses hotkey (e.g., Ctrl+Shift+Space)
2. `hotkey_manager` fires `on_recording_start` event
3. `overlay` shows recording indicator
4. `tray` icon changes to recording state
5. `audio_recorder` begins capturing from microphone
6. Audio chunks accumulate in buffer

### Transcription Flow
1. User releases hotkey (or presses stop)
2. `audio_recorder` stops, sends complete audio to queue
3. `transcriber` picks up audio from queue
4. Silero VAD trims silence
5. faster-whisper transcribes to text
6. Text sent to `text_injector`

### Injection Flow
1. `text_injector` receives transcribed text
2. Saves current clipboard contents
3. Copies text to clipboard
4. Detects if active window is a terminal (Warp, cmd, etc.)
5. Sends Ctrl+V (or Ctrl+Shift+V for terminals)
6. Restores original clipboard
7. Saves transcription to SQLite database
8. `overlay` hides, `tray` icon returns to normal
