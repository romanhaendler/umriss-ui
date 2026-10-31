import { test, expect } from "@playwright/test";
import { row, watch, count } from "./h";
const reqs = (p: any) => p.evaluate(() => (window as any).__log.filter((l: string) => l.startsWith("req")));

test("server mode: page 3 survives refreshes, insert at top shifts rows, selection keys", async ({ page }) => {
  const errs = watch(page);
  await page.goto("/?refresh=500&mode=server");
  await page.waitForTimeout(1200);
  const log0 = await reqs(page);
  console.log("initial requests:", log0);
  await page.getByRole("button", { name: /next page|nächste/i }).first().click();
  await page.getByRole("button", { name: /next page|nächste/i }).first().click();
  await page.waitForTimeout(1200);
  console.log("page text:", await page.getByText(/Page \d+ of/).first().innerText(), "| range:", await page.getByText(/of 40/).first().innerText());
  const ids1 = await page.locator("tr[data-grid-line^='row:']").evaluateAll((r) => r.map((x) => x.getAttribute("data-grid-line")));
  await page.getByLabel(new RegExp("Select " + ids1[0]!.slice(4))).check();
  await page.evaluate(() => (window as any).__insert());
  await page.waitForTimeout(1200);
  const ids2 = await page.locator("tr[data-grid-line^='row:']").evaluateAll((r) => r.map((x) => x.getAttribute("data-grid-line")));
  console.log("ids before", ids1.join(","), "\nids after ", ids2.join(","));
  console.log("count text:", await count(page), "| toolbar:", await page.locator("text=/selected|ausgewählt/").allInnerTexts());
  console.log("requests after:", (await reqs(page)).length, await reqs(page));
  const busy = await page.locator("[aria-busy=true]").count();
  console.log("busy now:", busy);
  console.log(errs.join("\n"));
});

test("server mode: busy/loading flicker during refresh", async ({ page }) => {
  await page.goto("/?refresh=500&mode=server&latency=250");
  await page.waitForTimeout(1500);
  let busy = 0, n = 0;
  for (let i = 0; i < 60; i++) { n++; if (await page.locator("[aria-busy=true]").count()) busy++; await page.waitForTimeout(50); }
  console.log("busy samples", busy, "/", n);
});

test("server mode: search typing while refresh runs", async ({ page }) => {
  const errs = watch(page);
  await page.goto("/?refresh=500&mode=server");
  await page.waitForTimeout(1000);
  const s = page.getByRole("searchbox").first();
  await s.click();
  await s.pressSequentially("Customer 3", { delay: 120 });
  await page.waitForTimeout(1500);
  console.log("search value:", await s.inputValue(), "| count:", await count(page), "| focus:", await page.evaluate(() => document.activeElement?.tagName));
  console.log("reqs", await reqs(page));
  console.log(errs.join("\n"));
});

test("server mode: select all then bulk cancel", async ({ page }) => {
  const errs = watch(page);
  await page.goto("/?refresh=0&mode=server");
  await page.waitForTimeout(1000);
  await page.getByRole("checkbox", { name: /select all|alle/i }).first().check();
  await page.waitForTimeout(300);
  console.log("toolbar:", await page.locator("[role=toolbar], header").first().innerText().catch(() => ""));
  await page.screenshot({ path: "shots/server-selectall.png" });
  const btn = page.getByRole("button", { name: "Cancel orders" }).first();
  await btn.click();
  await page.waitForTimeout(300);
  console.log("confirm:", await page.getByRole("dialog").first().innerText().catch(() => "none"));
  console.log(errs.join("\n"));
});
