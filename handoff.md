# handoff.md — fresh-session bootstrap (written 2026-10-17 00:05 IST)

> Overwritten at the end of every run (CLAUDE.md).

## 1. State right now

- This repo: main pushed (84dc0da + this handoff commit). `npm run sync`,
  `astro build`, `npm run e2e` pass under `BASE_PATH=/raylib/
  SITE_URL=https://www.ziglang.in`; e2e starts all **78** example pages that
  have a browser build (78/78 run).
- gh-pages: **6245362**, published from 84dc0da (owner's go-ahead): 78 demos.
  Live on www.ziglang.in/raylib/ only after ziglang.in's next deploy.
- raylib-zig: **5cd8ae2**, pushed, on top of the owner's round 2 (f7630ee).
  Browser gate `zig build webexamples -Demsdk=$HOME/emsdk`: **78/78**
  (core_basic_window + 45 shapes + 32 textures), Debug and ReleaseFast. One
  browser exclusion: textures_to_image (reason in docs/web.md and as a
  `// entry: reason` comment in build.zig `web_examples`; the site shows it).
- zig-guide (ziglang.in): `dev` at 669ba42, pushed: "raylib-zig" link in top
  bar, phone menu, footer. Not on its `main`; shipping dev is the owner's call
  (dev also carries the owner's paint work).
- The owner also works on raylib-zig in parallel (non-breaking). Fetch/pull it
  before working there.

## 2. What this run did

- Textures in the browser gate. textures_to_image excluded: WebGL 2 cannot
  glReadPixels an RGB texture; C and Zig both draw an unwritten buffer.
- Port bug found by the web link: rmodels declared
  `par_shapes_set_epsilon_degenerate_sphere(f64)` for a C float (a trap on
  wasm, silent on x86-64). Fixed; emcc links now use `-Wl,--fatal-warnings`
  (negative control fails as expected). Desktop apiexamples and exdiff pass
  for the 4 GenMeshSphere examples.
- Site: example pages show a browser exclusion's reason.

## 3. Next step

1. After the owner ships zig-guide dev: check www.ziglang.in/raylib/ loads,
   a textures demo runs, the top-bar link is there.
2. raylib-zig `web_examples`: text category next.
3. GLSL version as one comptime constant for the web, then shaders.
4. Phase S pages: API reference, cheatsheet (JSON from gen_api.py), getting
   started, compatibility. Gallery thumbnails.
5. Phase D: CI here.

## 4. Open issues

- Exclusion reasons are written for developers (they come from build.zig);
  reword in plainer English if the page text should read better.
- zig build prints "failed command" over any step that writes to stderr, even
  when it succeeds; read the message, not the header.
- Example source is shown with Shiki, not CodeMirror.
- Each example's `.data` is its whole category's resources/.
