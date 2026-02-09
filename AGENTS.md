# AGENTS.md
Guidance for coding agents working in `/Users/hark/ssw/beautiful-hark`.

## Scope and precedence
- Applies to the entire repository.
- If multiple instruction files exist, use the most specific one for files you edit.
- Rule sources reviewed:
  - `.github/copilot-instructions.md` (present and authoritative)
  - `.cursorrules` (not found)
  - `.cursor/rules/` (not found)

## Project snapshot
- Stack: Next.js 15 (App Router), React 18, TypeScript, TinaCMS.
- Package manager: pnpm (`pnpm-lock.yaml`).
- Node: `v22` (`.nvmrc`).
- Lint/format: Biome (`biome.json`).
- Alias: `@/*` maps to repository root (`tsconfig.json`).
- Styling: Tailwind CSS v4 + shadcn/ui conventions + `styles.css` tokens.

## Repository layout
- `app/`: route handlers/pages.
- `components/`: reusable UI, blocks, layout.
- `tina/`: Tina config/collections/fields/generated artifacts.
- `content/`: markdown/json content.
- `public/`: static assets and Tina admin output.

## Build, lint, typecheck, test commands
Run from repository root.

### Install
```bash
pnpm install
```

### Develop
```bash
pnpm dev
```
Runs Tina dev + Next dev (`next dev --turbopack`).

### Build
```bash
pnpm build
```
Runs `tinacms build && next build`.

### Build without cloud checks (local fallback)
```bash
pnpm build-local
```
Use when Tina cloud credentials are unavailable locally.

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
No script is defined; run:
```bash
pnpm exec biome format --write .
```

### Typecheck
No script is defined; run:
```bash
pnpm exec tsc --noEmit
```

### Tina codegen
```bash
pnpm exec tinacms codegen
```
Run after Tina schema/collection/field changes.

### Tests
- No test runner is currently configured in `package.json`.
- CI validation for PRs currently relies on `pnpm build`.

#### Running a single test (important)
- Not currently possible in this repo (no test framework wired).
- If a runner is added, use file-targeted commands, for example:
  - Vitest: `pnpm exec vitest run path/to/file.test.ts -t "case name"`
  - Playwright: `pnpm exec playwright test tests/foo.spec.ts --grep "case"`

## CI behavior to mirror locally
- `.github/workflows/pr-open.yml` does:
  1. `pnpm install`
  2. `pnpm build`
- `.github/workflows/build-and-deploy.yml` also builds with secrets and deploys static output.

## Copilot rules that must be preserved

For Tina-backed pages, keep the server/client split pattern:
1. Server `page.tsx` fetches via `client.queries.*`.
2. Server passes `query`, `data`, and `variables` to a client component.
3. Client `client-page.tsx` calls `useTina({ query, data, variables })`.
4. Editable UI elements include `data-tina-field={tinaField(...)}`.

Do not call Tina queries directly from client components.

## Code style guidelines

### Imports
- Prefer `@/` absolute imports over long relative paths.
- Keep imports grouped and organized by Biome.
- Use `import type` for type-only imports.
- Remove unused imports during edits.

### Formatting
- Follow `biome.json` as source of truth.
- Key defaults: 2 spaces, semicolons, single quotes, ES5 trailing commas, line width 160.
- Run lint/format after meaningful edits.

### TypeScript and typing
- `strict` and `strictNullChecks` are enabled; maintain strict safety.
- Prefer explicit interfaces/types at component and function boundaries.
- Prefer generated Tina types from `@/tina/__generated__/types`.
- Avoid `any`; if unavoidable, keep scope narrow and explain in code.
- Avoid non-null assertions (`!`) unless clearly safe.

### Naming and file conventions
- Components/types: PascalCase.
- Variables/functions/props: camelCase.
- Multiword file names: kebab-case.
- Route client companions use `client-page.tsx` convention.
- Keep changes minimal and consistent with nearby patterns.

### React/Next conventions
- Add `'use client';` only where client hooks/components require it.
- Prefer server components for data fetching.
- Keep `revalidate` usage aligned with neighboring routes.
- Use `notFound()` for missing content where appropriate.

### Error handling
- Wrap server-side content fetches with `try/catch` when failure is plausible.
- Fail gracefully (`notFound`, fallback UI, or error boundary) over hard crashes.
- Do not silently swallow errors; log actionable context when useful.

### TinaCMS-specific conventions
- Always pass full `{ query, data, variables }` server -> client.
- Keep `tinaField` bindings aligned with schema paths.
- Use `TinaMarkdown` for rich-text rendering.
- After schema edits: run Tina codegen/build and ensure compilation succeeds.

## Files/changes to avoid
- Do not manually edit generated files under `tina/__generated__/`.
- Do not commit secrets (for example `.env` values).
- Do not revert unrelated local changes you did not make.

## Minimal pre-PR checklist
1. `pnpm lint`
2. `pnpm exec tsc --noEmit`
3. `pnpm build` (or `pnpm build-local` when cloud env is unavailable)
4. If Tina schema changed: `pnpm exec tinacms codegen`
5. Confirm Tina pages still follow the server/client split pattern
