#!/usr/bin/env python3
"""Assemble the four validated rows into one 256x128 sprite sheet.

Row order is the runtime's contract, so it is fixed here rather than inferred:
perched, launch, flight, rebirth. The engine indexes frames as row*8+col.
"""
from pathlib import Path
from PIL import Image
import json

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "output"
ROWS = ["perched", "launch", "flight", "rebirth"]
CELL = 32

sheet = Image.new("RGBA", (CELL * 8, CELL * len(ROWS)), (0, 0, 0, 0))
for i, row in enumerate(ROWS):
    src = Image.open(OUT / f"phoenix-{row}.png").convert("RGBA")
    assert src.size == (CELL * 8, CELL), f"{row} is {src.size}"
    sheet.paste(src, (0, i * CELL))

sheet.save(OUT / "phoenix.png")
sheet.resize((sheet.width * 4, sheet.height * 4), Image.NEAREST).save(OUT / "phoenix-preview.png")

meta = {
    "cell": CELL,
    "rows": {name: i for i, name in enumerate(ROWS)},
    "ground_y": 27,
    "note": "frame index = row*8 + col; right-facing, mirror for leftward travel",
}
(ROOT / "spec" / "sheet.json").write_text(json.dumps(meta, indent=2) + "\n")
print(f"  {sheet.width}x{sheet.height}  rows: {', '.join(ROWS)}")
