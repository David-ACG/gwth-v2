"""Tests for SQLite database layer."""

import pytest
from localwhisper.db.database import Database
from localwhisper.db.models import Transcription


@pytest.fixture
def db(tmp_path):
    """Fresh database for each test."""
    d = Database(str(tmp_path / "test.db"))
    yield d
    d.close()


def test_db_creates_tables(db):
    """Database creates all required tables."""
    tables = db._conn.execute(
        "SELECT name FROM sqlite_master WHERE type='table'"
    ).fetchall()
    names = {r[0] for r in tables}
    assert "transcriptions" in names
    assert "settings" in names
    assert "custom_words" in names


def test_add_transcription(db):
    """Can add a transcription."""
    t = Transcription(text="hello world", duration_s=1.5, model="tiny", language="en")
    tid = db.add_transcription(t)
    assert tid > 0


def test_get_transcriptions(db):
    """Can retrieve transcriptions."""
    db.add_transcription(Transcription(text="first"))
    db.add_transcription(Transcription(text="second"))
    results = db.get_transcriptions()
    assert len(results) == 2
    # Most recent first
    assert results[0].text == "second"


def test_delete_transcription(db):
    """Can delete a transcription."""
    tid = db.add_transcription(Transcription(text="to delete"))
    assert db.delete_transcription(tid) is True
    assert db.get_transcription_count() == 0


def test_search_transcriptions(db):
    """Can search transcriptions by text."""
    db.add_transcription(Transcription(text="hello world"))
    db.add_transcription(Transcription(text="goodbye world"))
    db.add_transcription(Transcription(text="hello there"))
    results = db.get_transcriptions(search="hello")
    assert len(results) == 2


def test_transcription_count(db):
    """Count returns correct number."""
    db.add_transcription(Transcription(text="one"))
    db.add_transcription(Transcription(text="two"))
    assert db.get_transcription_count() == 2


def test_settings(db):
    """Can get and set settings."""
    db.set_setting("theme", "dark")
    assert db.get_setting("theme") == "dark"
    assert db.get_setting("nonexistent", "fallback") == "fallback"


def test_custom_words(db):
    """Can add, get, and delete custom words."""
    db.add_custom_word("Qdrant")
    db.add_custom_word("FastAPI")
    words = db.get_custom_words()
    assert len(words) == 2
    names = [w.word for w in words]
    assert "FastAPI" in names
    assert "Qdrant" in names

    assert db.delete_custom_word("Qdrant") is True
    assert len(db.get_custom_words()) == 1


def test_pagination(db):
    """Pagination works correctly."""
    for i in range(25):
        db.add_transcription(Transcription(text=f"entry {i}"))

    page1 = db.get_transcriptions(limit=10, offset=0)
    page2 = db.get_transcriptions(limit=10, offset=10)
    page3 = db.get_transcriptions(limit=10, offset=20)

    assert len(page1) == 10
    assert len(page2) == 10
    assert len(page3) == 5
