import { test, expect, go } from "./fx";
test("selection after the selected rows are removed / re-keyed by a live update", async ({ page, logs }) => {
  await go(page, "live");
  const info = () => page.evaluate(() => { const w = (window as any); return `count=${w.__t.selection.count} cb=${[...document.querySelectorAll("tbody input[type=checkbox]")].filter((c: any) => c.checked).length} toolbar=${(document.querySelector("[class*=toolbar]") as any)?.innerText.replace(/\\s+/g, " ")} log=${JSON.stringify(w.__log.slice(-3))}`; });
  const rows = page.locator("tbody tr").filter({ has: page.getByRole("checkbox") });
  await rows.nth(1).getByRole("checkbox").check(); await rows.nth(2).getByRole("checkbox").check();
  console.log("2 ticked:", await info());
  // remove those rows (live feed drops them)
  await page.evaluate(() => (window as any).__setRows((rs: any[]) => rs.filter((r) => r.id !== "r7" && r.id !== "r11" && r.id !== "r3")));
  await page.waitForTimeout(300);
  console.log("selected rows removed:", await info());
  // re-add: the old selection comes back?
  await page.evaluate(() => (window as any).__setRows((rs: any[]) => rs.concat([{ id: "r3", name: "Item 3 again", dept: "HR", amount: 1, when: null, note: null, qty: 0 }])));
  await page.waitForTimeout(300);
  console.log("r3 re-added as a different row:", await info());
  // whole feed re-keyed
  await page.evaluate(() => (window as any).__setRows((rs: any[]) => rs.map((r) => ({ ...r, id: "k" + r.id }))));
  await page.waitForTimeout(300);
  console.log("all re-keyed:", await info());
  expect(logs).toEqual([]);
});
