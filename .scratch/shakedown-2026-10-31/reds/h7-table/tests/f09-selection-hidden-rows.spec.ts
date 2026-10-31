import { test, expect, go } from "./fx";
// F9: selection.count / onSelectionChange count keys the table no longer shows, the toolbar and bulk actions do not.
test("F9 hook and toolbar disagree on the selection", async ({ page }) => {
  await go(page, "selch");
  await page.locator("thead").getByRole("checkbox").check();            // "all" = the filtered set: 60 rows
  await page.getByRole("searchbox").fill("Item 3"); await page.waitForTimeout(250);
  const toolbar = (await page.locator("[class*=toolbar]").first().innerText()).replace(/\s+/g, " ");
  const hook = await page.evaluate(() => ({ count: (window as any).__t.selection.count, filtered: (window as any).__t.filtered.length, last: (window as any).__sel.at(-1).length }));
  console.log({ toolbar, hook });
  expect(hook.last, `onSelectionChange says ${hook.last}, the toolbar ${toolbar}`).toBe(hook.filtered);
});
