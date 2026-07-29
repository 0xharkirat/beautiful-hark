#!/usr/bin/env python3
"""
Derive a starting pixel matrix from the Gemini reference sheet.

Why this exists
---------------
Hand-authoring convincing flame shapes at 32x32 in ASCII turned out to be slow
and bad: seven iterations produced a crest that read as a crown and a tail that
read as a brick. The reference sheet already has flame shapes that work.

The reference cannot be shipped directly. It is 2816x1536 with ~98,000 distinct
colours, and a run-length analysis shows no regular pixel grid - horizontal runs
decay smoothly from 1px with no spike at any multiple, which is the signature of
a continuous-tone image drawn to look pixelated rather than real pixel art
upscaled. So there is nothing to cleanly downsample.

What works is deriving a *starting matrix*: crop a frame, resize to 32x32, and
classify each pixel into the four-colour palette. The result is noisy - broken
outlines, stray pixels, wrong vertical alignment - and is meant to be
hand-cleaned, not used as-is.

Licence note: the Gemini sheet is Hark's own generated image, so deriving from
it is fine. The other two sheets in reference/ are not - one is a ripped PSP
asset - and nothing may be traced from those.

Usage
-----
    python3 derive_from_reference.py LEFT TOP RIGHT BOTTOM

Prints a matrix in the generator's format, ready to paste and clean.
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
REFERENCE = ROOT / "reference" / "gemini-phoenix.png"
PALETTE_PATH = ROOT / "spec" / "palette.json"
CELL = 32

# The reference sits on a flat grey card. Anything close to it is background.
BG_LO, BG_HI = 110, 175
BG_NEUTRAL = 18


def classify(rgb: tuple[int, int, int]) -> str:
    """Map one reference pixel to a palette character."""
    r, g, b = rgb
    if abs(r - g) < BG_NEUTRAL and abs(g - b) < BG_NEUTRAL and BG_LO < r < BG_HI:
        return "."
    if r > 150 and g > 150 and b > 150:
        return "W"
    # Ember is the only saturated hue on the sheet, so a red/blue split
    # separates it from ink and fill without needing a distance metric.
    if r > 110 and g < 160 and b < 110 and (r - b) > 45:
        return "F"
    if r < 110 and g < 110 and b < 110:
        return "K"
    return "W"


def derive(box: tuple[int, int, int, int]) -> list[str]:
    src = Image.open(REFERENCE).convert("RGB")
    crop = src.crop(box).resize((CELL, CELL), Image.LANCZOS)
    px = crop.load()
    return ["".join(classify(px[x, y]) for x in range(CELL)) for y in range(CELL)]


def main() -> int:
    if len(sys.argv) != 5:
        print(__doc__.strip())
        return 2
    box = tuple(int(a) for a in sys.argv[1:5])  # type: ignore[assignment]

    legend = json.loads(PALETTE_PATH.read_text())["matrix_legend"]
    rows = derive(box)  # type: ignore[arg-type]

    ink_rows = [i for i, r in enumerate(rows) if set(r) != {"."}]
    print(f"# derived from {box}, legend {legend}")
    print(f"# content spans y={ink_rows[0]}..{ink_rows[-1]} "
          f"(needs shifting so talons land on y=27)")
    print("[")
    for i, row in enumerate(rows):
        print(f'    "{row}",  # {i}')
    print("]")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
