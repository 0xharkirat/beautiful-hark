#!/usr/bin/env python3
"""Validate the Stage A rebirth strip against every constraint in the spec.

Fails loudly: each violation is collected and printed, then the script exits
non-zero. Run it after every regeneration.

    python3 tools/phoenix/scripts/validate_stage_a.py
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
PALETTE_PATH = ROOT / "spec" / "palette.json"
OUTPUT_DIR = ROOT / "output"

SHEET = OUTPUT_DIR / "phoenix-rebirth.png"
PREVIEW = OUTPUT_DIR / "phoenix-rebirth-preview.png"
GRID = OUTPUT_DIR / "phoenix-rebirth-grid.png"

CELL = 32
FRAME_COUNT = 8
PREVIEW_SCALE = 8
GROUND_Y = 27
MAX_VISIBLE_COLOURS = 4
ASH_FRAME = 3  # the one dead frame: no fire anywhere in it

FRAME_NAMES = [
    "burn1",
    "burn2",
    "burn3",
    "ash",
    "ember",
    "reform1",
    "reform2",
    "return",
]


class Failures(list):
    def check(self, condition: bool, message: str) -> None:
        if not condition:
            self.append(message)


def main() -> int:
    fails = Failures()

    palette = json.loads(PALETTE_PATH.read_text())["colors"]
    ember = tuple(palette["ember"])
    ink = tuple(palette["ink"])
    allowed = {tuple(v) for v in palette.values()}

    for path in (SHEET, PREVIEW, GRID):
        if not path.exists():
            print(f"FAIL: missing {path}", file=sys.stderr)
            return 1

    sheet = Image.open(SHEET)
    fails.check(sheet.mode == "RGBA", f"sheet mode is {sheet.mode}, expected RGBA")
    sheet = sheet.convert("RGBA")

    # --- sheet geometry ----------------------------------------------------
    fails.check(
        sheet.size == (CELL * FRAME_COUNT, CELL),
        f"sheet is {sheet.width}x{sheet.height}, expected {CELL * FRAME_COUNT}x{CELL}",
    )

    px = sheet.load()
    width, height = sheet.size

    # --- alpha is strictly binary -----------------------------------------
    partial = [
        (x, y)
        for y in range(height)
        for x in range(width)
        if px[x, y][3] not in (0, 255)
    ]
    fails.check(
        not partial,
        f"{len(partial)} partially transparent pixels, first at {partial[0] if partial else None}",
    )

    # --- colour budget -----------------------------------------------------
    visible: dict[tuple[int, int, int, int], int] = {}
    for y in range(height):
        for x in range(width):
            rgba = px[x, y]
            if rgba[3] != 0:
                visible[rgba] = visible.get(rgba, 0) + 1
    fails.check(
        len(visible) <= MAX_VISIBLE_COLOURS,
        f"{len(visible)} visible colours, max {MAX_VISIBLE_COLOURS}: {sorted(visible)}",
    )
    off_palette = set(visible) - allowed
    fails.check(not off_palette, f"colours outside palette.json: {sorted(off_palette)}")

    # every fully transparent pixel must be a pure zero, not a coloured ghost
    ghosts = [
        (x, y)
        for y in range(height)
        for x in range(width)
        if px[x, y][3] == 0 and px[x, y] != (0, 0, 0, 0)
    ]
    fails.check(not ghosts, f"{len(ghosts)} transparent pixels carry colour, first at {ghosts[:1]}")

    # --- per frame ---------------------------------------------------------
    for index, name in enumerate(FRAME_NAMES):
        ox = index * CELL
        label = f"frame {index} ({name})"

        # nothing touches or crosses a cell boundary
        edge_hits = []
        for y in range(CELL):
            for x in (0, CELL - 1):
                if px[ox + x, y][3] != 0:
                    edge_hits.append((x, y))
        for x in range(CELL):
            for y in (0, CELL - 1):
                if px[ox + x, y][3] != 0:
                    edge_hits.append((x, y))
        fails.check(
            not edge_hits,
            f"{label}: content on the cell edge at {sorted(set(edge_hits))[:6]}",
        )

        # Flames are permanent on the phoenix - the earlier rule that ember
        # must vanish after the burn was reversed, because a monochrome bird
        # read as a dove. The invariant that still means something is that the
        # ash frame is the one dead moment, so it carries no fire at all.
        has_ember = any(
            px[ox + x, y] == ember for y in range(CELL) for x in range(CELL)
        )
        if index == ASH_FRAME:
            fails.check(not has_ember, f"{label}: the ash frame must contain no ember")

        # the frame must not be empty
        filled = sum(
            1 for y in range(CELL) for x in range(CELL) if px[ox + x, y][3] != 0
        )
        fails.check(filled > 0, f"{label}: frame is empty")

    # --- ground anchor -----------------------------------------------------
    return_index = FRAME_NAMES.index("return")
    ox = return_index * CELL
    talons = [x for x in range(CELL) if px[ox + x, GROUND_Y] == ink]
    fails.check(
        bool(talons),
        f"frame {return_index} (return): no ink pixels on the y={GROUND_Y} ground anchor",
    )
    below = [
        x
        for x in range(CELL)
        for y in range(GROUND_Y + 1, CELL)
        if px[ox + x, y][3] != 0
    ]
    fails.check(
        not below,
        f"frame {return_index} (return): pixels below the y={GROUND_Y} baseline at x={sorted(set(below))}",
    )

    ash_index = FRAME_NAMES.index("ash")
    ash_ox = ash_index * CELL
    ash_base = [x for x in range(CELL) if px[ash_ox + x, GROUND_Y][3] != 0]
    fails.check(
        bool(ash_base),
        f"frame {ash_index} (ash): pile does not reach the y={GROUND_Y} baseline",
    )

    # --- preview is an exact nearest-neighbour multiple ---------------------
    preview = Image.open(PREVIEW).convert("RGBA")
    fails.check(
        preview.size == (width * PREVIEW_SCALE, height * PREVIEW_SCALE),
        f"preview is {preview.size}, expected {(width * PREVIEW_SCALE, height * PREVIEW_SCALE)}",
    )
    if preview.size == (width * PREVIEW_SCALE, height * PREVIEW_SCALE):
        ppx = preview.load()
        interpolated = None
        for y in range(height):
            for x in range(width):
                want = px[x, y]
                for dy in range(PREVIEW_SCALE):
                    for dx in range(PREVIEW_SCALE):
                        got = ppx[x * PREVIEW_SCALE + dx, y * PREVIEW_SCALE + dy]
                        if got != want:
                            interpolated = (x, y, dx, dy, want, got)
                            break
                    if interpolated:
                        break
                if interpolated:
                    break
            if interpolated:
                break
        fails.check(
            interpolated is None,
            f"preview is interpolated, not nearest-neighbour: {interpolated}",
        )

    grid = Image.open(GRID)
    fails.check(
        grid.size == preview.size,
        f"grid is {grid.size}, expected to match the preview at {preview.size}",
    )

    # --- report ------------------------------------------------------------
    if fails:
        print(f"FAILED: {len(fails)} problem(s)\n", file=sys.stderr)
        for message in fails:
            print(f"  - {message}", file=sys.stderr)
        return 1

    print("Stage A OK")
    print(f"  sheet          {width}x{height}, {FRAME_COUNT} frames of {CELL}x{CELL}")
    print(f"  alpha          binary, no partial transparency")
    print(f"  visible colours {len(visible)} / {MAX_VISIBLE_COLOURS}: " + ", ".join(
        name for name, value in palette.items() if tuple(value) in visible
    ))
    print(f"  ember          permanent; absent only from the ash frame {ASH_FRAME}")
    print(f"  cell edges     clear on all {FRAME_COUNT} frames")
    print(f"  ground anchor  talons at y={GROUND_Y} x={talons}; ash on the same baseline")
    print(f"  preview        {preview.width}x{preview.height}, exact {PREVIEW_SCALE}x nearest-neighbour")
    return 0


if __name__ == "__main__":
    sys.exit(main())
