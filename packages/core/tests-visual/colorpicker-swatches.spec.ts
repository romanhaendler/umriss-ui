/* ColorPicker's swatches keep their own colour in forced colours, and the
   pressed one is marked by an outline, which the mode does not drop. */

import { test, expect } from "@playwright/test";
import { openExample } from "./navigation";

test("the swatches keep their colours under forced colours", { tag: "@quick" }, async ({ page }) => {
  await page.emulateMedia({ forcedColors: "active" });
  await openExample(page, "colorpicker", "from-a-palette");
  await page.locator('[data-example="from-a-palette"]').getByRole("button", { name: /Task category/ }).click();
  const group = page.getByRole("group", { name: "Swatches" });
  await expect(group).toBeVisible();
  const ocean = group.getByRole("button", { name: "Ocean" });
  expect(await ocean.evaluate((el) => getComputedStyle(el).backgroundColor)).toBe("rgb(37, 99, 235)");
  const pressed = group.locator('[aria-pressed="true"]');
  expect(await pressed.evaluate((el) => `${getComputedStyle(el).outlineStyle} ${getComputedStyle(el).outlineWidth}`)).toBe("solid 1px");
});
