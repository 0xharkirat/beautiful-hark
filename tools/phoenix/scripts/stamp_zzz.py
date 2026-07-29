#!/usr/bin/env python3
"""
Stamp the sleeping zZ into the perched row at sprite scale.

Generated lettering does not survive the downscale. The reference sheet drew
two z characters about 25px wide inside a 300px sprite; at the ~0.078 scale
that maps to a 32px cell they collapse to a single 2px dot. oneko's zZ reads
because oneko is drawn natively at 32px and its letters are hand-placed at 3
to 4 pixels.

So the letters are drawn here, in cell coordinates, rather than asked for from
the generator. Two of them, the nearer smaller than the further, rising to the
right of the tucked head.
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
OUTPUT_DIR = ROOT / "output"
PALETTE_PATH = ROOT / "spec" / "palette.json"

CELL = 32
SLEEP_FRAME = 6

# A 3x3 z is the smallest that still reads as the letter: top bar, diagonal,
# bottom bar. Anything smaller is a dot, which is what the generator produced.
Z_SMALL = ["###", ".#.", "###"]
Z_LARGE = ["####", "..#.", ".#..", "####"]

# Placed to the upper right of the tucked head, angled away from the body.
PLACEMENTS = [(Z_SMALL, 21, 13), (Z_LARGE, 25, 7)]


def main() -> int:
    row = sys.argv[1] if len(sys.argv) > 1 else "perched"
    path = OUTPUT_DIR / f"phoenix-{row}.png"
    ink = tuple(json.loads(PALETTE_PATH.read_text())["colors"]["ink"])

    sheet = Image.open(path).convert("RGBA")
    px = sheet.load()
    ox = SLEEP_FRAME * CELL

    stamped = 0
    for glyph, gx, gy in PLACEMENTS:
        for dy, line in enumerate(glyph):
            for dx, ch in enumerate(line):
                if ch != "#":
                    continue
                x, y = ox + gx + dx, gy + dy
                if not (ox < x < ox + CELL - 1 and 0 < y < CELL - 1):
                    print(f"  refusing to stamp outside the cell at {x},{y}")
                    return 1
                px[x, y] = ink
                stamped += 1

    sheet.save(path)
    sheet.resize((sheet.width * 8, sheet.height * 8), Image.NEAREST).save(
        OUTPUT_DIR / f"phoenix-{row}-preview.png"
    )
    print(f"  stamped {stamped} ink pixels into frame {SLEEP_FRAME} of {row}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
