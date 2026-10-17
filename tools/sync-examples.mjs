// sync-examples.mjs: copy raylib-zig's browser builds of the examples into
// public/examples/, where ExampleCanvas.astro loads them, and make the
// gallery's thumbnails from the browser gate's frames.
//
//   npm run sync       (RAYLIB_ZIG defaults to the local checkout)
//
// raylib-zig builds the demos with `zig build webdemos -Demsdk=...` into
// zig-out/web/examples/<name>/<name>.{js,wasm,data}. These are the Zig-API
// translations on the Zig library, without the gate's determinism shim.
//
// `zig build webexamples` leaves the final frame of every example that passed
// (C and Zig identical) in zig-out/web/frames/<name>.png. Each becomes
// public/thumbs/<name>.webp. Without frames there are no thumbnails, and the
// gallery shows text only.
import { cpSync, existsSync, mkdirSync, readdirSync, rmSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";

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

const frames = join(raylibZig, "zig-out/web/frames");
const thumbs = new URL("../public/thumbs/", import.meta.url).pathname;
rmSync(thumbs, { recursive: true, force: true });
if (!existsSync(frames)) {
  console.log(`no gate frames at ${frames} (run zig build webexamples): no thumbnails`);
} else {
  mkdirSync(thumbs, { recursive: true });
  const pngs = readdirSync(frames).filter((f) => f.endsWith(".png"));
  for (const png of pngs) {
    await sharp(join(frames, png)).resize({ width: 320 }).webp({ quality: 80 }).toFile(join(thumbs, png.replace(/\.png$/, ".webp")));
  }
  console.log(`made ${pngs.length} thumbnails in ${thumbs}`);
}
