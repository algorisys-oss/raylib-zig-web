// e2e-browser.mjs: check the built site (dist/) in headless Chrome.
//
//   npx astro build && node tools/e2e-browser.mjs
//
// Serves dist/ under BASE_PATH (the same value the build used), then:
//   - every checked page loads with no page errors and no broken local links
//     to other checked pages,
//   - the home page's example runs, and so does the example page of every
//     example that has a browser build (dist/examples/<name>/): pressing Run
//     loads the Zig wasm, and the canvas shows more than one colour within a
//     few seconds.
// Exit status 0 when all pass. A screenshot of the home example is written to
// e2e-example.png for a human to look at.
import { chromium } from "playwright";
import { createServer } from "node:http";
import { readFile, readdir, stat } from "node:fs/promises";
import { join, extname } from "node:path";

const dist = new URL("../dist/", import.meta.url).pathname;
const base = (process.env.BASE_PATH ?? "/").replace(/\/?$/, "/");
const types = {
  ".html": "text/html", ".js": "text/javascript", ".css": "text/css",
  ".wasm": "application/wasm", ".data": "application/octet-stream", ".svg": "image/svg+xml",
};

const server = createServer(async (req, res) => {
  let path = decodeURIComponent(new URL(req.url, "http://x").pathname);
  if (!path.startsWith(base)) { res.writeHead(404); return res.end(); }
  let file = join(dist, path.slice(base.length));
  try {
    if ((await stat(file)).isDirectory()) file = join(file, "index.html");
    res.writeHead(200, { "content-type": types[extname(file)] ?? "application/octet-stream" });
    res.end(await readFile(file));
  } catch {
    res.writeHead(404); res.end();
  }
});
await new Promise((r) => server.listen(0, "127.0.0.1", r));
const origin = `http://127.0.0.1:${server.address().port}`;

const browser = await chromium.launch({ args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
const failures = [];
const fail = (msg) => { failures.push(msg); console.log("  FAIL  " + msg); };

/** Press Run on the page at `path` and check the canvas comes alive. */
async function checkRuns(label, path, screenshot) {
  const page = await browser.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  try {
    await page.goto(origin + base + path);
    await page.click(".ex-run");
    await page.waitForSelector(".ex-canvas:not([hidden])", { timeout: 30000 });
    await page.waitForTimeout(3000);
    // The poster comes back with an error text when the example fails to start.
    if (await page.locator(".ex-poster").isVisible()) {
      fail(`${label} did not start: ${await page.locator(".ex-hint").textContent()}`);
      return false;
    }
    const shot = await page.locator(".ex-canvas").screenshot(screenshot ? { path: screenshot } : {});
    // Count distinct colours: a blank or failed canvas is one colour.
    const colours = await page.evaluate(async (b64) => {
      const img = new Image();
      img.src = "data:image/png;base64," + b64;
      await img.decode();
      const c = document.createElement("canvas");
      c.width = img.width; c.height = img.height;
      const ctx = c.getContext("2d");
      ctx.drawImage(img, 0, 0);
      const d = ctx.getImageData(0, 0, c.width, c.height).data;
      const seen = new Set();
      for (let i = 0; i < d.length; i += 4 * 97) seen.add((d[i] << 16) | (d[i + 1] << 8) | d[i + 2]);
      return seen.size;
    }, shot.toString("base64"));
    if (errors.length) { fail(`${label}: ${errors.join("; ")}`); return false; }
    if (colours < 2) { fail(`${label}: canvas is blank (${colours} colour)`); return false; }
    if (screenshot) console.log(`  OK    ${label} runs (${colours} colours sampled; ${screenshot})`);
    return true;
  } catch (e) {
    fail(`${label}: ${e.message.split("\n")[0]}`);
    return false;
  } finally {
    await page.close();
  }
}

try {
  const pages = ["", "examples/", "about/", "examples/core/core_basic_window/", "examples/shaders/shaders_julia_set/"];
  for (const p of pages) {
    const page = await browser.newPage();
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    const resp = await page.goto(origin + base + p);
    if (!resp || resp.status() !== 200) fail(`${base}${p}: HTTP ${resp?.status()}`);
    if (errors.length) fail(`${base}${p}: ${errors.join("; ")}`);
    // Local links must resolve.
    const links = await page.$$eval("a[href]", (as) => as.map((a) => a.getAttribute("href")));
    for (const href of links.filter((h) => h.startsWith("/"))) {
      const r = await page.request.get(origin + href.split("#")[0]);
      if (r.status() !== 200) fail(`${base}${p}: broken link ${href} (${r.status()})`);
    }
    await page.close();
    if (!failures.length) console.log(`  OK    ${base}${p}`);
  }

  // The live example on the home page, then every example with a build.
  await checkRuns("home example", "", "e2e-example.png");
  const built = (await readdir(join(dist, "examples"), { withFileTypes: true }))
    .filter((d) => d.isDirectory() && d.name.includes("_"))
    .map((d) => d.name).sort();
  let ran = 0;
  for (const name of built) {
    const category = name.slice(0, name.indexOf("_"));
    if (await checkRuns(name, `examples/${category}/${name}/`)) ran++;
  }
  console.log(`  OK    ${ran}/${built.length} example pages run their browser build`);
} finally {
  await browser.close();
  server.close();
}

console.log(failures.length ? `FAIL  ${failures.length} problem(s)` : "OK  site checks passed");
process.exit(failures.length ? 1 : 0);
