#!/usr/bin/env python3
"""Generate Stage A of the phoenix sheet: the eight-frame rebirth strip.

Deterministic. The pixels below are the source of truth - there is no
generative image call anywhere in this pipeline. Every frame is 32 strings of
32 characters using the legend in ``tools/phoenix/spec/palette.json``:

    .  transparent
    W  fill        (near-white body)
    K  ink         (near-black outline and detail)
    F  ember       (the one warm colour, burn and rebirth only)

Run:

    python3 tools/phoenix/scripts/generate_stage_a.py

Writes ``phoenix-rebirth.png`` (256x32 production), plus an 8x
nearest-neighbour preview and a grid overlay for review.
"""

from __future__ import annotations

import json
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
PALETTE_PATH = ROOT / "spec" / "palette.json"
OUTPUT_DIR = ROOT / "output"

CELL = 32
PREVIEW_SCALE = 8
GROUND_Y = 27  # talons sit here; the ash pile shares the baseline

# ---------------------------------------------------------------------------
# The frames.
#
# RETURN is the canonical perched phoenix. Stages B and C compose from it
# rather than redrawing, so import it as ``FRAMES["return"]``.
#
# Two silhouette cues carry the phoenix in a palette with almost no colour:
# the back-swept crest above the head, and the long tail that leaves the body
# at y=19 and sweeps down to the baseline. Remove either and it is a pigeon.
# ---------------------------------------------------------------------------

RETURN = [
    "................................",  # 0
    "................................",  # 1
    "..............K.K...............",  # 2   crest tips
    "..............KKKK..............",  # 3   crest, swept back off the nape
    "...............KKKK.............",  # 4
    "................KKKKKKK.........",  # 5   head top
    "................KWWWWWWK........",  # 6
    "................KWWWWWWK........",  # 7
    "................KWWWKWWK........",  # 8   eye
    "................KWWWWWWKKK......",  # 9   beak
    "................KWWWWWWKK.......",  # 10
    ".................KWWWWWK........",  # 11  nape notch
    "................KWWWWWWK........",  # 12  neck
    "...............KWWWWWWWK........",  # 13
    "..............KWWWWWWWWK........",  # 14  shoulder
    ".............KWWWWWWWWWK........",  # 15
    "............KWWWWWKWWWWK........",  # 16  folded wing edge
    "............KWWWWKWWWWWK........",  # 17
    "...........KWWWWKWWWWWWK........",  # 18
    ".........KKWWWWWKWWWWWK.........",  # 19  tail leaves the body here
    ".......KKWWWWKWWWKWWWK..........",  # 20
    ".....KKWWKWWK.KWWWWWK...........",  # 21
    "...KKWWWKWWK...KWWWK............",  # 22
    "..KWWWKWWWK.....KKK.............",  # 23  belly
    "..KWWKWWWK......K.K.............",  # 24  legs
    "...KWKWWK.......K.K.............",  # 25
    "....KKKK........K.K.............",  # 26
    "..............KKK.KKK...........",  # 27  TALONS - ground anchor
    "................................",  # 28
    "................................",  # 29
    "................................",  # 30
    "................................",  # 31
]

BURN_1 = [
    "................................",  # 0
    "................................",  # 1
    "..............K.K...............",  # 2
    "..............KKKK..............",  # 3
    "...............KKKK.............",  # 4
    "................KKKKKKK.........",  # 5
    "................KWWWWWWK........",  # 6
    "................KWWWWWWK........",  # 7
    "................KWWWKWWK........",  # 8
    "................KWWWWWWKKK......",  # 9
    "................KWWWWWWKK.......",  # 10
    ".................KWWWWWK........",  # 11
    "................KWWWWWWK........",  # 12
    "...............KWWWWWWWK........",  # 13
    "..............KWWWWWWWWK........",  # 14
    ".............KWWWWWWWWWK........",  # 15
    "............KWWWWWKWWWWK........",  # 16
    "............KWWWWKWWWWWK........",  # 17
    "...........KWWWWKWWWWWWK........",  # 18
    ".........KKWWWWWKWWWWWK.........",  # 19
    ".......KKWWWWKWWWKWWWK..........",  # 20
    ".....KKWWKWWK.KWWWWWK.F.........",  # 21
    "...KKWWWKWWK...KWWWK.F..........",  # 22
    "..KWWWKWWWK..F..KKK.FFF.........",  # 23
    "..KWWKWWWK..FF..K.KFFF..........",  # 24
    "...KWKWWK..FFF..K.KFFF..........",  # 25
    "....KKKK..FFFFF.KFKFFFF.........",  # 26
    ".........FFFFFKKKFKKKFFFF.......",  # 27
    "................................",  # 28
    "................................",  # 29
    "................................",  # 30
    "................................",  # 31
]

BURN_2 = [
    "................................",  # 0
    "................................",  # 1
    "..............K.K...............",  # 2
    "..............KKKK..............",  # 3
    "...............KKKK.............",  # 4
    "................KKKKKKK.........",  # 5
    "................KWWWWWWK........",  # 6
    "................KWWWWWWK........",  # 7
    "................KWWWKWWK........",  # 8
    "................KWWWWWWKKK......",  # 9
    "................KWWWWWWKK.......",  # 10
    ".................KWWWWWK........",  # 11
    "................KWWWWWWK........",  # 12
    ".......F.......KWWWWWWWK........",  # 13
    "......FF......KWWWWWWWWK........",  # 14
    "......FFF....KWWWWWWWWWK........",  # 15
    ".....FFFF...KWWWWWKWWWWKFF......",  # 16
    ".....FFFF...KWWWWKWWWWWKFFF.....",  # 17
    "....FFFFF..KWWWWKWWWWWWKFFF.....",  # 18
    "....FFFFFF.KWWWWKWWWWWKFFF......",  # 19
    "...FFFFFFFFKWWWWWKWWWKFFF.......",  # 20
    "...FFFFFFFF..FFWWWWFFFFF........",  # 21
    "...FFFFFFFFF.FFFWWFFFFF.........",  # 22
    "....FFFFFFFFFFFFFFFFFF..........",  # 23
    "....FFFFFFFFFFFFFFFFFF..........",  # 24
    ".....FFFFFFFFFFFFFFFFF..........",  # 25
    ".....FFFFFFFFFFFFFFFF...........",  # 26
    "......FFFFFFFFFFFFFF............",  # 27
    "................................",  # 28
    "................................",  # 29
    "................................",  # 30
    "................................",  # 31
]

BURN_3 = [
    "................................",  # 0
    "................................",  # 1
    "..............K.K...............",  # 2   the crest is the last thing to go
    "..............KKKK..............",  # 3
    "..............FKKF..............",  # 4
    ".............FFWWFF.............",  # 5
    ".............FFWWFF.............",  # 6
    "............FFFWFFF.............",  # 7
    "............FFFFFFF...F.........",  # 8
    "............FFFFFFF..FFF........",  # 9
    "...........FFFFFFFF.FFFFF.......",  # 10
    "........F..FFFFFFFFFFFFFF.......",  # 11
    ".......FFF.FFFFFFFFFFFFFFF......",  # 12
    "......FFFFFFFFFFFFFFFFFFFF......",  # 13
    ".....FFFFFFFFFFFFFFFFFFFFF......",  # 14
    ".....FFFFFFFFFFFFFFFFFFFFF......",  # 15
    "....FFFFFFFFFFFFFFFFFFFFFF......",  # 16
    "....FFFFFFFFFFFFFFFFFFFFFFF.....",  # 17
    "...FFFFFFFFFFFFFFFFFFFFFFFF.....",  # 18
    "...FFFFFFFFFFFFFFFFFFFFFFF......",  # 19
    "...FFFFFFFFFFFFFFFFFFFFFFF......",  # 20
    "...FFFFFFFFFFFFFFFFFFFFFF.......",  # 21
    "....FFFFFFFFFFFFFFFFFFFFF.......",  # 22
    "....FFFFFFFFFFFFFFFFFFFF........",  # 23
    ".....FFFFFFFFFFFFFFFFFF.........",  # 24
    ".....FFFFFFFFFFFFFFFFF..........",  # 25
    "......FFFFFFFFFFFFFFF...........",  # 26
    ".......FFFFFFFFFFFFF............",  # 27
    "................................",  # 28
    "................................",  # 29
    "................................",  # 30
    "................................",  # 31
]

ASH = [
    "................................",  # 0
    "................................",  # 1
    "................................",  # 2
    "................................",  # 3
    "................................",  # 4
    "................................",  # 5
    "................................",  # 6
    "................................",  # 7
    "................................",  # 8
    "................................",  # 9
    "................................",  # 10
    "................................",  # 11
    "................................",  # 12
    "................................",  # 13
    "................................",  # 14
    "................................",  # 15
    "................................",  # 16
    "................................",  # 17
    "................................",  # 18
    "................................",  # 19
    "................................",  # 20
    "................................",  # 21
    "................................",  # 22
    "...............K................",  # 23
    ".............KKWWK.KK...........",  # 24
    "...........KKWWWWWKWWK..........",  # 25
    ".........KKWWWWWWWWWWWKK........",  # 26
    ".........KKKKKKKKKKKKKKKK.......",  # 27  ash shares the talon baseline
    "................................",  # 28
    "................................",  # 29
    "................................",  # 30
    "................................",  # 31
]

EMBER = [
    "................................",  # 0
    "................................",  # 1
    "................................",  # 2
    "................................",  # 3
    "................................",  # 4
    "................................",  # 5
    "................................",  # 6
    "................................",  # 7
    "................................",  # 8
    "................................",  # 9
    "................................",  # 10
    "................................",  # 11
    "................................",  # 12
    "................................",  # 13
    "................................",  # 14
    "................................",  # 15
    "................................",  # 16
    "................................",  # 17
    "................................",  # 18
    "................................",  # 19
    "...................F............",  # 20  sparks
    ".............F..................",  # 21
    "......................F.........",  # 22
    "...............F................",  # 23
    ".............KKFFK.KK...........",  # 24
    "...........KKWFFFFKWWK..........",  # 25
    ".........KKWWFFFFFFFWWKK........",  # 26
    ".........KKKFFFFFFFFFKKKK.......",  # 27
    "................................",  # 28
    "................................",  # 29
    "................................",  # 30
    "................................",  # 31
]

REFORM_1 = [
    "................................",  # 0
    "................................",  # 1
    "................................",  # 2
    "................................",  # 3
    "................................",  # 4
    "................................",  # 5
    "...................K............",  # 6
    "..................KWK...........",  # 7
    "..................KWWK..........",  # 8   head bud
    "..................KWWK..........",  # 9
    "..................KWWK..........",  # 10
    "...................KWK..........",  # 11  neck pinch
    ".................KWWWWWK........",  # 12
    "................KWWWWWWK........",  # 13
    "...............KWWWWWWWK........",  # 14
    "..............KWWWWWWWWK........",  # 15
    ".............KWWWWWWWWWK........",  # 16
    "............KWWWWWWWWWWK........",  # 17
    "...........KWWWWWWWWWWWK........",  # 18
    "..........KWWWWWWWWWWWWK........",  # 19
    ".........KWWWWWWWWWWWWK.........",  # 20
    "........KWWWWWWWWWWWWK..........",  # 21
    ".......KWWWWWWWFFFFFWK..........",  # 22
    "......KWWWWWFFFFFFFFK...........",  # 23
    ".....KWWWWFFFFFFFFFFFK..........",  # 24
    ".....KFFFFFFFFFFFFFFFFK.........",  # 25
    "....KFFFFFFFFFFFFFFFFFFK........",  # 26
    "....KKFFFFFFFFFFFFFFFFFKK.......",  # 27
    "................................",  # 28
    "................................",  # 29
    "................................",  # 30
    "................................",  # 31
]

REFORM_2 = [
    "................................",  # 0
    "................................",  # 1
    "................................",  # 2
    "...............KKK..............",  # 3   crest still blunt
    "................KKKK............",  # 4
    "................KKKKKKK.........",  # 5
    "................KWWWWWWK........",  # 6
    "................KWWWWWWK........",  # 7
    "................KWWWWWWK........",  # 8   no eye yet
    "................KWWWWWWKK.......",  # 9
    "................KWWWWWWK........",  # 10
    "................KWWWWWWK........",  # 11
    "................KWWWWWWK........",  # 12
    "...............KWWWWWWWK........",  # 13
    "..............KWWWWWWWWK........",  # 14
    ".............KWWWWWWWWWK........",  # 15
    "............KWWWWWWWWWWK........",  # 16
    "............KWWWWWWWWWWK........",  # 17
    "...........KWWWWWWWWWWWK........",  # 18
    "..........KWWWWWWWWWWWK.........",  # 19
    ".........KWWWWWWWWWWWK..........",  # 20
    "........KWWWWK.KWWWWK...........",  # 21  tail still a stub
    ".........KWWWK..KWWK............",  # 22
    "..........KKKK..KKK.............",  # 23
    "................K.K.............",  # 24
    "..............FFK.KFF...........",  # 25
    "............FFFFK.KFFF..........",  # 26
    "..........FFFFKKK.KKKFFF........",  # 27
    "................................",  # 28
    "................................",  # 29
    "................................",  # 30
    "................................",  # 31
]

FRAMES = {
    "burn1": BURN_1,
    "burn2": BURN_2,
    "burn3": BURN_3,
    "ash": ASH,
    "ember": EMBER,
    "reform1": REFORM_1,
    "reform2": REFORM_2,
    "return": RETURN,
}

FRAME_ORDER = ["burn1", "burn2", "burn3", "ash", "ember", "reform1", "reform2", "return"]


def load_palette() -> dict[str, tuple[int, int, int, int]]:
    spec = json.loads(PALETTE_PATH.read_text())
    legend = spec["matrix_legend"]
    colors = spec["colors"]
    return {char: tuple(colors[role]) for char, role in legend.items()}


def check_matrix(name: str, rows: list[str], legend: dict[str, tuple]) -> None:
    if len(rows) != CELL:
        raise ValueError(f"frame {name!r}: {len(rows)} rows, expected {CELL}")
    for y, row in enumerate(rows):
        if len(row) != CELL:
            raise ValueError(f"frame {name!r} row {y}: {len(row)} chars, expected {CELL}\n  {row!r}")
        bad = set(row) - set(legend)
        if bad:
            raise ValueError(f"frame {name!r} row {y}: unknown characters {sorted(bad)}")


def render_sheet(legend: dict[str, tuple]) -> Image.Image:
    sheet = Image.new("RGBA", (CELL * len(FRAME_ORDER), CELL), (0, 0, 0, 0))
    px = sheet.load()
    for index, name in enumerate(FRAME_ORDER):
        rows = FRAMES[name]
        check_matrix(name, rows, legend)
        ox = index * CELL
        for y, row in enumerate(rows):
            for x, char in enumerate(row):
                px[ox + x, y] = legend[char]
    return sheet


def scale_nearest(image: Image.Image, factor: int) -> Image.Image:
    return image.resize(
        (image.width * factor, image.height * factor), resample=Image.Resampling.NEAREST
    )


def make_grid(preview: Image.Image) -> Image.Image:
    """Preview with cell boundaries and the y=27 ground anchor marked.

    Review artifact only. It intentionally uses colours outside the palette,
    which is why it never overwrites the production sheet.
    """
    grid = Image.new("RGBA", preview.size, (0, 0, 0, 255))
    grid.alpha_composite(preview)
    px = grid.load()
    boundary = (0, 160, 255, 255)
    anchor = (255, 0, 128, 255)
    step = CELL * PREVIEW_SCALE

    for x in range(0, grid.width + 1, step):
        col = min(x, grid.width - 1)
        for y in range(grid.height):
            px[col, y] = boundary
    for x in range(grid.width):
        px[x, 0] = boundary
        px[x, grid.height - 1] = boundary
    # Bracket the anchor row rather than filling it, so the talons stay visible.
    for y in (GROUND_Y * PREVIEW_SCALE, (GROUND_Y + 1) * PREVIEW_SCALE - 1):
        for x in range(grid.width):
            px[x, y] = anchor
    return grid


def main() -> None:
    legend = load_palette()
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    sheet = render_sheet(legend)
    preview = scale_nearest(sheet, PREVIEW_SCALE)
    grid = make_grid(preview)

    sheet.save(OUTPUT_DIR / "phoenix-rebirth.png")
    preview.save(OUTPUT_DIR / "phoenix-rebirth-preview.png")
    grid.save(OUTPUT_DIR / "phoenix-rebirth-grid.png")

    print(f"sheet   {sheet.width}x{sheet.height}  -> {OUTPUT_DIR / 'phoenix-rebirth.png'}")
    print(f"preview {preview.width}x{preview.height}  -> {OUTPUT_DIR / 'phoenix-rebirth-preview.png'}")
    print(f"grid    {grid.width}x{grid.height}  -> {OUTPUT_DIR / 'phoenix-rebirth-grid.png'}")


if __name__ == "__main__":
    main()
