# Generation prompt - vertical walk rows

Two rows, `walkToward` and `walkAway`, for Task 4 of the Hawky facing plan.
Same method as `GENERATION_PROMPT.md`: one action per sheet, flat magenta background, containment stated explicitly.

Attach `tools/phoenix/reference/codex-walk-raw.png` as the visual reference.
That is the accepted side-profile walk, so it fixes the identity, the proportions and the stride timing that these two have to match.

## Naming

Rows are named by what you see, not by which way the bird travels.

| Row | You see | It moves |
|---|---|---|
| `walkToward` | its face | down the screen |
| `walkAway` | its back | up the screen |

## Row 8, walkToward

```text
Use the image just shown as the visual reference for character identity.

A 2x4 pixel art sprite sheet, exactly 8 equal cells, 2 rows of 4, showing one
continuous walk cycle of a phoenix seen FROM THE FRONT, walking straight toward
the viewer. Read left to right across the top row, then continue on the bottom
row.

The bird faces the camera head on. You see its chest, its face, its grey beak
pointing at the viewer, the orange flame crest on top of its head, and both legs.
The orange flame tail is mostly hidden behind the body, showing only at the edges.

Keep fixed in every cell: the same phoenix identity, the same palette of white
body, black outline, grey beak and orange flame, the same art style, the same
camera distance, and the same head height. Only the legs and the body's side to
side rock change between frames.

The 8 frames are two complete strides. Frame 1 left leg forward, body rocked
slightly left. Frame 2 legs passing, body centred. Frame 3 right leg forward, body
rocked slightly right. Frame 4 legs passing, body centred. Frames 5 to 8 repeat
that cycle one step further on, so frame 8 loops back into frame 1 cleanly.

The head must not bob up and down between frames. Only the body rocks side to
side, by one or two pixels at most.

Background is 100% solid flat magenta #FF00FF, no gradients, no shadow, no ground
plane, no text, no labels, no borders and no visible lines between cells. Cells
are connected only by solid magenta.

The entire subject must fit fully inside its own cell. No wing, tail, flame, ember
or spark may cross a cell edge. Leave equal magenta margin on all four sides. The
subject fills about 60% of its cell. Use the same silhouette scale in every frame;
do not zoom a pose to fill its cell.
```

Save to `tools/phoenix/reference/codex-walktoward-raw.png`.

## Row 9, walkAway

```text
Use the image just shown as the visual reference for character identity.

A 2x4 pixel art sprite sheet, exactly 8 equal cells, 2 rows of 4, showing one
continuous walk cycle of a phoenix seen FROM BEHIND, walking directly away from
the viewer. Read left to right across the top row, then continue on the bottom
row.

You see the bird's back. No beak and no face are visible. The orange flame crest
shows over the top of its head, the orange flame tail hangs down the centre of its
back and is the most prominent feature, and both legs are visible below the body.

Keep fixed in every cell: the same phoenix identity, the same palette of white
body, black outline and orange flame, the same art style, the same camera
distance, and the same head height. Only the legs and the body's side to side rock
change between frames.

The 8 frames are two complete strides, matching the front-facing sheet exactly:
frame 1 left leg forward, frame 2 legs passing, frame 3 right leg forward, frame 4
legs passing, then frames 5 to 8 repeat one step on so frame 8 loops into frame 1.

The head must not bob up and down between frames. Only the body rocks side to
side, by one or two pixels at most.

Background is 100% solid flat magenta #FF00FF, no gradients, no shadow, no ground
plane, no text, no labels, no borders and no visible lines between cells. Cells
are connected only by solid magenta.

The entire subject must fit fully inside its own cell. No wing, tail, flame, ember
or spark may cross a cell edge. Leave equal magenta margin on all four sides. The
subject fills about 60% of its cell. Use the same silhouette scale in every frame;
do not zoom a pose to fill its cell.
```

Save to `tools/phoenix/reference/codex-walkaway-raw.png`.

## Processing, once both raw sheets exist

```bash
python3 tools/phoenix/scripts/build_row.py tools/phoenix/reference/codex-walktoward-raw.png walkToward --use-profile --anchor baseline
python3 tools/phoenix/scripts/validate_row.py walkToward
python3 tools/phoenix/scripts/build_row.py tools/phoenix/reference/codex-walkaway-raw.png walkAway --use-profile --anchor baseline
python3 tools/phoenix/scripts/validate_row.py walkAway
```

Then add both names to `ROWS` in `tools/phoenix/scripts/assemble_sheet.py` and rebuild.
The sheet goes from 256x224 to 256x320 and no CSS changes, because nothing sets `background-size`.

## What will most likely need a retry

The rear view is the risk. A bird seen from behind is a featureless lump unless the crest breaks the head silhouette and the tail reads clearly down the back.
Check frame 1 of `walkAway` against frame 1 of `walkToward` at 1:1, not zoomed. A rear view that only reads at 5x is not doing its job.

The other likely retry is stride sync. Both cycles must advance on the same frames as the side walk, or the bird changes gait when it turns a corner.
