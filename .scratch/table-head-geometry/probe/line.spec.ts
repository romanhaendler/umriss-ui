import { test } from "@playwright/test";
import { appendFileSync } from "node:fs";
import { openExample } from "../../../packages/table/tests-visual/navigation.ts";
const OUT = process.env.OUT!;
const CASES: [string, string][] = [["column", "a-header-over-columns"], ["virtualisation", "groups-over-virtual-rows"]];
for (const dpr of [0.9, 1, 1.1, 1.25, 1.5, 2]) for (const pin of [false, true]) for (const width of [1280, 1111]) for (const [pg, id] of CASES)
  test(`${id} dpr${dpr} w${width}${pin ? " pinned" : ""}`, async ({ browser }) => {
    const ctx = await browser.newContext({ deviceScaleFactor: dpr, viewport: { width, height: 900 } });
    const page = await ctx.newPage();
    await openExample(page, pg, id);
    const ex = page.locator(`[data-example="${id}"]`);
    if (pin) {
      if (id !== "a-header-over-columns") return;
      await ex.getByRole("button", { name: "Columns" }).click();
      await page.getByRole("button", { name: "Pin Feb to start" }).click();
      await page.keyboard.press("Escape");
    }
    const table = ex.locator("table").first();
    await table.scrollIntoViewIfNeeded();
    await page.mouse.move(0, 0);
    /* every cell with the group edge: its left x, and a probe point per row */
    const edges = await table.evaluate((t) => Array.from(t.querySelectorAll<HTMLElement>('[class*="groupEdge"]')).map((c) => {
      const r = c.getBoundingClientRect();
      return { x: r.left, y: r.top + r.height / 2, row: c.closest("thead") ? (c.closest("tr")!.hasAttribute("data-head-group") ? "group head" : "head") : c.closest("tfoot") ? "foot" : "body", pinned: c.className.includes("pinned") };
    }));
    const png = (await page.screenshot()).toString("base64");
    const widths = await page.evaluate(async ({ png, edges, dpr }) => {
      const img = new Image(); img.src = "data:image/png;base64," + png; await img.decode();
      const cv = document.createElement("canvas"); cv.width = img.width; cv.height = img.height;
      const g = cv.getContext("2d")!; g.drawImage(img, 0, 0);
      return edges.map((e) => {
        const y = Math.round(e.y * dpr), x0 = Math.round(e.x * dpr);
        const d = g.getImageData(x0 - 6, y, 13, 1).data; if (y > cv.height) return { ...e, devPx: -1, profile: "offscreen" };
        const lum = [] as number[]; for (let i = 0; i < 13; i++) lum.push(Math.round(0.3 * d[i * 4]! + 0.59 * d[i * 4 + 1]! + 0.11 * d[i * 4 + 2]!));
        const bg = Math.max(lum[0]!, lum[12]!);
        const dark = lum.map((l) => bg - l);
        return { ...e, devPx: dark.filter((v) => v > 6).length, profile: dark.join(",") };
      });
    }, { png, edges, dpr });
    const lines = widths.map((w) => `${w.row}${w.pinned ? " pinned" : ""} x=${w.x.toFixed(2)} → ${w.devPx} device px (${(w.devPx / dpr).toFixed(1)} css px) [${w.profile}]`);
    appendFileSync(OUT, `## ${test.info().project.name} ${id} dpr${dpr} w${width}${pin ? " pinned" : ""}\n${[...new Set(lines)].map((l) => `- ${l}`).join("\n")}\n`);
    await ctx.close();
  });
