import { test, expect } from "@playwright/test";
import { row, watch, count } from "./h";
const act = (p: any) => p.evaluate(() => { const a = document.activeElement as any; return (a?.tagName ?? "") + "|" + (a?.getAttribute?.("aria-label") ?? a?.textContent?.slice(0, 20) ?? ""); });

test("row actions menu stays open and focused through refreshes", async ({ page }) => {
  const errs = watch(page);
  await page.goto("/?refresh=500&mode=client");
  await page.waitForTimeout(800);
  await page.getByLabel("Actions: 1007").click();
  await expect(page.getByRole("menu")).toBeVisible();
  const f0 = await act(page);
  await page.waitForTimeout(1700);
  const open = await page.getByRole("menu").count();
  console.log("menu open:", open, "focus before:", f0, "after:", await act(page));
  expect.soft(open, "menu closed by a refresh").toBe(1);
  console.log(errs.join("\n"));
});

test("row actions menu: key down + Enter picks the item under refresh", async ({ page }) => {
  await page.goto("/?refresh=500&mode=client");
  await page.waitForTimeout(800);
  await row(page, "1007").getByLabel("Actions: 1007").focus();
  await page.keyboard.press("Enter");
  await page.waitForTimeout(700);
  await page.keyboard.press("ArrowDown");
  await page.waitForTimeout(700);
  console.log("focus after ArrowDown:", await act(page));
  await page.keyboard.press("Enter");
  await page.waitForTimeout(500);
  console.log("dialogs:", await page.locator("dialog[open]").count(), await page.locator("dialog[open]").evaluateAll((d) => d.map((x) => x.textContent?.slice(0, 40))));
});

test("drawer stays and shows live data; focus stays", async ({ page }) => {
  const errs = watch(page);
  await page.goto("/?refresh=500&mode=client");
  await page.waitForTimeout(800);
  await page.getByLabel("Actions: 1007").click();
  await page.getByRole("menuitem", { name: "Details" }).click();
  await page.waitForTimeout(400);
  const f0 = await act(page);
  await page.evaluate(() => { const w = window as any; w.__db()[7].qty = 99; w.__db()[7].status = "PAID"; });
  await page.waitForTimeout(1200);
  console.log("detail:", await page.locator("#detail").innerText(), "focus", f0, "->", await act(page));
  await page.evaluate(() => (window as any).__removeId("1007"));
  await page.waitForTimeout(1200);
  console.log("detail after server delete:", await page.locator("#detail").innerText());
  await page.keyboard.press("Escape");
  await page.waitForTimeout(500);
  console.log("focus after Esc:", await act(page), "dialogs", await page.locator("dialog[open]").count());
  console.log(errs.join("\n"));
});

test("bulk cancel with grouping: group checkbox, refresh, undo", async ({ page }) => {
  const errs = watch(page);
  await page.goto("/?refresh=500&mode=client");
  await page.waitForTimeout(800);
  await page.getByLabel("Select 1003").check();
  await page.getByLabel("Select 1007").check();
  await page.waitForTimeout(1200);
  console.log("still ticked after refreshes:", await page.locator('tr[aria-selected="true"]').count(), await count(page));
  await page.getByRole("button", { name: "Cancel orders" }).first().click();
  await page.waitForTimeout(300);
  console.log("confirm title:", await page.getByRole("dialog", { name: /Cancel \d+ orders/ }).innerText().catch(() => "none"));
  await page.screenshot({ path: "shots/bulk.png" });
  console.log(errs.join("\n"));
});
