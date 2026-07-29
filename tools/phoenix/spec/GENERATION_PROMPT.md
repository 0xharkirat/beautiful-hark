# Generation prompt - Stage A rebirth row

Method adapted from `agent-sprite-forge` (studied, not installed). The three
rules below are the ones we were getting wrong.

## Why the earlier sheets could not be used

**Asking for a transparent background does not work.** Transparency is not
something an image model can render, so it draws the *convention* for it: the
first sheet came back on a flat grey card, the second on a checkerboard. Both
had zero actual alpha.

Ask for flat magenta instead. It is a colour the model can actually produce, it
appears nowhere in the artwork, and it keys out exactly.

**One sheet must contain one action.** Both earlier sheets packed nine actions
into a single image. Scale then drifts between rows, which is why the idle
birds and the flying birds are different sizes. Generate one action per sheet.

**Containment has to be stated explicitly** or the subject fills the cell and
crosses edges, leaving no margin to align against.

## The prompt

Paste this, with the accepted phoenix sheet attached as a visual reference.

```text
Use the image just shown as the visual reference for character identity.

A 2x4 pixel art sprite sheet, exactly 8 equal cells, 2 rows of 4, showing one
continuous rebirth sequence of the same phoenix. Read left to right across the
top row, then continue on the bottom row.

Keep fixed in every cell: the same phoenix identity, the same palette of white
body, black outline and orange flame, the same art style, and the same camera
distance. Only the stage of the sequence changes.

Frame by frame:
1. The phoenix perched, intact, small flames beginning at its feet.
2. Flames climbing its body, silhouette still readable.
3. Almost entirely flame, only a suggestion of the bird inside.
4. A small pile of dark ash on the ground. No bird.
5. The same ash pile with a single orange ember glowing in it.
6. A tiny newborn chick rising from the ash, pale and soft.
7. A half-grown fledgling, small flames returning at crest and tail.
8. The full phoenix, perched, identical to the reference.

Background is 100% solid flat magenta #FF00FF, no gradients, no shadow, no
ground plane, no text, no labels, no borders and no visible lines between
cells. Cells are connected only by solid magenta.

The entire subject must fit fully inside its own cell. No wing, tail, flame,
ember or spark may cross a cell edge. Leave equal magenta margin on all four
sides. The subject fills about 60% of its cell. Use the same silhouette scale
in every frame; do not zoom a pose to fill its cell.
```

## Processing after generation

1. Key the magenta: distance threshold first, then flood-fill inward from the
   image edges, so any magenta-ish pixel enclosed by the artwork survives.
2. Cut the fixed 2x4 grid.
3. Quantise to the four palette colours in `palette.json`.
4. Scale each cell to 32x32 and translate to the shared y=27 ground anchor.
5. Validate with `validate_stage_a.py`.

## If frames still drift in scale

Build an anchor sheet: take the one accepted frame, repeat it mechanically into
all 8 cells at a single fixed scale and feet line, show the model both that and
the master frame, and ask it to change only the pose per cell while preserving
the anchor sheet's geometry. That constrains scale far more reliably than
asking for consistency in words.
