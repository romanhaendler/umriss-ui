import { test, expect, go } from "./fx";
// F4: virtual without maxHeight (the page scrolls): rows after the first window are never rendered.
test("F4 virtual without maxHeight leaves the page blank", async ({ page, logs }) => {
  await page.setViewportSize({ width: 900, height: 600 });
  await go(page, "cont", "&m=flex&nomax=1");
  await page.evaluate(() => window.scrollTo(0, 5000));
  await page.waitForTimeout(500);
  const info = await page.evaluate(() => { const rows = [...document.querySelectorAll("tbody tr")]; const vis = rows.filter((r) => { const b = r.getBoundingClientRect(); return b.bottom > 0 && b.top < innerHeight; }); return { n: rows.length, visible: vis.length, scrollY, docH: document.documentElement.scrollHeight }; });
  console.log(JSON.stringify(info), logs);
  expect(info.visible, "rows on screen after scrolling the page").toBeGreaterThan(5);
});
