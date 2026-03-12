# Phase 0: Project Setup

## Goal
Initialize the project with all boilerplate, dependencies, and CI scaffolding.

## Duration Estimate: Short

## Tasks

### 0.1 Initialize Git Repository
- `git init`
- Create `.gitignore` (Python, models, data, .env, __pycache__, etc.)
- Create initial commit

### 0.2 Create Project Structure
- Create all directories from architecture doc
- Create empty `__init__.py` files
- Create `pyproject.toml` with metadata

### 0.3 Create Requirements Files
- `requirements.txt` - production deps
- `requirements-dev.txt` - test/dev deps (includes requirements.txt)

### 0.4 Create Default Configuration
- `config/default.toml` from configuration schema doc

### 0.5 Create CLAUDE.md
- Project-specific Claude Code instructions
- Test commands
- Architecture reference

### 0.6 Create Assets
- Generate simple tray icons (colored circles: green=idle, red=recording)
- PNG and ICO formats

### 0.7 Install Dependencies
- Create virtual environment: `python -m venv .venv`
- Install all requirements
- Verify CUDA availability: `python -c "import torch; print(torch.cuda.is_available())"`
- Install Playwright browsers: `playwright install chromium`

## Acceptance Criteria (Tests)

```python
# tests/unit/test_setup.py - run to verify Phase 0

def test_project_structure_exists():
    """All required directories exist."""
    dirs = ["src/localwhisper", "src/localwhisper/core", "src/localwhisper/ui",
            "src/localwhisper/web", "src/localwhisper/db", "tests", "config", "assets"]
    for d in dirs:
        assert Path(d).is_dir(), f"Missing directory: {d}"

def test_config_loads():
    """Default config is valid TOML."""
    import tomllib
    with open("config/default.toml", "rb") as f:
        config = tomllib.load(f)
    assert config["model"]["name"] == "large-v3-turbo"

def test_cuda_available():
    """GPU is accessible."""
    import torch
    assert torch.cuda.is_available(), "CUDA not available"

def test_faster_whisper_importable():
    """faster-whisper library loads."""
    from faster_whisper import WhisperModel
    assert WhisperModel is not None
```

## Ralph Wiggum Gate
- ALL tests pass -> proceed to Phase 1
- Any test fails -> fix and re-run (max 3 attempts)
- After 3 failures -> STOP and write error to `docs/05-operations/errors.md`
