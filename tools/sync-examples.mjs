// sync-examples.mjs: copy raylib-zig's browser builds of the examples into
// public/examples/, where ExampleCanvas.astro loads them.
//
//   npm run sync       (RAYLIB_ZIG defaults to the local checkout)
//
// raylib-zig builds them with `zig build webdemos -Demsdk=...` into
// zig-out/web/examples/<name>/<name>.{js,wasm,data}. These are the Zig-API
// translations on the Zig library, without the gate's determinism shim.
import { cpSync, existsSync, rmSync } from "node:fs";
import { join } from "node:path";

const raylibZig = process.env.RAYLIB_ZIG ?? "/home/rajesh/lab/ai-port/raylib-zig";
const from = join(raylibZig, "zig-out/web/examples");
const to = new URL("../public/examples/", import.meta.url).pathname;

if (!existsSync(from)) {
  console.error(`no browser builds at ${from}\nbuild them in raylib-zig: zig build webdemos -Demsdk=/path/to/emsdk`);
  process.exit(1);
}
rmSync(to, { recursive: true, force: true });
cpSync(from, to, { recursive: true });
console.log(`copied ${from} -> ${to}`);
