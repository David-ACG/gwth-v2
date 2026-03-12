"""LocalWhisper launch wrapper with error logging and popup.

pythonw.exe silently swallows all exceptions. This wrapper catches
any startup errors, writes them to data/launch_error.log, and shows
a visible error dialog so the user knows something went wrong.
"""

import os
import sys
import traceback
from datetime import datetime
from pathlib import Path

# Ensure we're in the project root
os.chdir(r"C:\Projects\LocalWhisper")

# Add src to path so localwhisper is importable
sys.path.insert(0, os.path.join(os.getcwd(), "src"))

LOG_FILE = Path("data/launch_error.log")


def show_error_dialog(title, message):
    """Show a tkinter error dialog (works even with pythonw.exe)."""
    try:
        import tkinter as tk
        from tkinter import messagebox
        root = tk.Tk()
        root.withdraw()
        messagebox.showerror(title, message)
        root.destroy()
    except Exception:
        pass  # If even tkinter fails, the log file is our fallback


def main():
    try:
        from localwhisper.app import main as app_main
        app_main()
    except SystemExit as exc:
        if exc.code == 0:
            return  # Clean exit
        # Non-zero exit = error, check the log for details
        log_path = Path("data/localwhisper.log")
        if log_path.exists():
            lines = log_path.read_text(encoding="utf-8", errors="replace").splitlines()
            # Find the last FATAL/ERROR line
            error_lines = [l for l in lines[-20:] if "ERROR" in l or "Fatal" in l]
            msg = error_lines[-1] if error_lines else f"Exit code {exc.code}"
        else:
            msg = f"Exit code {exc.code}"
        show_error_dialog("LocalWhisper - Failed to Start", msg)
        raise
    except Exception as exc:
        # Log to file
        LOG_FILE.parent.mkdir(parents=True, exist_ok=True)
        tb = traceback.format_exc()
        with open(LOG_FILE, "a", encoding="utf-8") as f:
            f.write(f"\n{'='*60}\n")
            f.write(f"Launch failed at {datetime.now().isoformat()}\n")
            f.write(f"Python: {sys.executable}\n")
            f.write(f"CWD: {os.getcwd()}\n")
            f.write(f"{'='*60}\n")
            f.write(tb)

        # Show visible error popup
        short_msg = str(exc)
        if len(short_msg) > 300:
            short_msg = short_msg[:297] + "..."
        show_error_dialog(
            "LocalWhisper - Failed to Start",
            f"{short_msg}\n\nFull details saved to:\n{LOG_FILE.resolve()}"
        )
        sys.exit(1)


if __name__ == "__main__":
    main()
