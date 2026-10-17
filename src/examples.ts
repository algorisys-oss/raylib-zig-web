/**
 * The examples, read at build time from the two source trees the site documents.
 *
 * - raylib's own list (`examples/examples_list.txt`): category, name, stars,
 *   author, in raylib's display order. The C source sits next to it. The list
 *   leaves out a few examples that have a .c file (four in `others/` in 6.2);
 *   those come after the listed ones, with stars and author from the C header.
 * - raylib-zig: the Zig-API translation (`examples/zig/<category>/<name>.zig`)
 *   and what its gates say about each example.
 *
 * Nothing here is pasted. A file that should exist and does not is a build
 * failure, so a page can never show code that was not built and gated
 * (AGENTS.md, "Rules").
 *
 * The gate status is parsed from raylib-zig's build.zig lists and
 * test/examples.list for now. Phase W step 7 replaces that with a manifest the
 * port writes, at a pinned commit.
 */
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

/** The raylib-zig checkout. CI points this at a pinned clone. */
export const RAYLIB_ZIG = process.env.RAYLIB_ZIG ?? "/home/rajesh/lab/ai-port/raylib-zig";
/** Upstream raylib 6.2 `examples/`, the C side of every page. */
export const RAYLIB_EXAMPLES =
  process.env.RAYLIB_EXAMPLES ?? "/home/rajesh/opensource/graphics/raylib-6.2/examples";

export const CATEGORIES = ["core", "shapes", "textures", "text", "models", "shaders", "audio", "others"] as const;
export type Category = (typeof CATEGORIES)[number];

/** What raylib-zig's gates have established for one example. */
export type Desktop =
  /** Zig-API translation renders the final frame byte-identical to the C example. */
  | { kind: "verified" }
  /** Translated and built, not pixel-gated: the C original is not deterministic. */
  | { kind: "build-only"; reason: string }
  /** Not translated. */
  | { kind: "none"; reason: string };

export interface Example {
  category: Category;
  name: string;
  /** "basic window", from the C header (`raylib [core] example - basic window`). */
  title: string;
  /** 1 to 4, raylib's complexity rating. */
  stars: number;
  author: string;
  authorGithub: string;
  cSource: string;
  zigSource: string | null;
  desktop: Desktop;
  /** Byte-identical to C in headless Chrome (the browser gate). */
  webVerified: boolean;
  /** Why the browser gate leaves this example out, when it does on purpose. */
  webExcluded: string | null;
}

function read(path: string): string {
  if (!existsSync(path)) throw new Error(`missing ${path} (check RAYLIB_ZIG / RAYLIB_EXAMPLES)`);
  return readFileSync(path, "utf8");
}

/** The string entries of one `const <name> = [_][]const u8{ ... };` list in build.zig. */
function buildZigList(buildZig: string, name: string): string[] {
  const start = buildZig.indexOf(`const ${name} = [_][]const u8{`);
  if (start < 0) throw new Error(`raylib-zig build.zig has no list ${name}`);
  const body = buildZig.slice(start, buildZig.indexOf("};", start));
  return [...body.matchAll(/^\s*"([^"]+)",/gm)].map((m) => m[1]);
}

/** Browser exclusions: `// <category>/<name>: <reason>` lines in build.zig's `web_examples`. */
function webExclusions(buildZig: string): Map<string, string> {
  const start = buildZig.indexOf("const web_examples = [_][]const u8{");
  const body = buildZig.slice(start, buildZig.indexOf("};", start));
  return new Map([...body.matchAll(/^\s*\/\/\s*(\w+\/\w+):\s*(.+)$/gm)].map((m) => [m[1], m[2].trim()]));
}

/** Reasons recorded in test/examples.list for examples the gate does not run. */
function exclusionReasons(list: string): Map<string, string> {
  const reasons = new Map<string, string>();
  for (const line of list.split("\n")) {
    const m = line.match(/^#\s*(\w+\/\w+)\.c\s+(?:EXCLUDED:\s*)?(.+)$/);
    if (m) reasons.set(m[1], m[2].trim());
  }
  return reasons;
}

/** Stars and author from the C header, for examples raylib's list leaves out. */
function headerFacts(c: string, entry: string): { stars: string; author: string; github: string } {
  const stars = c.match(/complexity rating: \[([★☆]+)\]/)?.[1];
  const by = c.match(/Copyright \(c\) [\d-]+ (.+?) \((@[\w-]+)\)/);
  if (!stars || !by) throw new Error(`${entry}.c: header has no complexity rating or copyright line`);
  return { stars, author: by[1], github: by[2] };
}

function titleFromHeader(c: string, entry: string): string {
  const m = c.match(/raylib \[\w+\] example - (.+)/);
  if (!m) throw new Error(`${entry}.c: no "raylib [category] example - title" header line`);
  return m[1].trim();
}

let cache: Example[] | null = null;

export function examples(): Example[] {
  if (cache) return cache;

  const buildZig = read(join(RAYLIB_ZIG, "build.zig"));
  const gated = new Set(buildZigList(buildZig, "api_examples"));
  const buildOnly = new Set(buildZigList(buildZig, "api_examples_build_only"));
  const web = new Set(buildZigList(buildZig, "web_examples"));
  const webExcluded = webExclusions(buildZig);
  const reasons = exclusionReasons(read(join(RAYLIB_ZIG, "test/examples.list")));

  // Rows of raylib's list, then any example file the list leaves out.
  const rows: { category: string; name: string; stars?: string; author?: string; github?: string }[] = [];
  for (const line of read(join(RAYLIB_EXAMPLES, "examples_list.txt")).split("\n")) {
    if (!line.trim() || line.startsWith("#")) continue;
    const [category, name, stars, , , , , author, github] = line.split(";");
    rows.push({ category, name, stars, author, github });
  }
  for (const category of CATEGORIES) {
    for (const file of readdirSync(join(RAYLIB_EXAMPLES, category)).filter((f) => f.endsWith(".c")).sort()) {
      const name = file.slice(0, -2);
      if (!rows.some((r) => r.category === category && r.name === name)) rows.push({ category, name });
    }
  }

  const out: Example[] = [];
  for (const row of rows) {
    const { category, name } = row;
    if (!(CATEGORIES as readonly string[]).includes(category)) continue;
    const entry = `${category}/${name}`;

    const cSource = read(join(RAYLIB_EXAMPLES, `${entry}.c`));
    const header = headerFacts(cSource, entry);
    const stars = row.stars ?? header.stars;
    const author = row.author ?? header.author;
    const github = row.github ?? header.github;
    const zigPath = join(RAYLIB_ZIG, "examples/zig", `${entry}.zig`);
    const zigSource = existsSync(zigPath) ? readFileSync(zigPath, "utf8") : null;

    let desktop: Desktop;
    if (gated.has(entry)) desktop = { kind: "verified" };
    else if (buildOnly.has(entry)) desktop = { kind: "build-only", reason: reasons.get(entry) ?? "not deterministic" };
    else desktop = { kind: "none", reason: reasons.get(entry) ?? "not translated yet" };
    if ((desktop.kind === "none") !== (zigSource === null)) {
      throw new Error(`${entry}: build.zig lists and examples/zig/ disagree about the translation`);
    }

    out.push({
      category: category as Category,
      name,
      title: titleFromHeader(cSource, entry),
      stars: [...stars].filter((s) => s === "★").length,
      author: author.replace(/^"|"$/g, ""),
      authorGithub: github.trim(),
      cSource,
      zigSource,
      desktop,
      webVerified: web.has(entry),
      webExcluded: webExcluded.get(entry) ?? null,
    });
  }
  cache = out;
  return out;
}

/** Path of an example page, under the site base. */
export function exampleHref(base: string, e: Pick<Example, "category" | "name">): string {
  return `${base.replace(/\/$/, "")}/examples/${e.category}/${e.name}/`;
}

/** Path of the gallery thumbnail (the browser gate's final frame), if `npm run sync` made one. */
export function thumbnail(base: string, e: Pick<Example, "name">): string | null {
  if (!existsSync(join(process.cwd(), "public/thumbs", `${e.name}.webp`))) return null;
  return `${base.replace(/\/$/, "")}/thumbs/${e.name}.webp`;
}

/** Whether `npm run sync` copied a browser build for this example. */
export function hasWebBuild(e: Pick<Example, "name">): boolean {
  return existsSync(join(process.cwd(), "public/examples", e.name, `${e.name}.js`));
}
