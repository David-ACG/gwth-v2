"""Generate tray icons for LocalWhisper."""

from PIL import Image, ImageDraw

ICON_SIZE = 64


def create_circle_icon(color: str, filename: str):
    """Create a solid circle icon with the given color."""
    img = Image.new("RGBA", (ICON_SIZE, ICON_SIZE), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    margin = 4
    draw.ellipse(
        [margin, margin, ICON_SIZE - margin, ICON_SIZE - margin],
        fill=color,
    )
    # Save PNG
    img.save(filename.replace(".ico", ".png"), "PNG")
    # Save ICO
    img.save(filename, format="ICO", sizes=[(64, 64), (32, 32), (16, 16)])
    print(f"Created {filename}")


if __name__ == "__main__":
    create_circle_icon("#4CAF50", "assets/icon_idle.ico")       # Green
    create_circle_icon("#F44336", "assets/icon_recording.ico")  # Red
    create_circle_icon("#FFC107", "assets/icon_processing.ico") # Yellow
    print("All icons generated.")
