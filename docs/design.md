# Design system — RetroUI (NeoBrutalism) tokens for Astro

Source: [retroui/RetroUI](https://github.com/retroui/RetroUI) · MIT ·
cloned locally at `/Users/hark/ssw/vendor/RetroUI` for reference.

RetroUI ships as React + shadcn-style components — we can't drop those into
Astro without pulling React back in. What we *can* take is the design
language: tokens are plain CSS vars, and the block patterns are trivial to
rebuild in `.astro`.

## Tokens

Copy these into `src/styles/retroui-tokens.css`, import above global.css.
They replace (don't merge with) the ADS token layer if we adopt this look.

```css
:root {
  /* Radius: NeoBrutalism is sharp. Use --radius: 0.5rem via .with-radius
     on any island where soft corners help (avatar, badge). */
  --radius: 0;

  /* Palette — RetroUI default (cream + yellow) */
  --background: #F5ECE7;
  --foreground: #000000;
  --card: #FFFFFF;
  --card-foreground: #000000;
  --primary: #FFDB33;
  --primary-hover: #FFCC00;
  --primary-foreground: #000000;
  --secondary: #000000;
  --secondary-foreground: #FFFFFF;
  --muted: #D5D5D5;
  --muted-foreground: #5A5A5A;
  --accent: #FAE583;
  --accent-foreground: #000000;
  --destructive: #E63946;
  --destructive-foreground: #FFFFFF;
  --border: #000000;
  --input: #FFFFFF;
  --popover: #FFFFFF;

  /* Chart palette — reuse for tag chips / status pills */
  --chart-1: #C4A1FF;
  --chart-2: #01FFCC;
  --chart-3: #E7F192;
  --chart-4: #000000;
  --chart-5: #FF30CD;

  /* Hard offset shadows — the signature of the style.
     Bottom-right, no blur, tracks --border colour. */
  --shadow-xs: 1px 1px 0 0 var(--border);
  --shadow-sm: 2px 2px 0 0 var(--border);
  --shadow:    3px 3px 0 0 var(--border);
  --shadow-md: 4px 4px 0 0 var(--border);
  --shadow-lg: 6px 6px 0 0 var(--border);
  --shadow-xl: 10px 10px 0 1px var(--border);
  --shadow-2xl: 16px 16px 0 1px var(--border);
}

.dark {
  --background: #1A1A1A;
  --foreground: #F5F5F5;
  --card: #242424;
  --card-foreground: #F5F5F5;
  --primary: #FFDB33;
  --primary-hover: #FFCC00;
  --primary-foreground: #000000;
  --secondary: #3A3A3A;
  --secondary-foreground: #F5F5F5;
  --muted: #3F3F46;
  --muted-foreground: #A0A0A0;
  --accent: #FAE583;
  --accent-foreground: #000000;
  --destructive: #E63946;
  --destructive-foreground: #FFFFFF;
  --border: #5C5C5C;
  --input: #FFFFFF;
  --popover: #242424;
}

/* Alt themes RetroUI ships. Add class="theme-purple" to <html>. */
.theme-purple {
  --background: #F5F5F5;
  --foreground: #1A1A1A;
  --card: #FFFFFF;
  --primary: #5F4FE6;
  --primary-hover: #4938C2;
  --primary-foreground: #FFFFFF;
  --accent: #FED13B;
  --accent-foreground: #000000;
  --border: #3A3A3A;
}
```

## Typography

RetroUI uses Google Fonts:
- **Head** — Archivo Black (heavy display)
- **Sans** — Space Grotesk (body)
- **Mono** — Space Mono
- **UI** — Geist

For our Astro build we swap the loader:

```ts
// app-level: swap the current fontsource imports
import '@fontsource/archivo-black';
import '@fontsource-variable/space-grotesk';
import '@fontsource/space-mono';
```

Then in tokens:

```css
--font-head: 'Archivo Black', system-ui, sans-serif;
--font-sans: 'Space Grotesk Variable', system-ui, sans-serif;
--font-mono: 'Space Mono', ui-monospace, monospace;
```

Newsreader + Noto Sans Gurmukhi stay for the poetry pages — RetroUI's
Archivo Black is a display face, not a reader face, so poems should keep
the editorial serif. That's the one exception to the swap.

## Core patterns to rebuild in Astro

1. **Button.** Solid `--primary` bg, `2px solid var(--border)`, `--shadow`.
   Hover: shift the block by `-2px -2px` and drop shadow to `--shadow-sm`
   so it looks like the button pressed down toward its shadow. Pure CSS,
   no JS.

2. **Card.** `--card` bg, `2px solid var(--border)`, `--shadow-md`. Nothing
   else. Content pads inside.

3. **Badge / Chip.** Small pill with `--accent` fill + solid border +
   `--shadow-xs`. Use `--chart-N` for category variants.

4. **Input.** White fill, thick border, no radius. `--shadow-xs` when focused.

5. **Alert / Callout.** Background `--accent`, border `--border`, headline
   in `--font-head`, `--shadow`. Icon on the left.

6. **Blocks.** RetroUI's block library (`blocks/hero`, `blocks/features`
   etc.) is served via their paid registry, not in the OSS repo. Copy the
   ideas — bold headline, hard shadows on preview cards, primary yellow
   call-to-action — but write the markup ourselves in `.astro`.

## Astro compatibility

**Yes.** Nothing on this list requires React:
- Tokens: pure CSS.
- Buttons/cards/badges: static markup + Tailwind classes referencing the
  tokens.
- Theme switch: reuse the existing `ThemeToggle.astro` script; just toggle
  `.dark` and/or `.theme-purple` on `<html>`.

**No** to shipping `components/ui/*.tsx` from the RetroUI repo directly —
they'd bring React back in for a wrapper library we don't need.

## Migration outline (order-of-operations)

1. Add `src/styles/retroui-tokens.css`, `@import` it above `global.css`.
2. Remove or comment out `ads-tokens.css` — the two theming stacks
   collide (RetroUI keeps borders black, ADS wraps them in translucent
   grays). Pick one.
3. Swap fonts: replace Inter → Space Grotesk, add Archivo Black.
4. Update the existing primitives (`Button.astro`, chip classes in
   `posts/index.astro`, `hk-card` styles) to use `--shadow-md` +
   `border: 2px solid var(--border)`.
5. Post header / hero: switch h1 from Newsreader to Archivo Black. Keep
   Newsreader on `.prose` body + poems.
6. Add `.with-radius` class to any island where sharp edges look wrong
   (avatar, video thumb).
7. Re-run the multi-hat audit on the retro-themed site.

## Skipped

- Cloning the block registry (paid).
- React component adoption (would reintroduce React).
- Multi-theme picker UI — one theme at a time is enough; add later if
  you want `.theme-purple` selectable in the header.
