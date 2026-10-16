# handoff.md — fresh-session bootstrap (written 2026-10-16)

> Overwritten at the end of every run (CLAUDE.md).

## 1. State right now

- New, empty project: only `AGENTS.md`, `CLAUDE.md`, `handoff.md`,
  `tokens.txt` and `tools/token_usage.py`. Not a git repo yet.
- Decisions made: separate site; ziglang.in stack (Astro 7, MDX, CodeMirror,
  Playwright, GitHub Pages); full route (the browser runs the Zig port, gated
  against C); domain not chosen. Details: AGENTS.md.
- raylib-zig (the port) is green and pushed; it builds only for desktop
  GLFW + OpenGL 3.3 today.

## 2. What happened before this repo existed

- Planning was done in the raylib-zig session of 2026-10-16: feasibility
  check (emsdk 6.0.4 at ~/emsdk, Zig 0.18 `wasm32-emscripten`, lane-dodger on
  ziglang.in already runs raylib in the browser), then these files.

## 3. Next step

1. `git init` here (ask the owner whether a GitHub repo should be created).
2. In raylib-zig: read its `handoff.md`, then phase W step 1 from AGENTS.md:
   `core_basic_window` running in the browser from the Zig port, using
   lane-dodger's `addWeb` as the template.
3. Continue with AGENTS.md "Next steps when work starts".

## 4. Open issues

- None yet.
