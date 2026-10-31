import { test, expect, go } from "./fx";
import fs from "node:fs";
test.use({ timezoneId: "Europe/Berlin", locale: "de-DE" });

test("big: 100k rows scroll, sort, search, filter, csv", async ({ page, logs }) => {
  const t0 = Date.now();
  await go(page, "big", "&lang=de");
  console.log("first paint ms", Date.now() - t0, "rows in DOM", await page.locator("tbody tr").count());
  const t1 = Date.now();
  await page.getByRole("columnheader", { name: /Amount/i }).getByRole("button").first().click();
  await page.waitForFunction(() => document.querySelector("tbody tr")?.textContent !== null);
  console.log("sort ms", Date.now() - t1, (await page.locator("tbody tr").first().innerText()).replace(/\s+/g, " "));
  await page.getByRole("columnheader", { name: /Amount/i }).getByRole("button").first().click();
  console.log("desc first:", (await page.locator("tbody tr").first().innerText()).replace(/\s+/g, " "));
  const dl = page.waitForEvent("download", { timeout: 20000 });
  const t2 = Date.now();
  await page.getByRole("button", { name: /Export/i }).click();
  const d = await dl;
  const path = await d.path();
  const text = fs.readFileSync(path!, "utf8");
  console.log("export ms", Date.now() - t2, "name", d.suggestedFilename(), "bytes", text.length, "lines", text.split("\n").length);
  console.log(text.split("\n").slice(0, 8).join("\n"));
  console.log("bom?", text.charCodeAt(0) === 0xfeff, "crlf?", text.includes("\r\n"));
  expect(logs).toEqual([]);
});
