import { test, expect } from "@playwright/test";
test.use({ baseURL: "http://localhost:4301" });
test("100k sorted, 1000 rows change every tick: blocked time per update (production build)", async ({ page }) => {
  await page.goto("/?s=biglive"); await page.waitForSelector("table");
  const r = await page.evaluate(async () => {
    const w = window as any; const out: number[] = [];
    for (let i = 0; i < 6; i++) { const t0 = performance.now(); w.__bigTick(); await new Promise((res) => requestAnimationFrame(() => requestAnimationFrame(res))); out.push(Math.round(performance.now() - t0)); }
    return out;
  });
  console.log("ms per tick (set rows -> 2 frames):", r.join(","));
  const t0 = Date.now(); await page.getByRole("searchbox").fill("Item 99"); await page.waitForFunction(() => (window as any).__t.rowCount < 20000); console.log("search ms", Date.now() - t0);
  await page.getByRole("searchbox").fill(""); await page.waitForFunction(() => (window as any).__t.rowCount === 100000);
  // typing latency
  const lat = await page.evaluate(async () => { const inp = document.querySelector<HTMLInputElement>("input[type=search], [role=searchbox]")!; const t0 = performance.now(); inp.focus(); return Math.round(performance.now() - t0); });
  console.log("focus ms", lat);
  expect(Math.max(...r)).toBeLessThan(500);
});
