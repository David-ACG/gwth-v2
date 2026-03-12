"""FastAPI server for the settings web UI."""

import logging
import threading
from pathlib import Path

import uvicorn
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

from localwhisper.db.database import Database
from localwhisper.web.routes import router, set_db, set_app_status, set_restart_callback

logger = logging.getLogger(__name__)


def create_app(db: Database | None = None, app_status: dict | None = None,
               restart_callback=None) -> FastAPI:
    """Create the FastAPI application."""
    app = FastAPI(title="LocalWhisper Settings", docs_url=None, redoc_url=None)

    if db:
        set_db(db)
    if app_status:
        set_app_status(app_status)
    if restart_callback:
        set_restart_callback(restart_callback)

    app.include_router(router)
    static_dir = Path(__file__).parent / "static"
    app.mount("/static", StaticFiles(directory=str(static_dir)), name="static")

    return app


class SettingsServer:
    """Runs the FastAPI settings server in a background thread."""

    def __init__(
        self,
        host: str = "127.0.0.1",
        port: int = 9876,
        db: Database | None = None,
        app_status: dict | None = None,
        restart_callback=None,
    ):
        self.host = host
        self.port = port
        self._db = db
        self._app_status = app_status or {"state": "idle", "model": "loading..."}
        self._restart_callback = restart_callback
        self._server: uvicorn.Server | None = None
        self._thread: threading.Thread | None = None

    def start(self) -> None:
        """Start the server in a background thread."""
        app = create_app(self._db, self._app_status, self._restart_callback)
        config = uvicorn.Config(
            app, host=self.host, port=self.port,
            log_level="warning", log_config=None,
        )
        self._server = uvicorn.Server(config)
        self._thread = threading.Thread(
            target=self._server.run, daemon=True, name="settings-server"
        )
        self._thread.start()
        logger.info("Settings server started on http://%s:%d", self.host, self.port)

    def stop(self) -> None:
        """Stop the server."""
        if self._server:
            self._server.should_exit = True
            logger.info("Settings server stopped.")

    @property
    def url(self) -> str:
        return f"http://{self.host}:{self.port}"
