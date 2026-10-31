import { test, expect } from "./fx";
test.use({ timezoneId: "Europe/Berlin" });
// F6: group "week" labels are one too low (and "week 0" exists): Monday 2026-03-30 is ISO week 14.
test("F6 ISO week label", async ({ page }) => {
  await page.goto("/?s=dates&g=wk"); await page.waitForSelector("table");
  const heads = await page.locator("tbody tr").evaluateAll((trs: any[]) => trs.map((t) => t.innerText.replace(/\s+/g, " ")).filter((s) => /^Week/.test(s)));
  console.log(heads.join("\n"));
  expect(heads.some((h) => /Week 0,/.test(h)), "there is no ISO week 0").toBe(false);
  expect(heads.find((h) => h.includes("2026-03-29T22:00")) ?? heads.join("|")).toContain("Week 14, 2026");
});
