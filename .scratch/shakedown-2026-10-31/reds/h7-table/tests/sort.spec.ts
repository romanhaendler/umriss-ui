import { test, expect, go } from "./fx";
test("sort over odd values", async ({ page, logs }) => {
  await go(page, "weird", "&lang=de");
  for (const col of ["v", "d", "n"]) for (let k = 0; k < 2; k++) {
    await page.evaluate((c) => (window as any).__t.toggleSort(c), col);
    await page.waitForTimeout(80);
    const order = await page.evaluate((c) => JSON.stringify([(window as any).__t.sort[0]?.direction, (window as any).__t.visible.map((r: any) => r.id + ":" + String(c === "d" ? (r.d instanceof Date ? (isNaN(r.d) ? "inv" : r.d.getFullYear()) : r.d) : c === "n" ? String(r.n).slice(0, 6) : r.v))]), col);
    console.log(col, order);
  }
  expect(logs).toEqual([]);
});
