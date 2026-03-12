"""E2E test fixtures - starts FastAPI server for Playwright tests."""

import time
import threading
import pytest
import httpx

from localwhisper.db.database import Database
from localwhisper.web.server import SettingsServer


@pytest.fixture(scope="session")
def test_db(tmp_path_factory):
    """Session-scoped test database."""
    db_path = str(tmp_path_factory.mktemp("data") / "test_e2e.db")
    db = Database(db_path)
    # Seed some test data
    from localwhisper.db.models import Transcription
    for i in range(5):
        db.add_transcription(Transcription(
            text=f"Test transcription number {i + 1}",
            duration_s=1.0 + i * 0.5,
            model="tiny",
            language="en",
            confidence=0.95,
        ))
    db.add_custom_word("TestWord")
    yield db
    db.close()


@pytest.fixture(scope="session")
def app_server(test_db):
    """Start the settings server for the entire test session."""
    server = SettingsServer(
        host="127.0.0.1",
        port=19876,  # Different port for tests
        db=test_db,
        app_status={"state": "idle", "model": "tiny"},
    )
    server.start()
    # Wait for server to be ready
    for _ in range(30):
        try:
            r = httpx.get("http://127.0.0.1:19876/health", timeout=1.0)
            if r.status_code == 200:
                break
        except Exception:
            pass
        time.sleep(0.2)
    yield server
    server.stop()


@pytest.fixture(scope="session")
def base_url(app_server):
    """Base URL for tests."""
    return "http://127.0.0.1:19876"
