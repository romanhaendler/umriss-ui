import { test, expect, go } from "./fx";
const info = (p: any) => p.evaluate(() => { const a = document.activeElement as any; return a ? a.tagName + "|" + (a.value ?? a.textContent?.slice(0, 20)) + "|" + a.closest("tr")?.innerText.replace(/\s+/g, " ").slice(0, 50) : "none"; });

test("live: edit + select + scroll while rows update every 500 ms", async ({ page, logs }) => {
  await go(page, "live");
  console.log("rows rendered", await page.locator("tbody tr").count(), "grouped lines first:", (await page.locator("tbody tr").first().innerText()).replace(/\s+/g, " "));
  await page.screenshot({ path: "shots/live-start.png" });
  await page.locator("#live").check();
  // find a data row (not a group row)
  const dataRow = page.locator("tbody tr").filter({ has: page.getByRole("checkbox") }).nth(1);
  console.log("data row", (await dataRow.innerText()).replace(/\s+/g, " "));
  await dataRow.getByRole("checkbox").check();
  const amountCell = dataRow.locator("td").nth(1);
  await amountCell.click();
  await page.keyboard.press("Meta+a"); await page.keyboard.type("123456");
  await page.waitForTimeout(1800); // ~3 live ticks
  console.log("after ticks:", await info(page));
  await page.keyboard.press("Enter");
  await page.waitForTimeout(100);
  console.log("log", JSON.stringify(await page.evaluate(() => (window as any).__log)));
  // scroll deep and check scroll stable under updates
  const area = page.locator("table").first().locator("xpath=ancestor::div[contains(@style,'overflow') or contains(@class,'scroll')][1]");
  const sc = await page.evaluate(() => { const els = [...document.querySelectorAll("div")].filter((d) => getComputedStyle(d).overflowY === "auto" && d.scrollHeight > d.clientHeight + 100); els[0].scrollTop = 20000; return els.length + ":" + els[0].scrollTop; });
  await page.waitForTimeout(1300);
  console.log("scroll", sc, await page.evaluate(() => [...document.querySelectorAll("div")].filter((d) => getComputedStyle(d).overflowY === "auto" && d.scrollHeight > d.clientHeight + 100)[0].scrollTop));
  console.log("selection", await page.evaluate(() => (window as any).__t.selection.count));
  await page.screenshot({ path: "shots/live-deep.png" });
  expect(logs).toEqual([]);
});

test("live: editor survives tick (typed value kept, focus kept)", async ({ page }) => {
  await go(page, "live");
  await page.locator("#live").check();
  const dataRow = page.locator("tbody tr").filter({ has: page.getByRole("checkbox") }).nth(1);
  await dataRow.locator("td").nth(1).click();
  await page.keyboard.press("Meta+a"); await page.keyboard.type("777");
  await page.waitForTimeout(2200);
  const v = await page.evaluate(() => (document.activeElement as HTMLInputElement).value);
  expect(v).toBe("777");
});
