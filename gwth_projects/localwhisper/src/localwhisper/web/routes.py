"""FastAPI routes for settings UI and API."""

import json
import tomllib
from pathlib import Path

from fastapi import APIRouter, Request, Form
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.templating import Jinja2Templates

from localwhisper.core.engine import (
    DEFAULT_ENGINE,
    get_available_engines,
    get_engine_models,
)
from localwhisper.db.database import Database
from localwhisper.db.models import Transcription
from localwhisper.paths import get_app_dir, get_user_dir

router = APIRouter()
_WEB_DIR = Path(__file__).parent
templates = Jinja2Templates(directory=str(_WEB_DIR / "templates"))

# These will be set by the server on startup
_db: Database | None = None
_app_status: dict = {"state": "idle", "model": "loading..."}
_restart_callback = None


def set_db(db: Database) -> None:
    global _db
    _db = db


def set_app_status(status: dict) -> None:
    global _app_status
    _app_status = status


def set_restart_callback(cb) -> None:
    global _restart_callback
    _restart_callback = cb


def _get_db() -> Database:
    global _db
    if _db is None:
        _db = Database()
    return _db


def _load_config() -> dict:
    with open(get_app_dir() / "config" / "default.toml", "rb") as f:
        config = tomllib.load(f)
    user_path = get_user_dir() / "config" / "localwhisper.toml"
    if user_path.exists():
        with open(user_path, "rb") as f:
            import tomllib as tl
            user = tl.load(f)
        # simple shallow merge
        for section, values in user.items():
            if section in config and isinstance(config[section], dict):
                config[section].update(values)
            else:
                config[section] = values
    return config


# --- HTML Pages ---

@router.get("/", response_class=HTMLResponse)
async def settings_page(request: Request):
    config = _load_config()
    db = _get_db()
    words = db.get_custom_words()
    import sounddevice as sd
    devices = []
    default_idx = sd.default.device[0]
    for i, dev in enumerate(sd.query_devices()):
        if dev["max_input_channels"] > 0:
            label = f"{dev['name']} ({dev['max_input_channels']}ch, {int(dev['default_samplerate'])}Hz)"
            if i == default_idx:
                label += " [System Default]"
            devices.append({"index": i, "name": label})
    current_device = config.get("audio", {}).get("device_index", -1)
    profiles = config.get("profiles", {})
    current_engine = config.get("model", {}).get("engine", DEFAULT_ENGINE)
    engines = get_available_engines()
    engine_models = {e: get_engine_models(e) for e in engines}
    return templates.TemplateResponse(request, "settings.html", {
        "config": config,
        "devices": devices,
        "current_device": current_device,
        "profiles": profiles,
        "custom_words": words,
        "status": _app_status,
        "models": get_engine_models(current_engine),
        "engines": engines,
        "current_engine": current_engine,
        "engine_models": engine_models,
    })


@router.get("/history", response_class=HTMLResponse)
async def history_page(request: Request, page: int = 1, search: str = ""):
    db = _get_db()
    per_page = 20
    offset = (page - 1) * per_page
    entries = db.get_transcriptions(limit=per_page, offset=offset, search=search)
    total = db.get_transcription_count(search=search)
    total_pages = max(1, (total + per_page - 1) // per_page)
    return templates.TemplateResponse(request, "history.html", {
        "entries": entries,
        "page": page,
        "total_pages": total_pages,
        "search": search,
        "total": total,
    })


# --- API Endpoints ---

@router.get("/health")
async def health():
    return {"status": "ok"}


@router.get("/api/status")
async def api_status():
    return _app_status


@router.post("/api/restart")
async def api_restart():
    if _restart_callback:
        _restart_callback()
        return {"status": "restarting"}
    return JSONResponse({"error": "Restart not available"}, status_code=503)


@router.get("/api/settings")
async def api_settings():
    return _load_config()


@router.put("/api/settings")
async def api_update_settings(request: Request):
    body = await request.json()
    # Write to user config file
    lines = []
    for section, values in body.items():
        lines.append(f"[{section}]")
        for key, value in values.items():
            if isinstance(value, str):
                lines.append(f'{key} = "{value}"')
            elif isinstance(value, bool):
                lines.append(f"{key} = {'true' if value else 'false'}")
            elif isinstance(value, list):
                items = ", ".join(f'"{v}"' for v in value)
                lines.append(f"{key} = [{items}]")
            else:
                lines.append(f"{key} = {value}")
        lines.append("")

    user_config = get_user_dir() / "config" / "localwhisper.toml"
    user_config.parent.mkdir(parents=True, exist_ok=True)
    user_config.write_text("\n".join(lines))
    return {"status": "saved"}


@router.post("/api/settings")
async def api_update_settings_form(
    request: Request,
    engine: str = Form(DEFAULT_ENGINE),
    model: str = Form("large-v3-turbo"),
    compute_type: str = Form("int8"),
    device: str = Form("cuda"),
    language: str = Form("en"),
    hotkey: str = Form("ctrl+shift+space"),
    hotkey_mode: str = Form("push_to_talk"),
    audio_device: str = Form("-1"),
    vad_threshold: str = Form("0.5"),
    overlay_enabled: str = Form("on"),
    overlay_position: str = Form("top-center"),
):
    lines = [
        "[model]",
        f'engine = "{engine}"',
        f'name = "{model}"',
        f'compute_type = "{compute_type}"',
        f'device = "{device}"',
        "",
        "[general]",
        f'language = "{language}"',
        "",
        "[hotkey]",
        f'push_to_talk = "{hotkey}"',
        f'mode = "{hotkey_mode}"',
        "",
        "[audio]",
        f"device_index = {audio_device}",
        "",
        "[vad]",
        f"threshold = {vad_threshold}",
        "",
        "[overlay]",
        f"enabled = {'true' if overlay_enabled == 'on' else 'false'}",
        f'position = "{overlay_position}"',
    ]
    user_config = get_user_dir() / "config" / "localwhisper.toml"
    user_config.parent.mkdir(parents=True, exist_ok=True)
    user_config.write_text("\n".join(lines))

    # Redirect back to settings with success message
    from starlette.responses import RedirectResponse
    return RedirectResponse(url="/?saved=true", status_code=303)


@router.get("/api/history")
async def api_history(limit: int = 50, offset: int = 0, search: str = ""):
    db = _get_db()
    entries = db.get_transcriptions(limit=limit, offset=offset, search=search)
    total = db.get_transcription_count(search=search)
    return {"entries": [e.model_dump() for e in entries], "total": total}


@router.delete("/api/history/{tid}")
async def api_delete_history(tid: int):
    db = _get_db()
    deleted = db.delete_transcription(tid)
    return {"deleted": deleted}


@router.get("/api/models")
async def api_models(engine: str = DEFAULT_ENGINE):
    return {"models": get_engine_models(engine)}


@router.get("/api/devices")
async def api_devices():
    import sounddevice as sd
    devices = []
    default_idx = sd.default.device[0]
    for i, dev in enumerate(sd.query_devices()):
        if dev["max_input_channels"] > 0:
            label = f"{dev['name']} ({dev['max_input_channels']}ch, {int(dev['default_samplerate'])}Hz)"
            if i == default_idx:
                label += " [System Default]"
            devices.append({
                "index": i,
                "name": label,
                "channels": dev["max_input_channels"],
                "sample_rate": int(dev["default_samplerate"]),
                "is_default": i == default_idx,
            })
    return {"devices": devices}


@router.get("/api/custom-words")
async def api_custom_words():
    db = _get_db()
    words = db.get_custom_words()
    return {"words": [w.model_dump() for w in words]}


@router.post("/api/custom-words")
async def api_add_custom_word(request: Request):
    body = await request.json()
    word = body.get("word", "").strip()
    if not word:
        return JSONResponse({"error": "Word is required"}, status_code=400)
    db = _get_db()
    db.add_custom_word(word)
    return {"status": "added", "word": word}


@router.delete("/api/custom-words/{word}")
async def api_delete_custom_word(word: str):
    db = _get_db()
    deleted = db.delete_custom_word(word)
    return {"deleted": deleted}
