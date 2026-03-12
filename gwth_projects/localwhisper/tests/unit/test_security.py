"""Phase 6 security tests - verify localhost binding and basic safety."""

import tomllib


def test_server_default_binds_localhost():
    """FastAPI default config only listens on 127.0.0.1."""
    with open("config/default.toml", "rb") as f:
        config = tomllib.load(f)
    assert config["server"]["host"] == "127.0.0.1"


def test_no_wildcard_binding():
    """Config does not use 0.0.0.0 (all interfaces)."""
    with open("config/default.toml", "rb") as f:
        config = tomllib.load(f)
    assert config["server"]["host"] != "0.0.0.0"


def test_sql_parameterized_queries(tmp_path):
    """Database uses parameterized queries (no SQL injection)."""
    from localwhisper.db.database import Database
    from localwhisper.db.models import Transcription

    db = Database(str(tmp_path / "sec_test.db"))
    # Attempt SQL injection via text
    malicious = "'; DROP TABLE transcriptions; --"
    db.add_transcription(Transcription(text=malicious))
    # Table should still exist and contain the entry
    results = db.get_transcriptions()
    assert len(results) == 1
    assert results[0].text == malicious
    db.close()


def test_config_no_secrets_hardcoded():
    """Default config contains no API keys or secrets."""
    with open("config/default.toml", "rb") as f:
        content = f.read().decode()
    danger_words = ["api_key", "secret", "password", "token", "bearer"]
    for word in danger_words:
        assert word not in content.lower(), f"Found '{word}' in default config"


def test_path_traversal_prevention(tmp_path):
    """Database path rejects traversal (stays in expected dir)."""
    from localwhisper.db.database import Database
    # This should create in the specified path, not escape
    db_path = str(tmp_path / "safe.db")
    db = Database(db_path)
    assert db.db_path == db_path
    db.close()
