#!/usr/bin/env bash
# check-getting-started.sh: build the Getting started page's project the way a
# reader would, as a project that depends on raylib-zig.
#
#   tools/check-getting-started.sh        # uses $RAYLIB_ZIG (default: ../raylib-zig)
#
# The page shows getting-started/build.zig and raylib-zig's own
# examples/zig/core/core_basic_window.zig as src/main.zig. This script puts
# exactly those two files in a fresh project, points its build.zig.zon at the
# raylib-zig checkout, and runs `zig build`. A reader's build.zig.zon comes from
# `zig fetch --save`, which differs only in naming the dependency by URL.
set -euo pipefail
here="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
raylib_zig="$(cd "${RAYLIB_ZIG:-$here/../raylib-zig}" && pwd)"

work="$(mktemp -d)"
trap 'rm -rf "$work"' EXIT
mkdir -p "$work/src"
cp "$here/getting-started/build.zig" "$work/build.zig"
cp "$raylib_zig/examples/zig/core/core_basic_window.zig" "$work/src/main.zig"
rel="$(python3 -c 'import os, sys; print(os.path.relpath(sys.argv[1], sys.argv[2]))' "$raylib_zig" "$work")"
cat > "$work/build.zig.zon" <<ZON
.{
    .name = .basic_window,
    .version = "0.0.1",
    .fingerprint = 0x7287121c4378673d,
    .minimum_zig_version = "0.18.0-dev.246+05671ced9",
    .dependencies = .{ .raylib_zig = .{ .path = "$rel" } },
    .paths = .{""},
}
ZON
(cd "$work" && zig build)
test -x "$work/zig-out/bin/basic_window"
echo "OK  getting-started project builds against $raylib_zig"
