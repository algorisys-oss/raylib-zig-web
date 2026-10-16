import { defineConfig } from "astro/config";

// `site` and `base` come from the environment so the same build serves a
// GitHub Pages project URL now and a custom domain later (AGENTS.md, decision 4).
const base = process.env.BASE_PATH ?? "/";

export default defineConfig({
  site: process.env.SITE_URL ?? "http://localhost:4321",
  base,
  trailingSlash: "always",
  markdown: {
    shikiConfig: {
      themes: { light: "github-light-high-contrast", dark: "github-dark-high-contrast" },
      defaultColor: false,
    },
  },
});
