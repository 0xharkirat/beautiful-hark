# Tales of Hark

Personal website and blog of Hark Singh.
🦙 TinaCMS + 🚀 Astro + ▲ Vercel

Live at [harksingh.com](https://harksingh.com).

Mostly vibe coded.
I talk through how I do it in [Vibe blogging video](https://www.youtube.com/watch?v=buaXi8Hh420).

## Stack

| Concern | Choice |
|---|---|
| Framework | Astro 6, `output: 'static'` |
| CMS | TinaCMS 3, with visual editing |
| Styling | Tailwind CSS 4 |
| Content | MDX and JSON in `src/content/` |
| Hosting | Vercel, via `@astrojs/vercel` |
| Package manager | pnpm, Node 22 |

## Run it locally

Install dependencies.

```bash
pnpm install
```

Copy the example environment file and fill in your TinaCloud credentials from [app.tina.io](https://app.tina.io).

```bash
cp .env.example .env
```

| Variable | What it is |
|---|---|
| `PUBLIC_TINA_CLIENT_ID` | TinaCloud project client ID |
| `TINA_TOKEN` | TinaCloud read and write token |
| `SITE_URL` | Canonical origin, used for feeds and the sitemap |
| `PUBLIC_GA_ID` | Google Analytics ID, optional |

Start the dev server.
It runs Tina's local GraphQL server alongside Astro.

```bash
pnpm dev
```

| URL | What it serves |
|---|---|
| `http://localhost:4321` | the site |
| `http://localhost:4321/admin` | the Tina editor, click **Enter Edit Mode** |
| `http://localhost:4001/altair/` | GraphQL playground |

## Commands

```bash
pnpm dev          # Tina + Astro
pnpm build        # production build, needs TinaCloud credentials
pnpm build:local  # build with no TinaCloud, for offline work
pnpm preview      # serve the build
pnpm exec astro check   # typecheck, including .astro files
pnpm test:touch   # Hawky's touch behaviour, needs pnpm dev running
```

`pnpm test:touch` drives a real iPhone emulation with real touch events, because the thing it guards is that a scroll and a tap start out identical and only one of them may move the bird.
Playwright skips its browser download on install, so run `pnpm exec playwright install chromium` once before the first run.

Run `pnpm exec tinacms dev --no-server` after changing the Tina schema.
It rewrites `tina/__generated__` and `tina/tina-lock.json`, and a stale lock against a changed schema fails the deploy.

## Content

| Collection | Lives in |
|---|---|
| `page` | `src/content/pages/` |
| `post` | `src/content/posts/` |
| `poem` | `src/content/poems/` |
| `tag` | `src/content/tags/` |
| `author` | `src/content/authors/` |
| `global` | `src/content/global/index.json` |

A page is either assembled from blocks, like Home and About, or written as prose in a rich-text body.
Both live in the same collection.

## Routes

| Route | What it is |
|---|---|
| `/` | latest writing and poems |
| `/about` | about |
| `/posts`, `/posts/<slug>` | blog |
| `/poems`, `/poems/<slug>` | poetry |
| `/recommendations` | films, shows, books, music and videos, with a checklist |
| `/hawky` | the phoenix that follows your cursor |
| `/feed.xml`, `/atom.xml`, `/feed.json` | feeds |
| `/admin` | Tina editor |

## Deploy

Vercel builds on push.
`VERCEL_GIT_COMMIT_REF` tells Tina which content branch to read, so preview deployments edit their own branch.

Set `PUBLIC_TINA_CLIENT_ID` and `TINA_TOKEN` in the project's environment variables, and set the framework preset to Astro.

## License

[Apache 2.0](./LICENSE).
