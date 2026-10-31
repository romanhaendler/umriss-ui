import { test, expect, go } from "./fx";
const info = (p: any) => p.evaluate(() => { const a = document.activeElement as any; return a ? a.tagName + "|" + (a.value ?? a.textContent?.slice(0, 20)) + "|" + a.closest("tr")?.innerText.replace(/\s+/g, " ").slice(0, 40) : "none"; });
const rows = (p: any) => p.locator("tbody tr").evaluateAll((trs: any[]) => trs.map((t) => t.innerText.replace(/\s+/g, " ")));
const logOf = (p: any) => p.evaluate(() => JSON.stringify((window as any).__log.map((e: any) => [e.rowKey, e.columnId, e.value])));

test("edit: the edited row is re-sorted by an outside change", async ({ page, logs }) => {
  await go(page, "edit");
  await page.locator("tbody tr").nth(2).locator("td").nth(0).click();   // Item 3, amount
  await page.keyboard.press("Control+a"); await page.keyboard.type("5000");
  await page.evaluate(() => (window as any).__setRows((rs: any[]) => rs.map((r) => r.id === "r3" ? { ...r, amount: 99999 } : r)));
  await page.waitForTimeout(200);
  console.log("A after resort:", await info(page));
  await page.keyboard.press("Enter");
  await page.waitForTimeout(200);
  console.log("A log", await logOf(page), "| active", await info(page));
  expect(JSON.parse(await logOf(page))[0]?.[0]).toBe("r3");
});

test("edit: the edited row is removed by an outside change", async ({ page, logs }) => {
  await go(page, "edit");
  await page.locator("tbody tr").nth(2).locator("td").nth(0).click();
  await page.keyboard.press("Control+a"); await page.keyboard.type("5000");
  await page.evaluate(() => (window as any).__setRows((rs: any[]) => rs.filter((r) => r.id !== "r3")));
  await page.waitForTimeout(200);
  console.log("B after remove:", await info(page), "| inputs:", await page.locator("input").count());
  await page.keyboard.press("Enter");
  await page.waitForTimeout(200);
  console.log("B log", await logOf(page), "| active", await info(page));
  await page.keyboard.press("ArrowDown");
  console.log("B after arrow:", await info(page));
  expect(logs).toEqual([]);
});

test("edit: sorted edit by the user itself: commit moves row, focus follows?", async ({ page }) => {
  await go(page, "edit");
  await page.locator("tbody tr").nth(2).locator("td").nth(0).click();
  await page.keyboard.press("Control+a"); await page.keyboard.type("5000");
  await page.keyboard.press("Enter");
  // app applies the edit, as an app would
  await page.evaluate(() => { const w = window as any; const e = w.__log.at(-1); w.__setRows((rs: any[]) => rs.map((r) => r.id === e.rowKey ? { ...r, amount: Number(e.value) } : r)); });
  await page.waitForTimeout(200);
  console.log("C active", await info(page));
  await page.keyboard.press("ArrowDown");
  console.log("C after ArrowDown", await info(page));
  await page.keyboard.press("Enter");
  await page.keyboard.type("1");
  console.log("C after type", await info(page));
});
