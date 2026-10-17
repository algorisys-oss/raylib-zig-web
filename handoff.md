# handoff.md — fresh-session bootstrap (written 2026-10-17 11:35 IST)

> Overwritten at the end of every run (CLAUDE.md).

## 1. State right now

- This repo: main pushed (1fe694a + this handoff commit). Published gh-pages
  **928ed14** (from 1fe694a) through `tools/publish-gh-pages.sh`: 219 demos
  (209 verified in the browser gate, 10 demo-only), 209 thumbnails, API
  reference with raygui (11 modules, 1001 functions), cheatsheet, getting
  started, compatibility. e2e: 219/219 example pages run, all links resolve.
- www.ziglang.in/raylib/ serves whatever ziglang.in last copied from gh-pages
  (it was the 46-demo build at 06:30); it updates on ziglang.in's next deploy.
  ziglang.in's top-bar link (zig-guide `dev` 669ba42) is still not on its main.
- raylib-zig: **4559e4b** + handoff commit, pushed. Browser gate **209**: every
  desktop-gated example but 8 (reasons in its docs/web.md). Last full
  ReleaseFast run covered 202; the 7 added after it pass in Debug and
  ReleaseFast. Desktop gates unchanged since their last run (pixel 12/12,
  apiexamples 217/217, exdiff 217/217).

## 2. What this run did

- Republished with 202 demos (c910c23), then added audio (5, compared with
  playback stalled; docs say so) and others (2) to the gate;
  raylib_opengl_interop excluded (desktop GL only).
- raylib-zig `web_demos_only`: the 9 build-only examples and core_window_web
  are built as site demos; their pages say "runs, not compared" with the
  desktop reason.
- raygui JSON (`gen_raygui.py --json`) and raygui in the API reference.
- e2e: finds each example page's category instead of guessing from the name.
- Stopped one publish before its push: an `astro build` had replaced `dist/`
  during its check. gh-pages was not touched; the gotcha is in AGENTS.md.

## 3. Next step

1. Owner decisions in raylib-zig's handoff: LoadDirectoryFiles on the web
   (Zig std gap), gen_api.py full regeneration drift, wasm size growth.
2. Phase D: CI for this repo (raylib-zig checkout + raylib 6.2 + emsdk +
   webdemos + gate frames, astro build with BASE_PATH=/raylib/, e2e, publish
   only from main). Until then publish by hand with the script.
3. Audio that actually plays in the gate would need a deterministic audio
   clock (raylib-zig side); optional.

## 4. Open issues

- Commit 1fe694a's message lost a backtick-quoted `@import("raygui")` to the
  shell ("through the  alias"); the code is right. Quote commit messages
  with a heredoc when they contain backticks.
- Astro drops the space before a link or `{expression}` that starts a new
  template line (AGENTS.md gotcha).
- Exclusion reasons on the site come from build.zig comments (developer
  wording).
- Example source is shown with Shiki, not CodeMirror.
