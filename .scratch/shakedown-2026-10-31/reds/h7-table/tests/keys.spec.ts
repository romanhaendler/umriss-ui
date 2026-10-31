import { test, expect, go } from "./fx";
const act = (p: any) => p.evaluate(() => { const a = document.activeElement as any; return a?.tagName + "|" + (a?.closest("tr")?.innerText.replace(/\s+/g, " ").slice(0, 30)) + "|" + a?.getAttribute?.("data-column"); });

test("grid: active cell while rows are inserted above / removed", async ({ page, logs }) => {
  await go(page, "edit");
  // unsorted for stability
  await page.evaluate(() => (window as any).__t.toggleSort("amount")); await page.evaluate(() => (window as any).__t.toggleSort("amount"));
  console.log("sort", await page.evaluate(() => JSON.stringify((window as any).__t.sort)));
  const rows = () => page.locator("tbody tr").evaluateAll((t: any[]) => t.map((r) => r.innerText.replace(/\s+/g, " ").slice(0, 14)));
  console.log((await rows()).slice(0, 4));
  await page.locator("tbody tr").nth(3).locator("th, td").first().click();
  await page.keyboard.press("Escape");
  console.log("focus:", await act(page));
  await page.evaluate(() => (window as any).__setRows((rs: any[]) => [{ id: "new", name: "NEW", dept: "Ops", amount: 99999, when: null, note: null, qty: 0 }, ...rs]));
  await page.waitForTimeout(200);
  console.log("after insert (sorted desc? new at ", (await rows()).indexOf("NEW 99,999 — No v"), "):", await act(page));
  await page.keyboard.press("ArrowDown");
  console.log("ArrowDown:", await act(page));
  await page.evaluate(() => (window as any).__setRows((rs: any[]) => rs.filter((r: any) => r.id !== (document.activeElement as any)?.closest("tr")?.dataset?.key)));
  await page.waitForTimeout(100);
  console.log(logs);
});

test("language switch mid-way with open popover and selection", async ({ page, logs }) => {
  await go(page, "selch");
  await page.locator("tbody tr").nth(0).getByRole("checkbox").check();
  await page.getByRole("button", { name: "Filter Name" }).click();
  await page.waitForTimeout(200);
  await page.evaluate(() => (window as any).__setLang(true));
  await page.waitForTimeout(300);
  console.log("popover still open:", await page.locator("[role=dialog]").count(), "| text:", (await page.locator("[role=dialog]").innerText().catch(() => "")).replace(/\s+/g, " "));
  await page.keyboard.press("Escape");
  console.log("body:", (await page.locator("body").innerText()).replace(/\s+/g, " ").slice(0, 300));
  console.log("sel aria:", await page.locator("thead").getByRole("checkbox").getAttribute("aria-label"), "| pager:", await page.getByRole("button", { name: /seite|page/i }).allInnerTexts(), await page.locator("[role=status]").allInnerTexts());
  await page.evaluate(() => (window as any).__setLang(false));
  await page.waitForTimeout(200);
  console.log(logs);
});
