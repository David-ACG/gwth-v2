"""Data models for LocalWhisper."""

from datetime import datetime
from pydantic import BaseModel, Field


class Transcription(BaseModel):
    id: int | None = None
    text: str
    timestamp: str = Field(default_factory=lambda: datetime.now().isoformat())
    duration_s: float = 0.0
    model: str = ""
    language: str = ""
    confidence: float = 0.0


class SettingItem(BaseModel):
    key: str
    value: str


class CustomWord(BaseModel):
    word: str
    frequency: int = 1
