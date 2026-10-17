#!/usr/bin/env bash
# publish-site.sh: build the site for www.ziglang.in/raylib/, check it in
# headless Chrome, and publish dist/ to this repo's `site` branch as an
# orphan commit. ziglang.in's deploy copies that branch into /raylib/
# (zig-guide web/subsites.json), so it goes live on ziglang.in's next deploy.
#
#   tools/publish-site.sh            # sync examples, check getting-started, build, e2e, push
#   tools/publish-site.sh --dry-run  # everything except the push
#
# Run by hand and by CI (.github/workflows/ci.yml). Env: RAYLIB_ZIG and
# RAYLIB_EXAMPLES (the checkouts the site reads), PUBLISH_URL (push remote;
# default: this repo's origin).
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/.."

export BASE_PATH=/raylib/
export SITE_URL=https://www.ziglang.in

npm run sync
tools/check-getting-started.sh
npx astro build
node tools/e2e-browser.mjs

[ "${1:-}" = "--dry-run" ] && { echo "dry run: not publishing"; exit 0; }

src="$(git rev-parse --short HEAD)"
work="$(mktemp -d)"
trap 'rm -rf "$work"' EXIT
cp -r dist/. "$work"
touch "$work/.nojekyll"
# Not `gh-pages`: GitHub turns Pages on for a branch of that name and will not
# turn it off while the branch exists. This site is served only by ziglang.in.
git -C "$work" init -q -b site
git -C "$work" add -A
git -C "$work" -c user.name="$(git config user.name || echo raylib-zig-web CI)" \
  -c user.email="$(git config user.email || echo ci@noreply.github.com)" \
  commit -q -m "Site build for www.ziglang.in/raylib (from $src)"
git -C "$work" push -q -f "${PUBLISH_URL:-$(git remote get-url origin)}" site
echo "published site from $src"
