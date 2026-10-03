/* The front page's tile previews (.scratch/site-front-page): each package's
   first scenario, light and dark, 1200 x 750 - ten PNGs in
   `scripts/previews/`, checked in, which `build-pages.mjs` copies into the
   site and its guard holds to being there and under 300 kB.

   Run by hand when a first scenario changes, on a built site:

     pnpm build:pages && pnpm previews

   It serves `site/` under the path the site runs at (`/umriss-ui/`) from a
   server of its own on a free port - not the demos' preview ports - opens
   each package's landing page in the installed Playwright at 1280 x 800, the
   theme stored as the switch stores it, and photographs the first scenario's
   stage from its top left corner. */

import { createServer } from "node:http";
import { mkdirSync, readFileSync, statSync } from "node:fs";
import { dirname, extname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";
import { PACKAGES } from "../packages/demo/src/packages.ts";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SITE = join(ROOT, "site");
const OUT = join(ROOT, "scripts", "previews");
const BASE = new URL("../", JSON.parse(readFileSync(join(ROOT, "packages", PACKAGES[0].id, "package.json"), "utf8")).homepage).pathname;
/* The device scales a preview is taken at: those at which 1200 x 750 is a
   whole number of CSS pixels and the product exact - Chromium cuts a
   fractional clip down, and the picture came out at 1199 x 749. */
const SCALES = [1, 1.25, 1.5, 1.5625, 1.875, 2];
const TYPES = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".woff2": "font/woff2",
  ".json": "application/json",
};

if (!statSync(join(SITE, PACKAGES[0].id, "index.html"), { throwIfNoEntry: false })) throw new Error("No built site: run `pnpm build:pages` first.");

const server = createServer((request, response) => {
  const path = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
  let file = path.startsWith(BASE) ? join(SITE, path.slice(BASE.length)) : "";
  if (file !== "" && statSync(file, { throwIfNoEntry: false })?.isDirectory()) file = join(file, "index.html");
  if (file === "" || !file.startsWith(SITE) || !statSync(file, { throwIfNoEntry: false })?.isFile()) {
    response.writeHead(404).end();
    return;
  }
  response.writeHead(200, { "content-type": TYPES[extname(file)] ?? "application/octet-stream" }).end(readFileSync(file));
});
await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const origin = `http://127.0.0.1:${server.address().port}`;

mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch();
/** A landing page in a theme, its first stage scrolled to just below the
    sticky top bar; the stage's box as the viewport sees it. */
async function open(id, theme, deviceScaleFactor) {
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 }, colorScheme: theme, deviceScaleFactor });
  await context.addInitScript((chosen) => localStorage.setItem("umriss-ui:theme", chosen), theme);
  const page = await context.newPage();
  await page.goto(`${origin}${BASE}${id}/`, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  const stage = page.locator(".scenarioStage").first();
  await stage.evaluate((element) => {
    element.style.scrollMarginTop = "80px";
    element.scrollIntoView({ block: "start" });
  });
  const box = await stage.boundingBox();
  if (box === null) throw new Error(`${id}: no scenario stage on the landing page.`);
  return { context, page, box };
}
try {
  for (const { id } of PACKAGES) {
    /* The stage fills the picture: at 1280 it is narrower than 1200, so it is
       photographed at a device scale, the least that fits 1200 x 750 into it,
       from its top left corner. */
    const measured = await open(id, "light", 1);
    await measured.context.close();
    const scale = SCALES.find((one) => 1200 / one <= measured.box.width && 750 / one <= measured.box.height);
    if (scale === undefined) throw new Error(`${id}: the first scenario's stage is too small for a preview.`);
    for (const theme of ["light", "dark"]) {
      const { context, page, box } = await open(id, theme, scale);
      const file = join(OUT, `${id}-${theme}.png`);
      await page.screenshot({ path: file, clip: { x: Math.round(box.x), y: Math.round(box.y), width: 1200 / scale, height: 750 / scale } });
      console.log(`${file}: stage ${Math.round(box.width)} x ${Math.round(box.height)} at ${scale.toFixed(3)}, ${statSync(file).size} bytes`);
      await context.close();
    }
  }
} finally {
  await browser.close();
  server.close();
}
