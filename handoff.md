# handoff.md — fresh-session bootstrap (written 2026-10-16 18:48 IST)

> Overwritten at the end of every run (CLAUDE.md).

## 1. State right now

- This repo: main pushed (all commits up to this handoff). `npm run sync`, `astro build` and `npm run e2e`
  pass under `BASE_PATH=/raylib/ SITE_URL=https://www.ziglang.in`; e2e now
  starts all 46 example pages that have a browser build (46/46 run).
- `public/examples/` holds the 46 demos from raylib-zig `zig build webdemos
  -Doptimize=ReleaseFast` (gitignored).
- gh-pages: 320cff6, published from 6d1ab87 by `tools/publish-gh-pages.sh`
  (owner go-ahead): 46 demos.
- raylib-zig: 0dba149 + handoff commits, pushed. Browser gate `zig build webexamples
  -Demsdk=$HOME/emsdk`: **46/46** (core_basic_window + all 45 shapes), Debug
  and ReleaseFast. Desktop apiexamples re-run green for the 8 examples whose
  sources changed.
- zig-guide (ziglang.in): `dev` at 669ba42, pushed. Adds a
  "raylib-zig" link to `/raylib/` in the top bar, phone menu and footer. Its
  full e2e passed (317 links, 0 broken) with the sub-site fetched. `dev` also
  carries the owner's unshipped paint work, so shipping is the owner's call.

## 2. What this run did

- Resumed after a disconnect: the shapes gate expansion was uncommitted in
  raylib-zig. 13 raygui examples failed to link (UBSan symbols): the Zig side
  compiled raygui with desktop flags. `rayguiModule` now takes the platform
  (`-DPLATFORM_WEB`, no UBSan on the web, as the C oracle).
- Docs in raylib-zig updated (web.md, compatibility.md, PROGRESS.md).
- Site e2e: checks every built example page runs.
- ziglang.in: link to raylib-zig (owner request).

## 3. Next step

1. After the owner ships zig-guide dev to main: check www.ziglang.in/raylib/
   loads, a shapes demo runs, and the top-bar link is there.
2. Grow the browser gate: textures, then text (raylib-zig `web_examples`).
3. GLSL version as one comptime constant for the web, then shaders.
4. Phase S pages: API reference, cheatsheet (JSON from gen_api.py), getting
   started, compatibility. Gallery thumbnails.
5. Phase D: CI here.

## 4. Open issues

- Example source is shown with Shiki, not CodeMirror (no JS for read-only
  code). Say so if CodeMirror is wanted.
- Verification status is parsed from raylib-zig's build.zig lists until it
  writes a manifest.
- Each example's `.data` is its whole category's resources/.
- ziglang.in's search box placeholder is cut off at 1280 px ("Search chapt");
  it was so before the new link too.
