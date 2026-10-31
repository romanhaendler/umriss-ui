import { test, expect } from "@playwright/test";
test("smoke", async ({ page }) => {
  const errs: string[] = [];
  page.on("console", (m) => { if (["error","warning"].includes(m.type())) errs.push(m.type()+": "+m.text()); });
  page.on("pageerror", (e) => errs.push("pageerror: " + e.message));
  for (const mode of ["client","server"]) {
    await page.goto("/?refresh=0&mode="+mode);
    await page.waitForTimeout(800);
    await page.screenshot({ path: `shots/smoke-${mode}.png`, fullPage: true });
  }
  console.log(errs.join("\n"));
});
