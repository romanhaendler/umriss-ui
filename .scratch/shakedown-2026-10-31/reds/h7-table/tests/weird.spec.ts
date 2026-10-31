import { test, expect, go } from "./fx";
import fs from "node:fs";
test.use({ timezoneId: "Europe/Berlin" });
test("weird values render and export", async ({ page, logs }) => {
  await go(page, "weird");
  console.log((await page.locator("tbody tr").evaluateAll((trs: any[]) => trs.map((t) => t.innerText.replace(/\s+/g, " ").slice(0, 100)))).join("\n"));
  const dl = page.waitForEvent("download");
  await page.getByRole("button", { name: /Export/i }).click();
  const text = fs.readFileSync((await (await dl).path())!, "utf8");
  console.log(JSON.stringify(text.replace(/x{100,}/, "x…")).replace(/\\r\\n/g, "\n"));
  console.log("footer", (await page.locator("tfoot").innerText().catch(() => "none")).replace(/\s+/g, " "));
  await page.screenshot({ path: "shots/weird.png" });
  console.log(logs);
});
