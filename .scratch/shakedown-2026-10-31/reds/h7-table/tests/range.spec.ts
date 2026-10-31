import { test, expect, go } from "./fx";
test.use({ timezoneId: "Europe/Berlin" });
test("date range filter via UI: end day inclusive, DST day", async ({ page, logs }) => {
  await page.goto("/?s=dates"); await page.waitForSelector("table");
  await page.getByRole("button", { name: "Filter Day" }).click();
  await page.getByRole("button", { name: "Select range" }).click();
  const prev = page.getByRole("button", { name: "Previous month" }).last();
  for (let i = 0; i < 7; i++) await prev.click();
  const cells = await page.locator("[role=dialog] [role=grid] button, [role=dialog] [role=gridcell] button").evaluateAll((b: any[]) => b.slice(0, 3).map((x) => x.getAttribute("aria-label")));
  console.log("cells", cells);
  await page.getByRole("button", { name: /29 March 2026/ }).first().click();
  await page.getByRole("button", { name: /30 March 2026/ }).first().click();
  await page.waitForTimeout(300);
  const ids = await page.evaluate(() => JSON.stringify((window as any).__t.filtered.map((r: any) => r.iso.slice(0, 19))));
  console.log("filter", JSON.stringify(await page.evaluate(() => (window as any).__t.filter)), "\nrows", ids);
  const iso = await page.evaluate(() => (window as any).__t.filtered.map((r: any) => r.iso));
  // local days Mar 29 (Sun, DST day, 23h) and Mar 30 (Mon): UTC 2026-03-28T23:00Z .. 2026-03-30T22:00Z (exclusive)
  expect(iso).toContain("2026-03-29T21:59:00Z");
  expect(iso).toContain("2026-03-29T23:59:59Z");   // Mon 30 Mar 01:59 local: the end day must be included
  expect(iso).toContain("2026-03-28T23:30:00Z");   // Sun 29 Mar 00:30 local: the start day
  expect(iso).not.toContain("2026-03-28T22:30:00Z");
});
