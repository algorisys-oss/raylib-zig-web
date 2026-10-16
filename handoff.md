# handoff.md — fresh-session bootstrap (written 2026-10-16)

> Overwritten at the end of every run (CLAUDE.md).

## 1. State right now

- Git repo on `main`, pushed to the public GitHub repo
  https://github.com/algorisys-oss/raylib-zig-web (same org as the port,
  algorisys-oss/raylib-zig-port). First commit: 163055a.
- Contents: `AGENTS.md`, `CLAUDE.md`, `handoff.md`, `tokens.txt`,
  `tools/token_usage.py`, `.gitignore`. No site code yet; no gates yet.
- Not done: GitHub Pages is not enabled, no domain. Both need the owner's
  go-ahead (AGENTS.md "Rules").
- raylib-zig (the port) is green and pushed; it builds only for desktop
  GLFW + OpenGL 3.3 today.

## 2. What this run did

- Read the handoff; `git init`, initial commit, created the public repo
  under algorisys-oss (the owner chose it) and pushed `main`.

## 3. Next step

1. In raylib-zig: read its `handoff.md`, then phase W step 1 from AGENTS.md:
   `core_basic_window` running in the browser from the Zig port, using
   lane-dodger's `addWeb` as the template.
2. Continue with AGENTS.md "Next steps when work starts".

## 4. Open issues

- None.
