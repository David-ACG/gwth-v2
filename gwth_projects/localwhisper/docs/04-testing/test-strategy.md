# Test Strategy

## Date: 2026-02-14

## Testing Pyramid

```
         /  E2E (Playwright)  \        <- 15 tests
        /   Integration Tests   \      <- 10 tests
       /     Unit Tests           \    <- 40+ tests
      /__________________________ _\
```

## Test Categories

### Unit Tests (`tests/unit/`)
- **Runner**: pytest
- **Scope**: Individual functions and classes
- **Mocking**: Mock hardware (microphone, clipboard, GPU)
- **Speed**: Fast (<5 seconds total)
- **Coverage target**: 80%+

### Integration Tests (`tests/integration/`)
- **Runner**: pytest with markers
- **Scope**: Multiple components working together
- **Requirements**: May need microphone, GPU
- **Markers**: `@pytest.mark.integration`, `@pytest.mark.gpu`, `@pytest.mark.mic`
- **Speed**: Medium (<30 seconds)

### E2E Tests (`tests/e2e/`)
- **Runner**: pytest + Playwright
- **Scope**: Full application via Settings Web UI
- **Requirements**: Running LocalWhisper instance
- **Setup**: Start app as subprocess, wait for health check
- **Speed**: Slow (<60 seconds)

## Test Commands

```bash
# All unit tests (fast, no hardware needed)
pytest tests/unit/ -v

# Unit tests with coverage
pytest tests/unit/ --cov=src/localwhisper --cov-report=html

# Integration tests (need hardware)
pytest tests/integration/ -v -m "not mic"  # skip mic tests
pytest tests/integration/ -v               # all integration tests

# E2E Playwright tests (need running app)
pytest tests/e2e/ -v

# All tests
pytest tests/ -v

# Quick smoke test (just check nothing is broken)
pytest tests/unit/ -x -q
```

## Test Fixtures (conftest.py)

```python
# tests/conftest.py

@pytest.fixture
def config():
    """Test configuration with safe defaults."""

@pytest.fixture
def db(tmp_path):
    """Temporary SQLite database."""

@pytest.fixture
def mock_audio():
    """Pre-recorded audio fixtures."""

@pytest.fixture
def transcriber(config):
    """Initialized transcriber (loads model once per session)."""

@pytest.fixture
def injector():
    """Text injector with mocked clipboard."""

@pytest.fixture
def app_server():
    """Start FastAPI in background, yield, stop on teardown."""

@pytest.fixture
def page(app_server):
    """Playwright page connected to running app."""
```

## Test Data

### Audio Fixtures (`tests/fixtures/`)
| File | Content | Duration | Purpose |
|------|---------|----------|---------|
| `hello_world.wav` | "Hello, world" | 2s | Basic transcription test |
| `silence.wav` | Silence | 2s | VAD silence detection |
| `mixed.wav` | Speech + silence | 5s | VAD segmentation |
| `numbers.wav` | "One two three" | 2s | Simple number test |
| `long_sentence.wav` | 30 words | 10s | Longer transcription |

**Generation**: Create programmatically using `pyttsx3` (Windows TTS) in a setup script,
or use pre-recorded WAV files. If TTS not available, generate synthetic speech-like audio
with numpy (sine waves at speech frequencies won't transcribe but will test audio pipeline).

## Playwright Test Configuration

```python
# tests/e2e/conftest.py
import pytest
from playwright.sync_api import Playwright

@pytest.fixture(scope="session")
def browser_context(playwright: Playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context(
        viewport={"width": 1280, "height": 720}
    )
    yield context
    context.close()
    browser.close()

@pytest.fixture
def page(browser_context):
    page = browser_context.new_page()
    yield page
    page.close()
```

## CI / Local Run Matrix

| Test Suite | Local Dev | Pre-Commit | CI (if added) |
|-----------|-----------|------------|---------------|
| Unit | Always | Always | Always |
| Integration (no mic) | Always | Skip | Always |
| Integration (mic) | Manual | Skip | Skip |
| E2E (Playwright) | Always | Skip | Always |
| Security | Manual | Skip | Always |

## Coverage Reports

```bash
# Generate HTML coverage report
pytest tests/unit/ --cov=src/localwhisper --cov-report=html --cov-report=term

# Open coverage report
start htmlcov/index.html
```
