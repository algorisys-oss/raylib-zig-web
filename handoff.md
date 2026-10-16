# handoff.md — fresh-session bootstrap (written 2026-10-16 17:12 IST)

> Overwritten at the end of every run (CLAUDE.md).

## 1. State right now

- Astro 7 site at the repo root (not in `web/`: this repo is the site).
  `npm install`, `npm run sync`, `npx astro build`, `npm run e2e` all pass,
  including under `BASE_PATH=/raylib/`.
- Pages: home (live example), examples gallery (227, by category, with
  verification marks), one page per example (canvas on demand, Zig and C
  source tabs, desktop/browser verification), about.
- Data comes from the raylib-zig checkout (`RAYLIB_ZIG`) and upstream raylib
  6.2 examples (`RAYLIB_EXAMPLES`) at build time (src/examples.ts). A missing
  file, or a disagreement between raylib-zig's gate lists and its
  translations, fails the build.
- Address decided by the owner: **www.ziglang.in/raylib**, so build with
  `BASE_PATH=/raylib/ SITE_URL=https://www.ziglang.in` (AGENTS.md decision 4).
- Pushed: main (this repo), raylib-zig main (71aa427). `gh-pages` holds the
  site built for /raylib/ (69a92b4, published by hand from 3ecbd7f).
- ziglang.in wiring done on zig-guide `dev` (767442a, pushed): web/subsites.json
  + web/tools/fetch-subsites.mjs, in CI and gh-deploy.sh. **Not live yet**:
  zig-guide `dev` also carries the owner's unshipped paint work, so shipping
  (ff main onto dev) is the owner's call. www.ziglang.in/raylib/ appears on the
  first ziglang.in deploy after that.

## 2. What this run did

- git init, public repo algorisys-oss/raylib-zig-web (pushed the first commit).
- In raylib-zig: the web target (see its handoff.md and docs/web.md).
- Here: the site scaffold, tools/sync-examples.mjs (copies raylib-zig's
  `zig build webdemos` output to public/examples/), tools/e2e-browser.mjs.
- Footer: "This website is Vibe Architected by Rajesh Pillai" (owner request).

## 3. Next step

1. After the owner ships zig-guide: check www.ziglang.in/raylib/ loads and the
   example runs.
2. Grow the browser gate in raylib-zig (shapes first), rebuild `webdemos`,
   `npm run sync`.
3. Phase S pages still missing: API reference and cheatsheet (needs the JSON
   output from raylib-zig's gen_api.py), getting started, compatibility.
4. Gallery thumbnails from the gate screenshots.
5. Phase D: CI here (raylib-zig checkout + raylib 6.2 + emsdk + webdemos,
   astro build with BASE_PATH=/raylib/, e2e, publish gh-pages). Until then
   gh-pages is published by hand (orphan commit of dist/).

## 4. Open issues

- The example page shows source with Shiki (Astro `<Code>`), not CodeMirror:
  read-only code needs no editor and ships no JS. Say so if CodeMirror is wanted.
- Verification status is parsed from raylib-zig's build.zig lists and
  test/examples.list until raylib-zig writes a manifest (phase W step 7).
- The `.data` bundle for an example is its whole category's resources/.
- The canvas needs `id="canvas"`: raylib's web backend finds it by selector.
- `public/examples/` is gitignored; CI must run raylib-zig's `webdemos`
  (needs emsdk) or fetch the artifacts.
