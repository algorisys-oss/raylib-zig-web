# AGENTS.md — raylib-zig-web

Guidance for any coding agent working in this repository. Claude-specific
rules (token logging, handoff) are in [CLAUDE.md](CLAUDE.md), which imports
this file.

## What this project is

The documentation website for **raylib-zig**: a C-to-Zig port of raylib 6.2
that is a drop-in replacement for C raylib, plus an idiomatic Zig API over it.
The model is [raylib.com](https://www.raylib.com), with these additions:

- **Every example runs in the browser, and what runs is the Zig port.** The
  canvas on an example page is raylib-zig compiled to WebAssembly. Upstream C
  raylib is compiled for the web only as the test oracle, never shipped as a
  demo.
- **Every example is verified.** Each browser example is pixel-diffed against
  the same example built from upstream C raylib, in headless Chrome. The page
  shows that result.
- **Zig and C side by side.** Each example page shows the Zig-API source and
  the original C source.
- **Generated reference.** The API reference and cheatsheet are generated from
  the same data that generates the Zig API, so they cannot drift from the
  release.

This repo holds the **site**. The port, its web target and its build of the
examples live in the **raylib-zig** repo (see below). Do not port raylib code
in this repo.

## Decisions already made (2026-10-16, by the owner)

1. **A separate site and repo**, not a section of ziglang.in.
2. **Same stack as ziglang.in**: Astro 7 (static output), MDX, CodeMirror,
   Playwright for the browser checks, GitHub Pages served from a `gh-pages`
   branch. Reuse ziglang.in's components and theme where they fit.
3. **The full route**: port raylib's web backend and WebGL 2 path to Zig, and
   verify every browser example against C. Shipping upstream C raylib as the
   demos is rejected (the site would not be showing raylib-zig).
4. **Address: www.ziglang.in/raylib** (owner, 2026-10-16). Build with
   `BASE_PATH=/raylib/` and `SITE_URL=https://www.ziglang.in` (www is
   ziglang.in's canonical host; its CNAME). This repo publishes `dist/` to
   its own `gh-pages`. GitHub Pages cannot serve another repo's Pages under a
   path of a project site's custom domain (www.ziglang.in belongs to
   rajeshpillai/zig-guide), so how `/raylib` is wired is still open: the
   proposal is that ziglang.in's CI copies this repo's `gh-pages` into
   `web/dist/raylib/` before it publishes. Ask the owner before the first
   public deploy and before touching the zig-guide repo.

## Related repositories and tools

| What | Path | Use |
|---|---|---|
| raylib-zig (the port) | `/home/rajesh/lab/ai-port/raylib-zig` | Writable, but it is its **own project**: follow its `CLAUDE.md`. Web-target work (phase W below) lands there. |
| raylib 6.2 C source | `/home/rajesh/opensource/graphics/raylib-6.2` | Read-only reference and oracle source. Examples and their resources live in `examples/`. |
| ziglang.in site | `/home/rajesh/lab/zig/my-zig-guide` | Read-only stack reference. Astro app in `web/`; its `CLAUDE.md` documents CI, deploy, ads/analytics wiring and writing style. |
| lane-dodger | `/home/rajesh/lab/zig/my-zig-guide/examples/lane-dodger` | **Template for the web build**: Zig + raylib compiled to `wasm32-emscripten`, linked by `emcc`, shell in `web-shell/index.html`, served by the Astro page `web/src/components/LaneDodger.astro`. |
| Emscripten SDK | `/home/rajesh/emsdk` | `upstream/emscripten/emcc` (emcc 6.0.4 at time of writing). |
| Zig | `zig` on PATH | 0.18.0-dev (master). raylib-zig is built and gated on it. |

Facts about raylib-zig that this site relies on (verify in its docs before
quoting them on a page; they change):

- Compatibility record: `raylib-zig/docs/compatibility.md`. 619/619 raylib.h
  functions exported from Zig. Every deterministic upstream example (217/217)
  renders byte-identical to C, in Debug and ReleaseFast, on llvmpipe and on a
  real GPU.
- Zig API rules: `raylib-zig/docs/zig-api.md`. Generator:
  `raylib-zig/tools/gen_api.py` (raylib.h, raymath.h, rlgl.h, rcamera.h) and
  `tools/gen_raygui.py` (raygui, linked as C).
- Zig-API example translations: `raylib-zig/examples/zig/<category>/<name>.zig`
  (226 of the 227 upstream examples; 217 gated, 9 build-only). Shared example
  helpers: `examples/zig/common/{rlights,reasings}.zig`.
- Examples gates: `zig build apiexamples` (Zig-API vs C) and
  `tools/exdiff.sh` (C-ABI port vs C). Exclusions and reasons:
  `raylib-zig/test/examples.list`.

## Plan

Two halves. Phase W happens in **raylib-zig**; phases S and D happen here.

### Phase W — web target for the port (in raylib-zig)

The port currently builds only for `PLATFORM_DESKTOP_GLFW` + OpenGL 3.3
(see `raylib-zig/docs/not-migrated.md`). The browser needs:

1. **Web platform backend in Zig.** Port `src/platforms/rcore_web.c` (about
   1970 lines). It runs on Emscripten's GLFW (`-sUSE_GLFW=3`), so it is close
   to the desktop GLFW backend already in `rcore.zig`. Select the backend at
   comptime from the target OS (`.emscripten`). This is the same backend
   lane-dodger uses.
2. **OpenGL ES 3 (WebGL 2) path in `rlgl.zig`.** Port the
   `GRAPHICS_API_OPENGL_ES3` branches of `rlgl.h`. lane-dodger builds raylib
   against GLES 3 and needs `-sMIN_WEBGL_VERSION=2 -sMAX_WEBGL_VERSION=2`.
   `rlgl.zig` currently imports `gl33.zig` directly; the GL binding must be
   chosen per target.
3. **Build.** Compile the Zig modules and the bundled C (`external/`, raygui)
   for `wasm32-emscripten`, link with `emcc` as lane-dodger's `addWeb` does.
   Per example: `.wasm` + `.js` + a `--preload-file` data bundle of the
   example's `resources/`.
4. **Main loop.** The translated examples use raylib's normal
   `while (!rl.windowShouldClose())` loop. Link with `-sASYNCIFY` (raylib.com
   does this) rather than restructuring 226 examples into frame callbacks.
   lane-dodger uses `-sASYNCIFY=0` with a frame callback; that does not scale
   to the example set. Measure the size and speed cost and record it.
5. **Shaders.** Upstream examples select `GLSL_VERSION 100` on
   `PLATFORM_WEB` and load `resources/shaders/glsl100/...`. The Zig
   translations hard-code 330 today. Make the version a comptime value from
   the target (one constant in a shared place, not 40 edits by hand).
6. **Browser oracle gate.** Build each example twice for the web: upstream C
   example + C raylib (oracle), and Zig translation + Zig raylib. Run both in
   headless Chrome with Playwright, apply the same determinism rules as the
   desktop gate (frozen clock, fixed RNG seed, N frames; see
   `raylib-zig/tools/exdiff/hooks.c` and `c_exdiff.zig`), read back the
   canvas, and compare byte-for-byte. Check first that headless Chrome's
   software WebGL (SwiftShader) is deterministic run-to-run for C alone
   (C-vs-C), exactly as the desktop gate did with llvmpipe.
7. **Output for this site.** A manifest per example (category, name, title
   and description from the C file's header comment, complexity stars, files,
   gate result) plus the built web artifacts, at a pinned raylib-zig commit.

Expected browser exclusions (confirm each by trying, then record the reason):
compute shaders (need desktop GL 4.3), monitor and window-flag examples,
`raylib_opengl_interop`, `rlgl_standalone`, and file-drop or clipboard
examples that browsers restrict. Audio examples work but need a user gesture
before sound starts.

### Phase S — the site (here)

Astro static site. Pages:

- **Home**: what raylib-zig is, a live example, the compatibility claim in
  one sentence with a link to the evidence.
- **Examples gallery**: by category, thumbnails (from the gate screenshots),
  complexity rating, a "verified" mark per example.
- **Example page**: the running canvas (load the wasm only on demand), Zig
  source and C source tabs (CodeMirror, read-only), the verification result,
  links to every API function the example uses.
- **API reference**: per module (core, shapes, textures, text, models, audio,
  math, gl, raygui): Zig signature, C signature, doc comment, examples that
  use it. Generated, not written by hand (see below).
- **Cheatsheet**: one page, like raylib.com/cheatsheet, Zig and C columns.
  Generated.
- **Getting started**: adding raylib-zig to a `build.zig.zon` project, the
  basic-window example, building for desktop and for the web.
- **Compatibility**: rendered from raylib-zig's `docs/compatibility.md`.
- **About / license**.

Generated data: extend raylib-zig's `tools/gen_api.py` with a JSON output
(function name, Zig signature, C signature, doc comment, module) rather than
parsing `raylib.h` a second time here. The site reads that JSON at build time.
One source of truth, as ziglang.in's rule that the code on a page is the code
CI compiled.

### Phase D — CI and deploy (here)

Follow ziglang.in's model (its `CLAUDE.md`, "CI and deployment"): build, run
the browser gate, `astro build`, Playwright end-to-end check of the built
site, then publish `dist/` to `gh-pages` as an orphan commit, only from
`main`, only if everything passed. `SITE_URL`/`BASE_PATH` come from one
place for both the build and the browser check.

## Rules

- **The code on a page is the code that was built and gated.** Example
  sources are read from the raylib-zig checkout at build time, never pasted.
  A missing file or declaration is a build failure.
- **Unofficial, and says so.** This is not raylib.com and must not look like
  it is. The site name is raylib-zig, every page credits raylib and Ramon
  Santamaria (@raysan5), and it links to raylib.com. Do not copy raylib.com's
  logo, layout or wording. raylib and its examples are zlib/libpng licensed:
  keep their license and attribution headers.
- **Idiomatic Zig, raylib's design.** Any Zig written for this project follows
  raylib-zig's bar (its `CLAUDE.md`, "Conventions"): Zig as if written by
  Andrew Kelley, API shaped as Raysan designed raylib.
- **Writing style**: follow
  `/home/rajesh/lab/zig/my-zig-guide/rajesh-writing-style.md` and the extra
  rules in that repo's `CLAUDE.md` ("Writing style"): plain English for
  second-language readers, no em dashes, no AI tone, no hype.
- **Deploy needs the owner's go-ahead.** Committing on green gates is fine.
  Pushing to a public remote, creating the GitHub repo, enabling Pages or
  choosing a domain: ask first.

## Gotchas carried over from raylib-zig

- **Disk.** A full examples build grew a worktree cache to 13-27 GB, and the
  disk filled once. Clear `~/.cache/zig-local` and worktree `.zcache` dirs
  between large runs; never delete inside `.zcache/o` (it breaks the cache),
  only the whole directory. Give parallel agents their own `--cache-dir`.
- **Floating point.** Compile C examples and C raylib with
  `-ffp-contract=off`. clang fuses `a*b + c` by default and no Zig code can
  match that bit-for-bit.
- **`std.fmt` is not printf.** Signed zero-padding prints `+6` where `%02i`
  prints `06`, and exact float ties round differently. Translations print
  unsigned or absolute values where C uses `%0Ni`.
- **Audio-driven examples are not deterministic** even in C under CPU load.
  Before treating an audio diff as a bug, compare C with C.
- **`refAllDecls` skips generic functions.** Instantiate generic API functions
  in a test.

## Next steps when work starts

1. In raylib-zig: read its `handoff.md`, then start phase W with a single
   example (`core_basic_window`) running in the browser from the Zig port,
   using lane-dodger's `addWeb` as the template.
2. Stand up the browser oracle gate on that one example (C-vs-C determinism
   first, then C-vs-Zig).
3. Port the rest of the web backend and the GLES3 path until the browser gate
   covers the example set.
4. Here: scaffold the Astro site from ziglang.in's `web/` (package.json,
   astro.config, layouts, theme), the examples gallery and one example page.
5. Add the JSON output to `gen_api.py`; generate the API reference and the
   cheatsheet.
