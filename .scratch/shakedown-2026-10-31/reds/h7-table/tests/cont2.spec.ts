import { test, expect, go } from "./fx";
const st = (p: any) => p.evaluate(() => { const t = (window as any).__t; const tb = document.querySelector("table"); return `size=${t.pageSize} page=${t.page}/${t.pageCount} rows=${document.querySelectorAll("tbody tr").length} framed=${t.framed} tbl=${Math.round(tb?.getBoundingClientRect().height ?? 0)}`; });
test("hidden pane shown later: fitted page", async ({ page, logs }) => {
  await page.goto("/?s=cont&m=tabhidden"); await page.waitForTimeout(500);
  console.log("hidden:", await st(page));
  await page.locator("#t1").click(); await page.waitForTimeout(700);
  console.log("shown:", await st(page));
  await page.screenshot({ path: "shots/tabhidden-shown.png" });
  console.log(logs);
});
test("modal with pager table", async ({ page, logs }) => {
  await page.goto("/?s=cont&m=modal"); await page.waitForTimeout(300);
  await page.locator("#open").click(); await page.waitForTimeout(800);
  console.log("modal:", await st(page), "active:", await page.evaluate(() => document.activeElement?.tagName + ":" + (document.activeElement as any)?.getAttribute("aria-label")));
  await page.screenshot({ path: "shots/modal-table.png" });
  await page.getByRole("button", { name: /next page/i }).click();
  await page.keyboard.press("Escape"); await page.waitForTimeout(300);
  console.log("after escape modal open?", await page.locator("dialog[open]").count(), "active:", await page.evaluate(() => document.activeElement?.id));
  console.log(logs);
});
test("print", async ({ page, logs }) => {
  await page.goto("/?s=server"); await page.waitForTimeout(300);
  await page.evaluate(() => { const w = window as any; w.__pend.forEach((x: any) => x.resolve(true)); });
  await page.waitForTimeout(300);
  await page.emulateMedia({ media: "print" });
  await page.waitForTimeout(500);
  console.log("print:", await page.evaluate(() => ({ rows: document.querySelectorAll("tbody tr").length, toolbar: !!document.querySelector("[class*=toolbar]") && getComputedStyle(document.querySelector("[class*=toolbar]")!).display })));
  await page.screenshot({ path: "shots/print-server.png" });
  await page.goto("/?s=big"); await page.waitForTimeout(500);
  console.log("print big:", await page.evaluate(() => ({ rows: document.querySelectorAll("tbody tr").length })));
  await page.pdf({ path: "shots/big.pdf" }).catch((e) => console.log("pdf err", e.message));
});
