# AGENTS.md

Operational guide for coding agents working in this repository.

## Scope and instruction precedence

- Applies to the entire repository.
- If multiple instruction files exist, the most specific file for the edited path wins.
- `~/AGENTS.md` (Hark's personal instructions) takes precedence over this file.

## Project snapshot

- Framework: **Astro 6**. Static output with the Vercel adapter.
- CMS: TinaCMS 3, queried at build time.
- Package manager: pnpm. Vercel builds with pnpm 10.
- Node: 22 locally (`.nvmrc`), 24.x on Vercel. `engines.node` is `>=22.12.0`.
- Lint/format: Biome (`biome.json`). 2-space indent, single quotes, semicolons, line width 160.
- Styling: Tailwind CSS v4 via `@tailwindcss/vite`, with the design system in `src/styles/global.css`.
- No path alias. Use relative imports.

### There is no React

This is the single most important constraint in the repository.

The site was rebuilt on Astro specifically to remove React.
Do not add `react`, `react-dom`, `@astrojs/react`, or any dependency that pulls them in.
Interactivity is plain JavaScript in `<script>` tags, and it is expected to stay small enough to read.

Anything describing `'use client'`, `useTina`, server/client component splits, or `page.tsx` + `client-page.tsx` pairs is describing the old Next.js app and does not apply.

## Repository map

- `src/pages/` - routes. Thin by design; logic lives in components.
- `src/components/` - components. `blocks/` are Tina page blocks, `islands/` are editable regions.
- `src/layouts/` - `Base.astro`, the page shell.
- `src/content/` - CMS content. **This is the only content directory.** A root `content/` existed as a Next.js-era duplicate and was deleted.
- `src/lib/` - `data.ts` wraps Tina queries, `islands.ts` registers editable regions.
- `src/styles/global.css` - design tokens and base styles.
- `tina/` - Tina config, collections, and generated artifacts.
- `public/` - static files, plus the built Tina admin.
- `tools/` - build-time tooling not shipped to the browser.

## Commands

Run from the repository root.

```bash
pnpm install
```

### Development

```bash
pnpm dev
```

Runs Tina's dev server alongside `astro dev` on port 4321.
If it fails with `ECONNREFUSED ::1:4001`, prefix with `NODE_OPTIONS="--dns-result-order=ipv4first"`.

### Build

```bash
pnpm build        # tinacms build --content=local && astro build
pnpm build:local  # skips Tina cloud checks; use when credentials are unavailable
```

Note the colon. There is no `build-local`.

### Typecheck

```bash
pnpm exec astro check
```

There is no `tsc --noEmit` script and no `lint` script.
For Biome, use `pnpm exec biome lint` and `pnpm exec biome format --write .`.

### Preview a production build

`astro preview` **does not work** with the Vercel adapter; it throws "preview is not supported".
Serve the output directly instead:

```bash
python3 -m http.server 4322 --directory dist/client
```

## Architecture notes

### Rendering

`output: 'static'`. Every content page prerenders to a file.

Exactly one route sets `prerender = false`: `src/pages/tina-island/[name].ts`.
It exists so the Tina admin iframe can re-render an edited section, and no visitor request ever reaches it.
Removing it would remove inline visual editing and save a visitor nothing.

No ISR is involved, so ISR reads and writes are zero.

### TinaCMS in Astro

- Query at build time through `src/lib/data.ts`, which wraps the generated client.
- Mark editable values with `data-tina-field={tinaField(data, 'field')}`.
- Wrap editable regions in `<TinaIsland>` and register them in `src/lib/islands.ts`.
- Render rich text with `<TinaMarkdown>`.
- Never edit `tina/__generated__/` by hand.

## Gotchas that have already cost time

**Regenerate `tina/tina-lock.json` after any schema change.**
Tina Cloud treats the committed lock file as the branch's remote schema, so a stale lock fails the build with `ERR_CLOUD_CHECK_FAILED` and re-indexing cannot help.
`tinacms build` does **not** write it - its own output lists only `client.ts`, `types.ts` and `admin/index.html`.
Use `pnpm exec tinacms dev --no-server`, which runs the indexer and does.

**`astro check` needs `public/admin` excluded in `tsconfig.json`.**
That directory holds the 11 MB minified Tina admin SPA, and the checker dies with SIGABRT trying to parse it.
It only appears after a build, so a clean tree hides the problem.

**CI does not typecheck.**
`.github/workflows/pr-open.yml` runs `pnpm build`, and `astro build` does not run `astro check`.
Type errors reach `main` unnoticed. Run `astro check` yourself before opening a PR.

**Vercel's Framework Preset is pinned per project and does not re-detect.**
It must be Astro. It will not change because `package.json` changed.

**`SITE_URL` must be set in production.**
`astro.config.mjs` feeds it to canonical URLs, `og:url`, the sitemap and the RSS feed.
Without it the build falls back to `VERCEL_PROJECT_PRODUCTION_URL`, and previously to `VERCEL_URL`, which is per-deployment and would publish a different canonical on every deploy.

**Scoped Astro styles outrank Tailwind utilities.**
A scoped element rule beats a utility class on the same element, so the utility silently does nothing.
`.hero-media { margin: 40px 0 0 }` and `.tap { margin-block: -11px }` both bit this way.

## Code style

- Relative imports. There is no `@/` alias.
- `import type` for type-only imports.
- Keep imports organised; Biome's organize-imports is enabled.
- `strict` and `strictNullChecks` are on. Avoid `any` and non-null assertions.
- Components and types: PascalCase. Variables and props: camelCase. Multiword filenames: kebab-case.
- Prefer Tina's generated types via `src/lib/data.ts`.

## Design constraints

The site is one 640px column, six greys, and a single `--accent` that currently resolves to ink.
Tokens live in `src/styles/global.css` and colour should come from them, not literals.

WCAG AA is a floor, not an aspiration: 4.5:1 for body text, and no interactive target under 24px.
Small inline links use the `.tap` helper to reach a comfortable hit area without moving anything visually.

## Testing

No test runner is configured and no tests exist.
Verification is `astro check`, a production build, and checking the built output in a browser.

If tests are added later, prefer file-targeted commands:

- Vitest: `pnpm exec vitest run path/to/file.test.ts -t "case name"`
- Playwright: `pnpm exec playwright test tests/foo.spec.ts --grep "case name"`

## Before handing off

1. `pnpm exec astro check` - expect 0 errors.
2. `CI=true pnpm build:local`.
3. Serve `dist/client` and check the pages you touched actually render.
4. If the Tina schema changed, regenerate `tina/tina-lock.json` as described above.
5. Do not push. Hark decides when anything is pushed, and whether it is "push as it is" or "squash commit".
