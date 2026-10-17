# handoff.md — fresh-session bootstrap (written 2026-10-17 08:55 IST)

> Overwritten at the end of every run (CLAUDE.md).

## 1. State right now

- This repo: main pushed up to this handoff commit. Published gh-pages
  **f55c3ea** (from 71a57a3): 159 demos, gallery thumbnails, and the new pages
  (Getting started, API reference per module, Cheatsheet, Compatibility).
  `tools/publish-gh-pages.sh` ran the full chain: sync, getting-started check,
  astro build, e2e (159/159 example pages run, all links resolve).
- One small change since that publish is committed, not yet published: the
  neutral wording for browser exclusions ("left out ... : <reason>").
- www.ziglang.in/raylib/ is live (checked: the home example runs in headless
  Chrome), but it still serves the 46-demo build until ziglang.in redeploys.
  ziglang.in's top-bar link (zig-guide `dev` 669ba42) is not on its main yet.
- raylib-zig: **c19b9de** pushed. Browser gate: **202** examples (core 44,
  shapes 45, textures 32, text 17, shaders 32, models 32), 7 exclusions with
  reasons in its docs/web.md. Desktop after the build.zig changes: pixel 12/12,
  apiexamples 217/217, exdiff 217/217.
- The site's next build will mark 202 examples browser-verified, but
  public/examples has only 159 demos until `zig build webdemos` runs again.

## 2. What this run did

- raylib-zig: GLSL version as one comptime constant (examples/zig/common/
  platform.zig); text, shaders, models, core in the browser gate; per-example
  .data (test/web_resources.list from `zig build webresources`, proven by the
  gate, negative control fails); gate frames for thumbnails;
  `tools/gen_api.py --json` -> src/api/api.json; raylib-zig now builds as a
  dependency (cwd-relative -include fixed).
- Site: API reference (/api/, /api/<module>/), cheatsheet, getting started
  (built for real by tools/check-getting-started.sh, and by hand from GitHub
  with `zig fetch`), compatibility page (rendered from raylib-zig's doc),
  thumbnails (npm run sync + sharp), example pages list the functions they use.

## 3. Next step

1. In raylib-zig: `zig build webdemos -Demsdk=$HOME/emsdk -Doptimize=ReleaseFast`
   and `zig build webexamples ... -Doptimize=ReleaseFast` (frames for the 43 new
   core thumbnails), then here `tools/publish-gh-pages.sh` (needs the owner's
   go-ahead each time unless they have said to publish).
2. raylib-zig `web_examples`: audio (needs a user gesture on the site; the
   gate may need a C-vs-C check first), then others.
3. Owner decisions waiting in raylib-zig's handoff: LoadDirectoryFiles on the
   web (std gap); gen_api.py full regeneration no longer matches raylib.zig;
   wasm size growth (core_basic_window 107 KB -> 258 KB).
4. raygui in the API reference (gen_raygui.py has no JSON yet). Phase D CI.

## 4. Open issues

- Astro drops the space before a link that starts a new line in a page
  template. Keep the text before `<a` on the same line (see
  getting-started.astro, cheatsheet.astro).
- zig build prints "failed command" above any step that writes to stderr,
  even when it succeeds (emcc warnings); read the message, not the header.
- Exclusion reasons on the site come straight from build.zig comments, so they
  are written for developers.
- Example source is shown with Shiki, not CodeMirror.
