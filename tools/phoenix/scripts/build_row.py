#!/usr/bin/env python3
"""
Build one 256x32 sprite row from a magenta-background raw sheet.

Generation happens separately (see ``spec/GENERATION_PROMPT.md``). This handles
everything from raw sheet to validated strip, and is shared by every stage.

Usage:
    build_row.py <raw.png> <out-name> [--write-profile | --use-profile]

Three decisions carry the quality:

**Magenta keying, not a colour match.** A distance threshold marks candidate
background, then a flood fill inward from the border decides what actually goes,
so magenta-ish pixels enclosed by the artwork survive.

**One shared scale within a row.** Fitting each sprite to its own cell made an
earlier attempt draw the newborn chick larger than the adult phoenix. A single
factor preserves relative sizes exactly as drawn.

**A scale profile across rows, anchored on the neutral pose.** Without it each
row fits to its own tallest sprite, and the bird changes size between rows. But
anchoring on the tallest sprite is also wrong: a row containing a look-upward
pose is genuinely taller, so it would shrink the whole row to compensate. The
profile therefore records how many cell pixels tall the *neutral perched pose*
should be, and each row scales so its own neutral frame hits that height.
Measured on the first two rows, the raw sheets drew the same perched pose at
257px and 309px, a 20% drift, which this is what corrects.
"""

from __future__ import annotations

import argparse
import json
from collections import deque
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
PALETTE_PATH = ROOT / "spec" / "palette.json"
PROFILE_PATH = ROOT / "spec" / "scale-profile.json"
OUTPUT_DIR = ROOT / "output"

CELL = 32
GROUND_Y = 27
TOP_MARGIN = 2
PREVIEW_SCALE = 8
MAGENTA_DIST = 110


def is_magenta(rgb):
    r, g, b = rgb
    return ((r - 255) ** 2 + g**2 + (b - 255) ** 2) ** 0.5 < MAGENTA_DIST


def load_palette():
    return {k: tuple(v) for k, v in json.loads(PALETTE_PATH.read_text())["colors"].items()}


def classify(rgb, pal):
    r, g, b = rgb
    if is_magenta(rgb):
        return None
    if r > 150 and g > 150 and b > 150:
        return pal["fill"]
    # Ember is the only saturated hue present, so a red/blue split isolates it.
    if r > 110 and g < 175 and b < 120 and (r - b) > 40:
        return pal["ember"]
    if r < 125 and g < 125 and b < 125:
        return pal["ink"]
    return pal["fill"]


def find_sprites(im):
    """Row bands, then column gaps within each band. Never hand-typed boxes:
    a naive bounding box swallowed two sprites and squashed them into one cell."""
    px = im.load()
    w, h = im.size

    def bands(lo, hi, probe):
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
    for band, (y0, y1) in enumerate(
        bands(0, h, lambda y: any(not is_magenta(px[x, y]) for x in range(0, w, 3)))
    ):
        cols = bands(0, w, lambda x: any(not is_magenta(px[x, y]) for y in range(y0, y1 + 1)))

        # Merge detached accessories back into their sprite. A frame can contain
        # something separated from the body by background - the zZ above a
        # sleeping bird - and a column gap alone would count it as its own
        # sprite. Measured on that sheet: the z's sit 19px from the bird while
        # every real gap between sprites is 104-141px. A detached accessory is
        # always far closer to its own sprite than sprites are to each other,
        # so a fraction of the median gap separates the two cases cleanly.
        if len(cols) > 1:
            gaps = sorted(cols[i + 1][0] - cols[i][1] for i in range(len(cols) - 1))
            median = gaps[len(gaps) // 2]
            merged = [list(cols[0])]
            for c in cols[1:]:
                if c[0] - merged[-1][1] < median * 0.4:
                    merged[-1][1] = c[1]
                else:
                    merged.append(list(c))
            cols = [tuple(c) for c in merged]

        for x0, x1 in cols:
            ys = [y for y in range(y0, y1 + 1) if any(not is_magenta(px[x, y]) for x in range(x0, x1 + 1))]
            # Band index matters: a raw 2x4 sheet has two source rows sitting at
            # different heights on the page, and a ground baseline computed
            # across both would tell the upper row it was 30px in the air.
            boxes.append((x0, ys[0], x1, ys[-1], band))
    return boxes


def flood_key(img):
    px = img.load()
    w, h = img.size
    seen = bytearray(w * h)
    q = deque()
    for x in range(w):
        q.append((x, 0)); q.append((x, h - 1))
    for y in range(h):
        q.append((0, y)); q.append((w - 1, y))
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


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("raw", type=Path)
    ap.add_argument("name")
    ap.add_argument("--write-profile", action="store_true",
                    help="record this row's scale as the character-wide profile")
    ap.add_argument("--use-profile", action="store_true",
                    help="reuse the recorded profile instead of fitting this row")
    ap.add_argument("--ref-frame", type=int, default=0,
                    help="index of the neutral perched pose in this row")
    ap.add_argument("--anchor", choices=("baseline", "centre"), default="baseline",
                    help="baseline: lowest frame sits on the ground anchor and "
                         "others keep their height above it. centre: no ground "
                         "contact, frames are centred in the cell.")
    args = ap.parse_args()

    pal = load_palette()
    src = Image.open(args.raw).convert("RGB")
    boxes = find_sprites(src)
    if len(boxes) != 8:
        print(f"  expected 8 sprites, found {len(boxes)}")
        return 1

    avail = GROUND_Y - TOP_MARGIN + 1
    tallest = max(y1 - y0 + 1 for _, y0, _, y1, _ in boxes)
    ref_h = boxes[args.ref_frame][3] - boxes[args.ref_frame][1] + 1

    if args.use_profile:
        target = json.loads(PROFILE_PATH.read_text())["neutral_cell_height"]
        scale = target / ref_h
        print(f"  scale {scale:.4f}: neutral frame {args.ref_frame} is {ref_h}px "
              f"and must render at {target}px")
    else:
        scale = avail / tallest
        print(f"  scale {scale:.4f} fitted from tallest source sprite ({tallest}px)")

    # Never let a tall pose breach the cell. Shrinking the whole row keeps the
    # relative sizes intact, which is the property worth protecting.
    if round(tallest * scale) > avail:
        scale = avail / tallest
        print(f"  clamped to {scale:.4f}: tallest pose would have breached the cell")

    # Vertical placement.
    #
    # Seating every frame's bottom on GROUND_Y is right while the bird is on
    # the ground, and wrong the moment it leaves. A hop whose every frame is
    # pinned to the baseline never actually hops.
    #
    # "baseline" therefore anchors the row's LOWEST frame to GROUND_Y and
    # preserves each other frame's height above it, so lift-off is carried
    # from the drawing rather than flattened out. For a fully grounded row
    # every frame shares the same bottom, so this reduces to the old
    # behaviour exactly.
    #
    # "centre" is for rows with no ground contact at all, where the spec asks
    # for a consistent body centre between views rather than a false baseline.
    band_bottom: dict[int, int] = {}
    for _, _, _, y1, band in boxes:
        band_bottom[band] = max(band_bottom.get(band, 0), y1)

    # For an airborne row the body centre must sit at one constant height, or
    # the loop bobs when played. Naive centring in the cell is not enough: a
    # tall frame then dips below the ground anchor, which is meant to be the
    # floor even when nothing is standing on it. So pick the lowest shared
    # centre that still keeps every frame clear of the baseline.
    centre_y = min(
        GROUND_Y - (round((y1 - y0 + 1) * scale) + 1) // 2
        for _, y0, _, y1, _ in boxes
    )

    sheet = Image.new("RGBA", (CELL * 8, CELL), (0, 0, 0, 0))
    for i, (x0, y0, x1, y1, band) in enumerate(boxes):
        w, h = x1 - x0 + 1, y1 - y0 + 1
        tw, th = max(1, round(w * scale)), max(1, round(h * scale))
        small = flood_key(src.crop((x0, y0, x1 + 1, y1 + 1)).convert("RGBA")).resize((tw, th), Image.LANCZOS)
        sp = small.load()
        cell = Image.new("RGBA", (CELL, CELL), (0, 0, 0, 0))
        cp = cell.load()
        ox = (CELL - tw) // 2
        if args.anchor == "centre":
            oy = max(TOP_MARGIN, centre_y - th // 2)
        else:
            lift = round((band_bottom[band] - y1) * scale)
            oy = GROUND_Y - th + 1 - lift
            if oy < TOP_MARGIN:            # never let lift push a frame off the top
                oy = TOP_MARGIN
            if lift:
                print(f"     frame {i} airborne, {lift}px above the baseline")
        for y in range(th):
            for x in range(tw):
                if sp[x, y][3] < 128:
                    continue
                v = classify(sp[x, y][:3], pal)
                if v and 0 <= ox + x < CELL and 0 <= oy + y < CELL:
                    cp[ox + x, oy + y] = v
        sheet.paste(cell, (i * CELL, 0))
        print(f"  {i}  src {w}x{h} -> {tw}x{th}")

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    out = OUTPUT_DIR / f"phoenix-{args.name}.png"
    sheet.save(out)
    sheet.resize((sheet.width * PREVIEW_SCALE, sheet.height * PREVIEW_SCALE), Image.NEAREST).save(
        OUTPUT_DIR / f"phoenix-{args.name}-preview.png"
    )

    if args.write_profile:
        PROFILE_PATH.write_text(json.dumps({
            "neutral_cell_height": round(ref_h * scale),
            "source_row": args.name,
            "source_ref_frame": args.ref_frame,
            "cell": CELL,
            "ground_y": GROUND_Y,
        }, indent=2) + "\n")
        print(f"  wrote profile -> {PROFILE_PATH}")

    print(f"  sheet {sheet.width}x{sheet.height} -> {out}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
