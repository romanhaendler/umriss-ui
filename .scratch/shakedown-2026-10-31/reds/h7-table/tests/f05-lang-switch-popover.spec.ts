import { test, expect, go } from "./fx";
// F5: switching the provider's language while a filter popover is open: focus is lost and Escape no longer closes it.
test("F5 popover survives a language switch with focus", async ({ page, logs }) => {
  await go(page, "selch");
  await page.getByRole("button", { name: "Filter Name" }).click();
  await page.getByLabel("Value").first().focus();
  const before = await page.evaluate(() => document.activeElement?.tagName + ":" + document.activeElement?.getAttribute("aria-label"));
  await page.evaluate(() => (window as any).__setLang(true));
  await page.waitForTimeout(300);
  const after = await page.evaluate(() => document.activeElement?.tagName + ":" + document.activeElement?.getAttribute("aria-label"));
  console.log("focus before/after:", before, after);
  await page.keyboard.press("Escape");
  await page.waitForTimeout(300);
  console.log("dialogs after Escape:", await page.locator("[role=dialog]").count());
  expect(await page.locator("[role=dialog]").count(), "Escape closes the popover").toBe(0);
});
