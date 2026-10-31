import { test, expect } from "@playwright/test";
import { row, watch } from "./h";

test("inline qty edit survives 500 ms refreshes", async ({ page }) => {
  const errs = watch(page);
  await page.goto("/?refresh=500&mode=client");
  await page.waitForTimeout(800);
  const cell = row(page, "1007").locator("td[data-edit]");
  await cell.dblclick();
  const input = row(page, "1007").locator("input:not([type=checkbox])");
  await expect(input).toBeVisible();
  await input.fill("77");
  await page.waitForTimeout(1600); // three refreshes
  const open = await row(page, "1007").locator("input:not([type=checkbox])").count();
  const val = open ? await row(page, "1007").locator("input:not([type=checkbox])").inputValue() : "(closed)";
  console.log("editor after refreshes:", open, val);
  expect.soft(open, "editor still open").toBe(1);
  expect.soft(val).toBe("77");
  const focused = await page.evaluate(() => document.activeElement?.tagName + ":" + (document.activeElement as any)?.value);
  console.log("focus:", focused);
  if (open) await row(page, "1007").locator("input:not([type=checkbox])").press("Enter");
  await page.waitForTimeout(100);
  const log = await page.evaluate(() => (window as any).__log);
  console.log(log.filter((l: string) => l.startsWith("edit")));
  await page.waitForTimeout(1500);
  const shown = await row(page, "1007").locator("td[data-edit]").innerText();
  const srv = await page.evaluate(() => (window as any).__db().find((r: any) => String(r.id) === "1007").qty);
  console.log("shown", shown, "server", srv);
  expect.soft(shown).toBe("77");
  console.log(errs.join("\n"));
});

test("edit committed while a stale refresh is in flight does not flicker back", async ({ page }) => {
  await page.goto("/?refresh=500&mode=client&latency=300");
  await page.waitForTimeout(1000);
  const seen: string[] = [];
  const cell = row(page, "1007").locator("td[data-edit]");
  await cell.dblclick();
  await row(page, "1007").locator("input:not([type=checkbox])").fill("55");
  await row(page, "1007").locator("input:not([type=checkbox])").press("Enter");
  for (let i = 0; i < 120; i++) { seen.push(await cell.innerText()); await page.waitForTimeout(50); }
  console.log("series", [...new Set(seen)].join(" -> "));
});
test("probe server value", async ({ page }) => {
  await page.goto("/?refresh=500&mode=client&latency=300");
  await page.waitForTimeout(1000);
  const cell = row(page, "1007").locator("td[data-edit]");
  await cell.dblclick();
  await row(page, "1007").locator("input:not([type=checkbox])").fill("55");
  await row(page, "1007").locator("input:not([type=checkbox])").press("Enter");
  await page.waitForTimeout(3000);
  console.log("log", await page.evaluate(() => (window as any).__log.filter((l: string) => l.startsWith("edit"))));
  console.log("srv", await page.evaluate(() => (window as any).__db().find((r: any) => String(r.id) === "1007").qty), "shown", await cell.innerText());
});
