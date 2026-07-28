# Ship Astro to Vercel - Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Get the Astro rebuild of Tales of Hark live on the existing Vercel project, replacing the Next.js app, with page weight cut from ~1.9 MB to under 60 KB and TinaCMS visual editing intact.

**Architecture:** Two shrink tasks, a verification pass, then merge. The Vercel
adapter stays. Content pages are already prerendered to static files; the one
serverless function serves only the Tina admin iframe, so it costs a visitor
nothing and removing it would cost visual editing.

**Tech Stack:** Astro 6, TinaCMS 3, `@astrojs/vercel`, Tailwind 4, sharp, pnpm.

## Why the adapter stays

An earlier draft of this plan converted the site to pure static and dropped the
adapter. That was aimed at Cloudflare static hosting. On Vercel it is wrong, and
the generated routing table is the evidence:

| Route | Destination |
|---|---|
| `/tina-island/*` | `_render` function |
| `/_image` | `_render` function |
| `/_server-islands/*` | `_render` function |
| everything else | static file |

Exactly one file in `src/` sets `prerender = false`, and it is
`src/pages/tina-island/[name].ts`. Every post, poem, tag and page is a prebuilt
static file served from Vercel's CDN. **No visitor request reaches the
function.** It exists solely so the Tina admin iframe can re-render an edited
section.

Deleting it would have removed zero bytes from any page a reader loads, and
removed visual editing entirely. The measured page-weight problem is the logo,
which Task 1 fixes completely.

## Global Constraints

- **No React.** Nothing in this plan may add `react`, `react-dom`, or `@astrojs/react`.
- **No new runtime dependencies.** `sharp` is already a dependency, used at build time only.
- **No co-author trailer.** AGENTS.md forbids auto-adding an agent as co-author. Commits use the repo's local git config identity (`0xharkirat <65155920+0xharkirat@users.noreply.github.com>`).
- **Never push without being told.** Committing locally is always fine. Hark decides when anything is pushed, and whether it is "push as it is" or "squash commit".
- **WCAG AA holds.** Zero contrast failures, no interactive target under 24 px, as established in commit `f4d3413`.
- **Visual editing must survive.** `src/pages/tina-island/[name].ts`, `src/lib/islands.ts`, every `<TinaIsland>` wrapper and every `tinaField()` marker stay exactly as they are.
- **Branch:** all work happens on `feat/quiet-redesign` in the worktree `/Users/hark/ssw/Beautiful-Hark.Workspace/astro-migration`.

## Baseline Measurements

From a real `pnpm build:local` run on 2026-07-29.

| Metric | Baseline | Target |
|---|---|---|
| HTML files | 26 | 26 |
| Combined HTML weight | 50 MB | under 2 MB |
| Average page weight | ~1.9 MB | under 60 KB |
| `<path>` elements per page | 2,602 | 0 |
| `dist/client` total | 78 MB | under 30 MB |
| Serverless functions | 1 | 1 (unchanged, by design) |

## File Structure

| File | Responsibility | Change |
|---|---|---|
| `public/hark-logo-128.webp` | Rasterised logo body, no eyes | Create |
| `src/components/HarkLogo.astro` | Logo with cursor-tracking eyes | Rewrite body from 2,602 inline paths to one `<image>` |
| `public/uploads/hark.webm` | Superseded hero video | Delete |

That is the whole diff. Everything else in this plan is verification and
deployment.

---

### Task 1: Replace the inlined logo with a raster

`HarkLogo.astro` reads `public/uploads/hark-logo.svg` at build time with
`node:fs` and inlines it with `set:html`. That file is 2.1 MB containing 2,602
`<path>` elements. It sits in the header, so every page ships the whole thing
and then renders it at 32 px.

The fix keeps the `viewBox="0 0 2048 2048"` coordinate system, so the eye
positions and the tracking maths are unchanged and the logo is visually
identical.

**Files:**
- Create: `public/hark-logo-128.webp`
- Modify: `src/components/HarkLogo.astro` (full rewrite)

**Interfaces:**
- Consumes: nothing from earlier tasks.
- Produces: `HarkLogo.astro` keeps its exact current props - `className?: string`, `trackEyes?: boolean`, `size?: number`. `src/components/Header.astro:21` calls it as `<HarkLogo trackEyes={true} className="size-8" />` and must not need editing.

- [ ] **Step 1: Record the current page weight so the improvement is measurable**

```bash
cd /Users/hark/ssw/Beautiful-Hark.Workspace/astro-migration
ls -l dist/client/index.html | awk '{print "bytes:", $5}'
grep -o "<path" dist/client/index.html | wc -l
```

Expected: roughly `2000000` bytes and `2602` paths. If `dist/` is missing, run
`CI=true pnpm build:local` first.

- [ ] **Step 2: Generate the raster body from the source SVG**

The source SVG contains no eyes - verified, it has zero `<circle>` elements.
The face has empty sockets and the eyes are the four circles the component
draws. So the raster is the body only, and the eye layer stays vector.

```bash
cd /Users/hark/ssw/Beautiful-Hark.Workspace/astro-migration
node -e '
const sharp = require("sharp");
sharp("public/uploads/hark-logo.svg", { density: 400 })
  .resize(128, 128)
  .webp({ quality: 90 })
  .toFile("public/hark-logo-128.webp")
  .then(i => console.log("wrote", i.size, "bytes", i.width + "x" + i.height));
'
```

Expected: prints something like `wrote 6000 bytes 128x128`. 128 px covers a
32 px render at up to 4× device pixel ratio.

- [ ] **Step 3: Rewrite HarkLogo.astro**

Replaces the `node:fs` read and the `set:html` injection with one `<image>`
element. The eye circles, the tracking script and the `data-bound` re-init
guard are carried over unchanged.

```astro
---
/**
 * Hark logo with cursor-following eyes.
 *
 * The body is a 128px raster rather than the source SVG: that file is 2.1MB
 * of traced paths, it was being inlined into every page, and it renders at
 * 32px. The viewBox stays at the SVG's original 2048x2048 so the eye
 * coordinates and the tracking maths below are unchanged.
 */
interface Props {
  className?: string;
  trackEyes?: boolean;
  size?: number;
}

const { className = 'size-10', trackEyes = false, size } = Astro.props;
---

<span
  class={`hark-logo inline-flex items-center justify-center overflow-hidden rounded-full ${className}`}
  style={`background: var(--raised); ${size ? `width:${size}px;height:${size}px;` : ''}`}
  data-track={trackEyes ? 'true' : 'false'}
>
  <svg viewBox="0 0 2048 2048" width="100%" height="100%" aria-hidden="true" style="display:block;">
    <image
      class="hark-body"
      href="/hark-logo-128.webp"
      x="0"
      y="0"
      width="2048"
      height="2048"
      style="transition: transform 0.15s ease-out;"
    />
    <g class="hark-eyes" style="transition: transform 0.1s ease-out;">
      <circle cx="808" cy="1107" r="60" fill="#070A09" />
      <circle cx="828" cy="1087" r="14" fill="#FFFFFF" />
      <circle cx="1312" cy="1106" r="60" fill="#070A09" />
      <circle cx="1332" cy="1086" r="14" fill="#FFFFFF" />
    </g>
  </svg>
</span>

<script is:inline>
  (() => {
    const MID_X = (808 + 1312) / 2;
    const MID_Y = (1107 + 1106) / 2;
    const EYE_MAX = 45;
    const BODY_MAX = 20;

    const clamp = (sx, sy, max) => {
      const dx = sx - MID_X;
      const dy = sy - MID_Y;
      const d = Math.sqrt(dx * dx + dy * dy);
      const s = d > 0 ? Math.min(max, d) / d : 0;
      return { x: dx * s, y: dy * s };
    };

    const bind = () => {
      document
        .querySelectorAll('.hark-logo[data-track="true"]:not([data-bound])')
        .forEach((node) => {
          node.setAttribute('data-bound', '1');
          const svg = node.querySelector('svg');
          const body = node.querySelector('.hark-body');
          const eyes = node.querySelector('.hark-eyes');
          if (!svg || !body || !eyes) return;
          let raf = null;
          window.addEventListener(
            'mousemove',
            (e) => {
              if (raf) return;
              raf = requestAnimationFrame(() => {
                raf = null;
                const r = svg.getBoundingClientRect();
                const sx = ((e.clientX - r.left) / r.width) * 2048;
                const sy = ((e.clientY - r.top) / r.height) * 2048;
                const b = clamp(sx, sy, BODY_MAX);
                const o = clamp(sx, sy, EYE_MAX);
                body.style.transform = `translate(${b.x}px, ${b.y}px)`;
                eyes.style.transform = `translate(${o.x}px, ${o.y}px)`;
              });
            },
            { passive: true }
          );
        });
    };

    bind();
    document.addEventListener('astro:after-swap', () => {
      document
        .querySelectorAll('.hark-logo[data-bound]')
        .forEach((n) => n.removeAttribute('data-bound'));
      bind();
    });
  })();
</script>
```

- [ ] **Step 4: Rebuild and confirm the page collapsed**

```bash
cd /Users/hark/ssw/Beautiful-Hark.Workspace/astro-migration
pkill -f "tinacms dev" 2>/dev/null; sleep 2
rm -rf dist .vercel
CI=true pnpm build:local 2>&1 | tail -3
ls -l dist/client/index.html | awk '{print "bytes:", $5}'
grep -o "<path" dist/client/index.html | wc -l
find dist/client -name "*.html" -exec du -ch {} + | tail -1
```

Expected: under `60000` bytes, `0` paths, combined HTML under `2M`. Roughly a
25× reduction per page.

- [ ] **Step 5: Confirm the logo renders and the eyes still track**

```bash
cd /Users/hark/ssw/Beautiful-Hark.Workspace/astro-migration
NODE_OPTIONS="--dns-result-order=ipv4first" pnpm dev
```

Open `http://localhost:4321`, move the cursor across the viewport, and confirm
the head and eyes drift toward it. Then confirm the raster resolves:

```bash
curl -sI http://localhost:4321/hark-logo-128.webp | head -1
```

Expected: `HTTP/1.1 200 OK`. A 404 here means the eyes will track over an empty
circle, which the visual check in the previous step should already have caught.

- [ ] **Step 6: Commit**

```bash
cd /Users/hark/ssw/Beautiful-Hark.Workspace/astro-migration
git add public/hark-logo-128.webp src/components/HarkLogo.astro
git commit -m "$(cat <<'EOF'
perf(logo): rasterise the header logo body

HarkLogo read /uploads/hark-logo.svg at build time and inlined it with
set:html. That file is 2.1MB of traced geometry - 2,602 <path> elements -
and it sits in the header, so every page shipped the whole thing and then
rendered it at 32px. Combined HTML across 26 pages was 50MB.

The body is now a 128px WebP, large enough for a 32px render at 4x DPR.
The viewBox stays 2048x2048, so the eye coordinates and the tracking
maths are untouched and the logo is visually identical.

Per-page HTML drops from ~1.9MB to under 60KB.
EOF
)"
```

---

### Task 2: Delete the superseded hero video

`hark.webm` (2.1 MB) was the original hero clip. Commit `3e22be5` switched the
hero to `hero.webm`, which was cropped to remove baked-in black bars and
loudness-normalised.

**Files:**
- Delete: `public/uploads/hark.webm`

**Interfaces:**
- Consumes: nothing. Produces: nothing.

- [ ] **Step 1: Prove nothing references it**

```bash
cd /Users/hark/ssw/Beautiful-Hark.Workspace/astro-migration
grep -rn "hark\.webm" src/ public/ tina/ 2>/dev/null | grep -v "hero\.webm" || echo "NO REFERENCES"
```

Expected: `NO REFERENCES`. **If anything is listed, stop and do not delete** -
repoint it at `hero.webm` first, then re-run this step.

- [ ] **Step 2: Delete and commit**

```bash
cd /Users/hark/ssw/Beautiful-Hark.Workspace/astro-migration
git rm public/uploads/hark.webm
git commit -m "$(cat <<'EOF'
chore(media): drop superseded hark.webm

Replaced by hero.webm in 3e22be5, which cropped 100px of baked-in black
bars from each side and normalised the audio. Nothing referenced it.
Saves 2.1MB from the deploy.
EOF
)"
```

---

### Task 3: Verify the build end to end

A build that produces files is not the same as a build that serves. This task
checks the output before it becomes the live site.

**Files:** none modified. Verification only.

**Interfaces:**
- Consumes: the build from Tasks 1 and 2.
- Produces: a go/no-go for the merge.

- [ ] **Step 1: Typecheck**

```bash
cd /Users/hark/ssw/Beautiful-Hark.Workspace/astro-migration
pnpm exec astro check 2>&1 | tail -5
```

Expected: `Result (34 files)` with `0 errors`. Hints are acceptable.

If this dies with SIGABRT rather than reporting errors, `tsconfig.json` has
lost its `public/admin` exclude: that directory holds the 11 MB minified Tina
admin SPA, and the checker crashes trying to parse it. It only reproduces
after a build, so a clean tree hides it.

- [ ] **Step 2: Confirm the function surface is unchanged**

The adapter stays, so this should look exactly like the baseline. The point is
to catch an accidental change, not to reduce it.

```bash
cd /Users/hark/ssw/Beautiful-Hark.Workspace/astro-migration
python3 -c "
import json
c = json.load(open('.vercel/output/config.json'))
fn = [r['src'] for r in c['routes'] if r.get('dest') == '_render']
print('routes hitting the function:')
[print(' ', s) for s in fn]
"
```

Expected exactly three: `/_server-islands/*`, `/_image`, `/tina-island/*`.
Any content route appearing here means a page lost its prerendering.

- [ ] **Step 3: Serve the built output and check every route**

`astro preview` does **not** work with the Vercel adapter - it throws
"preview is not supported". Serve the static output directly instead.

```bash
cd /Users/hark/ssw/Beautiful-Hark.Workspace/astro-migration
python3 -m http.server 4322 --directory dist/client >/dev/null 2>&1 &
sleep 2
for p in / /posts /posts/git-worktrees-for-dummies /poems /poems/bhua /tags /tags/ai /about /feed.xml /robots.txt /admin/index.html; do
  printf "%-45s %s\n" "$p" "$(curl -s -o /dev/null -w '%{http_code}' http://localhost:4322$p)"
done
```

Expected: every route `200`.

- [ ] **Step 4: Confirm content is in the HTML, not fetched at runtime**

```bash
curl -s http://localhost:4322/posts/git-worktrees-for-dummies | grep -c "Worktrees"
curl -s http://localhost:4322/poems/bhua | grep -c "ਭੂਆ"
```

Expected: both greater than `0`. This proves prerendering worked and the pages
do not depend on the function.

- [ ] **Step 5: Confirm the weight reduction**

```bash
cd /Users/hark/ssw/Beautiful-Hark.Workspace/astro-migration
find dist/client -name "*.html" -exec du -ch {} + | tail -1
du -sh dist/client
pkill -f "http.server 4322" 2>/dev/null; echo "server stopped"
```

Expected: combined HTML under `2M` (from 50 MB), `dist/client` under `30M`
(from 78 MB).

- [ ] **Step 6: Report, commit nothing**

No code changed. Report the route table, the function list and the two size
numbers. If any route returned non-200, or a content route appeared in the
function list, stop and fix before Task 4.

---

### Task 4: Point the Vercel project at Astro

The project currently builds the Next.js app and carries
`NEXT_PUBLIC_TINA_CLIENT_ID`. Astro reads `PUBLIC_TINA_CLIENT_ID`. Adding the
new name is the entire platform migration.

**Files:** none. Vercel dashboard and git.

**Interfaces:**
- Consumes: a verified build from Task 3.
- Produces: a live site.

**Steps 1 and 4 are Hark's to perform. Do not attempt them, and do not push
anything without being told to.**

- [ ] **Step 1: Hark changes the Framework Preset** *(manual, do not perform)*

**This is the one setting that can break the deploy, and it cannot be fixed
from the repo.** Verified via `vercel project inspect beautiful-hark`:

| Setting | Current | Needs to be |
|---|---|---|
| Framework Preset | **Next.js** | **Astro** |
| Root Directory | `.` | unchanged, correct |
| Build Command | not overridden | unchanged, resolves to `npm run build` |
| Output Directory | not overridden | unchanged, the adapter supersedes it |
| Node.js Version | 24.x | unchanged, satisfies `engines.node: >=22.12.0` |

Framework Preset is pinned per project and does not re-detect when
`package.json` changes, so it stays on Next.js through the merge unless
changed by hand.

It is possible this would survive unchanged: Build Command is not overridden,
so Vercel runs `npm run build`, which after the merge is the Astro build, and
`@astrojs/vercel` emits `.vercel/output/` using the Build Output API, which
Vercel consumes directly regardless of framework conventions. But the Next.js
preset can also apply Next-specific build behaviour, and there is no reason to
gamble a production deploy on it. Change it.

- [ ] **Step 2: Hark adds the missing environment variables** *(manual, do not perform)*

Verified via `vercel env ls`. The project already has:

| Variable | Environments | Status |
|---|---|---|
| `NEXT_PUBLIC_TINA_CLIENT_ID` | Production, Preview, Development | leave in place |
| `TINA_TOKEN` | Production, Preview, Development | **already correct, no action** |

`TINA_TOKEN` keeps its name across both stacks, so it needs nothing. Two to add:

| Variable | Value | Why |
|---|---|---|
| `PUBLIC_TINA_CLIENT_ID` | the same value as `NEXT_PUBLIC_TINA_CLIENT_ID` | Astro reads the `PUBLIC_` prefix, not `NEXT_PUBLIC_`. Baked in at build time; it is what lets the admin SPA authenticate to Tina Cloud |
| `SITE_URL` | the production URL | `astro.config.mjs` falls back to `VERCEL_URL`, which is the per-deployment hostname, so canonical URLs and the RSS feed would otherwise point at a deployment-specific domain |

To copy the client ID without reading it out of the dashboard,
`vercel env pull` writes the decrypted values to a local gitignored file. It
puts secrets on disk, so run it only if you would rather not copy-paste from
the dashboard.

Leave `NEXT_PUBLIC_TINA_CLIENT_ID` in place. It costs nothing and it is the
fastest rollback if the merge is reverted.

Do **not** pause auto-deploy. Unlike the Cloudflare route, here we want Vercel
to build on merge.

**Confirm with Hark that both are done before Step 4.**

- [ ] **Step 3: Port the dependabot build skip**

`main` carries a `vercel.json` that the merge deletes:

```json
{
  "ignoreCommand": "if [[ \"$VERCEL_GIT_COMMIT_REF\" == dependabot/* ]]; then exit 0; fi; exit 1"
}
```

`ignoreCommand` exits 0 to skip a build and 1 to run one, so this suppresses
Vercel builds on dependabot branches. It is a deliberate setting and the merge
would silently drop it, so carry it across unchanged.

```bash
cd /Users/hark/ssw/Beautiful-Hark.Workspace/astro-migration
git show origin/main:vercel.json > vercel.json
git add vercel.json
git commit -m "$(cat <<'MSG'
chore(vercel): carry the dependabot build skip across the rewrite

vercel.json lives on main and the Astro merge would delete it. Its
ignoreCommand suppresses Vercel builds on dependabot/* branches; nothing
about that is Next.js specific, so it survives the stack change intact.
MSG
)"
```

- [ ] **Step 4: Confirm the branch is clean and current**

```bash
cd /Users/hark/ssw/Beautiful-Hark.Workspace/astro-migration
git status --short
git fetch origin
git log --oneline origin/main..HEAD | wc -l | xargs echo "commits ahead:"
```

Expected: no output from `git status`. If `main` has moved, rebase before
merging.

- [ ] **Step 5: Merge to main**

```bash
cd /Users/hark/ssw/Beautiful-Hark.Workspace/beautiful-hark
git checkout main
git pull --ff-only
git merge --no-ff feat/quiet-redesign -m "$(cat <<'EOF'
feat: replace the Next.js site with the Astro rebuild

Swaps the stack from Next.js + TinaCMS to Astro + TinaCMS on the same
Vercel project. The Vercel adapter stays: content pages are prerendered
to static files and the single serverless function serves only the Tina
admin iframe, so a visitor never invokes it.

The site is one 640px centred column, six greys with a single --accent
currently pointing at ink, serif for Hark's writing and sans for site
chrome. Article pages carry title, date and body - the breadcrumb, tag
chips, drop cap, reading-progress bar, author card and excerpt-lead are
gone.

Per-page HTML drops from ~1.9MB to under 60KB, almost all of it from
rasterising a logo that was being inlined as 2,602 SVG paths.

Rolling back means reverting this merge; Vercel rebuilds the Next.js app
on the same domain.
EOF
)"
```

**Do not push.** Per AGENTS.md, ask Hark whether this is "push as it is" or
"squash commit", and wait.

- [ ] **Step 6: Verify the deployment** *(after Hark pushes)*

Once Vercel reports a successful build, check the production URL the same way
Task 3 checked local:

```bash
SITE="https://<production-domain>"
for p in / /posts /posts/git-worktrees-for-dummies /poems /poems/bhua /tags /about /feed.xml; do
  printf "%-45s %s\n" "$p" "$(curl -s -o /dev/null -w '%{http_code}' $SITE$p)"
done
```

Expected: every route `200`. Then in a browser confirm the hero video plays,
the theme toggle persists across reload, and the logo eyes track.

- [ ] **Step 7: Verify visual editing survived the deploy**

This is the one thing that has never been tested end to end in production, and
it is the reason the adapter is still here. Worth doing deliberately.

1. Open `https://<production-domain>/admin` and log in to Tina Cloud.
2. Open the home page in the editor's side-by-side view.
3. Edit the hero heading and confirm the preview updates without a full reload.
4. Save, and confirm the change lands as a commit on `main`.

If the preview does not update, check the browser network tab for a failing
request to `/tina-island/page`. A 500 there is almost certainly `TINA_TOKEN`
missing from the **runtime** environment rather than just the build environment.

---

## Success Criteria

1. Per-page HTML under 60 KB, down from ~1.9 MB.
2. Zero `<path>` elements in built HTML.
3. `dist/client` under 30 MB, down from 78 MB.
4. Exactly three routes hit the function, all of them non-content.
5. All 26 pages return 200 with content present in the HTML.
6. `pnpm exec astro check` reports 0 errors.
7. The logo looks unchanged and its eyes still track the cursor.
8. `/admin` loads in production and inline visual editing updates the preview.
9. No React anywhere in the dependency tree.
10. No commit carries a `Co-Authored-By` trailer.

## Out of Scope

- Moving to Cloudflare. Still available later: the site is a static build plus one small function, and `@astrojs/cloudflare` swaps in for `@astrojs/vercel` with no application code change. Nothing in this plan forecloses it.
- Rewriting the 19 existing commits that carry a `Co-Authored-By` trailer. The branch is unpushed so it is a clean message-only rewrite, but that is Hark's call: `git filter-branch -f --msg-filter 'sed "/^Co-[Aa]uthored-[Bb]y: Claude/d"' origin/main..HEAD`.
- Pinning `@tinacms/astro`. The island route uses `experimental_createIslandRoute`, so a minor version can break visual editing. Worth pinning, but not before a deploy that proves it works.
- Phase 3 micro-interactions - specced in `docs/superpowers/specs/2026-07-29-phase-3-micro-interactions-design.md`.
- Remaining Phase 2 type work: paragraph spacing is 22.5 px against a 30.6 px line-height, and Gurmukhi has no dedicated line-height.
- Deleting `_legacy-next/` and the Next-era GitHub workflows.
- Reducing `uploads/posts` (3.1 MB) and the 2.1 MB `uploads/hark-logo.svg`, which remains the Tina media source of truth.
