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

## The letter T is where it starts, not where it lives

The pet spawns perched on the "T" of "Tales of Hark".
After that it follows the cursor and never homes back, exactly like the cat.

Homing was considered and dropped.
A pet that keeps flying back to the header competes with the text for attention, and it makes every idle moment a journey across the page.
The T earns its place as a first impression rather than a destination.

The perch is measured at runtime from the glyph, not hardcoded.
A `Range` over the first character of `header .wordmark span` gives its rect;
the perch point is the top edge of that rect.
The existing cat already seeds its start position from `.wordmark`'s bounding box, so the mechanism is proven and only the precision changes.

## Interaction

| Input | Result |
|---|---|
| single click | toggle sleep, as the cat does |
| double click | rebirth |
| top of the hour | rebirth, 24 times a day |

### The click collision

A double click fires `click`, `click`, `dblclick` in that order.
Handled naively, a double click would start the sleep sequence, undo it, then burn - a visible flicker every time.

So the single click is debounced by 250ms.
A second click inside that window means rebirth; otherwise the sleep toggle runs.
The cost is a 250ms delay on sleep, which is standard and imperceptible.

### Movement, and when it lands

Landing whenever the cursor stops and taking off whenever it moves would produce takeoff and landing spam on every twitch of the mouse.
That reads as twitchy, which is wrong for a site built to be calm.

Hysteresis instead, roughly mirroring how birds actually move:

| Distance to cursor | Behaviour |
|---|---|
| under ~32px | nothing; deadzone kills jitter |
| ~32 to 100px | hop, stays grounded |
| over ~100px | takeoff, fly, land |
| idle for 2s | settle into perched idle |

Landing happens only after it has been still for a beat, and takeoff only when the trip is long enough to be worth it.
Exact thresholds are to be tuned against the real site, not decided here.

## Rebirth mechanics

### Clock

Rebirth fires on the hour, local time.

**Poll, do not schedule.**
A `setTimeout` to the next hour breaks on laptop sleep, DST and manual clock changes: sleep the machine for six hours and it fires late or never.
Checking `new Date()` every ~20s against the last-seen hour is immune to all of that and costs nothing.

**Defer while hidden.**
Browsers throttle timers in background tabs, so a hidden rebirth would be both late and unwatched.
If the hour passes while `document.hidden`, hold it and fire on the next `visibilitychange`.

**Fire once, not once per missed hour.**
A tab hidden for six hours gets one rebirth on return.

**Persist the fired hour.**
The site is client-side routed, so without persistence every navigation inside the same hour would refire.
Store the key as `YYYY-MM-DD-HH` in localStorage, which also handles date rollover.

**Grace period.**
No rebirth within ~20s of load.
Landing at 2:59:58 and watching the bird instantly immolate reads as a bug, not a feature.

### While asleep

Rebirth plays in full, then the bird returns to sleeping rather than waking.

Sleep is an explicit instruction from the reader and overriding it would feel like the pet ignoring them.
Skipping rebirth entirely would mean anyone who prefers it asleep never sees the headline feature.
Playing it and going back to sleep honours both.

### Layering during rebirth

The pet normally renders at `z-index: -1`, behind content, so it can never cover a word being read.

Rebirth lifts it above content for the duration, then drops it back.

Without this the one moment worth watching happens behind a paragraph.
It is a roughly five second event, so the intrusion is bounded and rare.

### Other rules

- Rebirth is **not interruptible**. Clicks during the burn are ignored, or the bird ends up in a half-burnt state.
- Rebirth happens **in place**, including mid-flight: it freezes, burns, and reforms where it was. No falling ashes, no special case.
- Under `prefers-reduced-motion` the pet never loads at all, so rebirth never arises.

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

- Whether the site acknowledges a rebirth at all, or the bird just does it.
- Whether the spawn perch is recalculated after a client-side navigation, given the header already uses `transition:persist` so the T does not move.
- Whether two open tabs burning simultaneously at the hour is charming or noisy. Assumed charming; they are separate pets.
- Exact hysteresis thresholds, to be tuned against the real site.

## Out of scope

- Obstacle and edge awareness. Deferred from the cat work and unchanged by this.
- Separate shadow strip. Reconsider only if flight reads as flat without it.
- Left-facing artwork. Mirroring only.
