import { test, expect, go } from "./fx";
for (const [lang, dark] of [["de", ""], ["", "1"]] as const) test(`375px server table ${lang || "en"} ${dark ? "dark" : "light"}`, async ({ page, logs }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto(`/?s=server&w=100%25${lang ? "&lang=de" : ""}${dark ? "&dark=1" : ""}`); await page.waitForSelector("table");
  await page.waitForTimeout(500); await page.evaluate(() => { const w = window as any; w.__pend.forEach((x: any) => x.resolve(true)); w.__pend.length = 0; }); await page.waitForTimeout(400);
  await page.locator("thead").getByRole("checkbox").check(); await page.waitForTimeout(500);
  await page.evaluate(() => { const w = window as any; w.__pend.forEach((x: any) => x.resolve(true)); w.__pend.length = 0; }); await page.waitForTimeout(300);
  const over = await page.evaluate(() => { const bad: string[] = []; const vw = innerWidth; document.querySelectorAll("*").forEach((e: any) => { const b = e.getBoundingClientRect(); if (b.width && b.right > vw + 1 && !e.closest("tbody, thead, table")) bad.push(`${e.tagName}.${String(e.className).slice(0, 30)} right=${Math.round(b.right)}`); }); return { docW: document.documentElement.scrollWidth, bad: bad.slice(0, 6) }; });
  console.log(over);
  await page.screenshot({ path: `shots/narrow-${lang || "en"}-${dark ? "dark" : "light"}.png` });
  console.log(logs);
});
