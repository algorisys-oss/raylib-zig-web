import { defineCollection } from "astro:content";
import type { Loader } from "astro/loaders";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { RAYLIB_ZIG } from "./examples";

/** Where raylib-zig's docs/ live on GitHub, for links between its documents. */
const PORT_DOCS_URL = "https://github.com/algorisys-oss/raylib-zig-port/blob/main/docs/";

/**
 * Documents read from the raylib-zig checkout at build time, never copied
 * (AGENTS.md: the page shows what the port's repo says). A missing file fails
 * the build. Links to sibling documents (`web.md`, `not-migrated.md#x`) point
 * to GitHub, since this site does not carry those pages.
 */
function portDocs(names: string[]): Loader {
  return {
    name: "raylib-zig-docs",
    async load({ store, renderMarkdown }) {
      store.clear();
      for (const name of names) {
        const path = join(RAYLIB_ZIG, "docs", `${name}.md`);
        const text = readFileSync(path, "utf8").replace(
          /\]\(([\w-]+\.md(?:#[\w-]*)?)\)/g,
          (_, target: string) => `](${PORT_DOCS_URL}${target})`,
        );
        const title = text.match(/^# (.+)$/m)?.[1] ?? name;
        store.set({ id: name, data: { title }, body: text, rendered: await renderMarkdown(text) });
      }
    },
  };
}

export const collections = {
  portDocs: defineCollection({ loader: portDocs(["compatibility"]) }),
};
