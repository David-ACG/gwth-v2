"""Playwright E2E tests for the Settings Web UI."""

import pytest
from playwright.sync_api import sync_playwright, Page, expect


@pytest.fixture(scope="module")
def browser():
    """Launch browser for test module."""
    with sync_playwright() as p:
        b = p.chromium.launch(headless=True)
        yield b
        b.close()


@pytest.fixture
def page(browser, app_server, base_url):
    """Fresh page for each test."""
    context = browser.new_context(viewport={"width": 1280, "height": 720})
    page = context.new_page()
    yield page
    page.close()
    context.close()


def test_settings_page_loads(page, base_url):
    """Settings page loads without errors."""
    page.goto(base_url)
    expect(page).to_have_title("LocalWhisper Settings")


def test_model_dropdown_visible(page, base_url):
    """Model selection dropdown is visible."""
    page.goto(base_url)
    expect(page.locator("select#model")).to_be_visible()


def test_hotkey_input_visible(page, base_url):
    """Hotkey input field is visible."""
    page.goto(base_url)
    expect(page.locator("input#hotkey")).to_be_visible()


def test_model_options_present(page, base_url):
    """Model dropdown has expected options."""
    page.goto(base_url)
    options = page.locator("select#model option").all_text_contents()
    assert "tiny" in options
    assert "large-v3-turbo" in options


def test_health_endpoint(page, base_url):
    """Health endpoint returns OK."""
    resp = page.goto(f"{base_url}/health")
    assert resp.status == 200


def test_api_settings_get(page, base_url):
    """API returns current settings."""
    resp = page.goto(f"{base_url}/api/settings")
    assert resp.status == 200


def test_api_status(page, base_url):
    """Status API returns current state."""
    resp = page.goto(f"{base_url}/api/status")
    assert resp.status == 200


def test_history_page_loads(page, base_url):
    """Can navigate to history page."""
    page.goto(base_url)
    page.click("a[href='/history']")
    expect(page).to_have_url(f"{base_url}/history")


def test_history_shows_table(page, base_url):
    """History page shows transcription table."""
    page.goto(f"{base_url}/history")
    expect(page.locator("table#history-table")).to_be_visible()


def test_history_has_entries(page, base_url):
    """History page shows seeded test entries."""
    page.goto(f"{base_url}/history")
    rows = page.locator("table#history-table tbody tr")
    assert rows.count() >= 1


def test_audio_device_list(page, base_url):
    """Audio device dropdown has at least default option."""
    page.goto(base_url)
    options = page.locator("select#audio-device option").count()
    assert options >= 1  # At least "Default"


def test_api_models(page, base_url):
    """Models API returns model list."""
    resp = page.goto(f"{base_url}/api/models")
    assert resp.status == 200


def test_api_devices(page, base_url):
    """Devices API returns device list."""
    resp = page.goto(f"{base_url}/api/devices")
    assert resp.status == 200


def test_responsive_layout(page, base_url):
    """Settings page works on narrow viewport."""
    page.set_viewport_size({"width": 480, "height": 800})
    page.goto(base_url)
    expect(page.locator("select#model")).to_be_visible()


def test_nav_links_present(page, base_url):
    """Navigation has Settings and History links."""
    page.goto(base_url)
    expect(page.locator("a[href='/']")).to_be_visible()
    expect(page.locator("a[href='/history']")).to_be_visible()
