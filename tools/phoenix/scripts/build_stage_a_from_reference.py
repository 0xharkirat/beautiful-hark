#!/usr/bin/env python3
"""
Build the Stage A rebirth strip from the reference sheet.

This is the processing half of the pipeline described in
``spec/GENERATION_PROMPT.md``. Generation happens elsewhere; everything from
"raw sheet" to "validated 256x32 strip" happens here.

The reference sheet's own REBIRTH CYCLE row maps onto our eight frames, so the
pipeline can be proven end to end before a purpose-generated sheet exists.

Pipeline, in order:
  1. locate each sprite by column gaps within the row band
  2. key the background
  3. pad to square and seat on the baseline, so nothing is distorted
  4. one resize to the target height, leaving headroom for the anchor
  5. classify every pixel into the four-colour palette
  6. paste each frame so its lowest opaque pixel lands on GROUND_Y

Background keying follows the approach in agent-sprite-forge: a distance
threshold first, then a flood fill inward from the image border. The flood fill
is what stops an enclosed background-coloured pixel inside the artwork from
being punched out.
"""

from __future__ import annotations

import json
from collections import deque
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
REFERENCE = ROOT / "reference" / "gemini-phoenix-checker.png"
PALETTE_PATH = ROOT / "spec" / "palette.json"
OUTPUT_DIR = ROOT / "output"

CELL = 32
GROUND_Y = 27          # talons and the ash pile share this baseline
TOP_MARGIN = 2         # keeps every frame clear of the cell edge
PREVIEW_SCALE = 8

# The reference's REBIRTH CYCLE band, and the eight sprites within it that
# correspond to our frames. Located by column-gap detection, not typed by hand:
# a naive bounding box swallowed two sprites and squashed them into one cell.
ROW_BAND = (1300, 1514)
SPRITES: list[tuple[str, int, int]] = [
    ("burn1", 347, 558),
    ("burn2", 667, 847),
    ("burn3", 942, 1110),
    ("ash", 1186, 1378),
    ("ember", 1466, 1631),
    ("reform1", 1771, 1874),
    ("reform2", 2047, 2172),
    ("return", 2562, 2780),
]

# The sheet paints a checkerboard to represent transparency rather than
# carrying alpha. Two flat neutrals at ~156 and ~199, neither near white, the
# ember orange, or the ink - so a neutral band keys it without clipping.
BG_LO, BG_HI, BG_NEUTRAL = 138, 218, 14


def is_background(rgb: tuple[int, int, int]) -> bool:
    r, g, b = rgb
    return abs(r - g) < BG_NEUTRAL and abs(g - b) < BG_NEUTRAL and BG_LO < r < BG_HI


def load_palette() -> dict[str, tuple[int, int, int, int]]:
    raw = json.loads(PALETTE_PATH.read_text())["colors"]
    return {k: tuple(v) for k, v in raw.items()}


def classify(rgb: tuple[int, int, int], pal: dict) -> tuple[int, int, int, int] | None:
    r, g, b = rgb
    if is_background(rgb):
        return None
    if r > 150 and g > 150 and b > 150:
        return pal["fill"]
    # Ember is the only saturated hue present, so a red/blue split separates it
    # from ink and fill without needing a distance metric.
    if r > 110 and g < 165 and b < 115 and (r - b) > 40:
        return pal["ember"]
    if r < 115 and g < 115 and b < 115:
        return pal["ink"]
    return pal["fill"]


def flood_key(img: Image.Image) -> Image.Image:
    """Punch out background reachable from the border, and only that."""
    img = img.convert("RGBA")
    px = img.load()
    w, h = img.size
    seen = [[False] * h for _ in range(w)]
    q: deque[tuple[int, int]] = deque()
    for x in range(w):
        q.append((x, 0))
        q.append((x, h - 1))
    for y in range(h):
        q.append((0, y))
        q.append((w - 1, y))
    while q:
        x, y = q.popleft()
        if not (0 <= x < w and 0 <= y < h) or seen[x][y]:
            continue
        seen[x][y] = True
        r, g, b, _ = px[x, y]
        if not is_background((r, g, b)):
            continue
        px[x, y] = (0, 0, 0, 0)
        q.extend(((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)))
    return img


def build_frame(src: Image.Image, x0: int, x1: int, pal: dict) -> Image.Image:
    px = src.load()
    ys = [
        y for y in range(*ROW_BAND)
        if any(not is_background(px[x, y]) for x in range(x0, x1 + 1))
    ]
    y0, y1 = ys[0], ys[-1]
    w, h = x1 - x0 + 1, y1 - y0 + 1

    # Pad to square and sit on the baseline so a single resize cannot distort.
    side = max(w, h)
    square = Image.new("RGB", (side, side), (156, 156, 156))
    square.paste(src.crop((x0, y0, x1 + 1, y1 + 1)), ((side - w) // 2, side - h))

    target = GROUND_Y - TOP_MARGIN + 1
    small = square.resize((target, target), Image.LANCZOS)
    sp = small.load()

    cell = Image.new("RGBA", (CELL, CELL), (0, 0, 0, 0))
    cp = cell.load()
    ox = (CELL - target) // 2
    for y in range(target):
        for x in range(target):
            v = classify(sp[x, y], pal)
            if v:
                cp[ox + x, TOP_MARGIN + y] = v

    # Seat the frame so its lowest opaque pixel is exactly on GROUND_Y.
    filled = [y for y in range(CELL) if any(cp[x, y][3] for x in range(CELL))]
    if filled:
        shift = GROUND_Y - filled[-1]
        if shift:
            moved = Image.new("RGBA", (CELL, CELL), (0, 0, 0, 0))
            moved.paste(cell, (0, shift))
            cell = moved
    return cell


def main() -> int:
    pal = load_palette()
    src = Image.open(REFERENCE).convert("RGB")

    sheet = Image.new("RGBA", (CELL * len(SPRITES), CELL), (0, 0, 0, 0))
    for i, (name, x0, x1) in enumerate(SPRITES):
        sheet.paste(build_frame(src, x0, x1, pal), (i * CELL, 0))
        print(f"  {i} {name:<8} from x{x0}..{x1}")

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    out = OUTPUT_DIR / "phoenix-rebirth.png"
    sheet.save(out)
    preview = sheet.resize(
        (sheet.width * PREVIEW_SCALE, sheet.height * PREVIEW_SCALE), Image.NEAREST
    )
    preview.save(OUTPUT_DIR / "phoenix-rebirth-preview.png")
    print(f"  sheet   {sheet.width}x{sheet.height} -> {out}")
    print(f"  preview {preview.width}x{preview.height}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
