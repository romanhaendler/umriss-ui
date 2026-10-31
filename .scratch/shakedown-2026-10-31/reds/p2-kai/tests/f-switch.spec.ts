import { test, expect } from "@playwright/test";
import { row, watch, count } from "./h";
const act = (p: any) => p.evaluate(() => { const a = document.activeElement as any; return (a?.tagName ?? "") + "|" + (a?.getAttribute?.("aria-label") ?? a?.textContent?.slice(0, 20) ?? ""); });

test("language switch with cell editor open, grouping folded, selection", async ({ page }) => {
  const errs = watch(page);
  await page.goto("/?refresh=500&mode=client");
  await page.waitForTimeout(800);
  await page.getByLabel("Select 1003").check();
  await page.getByRole("button", { name: /^Fold CANCELLED/ }).click();
  await row(page, "1002").locator("td[data-edit]").dblclick().catch(() => {});
  const ed = page.locator("tr input:not([type=checkbox])").first();
  const editing = await ed.count();
  if (editing) await ed.fill("33");
  await page.locator("input[value=de]").click({ force: true });
  await page.waitForTimeout(900);
  console.log("editing before:", editing, "after switch editor:", await page.locator("tr input:not([type=checkbox])").count(), "val", await page.locator("tr input:not([type=checkbox])").first().inputValue().catch(() => "-"));
  console.log("selected:", await page.locator('tr[aria-selected="true"]').count(), "folded group still:", await page.getByRole("button", { name: /(Fold|Einklappen|Ausklappen|Aufklappen)/ }).evaluateAll((b) => b.map((x) => x.getAttribute("aria-label"))));
  console.log("date sample:", await page.locator("tr[data-grid-line^='row:']").first().innerText());
  await page.screenshot({ path: "shots/de.png" });
  console.log(errs.join("\n"));
});

test("language and dark switch with a modal and confirm open", async ({ page }) => {
  const errs = watch(page);
  await page.goto("/?refresh=500&mode=client");
  await page.waitForTimeout(800);
  await page.getByLabel("Actions: 1007").click();
  await page.getByRole("menuitem", { name: "Edit" }).click();
  await page.getByLabel("Customer").fill("typing");
  // controls behind a modal are inert: Kai's users cannot click them, a keyboard-only switch is impossible.
  await page.evaluate(() => { (document.querySelector('input[role=switch]') as any).click(); });
  await page.waitForTimeout(500);
  console.log("modal after dark toggle:", await page.locator("dialog[open]").count(), "value", await page.getByLabel("Customer").inputValue(), "focus", await act(page));
  console.log(errs.join("\n"));
});

test("german: toolbar/bulk wording, toast, dialogs", async ({ page }) => {
  const errs = watch(page);
  await page.goto("/?refresh=0&mode=client&lang=de");
  await page.waitForTimeout(800);
  await page.getByLabel(/1003/).first().check();
  await page.screenshot({ path: "shots/de-selected.png" });
  await page.getByLabel("Actions: 1007").click().catch(async () => { await page.locator("button[aria-label*='1007']").click(); });
  await page.waitForTimeout(300);
  await page.screenshot({ path: "shots/de-menu.png" });
  console.log("buttons:", await page.locator("button[aria-label]").evaluateAll((b) => b.slice(0, 6).map((x) => x.getAttribute("aria-label"))));
  console.log(errs.join("\n"));
});
