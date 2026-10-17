/**
 * The API reference's data: raylib-zig's src/api/api.json (tools/gen_api.py)
 * and src/raygui/api.json (tools/gen_raygui.py), with signatures as the
 * checked-in src/api/raylib.zig and src/raygui/raygui.zig have them. Nothing here is typed by hand,
 * so the reference cannot drift from the release. A missing file fails the build.
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { RAYLIB_ZIG, examples, type Example } from "./examples";

export interface ApiFunction {
  /** raylib.h's module for the function ("core", "shapes", ...), "raymath", "rlgl" or "raygui". */
  module: string;
  /** The header's section comment above it ("Window-related functions"). */
  group: string | null;
  /** C name: `DrawText`. */
  c: string;
  /** Zig name with its namespace: `rl.drawText`, `rl.math.vector2Add`, `rl.gl.pushMatrix`, `gui.button`. */
  zig: string;
  zigSignature: string;
  cSignature: string;
  /** raylib's own comment. */
  doc: string;
  /** Lines the Zig wrapper adds to explain how it differs from C. */
  zigDoc: string[];
}

export interface ApiModule {
  slug: string;
  title: string;
  /** What the module covers, in a line. */
  about: string;
  source: string;
  functions: ApiFunction[];
}

/** Modules in raylib's order, with the names this site uses for them. */
const MODULES: { key: string; slug: string; title: string; about: string; source: string }[] = [
  { key: "core", slug: "core", title: "core", about: "Window, drawing, shaders, timing, files and input.", source: "rcore" },
  { key: "rgestures", slug: "gestures", title: "gestures", about: "Touch and mouse gestures.", source: "rgestures" },
  { key: "rcamera", slug: "camera", title: "camera", about: "3D camera modes and movement.", source: "rcamera" },
  { key: "shapes", slug: "shapes", title: "shapes", about: "2D shapes, splines and collision checks.", source: "rshapes" },
  { key: "textures", slug: "textures", title: "textures", about: "Images (CPU), textures (GPU) and colors.", source: "rtextures" },
  { key: "text", slug: "text", title: "text", about: "Fonts, text drawing, codepoints and strings.", source: "rtext" },
  { key: "models", slug: "models", title: "models", about: "3D shapes, models, meshes, materials and animation.", source: "rmodels" },
  { key: "audio", slug: "audio", title: "audio", about: "Audio device, sounds, music and streams.", source: "raudio" },
  { key: "raymath", slug: "math", title: "math", about: "Vectors, matrices and quaternions (raymath, as rl.math).", source: "raymath" },
  { key: "rlgl", slug: "gl", title: "gl", about: "rlgl, raylib's OpenGL layer (as rl.gl).", source: "rlgl" },
  { key: "raygui", slug: "raygui", title: "raygui", about: 'Immediate-mode GUI controls (as @import("raygui")).', source: "raygui" },
];

let cache: ApiModule[] | null = null;

export function apiModules(): ApiModule[] {
  if (cache) return cache;
  const functions: ApiFunction[] = [];
  for (const [file, tool] of [["src/api/api.json", "gen_api.py"], ["src/raygui/api.json", "gen_raygui.py"]]) {
    const path = join(RAYLIB_ZIG, file);
    if (!existsSync(path)) throw new Error(`missing ${path} (run tools/${tool} --json in raylib-zig)`);
    functions.push(...(JSON.parse(readFileSync(path, "utf8")) as { functions: ApiFunction[] }).functions);
  }
  const known = new Set(MODULES.map((m) => m.key));
  const unknown = functions.find((f) => !known.has(f.module));
  if (unknown) throw new Error(`api.json: ${unknown.c} is in module "${unknown.module}", which this site does not list`);
  cache = MODULES.map(({ key, ...m }) => ({ ...m, functions: functions.filter((f) => f.module === key) }));
  return cache;
}

/** Path of a function's entry in the reference. */
export function apiHref(base: string, module: ApiModule, f: ApiFunction): string {
  return `${base.replace(/\/$/, "")}/api/${module.slug}/#${f.c}`;
}

/**
 * Which API functions an example's Zig source calls. A call is `<ns>.<name>(`
 * where <ns> is `rl` (or `rl.math` / `rl.gl`) or a local alias of it, such as
 * `const rm = rl.math;`, or the name raygui is imported as (`const gui = @import("raygui");`).
 */
function calls(source: string): Set<string> {
  const names = { "rl.math": ["rl\\.math"], "rl.gl": ["rl\\.gl"], rl: ["rl"], gui: [] } as Record<string, string[]>;
  for (const [, alias, ns] of source.matchAll(/^const (\w+) = rl\.(math|gl);/gm)) names[`rl.${ns}`].push(alias);
  for (const [, alias] of source.matchAll(/^const (\w+) = @import\("raygui"\);/gm)) names.gui.push(alias);
  const found = new Set<string>();
  for (const [ns, prefixes] of Object.entries(names)) {
    if (prefixes.length === 0) continue;
    const re = new RegExp(`(?<![\\w.])(?:${prefixes.join("|")})\\.(\\w+)\\(`, "g");
    for (const [, name] of source.matchAll(re)) found.add(`${ns}.${name}`);
  }
  return found;
}

let usage: Map<string, Example[]> | null = null;

/** For each Zig function name (`rl.drawText`), the examples that call it. */
export function examplesUsing(): Map<string, Example[]> {
  if (usage) return usage;
  usage = new Map();
  for (const e of examples()) {
    if (!e.zigSource) continue;
    for (const name of calls(e.zigSource)) {
      if (!usage.has(name)) usage.set(name, []);
      usage.get(name)!.push(e);
    }
  }
  return usage;
}

/** The API functions an example calls, in reference order. */
export function functionsUsedBy(e: Example): { module: ApiModule; f: ApiFunction }[] {
  if (!e.zigSource) return [];
  const used = calls(e.zigSource);
  return apiModules().flatMap((module) => module.functions.filter((f) => used.has(f.zig)).map((f) => ({ module, f })));
}
