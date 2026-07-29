# Phoenix pet - handover

Branch: `feat/phoenix`, cut from `feat/oneko`.

## Read first

`docs/superpowers/specs/2026-07-29-phoenix-desktop-pet-design.md` is the design.
Read all of it before writing code. It already resolves most of the decisions and records why, including several that look arbitrary but are not.

## Where this is up to

Stage A has just started. Nothing is drawn yet.

Done:

- Design spec agreed and committed, including interaction model and rebirth edge cases.
- `tools/phoenix/spec/palette.json` - four entries, and the matrix legend used by the generator.
- Directory structure under `tools/phoenix/`.

Not done:

- The eight rebirth frames. This is the whole of Stage A.
- `tools/phoenix/scripts/generate_stage_a.py`.
- Any output PNG.
- The runtime engine. That is Stage D and must not be started early.

## What Stage A is

Row 3 of the sheet, eight frames of 32x32, generated as one 256x32 strip:

| Frame | Name | Content |
|---|---|---|
| 0 | burn 1 | bird intact, flame starting at the base |
| 1 | burn 2 | flame climbing, silhouette dissolving |
| 2 | burn 3 | mostly flame, bird barely readable |
| 3 | ash | small pile, no bird |
| 4 | ember | pile with a warm core |
| 5 | reform 1 | shape rising, indistinct |
| 6 | reform 2 | bird mostly formed |
| 7 | return | full perched phoenix |

**Frame 7 is the canonical character.** Every later stage inherits its head, body, wing, tail and leg geometry. It is drawn here rather than in a separate character stage, because at 32x32 in three colours a phoenix and a hawk are identical pixels - the identity is in the rebirth, so rebirth is designed first and the perched pose falls out of it.

## What makes it read as a phoenix

Silhouette, not colour, because it is monochrome for 27 of 32 frames.

Two cues do the work:

- a small crest on the head
- long trailing tail feathers

Without those it is a pigeon. An earlier handover spec called for a crestless head, but that was written for a hawk and does not apply.

## Constraints that will get this rejected if broken

- Sheet exactly 256x32 for this strip. Frames exactly 32x32. No margins or spacing.
- Fully transparent background. No partially transparent pixels anywhere.
- Maximum four visible colours, and `ember` may appear only in frames 0-6.
- Talons on y=27 in frame 7. Ash pile sits on the same baseline.
- At least one transparent pixel around every cell edge. Nothing crosses a cell boundary.
- No antialiasing, blur, glow, gradients or soft shadows. Integer pixel placement only.
- Deterministic generation from an editable matrix. **No generative image call may produce the sheet.**

## How to build it

Python and Pillow. Frames authored as 32 strings of 32 characters using the legend in `spec/palette.json`:

```
. transparent
W fill
K ink
F ember
```

Keep the bird as reusable structured data so Stages B and C can compose from the same parts rather than redrawing.

Outputs to `tools/phoenix/output/`:

- `phoenix-rebirth.png` - 256x32, transparent, production
- `phoenix-rebirth-preview.png` - 8x nearest-neighbour, 2048x256, no smoothing
- `phoenix-rebirth-grid.png` - preview with cell boundaries and the y=27 anchor marked, kept separate from production

## Validation

Write it as a script that runs and fails loudly. Assert:

- sheet is exactly 256x32
- every frame is exactly 32x32
- an alpha channel exists and no pixel is partially transparent
- no more than four visible colours
- `ember` appears in no frame after index 6
- nothing touches or crosses a cell boundary
- frame 7 has ink pixels at y=27
- the preview is an exact integer multiple with no interpolation

## Working method

Generate, render the 8x preview, **look at it**, and iterate on the matrix.
A frame that reads badly gets redrawn, never post-processed into looking acceptable.

Do not start Stage B, C or D. Stage A is approved by Hark before anything else begins.

## Still open

- Whether the site acknowledges a rebirth at all. Current recommendation is that it does not: the site is deliberately calm and a notification would be exactly the noise the redesign removed. A single `console` line is the only option under consideration.
- Movement hysteresis thresholds, to be tuned against the real site during Stage D.
- Whether the spawn perch recalculates after navigation. Probably moot, since the header uses `transition:persist` and the T does not move.

## Context you will not infer from the code

The cat on `feat/oneko` (PR #102) is the working reference. `src/components/Oneko.astro` shows the patterns this will reuse: seeding a start position from the wordmark's rect, a capture-phase mousemove blocker for sleep, carrying the element across `astro:after-swap`, and driving sprite frames from CSS keyframes so they override oneko's inline writes.

`public/oneko.js` is vendored byte-identical upstream and must stay that way. The phoenix needs its own engine; it cannot be a patch on oneko.
