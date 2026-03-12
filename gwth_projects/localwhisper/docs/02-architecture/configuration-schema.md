# Configuration Schema

## Date: 2026-02-14

## File: config/default.toml

```toml
[general]
language = "en"                    # Primary language (ISO 639-1)
auto_detect_language = false       # Let Whisper auto-detect
theme = "dark"                     # "dark" or "light"

[model]
name = "large-v3-turbo"            # Whisper model name
compute_type = "int8"              # "float16", "int8", "int8_float16"
device = "cuda"                    # "cuda" or "cpu"
download_dir = "./models"          # Where to store model files

[audio]
sample_rate = 16000                # 16kHz for Whisper
channels = 1                      # Mono
device_index = -1                  # -1 = default microphone
chunk_duration_ms = 30             # Audio chunk size for VAD

[vad]
enabled = true                     # Use Silero VAD
threshold = 0.5                    # Speech probability threshold
min_speech_duration_ms = 250       # Minimum speech segment
max_speech_duration_s = 30         # Maximum single dictation
min_silence_duration_ms = 500      # Silence before end of speech

[hotkey]
push_to_talk = "ctrl+shift+space"  # Hold to record
toggle_record = "ctrl+shift+r"     # Press to start/stop
mode = "push_to_talk"              # "push_to_talk" or "toggle"

[injection]
method = "clipboard"               # "clipboard" (only method for now)
restore_clipboard = true           # Restore clipboard after paste
paste_delay_ms = 50                # Delay before paste keystroke
terminal_classes = [               # Window classes that need Ctrl+Shift+V
    "WarpTerminal",
    "ConsoleWindowClass",
    "CASCADIA_HOSTING_WINDOW_CLASS",
    "mintty",
    "VirtualConsoleClass",
]

[overlay]
enabled = true                     # Show recording overlay
position = "top-center"            # "top-center", "top-right", "bottom-right"
opacity = 0.85                     # Overlay transparency
size = 48                          # Overlay size in pixels

[server]
host = "127.0.0.1"                 # Settings UI host (localhost only)
port = 9876                        # Settings UI port
auto_open_browser = true           # Open settings in browser on first run

[database]
path = "./data/localwhisper.db"    # SQLite database path
max_history = 10000                # Maximum transcriptions to keep

[custom_words]
# Words to boost in transcription (name = boost_weight)
# Example: "Qdrant" = 1.5
```

## Environment Variables (override TOML)

```
LOCALWHISPER_MODEL=large-v3-turbo
LOCALWHISPER_DEVICE=cuda
LOCALWHISPER_HOTKEY=ctrl+shift+space
LOCALWHISPER_PORT=9876
```

## Config Loading Priority

1. `config/default.toml` (shipped defaults)
2. `config/localwhisper.toml` (user overrides, gitignored)
3. Environment variables (highest priority)
