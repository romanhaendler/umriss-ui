import { test, expect } from "@playwright/test";
import { watch } from "./h";
test("a qty column mixing 3 and \"3\" sums silently wrong and warns of nothing", async ({ page }) => {
  const errs = watch(page);
  await page.goto("/?raw=1&refresh=0");
  await page.waitForTimeout(800);
  const truth = await page.evaluate(() => (window as any).__db().reduce((a: number, r: any) => a + Number(r.qty), 0));
  const foot = await page.locator("tfoot").innerText();
  const shown = Number(foot.match(/Sum\s+([\d.,]+)/)![1].replace(/[.,]/g, ""));
  console.log({ truth, shown, warningsAboutQty: errs.filter((e) => /"qty"/.test(e)).length });
  expect(shown, "footer total equals the real total").toBe(truth);
});
