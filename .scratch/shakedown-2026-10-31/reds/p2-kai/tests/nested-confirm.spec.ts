import { test } from "@playwright/test";
for (const how of ["Escape", "Cancel button", "backdrop", "header cross"]) test("nested confirm closed by " + how, async ({ page }) => {
  await page.goto("/?refresh=0&mode=client&outside=" + (process.env.OUT ?? "") + "");
  await page.waitForTimeout(500);
  await page.getByLabel("Actions: 1007").click();
  await page.getByRole("menuitem", { name: "Edit" }).click();
  await page.getByRole("button", { name: "Delete" }).click();
  await page.waitForTimeout(500);
  if (how === "Escape") await page.keyboard.press("Escape");
  if (how === "Cancel button") await page.getByRole("dialog", { name: /Delete order/ }).getByRole("button", { name: "Cancel", exact: true }).click();
  if (how === "backdrop") await page.mouse.click(3, 3);
  if (how === "header cross") await page.locator("dialog[open] dialog[open] button[aria-label]").first().click();
  await page.waitForTimeout(600);
  console.log(how, "->", await page.evaluate(() => (window as any).__log.filter((l: string) => /Close/.test(l)).join(",")), "| open dialogs:", await page.evaluate(() => [...document.querySelectorAll("dialog[open]")].map((d) => d.getAttribute("aria-labelledby")).length));
});
