/* pnpm screenshot <package> <page> <example> [--click "<button name>"] [--width 1280] [--dark] [--touch] [--out file.png]
   Writes a PNG of one demo example from a dev server on a free port, prints the
   page's console errors, and stops the server. With --click the button inside
   the example is pressed first and the whole window is shot, so the popover or
   dialog it opens is in the picture; without it, the example alone. */
import { spawn } from "node:child_process";
import { createServer } from "node:net";
import { parseArgs } from "node:util";
import { chromium } from "@playwright/test";
import { PACKAGES } from "./ports.ts";

const { positionals, values } = parseArgs({
  allowPositionals: true,
  options: { click: { type: "string" }, width: { type: "string", default: "1280" }, dark: { type: "boolean" }, touch: { type: "boolean" }, out: { type: "string" } },
});
const [pkg, pageId, exampleId] = positionals;
if (!PACKAGES.includes(pkg) || !pageId || !exampleId) {
  console.error(`usage: pnpm screenshot <${PACKAGES.join("|")}> <page> <example> [--click "<button>"] [--width 1280] [--dark] [--touch] [--out file.png]`);
  process.exit(2);
}
const out = values.out ?? `${pkg}-${pageId}-${exampleId}${values.dark ? "-dark" : ""}.png`;

const port = await new Promise((resolve) => {
  const probe = createServer().listen(0, "127.0.0.1", () => {
    const { port } = probe.address();
    probe.close(() => resolve(port));
  });
});
const dev = spawn("pnpm", ["--filter", `@umriss-ui/${pkg}`, "dev", "--port", String(port), "--strictPort", "--host", "127.0.0.1"], { stdio: "ignore", detached: true });
let browser;
try {
  for (let tries = 0; ; tries += 1) {
    if (await fetch(`http://127.0.0.1:${port}/`).then((r) => r.ok, () => false)) break;
    if (tries > 120) throw new Error("the dev server did not come up");
    await new Promise((r) => setTimeout(r, 500));
  }
  browser = await chromium.launch();
  const page = await (await browser.newContext({ viewport: { width: Number(values.width), height: 900 }, colorScheme: values.dark ? "dark" : "light" })).newPage();
  const errors = [];
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  page.on("pageerror", (e) => errors.push(String(e)));
  await page.goto(`http://127.0.0.1:${port}/${pageId}/${values.touch ? "?touch-scale" : ""}#${exampleId}`, { waitUntil: "networkidle" });
  const example = page.locator(`[data-example="${exampleId}"]`);
  await example.waitFor({ state: "visible" });
  await page.evaluate(() => document.fonts.ready);
  await example.scrollIntoViewIfNeeded();
  if (values.click) await example.getByRole("button", { name: values.click }).first().click();
  await page.waitForTimeout(500);
  if (values.click) await page.screenshot({ path: out });
  else await example.screenshot({ path: out });
  console.log(`${out}\nerrors: ${errors.length ? "\n" + errors.join("\n") : "none"}`);
} finally {
  await browser?.close();
  process.kill(-dev.pid);
}
