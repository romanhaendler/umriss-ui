import { test, expect, go } from "./fx";
import fs from "node:fs";
test("export reflects filter, hidden, order, grouping", async ({ page, logs }) => {
  await go(page, "live");
  await page.evaluate(() => { const t = (window as any).__t; t.setSearch("Item 1"); });
  await page.waitForTimeout(150);
  await page.evaluate(() => { const t = (window as any).__t; t.toggleColumn("amount"); t.setOrder(["when", "dept", "name"]); t.setFilter("dept", ["HR", null]); });
  await page.waitForTimeout(150);
  const dl = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export" }).click();
  const text = fs.readFileSync((await (await dl).path())!, "utf8");
  const lines = text.split("\r\n");
  console.log(lines.slice(0, 4).join("\n"), "\nlines", lines.length, "filtered", await page.evaluate(() => (window as any).__t.filtered.length), "asCsv equals:", text.replace(/^﻿/, "") === (await page.evaluate(() => (window as any).__t.asCsv())));
  console.log("order", await page.evaluate(() => JSON.stringify((window as any).__t.order)));
  console.log(logs);
});
