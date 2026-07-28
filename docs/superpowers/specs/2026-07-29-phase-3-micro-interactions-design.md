# Phase 3 — Micro-interactions

Date: 2026-07-29
Branch: `feat/quiet-redesign`
Status: approved, ready for planning

## Context

Phases 1 and 2 removed things. The site is now one 640px centred column,
six greys with a single `--accent`, serif for Hark's writing and sans for
site chrome. Nothing competes with the text.

Phase 3 adds motion back — deliberately, and in a fixed number of places.

The two reference sites disagree on motion. `brookjeynes.dev` is whimsical:
a cursor-following cat, retro 88×31 badges, grid paper. `emilkowal.ski` has
no whimsy at all; its motion is invisible craft. Hark chose the playful
direction, "but keep it very strict" — curated fun rather than scattered
fun. Every playful moment has to earn a slot, and the number of slots is
fixed at three.

## Scope

| Slot | What |
|---|---|
| 1 | oneko cat, all pages |
| 2 | Page transitions |
| 3 | Video interaction |

Plus two defects and two content changes that belong with this work.

### Deferred

Whether `HarkLogo`'s cursor-tracking eyes stay or become static art.
The logo currently tracks the pointer (body ±20, eyes ±45 SVG units).
With the cat added, two separate things follow the cursor, which may read
as busy. **Decide after the cat is on screen, not before.** If they
conflict, the cat wins and the logo keeps its eyes as static art.

### Out of scope

- 88×31 retro badges — Brook's signature, not Hark's.
- Animated theme toggle.
- Reading-position indicator.
- Any motion inside `.prose`.
- Reskinning the cat sprite. Ship the default black cat; reskin is its own
  decision later.

### Forks worth evaluating at implementation time

Upstream [adryd325/oneko.js](https://github.com/adryd325/oneko.js) is the
canonical version and the one Brook uses. Before vendoring, compare against
[rozbrajaczpoziomow/fork-oneko.js](https://github.com/rozbrajaczpoziomow/fork-oneko.js),
which adds scroll handling (the cat keeps its position relative to the page
rather than the viewport) and alternate sprites.

Scroll handling matters here specifically because the cat runs on long
reading pages. On upstream the cat is `position: fixed` and stays put
while the page scrolls under it; the fork can follow the document instead.
Decide by testing both on a long post — this is a feel question, not a
spec question.

## 1. The cat

[oneko.js](https://github.com/adryd325/oneko.js) — MIT, ~200 lines, one
sprite sheet, zero dependencies. Vendored rather than added as a package:
it is deliberately unmaintained upstream, and the sprite may be replaced
later.

**Assets.** Two files, both into `public/`:

| File | Purpose |
|---|---|
| `public/oneko.js` | The script, loaded with `is:inline` |
| `public/oneko.gif` | Sprite sheet the script references by absolute path |

The upstream script hardcodes `/oneko.gif`, so the sprite must sit at the
web root. Keep the MIT header comment intact in the vendored copy.

**Behaviour.** Follows the cursor; sleeps when the cursor is idle; has
alert, scratch, yawn and eight-direction run states.

The idle behaviour is why "every page" is safe. While someone reads, the
mouse is parked, so the cat curls up and sleeps. It only moves when the
reader moves — which is precisely when they are not reading.

**Placement.** Every page, including `/posts/[slug]` and `/poems/[slug]`.

**Presentation.**

| Property | Value |
|---|---|
| Size | 32px |
| Sprite | Default black cat |
| Position | `fixed` |
| `z-index` | 20 (below the skip link at 60) |
| `pointer-events` | `none` |
| ARIA | `aria-hidden="true"` |

**Hidden when:**

- `prefers-reduced-motion: reduce` — continuous motion, so it is removed
  outright rather than reduced. `display: none`.
- `(hover: none)` — no cursor to follow on touch; it would sit in a corner
  looking broken.

**Surviving navigation.** oneko appends its own element to `<body>`, which
`ClientRouter` replaces on swap. A guarded re-init on `astro:page-load`
keeps exactly one cat alive across the site. The guard must prevent a
second cat if the script runs twice.

## 2. Page transitions

`ClientRouter` is already installed and performing a default cross-fade.
This slot is mostly restraint plus one fix.

- Add `transition:persist` to the header so the nav does not flash on every
  navigation.
- Keep Astro's default fade. No custom durations or curves.
- Astro disables view transitions under `prefers-reduced-motion` natively;
  nothing extra needed.

The transition should be felt, not noticed.

## 3. Video interaction

### Structure

The whole figure becomes one real `<button>`: absolutely positioned at
`inset: 0`, transparent background, `cursor: pointer`, carrying
`aria-pressed` and an `aria-label`.

A single element gives click-anywhere, keyboard access, and correct
screen-reader announcement. The chip inside is `aria-hidden` decoration.

Because the entire surface is the hit area, **the chip does not need to
meet a minimum target size.** It is an indicator, not a control. That is
what allows it to be small and properly systematised.

**Focus ring.** The global `:focus-visible` rule is
`2px solid var(--accent)` at `outline-offset: 3px`. `--accent` resolves to
near-black, and a 3px *outward* offset would put the ring on the page
background rather than on the media. Over a photograph that is both
low-contrast and misplaced. This button therefore overrides it:

```css
.sound-toggle:focus-visible {
  outline: 2px solid rgba(255, 255, 255, 0.9);
  outline-offset: -4px;   /* inset, so it lands on the video */
}
```

White at 90% clears 3:1 against every frame of this particular video. If
the hero clip is ever replaced with a lighter one, this needs rechecking.

### Chip

Previously ad-hoc (`border-radius: 999px`, hardcoded `rgba`, arbitrary
`14px` padding, `min-height: 44px`) while the rest of the site uses 4px
radii, grey tokens and a defined type scale.

| Property | Value | Reason |
|---|---|---|
| Font family | `var(--font-sans)` | Site chrome is sans |
| Font size | 13px | Matches `.meta` |
| Line height | 1 | |
| Radius | 4px | Site radius, not a pill |
| Padding | `7px 10px` | |
| Gap | 7px | |
| Background | `rgba(0, 0, 0, 0.5)` + `backdrop-filter: blur(8px)` | Must stay legible over a photograph, so it cannot use `--paper` |
| Colour | `rgba(255, 255, 255, 0.92)` | |
| Inset | 12px from bottom-right | |

### States

| State | Label | Dot |
|---|---|---|
| Muted | `sound off` | 6px, `rgba(255, 255, 255, 0.5)` |
| Unmuted | `sound on` | 6px, `#8fe3b8` with a soft ring |

### Hover

Chip only:

- `opacity: 0.6 → 1`
- `translateY(0 → -2px)`
- 180ms

**The video image itself does not move.** It is already a moving,
meditative thing; scaling or brightening it fights the calm the earlier
phases bought, and scale on video tends to look cheap.

### Muting

Three routes, all functional:

1. **Click again.** Symmetrical toggle, always available.
2. **Keyboard.** Enter or Space on the focused button.
3. **Automatic.** An IntersectionObserver with `threshold: 0.5` mutes the
   video when it leaves that threshold.

Route 3 is a convenience and never a substitute for route 1. Audio that
follows a reader down into a poem is the failure case being designed out.

**All three routes go through one `setSound(on)` function** which updates
the video, the `aria-pressed` attribute, the chip label and the dot
together. Auto-mute must not be able to leave the chip reading `sound on`
while the video is silent — the chip is the only signal the reader has,
so a lying chip is worse than no chip.

Scrolling back into view does **not** re-enable sound. Unmuting is always
a deliberate act.

### Volume

Fade in and out rather than cutting, using the existing
`requestAnimationFrame` approach. Unmuting can pause the element under
autoplay policy, so `play()` is called after unmuting, with the rejection
swallowed.

## 4. Defects

### 4.1 Video dead after client-side navigation

**Reproduced.** First load: `paused: false`, `currentTime: 5.03`,
`readyState: 4`. After navigating to `/posts` and back to `/`:
`paused: true`, `currentTime: 0`, `readyState: 0`.

`readyState: 0` (`HAVE_NOTHING`) is the diagnostic — the media resource
never began loading. A `<video>` inserted into the DOM by a script does
not reliably re-run the browser's media load algorithm, so the `autoplay`
attribute never fires.

**Fix.** On `astro:page-load`, for each autoplay video still at
`readyState 0`, call `load()` then `play()`, swallowing the rejection.

**Verification.** Navigate home → `/posts` → home and assert
`paused === false` and `readyState > 0`.

### 4.2 Hero CTAs

Remove "Read the Blog" and "About Hark":

- the `actions` render from `Hero.astro`
- the `actions` field from `hero.template.ts`
- the entries from `src/content/pages/home.mdx`

All three together. Removing the render while keeping a dead CMS field
would be worse than either change alone.

## 5. Footer colophon

Re-render the existing `footer.colophon` field, which survives in both the
schema (`tina/collections/global.ts`) and the content
(`src/content/global/index.json`, currently `Built with` / `TinaCMS` /
`https://tina.io`). It stopped rendering during the Phase 1 rewrite.

**Layout.** Right-aligned, sharing a row with the Memento Homo tagline on
the left. Already Tina-editable; no schema change.

**Wrapping.** On narrow viewports the row stacks, and the colophon
left-aligns rather than staying right-aligned against nothing.

## 6. Motion rules

One rule governs the phase:

`prefers-reduced-motion: reduce` removes the cat entirely (`display: none`),
disables view transitions (native to Astro), and collapses the chip's hover
to an instant state change.

The global reduced-motion block in `global.css` already forces
`transition-duration` to near-zero site-wide, so only the cat needs an
explicit rule.

## Success criteria

1. The cat appears on every page, sleeps when the cursor is idle, and
   survives client-side navigation without duplicating.
2. The cat is absent under `prefers-reduced-motion` and on touch devices.
3. The header does not flash during navigation.
4. Clicking anywhere on the hero video toggles sound; clicking again mutes.
5. The chip is always visible and always shows the current state.
6. Scrolling the video half out of view mutes it.
7. The video plays after navigating away and back (`readyState > 0`).
8. The hero has no CTA links.
9. The footer shows a right-aligned "Built with TinaCMS" linking to tina.io.
10. The chip never disagrees with the video's actual muted state, on any
    of the three mute routes.
11. The video button shows a visible focus ring when reached by keyboard.
12. `astro check` passes; no new contrast or tap-target regressions,
    measured the same way as the Phase 1 review.
