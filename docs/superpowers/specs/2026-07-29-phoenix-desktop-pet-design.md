# Phoenix desktop pet - design

Date: 2026-07-29
Branch: `feat/phoenix`, cut from `feat/oneko`
Status: direction agreed, sprite work not started

## What this replaces

A handover spec proposed a monochrome hawk in 8 stages, 64 animation frames plus an 8-frame shadow strip.
This document keeps its good parts, which are the fixed 32x32 grid, the shared ground anchor, the deterministic pixel generation and the refusal to fix a bad sprite in post-processing.
It rejects its scope and its ordering, for reasons below.

## Why a phoenix, and what that actually means

A hawk is a bird.
A phoenix belongs on a site called Tales of Hark, and unlike a hawk it has a loop: burn, ash, rebirth.
That gives the pet something to do over time rather than only chasing a cursor.

**The identity lives in the animation, not the sprite.**
At 32x32 in three colours, a phoenix and a hawk are the same pixels.
What separates them is fire and colour, and a monochrome palette removes both.

This is why the handover spec's first stage was wrong.
"Stage 0: character design lock" would have spent a whole stage locking a generic bird, then discovered later that nothing about it read as a phoenix.
Rebirth is the character. It gets designed first, and the perched pose falls out of it.

## Home is the letter T

The pet lives on the "T" of "Tales of Hark" in the site header.
It leaves the T to follow the cursor, returns to the T when idle, and burns and is reborn on the T.

This is the reason to build this at all rather than ship another cursor-follower.
It is specific to this site and cannot be lifted wholesale.

The anchor is measured at runtime from the glyph, not hardcoded.
A `Range` over the first character of `header .wordmark span` gives its rect;
the perch point is the top edge of that rect.
The existing cat already seeds its start position from `.wordmark`'s bounding box, so the mechanism is proven, only the precision changes.

## Palette

Four colours total. Three are the existing monochrome set.

| Role | Use |
|---|---|
| transparent | background |
| near-white | body fill |
| near-black | outline and detail |
| one warm | **burn and rebirth frames only** |

The warm colour appears in 5 of 32 frames and drains away afterwards.

The site is deliberately six greys with `--accent` pointing at ink.
Colour is therefore an event, not a state: rare, brief, and the only place it appears on the entire site.
A permanently warm bird would fight the calm the redesign bought.
A bird that catches fire once in a while does not.

## Sheet layout

256x128, 8 columns x 4 rows, 32 frames of 32x32.
Identical to oneko's grid, so frame maths, the sprite-set structure and the existing tooling all carry over unchanged.

| Row | Frames | Contents |
|---|---|---|
| 0 | 8 | perched: idle, blink, look, ruffle, preen, sleep A, sleep B, wake |
| 1 | 8 | hop x4, takeoff x4 |
| 2 | 8 | flight: flap cycle and glide |
| 3 | 8 | **burn x3, ash, ember, reform x2, return** |

Row 3 is the entire point.
The handover spec allocated zero frames to it while spending eight on hovering, air braking and banking.

### On the cut

oneko is 32 frames, 3 colours, 16 named states, and reads as a complete character with personality despite having no flight at all.
The handover spec proposed 72 frames for something that follows a cursor on a blog.
States like air brake, banking upward and controlled descent would be visible for roughly 80ms each and never noticed.

Left-facing frames are produced by exact pixel mirroring at runtime, never drawn or generated separately.

## Anchors

- Ground anchor: x=16, y=27 within each cell, as in the handover spec.
- Perched frames put the talons on y=27.
- Flight frames keep the body centre consistent across the row.
- At least 1 transparent pixel around every cell edge; no content crosses a cell boundary.
- Altitude is expressed by moving the sprite up inside its cell, never by changing the logical anchor.

## The engine is new

oneko.js is vendored byte-identical and must stay that way on `feat/oneko`.
It cannot do perching, homing to a glyph, or rebirth: it walks in a straight line toward the cursor and that is the whole algorithm.

So this needs its own movement code.
That is a feature, not a cost: it is what makes the thing publishable on its own and worth writing about.

Behaviour beyond oneko:

- Return to the perch when the cursor is idle, rather than stopping wherever it happens to be.
- Land on the perch, not near it.
- A rebirth cycle on a long timer, or on some trigger to be decided.
- Respect `prefers-reduced-motion` and `(hover: none)` by not loading at all, as the cat already does.

## Build in-repo first, extract later

Develop inside this site so it can be tested against real pages, real navigation and the real header.
Extract to a standalone package once the behaviour is settled.

Packaging first would slow every iteration and freeze an API before the behaviour is known.

## Stages

Four stages, not eight.

**Stage A - rebirth design.**
Row 3 only. Burn, ash, ember, reform, return.
This is the identity check: if the rebirth does not read at 32x32, nothing else matters and the concept changes before more work lands.

**Stage B - perched row.**
Row 0. Idle through wake, anchored on the T.
Frame 0 must match the last frame of Stage A's return exactly.

**Stage C - flight and transitions.**
Rows 1 and 2. Hop, takeoff, flap, glide.
Takeoff frame 0 continues from perched idle; the last landing frame returns to it.

**Stage D - engine.**
Perch homing, cursor following, the rebirth trigger, mirroring, reduced-motion and touch handling.

Each stage is frozen before the next begins.
A malformed frame is redrawn, never disguised by post-processing.

## Method

Deterministic pixel generation, as the handover spec correctly required.
Python and Pillow writing from an editable pixel matrix, so the head, body, wings and tail are reusable structured data across every frame rather than redrawn per pose.

No generative image call produces the sheet.

## Validation

Automated, run on every stage:

- sheet is exactly 256x128
- every frame is exactly 32x32
- alpha channel present, no partially transparent pixels
- no more than 4 visible colours, and the warm colour appears only in row 3
- nothing touches or crosses a cell boundary
- previews use nearest-neighbour scaling only
- perched frames have talon pixels at y=27

## Open questions

- What triggers rebirth: a long timer, a visit count, a click, or something on the page.
- Whether the pet is silent about the rebirth or the site acknowledges it.
- Whether the perch survives client-side navigation, given the header already uses `transition:persist`.

## Out of scope

- Obstacle and edge awareness. Deferred from the cat work and unchanged by this.
- Separate shadow strip. Reconsider only if flight reads as flat without it.
- Left-facing artwork. Mirroring only.
