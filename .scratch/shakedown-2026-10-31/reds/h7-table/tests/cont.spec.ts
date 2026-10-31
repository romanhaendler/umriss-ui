import { test, expect, go } from "./fx";
const st = (p: any) => p.evaluate(() => { const t = (window as any).__t; const tb = document.querySelector("table"); const r = tb?.closest("[class]")?.parentElement?.getBoundingClientRect(); return `size=${t.pageSize} page=${t.page}/${t.pageCount} rows=${document.querySelectorAll("tbody tr").length} framed=${t.framed} tbl=${Math.round(tb?.getBoundingClientRect().height ?? 0)}`; });

test("hidden pane shown later: fitted page", async ({ page, logs }) => {
  await go(page, "cont", "&m=tabhidden").catch(() => {});
  await page.waitForTimeout(500);
  console.log("hidden:", await st(page));
  await page.locator("#t1").click();
  await page.waitForTimeout(600);
  console.log("shown:", await st(page));
  await page.screenshot({ path: "shots/tabhidden-shown.png" });
  console.log(logs);
});
test("tab hidden after being shown, then shown again", async ({ page, logs }) => {
  await go(page, "cont", "&m=tabfit");
  await page.waitForTimeout(400);
  console.log("visible:", await st(page));
  await page.locator("#t1").click(); await page.waitForTimeout(400);
  console.log("hidden:", await st(page));
  await page.locator("#t0").click(); await page.waitForTimeout(600);
  console.log("back:", await st(page));
  console.log(logs);
});
test("virtual in hidden tab", async ({ page, logs }) => {
  await go(page, "cont", "&m=tab");
  await page.locator("#t1").click(); await page.waitForTimeout(300);
  await page.locator("#t0").click(); await page.waitForTimeout(500);
  console.log("virtual back:", await st(page), logs);
});
test("flex fill with pager, resize parent", async ({ page, logs }) => {
  await go(page, "cont", "&m=flexfill");
  console.log("flexfill:", await st(page));
  await page.setViewportSize({ width: 800, height: 300 });
  await page.waitForTimeout(700);
  console.log("viewport 300 tall:", await st(page));
  await page.screenshot({ path: "shots/flexfill.png" });
  console.log(logs);
});
test("height-less parent, virtual w/o maxHeight (flex)", async ({ page, logs }) => {
  await go(page, "cont", "&m=flex");
  console.log("flex virtual:", await st(page));
  console.log(logs);
});
test("zero-height parent with pager table", async ({ page, logs }) => {
  await go(page, "cont", "&m=zero");
  console.log("zero:", await st(page), logs);
});
