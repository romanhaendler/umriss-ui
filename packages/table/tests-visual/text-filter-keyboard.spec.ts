/* The text filter popover by keyboard alone: Enter opens it and the focus moves
   in, Tab walks the controls, the arrow keys change the operator, typing sets a
   term, and Enter on "Done" closes it with the focus back on the funnel. Run
   against the example "Filter a text with operators". */

import { test, expect } from "@playwright/test";
import { openExample } from "./navigation";

test.beforeEach(({ colorScheme }, testInfo) => {
  testInfo.skip(colorScheme === "dark", "Behaviour only once (light)");
});

test("the text filter is operated with Tab, arrows and Enter", { tag: "@quick" }, async ({ page }) => {
  await openExample(page, "filter", "text-filter");
  const table = page.locator('[data-example="text-filter"]');
  const funnel = table.getByRole("button", { name: "Filter Name" });
  const panel = page.getByRole("dialog", { name: "Filter Name" });

  await funnel.focus();
  await page.keyboard.press("Enter");
  await expect(panel).toBeVisible();
  await expect(panel.locator(":focus")).toHaveCount(1);

  /* The first term starts as "starts with": ArrowDown makes it "ends with". */
  const operator = panel.getByRole("combobox", { name: "Operator" }).first();
  await operator.focus();
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("Enter");
  await expect(operator).toHaveValue("endsWith");

  await page.keyboard.press("Tab");
  const value = panel.getByRole("textbox", { name: "Value" }).first();
  await expect(value).toBeFocused();
  await page.keyboard.press("ControlOrMeta+A");
  await page.keyboard.type("y");
  /* Name ends with "y" or ends with "g": Supply, Consulting. */
  await expect(table.locator("tbody tr")).toHaveCount(2);

  await panel.getByRole("button", { name: "Done" }).focus();
  await page.keyboard.press("Enter");
  await expect(panel).toBeHidden();
  await expect(funnel).toBeFocused();
});
