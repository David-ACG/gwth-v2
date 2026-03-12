# Single Prompt: Package LocalWhisper as a Windows 11 Installer (CPU-only, SenseVoice)

**Package LocalWhisper as a standalone Windows 11 installer using PyInstaller + Inno Setup. CPU-only build with SenseVoice as the default engine.**

## Goals

- Single `.exe` installer that any Windows 11 user can run
- No Python installation required
- CPU-only (no CUDA DLLs) — keeps bundle small (~500-600MB)
- SenseVoice (`iic/SenseVoiceSmall`) as default engine, faster-whisper available too
- Model downloads on first launch (not bundled)
- User data stored in `%APPDATA%\LocalWhisper\`

## Phase 1: Fix Hardcoded Relative Paths

All relative paths must work when frozen. Create a path resolver module `src/localwhisper/paths.py`:

```python
def get_app_dir() -> Path:
    """Bundled app directory (read-only assets, config defaults)."""
    if getattr(sys, 'frozen', False):
        return Path(sys._MEIPASS)
    return Path(__file__).parent.parent.parent  # repo root in dev

def get_user_dir() -> Path:
    """Writable user data directory."""
    if getattr(sys, 'frozen', False):
        return Path(os.environ["APPDATA"]) / "LocalWhisper"
    return Path(".")  # repo root in dev
```

### Files that need path fixes (use `get_app_dir()` for read-only, `get_user_dir()` for writable):

| File | Current Path | Fix |
|------|-------------|-----|
| `config.py:17` | `Path("config/default.toml")` | `get_app_dir() / "config/default.toml"` |
| `config.py:18` | `Path("config/localwhisper.toml")` | `get_user_dir() / "config/localwhisper.toml"` |
| `app.py:41` | `Path("data").mkdir(...)` | `(get_user_dir() / "data").mkdir(...)` |
| `app.py:46` | `"data/localwhisper.log"` | `get_user_dir() / "data/localwhisper.log"` |
| `ui/tray.py:17` | `ASSETS_DIR = Path("assets")` | `get_app_dir() / "assets"` |
| `web/routes.py:20` | `templates = ...("src/localwhisper/web/templates")` | Use `get_app_dir()` based path |
| `web/routes.py:45,47` | `"config/default.toml"`, `"config/localwhisper.toml"` | Use path resolver |
| `web/server.py:26` | `StaticFiles(directory="src/localwhisper/web/static")` | Use `get_app_dir()` based path |
| `default.toml:11` | `download_dir = "./models"` | Change default to `%APPDATA%\LocalWhisper\models` at runtime |
| `default.toml:55` | `path = "./data/localwhisper.db"` | Same pattern |

Also remove the CUDA DLL path setup block in `app.py` lines 16-22 (not needed for CPU-only).

**After each file change, run `python -m pytest tests/unit/ -v` to ensure nothing breaks.** Some tests reference `config/default.toml` by relative path — update fixtures as needed to use the resolver or pass explicit paths.

## Phase 2: Set CPU-Only Defaults

- In `config/default.toml`: change defaults to `engine = "sensevoice"`, `device = "cpu"`, `model = "iic/SenseVoiceSmall"`
- Keep faster-whisper profiles available but SenseVoice CPU is the default
- Install PyTorch CPU-only wheel: `pip install torch --index-url https://download.pytorch.org/whl/cpu` (saves ~2GB vs CUDA)

## Phase 3: First-Run Model Download

Create `src/localwhisper/core/model_manager.py`:

- On first launch, detect if model files exist in `get_user_dir() / "models"`
- If not, show a progress indicator (tray notification or simple tkinter dialog) while downloading
- SenseVoice `iic/SenseVoiceSmall` is ~400MB download
- Use funasr's built-in download mechanism (it caches to the specified dir)
- Block app startup until model is ready (user can't dictate without a model)

## Phase 4: PyInstaller Spec File

Create `installer/localwhisper.spec`:

```python
# Key settings:
# - console=False (no terminal window)
# - onedir mode (not onefile — faster startup, easier debugging)
# - Exclude CUDA packages (nvidia-cublas, nvidia-cudnn, etc.)
# - Include: assets/, config/default.toml, web/templates/, web/static/
# - Hidden imports: keyboard, sounddevice, pystray, uvicorn, fastapi,
#   funasr, torchaudio, scipy, librosa, soundfile
# - Exclude large unused packages: matplotlib, IPython, notebook
```

Bundle these as data files in the spec:
```
datas=[
    ('assets', 'assets'),
    ('config/default.toml', 'config'),
    ('src/localwhisper/web/templates', 'localwhisper/web/templates'),
    ('src/localwhisper/web/static', 'localwhisper/web/static'),
]
```

Exclude these to reduce size:
```
excludes=['matplotlib', 'IPython', 'notebook', 'tensorboard',
          'nvidia', 'triton', 'torch.distributed']
```

Build command: `pyinstaller installer/localwhisper.spec`

Test the frozen build: run `dist/localwhisper/localwhisper.exe` and verify:
1. Tray icon appears
2. Settings UI opens at 127.0.0.1:9876
3. Model downloads on first launch
4. Dictation works (press hotkey, speak, text appears)

## Phase 5: Inno Setup Installer

Create `installer/localwhisper.iss`:

- **Source:** `dist/localwhisper/*` from PyInstaller output
- **Install to:** `{autopf}\LocalWhisper` (Program Files)
- **Create:** `%APPDATA%\LocalWhisper\config\`, `%APPDATA%\LocalWhisper\data\`, `%APPDATA%\LocalWhisper\models\`
- **Start Menu shortcut:** `LocalWhisper`
- **Desktop shortcut:** optional (checkbox during install)
- **Run at startup:** optional registry key `HKCU\Software\Microsoft\Windows\CurrentVersion\Run`
- **Uninstaller:** standard Inno Setup uninstall, with option to remove `%APPDATA%\LocalWhisper` (user data + models)
- **Minimum Windows version:** Windows 10 (64-bit)
- **Installer icon:** `assets/icon_idle.ico`

Build: `iscc installer/localwhisper.iss` → produces `LocalWhisper-Setup-0.1.0.exe`

## Phase 6: Test the Installer

1. Build PyInstaller: `pyinstaller installer/localwhisper.spec`
2. Build Inno Setup: `iscc installer/localwhisper.iss`
3. Install on a clean Windows 11 VM or separate user account
4. Verify: installs, starts, downloads model, tray icon works, dictation works, settings UI works, uninstaller works

## File Summary

### New files to create:
- `src/localwhisper/paths.py` — frozen-aware path resolver
- `src/localwhisper/core/model_manager.py` — first-run model download
- `installer/localwhisper.spec` — PyInstaller spec
- `installer/localwhisper.iss` — Inno Setup script
- `tests/unit/test_paths.py` — path resolver tests

### Files to modify:
- `src/localwhisper/config.py` — use path resolver
- `src/localwhisper/app.py` — use path resolver, remove CUDA DLL block
- `src/localwhisper/ui/tray.py` — use path resolver for assets
- `src/localwhisper/web/routes.py` — use path resolver for templates/config
- `src/localwhisper/web/server.py` — use path resolver for static files
- `config/default.toml` — CPU + SenseVoice defaults

### Dependencies to add:
- `pyinstaller` (dev dependency only)
- Inno Setup 6 installed on build machine (not a Python dep)
