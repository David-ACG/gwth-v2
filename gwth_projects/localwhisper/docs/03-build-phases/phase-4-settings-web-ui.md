# Phase 4: Settings Web UI (FastAPI + Playwright Tests)

## Goal
Build the web-based settings interface served by FastAPI, testable with Playwright.

## Dependencies
- Phase 3 complete (tray and overlay work)

## Tasks

### 4.1 Database Layer (`src/localwhisper/db/`)
- **database.py**: SQLite connection manager
  - Create tables on first run
  - Thread-safe connection (check_same_thread=False)
  - Context manager pattern
- **models.py**: Pydantic models for data
  - `Transcription(id, text, timestamp, duration_s, model, language, confidence)`
  - `Settings(key, value)` for runtime settings
  - `CustomWord(word, frequency)` for dictionary

### 4.2 FastAPI Server (`src/localwhisper/web/server.py`)
- Run uvicorn in a daemon thread
- Bind to 127.0.0.1:9876 (localhost only)
- Serve Jinja2 templates
- Serve static files (CSS, JS)
- CORS not needed (same-origin)

### 4.3 API Routes (`src/localwhisper/web/routes.py`)

#### Pages (HTML)
- `GET /` -> Settings page
- `GET /history` -> Transcription history with search
- `GET /health` -> Health check JSON

#### API Endpoints (JSON)
- `GET /api/settings` -> Current settings
- `PUT /api/settings` -> Update settings
- `GET /api/history` -> Transcription history (paginated)
- `DELETE /api/history/{id}` -> Delete a transcription
- `GET /api/models` -> Available Whisper models
- `POST /api/models/download` -> Download a model
- `GET /api/status` -> Current app status (idle/recording/etc.)
- `GET /api/devices` -> List audio input devices
- `POST /api/test-microphone` -> Record 2s test clip
- `GET /api/custom-words` -> Custom word list
- `POST /api/custom-words` -> Add custom word
- `DELETE /api/custom-words/{word}` -> Remove custom word

### 4.4 Templates

#### base.html
- Clean, minimal dark-theme design
- HTMX for dynamic updates (no heavy JS framework)
- Responsive layout
- Navigation: Settings | History

#### settings.html
- Model selection dropdown (with current model highlighted)
- Hotkey configuration input
- Hotkey mode toggle (push-to-talk / toggle)
- Language selector
- Audio device selector
- VAD threshold slider
- Overlay toggle and position
- Test microphone button
- Custom words section
- Save button

#### history.html
- Table of past transcriptions
- Columns: Timestamp, Text (truncated), Duration, Model, Language
- Search/filter box
- Click to expand full text
- Delete button per entry
- Pagination

### 4.5 Static Files
- `style.css` - Dark theme, minimal CSS
- `app.js` - HTMX setup, toast notifications, microphone test

## Acceptance Criteria (Playwright Tests)

```python
# tests/e2e/test_settings_ui.py
import pytest
from playwright.sync_api import Page, expect

@pytest.fixture
def settings_page(page: Page):
    """Navigate to settings UI."""
    page.goto("http://127.0.0.1:9876/")
    return page

def test_settings_page_loads(settings_page):
    """Settings page loads without errors."""
    expect(settings_page).to_have_title("LocalWhisper Settings")

def test_model_dropdown_visible(settings_page):
    """Model selection dropdown is visible."""
    expect(settings_page.locator("select#model")).to_be_visible()

def test_hotkey_input_visible(settings_page):
    """Hotkey input field is visible."""
    expect(settings_page.locator("input#hotkey")).to_be_visible()

def test_change_model(settings_page):
    """Can change model selection."""
    settings_page.select_option("select#model", "small")
    settings_page.click("button#save-settings")
    expect(settings_page.locator(".toast-success")).to_be_visible()

def test_history_page_loads(settings_page):
    """Can navigate to history page."""
    settings_page.click("a[href='/history']")
    expect(settings_page).to_have_url("http://127.0.0.1:9876/history")

def test_history_shows_entries(page: Page):
    """History page shows transcription entries."""
    # First, add a test transcription via API
    page.goto("http://127.0.0.1:9876/history")
    # Verify table exists
    expect(page.locator("table#history-table")).to_be_visible()

def test_health_endpoint(page: Page):
    """Health endpoint returns OK."""
    response = page.goto("http://127.0.0.1:9876/health")
    assert response.status == 200

def test_api_settings_get(page: Page):
    """API returns current settings."""
    response = page.goto("http://127.0.0.1:9876/api/settings")
    assert response.status == 200

def test_api_status(page: Page):
    """Status API returns current state."""
    response = page.goto("http://127.0.0.1:9876/api/status")
    assert response.status == 200

def test_audio_device_list(settings_page):
    """Audio device dropdown has at least one option."""
    options = settings_page.locator("select#audio-device option").count()
    assert options >= 1

def test_custom_words_add(settings_page):
    """Can add a custom word."""
    settings_page.fill("input#new-word", "Qdrant")
    settings_page.click("button#add-word")
    expect(settings_page.locator("text=Qdrant")).to_be_visible()

def test_custom_words_delete(settings_page):
    """Can delete a custom word."""
    # Add then delete
    settings_page.fill("input#new-word", "TestWord")
    settings_page.click("button#add-word")
    settings_page.click("button.delete-word[data-word='TestWord']")
    expect(settings_page.locator("text=TestWord")).not_to_be_visible()

def test_responsive_layout(page: Page):
    """Settings page works on narrow viewport."""
    page.set_viewport_size({"width": 480, "height": 800})
    page.goto("http://127.0.0.1:9876/")
    expect(page.locator("select#model")).to_be_visible()

def test_save_persists_on_reload(settings_page):
    """Changed settings persist after page reload."""
    settings_page.select_option("select#model", "small")
    settings_page.click("button#save-settings")
    settings_page.reload()
    expect(settings_page.locator("select#model")).to_have_value("small")
```

## Ralph Wiggum Gate
- FastAPI starts and serves settings page -> pass
- ALL Playwright tests pass -> proceed to Phase 5
- API endpoints return correct data -> pass
- After 3 failures -> STOP and log

## Context Window Management
- Run `/compact` after this phase (lots of HTML/template code)
