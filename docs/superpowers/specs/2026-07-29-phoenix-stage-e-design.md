# Phoenix Stage E - directions, states, and the hover bubble

Date: 2026-07-29
Branch: to be cut from `feat/phoenix`
Status: proposed, not started

Stages A to D shipped a working phoenix: four rows of eight frames, perching on
the T, following the cursor, sleeping on click, burning on the hour.
This covers what to add next and, in two places, argues against copying oneko directly.

## 1. Directions

oneko has eight: N, NE, E, SE, S, SW, W, NW, two frames each, sixteen of its
thirty-two frames.
Copying that shape for a bird would need six new sheets before mirroring.

**Do not copy it.** A cat reads from behind because the tail and ear silhouette
survive at 32px.
A bird flying directly away is a blob with two lumps, and a bird flying
directly at the viewer is nearly the same blob.
The cat's directional set works because a cat's outline changes a lot with
heading; a bird's changes far less, and what does change is mostly wing phase.

Three flight aspects instead of eight headings:

| Aspect | Covers | Source |
|---|---|---|
| side | E and W | exists, mirrored |
| front | N and S | new row |
| three-quarter | NE, SE, NW, SW | new row, mirrored |

That is two new rows for full directional coverage, against six.
The reference sheet already contains a usable front-facing flight row, so the
art is known to work at this size.

Heading picks the aspect by angle: within 30 degrees of horizontal uses side,
within 30 degrees of vertical uses front, everything else uses three-quarter.
Mirroring still handles left from right.

## 2. Sleep, alert, and scratch

The perched row already has sleep at column 6 and waking at column 7, plus
ruffle and preen, so most of oneko's idle vocabulary is present.
What is missing is the **zZ**, which is the part that actually communicates
sleep at a glance.

oneko bakes the Z characters into its sleeping sprite rather than compositing
them, which keeps it to one element and one draw.
Do the same: regenerate the perched row with zZ on the two sleep frames.
No new frames, no second element.

A distinct alert frame is worth adding while the row is being regenerated.
Scratch is already covered by ruffle and preen; a third idle of the same kind
would not be noticed.

## 3. The hover bubble

Show an 8-bit speech bubble on hover reading the time until the next rebirth.

### The problem nobody would predict

**The bird cannot be hovered.** It is `pointer-events: none` at `z-index: -1`,
so it never receives pointer events, and `:hover` can never fire on it.
That is not incidental, it is what stops the bird eating clicks meant for the
text it sits behind.

So hover is detected by coordinate, reusing the `mousemove` listener the engine
already has: if the cursor stays inside the bird's box plus padding for about
400ms, show the bubble.
The same technique the click handler already uses.

A second consequence follows: while the cursor is over the bird it is really
over whatever content the bird is behind.
Text selection and link hovers must keep working normally underneath, so the
bubble must be display-only and must not capture pointer events either.

### The bubble

Unlike the bird, the bubble must sit **above** content or it is pointless.
It is small, transient, and only appears on deliberate hover, so the intrusion
is bounded.

An 8-bit bubble is a deliberate stylistic exception on a site that is otherwise
six greys and one serif.
It is defensible for the same reason the flames are: this is the one playful
object on the page, and a bubble drawn in the site's own type would read as a
tooltip rather than as part of the creature.
Worth stating explicitly rather than drifting into it.

Contents: `next rebirth 23:41`, counting down to the top of the hour, updating
once a second while visible only.

## 4. The Hawky page

A page explaining the interactions: click to sleep and wake, double click to
see the rebirth, hover for the timer, and that it follows the cursor.

**Naming needs deciding.** "Hawky" comes from the abandoned hawk spec; the
creature is now a phoenix. Either is fine, but the page title is user-facing and
should be chosen on purpose:

- name the bird Hawky and keep the page title
- call the page something phoenix-shaped and drop Hawky

The page is also the natural home for the making-of, which is blog material:
why the hand-drawn attempt failed, why a transparent background cannot be
generated, why the scale profile exists.

## Frame budget

Current sheet is 256x128, four rows of eight.
Adding front and three-quarter flight makes it 256x192, six rows.

Row order stays a runtime contract: perched, launch, flight, rebirth, then the
two new flight aspects appended so existing indices do not move.

## Order of work

1. Regenerate the perched row with zZ and an alert frame. Smallest change,
   and it validates that a regenerated row still matches the scale profile.
2. Front flight row.
3. Three-quarter flight row, plus heading selection in the engine.
4. Hover bubble.
5. The page.

Each row goes through the existing pipeline unchanged: generate on magenta,
`build_row.py --use-profile`, `validate_row.py`.

## Out of scope

- Obstacle and edge awareness. Deferred twice now.
- Landing and takeoff per direction. The existing launch row is side-view and
  that is enough; a directional takeoff would triple the row for a moment
  nobody watches.
- Reskinning the sprite. The character is locked.
