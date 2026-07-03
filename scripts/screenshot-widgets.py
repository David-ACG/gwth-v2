"""Capture lesson-widget screenshots for the Stage 3 design-bundle port.

Saves PNGs into kanban/design-artefacts/2026-05-08/lesson-widgets-design-bundle/after/
matching the names called out in the Stage 3 handoff.
"""

from __future__ import annotations

from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "kanban" / "design-artefacts" / "2026-05-08" / "lesson-widgets-design-bundle" / "after"
OUT.mkdir(parents=True, exist_ok=True)

BASE = "http://localhost:3000"


# (filename, viewport_w, viewport_h, surface, widget, dark)
SHOTS = [
    ("01-feedback-collapsed-light-1440.png", 1440, 900, "prose", "none", False),
    ("01-feedback-collapsed-dark-1440.png", 1440, 900, "prose", "none", True),
    ("02-feedback-open-with-composer-light-1440.png", 1440, 900, "prose", "feedback", False),
    ("02-feedback-open-with-composer-dark-1440.png", 1440, 900, "prose", "feedback", True),
    ("03-notes-selection-light-1440.png", 1440, 900, "prose", "selection", False),
    ("04-notes-aggregated-panel-light-1440.png", 1440, 900, "prose", "notes", False),
    ("04-notes-aggregated-panel-dark-1440.png", 1440, 900, "prose", "notes", True),
    ("05-mobile-feedback-sheet-light-412.png", 412, 900, "mobile", "mobile-sheet", False),
    ("06-mobile-notes-disabled-light-412.png", 412, 900, "mobile", "mobile-collapsed", False),
    ("07-note-compose-popover-light-1440.png", 1440, 900, "prose", "note-compose", False),
]


def main() -> None:
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        for name, w, h, surface, widget, dark in SHOTS:
            ctx = browser.new_context(viewport={"width": w, "height": h})
            page = ctx.new_page()
            url = f"{BASE}/demo/lesson?surface={surface}&widget={widget}"
            page.goto(url, wait_until="domcontentloaded")
            # NiceGUI-style waits aren't needed here, but give Next a tick to hydrate.
            page.wait_for_load_state("networkidle", timeout=15000)
            if dark:
                page.evaluate("document.documentElement.classList.add('dark')")
            else:
                page.evaluate("document.documentElement.classList.remove('dark')")
            page.wait_for_timeout(250)
            out = OUT / name
            page.screenshot(path=str(out), full_page=False)
            print(f"saved {out.name}")
            ctx.close()
        browser.close()


if __name__ == "__main__":
    main()
