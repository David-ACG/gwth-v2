"""SQLite database for transcription history, settings, and custom words."""

import logging
import sqlite3
import threading
from pathlib import Path

from localwhisper.db.models import Transcription, CustomWord

logger = logging.getLogger(__name__)


class Database:
    """SQLite database manager."""

    def __init__(self, db_path: str = "./data/localwhisper.db"):
        self.db_path = db_path
        Path(db_path).parent.mkdir(parents=True, exist_ok=True)
        self._local = threading.local()
        self._init_tables()

    @property
    def _conn(self) -> sqlite3.Connection:
        if not hasattr(self._local, "conn") or self._local.conn is None:
            self._local.conn = sqlite3.connect(self.db_path, check_same_thread=False)
            self._local.conn.row_factory = sqlite3.Row
        return self._local.conn

    def _init_tables(self) -> None:
        conn = sqlite3.connect(self.db_path)
        conn.executescript("""
            CREATE TABLE IF NOT EXISTS transcriptions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                text TEXT NOT NULL,
                timestamp TEXT NOT NULL,
                duration_s REAL DEFAULT 0,
                model TEXT DEFAULT '',
                language TEXT DEFAULT '',
                confidence REAL DEFAULT 0
            );

            CREATE TABLE IF NOT EXISTS settings (
                key TEXT PRIMARY KEY,
                value TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS custom_words (
                word TEXT PRIMARY KEY,
                frequency INTEGER DEFAULT 1
            );
        """)
        conn.commit()
        conn.close()

    # --- Transcriptions ---

    def add_transcription(self, t: Transcription) -> int:
        cur = self._conn.execute(
            "INSERT INTO transcriptions (text, timestamp, duration_s, model, language, confidence) VALUES (?, ?, ?, ?, ?, ?)",
            (t.text, t.timestamp, t.duration_s, t.model, t.language, t.confidence),
        )
        self._conn.commit()
        return cur.lastrowid

    def get_transcriptions(self, limit: int = 50, offset: int = 0, search: str = "") -> list[Transcription]:
        if search:
            rows = self._conn.execute(
                "SELECT * FROM transcriptions WHERE text LIKE ? ORDER BY id DESC LIMIT ? OFFSET ?",
                (f"%{search}%", limit, offset),
            ).fetchall()
        else:
            rows = self._conn.execute(
                "SELECT * FROM transcriptions ORDER BY id DESC LIMIT ? OFFSET ?",
                (limit, offset),
            ).fetchall()
        return [Transcription(**dict(r)) for r in rows]

    def get_transcription_count(self, search: str = "") -> int:
        if search:
            row = self._conn.execute(
                "SELECT COUNT(*) FROM transcriptions WHERE text LIKE ?",
                (f"%{search}%",),
            ).fetchone()
        else:
            row = self._conn.execute("SELECT COUNT(*) FROM transcriptions").fetchone()
        return row[0]

    def delete_transcription(self, tid: int) -> bool:
        cur = self._conn.execute("DELETE FROM transcriptions WHERE id = ?", (tid,))
        self._conn.commit()
        return cur.rowcount > 0

    # --- Settings ---

    def get_setting(self, key: str, default: str = "") -> str:
        row = self._conn.execute("SELECT value FROM settings WHERE key = ?", (key,)).fetchone()
        return row[0] if row else default

    def set_setting(self, key: str, value: str) -> None:
        self._conn.execute(
            "INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)",
            (key, value),
        )
        self._conn.commit()

    # --- Custom Words ---

    def get_custom_words(self) -> list[CustomWord]:
        rows = self._conn.execute("SELECT * FROM custom_words ORDER BY word").fetchall()
        return [CustomWord(**dict(r)) for r in rows]

    def add_custom_word(self, word: str, frequency: int = 1) -> None:
        self._conn.execute(
            "INSERT OR REPLACE INTO custom_words (word, frequency) VALUES (?, ?)",
            (word, frequency),
        )
        self._conn.commit()

    def delete_custom_word(self, word: str) -> bool:
        cur = self._conn.execute("DELETE FROM custom_words WHERE word = ?", (word,))
        self._conn.commit()
        return cur.rowcount > 0

    def close(self) -> None:
        if hasattr(self._local, "conn") and self._local.conn:
            self._local.conn.close()
            self._local.conn = None
