# AGENTS.md
Operational guide for coding agents working in `/Users/hark/ssw/beautiful-hark`.

## Scope and instruction precedence
- Applies to the entire repository.
- If multiple instruction files exist, the most specific file for the edited path wins.
- Rule sources checked for this repo:
  - `.github/copilot-instructions.md` (present; must be followed)
  - `.cursorrules` (not present)
  - `.cursor/rules/` (not present)

## Project snapshot
- Framework: Next.js 15 (App Router) + React 18 + TypeScript.
- CMS: TinaCMS (query + visual editing workflow).
- Package manager: pnpm.
- Node runtime: `v22` (`.nvmrc`).
- Lint/format tool: Biome (`biome.json`).
- Path alias: `@/*` -> repository root (`tsconfig.json`).
- Styling stack: Tailwind CSS v4 + shadcn/ui conventions.

## Repository map
- `app/`: App Router pages/routes.
- `components/`: reusable UI and block components.
- `content/`: CMS-backed markdown/json data.
- `tina/`: Tina config and generated artifacts.
- `public/`: static files and Tina admin output.

## Setup, build, lint, and quality commands
Run all commands from repository root.

### Install dependencies
```bash
pnpm install
```

### Local development
```bash
pnpm dev
```
Runs Tina dev and Next.js dev server (`next dev --turbopack -p 3001`).

### Production build
```bash
pnpm build
```
Runs Tina build first, then Next build.

### Local build fallback (no Tina cloud checks)
```bash
pnpm build-local
```
Use when Tina cloud credentials are unavailable in local/dev CI context.

### Start production server
```bash
pnpm start
```

### Lint
```bash
pnpm lint
```
Equivalent to `biome lint`.

### Format
```bash
pnpm exec biome format --write .
```
No dedicated `format` script exists.

### Typecheck
```bash
pnpm exec tsc --noEmit
```
No dedicated `typecheck` script exists.

### Tina code generation
```bash
pnpm exec tinacms codegen
```
Run after Tina schema/collection/field changes.

## Test guidance (important)
- No test runner is currently configured in `package.json`.
- No `*.test.*` / `*.spec.*` tests are currently present.
- CI for pull requests currently validates by building (`pnpm build`).

### Running a single test
- Currently not possible because no test framework is wired.
- If tests are added later, prefer file-targeted commands, e.g.:
  - Vitest: `pnpm exec vitest run path/to/file.test.ts -t "case name"`
  - Jest: `pnpm exec jest path/to/file.test.ts -t "case name"`
  - Playwright: `pnpm exec playwright test tests/foo.spec.ts --grep "case name"`

## CI behavior to mirror locally
- `.github/workflows/pr-open.yml` runs:
  1. `pnpm install`
  2. `pnpm build`
- Match that baseline before opening/updating PRs.

## Copilot instruction highlights to preserve
From `.github/copilot-instructions.md`, keep the Tina server/client split:
1. Server `page.tsx` fetches data using `await client.queries.*(...)`.
2. Server passes all of `{ query, data, variables }` to client component.
3. Client `client-page.tsx` uses `useTina({ query, data, variables })`.
4. Editable elements include `data-tina-field={tinaField(...)}`.

Hard rule: do not call Tina queries directly from client components.

## Code style and implementation guidelines

### Imports and module boundaries
- Prefer `@/` absolute imports over deep relative imports.
- Use `import type` for type-only imports.
- Keep imports organized (Biome organize-imports is enabled).
- Remove unused imports and dead exports when touching files.

### Formatting and lint rules
- Follow `biome.json` as the source of truth.
- Defaults: 2 spaces, single quotes, semicolons, ES5 trailing commas, line width 160.
- JSON is ignored by Biome formatting in this repo; keep JSON manually tidy.
- Use `pnpm lint` and `pnpm exec biome format --write .` after meaningful edits.

### TypeScript expectations
- `strict` + `strictNullChecks` are enabled; keep code fully strict-safe.
- Prefer explicit interfaces/types at component boundaries.
- Prefer Tina generated types from `@/tina/__generated__/types`.
- Avoid `any`; if unavoidable, keep scope narrow and document why.
- Avoid non-null assertions (`!`) unless safety is obvious and local.

### Naming conventions
- Components and type names: PascalCase.
- Variables, functions, props: camelCase.
- Multiword filenames: kebab-case.
- Route pair naming: `page.tsx` (server) + `client-page.tsx` (client).

### React and Next.js conventions
- Use server components by default; add `'use client';` only when required.
- Keep data fetching on the server whenever possible.
- Align caching/revalidation behavior with nearby route conventions.
- Use `notFound()` for missing route content where appropriate.

### TinaCMS-specific conventions
- Always preserve server/client split for Tina-backed pages.
- Always pass full `{ query, data, variables }` into `useTina`.
- Keep `tinaField` references aligned to exact schema paths.
- Use `TinaMarkdown` for rich-text content rendering.
- Never manually edit `tina/__generated__/` output.

### Error handling
- Wrap failure-prone server fetches in `try/catch`.
- Fail gracefully (`notFound`, fallback UI, or boundary) instead of crashing.
- Log actionable context when catching errors; do not silently swallow failures.

### Change scope and safety
- Make minimal, surgical changes consistent with nearby patterns.
- Do not refactor unrelated areas unless requested.
- Do not commit secrets (`.env`, tokens, credentials).
- Do not revert unrelated local changes you did not create.

## Agent checklist before handoff
1. Run `pnpm lint`.
2. Run `pnpm exec tsc --noEmit`.
3. Run `pnpm build` (or `pnpm build-local` if cloud checks cannot run).
4. If Tina schema changed, run `pnpm exec tinacms codegen`.
5. Verify Tina pages still follow the required server/client split.
