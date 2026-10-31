import { test, expect, go } from "./fx";
import fs from "node:fs";
const flush = async (p: any) => { await p.waitForTimeout(450); await p.evaluate(() => { const w = window as any; w.__pend.forEach((x: any) => x.resolve(true)); w.__pend.length = 0; }); await p.waitForTimeout(250); };
test("server export: slow, search changes meanwhile, then failure", async ({ page, logs }) => {
  await go(page, "server");
  await flush(page); await flush(page);
  await page.evaluate(() => { (window as any).__exportDelay = 800; });
  const dl = page.waitForEvent("download", { timeout: 10000 });
  await page.getByRole("button", { name: /Export/ }).click();
  console.log("button text while exporting:", (await page.locator("[class*=toolbar]").first().innerText()).replace(/\s+/g, " "));
  await page.getByRole("searchbox").fill("Item 77");     // user changes the search while the export is prepared
  await flush(page);
  const text = fs.readFileSync((await (await dl).path())!, "utf8");
  const lines = text.trim().split("\r\n");
  console.log("export request search:", await page.evaluate(() => JSON.stringify((window as any).__exportReq.search)), "| lines:", lines.length, "| table search now:", await page.evaluate(() => (window as any).__t.search));
  await page.evaluate(() => { (window as any).__exportDelay = 0; (window as any).__exportFail = "Too many rows (cap 500)"; });
  await page.getByRole("button", { name: /Export/ }).click();
  await page.waitForTimeout(400);
  console.log("failure shown:", (await page.locator("[role=alert]").allInnerTexts()).join("|"), "| dl?");
  await page.screenshot({ path: "shots/server-export-fail.png" });
  console.log(logs);
});
