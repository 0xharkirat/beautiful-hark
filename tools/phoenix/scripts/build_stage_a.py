#!/usr/bin/env python3
"""
Build the Stage A rebirth strip from a magenta-background raw sheet.

Generation is separate (see ``spec/GENERATION_PROMPT.md``); this is everything
from raw sheet to validated 256x32 strip.

Two decisions carry most of the quality:

**Magenta keying, not a colour match.** A distance threshold marks candidate
background, then a flood fill inward from the border decides what actually goes.
Anything magenta-ish that the artwork encloses survives, which a flat colour key
would punch out.

**One shared scale for every frame.** Fitting each sprite to its own cell is what
made an earlier attempt render the newborn chick larger than the adult phoenix.
Instead the tallest sprite sets a single scale factor and every frame is reduced
by it, so relative sizes across the sequence are preserved exactly as drawn.
"""

from __future__ import annotations

import json
from collections import deque
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
RAW = ROOT / "reference" / "codex-rebirth-raw.png"
PALETTE_PATH = ROOT / "spec" / "palette.json"
OUTPUT_DIR = ROOT / "output"

CELL = 32
GROUND_Y = 27       # talons and the ash pile share this baseline
TOP_MARGIN = 2      # keeps every frame clear of the cell edge
PREVIEW_SCALE = 8
MAGENTA_DIST = 110  # threshold to pure #FF00FF

FRAME_NAMES = ["burn1", "burn2", "burn3", "ash", "ember", "reform1", "reform2", "return"]


def is_magenta(rgb: tuple[int, int, int]) -> bool:
    r, g, b = rgb
    return ((r - 255) ** 2 + g**2 + (b - 255) ** 2) ** 0.5 < MAGENTA_DIST


def load_palette() -> dict[str, tuple[int, int, int, int]]:
    return {k: tuple(v) for k, v in json.loads(PALETTE_PATH.read_text())["colors"].items()}


def classify(rgb: tuple[int, int, int], pal: dict) -> tuple[int, int, int, int] | None:
    r, g, b = rgb
    if is_magenta(rgb):
        return None
    if r > 150 and g > 150 and b > 150:
        return pal["fill"]
    # Ember is the only saturated hue in the artwork, so a red/blue split
    # separates it from ink and fill with no distance metric needed.
    if r > 110 and g < 175 and b < 120 and (r - b) > 40:
        return pal["ember"]
    if r < 125 and g < 125 and b < 125:
        return pal["ink"]
    return pal["fill"]


def find_sprites(im: Image.Image) -> list[tuple[int, int, int, int]]:
    """Locate every sprite by row bands then column gaps within each band."""
    px = im.load()
    w, h = im.size

    def bands(lo: int, hi: int, probe) -> list[tuple[int, int]]:
        out, start = [], None
        for i in range(lo, hi):
            if probe(i):
                if start is None:
                    start = i
            elif start is not None:
                if i - start > 15:
                    out.append((start, i - 1))
                start = None
        if start is not None:
            out.append((start, hi - 1))
        return out

    boxes = []
    for y0, y1 in bands(0, h, lambda y: any(not is_magenta(px[x, y]) for x in range(0, w, 3))):
        for x0, x1 in bands(0, w, lambda x: any(not is_magenta(px[x, y]) for y in range(y0, y1 + 1))):
            ys = [y for y in range(y0, y1 + 1) if any(not is_magenta(px[x, y]) for x in range(x0, x1 + 1))]
            boxes.append((x0, ys[0], x1, ys[-1]))
    return boxes


def flood_key(img: Image.Image) -> Image.Image:
    """Clear background reachable from the border, and only that."""
    px = img.load()
    w, h = img.size
    seen = bytearray(w * h)
    q: deque[tuple[int, int]] = deque()
    for x in range(w):
        q.append((x, 0))
        q.append((x, h - 1))
    for y in range(h):
        q.append((0, y))
        q.append((w - 1, y))
    while q:
        x, y = q.popleft()
        if not (0 <= x < w and 0 <= y < h) or seen[y * w + x]:
            continue
        seen[y * w + x] = 1
        r, g, b, _ = px[x, y]
        if not is_magenta((r, g, b)):
            continue
        px[x, y] = (0, 0, 0, 0)
        q.extend(((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)))
    return img


def main() -> int:
    pal = load_palette()
    src = Image.open(RAW).convert("RGB")
    boxes = find_sprites(src)
    if len(boxes) != 8:
        print(f"  expected 8 sprites, found {len(boxes)}")
        return 1

    # One scale for all frames. The tallest sprite is reduced to the available
    # height; every other frame is reduced by that same factor, so a chick that
    # was drawn small stays small relative to the adult.
    avail = GROUND_Y - TOP_MARGIN + 1
    tallest = max(y1 - y0 + 1 for _, y0, _, y1 in boxes)
    scale = avail / tallest

    sheet = Image.new("RGBA", (CELL * 8, CELL), (0, 0, 0, 0))
    for i, (x0, y0, x1, y1) in enumerate(boxes):
        w, h = x1 - x0 + 1, y1 - y0 + 1
        tw, th = max(1, round(w * scale)), max(1, round(h * scale))
        small = flood_key(src.crop((x0, y0, x1 + 1, y1 + 1)).convert("RGBA")).resize(
            (tw, th), Image.LANCZOS
        )
        sp = small.load()

        cell = Image.new("RGBA", (CELL, CELL), (0, 0, 0, 0))
        cp = cell.load()
        ox, oy = (CELL - tw) // 2, GROUND_Y - th + 1
        for y in range(th):
            for x in range(tw):
                if sp[x, y][3] < 128:
                    continue
                v = classify(sp[x, y][:3], pal)
                if v and 0 <= ox + x < CELL and 0 <= oy + y < CELL:
                    cp[ox + x, oy + y] = v

        sheet.paste(cell, (i * CELL, 0))
        print(f"  {i} {FRAME_NAMES[i]:<8} src {w}x{h} -> {tw}x{th}")

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    out = OUTPUT_DIR / "phoenix-rebirth.png"
    sheet.save(out)
    sheet.resize((sheet.width * PREVIEW_SCALE, sheet.height * PREVIEW_SCALE), Image.NEAREST).save(
        OUTPUT_DIR / "phoenix-rebirth-preview.png"
    )
    print(f"  scale {scale:.3f} shared across all frames (tallest source {tallest}px)")
    print(f"  sheet {sheet.width}x{sheet.height} -> {out}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
