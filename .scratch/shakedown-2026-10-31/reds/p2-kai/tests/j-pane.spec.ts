import { test, expect } from "@playwright/test";
import { watch } from "./h";

test("resize the pane under a fitted page on page 3 with refresh", async ({ page }) => {
  const errs = watch(page);
  await page.goto("/?refresh=500&mode=server&pane=1");
  await page.waitForTimeout(1200);
  const snap = async (tag: string) => console.log(tag, JSON.stringify(await page.evaluate(() => { const t = (window as any).__t; return { page: t.page, size: t.pageSize, rows: document.querySelectorAll("tr[data-grid-line^='row:']").length, first: document.querySelector("tr[data-grid-line^='row:']")?.getAttribute("data-grid-line"), n: (window as any).__log.filter((l: string) => l.startsWith("req")).length }; })));
  await snap("start");
  const next = page.getByRole("button", { name: /next page/i }).first();
  await next.click(); await next.click(); await page.waitForTimeout(700);
  await snap("page3");
  const sep = page.getByRole("separator");
  const box = (await sep.boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  for (let i = 1; i <= 10; i++) { await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2 - i * 15); await page.waitForTimeout(60); }
  await snap("mid-drag");
  await page.mouse.up();
  await page.waitForTimeout(1000);
  await snap("after drag up");
  await page.screenshot({ path: "shots/pane.png" });
  console.log(errs.filter((e) => !/groupable|filter of|answers/.test(e)).join("\n"));
});
