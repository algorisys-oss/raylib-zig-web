# handoff.md — fresh-session bootstrap (written 2026-10-17 20:45 IST)

> Overwritten at the end of every run (CLAUDE.md).

## 1. State right now

- **CI publishes the site now.** `.github/workflows/ci.yml` (push to main,
  PRs, nightly 05:30 UTC, manual) builds from raylib-zig-port's `web-latest`
  release and that release's commit, runs the getting-started check, astro
  build and e2e, and on green main pushes the `site` branch (was gh-pages;
  first CI publish e0453751 from 2c3f147, 219/219 example pages run).
- raylib-zig-port's `.github/workflows/web.yml` (path-filtered pushes to main,
  manual): browser gate **209/209 on GitHub's runner**, demos + frames +
  MANIFEST uploaded to `web-latest` (~30 min per run).
- Order when both change: push raylib-zig, wait for its run, then the site's
  next run (push, nightly, or manual) picks up the new release.
- This repo: main pushed up to this handoff commit. raylib-zig: 21da7ec.
- ziglang.in links to the site: zig-guide main fast-forwarded to 669ba42
  (owner's go-ahead, 2026-10-17 19:16 IST); "raylib-zig" in its top bar, phone
  menu and footer. ziglang.in now copies the `site` branch (209 verified).
- **GitHub Pages is off** (owner's go-ahead, 2026-10-17 20:30 IST). GitHub
  would not disable it while a `gh-pages` branch existed, so the site now
  publishes to a `site` branch (tools/publish-site.sh, ci.yml), ziglang.in's
  subsites.json reads `site` (zig-guide main d31a13a, deploy verified), and
  gh-pages was deleted. The Pages API now returns 404 for this repo.

## 2. What this run did

- raylib-zig: `-Draylib-examples` (or `$RAYLIB_EXAMPLES`) instead of a
  hard-coded path; a fresh clone passes the gate; web.yml.
- Here: ci.yml; publish-site.sh (was publish-gh-pages.sh) takes PUBLISH_URL and supplies a git
  identity; rehearsed locally with CI's inputs before pushing.
- First site CI run failed one of 219 pages (a 30 s screenshot timeout on the
  slow runner); nothing was published. e2e now allows 90 s and one retry; the
  next run was green and published.
- Pushes that change only handoff.md, tokens.txt, AGENTS.md or CLAUDE.md do
  not run the site CI.

## 3. Next step

1. Owner decisions in raylib-zig's handoff (LoadDirectoryFiles on the web,
   gen_api.py drift, wasm size growth).
2. Optional: raylib-zig's CI could trigger this repo's CI when it uploads a
   release (needs a token with access to this repo); today the nightly run
   picks it up.

## 4. Open issues

- Zig is pinned to 0.18.0-dev.246 in both workflows. ziglang.org prunes old
  dev builds; when it is gone, setup-zig's mirrors are the fallback, and moving
  raylib-zig to a newer master is the real fix.
- Astro drops the space before a link or `{expression}` that starts a new
  template line (AGENTS.md gotcha).
- Example source is shown with Shiki, not CodeMirror.
